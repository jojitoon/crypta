import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const setAvailability = mutation({
  args: {
    dayOfWeek: v.number(),
    startTime: v.string(),
    endTime: v.string(),
    timezone: v.string(),
  },
  handler: async (ctx, args) => {
    const coachUserId = await getAuthUserId(ctx);
    if (!coachUserId) throw new Error('Must be authenticated');
    await ctx.db.insert('availability', { ...args, coachUserId });
    return { success: true };
  },
});

export const listAvailability = query({
  args: { coachUserId: v.id('users') },
  handler: async (ctx, args) => {
    return await ctx.db
      .query('availability')
      .withIndex('by_coach', (q) => q.eq('coachUserId', args.coachUserId))
      .collect();
  },
});

export const requestBooking = mutation({
  args: {
    coachUserId: v.id('users'),
    startAt: v.number(),
    endAt: v.number(),
    notes: v.optional(v.string()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const bookingId = await ctx.db.insert('bookings', {
      userId,
      coachUserId: args.coachUserId,
      startAt: args.startAt,
      endAt: args.endAt,
      notes: args.notes,
      status: 'requested',
    });
    return { bookingId };
  },
});

export const myBookings = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query('bookings')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});
