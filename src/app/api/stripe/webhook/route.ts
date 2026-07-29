import { NextRequest, NextResponse } from 'next/server';
import { getStripe, getStripeWebhookSecret } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING, FREE_TIER, TierId } from '@/data/pricing';

// Must disable body parsing — Stripe needs the raw body for signature verification
export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const stripe = getStripe();
    const webhookSecret = getStripeWebhookSecret();

    // Read the raw request body
    const body = await request.text();
    const signature = request.headers.get('stripe-signature') || '';

    let event;
    try {
      event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
    } catch (err: any) {
      console.error('Webhook signature verification failed:', err.message);
      return NextResponse.json({ error: `Webhook signature verification failed: ${err.message}` }, { status: 400 });
    }

    // Handle the event
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const userId = session.metadata?.userId;
        const tier = session.metadata?.tier;
        const stripeCustomerId = session.customer as string;
        const stripeSubscriptionId = session.subscription as string;

        if (!userId) {
          console.error('checkout.session.completed: No userId in metadata');
          break;
        }

        const tierConfig = PRICING[tier as Exclude<TierId, 'free'>];
        const aiLimit = tierConfig ? tierConfig.aiGenerationsLimit : FREE_TIER.aiGenerationsLimit;

        await db.update(users)
          .set({
            stripeCustomerId,
            stripeSubscriptionId,
            subscriptionTier: tier as any || 'free',
            subscriptionStatus: 'active',
            aiGenerationsUsed: 0,
            aiGenerationLimit: aiLimit,
          })
          .where(eq(users.id, parseInt(userId, 10)));

        console.log(`User ${userId} upgraded to ${tier || 'unknown'} tier`);
        break;
      }

      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const metadata = subscription.metadata || {};
        const userId = metadata.userId;

        if (!userId) {
          // Try to find user by customer ID
          if (subscription.customer) {
            const userRecord = await db.query.users.findFirst({
              where: eq(users.stripeCustomerId, subscription.customer as string),
            });
            if (!userRecord) break;
            await updateUserFromSubscription(userRecord.id, subscription);
          }
          break;
        }

        await updateUserFromSubscription(parseInt(userId, 10), subscription);
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const metadata = subscription.metadata || {};
        const userId = metadata.userId;

        if (!userId) {
          if (subscription.customer) {
            const userRecord = await db.query.users.findFirst({
              where: eq(users.stripeCustomerId, subscription.customer as string),
            });
            if (!userRecord) break;
            await db.update(users)
              .set({
                subscriptionTier: 'free',
                subscriptionStatus: 'canceled',
                aiGenerationLimit: FREE_TIER.aiGenerationsLimit,
              })
              .where(eq(users.id, userRecord.id));
          }
          break;
        }

        await db.update(users)
          .set({
            subscriptionTier: 'free',
            subscriptionStatus: 'canceled',
            aiGenerationLimit: FREE_TIER.aiGenerationsLimit,
          })
          .where(eq(users.id, parseInt(userId, 10)));

        console.log(`User ${userId} subscription canceled`);
        break;
      }

      default:
        // Unexpected event type — log it but don't fail
        console.log(`Unhandled event type: ${event.type}`);
    }

    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('Stripe webhook error:', error);
    return NextResponse.json(
      { error: error.message || 'Internal webhook error' },
      { status: 500 }
    );
  }
}

// Helper to update user based on subscription state
async function updateUserFromSubscription(userId: number, subscription: any): Promise<void> {
  const status = subscription.status;
  const items = subscription.items?.data;
  const priceId = items?.[0]?.price?.id;

  // Map status
  let subscriptionStatus: string;
  if (status === 'active' || status === 'trialing') {
    subscriptionStatus = 'active';
  } else if (status === 'past_due') {
    subscriptionStatus = 'past_due';
  } else if (status === 'canceled' || status === 'unpaid') {
    subscriptionStatus = 'canceled';
  } else {
    subscriptionStatus = status;
  }

  // Map price ID to tier
  let tier: string = 'free';
  let aiLimit = FREE_TIER.aiGenerationsLimit;

  if (priceId) {
    for (const [tierId, tierConfig] of Object.entries(PRICING)) {
      if (tierConfig.stripePriceIdMonthly === priceId || tierConfig.stripePriceIdAnnual === priceId) {
        tier = tierId;
        aiLimit = tierConfig.aiGenerationsLimit;
        break;
      }
    }
  }

  await db.update(users)
    .set({
      subscriptionTier: tier as any,
      subscriptionStatus,
      stripeSubscriptionId: subscription.id,
      aiGenerationLimit: aiLimit,
    })
    .where(eq(users.id, userId));

  console.log(`User ${userId} subscription updated: tier=${tier}, status=${subscriptionStatus}`);
}
