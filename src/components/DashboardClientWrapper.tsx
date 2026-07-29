'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { CheckCircle2, ArrowRight, CreditCard, X as XIcon, Loader2 } from 'lucide-react';

interface DashboardClientProps {
  children: React.ReactNode;
  userTier: string;
  userSubscriptionStatus: string;
  hasStripeCustomer: boolean;
}

export default function DashboardClientWrapper({
  children,
  userTier,
  userSubscriptionStatus,
  hasStripeCustomer,
}: DashboardClientProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [successBanner, setSuccessBanner] = useState<{ tier: string } | null>(null);
  const [portalResult, setPortalResult] = useState(false);
  const [portalLoading, setPortalLoading] = useState(false);

  useEffect(() => {
    const checkoutStatus = searchParams.get('checkout');
    const tier = searchParams.get('tier');
    const portalReturn = searchParams.get('portal');

    if (checkoutStatus === 'success' && tier) {
      const tierLabel = tier.charAt(0).toUpperCase() + tier.slice(1);
      setSuccessBanner({ tier: tierLabel });
    }

    if (portalReturn === 'return') {
      setPortalResult(true);
    }
  }, [searchParams]);

  const handleManageSubscription = async () => {
    setPortalLoading(true);
    try {
      const res = await fetch('/api/stripe/billing-portal');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
        setPortalLoading(false);
      }
    } catch (err) {
      alert('Failed to open billing portal. Please try again.');
      setPortalLoading(false);
    }
  };

  return (
    <>
      {/* Checkout Success Banner */}
      {successBanner && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="rounded-xl bg-green-50 border border-green-200 shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100">
                <CheckCircle2 className="h-5 w-5 text-green-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-green-800">
                  Welcome to {successBanner.tier}! 🎉
                </p>
                <p className="mt-0.5 text-sm text-green-700">
                  Your account has been upgraded. Enjoy your new features and higher limits!
                </p>
              </div>
              <button
                onClick={() => setSuccessBanner(null)}
                className="shrink-0 rounded-lg p-1 text-green-500 hover:text-green-700 hover:bg-green-100 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Portal Return Banner */}
      {portalResult && (
        <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 w-full max-w-lg px-4">
          <div className="rounded-xl bg-blue-50 border border-blue-200 shadow-lg p-4">
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-blue-100">
                <CreditCard className="h-5 w-5 text-blue-600" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-blue-800">Billing Portal</p>
                <p className="mt-0.5 text-sm text-blue-700">
                  Any changes you made in the billing portal will take effect shortly. Refresh if your plan hasn&apos;t updated yet.
                </p>
              </div>
              <button
                onClick={() => setPortalResult(false)}
                className="shrink-0 rounded-lg p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-100 transition-colors"
              >
                <XIcon className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Free Tier Upgrade Prompt */}
      {userTier === 'free' && (
        <div className="bg-gradient-to-r from-primary-500 to-primary-600">
          <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 lg:px-8">
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm font-medium text-white">
                You&apos;re on the Free plan.{' '}
                <span className="text-primary-100">Upgrade to unlock more content, unlimited audits, and advanced features.</span>
              </p>
              <Link
                href="/pricing"
                className="inline-flex items-center gap-1.5 rounded-lg bg-white px-4 py-1.5 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors shrink-0"
              >
                View Plans
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </div>
      )}

      {/* Main content */}
      {children}
    </>
  );
}
