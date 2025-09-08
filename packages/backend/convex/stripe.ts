import { mutation, query, action } from './_generated/server';
import { v } from 'convex/values';
import { getAuthUserId } from '@convex-dev/auth/server';
import { api } from './_generated/api';

export const createCheckoutSession = action({
  args: {
    courseId: v.id('courses'),
  },
  returns: v.object({
    sessionId: v.string(),
    url: v.union(v.string(), v.null()),
  }),
  handler: async (ctx, args) => {
    'use node';

    const userId = await getAuthUserId(ctx);
    if (!userId) {
      throw new Error('Must be authenticated');
    }

    // Get the course
    const course: any = await ctx.runQuery(api.courses.getCourse, {
      courseId: args.courseId,
    });
    if (!course) {
      throw new Error('Course not found');
    }

    // Check if course is free
    if (course.isFree || course.price === 0) {
      throw new Error('Course is free, no payment required');
    }

    if (!course.price) {
      throw new Error('Course pricing not configured');
    }

    // Check if user already purchased this course
    const existingPurchase = await ctx.runQuery(api.stripe.hasAccessToCourse, {
      courseId: args.courseId,
    });
    if (existingPurchase) {
      throw new Error('Course already purchased');
    }

    // Create a pending purchase record first
    const purchaseId: any = await ctx.runMutation(
      api.stripe.createPurchaseRecord,
      {
        userId,
        courseId: args.courseId,
        amount: course.price,
      }
    );

    // Create Stripe session
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });

    // Get the base URL with proper scheme
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const appUrl = baseUrl.startsWith('http') ? baseUrl : `https://${baseUrl}`;

    console.log('Creating Stripe session with URLs:', {
      success_url: `${appUrl}/payment-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/payment-cancelled`,
      baseUrl,
      appUrl,
    });

    // Get user email for checkout
    const user = await ctx.runQuery(api.auth.loggedInUser, {});
    const customerEmail = user?.email;

    const session: any = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: customerEmail,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: course.title,
              description: course.description || 'Course access',
            },
            unit_amount: course.price, // Price is already in cents
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${appUrl}/courses/${args.courseId}?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${appUrl}/courses/${args.courseId}?payment=cancelled`,
      metadata: {
        userId,
        courseId: args.courseId,
        purchaseId,
      },
    });

    // Update the purchase record with session ID
    await ctx.runMutation(api.stripe.updatePurchaseSession, {
      purchaseId,
      sessionId: session.id,
    });

    return { sessionId: session.id, url: session.url };
  },
});

// Mutation to create purchase record
export const createPurchaseRecord = mutation({
  args: {
    userId: v.id('users'),
    courseId: v.id('courses'),
    amount: v.number(),
  },
  returns: v.id('coursePurchases'),
  handler: async (ctx, args) => {
    return await ctx.db.insert('coursePurchases', {
      userId: args.userId,
      courseId: args.courseId,
      amount: args.amount,
      currency: 'usd',
      status: 'pending',
      purchasedAt: Date.now(),
    });
  },
});

export const getMyPurchases = query({
  args: {},
  handler: async (ctx) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return [];
    }

    const purchases = await ctx.db
      .query('coursePurchases')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'completed'))
      .collect();

    // Get course details for each purchase
    const purchasesWithCourses = await Promise.all(
      purchases.map(async (purchase) => {
        const course = await ctx.db.get(purchase.courseId);
        return {
          ...purchase,
          course: course
            ? {
                title: course.title,
                description: course.description,
                imageUrl: course.imageUrl,
              }
            : null,
        };
      })
    );

    return purchasesWithCourses;
  },
});

export const hasAccessToCourse = query({
  args: { courseId: v.id('courses') },
  returns: v.boolean(),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      return false;
    }

    // Get the course
    const course = await ctx.db.get(args.courseId);
    if (!course) {
      return false;
    }

    // Free courses or preview courses are accessible
    if (course.isFree || course.isPreview || !course.price) {
      return true;
    }

    // Check if user has purchased this course
    const purchase = await ctx.db
      .query('coursePurchases')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('courseId'), args.courseId))
      .filter((q) => q.eq(q.field('status'), 'completed'))
      .first();

    return !!purchase;
  },
});

export const hasAccessToCourses = query({
  args: { courseIds: v.array(v.id('courses')) },
  returns: v.record(v.id('courses'), v.boolean()),
  handler: async (ctx, args) => {
    const userId = await getAuthUserId(ctx);
    if (!userId) {
      // Return false for all courses if not authenticated
      const result: Record<string, boolean> = {};
      for (const courseId of args.courseIds) {
        result[courseId] = false;
      }
      return result;
    }

    const result: Record<string, boolean> = {};

    // Get all courses
    const courses = await Promise.all(
      args.courseIds.map((courseId) => ctx.db.get(courseId))
    );

    // Get all user purchases
    const purchases = await ctx.db
      .query('coursePurchases')
      .withIndex('by_user', (q) => q.eq('userId', userId))
      .filter((q) => q.eq(q.field('status'), 'completed'))
      .collect();

    // Create a set of purchased course IDs for quick lookup
    const purchasedCourseIds = new Set(
      purchases.map((purchase) => purchase.courseId)
    );

    // Check access for each course
    for (let i = 0; i < args.courseIds.length; i++) {
      const courseId = args.courseIds[i];
      if (!courseId) continue;

      const course = courses[i];

      if (!course && courseId) {
        result[courseId] = false;
        continue;
      }

      // Free courses or preview courses are accessible
      if ((course?.isFree || course?.isPreview || !course?.price) && courseId) {
        result[courseId] = true;
        continue;
      }

      // Check if user has purchased this course
      result[courseId] = purchasedCourseIds.has(courseId);
    }

    return result;
  },
});

// Webhook handler for Stripe events
export const handleStripeWebhook = mutation({
  args: {
    eventType: v.string(),
    sessionId: v.optional(v.string()),
    paymentIntentId: v.optional(v.string()),
  },
  returns: v.object({ success: v.boolean() }),
  handler: async (ctx, args) => {
    if (args.eventType === 'checkout.session.completed' && args.sessionId) {
      // Find the purchase record
      const purchase = await ctx.db
        .query('coursePurchases')
        .withIndex('by_stripe_session', (q) =>
          q.eq('stripeSessionId', args.sessionId)
        )
        .first();

      if (purchase) {
        // Update the purchase status to completed
        await ctx.db.patch(purchase._id, {
          status: 'completed',
          stripePaymentIntentId: args.paymentIntentId,
        });
      }
    }

    return { success: true };
  },
});

// Mutation to update purchase with session ID
export const updatePurchaseSession = mutation({
  args: {
    purchaseId: v.id('coursePurchases'),
    sessionId: v.string(),
  },
  returns: v.null(),
  handler: async (ctx, args) => {
    await ctx.db.patch(args.purchaseId, {
      stripeSessionId: args.sessionId,
    });
    return null;
  },
});

// Action to handle Stripe webhook events with signature verification
export const processWebhookEvent = action({
  args: {
    body: v.string(),
    signature: v.string(),
  },
  returns: v.object({ received: v.boolean() }),
  handler: async (ctx, args) => {
    'use node';

    if (!process.env.STRIPE_WEBHOOK_SECRET) {
      throw new Error('Missing webhook secret');
    }

    // Initialize Stripe
    const Stripe = (await import('stripe')).default;
    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
      apiVersion: '2025-08-27.basil',
    });

    // Verify webhook signature
    let event: any;
    try {
      event = await stripe.webhooks.constructEventAsync(
        args.body,
        args.signature,
        process.env.STRIPE_WEBHOOK_SECRET!
      );
    } catch (err) {
      console.error('Webhook signature verification failed:', err);
      throw new Error('Invalid signature');
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
      const session = event.data.object;

      await ctx.runMutation(api.stripe.handleStripeWebhook, {
        eventType: event.type,
        sessionId: session.id,
        paymentIntentId: session.payment_intent as string,
      });
    }

    return { received: true };
  },
});
