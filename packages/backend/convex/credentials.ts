import { mutation, query } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const listCredentials = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) return [];
    return await ctx.db
      .query('credentials')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .order('desc')
      .collect()
      .then(async (credentials) => {
        // Populate each credential with its course
        const populated = await Promise.all(
          credentials.map(async (cred) => {
            const course = await ctx.db.get(cred.courseId);
            return {
              ...cred,
              course,
            };
          })
        );
        return populated;
      });
  },
});

export const requestCredential = mutation({
  args: {
    courseId: v.id('courses'),
    credentialType: v.union(
      v.literal('nft'),
      v.literal('onchain'),
      v.literal('offchain')
    ),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const id = await ctx.db.insert('credentials', {
      userId,
      courseId: args.courseId,
      credentialType: args.credentialType,
      chainId: undefined,
      contractAddress: undefined,
      tokenId: undefined,
      txHash: undefined,
      issuedAt: Date.now(),
      status: 'pending',
    });
    return { credentialId: id };
  },
});

export const markIssued = mutation({
  args: {
    credentialId: v.id('credentials'),
    chainId: v.optional(v.number()),
    contractAddress: v.optional(v.string()),
    tokenId: v.optional(v.string()),
    txHash: v.optional(v.string()),
    status: v.union(v.literal('issued'), v.literal('failed')),
  },
  handler: async (ctx, args) => {
    const cred = await ctx.db.get(args.credentialId);
    if (!cred) throw new Error('Credential not found');
    await ctx.db.patch(args.credentialId, {
      chainId: args.chainId,
      contractAddress: args.contractAddress,
      tokenId: args.tokenId,
      txHash: args.txHash,
      status: args.status,
    });
    return { success: true };
  },
});
