import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const listEvents = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('events')
      .withIndex('by_date')
      .order('asc')
      .collect();
  },
});

export const createEvent = mutation({
  args: {
    title: v.string(),
    description: v.string(),
    date: v.number(),
    location: v.optional(v.string()),
    link: v.optional(v.string()),
    type: v.union(v.literal('virtual'), v.literal('physical')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('events', args);
    return { eventId: id };
  },
});

export const registerForEvent = mutation({
  args: { eventId: v.id('events') },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const regId = await ctx.db.insert('eventRegistrations', {
      eventId: args.eventId,
      userId,
      status: 'registered',
      registeredAt: Date.now(),
    });
    return { registrationId: regId };
  },
});
