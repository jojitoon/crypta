import { defineSchema, defineTable } from 'convex/server';
import { v } from 'convex/values';
import { authTables } from '@convex-dev/auth/server';

const applicationTables = {
  courses: defineTable({
    title: v.string(),
    description: v.string(),
    level: v.union(
      v.literal('beginner'),
      v.literal('intermediate'),
      v.literal('advanced')
    ),
    category: v.string(),
    imageUrl: v.optional(v.string()),
    estimatedDuration: v.number(), // in minutes
    totalLessons: v.number(),
    isPublished: v.boolean(),
    isPreview: v.optional(v.boolean()), // Free preview course
    createdBy: v.id('users'),
  })
    .index('by_level', ['level'])
    .index('by_category', ['category'])
    .index('by_published', ['isPublished'])
    .index('by_preview', ['isPreview'])
    .index('by_created_by', ['createdBy']),

  lessons: defineTable({
    courseId: v.id('courses'),
    title: v.string(),
    content: v.string(),
    videoUrl: v.optional(v.string()),
    duration: v.number(), // in minutes
    order: v.number(),
    type: v.union(v.literal('video'), v.literal('text'), v.literal('quiz')),
    isPublished: v.boolean(),
  }).index('by_course', ['courseId', 'order']),

  quizzes: defineTable({
    lessonId: v.id('lessons'),
    questions: v.array(
      v.object({
        question: v.string(),
        options: v.array(v.string()),
        correctAnswer: v.number(),
        explanation: v.string(),
      })
    ),
    passingScore: v.number(),
  }).index('by_lesson', ['lessonId']),

  userProgress: defineTable({
    userId: v.id('users'),
    courseId: v.id('courses'),
    lessonId: v.optional(v.id('lessons')),
    completed: v.boolean(),
    score: v.optional(v.number()),
    timeSpent: v.number(), // in minutes
    completedAt: v.optional(v.number()),
  })
    .index('by_user_course', ['userId', 'courseId'])
    .index('by_user', ['userId']),

  achievements: defineTable({
    userId: v.id('users'),
    type: v.union(
      v.literal('course_completed'),
      v.literal('streak_milestone'),
      v.literal('quiz_master'),
      v.literal('early_adopter'),
      v.literal('knowledge_seeker')
    ),
    title: v.string(),
    description: v.string(),
    iconUrl: v.string(),
    earnedAt: v.number(),
    metadata: v.optional(
      v.object({
        courseId: v.optional(v.id('courses')),
        streakDays: v.optional(v.number()),
        score: v.optional(v.number()),
      })
    ),
  })
    .index('by_user', ['userId'])
    .index('by_type', ['type']),

  userStats: defineTable({
    userId: v.id('users'),
    totalPoints: v.number(),
    currentStreak: v.number(),
    longestStreak: v.number(),
    lastActivityDate: v.string(), // YYYY-MM-DD format
    coursesCompleted: v.number(),
    lessonsCompleted: v.number(),
    totalTimeSpent: v.number(), // in minutes
    level: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_points', ['totalPoints']),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
});
