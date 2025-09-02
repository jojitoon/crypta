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
    // Mux video asset fields
    muxAssetId: v.optional(v.string()),
    muxPlaybackId: v.optional(v.string()),
    muxUploadId: v.optional(v.string()),
    videoDuration: v.optional(v.number()), // in seconds
    videoStatus: v.optional(
      v.union(
        v.literal('uploading'),
        v.literal('processing'),
        v.literal('ready'),
        v.literal('failed')
      )
    ),
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

  // Community: ideas, forums, AMAs
  communityIdeas: defineTable({
    userId: v.id('users'),
    title: v.string(),
    description: v.string(),
    status: v.union(
      v.literal('submitted'),
      v.literal('under_review'),
      v.literal('approved'),
      v.literal('rejected')
    ),
    upvotes: v.number(),
    downvotes: v.optional(v.number()),
    votes: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          vote: v.union(v.literal('up'), v.literal('down')),
          createdAt: v.number(),
        })
      )
    ),
    createdAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_user', ['userId'])
    .index('by_created', ['createdAt']),

  forumThreads: defineTable({
    title: v.string(),
    tags: v.optional(v.array(v.string())),
    createdBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_created', ['createdAt'])
    .index('by_creator', ['createdBy']),

  forumPosts: defineTable({
    threadId: v.id('forumThreads'),
    content: v.string(),
    createdBy: v.id('users'),
    createdAt: v.number(),
    upvotes: v.optional(v.number()),
    downvotes: v.optional(v.number()),
    votes: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          vote: v.union(v.literal('up'), v.literal('down')),
          createdAt: v.number(),
        })
      )
    ),
    reactions: v.optional(
      v.array(
        v.object({
          userId: v.id('users'),
          emoji: v.string(),
          createdAt: v.number(),
        })
      )
    ),
  })
    .index('by_thread', ['threadId', 'createdAt'])
    .index('by_creator', ['createdBy']),

  amaSessions: defineTable({
    title: v.string(),
    description: v.string(),
    scheduledAt: v.number(),
    hostUserId: v.id('users'),
    isLive: v.boolean(),
    recordingUrl: v.optional(v.string()),
  })
    .index('by_schedule', ['scheduledAt'])
    .index('by_host', ['hostUserId']),

  amaQuestions: defineTable({
    sessionId: v.id('amaSessions'),
    userId: v.id('users'),
    question: v.string(),
    upvotes: v.number(),
    createdAt: v.number(),
  })
    .index('by_session', ['sessionId', 'createdAt'])
    .index('by_user', ['userId']),

  // AI personalization
  aiProfiles: defineTable({
    userId: v.id('users'),
    preferredLevel: v.optional(
      v.union(
        v.literal('beginner'),
        v.literal('intermediate'),
        v.literal('advanced')
      )
    ),
    topics: v.optional(v.array(v.string())),
    goals: v.optional(v.string()),
    updatedAt: v.number(),
  }).index('by_user', ['userId']),

  aiSessions: defineTable({
    userId: v.id('users'),
    messages: v.array(
      v.object({
        role: v.union(v.literal('user'), v.literal('assistant')),
        content: v.string(),
        ts: v.number(),
      })
    ),
    lastActiveAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_last', ['lastActiveAt']),

  aiRecommendations: defineTable({
    userId: v.id('users'),
    courseId: v.optional(v.id('courses')),
    lessonId: v.optional(v.id('lessons')),
    reason: v.string(),
    createdAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_created', ['createdAt']),

  // Credentials & Web3
  credentials: defineTable({
    userId: v.id('users'),
    courseId: v.id('courses'),
    credentialType: v.union(
      v.literal('nft'),
      v.literal('onchain'),
      v.literal('offchain')
    ),
    chainId: v.optional(v.number()),
    contractAddress: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    txHash: v.optional(v.string()),
    issuedAt: v.number(),
    status: v.union(
      v.literal('pending'),
      v.literal('issued'),
      v.literal('failed')
    ),
  })
    .index('by_user', ['userId'])
    .index('by_course', ['courseId'])
    .index('by_status', ['status']),

  walletLinks: defineTable({
    userId: v.id('users'),
    address: v.string(),
    chainId: v.optional(v.number()),
    verifiedAt: v.optional(v.number()),
  })
    .index('by_user', ['userId'])
    .index('by_address', ['address']),

  stakingRecords: defineTable({
    userId: v.id('users'),
    tokenAddress: v.string(),
    chainId: v.number(),
    amount: v.number(),
    since: v.number(),
    status: v.union(v.literal('active'), v.literal('unstaked')),
  })
    .index('by_user', ['userId'])
    .index('by_token', ['tokenAddress']),

  nftRewards: defineTable({
    userId: v.id('users'),
    reason: v.string(),
    metadataUri: v.optional(v.string()),
    chainId: v.optional(v.number()),
    contractAddress: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    txHash: v.optional(v.string()),
    issuedAt: v.number(),
  })
    .index('by_user', ['userId'])
    .index('by_issued', ['issuedAt']),

  // Consulting & coaching
  availability: defineTable({
    coachUserId: v.id('users'),
    dayOfWeek: v.number(), // 0-6
    startTime: v.string(), // HH:mm
    endTime: v.string(), // HH:mm
    timezone: v.string(),
  }).index('by_coach', ['coachUserId']),

  bookings: defineTable({
    userId: v.id('users'),
    coachUserId: v.id('users'),
    startAt: v.number(),
    endAt: v.number(),
    status: v.union(
      v.literal('requested'),
      v.literal('confirmed'),
      v.literal('completed'),
      v.literal('cancelled')
    ),
    notes: v.optional(v.string()),
  })
    .index('by_user', ['userId'])
    .index('by_coach', ['coachUserId'])
    .index('by_start', ['startAt']),

  // Multimedia: webinars and short videos
  webinars: defineTable({
    title: v.string(),
    description: v.string(),
    scheduledAt: v.number(),
    hostUserId: v.id('users'),
    joinLink: v.optional(v.string()),
    recordingUrl: v.optional(v.string()),
  })
    .index('by_schedule', ['scheduledAt'])
    .index('by_host', ['hostUserId']),

  shorts: defineTable({
    title: v.string(),
    videoUrl: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
    createdBy: v.id('users'),
    createdAt: v.number(),
  })
    .index('by_created', ['createdAt'])
    .index('by_creator', ['createdBy']),

  // Events & physical rewards
  events: defineTable({
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.optional(v.string()),
    link: v.optional(v.string()),
    type: v.union(v.literal('virtual'), v.literal('physical')),
  }).index('by_date', ['date']),

  eventRegistrations: defineTable({
    eventId: v.id('events'),
    userId: v.id('users'),
    status: v.union(v.literal('registered'), v.literal('attended')),
    registeredAt: v.number(),
  })
    .index('by_event', ['eventId'])
    .index('by_user', ['userId']),

  // Governance hooks (off-chain link or on-chain)
  governanceProposals: defineTable({
    title: v.string(),
    description: v.string(),
    proposerUserId: v.id('users'),
    status: v.union(
      v.literal('draft'),
      v.literal('active'),
      v.literal('closed')
    ),
    snapshotSpace: v.optional(v.string()),
    snapshotId: v.optional(v.string()),
    createdAt: v.number(),
  })
    .index('by_status', ['status'])
    .index('by_created', ['createdAt']),

  proposalVotes: defineTable({
    proposalId: v.id('governanceProposals'),
    userId: v.id('users'),
    support: v.boolean(),
    weight: v.optional(v.number()),
    txHash: v.optional(v.string()),
    castAt: v.number(),
  })
    .index('by_proposal', ['proposalId'])
    .index('by_user', ['userId']),
};

export default defineSchema({
  ...authTables,
  ...applicationTables,
  // Add admin field to users table
  users: defineTable({
    name: v.optional(v.string()),
    email: v.optional(v.string()),
    phone: v.optional(v.string()),
    image: v.optional(v.string()),
    emailVerificationTime: v.optional(v.number()),
    phoneVerificationTime: v.optional(v.number()),
    isAdmin: v.optional(v.boolean()),
    // Additional profile fields
    bio: v.optional(v.string()),
    location: v.optional(v.string()),
    website: v.optional(v.string()),
    avatarUrl: v.optional(v.string()),
    socialLinks: v.optional(
      v.object({
        twitter: v.optional(v.string()),
        linkedin: v.optional(v.string()),
        github: v.optional(v.string()),
      })
    ),
    isActive: v.optional(v.boolean()),
    notes: v.optional(v.string()),
  })
    .index('by_admin', ['isAdmin'])
    .index('by_email', ['email']),
});
