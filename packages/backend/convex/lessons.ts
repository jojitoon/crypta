import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const getLesson = query({
  args: { lessonId: v.id('lessons') },
  returns: v.union(
    v.object({
      _id: v.id('lessons'),
      courseId: v.id('courses'),
      title: v.string(),
      content: v.string(),
      videoUrl: v.optional(v.string()),
      muxAssetId: v.optional(v.string()),
      muxPlaybackId: v.optional(v.string()),
      muxUploadId: v.optional(v.string()),
      videoDuration: v.optional(v.number()),
      videoStatus: v.optional(v.string()),
      duration: v.number(),
      order: v.number(),
      type: v.union(v.literal('video'), v.literal('text'), v.literal('quiz')),
      isPublished: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      return null;
    }

    return lesson;
  },
});

export const getLessonByMuxAsset = query({
  args: { assetId: v.string() },
  returns: v.union(
    v.object({
      _id: v.id('lessons'),
      courseId: v.id('courses'),
      title: v.string(),
      content: v.string(),
      videoUrl: v.optional(v.string()),
      muxAssetId: v.optional(v.string()),
      muxPlaybackId: v.optional(v.string()),
      muxUploadId: v.optional(v.string()),
      videoDuration: v.optional(v.number()),
      videoStatus: v.optional(v.string()),
      duration: v.number(),
      order: v.number(),
      type: v.union(v.literal('video'), v.literal('text'), v.literal('quiz')),
      isPublished: v.boolean(),
    }),
    v.null()
  ),
  handler: async (ctx, args) => {
    const lesson = await ctx.db
      .query('lessons')
      .filter((q) => q.eq(q.field('muxAssetId'), args.assetId))
      .first();

    return lesson;
  },
});

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
