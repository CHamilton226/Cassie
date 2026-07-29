export type TierId = 'free' | 'starter' | 'pro' | 'practice' | 'agency';

export interface Tier {
  id: TierId;
  name: string;
  monthlyPrice: number;
  annualPrice: number;
  monthlyPriceDisplay: string;
  annualPriceDisplay: string;
  annualMonthlyPriceDisplay: string;
  stripePriceIdMonthly: string;
  stripePriceIdAnnual: string;
  features: string[];
  aiGenerationsLimit: number;
  aiReviewResponsesLimit: number;
  websiteAuditsLimit: number | null; // null = unlimited
  cta: string;
  highlight: boolean;
  description: string;
}

// ─── Pricing Data ─────────────────────────────────────────────
// Annual prices are 10x monthly (2 months free = ~17% discount)
export const PRICING: Record<Exclude<TierId, 'free'>, Tier> = {
  starter: {
    id: 'starter',
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 290,
    monthlyPriceDisplay: '$29',
    annualPriceDisplay: '$290',
    annualMonthlyPriceDisplay: '$24.17',
    stripePriceIdMonthly: 'price_1Tyd77D3UNiW9XnlnS8aKjm2',
    stripePriceIdAnnual: 'price_1Tyd77D3UNiW9XnlXbq3QM2Z',
    features: [
      '50 AI content generations/month',
      '50 review responses/month',
      'Full Growth Score with insights',
      '5 website audits/month',
      '30-day marketing plan',
      'Email support',
    ],
    aiGenerationsLimit: 50,
    aiReviewResponsesLimit: 50,
    websiteAuditsLimit: 5,
    cta: 'Start Free Trial',
    highlight: false,
    description: 'For solo practitioners ready to grow their online presence.',
  },
  pro: {
    id: 'pro',
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 790,
    monthlyPriceDisplay: '$79',
    annualPriceDisplay: '$790',
    annualMonthlyPriceDisplay: '$65.83',
    stripePriceIdMonthly: 'price_1Tyd78D3UNiW9Xnlgtc0IY9A',
    stripePriceIdAnnual: 'price_1Tyd78D3UNiW9XnlEDtSr01x',
    features: [
      '200 AI content generations/month',
      '200 review responses/month',
      'Advanced Growth Score & tracking',
      'Unlimited website audits',
      'Monthly marketing plan refresh',
      'Content scheduling',
      'Priority email support',
    ],
    aiGenerationsLimit: 200,
    aiReviewResponsesLimit: 200,
    websiteAuditsLimit: null,
    cta: 'Start Free Trial',
    highlight: true,
    description: 'For growing practices that want a complete marketing toolkit.',
  },
  practice: {
    id: 'practice',
    name: 'Practice',
    monthlyPrice: 149,
    annualPrice: 1490,
    monthlyPriceDisplay: '$149',
    annualPriceDisplay: '$1,490',
    annualMonthlyPriceDisplay: '$124.17',
    stripePriceIdMonthly: 'price_1Tyd78D3UNiW9XnlSeUdDDsD',
    stripePriceIdAnnual: 'price_1Tyd78D3UNiW9Xnl9EhvO5Gr',
    features: [
      '500 AI content generations/month',
      '500 review responses/month',
      'Everything in Pro, plus:',
      'Multi-provider support',
      'Custom brand voice training',
      'Competitor analysis',
      'Priority chat support',
    ],
    aiGenerationsLimit: 500,
    aiReviewResponsesLimit: 500,
    websiteAuditsLimit: null,
    cta: 'Start Free Trial',
    highlight: false,
    description: 'For practices with multiple providers and complex needs.',
  },
  agency: {
    id: 'agency',
    name: 'Agency',
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyPriceDisplay: '$299',
    annualPriceDisplay: '$2,990',
    annualMonthlyPriceDisplay: '$249.17',
    stripePriceIdMonthly: 'price_1Tyd79D3UNiW9XnlfnRQWHYc',
    stripePriceIdAnnual: 'price_1Tyd79D3UNiW9XnlbMLwRCWS',
    features: [
      'Unlimited AI generations',
      'Unlimited review responses',
      'Everything in Practice, plus:',
      'White-label reports',
      'Client management dashboard',
      'API access',
      'Dedicated account manager',
    ],
    aiGenerationsLimit: 999999,
    aiReviewResponsesLimit: 999999,
    websiteAuditsLimit: null,
    cta: 'Contact Us',
    highlight: false,
    description: 'For marketing agencies managing multiple healthcare clients.',
  },
};

export const FREE_TIER = {
  id: 'free' as const,
  name: 'Free',
  monthlyPrice: 0,
  monthlyPriceDisplay: '$0',
  features: [
    '5 AI content generations/month',
    '10 review responses/month',
    'Basic Growth Score',
    '1 website audit/month',
    'Community support',
  ],
  aiGenerationsLimit: 5,
  aiReviewResponsesLimit: 10,
  websiteAuditsLimit: 1,
  cta: 'Start Free',
  highlight: false,
  description: 'Try CareConnect AI risk-free. Perfect for getting started.',
};

export const ALL_TIERS = [FREE_TIER, ...Object.values(PRICING)];

export function getTier(id: string): Tier | typeof FREE_TIER | undefined {
  if (id === 'free') return FREE_TIER;
  return PRICING[id as Exclude<TierId, 'free'>];
}

// Annual discount display
export const ANNUAL_DISCOUNT_PERCENT = 17;
export const ANNUAL_FREE_MONTHS = 2;
