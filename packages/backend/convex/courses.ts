import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const listCourses = query({
  args: {
    level: v.optional(
      v.union(
        v.literal('beginner'),
        v.literal('intermediate'),
        v.literal('advanced')
      )
    ),
    category: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    let coursesQuery = ctx.db
      .query('courses')
      .withIndex('by_published', (q) => q.eq('isPublished', true));

    if (args.level) {
      coursesQuery = ctx.db
        .query('courses')
        .withIndex('by_level', (q) => q.eq('level', args.level!));
    }

    const courses = await coursesQuery.collect();

    // Filter by category if specified
    const filteredCourses = args.category
      ? courses.filter((course) => course.category === args.category)
      : courses;

    // Get user progress for each course if user is authenticated
    const userId = await getAuthUserId(ctx);
    if (userId) {
      const coursesWithProgress = await Promise.all(
        filteredCourses.map(async (course) => {
          const progress = await ctx.db
            .query('userProgress')
            .withIndex('by_user_course', (q) =>
              q.eq('userId', userId).eq('courseId', course._id)
            )
            .collect();

          const completedLessons = progress.filter((p) => p.completed).length;
          const progressPercentage =
            course.totalLessons > 0
              ? (completedLessons / course.totalLessons) * 100
              : 0;

          return {
            ...course,
            progressPercentage,
            completedLessons,
          };
        })
      );
      return coursesWithProgress;
    }

    return filteredCourses.map((course) => ({
      ...course,
      progressPercentage: 0,
      completedLessons: 0,
    }));
  },
});

export const getPreviewCourses = query({
  args: {},
  handler: async (ctx) => {
    const previewCourses = await ctx.db
      .query('courses')
      .withIndex('by_preview', (q) => q.eq('isPreview', true))
      .filter((q) => q.eq(q.field('isPublished'), true))
      .collect();

    // Filter to only include courses with exactly one lesson
    const coursesWithOneLesson = await Promise.all(
      previewCourses.map(async (course) => {
        const lessons = await ctx.db
          .query('lessons')
          .withIndex('by_course', (q) => q.eq('courseId', course._id))
          .filter((q) => q.eq(q.field('isPublished'), true))
          .collect();

        return lessons.length === 1 ? { ...course, lesson: lessons[0] } : null;
      })
    );

    return coursesWithOneLesson.filter(Boolean);
  },
});

export const getCourse = query({
  args: { courseId: v.id('courses') },
  handler: async (ctx, args) => {
    const course = await ctx.db.get(args.courseId);
    if (!course || !course.isPublished) {
      return null;
    }

    const lessons = await ctx.db
      .query('lessons')
      .withIndex('by_course', (q) => q.eq('courseId', args.courseId))
      .filter((q) => q.eq(q.field('isPublished'), true))
      .collect();

    const userId = await getAuthUserId(ctx);
    let userProgress: any[] = [];

    if (userId) {
      userProgress = await ctx.db
        .query('userProgress')
        .withIndex('by_user_course', (q) =>
          q.eq('userId', userId).eq('courseId', args.courseId)
        )
        .collect();
    }

    const lessonsWithProgress = lessons.map((lesson) => {
      const progress = userProgress.find((p) => p.lessonId === lesson._id);
      return {
        ...lesson,
        completed: progress?.completed || false,
        score: progress?.score,
      };
    });

    const completedLessons = lessonsWithProgress.filter(
      (l) => l.completed
    ).length;
    const progressPercentage =
      lessons.length > 0 ? (completedLessons / lessons.length) * 100 : 0;

    return {
      ...course,
      lessons: lessonsWithProgress,
      progressPercentage,
      completedLessons,
    };
  },
});

