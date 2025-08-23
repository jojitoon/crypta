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
      .withIndex('by_user_course', (q) => q.eq('courseId', args.courseId))
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
