import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

// Helper function to check if user is admin
async function checkAdminAccess(ctx: any) {
  const userId = await getAuthUserId(ctx);
  if (!userId) {
    throw new Error('Must be authenticated');
  }

  const user = await ctx.db.get(userId);
  if (!user || !user.isAdmin) {
    throw new Error('Admin access required');
  }

  return userId;
}

// Get all users for admin management
export const getAllUsers = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const users = await ctx.db.query('users').collect();

    // Get stats for each user
    const usersWithStats = await Promise.all(
      users.map(async (user) => {
        const stats = await ctx.db
          .query('userStats')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .first();

        const achievements = await ctx.db
          .query('achievements')
          .withIndex('by_user', (q) => q.eq('userId', user._id))
          .collect();

        const coursesCreated = await ctx.db
          .query('courses')
          .withIndex('by_created_by', (q) => q.eq('createdBy', user._id))
          .collect();

        return {
          ...user,
          stats: stats || null,
          achievementsCount: achievements.length,
          coursesCreatedCount: coursesCreated.length,
        };
      })
    );

    return usersWithStats;
  },
});

// Get all courses for admin management
export const getAllCourses = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const courses = await ctx.db.query('courses').collect();

    // Get additional data for each course
    const coursesWithDetails = await Promise.all(
      courses.map(async (course) => {
        const creator = await ctx.db.get(course.createdBy);
        const lessons = await ctx.db
          .query('lessons')
          .withIndex('by_course', (q) => q.eq('courseId', course._id))
          .collect();

        const totalEnrollments = await ctx.db
          .query('userProgress')
          .withIndex('by_user_course', (q) => q.eq('userId', course.createdBy))
          .collect();

        const completedEnrollments = totalEnrollments.filter(
          (p) => p.completed
        );

        return {
          ...course,
          creator: creator
            ? { name: creator.name, email: creator.email }
            : null,
          lessonsCount: lessons.length,
          totalEnrollments: totalEnrollments.length,
          completedEnrollments: completedEnrollments.length,
        };
      })
    );

    return coursesWithDetails;
  },
});

// Update user admin status
export const updateUserAdminStatus = mutation({
  args: {
    userId: v.id('users'),
    isAdmin: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(args.userId, { isAdmin: args.isAdmin });
    return { success: true };
  },
});

// Delete user (admin only)
export const deleteUser = mutation({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Delete all related data
    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const userStats = await ctx.db
      .query('userStats')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const achievements = await ctx.db
      .query('achievements')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const coursesCreated = await ctx.db
      .query('courses')
      .withIndex('by_created_by', (q) => q.eq('createdBy', args.userId))
      .collect();

    // Delete user progress
    for (const progress of userProgress) {
      await ctx.db.delete(progress._id);
    }

    // Delete user stats
    if (userStats) {
      await ctx.db.delete(userStats._id);
    }

    // Delete achievements
    for (const achievement of achievements) {
      await ctx.db.delete(achievement._id);
    }

    // Delete courses created by user
    for (const course of coursesCreated) {
      const lessons = await ctx.db
        .query('lessons')
        .withIndex('by_course', (q) => q.eq('courseId', course._id))
        .collect();

      // Delete lessons
      for (const lesson of lessons) {
        const quizzes = await ctx.db
          .query('quizzes')
          .withIndex('by_lesson', (q) => q.eq('lessonId', lesson._id))
          .collect();

        // Delete quizzes
        for (const quiz of quizzes) {
          await ctx.db.delete(quiz._id);
        }

        await ctx.db.delete(lesson._id);
      }

      await ctx.db.delete(course._id);
    }

    // Finally delete the user
    await ctx.db.delete(args.userId);

    return { success: true };
  },
});

// Update course status (publish/unpublish)
export const updateCourseStatus = mutation({
  args: {
    courseId: v.id('courses'),
    isPublished: v.boolean(),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    await ctx.db.patch(args.courseId, { isPublished: args.isPublished });
    return { success: true };
  },
});