export const getLesson = query({
  args: { lessonId: v.id('lessons') },
  handler: async (ctx, args) => {
    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson || !lesson.isPublished) {
      return null;
    }

    const course = await ctx.db.get(lesson.courseId);
    if (!course || !course.isPublished) {
      return null;
    }

    let quiz = null;
    if (lesson.type === 'quiz') {
      quiz = await ctx.db
        .query('quizzes')
        .withIndex('by_lesson', (q) => q.eq('lessonId', args.lessonId))
        .first();
    }

    const userId = await getAuthUserId(ctx);
    let userProgress = null;

    if (userId) {
      userProgress = await ctx.db
        .query('userProgress')
        .withIndex('by_user_course', (q) =>
          q.eq('userId', userId).eq('courseId', lesson.courseId)
        )
        .filter((q) => q.eq(q.field('lessonId'), args.lessonId))
        .first();
    }

    return {
      ...lesson,
      course: { title: course.title, _id: course._id },
      quiz,
      completed: userProgress?.completed || false,
      score: userProgress?.score,
    };
  },
});

export const getMyCourses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const courses = await ctx.db
      .query('courses')
      .withIndex('by_created_by', (q) => q.eq('createdBy', userId))
      .order('desc')
      .collect();

    return courses;
  },
});

export const getCompletedCourses = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    // Get all user progress records
    const userProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();

    // Group by course and check completion
    const courseProgress = new Map();
    for (const progress of userProgress) {
      if (!courseProgress.has(progress.courseId)) {
        courseProgress.set(progress.courseId, {
          courseId: progress.courseId,
          completedLessons: 0,
          totalLessons: 0,
          isCompleted: false,
        });
      }
      const courseData = courseProgress.get(progress.courseId);
      if (progress.completed) {
        courseData.completedLessons++;
      }
    }

    // Get course details and check completion
    const completedCourses = [];
    for (const [courseId, progress] of courseProgress) {
      const course = await ctx.db.get(courseId);
      if (course && 'totalLessons' in course) {
        progress.totalLessons = course.totalLessons;
        progress.isCompleted =
          progress.completedLessons === course.totalLessons;
        progress.courseTitle = course.title;

        if (progress.isCompleted) {
          completedCourses.push(progress);
        }
      }
    }

    return completedCourses;
  },
});

export const completeLesson = mutation({
  args: {
    lessonId: v.id('lessons'),
    score: v.optional(v.number()),
    timeSpent: v.number(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const lesson = await ctx.db.get(args.lessonId);
    if (!lesson) {
      throw new Error('Lesson not found');
    }

    // Check if progress already exists
    const existingProgress = await ctx.db
      .query('userProgress')
      .withIndex('by_user_course', (q) =>
        q.eq('userId', userId).eq('courseId', lesson.courseId)
      )
      .filter((q) => q.eq(q.field('lessonId'), args.lessonId))
      .first();

    const now = Date.now();
    const progressData = {
      userId,
      courseId: lesson.courseId,
      lessonId: args.lessonId,
      completed: true,
      score: args.score,
      timeSpent: args.timeSpent,
      completedAt: now,
    };

    if (existingProgress) {
      await ctx.db.patch(existingProgress._id, progressData);
    } else {
      await ctx.db.insert('userProgress', progressData);
    }

    // Update user stats
    await updateUserStats(ctx, userId, args.timeSpent);

    // Check for achievements
    await checkAchievements(ctx, userId, lesson.courseId);

    return { success: true };
  },
});

export const createLesson = mutation({
  args: {
    courseId: v.id('courses'),
    title: v.string(),
    content: v.string(),
    duration: v.number(),
    order: v.number(),
    type: v.union(v.literal('text'), v.literal('video'), v.literal('quiz')),
    videoUrl: v.optional(v.string()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const lessonId = await ctx.db.insert('lessons', {
      ...args,
      isPublished: args.isPublished ?? true,
    });

    return { lessonId };
  },
});

export const createCourse = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced')
    ),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    estimatedDuration: v.number(),
    totalLessons: v.number(),
    isPreview: v.boolean(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const courseId = await ctx.db.insert('courses', {
      ...args,
      isPublished: true,
      createdBy: userId,
    });

    return { courseId };
  },
});

