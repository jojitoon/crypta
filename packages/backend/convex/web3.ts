import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const linkWallet = mutation({
  args: { address: v.string(), chainId: v.optional(v.number()) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const existing = await ctx.db
      .query('walletLinks')
      .withIndex('by_address', (q) => q.eq('address', args.address))
      .first();
    if (existing) {
      await ctx.db.patch(existing._id, {
        userId,
        chainId: args.chainId,
        verifiedAt: Date.now(),
      });
      return { success: true };
    }
    await ctx.db.insert('walletLinks', {
      userId,
      address: args.address,
      chainId: args.chainId,
      verifiedAt: Date.now(),
    });
    return { success: true };
  },
});

export const myWallets = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query('walletLinks')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});

export const recordStaking = mutation({
  args: { tokenAddress: v.string(), chainId: v.number(), amount: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('stakingRecords', {
      userId,
      tokenAddress: args.tokenAddress,
      chainId: args.chainId,
      amount: args.amount,
      since: Date.now(),
      status: 'active',
    });
    return { stakingId: id };
  },
});

export const myStaking = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query('stakingRecords')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .collect();
  },
});
