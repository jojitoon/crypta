import { auth } from './auth';
import router from './router';
import { httpAction } from './_generated/server';
import { api } from './_generated/api';

const http = router;

auth.addHttpRoutes(http);

// Mux webhook endpoint
http.route({
  path: '/mux/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.json();
      const { type, data } = body;

      // Handle Mux webhook
      await ctx.runAction(api.mux.handleMuxWebhook, { type, data });

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Mux webhook error:', error);
      return new Response(
        JSON.stringify({ error: 'Webhook processing failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }),
});

// Stripe webhook endpoint
http.route({
  path: '/stripe/webhook',
  method: 'POST',
  handler: httpAction(async (ctx, request) => {
    try {
      const body = await request.text();
      const signature = request.headers.get('stripe-signature');

      if (!signature) {
        return new Response('Missing signature', { status: 400 });
      }

      // Use the dedicated webhook action
      const result = await ctx.runAction(api.stripe.processWebhookEvent, {
        body,
        signature,
      });

      return new Response(JSON.stringify(result), {
        status: 200,
        headers: { 'Content-Type': 'application/json' },
      });
    } catch (error) {
      console.error('Stripe webhook error:', error);
      return new Response(
        JSON.stringify({ error: 'Webhook processing failed' }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }
  }),
});

export default http;