export const updateCourse = mutation({
  args: {
    courseId: v.id('courses'),
    title: v.optional(v.string()),
    description: v.optional(v.string()),
    level: v.optional(
      v.union(
        v.literal('beginner'),
        v.literal('intermediate'),
        v.literal('advanced')
      )
    ),
    category: v.optional(v.string()),
    imageUrl: v.optional(v.string()),
    estimatedDuration: v.optional(v.number()),
    totalLessons: v.optional(v.number()),
    isPreview: v.optional(v.boolean()),
    isPublished: v.optional(v.boolean()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    const { courseId, ...updates } = args;
    const course = await ctx.db.get(courseId);

    if (!course || course.createdBy !== userId) {
      throw new Error('Course not found or unauthorized');
    }

    await ctx.db.patch(courseId, updates);
    return { success: true };
  },
});

async function updateUserStats(ctx: any, userId: string, timeSpent: number) {
  let userStats = await ctx.db
    .query('userStats')
    .withIndex('by_user', (q: any) => q.eq('userId', userId))
    .first();

  const today = new Date().toISOString().split('T')[0];
  const points = Math.floor(timeSpent * 2); // 2 points per minute

  if (!userStats) {
    userStats = {
      userId,
      totalPoints: points,
      currentStreak: 1,
      longestStreak: 1,
      lastActivityDate: today,
      coursesCompleted: 0,
      lessonsCompleted: 1,
      totalTimeSpent: timeSpent,
      level: 1,
    };
    await ctx.db.insert('userStats', userStats);
  } else {
    const wasYesterday = new Date(userStats.lastActivityDate);
    wasYesterday.setDate(wasYesterday.getDate() + 1);
    const isConsecutive = wasYesterday.toISOString().split('T')[0] === today;

    const newStreak =
      userStats.lastActivityDate === today
        ? userStats.currentStreak
        : isConsecutive
          ? userStats.currentStreak + 1
          : 1;

    const newLevel = Math.floor((userStats.totalPoints + points) / 1000) + 1;

    await ctx.db.patch(userStats._id, {
      totalPoints: userStats.totalPoints + points,
      currentStreak: newStreak,
      longestStreak: Math.max(userStats.longestStreak, newStreak),
      lastActivityDate: today,
      lessonsCompleted: userStats.lessonsCompleted + 1,
      totalTimeSpent: userStats.totalTimeSpent + timeSpent,
      level: newLevel,
    });
  }
}

async function checkAchievements(ctx: any, userId: string, courseId: string) {
  // Check if course is completed
  const course = await ctx.db.get(courseId);
  if (!course) return;

  const userProgress = await ctx.db
    .query('userProgress')
    .withIndex('by_user_course', (q: any) =>
      q.eq('userId', userId).eq('courseId', courseId)
    )
    .collect();

  const completedLessons = userProgress.filter((p: any) => p.completed).length;

  if (completedLessons === course.totalLessons) {
    // Award course completion achievement
    const existingAchievement = await ctx.db
      .query('achievements')
      .withIndex('by_user', (q: any) => q.eq('userId', userId))
      .filter((q: any) =>
        q.and(
          q.eq(q.field('type'), 'course_completed'),
          q.eq(q.field('metadata.courseId'), courseId)
        )
      )
      .first();

    if (!existingAchievement) {
      await ctx.db.insert('achievements', {
        userId,
        type: 'course_completed',
        title: 'Course Master',
        description: `Completed "${course.title}"`,
        iconUrl: '🎓',
        earnedAt: Date.now(),
        metadata: { courseId },
      });

      // Update courses completed count
      const userStats = await ctx.db
        .query('userStats')
        .withIndex('by_user', (q: any) => q.eq('userId', userId))
        .first();

      if (userStats) {
        await ctx.db.patch(userStats._id, {
          coursesCompleted: userStats.coursesCompleted + 1,
        });
      }
    }
  }
}
