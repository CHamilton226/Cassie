'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  X,
  Menu,
  Loader2,
} from 'lucide-react';

const PRICING_CONFIG = {
  free: {
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
    cta: 'Start Free',
    highlight: false,
    description: 'Try CareConnect AI risk-free. Perfect for getting started.',
    aiGenerationsLimit: 5,
  },
  starter: {
    name: 'Starter',
    monthlyPrice: 29,
    annualPrice: 290,
    monthlyPriceDisplay: '$29',
    annualPriceDisplay: '$290',
    annualMonthlyDisplay: '$24.17',
    features: [
      '50 AI content generations/month',
      '50 review responses/month',
      'Full Growth Score with insights',
      '5 website audits/month',
      '30-day marketing plan',
      'Email support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
    description: 'For solo practitioners ready to grow their online presence.',
  },
  pro: {
    name: 'Pro',
    monthlyPrice: 79,
    annualPrice: 790,
    monthlyPriceDisplay: '$79',
    annualPriceDisplay: '$790',
    annualMonthlyDisplay: '$65.83',
    features: [
      '200 AI content generations/month',
      '200 review responses/month',
      'Advanced Growth Score & tracking',
      'Unlimited website audits',
      'Monthly marketing plan refresh',
      'Content scheduling',
      'Priority email support',
    ],
    cta: 'Start Free Trial',
    highlight: true,
    description: 'For growing practices that want a complete marketing toolkit.',
  },
  practice: {
    name: 'Practice',
    monthlyPrice: 149,
    annualPrice: 1490,
    monthlyPriceDisplay: '$149',
    annualPriceDisplay: '$1,490',
    annualMonthlyDisplay: '$124.17',
    features: [
      '500 AI content generations/month',
      '500 review responses/month',
      'Everything in Pro, plus:',
      'Multi-provider support',
      'Custom brand voice training',
      'Competitor analysis',
      'Priority chat support',
    ],
    cta: 'Start Free Trial',
    highlight: false,
    description: 'For practices with multiple providers and complex needs.',
  },
  agency: {
    name: 'Agency',
    monthlyPrice: 299,
    annualPrice: 2990,
    monthlyPriceDisplay: '$299',
    annualPriceDisplay: '$2,990',
    annualMonthlyDisplay: '$249.17',
    features: [
      'Unlimited AI generations',
      'Unlimited review responses',
      'Everything in Practice, plus:',
      'White-label reports',
      'Client management dashboard',
      'API access',
      'Dedicated account manager',
    ],
    cta: 'Contact Us',
    highlight: false,
    description: 'For marketing agencies managing multiple healthcare clients.',
  },
};

type TierKey = keyof typeof PRICING_CONFIG;
type BillingPeriod = 'monthly' | 'annual';

const faqs = [
  {
    question: 'Can I switch plans anytime?',
    answer: 'Absolutely! You can upgrade, downgrade, or cancel your plan at any time. When you upgrade, you get immediate access to the new features. If you downgrade, the changes take effect at the end of your current billing period.',
  },
  {
    question: 'Is there a free trial?',
    answer: 'Yes! All paid plans come with a 14-day free trial. You will not be charged until the trial period ends, and you can cancel anytime before then.',
  },
  {
    question: 'How does the AI content generator work?',
    answer: 'You tell us about your practice — your specialty, your voice, your audience — and our AI creates tailored content that sounds like you. You can generate social media posts, blog articles, patient newsletters, and more. Every piece is editable before you use it.',
  },
  {
    question: 'What counts as an AI generation?',
    answer: 'Each time you click "Generate" and receive AI-created content (a social post, a blog article, a review response, etc.), it counts as one generation. You can edit and regenerate as many times as your plan allows.',
  },
  {
    question: 'Do you offer annual billing discounts?',
    answer: 'Yes! When you choose annual billing, you get two months free — that\'s a 17% discount. For example, the Pro plan at $79/month costs $948/year if paid monthly, but only $790/year with annual billing.',
  },
  {
    question: 'Can I use this for multiple practice locations?',
    answer: 'The Practice plan supports multiple locations and providers. For agencies managing multiple distinct healthcare clients, the Agency plan offers a client management dashboard and white-label capabilities.',
  },
  {
    question: 'What payment methods do you accept?',
    answer: 'We accept all major credit and debit cards through Stripe, our secure payment processor. Your payment information is never stored on our servers.',
  },
];

export default function PricingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [billingPeriod, setBillingPeriod] = useState<BillingPeriod>('monthly');
  const [loading, setLoading] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [cancelMessage, setCancelMessage] = useState(false);

  const userTier = (session?.user as any)?.subscriptionTier || 'free';

  useEffect(() => {
    if (searchParams.get('checkout') === 'cancelled') {
      setCancelMessage(true);
      const timer = setTimeout(() => setCancelMessage(false), 8000);
      return () => clearTimeout(timer);
    }
  }, [searchParams]);

  const handleSubscribe = async (tier: TierKey) => {
    if (tier === 'free') {
      if (status === 'authenticated') {
        router.push('/dashboard');
      } else {
        router.push('/signup');
      }
      return;
    }

    if (status !== 'authenticated') {
      router.push(`/signup?tier=${tier}&period=${billingPeriod}`);
      return;
    }

    // Agency tier: contact us
    if (tier === 'agency') {
      router.push('/contact');
      return;
    }

    setLoading(tier);

    try {
      const res = await fetch('/api/stripe/create-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tier, billingPeriod }),
      });

      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
        setLoading(null);
      }
    } catch (err) {
      console.error('Checkout error:', err);
      alert('Failed to initiate checkout. Please try again.');
      setLoading(null);
    }
  };

  const getPriceDisplay = (tier: TierKey): { price: string; period: string } => {
    const config = PRICING_CONFIG[tier];
    if (tier === 'free') {
      return { price: '$0', period: '/month' };
    }
    if (billingPeriod === 'annual') {
      return { price: (config as any).annualPriceDisplay, period: '/year' };
    }
    return { price: config.monthlyPriceDisplay, period: '/month' };
  };

  const getAnnualMonthlyDisplay = (tier: TierKey): string | null => {
    if (tier === 'free') return null;
    const config = PRICING_CONFIG[tier] as any;
    return config.annualMonthlyDisplay || null;
  };

  return (
    <div className="flex min-h-screen flex-col">
      {/* Navigation */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </Link>

          <div className="hidden items-center gap-8 md:flex">
            <Link href="/#features" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Features</Link>
            <Link href="/pricing" className="text-sm font-medium text-primary-600 transition-colors">Pricing</Link>
            <Link href="/blog" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Blog</Link>
            <Link href="/growth-score" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Free Growth Score</Link>
            {status === 'authenticated' ? (
              <Link href="/dashboard" className="btn-primary">Dashboard</Link>
            ) : (
              <>
                <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">Log In</Link>
                <Link href="/signup" className="btn-primary">Start Free</Link>
              </>
            )}
          </div>

          <button
            className="md:hidden rounded-lg p-2 text-gray-600 hover:bg-gray-100"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </nav>

        {mobileMenuOpen && (
          <div className="border-t border-gray-100 bg-white md:hidden">
            <div className="flex flex-col gap-2 px-4 py-4">
              <Link href="/#features" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Features</Link>
              <Link href="/pricing" className="rounded-lg px-3 py-2 text-sm font-medium text-primary-600 bg-primary-50" onClick={() => setMobileMenuOpen(false)}>Pricing</Link>
              <Link href="/blog" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Blog</Link>
              <Link href="/growth-score" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Free Growth Score</Link>
              {status === 'authenticated' ? (
                <Link href="/dashboard" className="btn-primary mt-2 w-full text-center">Dashboard</Link>
              ) : (
                <>
                  <Link href="/login" className="rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-primary-50 hover:text-primary-600" onClick={() => setMobileMenuOpen(false)}>Log In</Link>
                  <Link href="/signup" className="btn-primary mt-2 w-full text-center" onClick={() => setMobileMenuOpen(false)}>Start Free</Link>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main>
        {/* Cancel Message */}
        {cancelMessage && (
          <div className="bg-amber-50 border-b border-amber-200">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
              <p className="text-center text-sm font-medium text-amber-800">
                No worries — you can upgrade anytime. Take your time to find the right plan.
              </p>
            </div>
          </div>
        )}

        {/* Hero */}
        <section className="section-padding bg-gradient-to-br from-primary-50 via-white to-accent-50">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl">
                Simple, Transparent Pricing
              </h1>
              <p className="mt-4 text-lg text-gray-600">
                Start free and upgrade as you grow. All paid plans include a 14-day free trial — no credit card required to get started.
              </p>

              {/* Billing toggle */}
              <div className="mt-8 inline-flex items-center gap-3 rounded-full bg-white p-1 shadow-sm ring-1 ring-gray-200">
                <button
                  onClick={() => setBillingPeriod('monthly')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    billingPeriod === 'monthly'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Monthly
                </button>
                <button
                  onClick={() => setBillingPeriod('annual')}
                  className={`rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                    billingPeriod === 'annual'
                      ? 'bg-primary-500 text-white shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Annual
                  <span className="ml-1.5 inline-flex items-center rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-bold text-green-700">
                    Save 17%
                  </span>
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Cards */}
        <section className="section-padding bg-gray-50">
          <div className="section-inner">
            <div className="grid gap-6 lg:grid-cols-5">
              {Object.entries(PRICING_CONFIG).map(([key, tier]) => {
                const isCurrentPlan = userTier === key;
                const isLoading = loading === key;
                const { price, period } = getPriceDisplay(key as TierKey);
                const annualMonthly = getAnnualMonthlyDisplay(key as TierKey);

                return (
                  <div
                    key={key}
                    className={`relative flex flex-col rounded-2xl border p-6 transition-all ${
                      tier.highlight
                        ? 'border-primary-500 bg-white shadow-lg ring-2 ring-primary-500 scale-[1.02] lg:scale-[1.03]'
                        : 'border-gray-200 bg-white shadow-sm hover:shadow-md'
                    }`}
                  >
                    {tier.highlight && (
                      <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary-500 px-4 py-1 text-xs font-semibold text-white">
                        Most Popular
                      </div>
                    )}

                    {isCurrentPlan && (
                      <div className="absolute -top-3 right-2 rounded-full bg-green-500 px-3 py-1 text-xs font-semibold text-white">
                        Current Plan
                      </div>
                    )}

                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{tier.name}</h3>
                      <div className="mt-3 flex items-baseline gap-1">
                        <span className="text-3xl font-bold text-gray-900">{price}</span>
                        <span className="text-sm text-gray-500">{period}</span>
                      </div>
                      {annualMonthly && billingPeriod === 'annual' && (
                        <p className="mt-1 text-xs font-medium text-green-600">
                          ~{annualMonthly}/mo when billed annually
                        </p>
                      )}
                      <p className="mt-2 text-sm text-gray-600">{tier.description}</p>
                    </div>

                    <ul className="mt-6 flex-1 space-y-3">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex items-start gap-2 text-sm text-gray-600">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary-500" />
                          {feature}
                        </li>
                      ))}
                    </ul>

                    <button
                      onClick={() => handleSubscribe(key as TierKey)}
                      disabled={isLoading || isCurrentPlan}
                      className={`mt-6 flex w-full items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-center text-sm font-semibold transition-colors disabled:opacity-60 disabled:cursor-not-allowed ${
                        isCurrentPlan
                          ? 'bg-green-100 text-green-700 cursor-default'
                          : tier.highlight
                            ? 'bg-primary-500 text-white hover:bg-primary-600'
                            : 'bg-primary-50 text-primary-600 hover:bg-primary-100'
                      }`}
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Redirecting...
                        </>
                      ) : isCurrentPlan ? (
                        'Current Plan'
                      ) : (
                        tier.cta
                      )}
                    </button>
                  </div>
                );
              })}
            </div>

            <p className="mt-6 text-center text-sm text-gray-500">
              All paid plans include a 14-day free trial. Cancel anytime. No long-term contracts.
            </p>
          </div>
        </section>

        {/* FAQ */}
        <section className="section-padding bg-white">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 sm:text-4xl">
                Frequently Asked Questions
              </h2>
              <div className="mt-12 divide-y divide-gray-200">
                {faqs.map((faq, index) => (
                  <div key={index} className="py-5">
                    <button
                      className="flex w-full items-center justify-between text-left"
                      onClick={() => setOpenFaq(openFaq === index ? null : index)}
                    >
                      <span className="text-base font-semibold text-gray-900">{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
                      ) : (
                        <ChevronDown className="ml-4 h-5 w-5 flex-shrink-0 text-gray-400" />
                      )}
                    </button>
                    {openFaq === index && (
                      <p className="mt-3 text-base leading-7 text-gray-600">{faq.answer}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* Final CTA */}
        <section className="section-padding bg-gradient-to-br from-primary-600 to-primary-800">
          <div className="section-inner text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              Ready to grow your practice?
            </h2>
            <p className="mx-auto mt-4 max-w-2xl text-lg text-primary-100">
              Join healthcare practices across the country using CareConnect AI to save time,
              attract more patients, and build a stronger online presence.
            </p>
            <div className="mt-10">
              <button
                onClick={() => handleSubscribe('free')}
                className="btn-white px-8 py-4 text-base"
              >
                Start Free Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </button>
            </div>
            <p className="mt-6 text-sm text-primary-200">
              No credit card required • Set up in under 2 minutes
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">CareConnect<span className="text-primary-500">AI</span></span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/blog" className="hover:text-gray-700 transition-colors">Blog</Link>
              <Link href="/pricing" className="hover:text-gray-700 transition-colors">Pricing</Link>
              <Link href="/growth-score" className="hover:text-gray-700 transition-colors">Free Growth Score</Link>
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms</Link>
            </div>
            <p className="text-sm text-gray-400">
              &copy; {new Date().getFullYear()} CareConnect AI. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
