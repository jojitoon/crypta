import { query } from "./_generated/server";
import { v } from "convex/values";
import { getAuthUserId } from "@convex-dev/auth/server";

export const getUserAchievements = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const achievements = await ctx.db
      .query("achievements")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .order("desc")
      .collect();

    return achievements;
  },
});

export const getUserStats = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return null;
    }

    const stats = await ctx.db
      .query("userStats")
      .withIndex("by_user", (q: any) => q.eq("userId", userId))
      .first();

    if (!stats) {
      return {
        totalPoints: 0,
        currentStreak: 0,
        longestStreak: 0,
        coursesCompleted: 0,
        lessonsCompleted: 0,
        totalTimeSpent: 0,
        level: 1,
      };
    }

    return stats;
  },
});

export const getLeaderboard = query({
  args: { limit: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const limit = args.limit || 10;
    
    const topUsers = await ctx.db
      .query("userStats")
      .withIndex("by_points")
      .order("desc")
      .take(limit);

    const leaderboard = await Promise.all(
      topUsers.map(async (stats) => {
        const user = await ctx.db.get(stats.userId);
        return {
          userId: stats.userId,
          name: user?.name || user?.email || "Anonymous",
          totalPoints: stats.totalPoints,
          level: stats.level,
          coursesCompleted: stats.coursesCompleted,
        };
      })
    );

    return leaderboard;
  },
});
