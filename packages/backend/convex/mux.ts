import { action, query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { api, internal } from './_generated/api';

// Update lesson video status
export const updateLessonVideoStatus = mutation({
  args: {
    lessonId: v.id('lessons'),
    muxUploadId: v.optional(v.string()),
    videoStatus: v.union(
      v.literal('uploading'),
      v.literal('processing'),
      v.literal('ready'),
      v.literal('failed')
    ),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Verify the lesson belongs to the user
    const course = await ctx.db.get(lesson.courseId);
    if (!course || course.createdBy !== userId) {
      throw new Error('Unauthorized to modify this lesson');
    }

    const updates: any = { videoStatus: args.videoStatus };
    if (args.muxUploadId) {
      updates.muxUploadId = args.muxUploadId;
    }

    await ctx.db.patch(args.lessonId, updates);
    return { success: true };
  },
});

// Update lesson video asset details
export const updateLessonVideoAsset = mutation({
  args: {
    lessonId: v.id('lessons'),
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    videoStatus: v.union(
      v.literal('uploading'),
      v.literal('processing'),
      v.literal('ready'),
      v.literal('failed')
    ),
    videoDuration: v.optional(v.number()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Verify the lesson belongs to the user
    const course = await ctx.db.get(lesson.courseId);
    if (!course || course.createdBy !== userId) {
      throw new Error('Unauthorized to modify this lesson');
    }

    const updates: any = { videoStatus: args.videoStatus };
    if (args.muxAssetId) {
      updates.muxAssetId = args.muxAssetId;
    }
    if (args.muxPlaybackId) {
      updates.muxPlaybackId = args.muxPlaybackId;
    }
    if (args.videoDuration !== undefined) {
      updates.videoDuration = args.videoDuration;
    }

    await ctx.db.patch(args.lessonId, updates);
    return { success: true };
  },
});

// Create a new Mux upload URL
export const createUploadUrl = action({
  args: {
    fileName: v.string(),
    lessonId: v.id('lessons'),
  },
  returns: v.object({
    uploadUrl: v.string(),
    uploadId: v.string(),
  }),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    // Verify the lesson belongs to the user
    const lesson = await ctx.runQuery(api.mux.getLesson, {
      lessonId: args.lessonId,
    });
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const course = await ctx.runQuery(api.mux.getCourse, {
      courseId: lesson.courseId,
    });
    if (!course || course.createdBy !== userId) {
      throw new Error('Unauthorized to modify this lesson');
    }

    try {
      // Call internal action to create Mux upload
      const result: any = await ctx.runAction(
        internal.muxActions._internalCreateMuxUpload,
        { fileName: args.fileName }
      );
      const { uploadUrl, uploadId } = result;

      // Update lesson with upload ID and status
      await ctx.runMutation(api.mux.updateLessonVideoStatus, {
        lessonId: args.lessonId,
        muxUploadId: uploadId,
        videoStatus: 'uploading',
      });

      return {
        uploadUrl,
        uploadId,
      };
    } catch (error) {
      console.error('Error creating Mux upload:', error);
      throw new Error('Failed to create upload URL');
    }
  },
});

// Get Mux asset details and update lesson
// @ts-ignore
export const getMuxAsset = action({
  args: {
    uploadId: v.string(),
    lessonId: v.id('lessons'),
  },
  returns: v.object({
    success: v.boolean(),
    assetId: v.optional(v.string()),
    playbackId: v.optional(v.string()),
    status: v.optional(v.string()),
  }),
  // @ts-ignore
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    // Verify the lesson belongs to the user
    const lesson = await ctx.runQuery(api.mux.getLesson, {
      lessonId: args.lessonId,
    });
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    const course = await ctx.runQuery(api.mux.getCourse, {
      courseId: lesson.courseId,
    });
    if (!course || course.createdBy !== userId) {
      throw new Error('Unauthorized to modify this lesson');
    }

    try {
      // Call internal action to get Mux asset details
      // @ts-ignore
      const result = await ctx.runAction(
        internal.muxActions._internalGetMuxAsset,
        {
          uploadId: args.uploadId,
        }
      );

      if (result.assetId) {
        // Update lesson with asset details
        await ctx.runMutation(api.mux.updateLessonVideoAsset, {
          lessonId: args.lessonId,
          muxAssetId: result.assetId,
          muxPlaybackId: result.playbackId,
          videoStatus: result.status === 'ready' ? 'ready' : 'processing',
          videoDuration: result.duration,
        });

        return {
          success: true,
          assetId: result.assetId,
          playbackId: result.playbackId,
          status: result.status,
        };
      } else {
        // Update lesson status to processing
        await ctx.runMutation(api.mux.updateLessonVideoStatus, {
          lessonId: args.lessonId,
          videoStatus: 'processing',
        });

        return {
          success: true,
          status: 'processing',
        };
      }
    } catch (error) {
      console.error('Error getting Mux asset:', error);

      // Update lesson status to failed
      await ctx.runMutation(api.mux.updateLessonVideoStatus, {
        lessonId: args.lessonId,
        videoStatus: 'failed',
      });

      return {
        success: false,
        status: 'failed',
      };
    }
  },
});

// Get Mux playback URL for a lesson
export const getMuxPlaybackUrl = query({
  args: {
    lessonId: v.id('lessons'),
  },
  returns: v.union(
    v.object({
      playbackUrl: v.string(),
      status: v.string(),
      duration: v.number(),
      thumbnailUrl: v.string(),
      playbackId: v.string(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson || !lesson.muxPlaybackId) {
      return null;
    }

    // Check if user has access to this lesson
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const course = await ctx.db.get(lesson.courseId);
    if (!course) {
      return null;
    }

    // For now, allow access to all published lessons
    // You can add more sophisticated access control here
    if (!course.isPublished || !lesson.isPublished) {
      return null;
    }

    return {
      playbackUrl: `https://stream.mux.com/${lesson.muxPlaybackId}.m3u8`,
      status: lesson.videoStatus || 'ready',
      duration: lesson.videoDuration || 0,
      thumbnailUrl: `https://image.mux.com/${lesson.muxPlaybackId}/thumbnail.png`,
      playbackId: lesson.muxPlaybackId,
    };
  },
});

// Webhook handler for Mux upload completion
export const handleMuxWebhook = action({
  args: {
    type: v.string(),
    data: v.any(),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    if (args.type === 'video.asset.ready') {
      const { id: assetId, playback_ids, duration } = args.data;

      // Find lesson with this asset ID
      const lesson = await ctx.runQuery(api.mux.getLessonByMuxAsset, {
        assetId,
      });

      if (lesson) {
        // Update lesson with playback ID and mark as ready
        await ctx.runMutation(api.mux.updateLessonVideoAsset, {
          lessonId: lesson._id,
          muxPlaybackId: playback_ids?.[0]?.id,
          videoStatus: 'ready',
          videoDuration: duration,
        });
      }
    }

    return { success: true };
  },
});

// Helper queries for internal use
export const getLesson = query({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.lessonId);
  },
});

export const getCourse = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    return await ctx.db.get(args.courseId);
  },
});

export const getLessonByMuxAsset = query({
  args: { assetId: v.string() },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('lessons')
      .filter((q) => q.eq(q.field('muxAssetId'), args.assetId))
      .first();
  },
});
