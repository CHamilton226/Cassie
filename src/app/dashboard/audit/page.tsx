'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  LogOut,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  ArrowRight,
  SearchCheck,
  Globe,
  Eye,
  Shield,
  MousePointerClick,
  FileText,
  HeartHandshake,
  TrendingUp,
  Zap,
  Send,
  ChevronRight,
  Flame,
  Lightbulb,
  Gem,
  X,
  Phone,
  Mail,
  DollarSign,
  MessageSquare,
  User,
  Info,
  RefreshCw,
  ExternalLink,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────
const BUDGET_RANGES = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Not sure yet',
];

const CATEGORY_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  Website: Globe,
  Visibility: Eye,
  Trust: Shield,
  Conversion: MousePointerClick,
  Content: FileText,
  'Customer Experience': HeartHandshake,
};

const CATEGORY_COLORS: Record<string, string> = {
  Website: 'bg-blue-500',
  Visibility: 'bg-purple-500',
  Trust: 'bg-emerald-500',
  Conversion: 'bg-orange-500',
  Content: 'bg-indigo-500',
  'Customer Experience': 'bg-rose-500',
};

const CATEGORY_TRACK_COLORS: Record<string, string> = {
  Website: 'bg-blue-100',
  Visibility: 'bg-purple-100',
  Trust: 'bg-emerald-100',
  Conversion: 'bg-orange-100',
  Content: 'bg-indigo-100',
  'Customer Experience': 'bg-rose-100',
};

// ─── Type Definitions ─────────────────────────────────────────
interface CategoryScore {
  label: string;
  score: number;
  summary: string;
}

interface Recommendation {
  id: string;
  tier: 'critical' | 'important' | 'optimization';
  category: string;
  whatToFix: string;
  whyItMatters: string;
  howToFix: string;
}

interface AuditResults {
  overallScore: number;
  summaryText: string;
  categories: CategoryScore[];
  recommendations: Recommendation[];
  websiteUrl: string;
  practiceId: number;
  previousScore: number | null;
}

// ─── Helper Components ────────────────────────────────────────

function ScoreGauge({ score, size }: { score: number; size?: 'lg' | 'md' }) {
  const isLarge = size === 'lg';
  const dimensions = isLarge ? 180 : 64;
  const radius = isLarge ? 76 : 26;
  const strokeWidth = isLarge ? 10 : 4;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  const getColor = (s: number) => {
    if (s < 40) return { ring: '#ef4444', track: '#fecaca', text: 'text-red-500' };
    if (s < 70) return { ring: '#eab308', track: '#fef08a', text: 'text-yellow-500' };
    return { ring: '#22c55e', track: '#bbf7d0', text: 'text-green-500' };
  };

  const { ring, track, text } = getColor(score);

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg
        className="-rotate-90"
        width={dimensions}
        height={dimensions}
        viewBox={`0 0 ${dimensions} ${dimensions}`}
      >
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={track}
          strokeWidth={strokeWidth}
        />
        <circle
          cx={dimensions / 2}
          cy={dimensions / 2}
          r={radius}
          fill="none"
          stroke={ring}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          className="transition-all duration-1000 ease-out"
        />
      </svg>
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`font-extrabold ${isLarge ? 'text-5xl' : 'text-lg'} ${text}`}>
          {score}
        </span>
        {isLarge && (
          <span className="text-sm font-medium text-gray-400">/ 100</span>
        )}
      </div>
    </div>
  );
}

function CategoryBar({ category }: { category: CategoryScore }) {
  const Icon = CATEGORY_ICONS[category.label] || Globe;
  const color = CATEGORY_COLORS[category.label] || 'bg-gray-500';
  const trackColor = CATEGORY_TRACK_COLORS[category.label] || 'bg-gray-100';

  const getScoreColor = (s: number) => {
    if (s < 40) return 'text-red-600';
    if (s < 70) return 'text-yellow-600';
    return 'text-green-600';
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className={`flex h-7 w-7 items-center justify-center rounded-md ${trackColor}`}>
            <Icon className={`h-3.5 w-3.5 ${color.replace('bg-', 'text-')}`} />
          </div>
          <span className="text-sm font-semibold text-gray-800">{category.label}</span>
        </div>
        <span className={`text-sm font-bold ${getScoreColor(category.score)}`}>
          {category.score}
        </span>
      </div>
      <div className="h-2 w-full rounded-full bg-gray-100">
        <div
          className={`h-2 rounded-full transition-all duration-700 ease-out ${color}`}
          style={{ width: `${category.score}%` }}
        />
      </div>
      <p className="text-xs text-gray-500">{category.summary}</p>
    </div>
  );
}

