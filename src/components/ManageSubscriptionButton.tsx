'use client';

import { useState } from 'react';
import Link from 'next/link';
import { CreditCard, Loader2, ArrowRight } from 'lucide-react';

export function ManageSubscriptionButton() {
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/stripe/billing-portal');
      const data = await res.json();
      if (data.url) {
        window.location.href = data.url;
      } else {
        alert(data.error || 'Something went wrong. Please try again.');
        setLoading(false);
      }
    } catch (err) {
      alert('Failed to open billing portal. Please try again.');
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="mt-3 flex w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-60"
    >
      {loading ? (
        <>
          <Loader2 className="h-3.5 w-3.5 animate-spin" />
          Loading...
        </>
      ) : (
        <>
          <CreditCard className="h-3.5 w-3.5" />
          Manage Subscription
        </>
      )}
    </button>
  );
}

export function UpgradePrompt() {
  return (
    <div className="mt-3 pt-3 border-t border-gray-100">
      <Link
        href="/pricing"
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-50 px-3 py-2 text-xs font-semibold text-primary-700 hover:bg-primary-100 transition-colors"
      >
        Upgrade Plan
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
