import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const listWebinars = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('webinars')
      .withIndex('by_schedule')
      .order('asc')
      .collect();
  },
});

export const createWebinar = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    scheduledAt: v.number(),
    joinLink: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('webinars', {
      title: args.title,
      description: args.description,
      scheduledAt: args.scheduledAt,
      hostUserId: userId,
      joinLink: args.joinLink,
      recordingUrl: undefined,
    });
    return { webinarId: id };
  },
});

export const listShorts = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('shorts')
      .withIndex('by_created')
      .order('desc')
      .collect();
  },
});

export const createShort = mutation({
  args: {
    title: v.string(),
    videoUrl: v.string(),
    description: v.optional(v.string()),
    tags: v.optional(v.array(v.string())),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('shorts', {
      title: args.title,
      videoUrl: args.videoUrl,
      description: args.description,
      tags: args.tags,
      createdBy: userId,
      createdAt: Date.now(),
    });
    return { shortId: id };
  },
});