function RecommendationCard({ rec }: { rec: Recommendation }) {
  const tierConfig = {
    critical: {
      icon: Flame,
      label: 'Fix First',
      bg: 'bg-red-50',
      border: 'border-red-200',
      iconBg: 'bg-red-100',
      iconColor: 'text-red-600',
      badge: 'bg-red-100 text-red-700',
    },
    important: {
      icon: Lightbulb,
      label: 'Improve Next',
      bg: 'bg-yellow-50',
      border: 'border-yellow-200',
      iconBg: 'bg-yellow-100',
      iconColor: 'text-yellow-600',
      badge: 'bg-yellow-100 text-yellow-700',
    },
    optimization: {
      icon: Gem,
      label: 'Nice to Have',
      bg: 'bg-green-50',
      border: 'border-green-200',
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      badge: 'bg-green-100 text-green-700',
    },
  };

  const config = tierConfig[rec.tier];
  const Icon = config.icon;

  return (
    <div className={`rounded-xl border ${config.border} ${config.bg} p-5`}>
      <div className="flex items-start gap-4">
        <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${config.iconBg}`}>
          <Icon className={`h-4.5 w-4.5 ${config.iconColor}`} />
        </div>
        <div className="min-w-0 flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${config.badge}`}>
              {config.label}
            </span>
            <span className="text-xs font-medium text-gray-500">{rec.category}</span>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">What to fix</h4>
            <p className="mt-0.5 text-sm text-gray-700">{rec.whatToFix}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">Why it matters</h4>
            <p className="mt-0.5 text-sm text-gray-600">{rec.whyItMatters}</p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900">How to fix it</h4>
            <p className="mt-0.5 text-sm text-gray-600">{rec.howToFix}</p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page Component ──────────────────────────────────────
export default function AuditPage() {
  const { data: session, status } = useSession();

  // Input state
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [urlError, setUrlError] = useState<string | null>(null);

  // Results state
  const [results, setResults] = useState<AuditResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);

  // Upsell state
  const [upsellChoice, setUpsellChoice] = useState<string | null>(null);
  const [leadForm, setLeadForm] = useState({
    contactName: '',
    email: '',
    phone: '',
    budgetRange: '',
    message: '',
  });
  const [leadFormError, setLeadFormError] = useState<string | null>(null);
  const [leadFormLoading, setLeadFormLoading] = useState(false);
  const [leadFormSuccess, setLeadFormSuccess] = useState(false);

  // Handle auth redirect
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  const userEmail = session?.user?.email || '';
  const userName = session?.user?.name || '';

  // ─── Run Audit ──────────────────────────────────────────────
  const handleRunAudit = useCallback(async () => {
    setUrlError(null);
    setError(null);
    setErrorCode(null);
    setResults(null);
    setUpsellChoice(null);
    setLeadFormSuccess(false);

    // Validate URL
    const trimmed = websiteUrl.trim();
    if (!trimmed) {
      setUrlError('Please enter your practice website URL.');
      return;
    }

    let validUrl: string;
    try {
      const parsed = new URL(trimmed.startsWith('http') ? trimmed : `https://${trimmed}`);
      if (!parsed.hostname.includes('.')) {
        throw new Error('Invalid URL');
      }
      validUrl = trimmed.startsWith('http') ? trimmed : `https://${trimmed}`;
    } catch {
      setUrlError('Please enter a valid website URL (e.g., mypractice.com).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/audit/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: validUrl }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Audit failed. Please try again.');
        setErrorCode(data.code || null);
        return;
      }

      setResults(data);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [websiteUrl]);

  // ─── Submit Lead Form ───────────────────────────────────────
  const handleSubmitLead = useCallback(async () => {
    setLeadFormError(null);

    if (!leadForm.contactName.trim()) {
      setLeadFormError('Please enter your name.');
      return;
    }
    if (!leadForm.email.trim()) {
      setLeadFormError('Please enter your email.');
      return;
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(leadForm.email.trim())) {
      setLeadFormError('Please enter a valid email address.');
      return;
    }

    setLeadFormLoading(true);

    try {
      const response = await fetch('/api/leads/website', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceId: results!.practiceId,
          contactName: leadForm.contactName.trim(),
          email: leadForm.email.trim().toLowerCase(),
          phone: leadForm.phone.trim() || undefined,
          budgetRange: leadForm.budgetRange || undefined,
          message: leadForm.message.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setLeadFormError(data.error || 'Something went wrong. Please try again.');
        return;
      }

      setLeadFormSuccess(true);
    } catch {
      setLeadFormError('Network error. Please try again.');
    } finally {
      setLeadFormLoading(false);
    }
  }, [leadForm, results]);

  // ─── Auth Loading State ─────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <Loader2 className="h-8 w-8 animate-spin text-primary-500" />
      </div>
    );
  }

  // Derive display values
  const hasResults = results !== null;
  const hasPreviousScore = results?.previousScore !== null && results?.previousScore !== 0;
  const criticalRecs = results?.recommendations.filter((r) => r.tier === 'critical') || [];
  const importantRecs = results?.recommendations.filter((r) => r.tier === 'important') || [];
  const optimizationRecs = results?.recommendations.filter((r) => r.tier === 'optimization') || [];
  const overallScore = results?.overallScore ?? 0;

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </Link>
            <span className="text-gray-300 hidden sm:block">|</span>
            <Link href="/dashboard/audit" className="flex items-center gap-3 shrink-0">
              <Sparkles className="h-7 w-7 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </Link>
          </div>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {userName || userEmail}
            </span>
            <Link
              href="/api/auth/signout"
              className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Sign Out</span>
            </Link>
          </div>
        </div>
      </header>

      {/* ── Main Content ───────────────────────────────────── */}
      <main className="flex-1">
        <div className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
          {/* Page Title (when no results yet) */}
          {!hasResults && (
            <div className="mb-8 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-4">
                <SearchCheck className="h-8 w-8 text-primary-600" />
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Website Growth Audit
              </h1>
              <p className="mt-2 text-sm text-gray-500 max-w-xl mx-auto">
                Get a comprehensive analysis of your practice website. We&apos;ll score your online
                presence across 6 key categories and give you a prioritized action plan to attract
                more patients.
              </p>
            </div>
          )}

          {/* Results Title (when results exist) */}
          {hasResults && (
            <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                  Website Growth Audit
                </h1>
                <p className="mt-1 flex items-center gap-2 text-sm text-gray-500">
                  <Globe className="h-3.5 w-3.5" />
                  <a
                    href={results.websiteUrl.startsWith('http') ? results.websiteUrl : `https://${results.websiteUrl}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-primary-600 hover:underline inline-flex items-center gap-1"
                  >
                    {results.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </p>
              </div>
              <button
                onClick={() => {
                  setResults(null);
                  setUpsellChoice(null);
                  setLeadFormSuccess(false);
                  setError(null);
                  setErrorCode(null);
                  setLeadForm({ contactName: '', email: '', phone: '', budgetRange: '', message: '' });
                }}
                className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                <RefreshCw className="h-4 w-4" />
                Run New Audit
              </button>
            </div>
          )}

          {/* ─── No API Key State ───────────────────────────── */}
          {errorCode === 'NO_API_KEY' && !hasResults && (
            <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-8 text-center shadow-sm sm:p-12">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-100">
                <Zap className="h-8 w-8 text-primary-500" />
              </div>
              <h2 className="mt-4 text-xl font-bold text-gray-900">AI Features Coming Soon</h2>
              <p className="mt-2 text-sm text-gray-600 max-w-md mx-auto">
                Our AI engine is being configured. Website audits will be available shortly.
                Check back soon!
              </p>
              <Link
                href="/dashboard"
                className="mt-4 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-5 py-2.5 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
              >
                <ArrowLeft className="h-4 w-4" />
                Back to Dashboard
              </Link>
            </div>
          )}

          {/* ─── Phase 1: Input Form ────────────────────────── */}
          {!hasResults && !errorCode && (
            <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
              {/* Previous Score Banner */}
              {hasPreviousScore && (
                <div className="mb-6 flex items-center gap-3 rounded-xl bg-primary-50 border border-primary-200 p-4">
                  <TrendingUp className="h-5 w-5 text-primary-600 shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-primary-800">
                      Previous Score: {results!.previousScore}/100
                    </p>
                    <p className="text-xs text-primary-600">
                      Run a new audit to see if you&apos;ve improved
                    </p>
                  </div>
                </div>
              )}

              {/* What we analyze */}
              <div className="mb-6">
                <h2 className="text-base font-semibold text-gray-900 mb-1">What we analyze</h2>
                <p className="text-sm text-gray-500 mb-4">
                  Our AI examines your website across all the factors that drive patient growth:
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {[
                    { icon: Globe, label: 'Homepage Clarity' },
                    { icon: MousePointerClick, label: 'CTAs & Conversion' },
                    { icon: Eye, label: 'Mobile Experience' },
                    { icon: Shield, label: 'Trust Signals' },
                    { icon: FileText, label: 'Content Quality' },
                    { icon: HeartHandshake, label: 'New Patient UX' },
                    { icon: Eye, label: 'Local SEO' },
                    { icon: MessageSquare, label: 'Review Strategy' },
                    { icon: SearchCheck, label: 'Accessibility' },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-2 rounded-lg border border-gray-100 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-600"
                    >
                      <item.icon className="h-3.5 w-3.5 text-primary-500 shrink-0" />
                      {item.label}
                    </div>
                  ))}
                </div>
              </div>

              {/* URL Input */}
              <div>
                <label htmlFor="websiteUrl" className="block text-sm font-semibold text-gray-900 mb-1">
                  Your Practice Website
                </label>
                <p className="text-xs text-gray-500 mb-3">
                  Enter the full URL of your practice website (e.g., myfamilypractice.com)
                </p>
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="flex-1 relative">
                    <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                      <Globe className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      id="websiteUrl"
                      value={websiteUrl}
                      onChange={(e) => {
                        setWebsiteUrl(e.target.value);
                        if (urlError) setUrlError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !isLoading) handleRunAudit();
                      }}
                      placeholder="myfamilypractice.com"
                      disabled={isLoading}
                      className={`block w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                        urlError
                          ? 'border-red-300 bg-red-50 text-red-900 placeholder-red-400'
                          : 'border-gray-300 bg-white text-gray-900 placeholder-gray-400 hover:border-gray-400'
                      }`}
                    />
                    {urlError && (
                      <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                        <AlertCircle className="h-3 w-3" />
                        {urlError}
                      </p>
                    )}
                  </div>
                  <button
                    onClick={handleRunAudit}
                    disabled={isLoading}
                    className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors sm:shrink-0"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Analyzing...
                      </>
                    ) : (
                      <>
                        <SearchCheck className="h-4 w-4" />
                        Run Free Audit
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Loading State */}
              {isLoading && (
                <div className="mt-8 flex flex-col items-center justify-center rounded-xl border border-gray-200 bg-gray-50 py-10">
                  <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                  <p className="mt-4 text-sm font-medium text-gray-700">
                    Analyzing your website...
                  </p>
                  <p className="mt-1 text-xs text-gray-500">
                    This usually takes about 15–30 seconds
                  </p>
                  <div className="mt-4 flex items-center gap-1.5">
                    <span className="flex h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:0ms]" />
                    <span className="flex h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:150ms]" />
                    <span className="flex h-2 w-2 animate-bounce rounded-full bg-primary-400 [animation-delay:300ms]" />
                  </div>
                </div>
              )}

              {/* Error State */}
              {error && !isLoading && (
                <div className="mt-6 flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 p-4">
                  <AlertCircle className="h-5 w-5 text-red-500 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-red-800">{error}</p>
                    <button
                      onClick={handleRunAudit}
                      className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-red-700 hover:text-red-800"
                    >
                      <RefreshCw className="h-3.5 w-3.5" />
                      Try Again
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ─── Phase 2: Results ───────────────────────────── */}
          {hasResults && (
            <div className="space-y-8">
              {/* Score & Summary */}
              <div className="rounded-2xl border border-gray-200 bg-white p-6 shadow-sm sm:p-8">
                <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start">
                  {/* Large Score Gauge */}
                  <div className="shrink-0">
                    <ScoreGauge score={overallScore} size="lg" />
                    <p className="mt-1 text-center text-xs font-medium text-gray-400">
                      Practice Growth Score
                    </p>
                  </div>

                  {/* Summary */}
                  <div className="flex-1 text-center sm:text-left">
                    <div className="flex items-center justify-center sm:justify-start gap-2 mb-2">
                      <TrendingUp className="h-5 w-5 text-primary-500" />
                      <h2 className="text-lg font-bold text-gray-900">Your Audit Results</h2>
                    </div>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {results.summaryText}
                    </p>

                    {/* Score comparison */}
                    {hasPreviousScore && results.previousScore! !== overallScore && (
                      <div className="mt-4 inline-flex items-center gap-2 rounded-full border border-gray-200 bg-gray-50 px-3 py-1.5 text-xs font-medium">
                        <span className="text-gray-500">Previous: {results.previousScore}</span>
                        <ArrowRight className="h-3 w-3 text-gray-400" />
                        <span
                          className={
                            overallScore > results.previousScore!
                              ? 'text-green-600'
                              : 'text-red-600'
                          }
                        >
                          {overallScore > results.previousScore! ? '↑' : '↓'}{' '}
                          {Math.abs(overallScore - results.previousScore!)} pts
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Category Breakdown Grid */}
                <div className="mt-8 pt-6 border-t border-gray-100">
                  <h3 className="text-sm font-semibold text-gray-900 mb-4">
                    Category Breakdown
                  </h3>
                  <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {results.categories.map((cat) => (
                      <CategoryBar key={cat.label} category={cat} />
                    ))}
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <SearchCheck className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-bold text-gray-900">
                    Recommendations ({results.recommendations.length})
                  </h2>
                </div>

                <div className="space-y-4">
                  {/* Critical — Fix First */}
                  {criticalRecs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Flame className="h-4 w-4 text-red-500" />
                        <h3 className="text-sm font-bold text-red-700 uppercase tracking-wide">
                          Fix First ({criticalRecs.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {criticalRecs.map((rec) => (
                          <RecommendationCard key={rec.id} rec={rec} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Important — Improve Next */}
                  {importantRecs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Lightbulb className="h-4 w-4 text-yellow-500" />
                        <h3 className="text-sm font-bold text-yellow-700 uppercase tracking-wide">
                          Improve Next ({importantRecs.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {importantRecs.map((rec) => (
                          <RecommendationCard key={rec.id} rec={rec} />
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Optimization — Nice to Have */}
                  {optimizationRecs.length > 0 && (
                    <div>
                      <div className="flex items-center gap-2 mb-3">
                        <Gem className="h-4 w-4 text-green-500" />
                        <h3 className="text-sm font-bold text-green-700 uppercase tracking-wide">
                          Nice to Have ({optimizationRecs.length})
                        </h3>
                      </div>
                      <div className="space-y-3">
                        {optimizationRecs.map((rec) => (
                          <RecommendationCard key={rec.id} rec={rec} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* ─── Done For You Upsell ────────────────────── */}
              <div className="rounded-2xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-6 shadow-sm sm:p-8">
                <div className="text-center mb-6">
                  <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-3">
                    <Zap className="h-6 w-6 text-primary-600" />
                  </div>
                  <h2 className="text-xl font-bold text-gray-900">
                    Want us to fix these issues for you?
                  </h2>
                  <p className="mt-1 text-sm text-gray-600 max-w-lg mx-auto">
                    Choose how you&apos;d like to move forward with your website improvements.
                  </p>
                </div>

                {!upsellChoice && (
                  <div className="grid gap-3 sm:grid-cols-3">
                    {/* DIY */}
                    <button
                      onClick={() => setUpsellChoice('diy')}
                      className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors mb-3">
                        <FileText className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">DIY</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        I&apos;ll follow the recommendations myself
                      </p>
                    </button>

                    {/* Guided */}
                    <button
                      onClick={() => setUpsellChoice('guided')}
                      className="group flex flex-col items-center rounded-xl border border-gray-200 bg-white p-5 text-center shadow-sm transition-all hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 group-hover:bg-primary-50 transition-colors mb-3">
                        <Lightbulb className="h-5 w-5 text-gray-600 group-hover:text-primary-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Guided</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Show me step-by-step instructions
                      </p>
                    </button>

                    {/* Done For You */}
                    <button
                      onClick={() => setUpsellChoice('done-for-you')}
                      className="group flex flex-col items-center rounded-xl border-2 border-primary-300 bg-primary-50/50 p-5 text-center shadow-sm transition-all hover:border-primary-400 hover:shadow-md hover:-translate-y-0.5"
                    >
                      <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary-100 mb-3">
                        <CheckCircle2 className="h-5 w-5 text-primary-600" />
                      </div>
                      <h3 className="text-sm font-semibold text-gray-900">Done For You</h3>
                      <p className="mt-1 text-xs text-gray-500">
                        Request professional help from our team
                      </p>
                      <span className="mt-2 inline-flex items-center rounded-full bg-primary-100 px-2 py-0.5 text-xs font-semibold text-primary-700">
                        Popular
                      </span>
                    </button>
                  </div>
                )}

                {/* DIY Confirmation */}
                {upsellChoice === 'diy' && (
                  <div className="text-center rounded-xl border border-green-200 bg-green-50 p-6">
                    <CheckCircle2 className="h-10 w-10 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-800">Great choice!</h3>
                    <p className="mt-1 text-sm text-green-700">
                      Your audit recommendations are above. Start with the &quot;Fix First&quot; items
                      and work your way down. Come back anytime to re-audit your site.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <Link
                        href="/dashboard/content"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        <FileText className="h-4 w-4" />
                        Create Content
                      </Link>
                      <button
                        onClick={() => setUpsellChoice(null)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-semibold text-green-700 hover:bg-green-50 transition-colors"
                      >
                        Change Choice
                      </button>
                    </div>
                  </div>
                )}

                {/* Guided Confirmation */}
                {upsellChoice === 'guided' && (
                  <div className="text-center rounded-xl border border-yellow-200 bg-yellow-50 p-6">
                    <Lightbulb className="h-10 w-10 text-yellow-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-yellow-800">Step-by-step guidance</h3>
                    <p className="mt-1 text-sm text-yellow-700">
                      Each recommendation includes a &quot;How to fix it&quot; section with concrete steps.
                      Start with your first recommendation under &quot;Fix First&quot; and follow the
                      instructions. Need more help? You can always request professional assistance.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <button
                        onClick={() => setUpsellChoice('done-for-you')}
                        className="inline-flex items-center gap-1.5 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white hover:bg-primary-600 transition-colors"
                      >
                        <Send className="h-4 w-4" />
                        Get Professional Help Instead
                      </button>
                      <button
                        onClick={() => setUpsellChoice(null)}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-yellow-300 bg-white px-4 py-2 text-sm font-semibold text-yellow-700 hover:bg-yellow-50 transition-colors"
                      >
                        Change Choice
                      </button>
                    </div>
                  </div>
                )}

                {/* Done For You — Lead Form */}
                {upsellChoice === 'done-for-you' && !leadFormSuccess && (
                  <div className="rounded-xl border border-primary-200 bg-white p-6">
                    <h3 className="text-base font-bold text-gray-900 mb-1">
                      Request Professional Help
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Fill out the form below and our team will reach out to discuss how we can
                      help improve your website.
                    </p>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <div>
                        <label
                          htmlFor="contactName"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Your Name <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <User className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="text"
                            id="contactName"
                            value={leadForm.contactName}
                            onChange={(e) =>
                              setLeadForm({ ...leadForm, contactName: e.target.value })
                            }
                            placeholder="Dr. Jane Smith"
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="email"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Email <span className="text-red-500">*</span>
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Mail className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="email"
                            id="email"
                            value={leadForm.email}
                            onChange={(e) =>
                              setLeadForm({ ...leadForm, email: e.target.value })
                            }
                            placeholder="jane@mypractice.com"
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="phone"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Phone
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <Phone className="h-4 w-4 text-gray-400" />
                          </div>
                          <input
                            type="tel"
                            id="phone"
                            value={leadForm.phone}
                            onChange={(e) =>
                              setLeadForm({ ...leadForm, phone: e.target.value })
                            }
                            placeholder="(555) 123-4567"
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
                          />
                        </div>
                      </div>

                      <div>
                        <label
                          htmlFor="budgetRange"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Budget Range
                        </label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                            <DollarSign className="h-4 w-4 text-gray-400" />
                          </div>
                          <select
                            id="budgetRange"
                            value={leadForm.budgetRange}
                            onChange={(e) =>
                              setLeadForm({ ...leadForm, budgetRange: e.target.value })
                            }
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 bg-white"
                          >
                            <option value="">Select a range</option>
                            {BUDGET_RANGES.map((range) => (
                              <option key={range} value={range}>
                                {range}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="sm:col-span-2">
                        <label
                          htmlFor="message"
                          className="block text-sm font-medium text-gray-700 mb-1"
                        >
                          Message (optional)
                        </label>
                        <div className="relative">
                          <div className="absolute top-2.5 left-0 flex items-start pl-3 pointer-events-none">
                            <MessageSquare className="h-4 w-4 text-gray-400" />
                          </div>
                          <textarea
                            id="message"
                            rows={3}
                            value={leadForm.message}
                            onChange={(e) =>
                              setLeadForm({ ...leadForm, message: e.target.value })
                            }
                            placeholder="Tell us about your goals for the website..."
                            className="block w-full rounded-lg border border-gray-300 py-2.5 pl-10 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 resize-none"
                          />
                        </div>
                      </div>
                    </div>

                    {leadFormError && (
                      <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                        <AlertCircle className="h-4 w-4 shrink-0" />
                        {leadFormError}
                      </div>
                    )}

                    <div className="mt-6 flex items-center justify-between">
                      <button
                        onClick={() => setUpsellChoice(null)}
                        className="text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
                      >
                        ← Choose different option
                      </button>
                      <button
                        onClick={handleSubmitLead}
                        disabled={leadFormLoading}
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        {leadFormLoading ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Sending...
                          </>
                        ) : (
                          <>
                            <Send className="h-4 w-4" />
                            Submit Request
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Lead Form Success */}
                {upsellChoice === 'done-for-you' && leadFormSuccess && (
                  <div className="text-center rounded-xl border border-green-200 bg-green-50 p-6">
                    <CheckCircle2 className="h-12 w-12 text-green-500 mx-auto mb-3" />
                    <h3 className="text-lg font-bold text-green-800">Request Received!</h3>
                    <p className="mt-1 text-sm text-green-700 max-w-md mx-auto">
                      Thank you! Our team will reach out to discuss how we can help improve your
                      website. You&apos;ll hear from us within 1–2 business days.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center justify-center gap-2">
                      <Link
                        href="/dashboard"
                        className="inline-flex items-center gap-1.5 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white hover:bg-green-700 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                        Back to Dashboard
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Bottom spacing */}
          <div className="h-12" />
        </div>
      </main>
    </div>
  );
}
