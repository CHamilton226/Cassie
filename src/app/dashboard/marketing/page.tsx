'use client';

import { useState, useCallback, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  LogOut,
  Target,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Zap,
  ArrowUpRight,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Calendar,
  Facebook,
  Instagram,
  Globe,
  FileText,
  Mail,
  Monitor,
  Trophy,
  PartyPopper,
  Circle,
  CheckCircle,
  PlayCircle,
  BarChart3,
  MessageSquareText,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────
const GOALS = [
  { value: 'Get more new customers', label: 'Get More New Customers', icon: '🎯', desc: 'Attract new patients to your practice' },
  { value: 'Increase local visibility', label: 'Increase Local Visibility', icon: '📍', desc: 'Get found by people searching in your area' },
  { value: 'Promote a specific service', label: 'Promote a Specific Service', icon: '📢', desc: 'Highlight a particular service or treatment' },
  { value: 'Build trust & credibility', label: 'Build Trust & Credibility', icon: '🛡️', desc: 'Establish your practice as a trusted authority' },
  { value: 'Increase online reviews', label: 'Increase Online Reviews', icon: '⭐', desc: 'Get more positive reviews from happy patients' },
  { value: 'Improve website conversions', label: 'Improve Website Conversions', icon: '📈', desc: 'Turn more website visitors into booked appointments' },
];

const PLATFORM_ICONS: Record<string, React.ComponentType<{ className?: string }>> = {
  'Facebook': Facebook,
  'Instagram': Instagram,
  'Google Business Profile': Globe,
  'Blog': FileText,
  'Email': Mail,
  'Website': Monitor,
};

const PLATFORM_COLORS: Record<string, string> = {
  'Facebook': 'bg-blue-50 text-blue-700 border-blue-200',
  'Instagram': 'bg-pink-50 text-pink-700 border-pink-200',
  'Google Business Profile': 'bg-green-50 text-green-700 border-green-200',
  'Blog': 'bg-purple-50 text-purple-700 border-purple-200',
  'Email': 'bg-amber-50 text-amber-700 border-amber-200',
  'Website': 'bg-indigo-50 text-indigo-700 border-indigo-200',
};

const STATUS_ORDER: Record<string, 'not_started' | 'in_progress' | 'completed'> = {
  not_started: 'in_progress',
  in_progress: 'completed',
  completed: 'not_started',
};

// ─── Types ────────────────────────────────────────────────────
interface DayPlan {
  day: number;
  objective: string;
  platform: string;
  contentIdea: string;
  contentDraft: string;
  callToAction: string;
  imageConcept: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface FullPlan {
  id: number;
  goal: string;
  targetService: string | null;
  days: DayPlan[];
  daysCompleted: number;
  createdAt: string;
}

// ─── Main Page Component ──────────────────────────────────────
export default function MarketingPlanPage() {
  const { data: session, status } = useSession();

  // Setup state
  const [goal, setGoal] = useState('');
  const [targetService, setTargetService] = useState('');

  // Plan state
  const [plan, setPlan] = useState<FullPlan | null>(null);
  const [expandedDays, setExpandedDays] = useState<Set<number>>(new Set([1])); // First day expanded by default

  // Loading/error state
  const [isGenerating, setIsGenerating] = useState(false);
  const [regeneratingDay, setRegeneratingDay] = useState<number | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [showCelebration, setShowCelebration] = useState(false);

  // Handle auth redirect
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // ─── Toggle day expansion ────────────────────────────────────
  const toggleDay = useCallback((day: number) => {
    setExpandedDays((prev) => {
      const next = new Set<number>();
      prev.forEach((d) => next.add(d));
      if (next.has(day)) {
        next.delete(day);
      } else {
        next.add(day);
      }
      return next;
    });
  }, []);

  // ─── Generate Plan Handler ───────────────────────────────────
  const handleGenerate = useCallback(async () => {
    setError(null);
    setErrorCode(null);
    setPlan(null);

    if (!goal) {
      setError('Please select a marketing goal.');
      return;
    }

    setIsGenerating(true);

    try {
      const response = await fetch('/api/marketing/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          goal,
          targetService: targetService.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate plan.');
        setErrorCode(data.code || null);
        if (data.usage) setUsage(data.usage);
        return;
      }

      setPlan(data.plan);
      setUsage(data.usage);
      setExpandedDays(new Set([1]));
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsGenerating(false);
    }
  }, [goal, targetService]);

  // ─── Update Day Status Handler ───────────────────────────────
  const handleUpdateDay = useCallback(async (day: number) => {
    if (!plan) return;

    const dayData = plan.days.find((d) => d.day === day);
    if (!dayData) return;

    const newStatus = STATUS_ORDER[dayData.status];

    // Optimistic update
    const updatedDays = plan.days.map((d) =>
      d.day === day ? { ...d, status: newStatus } : d
    );
    const newCompleted = updatedDays.filter((d) => d.status === 'completed').length;
    setPlan({ ...plan, days: updatedDays, daysCompleted: newCompleted });

    // Show celebration if all 30 completed
    if (newCompleted === 30) {
      setShowCelebration(true);
      setTimeout(() => setShowCelebration(false), 5000);
    }

    try {
      const response = await fetch('/api/marketing/update-day', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          day,
          status: newStatus,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Revert on error
        setPlan(plan);
        setError(data.error || 'Failed to update day status.');
        return;
      }

      setPlan(data.plan);
    } catch (err) {
      // Revert on error
      setPlan(plan);
      setError('Network error. Please try again.');
    }
  }, [plan]);

  // ─── Regenerate Day Handler ──────────────────────────────────
  const handleRegenerateDay = useCallback(async (day: number) => {
    if (!plan) return;

    setRegeneratingDay(day);
    setError(null);

    try {
      const response = await fetch('/api/marketing/regenerate-day', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          planId: plan.id,
          day,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to regenerate day.');
        setErrorCode(data.code || null);
        if (data.usage) setUsage(data.usage);
        return;
      }

      setPlan(data.plan);
      setUsage(data.usage);
      // Expand the regenerated day
      setExpandedDays((prev) => {
        const next = new Set<number>();
        prev.forEach((d) => next.add(d));
        next.add(day);
        return next;
      });
    } catch (err) {
      setError('Network error. Please try again.');
    } finally {
      setRegeneratingDay(null);
    }
  }, [plan]);

  // ─── Loading State ──────────────────────────────────────────
  if (status === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex items-center gap-3 text-gray-500">
          <Loader2 className="h-6 w-6 animate-spin" />
          <span className="text-sm">Loading...</span>
        </div>
      </div>
    );
  }

  // ─── Render ─────────────────────────────────────────────────
  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
              <Sparkles className="h-7 w-7 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <span className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-primary-50 px-3 py-0.5 text-xs font-medium text-primary-700">
              <Target className="h-3 w-3" />
              Marketing Plan
            </span>
          </div>

          <div className="flex items-center gap-4">
            <Link
              href="/dashboard"
              className="hidden sm:flex items-center gap-1.5 text-sm text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Dashboard
            </Link>
            <span className="hidden text-sm text-gray-600 sm:block">
              {session?.user?.name || session?.user?.email}
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
        <div className="mx-auto max-w-4xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <Target className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                30-Day Marketing Plan
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Generate a personalized, day-by-day marketing plan tailored to your practice goals.
            </p>
          </div>

          {/* ── Error Banner ────────────────────────────────── */}
          {error && !errorCode && (
            <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 flex items-start gap-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 shrink-0" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button
                onClick={() => setError(null)}
                className="text-red-400 hover:text-red-600"
              >
                ×
              </button>
            </div>
          )}

          {/* ── Celebration State ──────────────────────────── */}
          {showCelebration && (
            <div className="mb-6 rounded-xl border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-6 text-center animate-bounce-in">
              <PartyPopper className="h-10 w-10 text-green-500 mx-auto mb-2" />
              <h3 className="text-xl font-bold text-green-800 mb-1">
                🎉 All 30 Days Complete!
              </h3>
              <p className="text-sm text-green-600">
                Amazing work! You&apos;ve completed your entire 30-day marketing plan.
                Your practice is on the path to incredible growth!
              </p>
            </div>
          )}

          {/* ── Phase 1: Setup Form ────────────────────────── */}
          {!plan && (
            <div className="space-y-6">
              {/* Goal Selection Card */}
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-1">Choose Your Goal</h2>
                <p className="text-sm text-gray-500 mb-5">
                  Select the primary marketing objective for your 30-day plan.
                </p>

                {/* API Key not configured */}
                {errorCode === 'NO_API_KEY' ? (
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                      <Sparkles className="h-6 w-6 text-primary-500" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      AI Features Coming Soon
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mb-4">
                      Our AI engine is being configured. We&apos;re setting up the latest
                      language models to help you create amazing marketing plans.
                      Check back soon!
                    </p>
                    <Link
                      href="/dashboard"
                      className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                    >
                      <ArrowLeft className="h-4 w-4" />
                      Back to Dashboard
                    </Link>
                  </div>
                ) : errorCode === 'LIMIT_REACHED' ? (
                  <div className="flex flex-col items-center text-center py-8">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Generation Limit Reached
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mb-2">{error}</p>
                    <Link
                      href="/dashboard#pricing"
                      className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                    >
                      View Plans
                      <ArrowUpRight className="h-4 w-4" />
                    </Link>
                  </div>
                ) : (
                  <>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {GOALS.map((g) => (
                        <button
                          key={g.value}
                          type="button"
                          onClick={() => setGoal(g.value)}
                          disabled={isGenerating}
                          className={`flex items-start gap-3 rounded-xl border p-4 text-left transition-all ${
                            goal === g.value
                              ? 'border-primary-500 bg-primary-50 ring-1 ring-primary-500 shadow-sm'
                              : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          <span className="text-2xl shrink-0">{g.icon}</span>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{g.label}</p>
                            <p className="text-xs text-gray-500 mt-0.5">{g.desc}</p>
                          </div>
                          {goal === g.value && (
                            <CheckCircle2 className="h-5 w-5 text-primary-500 ml-auto shrink-0" />
                          )}
                        </button>
                      ))}
                    </div>

                    {/* Target Service (shown when "Promote a specific service" is selected) */}
                    {goal === 'Promote a specific service' && (
                      <div className="mt-5">
                        <label className="block text-sm font-medium text-gray-700 mb-1.5">
                          Which service do you want to promote?
                        </label>
                        <input
                          type="text"
                          value={targetService}
                          onChange={(e) => setTargetService(e.target.value)}
                          placeholder="e.g., Teeth Whitening, Physical Therapy, Wellness Exams"
                          maxLength={200}
                          className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                          disabled={isGenerating}
                        />
                      </div>
                    )}

                    {/* Generate Button */}
                    <div className="mt-6">
                      <button
                        type="button"
                        onClick={handleGenerate}
                        disabled={isGenerating || !goal}
                        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                      >
                        {isGenerating ? (
                          <>
                            <Loader2 className="h-4 w-4 animate-spin" />
                            Generating Your 30-Day Plan...
                          </>
                        ) : (
                          <>
                            <Zap className="h-4 w-4" />
                            Generate My 30-Day Plan
                          </>
                        )}
                      </button>
                    </div>

                    {/* Explanation */}
                    <div className="mt-4 rounded-lg bg-blue-50 border border-blue-100 p-4">
                      <p className="text-sm text-blue-700">
                        <strong>What you&apos;ll get:</strong> A complete 30-day plan with daily
                        marketing tasks, content ideas, ready-to-use copy, and suggested platforms
                        — all tailored to your practice and goals.
                      </p>
                    </div>
                  </>
                )}
              </div>

              {/* Loading state for generation */}
              {isGenerating && (
                <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
                  <div className="flex flex-col items-center py-8 text-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-100 mb-4">
                      <Loader2 className="h-8 w-8 text-primary-600 animate-spin" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">
                      Building Your Marketing Plan
                    </h3>
                    <p className="text-sm text-gray-500 max-w-md mb-6">
                      Our AI is crafting 30 days of personalized marketing tasks for your
                      {practiceTypeLabel(goal)} practice. This takes about 30-45 seconds...
                    </p>
                    <div className="w-full max-w-md space-y-3">
                      <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-5/6 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-4/6 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-3/6 animate-pulse rounded-full bg-gray-100" />
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ── Phase 2: The Plan ───────────────────────────── */}
          {plan && (
            <div className="space-y-6">
              {/* Progress & Controls Bar */}
              <div className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2">
                      <h2 className="text-sm font-semibold text-gray-700">
                        Progress: {plan.daysCompleted} of 30 days completed
                      </h2>
                      <span className="text-sm font-bold text-primary-600">
                        {Math.round((plan.daysCompleted / 30) * 100)}%
                      </span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-gray-100 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-primary-500 transition-all duration-500"
                        style={{ width: `${(plan.daysCompleted / 30) * 100}%` }}
                      />
                    </div>
                    {plan.daysCompleted === 30 && (
                      <div className="mt-2 flex items-center gap-2 text-sm text-green-600">
                        <Trophy className="h-4 w-4" />
                        <span className="font-medium">All done! Amazing work!</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={handleGenerate}
                      disabled={isGenerating}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                    >
                      <RefreshCw className="h-4 w-4" />
                      Regenerate Full Plan
                    </button>
                  </div>
                </div>

                {/* Plan meta */}
                <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-gray-100 text-xs text-gray-500">
                  <span className="inline-flex items-center gap-1">
                    <Target className="h-3.5 w-3.5 text-primary-500" />
                    Goal: <span className="font-medium text-gray-700">{plan.goal}</span>
                  </span>
                  {plan.targetService && (
                    <span className="inline-flex items-center gap-1">
                      Service: <span className="font-medium text-gray-700">{plan.targetService}</span>
                    </span>
                  )}
                  {usage && (
                    <span className="inline-flex items-center gap-1 ml-auto">
                      <span className="font-medium text-gray-700">{usage.used}</span>
                      <span>/</span>
                      <span className="text-gray-400">{usage.limit}</span>
                      <span>generations</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Day Cards */}
              <div className="space-y-3">
                {plan.days.map((day) => {
                  const isExpanded = expandedDays.has(day.day);
                  const isRegenerating = regeneratingDay === day.day;
                  const PlatformIcon = PLATFORM_ICONS[day.platform] || Globe;
                  const platformColor = PLATFORM_COLORS[day.platform] || 'bg-gray-50 text-gray-700 border-gray-200';

                  return (
                    <div
                      key={day.day}
                      className={`rounded-xl border bg-white shadow-sm transition-all ${
                        day.status === 'completed'
                          ? 'border-green-200 bg-green-50/30'
                          : day.status === 'in_progress'
                          ? 'border-amber-200 bg-amber-50/20'
                          : 'border-gray-200'
                      } ${isRegenerating ? 'opacity-70 pointer-events-none' : ''}`}
                    >
                      {/* Day Header — always visible */}
                      <div className="flex items-center gap-3 p-4 sm:p-5">
                        {/* Status Toggle */}
                        <button
                          onClick={() => handleUpdateDay(day.day)}
                          disabled={isRegenerating}
                          className="shrink-0 focus:outline-none"
                          title={`Status: ${day.status}`}
                        >
                          {day.status === 'completed' ? (
                            <CheckCircle className="h-6 w-6 text-green-500 hover:text-green-600 transition-colors" />
                          ) : day.status === 'in_progress' ? (
                            <PlayCircle className="h-6 w-6 text-amber-500 hover:text-amber-600 transition-colors" />
                          ) : (
                            <Circle className="h-6 w-6 text-gray-300 hover:text-gray-400 transition-colors" />
                          )}
                        </button>

                        {/* Day number */}
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-gray-100">
                          <span className="text-sm font-bold text-gray-700">{day.day}</span>
                        </div>

                        {/* Day info */}
                        <div className="min-w-0 flex-1">
                          <h3 className={`text-sm font-semibold truncate ${
                            day.status === 'completed' ? 'text-gray-500 line-through' : 'text-gray-900'
                          }`}>
                            {day.objective}
                          </h3>
                          <div className="flex items-center gap-2 mt-0.5">
                            <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${platformColor}`}>
                              <PlatformIcon className="h-3 w-3" />
                              {day.platform}
                            </span>
                            <span className="text-xs text-gray-400 truncate hidden sm:inline">
                              {day.contentIdea}
                            </span>
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-1 shrink-0">
                          <button
                            onClick={() => handleRegenerateDay(day.day)}
                            disabled={isRegenerating}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-primary-600 hover:bg-primary-50 transition-colors"
                            title="Regenerate this day"
                          >
                            {isRegenerating ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <RefreshCw className="h-4 w-4" />
                            )}
                          </button>
                          <button
                            onClick={() => toggleDay(day.day)}
                            className="rounded-lg p-1.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
                            title={isExpanded ? 'Collapse' : 'Expand'}
                          >
                            {isExpanded ? (
                              <ChevronUp className="h-5 w-5" />
                            ) : (
                              <ChevronDown className="h-5 w-5" />
                            )}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Content */}
                      {isExpanded && (
                        <div className="border-t border-gray-100 px-4 pb-4 sm:px-5 sm:pb-5 pt-4">
                          <div className="grid gap-4 sm:grid-cols-2">
                            {/* Content Draft */}
                            <div className="sm:col-span-2">
                              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-2">
                                Content Draft
                              </label>
                              <div className="rounded-lg border border-gray-100 bg-gray-50 p-4">
                                <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap font-sans leading-relaxed text-sm">
                                  {day.contentDraft}
                                </div>
                              </div>
                            </div>

                            {/* Call to Action */}
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                                Call to Action
                              </label>
                              <p className="text-sm font-medium text-primary-700 bg-primary-50 rounded-lg px-3 py-2 border border-primary-100">
                                {day.callToAction}
                              </p>
                            </div>

                            {/* Image Concept */}
                            <div>
                              <label className="block text-xs font-semibold uppercase tracking-wide text-gray-500 mb-1.5">
                                Suggested Image
                              </label>
                              <p className="text-sm text-gray-700 bg-gray-50 rounded-lg px-3 py-2 border border-gray-100">
                                {day.imageConcept}
                              </p>
                            </div>
                          </div>

                          {/* Disclaimer for this day */}
                          <div className="mt-4 rounded-lg bg-amber-50 border border-amber-100 p-3">
                            <p className="text-xs text-amber-700">
                              <strong>⚠️ Reminder:</strong> Review all content before publishing.
                              This is AI-generated and should be checked for accuracy and
                              appropriateness for your practice.
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              {/* Bottom disclaimer */}
              <div className="rounded-lg bg-amber-50 border border-amber-100 p-4 text-center">
                <p className="text-xs text-amber-700 leading-relaxed">
                  <strong>Important:</strong> This 30-day plan is AI-generated to provide marketing
                  ideas and content drafts. All content should be reviewed and approved by you before
                  publishing. We never provide medical advice, diagnoses, or treatment recommendations.
                </p>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}

// ─── Helper ──────────────────────────────────────────────────
function practiceTypeLabel(goal: string): string {
  if (goal.includes('visibility')) return 'local';
  if (goal.includes('reviews')) return 'online';
  if (goal.includes('website')) return 'digital';
  return 'healthcare';
}
