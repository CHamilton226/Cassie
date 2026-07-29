import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { getStripe } from '@/lib/stripe';
import { db } from '@/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { PRICING, TierId, ANNUAL_DISCOUNT_PERCENT, ANNUAL_FREE_MONTHS } from '@/data/pricing';

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { tier, billingPeriod } = body as { tier: string; billingPeriod: 'monthly' | 'annual' };

    // Validate tier
    if (!tier || tier === 'free' || !PRICING[tier as Exclude<TierId, 'free'>]) {
      return NextResponse.json({ error: 'Invalid pricing tier' }, { status: 400 });
    }

    // Validate billing period
    if (!billingPeriod || !['monthly', 'annual'].includes(billingPeriod)) {
      return NextResponse.json({ error: 'Invalid billing period' }, { status: 400 });
    }

    const tierConfig = PRICING[tier as Exclude<TierId, 'free'>];
    const stripe = getStripe();
    const userId = parseInt((session.user as any).id, 10);

    // Get user record for existing Stripe customer
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const origin = request.headers.get('origin') || process.env.NEXTAUTH_URL || 'http://localhost:3000';

    // Determine the Stripe Price ID for the selected tier + billing period
    const priceId = billingPeriod === 'annual'
      ? tierConfig.stripePriceIdAnnual
      : tierConfig.stripePriceIdMonthly;

    // Build checkout session params
    const sessionParams: any = {
      mode: 'subscription',
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      success_url: `${origin}/dashboard?checkout=success&tier=${tier}&period=${billingPeriod}`,
      cancel_url: `${origin}/pricing?checkout=cancelled`,
      metadata: {
        userId: String(userId),
        tier,
        billingPeriod,
      },
      subscription_data: {
        metadata: {
          userId: String(userId),
          tier,
        },
      },
    };

    // Attach existing Stripe customer or create new one
    if (user.stripeCustomerId) {
      sessionParams.customer = user.stripeCustomerId;
    } else {
      sessionParams.customer_email = user.email;
    }

    const checkoutSession = await stripe.checkout.sessions.create(sessionParams);

    return NextResponse.json({ url: checkoutSession.url });
  } catch (error: any) {
    console.error('Stripe create-checkout error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create checkout session' },
      { status: 500 }
    );
  }
}
