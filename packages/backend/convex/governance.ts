import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const createProposal = mutation({
  args: { title: v.string(), description: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('governanceProposals', {
      title: args.title,
      description: args.description,
      proposerUserId: userId,
      status: 'draft',
      snapshotSpace: undefined,
      snapshotId: undefined,
      createdAt: Date.now(),
    });
    return { proposalId: id };
  },
});

export const listProposals = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    if (args.status) {
      return await ctx.db
        .query('governanceProposals')
        .withIndex('by_status', (q) =>
          q.eq('status', args.status as 'active' | 'draft' | 'closed')
        )
        .order('desc')
        .collect();
    }
    return await ctx.db
      .query('governanceProposals')
      .withIndex('by_created')
      .order('desc')
      .collect();
  },
});

export const castVote = mutation({
  args: {
    proposalId: v.id('governanceProposals'),
    support: v.boolean(),
    weight: v.optional(v.number()),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('proposalVotes', {
      proposalId: args.proposalId,
      userId,
      support: args.support,
      weight: args.weight,
      txHash: undefined,
      castAt: Date.now(),
    });
    return { voteId: id };
  },
});
