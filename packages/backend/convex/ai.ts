import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const getProfile = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return null;
    return await ctx.db
      .query('aiProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
  },
});

export const upsertProfile = mutation({
  args: {
    preferredLevel: v.optional(
      v.union(
        v.literal('beginner'),
        v.literal('intermediate'),
        v.literal('advanced')
      )
    ),
    topics: v.optional(v.array(v.string())),
    goals: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const existing = await ctx.db
      .query('aiProfiles')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .first();
    const doc = {
      userId,
      preferredLevel: args.preferredLevel,
      topics: args.topics,
      goals: args.goals,
      updatedAt: Date.now(),
    } as const;
    if (existing) {
      await ctx.db.patch(existing._id, doc);
      return { success: true };
    }
    await ctx.db.insert('aiProfiles', doc);
    return { success: true };
  },
});

export const startSession = mutation({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const sessionId = await ctx.db.insert('aiSessions', {
      userId,
      messages: [],
      lastActiveAt: Date.now(),
    });
    return { sessionId };
  },
});

export const listRecommendations = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query('aiRecommendations')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect();
  },
});

// Stubs for AI chat integration; replace with actual provider calls
export const sendMessage = mutation({
  args: { sessionId: v.id('aiSessions'), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const session = await ctx.db.get(args.sessionId);
    if (!session || session.userId !== userId)
      throw new Error('Session not found');

    const messages = [
      ...session.messages,
      { role: 'user' as const, content: args.content, ts: Date.now() },
      {
        role: 'assistant' as const,
        content: 'Thanks! I will personalize your path shortly.',
        ts: Date.now(),
      },
    ];
    await ctx.db.patch(args.sessionId, { messages, lastActiveAt: Date.now() });
    return { success: true };
  },
});
