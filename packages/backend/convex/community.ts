import { query, mutation } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';

export const submitIdea = mutation({
  args: {
    title: v.string(),
    description: v.string(),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const ideaId = await ctx.db.insert('communityIdeas', {
      userId,
      title: args.title,
      description: args.description,
      status: 'submitted',
      upvotes: 0,
      downvotes: 0,
      votes: [],
      createdAt: Date.now(),
    });
    return { ideaId };
  },
});

export const listIdeas = query({
  args: { status: v.optional(v.string()) },
  handler: async (ctx, args) => {
    let q = ctx.db.query('communityIdeas').order('desc');
    if (args.status) {
      q = ctx.db
        .query('communityIdeas')
        .withIndex('by_status', (x) => x.eq('status', args.status as any));
    }
    return await q.collect();
  },
});

export const voteIdea = mutation({
  args: {
    ideaId: v.id('communityIdeas'),
    vote: v.union(v.literal('up'), v.literal('down')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');

    const idea = await ctx.db.get(args.ideaId);
    if (!idea) throw new Error('Idea not found');

    const votes = idea.votes || [];
    const existingVoteIndex = votes.findIndex((v) => v.userId === userId);

    if (existingVoteIndex >= 0) {
      const existingVote = votes[existingVoteIndex];

      if (existingVote.vote === args.vote) {
        // Remove vote if same type
        votes.splice(existingVoteIndex, 1);
        if (args.vote === 'up') {
          await ctx.db.patch(args.ideaId, {
            votes,
            upvotes: idea.upvotes - 1,
          });
        } else {
          await ctx.db.patch(args.ideaId, {
            votes,
            downvotes: (idea.downvotes || 0) - 1,
          });
        }
      } else {
        // Change vote type
        votes[existingVoteIndex] = {
          userId,
          vote: args.vote,
          createdAt: Date.now(),
        };
        if (args.vote === 'up') {
          await ctx.db.patch(args.ideaId, {
            votes,
            upvotes: idea.upvotes + 1,
            downvotes: (idea.downvotes || 0) - 1,
          });
        } else {
          await ctx.db.patch(args.ideaId, {
            votes,
            upvotes: idea.upvotes - 1,
            downvotes: (idea.downvotes || 0) + 1,
          });
        }
      }
    } else {
      // Add new vote
      votes.push({
        userId,
        vote: args.vote,
        createdAt: Date.now(),
      });
      if (args.vote === 'up') {
        await ctx.db.patch(args.ideaId, {
          votes,
          upvotes: idea.upvotes + 1,
        });
      } else {
        await ctx.db.patch(args.ideaId, {
          votes,
          downvotes: (idea.downvotes || 0) + 1,
        });
      }
    }

    return { success: true };
  },
});

export const createThread = mutation({
  args: { title: v.string(), tags: v.optional(v.array(v.string())) },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const threadId = await ctx.db.insert('forumThreads', {
      title: args.title,
      tags: args.tags,
      createdBy: userId,
      createdAt: Date.now(),
    });
    return { threadId };
  },
});

export const listThreads = query({
  args: {},
  handler: async (ctx) => {
    const threads = await ctx.db
      .query('forumThreads')
      .withIndex('by_created')
      .order('desc')
      .collect();

    // Get the last post for each thread
    const threadsWithLastPost = await Promise.all(
      threads.map(async (thread) => {
        const lastPost = await ctx.db
          .query('forumPosts')
          .withIndex('by_thread', (q) => q.eq('threadId', thread._id))
          .order('desc')
          .first();

        if (lastPost) {
          const author = await ctx.db.get(lastPost.createdBy);
          return {
            ...thread,
            lastPost: {
              content: lastPost.content,
              authorName: author?.name || author?.email || 'Anonymous',
              createdAt: lastPost.createdAt,
            },
          };
        }

        return {
          ...thread,
          lastPost: null,
        };
      })
    );

    return threadsWithLastPost;
  },
});

export const addPost = mutation({
  args: { threadId: v.id('forumThreads'), content: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const postId = await ctx.db.insert('forumPosts', {
      threadId: args.threadId,
      content: args.content,
      createdBy: userId,
      createdAt: Date.now(),
      upvotes: 0,
      downvotes: 0,
      votes: [],
    });
    return { postId };
  },
});

export const listThreadPosts = query({
  args: { threadId: v.id('forumThreads') },
  handler: async (ctx, args) => {
    const posts = await ctx.db
      .query('forumPosts')
      .withIndex('by_thread', (q) => q.eq('threadId', args.threadId))
      .order('asc')
      .collect();

    // Get author info for each post
    const postsWithAuthors = await Promise.all(
      posts.map(async (post) => {
        const author = await ctx.db.get(post.createdBy);
        return {
          ...post,
          authorName: author?.name || author?.email || 'Anonymous',
        };
      })
    );

    return postsWithAuthors;
  },
});