// Delete course (admin only)
export const deleteCourse = mutation({
  args: {
    courseId: v.id('courses'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const course = await ctx.db.get(args.courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    // Delete all related data
    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
      .collect();

    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user_course', (q) => q.eq('userId', course.createdBy))
      .collect();

    // Delete user progress
    for (const progress of userProgress) {
      await ctx.db.delete(progress._id);
    }

    // Delete lessons and their quizzes
    for (const lesson of lessons) {
      const quizzes = await ctx.db
        .query('quizzes')
        .withIndex('by_lesson', (q) => q.eq('lessonId', lesson._id))
        .collect();

      // Delete quizzes
      for (const quiz of quizzes) {
        await ctx.db.delete(quiz._id);
      }

      await ctx.db.delete(lesson._id);
    }

    // Finally delete the course
    await ctx.db.delete(args.courseId);

    return { success: true };
  },
});

// Get admin dashboard stats
export const getAdminStats = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const users = await ctx.db.query('users').collect();
    const courses = await ctx.db.query('courses').collect();
    const lessons = await ctx.db.query('lessons').collect();
    const userProgress = await ctx.db.query('userProgress').collect();
    const achievements = await ctx.db.query('achievements').collect();

    const totalUsers = users.length;
    const totalCourses = courses.length;
    const totalLessons = lessons.length;
    const totalEnrollments = userProgress.length;
    const totalAchievements = achievements.length;

    const publishedCourses = courses.filter((c) => c.isPublished).length;
    const adminUsers = users.filter((u) => u.isAdmin).length;
    const completedCourses = userProgress.filter((p) => p.completed).length;

    // Get recent activity (last 7 days)
    const sevenDaysAgo = Date.now() - 7 * 24 * 60 * 60 * 1000;
    const recentProgress = userProgress.filter(
      (p) => p.completedAt && p.completedAt > sevenDaysAgo
    );
    const recentAchievements = achievements.filter(
      (a) => a.earnedAt > sevenDaysAgo
    );

    return {
      totalUsers,
      totalCourses,
      totalLessons,
      totalEnrollments,
      totalAchievements,
      publishedCourses,
      adminUsers,
      completedCourses,
      recentActivity: {
        progress: recentProgress.length,
        achievements: recentAchievements.length,
      },
    };
  },
});

// Make first user admin (for initial setup)
export const makeFirstUserAdmin = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if this is the first user (no other users exist)
    const allUsers = await ctx.db.query('users').collect();
    if (allUsers.length === 1) {
      await ctx.db.patch(userId, { isAdmin: true });
      return { success: true, message: 'First user made admin' };
    }

    throw new Error('This function can only be used by the first user');
  },
});

// Community Management
export const getAllCommunityIdeas = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const ideas = await ctx.db.query('communityIdeas').collect();

    const ideasWithAuthors = await Promise.all(
      ideas.map(async (idea) => {
        const author = await ctx.db.get(idea.userId);
        return {
          ...idea,
          authorName: author?.name || author?.email || 'Unknown',
        };
      })
    );

    return ideasWithAuthors;
  },
});

export const getAllForumThreads = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const threads = await ctx.db.query('forumThreads').collect();

    const threadsWithDetails = await Promise.all(
      threads.map(async (thread) => {
        const author = await ctx.db.get(thread.createdBy);
        const posts = await ctx.db
          .query('forumPosts')
          .withIndex('by_thread', (q) => q.eq('threadId', thread._id))
          .collect();

        return {
          ...thread,
          authorName: author?.name || author?.email || 'Unknown',
          postsCount: posts.length,
        };
      })
    );

    return threadsWithDetails;
  },
});

export const getAllForumPosts = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const posts = await ctx.db.query('forumPosts').collect();

    const postsWithDetails = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.createdBy);
        const thread = await ctx.db.get(post.threadId);

        return {
          ...post,
          authorName: author?.name || author?.email || 'Unknown',
          threadTitle: thread?.title || 'Unknown Thread',
        };
      })
    );

    return postsWithDetails;
  },
});

// Credentials Management
export const getAllCredentials = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const credentials = await ctx.db.query('credentials').collect();

    const credentialsWithDetails = await Promise.all(
      credentials.map(async (credential) => {
        const user = await ctx.db.get(credential.userId);
        const course = await ctx.db.get(credential.courseId);

        return {
          ...credential,
          userName: user?.name || 'Unknown',
          userEmail: user?.email || 'Unknown',
          courseTitle: course?.title || 'Unknown Course',
        };
      })
    );

    return credentialsWithDetails;
  },
});

// Content Management
export const getAllWebinars = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const webinars = await ctx.db.query('webinars').collect();

    const webinarsWithDetails = await Promise.all(
      webinars.map(async (webinar) => {
        const host = await ctx.db.get(webinar.hostUserId);

        return {
          ...webinar,
          hostName: host?.name || host?.email || 'Unknown',
        };
      })
    );

    return webinarsWithDetails;
  },
});

export const getAllShorts = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const shorts = await ctx.db.query('shorts').collect();

    const shortsWithDetails = await Promise.all(
      shorts.map(async (short) => {
        const creator = await ctx.db.get(short.createdBy);

        return {
          ...short,
          creatorName: creator?.name || creator?.email || 'Unknown',
        };
      })
    );

    return shortsWithDetails;
  },
});

export const getAllEvents = query({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const events = await ctx.db.query('events').collect();

    return events;
  },
});

// Mutations for Community Management
export const updateCommunityIdeaStatus = mutation({
  args: {
    ideaId: v.id('communityIdeas'),
    status: v.union(
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected')
    ),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    await ctx.db.patch(args.ideaId, { status: args.status });
    return { success: true };
  },
});

export const deleteCommunityIdea = mutation({
  args: {
    ideaId: v.id('communityIdeas'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) {
      throw new Error('Idea not found');
    }

    await ctx.db.delete(args.ideaId);
    return { success: true };
  },
});

export const deleteForumThread = mutation({
  args: {
    threadId: v.id('forumThreads'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const thread = await ctx.db.get(args.threadId);
    if (!thread) {
      throw new Error('Thread not found');
    }

    // Delete all posts in the thread
    const posts = await ctx.db
      .query('forumPosts')
      .withIndex('by_thread', (q) => q.eq('threadId', args.threadId))
      .collect();

    for (const post of posts) {
      await ctx.db.delete(post._id);
    }

    await ctx.db.delete(args.threadId);
    return { success: true };
  },
});

export const deleteForumPost = mutation({
  args: {
    postId: v.id('forumPosts'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const post = await ctx.db.get(args.postId);
    if (!post) {
      throw new Error('Post not found');
    }

    await ctx.db.delete(args.postId);
    return { success: true };
  },
});

// Mutations for Credentials Management
export const updateCredentialStatus = mutation({
  args: {
    credentialId: v.id('credentials'),
    status: v.union(
      v.literal('pending'),
      v.literal('issued'),
      v.literal('failed')
    ),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const credential = await ctx.db.get(args.credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    await ctx.db.patch(args.credentialId, {
      status: args.status,
      issuedAt: args.status === 'issued' ? Date.now() : credential.issuedAt,
    });
    return { success: true };
  },
});

export const deleteCredential = mutation({
  args: {
    credentialId: v.id('credentials'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const credential = await ctx.db.get(args.credentialId);
    if (!credential) {
      throw new Error('Credential not found');
    }

    await ctx.db.delete(args.credentialId);
    return { success: true };
  },
});

// Mutations for Content Management
export const deleteWebinar = mutation({
  args: {
    webinarId: v.id('webinars'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const webinar = await ctx.db.get(args.webinarId);
    if (!webinar) {
      throw new Error('Webinar not found');
    }

    await ctx.db.delete(args.webinarId);
    return { success: true };
  },
});

export const deleteShort = mutation({
  args: {
    shortId: v.id('shorts'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const short = await ctx.db.get(args.shortId);
    if (!short) {
      throw new Error('Short not found');
    }

    await ctx.db.delete(args.shortId);
    return { success: true };
  },
});

export const deleteEvent = mutation({
  args: {
    eventId: v.id('events'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const event = await ctx.db.get(args.eventId);
    if (!event) {
      throw new Error('Event not found');
    }

    await ctx.db.delete(args.eventId);
    return { success: true };
  },
});

// Update user profile (admin function)
export const updateUserProfileAdmin = mutation({
  args: {
    userId: v.id('users'),
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    bio: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
      })
    ),
    isAdmin: v.optional(v.boolean()),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const { userId, ...updates } = args;
    const user = await ctx.db.get(userId);
    if (!user) {
      throw new Error('User not found');
    }

    await ctx.db.patch(userId, updates);
    return { success: true };
  },
});

// Get user profile for admin editing
export const getUserProfileForAdmin = query({
  args: {
    userId: v.id('users'),
  },
  handler: async (ctx, args) => {
    await checkAdminAccess(ctx);

    const user = await ctx.db.get(args.userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Get additional user data
    const stats = await ctx.db
      .query('userStats')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .first();

    const achievements = await ctx.db
      .query('achievements')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    const coursesCreated = await ctx.db
      .query('courses')
      .withIndex('by_created_by', (q) => q.eq('createdBy', args.userId))
      .collect();

    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', args.userId))
      .collect();

    return {
      ...user,
      stats: stats || null,
      achievementsCount: achievements.length,
      coursesCreatedCount: coursesCreated.length,
      lessonsCompleted: userProgress.filter((p) => p.completed).length,
    };
  },
});

// Migration function to update existing users with new profile fields
export const migrateUserProfiles = mutation({
  args: {},
  handler: async (ctx) => {
    await checkAdminAccess(ctx);

    const users = await ctx.db.query('users').collect();
    let updatedCount = 0;

    for (const user of users) {
      const updates: any = {};

      // Only update if fields don't exist
      if (user.bio === undefined) updates.bio = '';
      if (user.location === undefined) updates.location = '';
      if (user.website === undefined) updates.website = '';
      if (user.avatarUrl === undefined) updates.avatarUrl = '';
      if (user.socialLinks === undefined)
        updates.socialLinks = { twitter: '', linkedin: '', github: '' };
      if (user.isActive === undefined) updates.isActive = true;
      if (user.notes === undefined) updates.notes = '';

      if (Object.keys(updates).length > 0) {
        await ctx.db.patch(user._id, updates);
        updatedCount++;
      }
    }

    return { success: true, updatedCount };
  },
});