export const createAmaSession = mutation({
  args: { title: v.string(), description: v.string(), scheduledAt: v.number() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const sessionId = await ctx.db.insert('amaSessions', {
      title: args.title,
      description: args.description,
      scheduledAt: args.scheduledAt,
      hostUserId: userId,
      isLive: false,
      recordingUrl: undefined,
    });
    return { sessionId };
  },
});

export const listAmaSessions = query({
  args: {},
  handler: async (ctx) => {
    return await ctx.db
      .query('amaSessions')
      .withIndex('by_schedule')
      .order('asc')
      .collect();
  },
});

export const askAmaQuestion = mutation({
  args: { sessionId: v.id('amaSessions'), question: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');
    const qId = await ctx.db.insert('amaQuestions', {
      sessionId: args.sessionId,
      userId,
      question: args.question,
      upvotes: 0,
      createdAt: Date.now(),
    });
    return { questionId: qId };
  },
});

export const upvoteAmaQuestion = mutation({
  args: { questionId: v.id('amaQuestions') },
  handler: async (ctx, args) => {
    const q = await ctx.db.get(args.questionId);
    if (!q) throw new Error('Question not found');
    await ctx.db.patch(args.questionId, { upvotes: q.upvotes + 1 });
    return { success: true };
  },
});

export const addReaction = mutation({
  args: { postId: v.id('forumPosts'), emoji: v.string() },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error('Post not found');

    const reactions = post.reactions || [];
    const existingReactionIndex = reactions.findIndex(
      (r) => r.userId === userId && r.emoji === args.emoji
    );

    if (existingReactionIndex >= 0) {
      // Remove reaction if already exists
      reactions.splice(existingReactionIndex, 1);
    } else {
      // Add new reaction
      reactions.push({
        userId,
        emoji: args.emoji,
        createdAt: Date.now(),
      });
    }

    await ctx.db.patch(args.postId, { reactions });
    return { success: true };
  },
});

// Migration function to add downvotes field to existing communityIdeas
export const migrateCommunityIdeas = mutation({
  args: {},
  handler: async (ctx) => {
    const ideas = await ctx.db.query('communityIdeas').collect();

    for (const idea of ideas) {
      if (idea.downvotes === undefined) {
        await ctx.db.patch(idea._id, {
          downvotes: 0,
        });
      }
    }

    return { success: true, migrated: ideas.length };
  },
});

// Vote on forum posts
export const votePost = mutation({
  args: {
    postId: v.id('forumPosts'),
    vote: v.union(v.literal('up'), v.literal('down')),
  },
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) throw new Error('Must be authenticated');

    const post = await ctx.db.get(args.postId);
    if (!post) throw new Error('Post not found');

    const votes = post.votes || [];
    const existingVoteIndex = votes.findIndex((v) => v.userId === userId);

    if (existingVoteIndex >= 0) {
      const existingVote = votes[existingVoteIndex];

      if (existingVote.vote === args.vote) {
        // Remove vote if same type
        votes.splice(existingVoteIndex, 1);
        if (args.vote === 'up') {
          await ctx.db.patch(args.postId, {
            votes,
            upvotes: (post.upvotes || 0) - 1,
          });
        } else {
          await ctx.db.patch(args.postId, {
            votes,
            downvotes: (post.downvotes || 0) - 1,
          });
        }
      } else {
        // Change vote type
        votes[existingVoteIndex] = {
          userId,
          vote: args.vote,
          createdAt: Date.now(),
        };
        if (args.vote === 'up') {
          await ctx.db.patch(args.postId, {
            votes,
            upvotes: (post.upvotes || 0) + 1,
            downvotes: (post.downvotes || 0) - 1,
          });
        } else {
          await ctx.db.patch(args.postId, {
            votes,
            upvotes: (post.upvotes || 0) - 1,
            downvotes: (post.downvotes || 0) + 1,
          });
        }
      }
    } else {
      // Add new vote
      votes.push({
        userId,
        vote: args.vote,
        createdAt: Date.now(),
      });
      if (args.vote === 'up') {
        await ctx.db.patch(args.postId, {
          votes,
          upvotes: (post.upvotes || 0) + 1,
        });
      } else {
        await ctx.db.patch(args.postId, {
          votes,
          downvotes: (post.downvotes || 0) + 1,
        });
      }
    }

    return { success: true };
  },
});

// Migration function to add voting fields to existing forum posts
export const migrateForumPosts = mutation({
  args: {},
  handler: async (ctx) => {
    const posts = await ctx.db.query('forumPosts').collect();

    for (const post of posts) {
      if (post.upvotes === undefined || post.downvotes === undefined) {
        await ctx.db.patch(post._id, {
          upvotes: post.upvotes || 0,
          downvotes: post.downvotes || 0,
        });
      }
    }

    return { success: true, migrated: posts.length };
  },
});
