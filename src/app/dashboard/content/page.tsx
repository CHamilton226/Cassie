'use client';

import { useState, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import {
  Sparkles,
  LogOut,
  PenLine,
  Copy,
  RefreshCw,
  Loader2,
  AlertCircle,
  CheckCircle2,
  ArrowLeft,
  Zap,
  ArrowUpRight,
  FileText,
} from 'lucide-react';

// ─── Constants ────────────────────────────────────────────────
const CONTENT_TYPES = [
  { value: 'Facebook Post', label: 'Facebook Post', icon: '📘' },
  { value: 'Instagram Caption', label: 'Instagram Caption', icon: '📸' },
  { value: 'Google Business Profile Post', label: 'Google Business Profile Post', icon: '📍' },
  { value: 'Blog Article', label: 'Blog Article', icon: '📝' },
  { value: 'Email Newsletter', label: 'Email Newsletter', icon: '📧' },
  { value: 'Service Description', label: 'Service Description', icon: '🏥' },
  { value: 'Patient Education Draft', label: 'Patient Education Draft', icon: '🎓' },
  { value: 'FAQ', label: 'FAQ', icon: '❓' },
  { value: 'Seasonal Campaign', label: 'Seasonal Campaign', icon: '🎯' },
  { value: 'Welcome Message', label: 'Welcome Message', icon: '👋' },
];

const CATEGORIES = [
  { value: 'Educational', label: 'Educational' },
  { value: 'Promotional', label: 'Promotional' },
  { value: 'Community', label: 'Community' },
  { value: 'Seasonal', label: 'Seasonal' },
  { value: 'Practice Updates', label: 'Practice Updates' },
  { value: 'Customer Acquisition', label: 'Customer Acquisition' },
  { value: 'Trust Building', label: 'Trust Building' },
];

const TONES = [
  { value: 'Professional', label: 'Professional' },
  { value: 'Friendly', label: 'Friendly' },
  { value: 'Warm', label: 'Warm' },
  { value: 'Reassuring', label: 'Reassuring' },
  { value: 'Educational', label: 'Educational' },
];

const LENGTHS = [
  { value: 'Short', label: 'Short', desc: '~100 words' },
  { value: 'Medium', label: 'Medium', desc: '~250 words' },
  { value: 'Long', label: 'Long', desc: '~500 words' },
];

// ─── Main Page Component ──────────────────────────────────────
export default function ContentGeneratorPage() {
  const { data: session, status } = useSession();

  // Form state
  const [contentType, setContentType] = useState('');
  const [category, setCategory] = useState('');
  const [tone, setTone] = useState('Professional');
  const [length, setLength] = useState('Medium');
  const [topic, setTopic] = useState('');
  const [additionalNotes, setAdditionalNotes] = useState('');

  // Results state
  const [generatedContent, setGeneratedContent] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorCode, setErrorCode] = useState<string | null>(null);
  const [usage, setUsage] = useState<{ used: number; limit: number; remaining: number } | null>(null);
  const [copied, setCopied] = useState(false);

  // Handle auth redirect
  if (status === 'unauthenticated') {
    redirect('/login');
  }

  // ─── Generate Handler ───────────────────────────────────────
  const handleGenerate = useCallback(async () => {
    // Reset states
    setError(null);
    setErrorCode(null);
    setGeneratedContent(null);
    setCopied(false);

    // Validate
    if (!contentType) {
      setError('Please select a content type.');
      return;
    }
    if (!category) {
      setError('Please select a category.');
      return;
    }
    if (!topic.trim() || topic.trim().length < 3) {
      setError('Please enter a topic (at least 3 characters).');
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch('/api/content/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contentType,
          category,
          tone,
          length,
          topic: topic.trim(),
          additionalNotes: additionalNotes.trim() || undefined,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || 'Failed to generate content.');
        setErrorCode(data.code || null);
        if (data.usage) {
          setUsage(data.usage);
        }
        return;
      }

      setGeneratedContent(data.content);
      setUsage(data.usage);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setIsLoading(false);
    }
  }, [contentType, category, tone, length, topic, additionalNotes]);

  // ─── Copy Handler ───────────────────────────────────────────
  const handleCopy = useCallback(async () => {
    if (!generatedContent) return;
    try {
      await navigator.clipboard.writeText(generatedContent);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback for older browsers
      const textarea = document.createElement('textarea');
      textarea.value = generatedContent;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [generatedContent]);

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
              <PenLine className="h-3 w-3" />
              Content Generator
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
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:px-8">
          {/* Page Title */}
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-1">
              <PenLine className="h-6 w-6 text-primary-600" />
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                AI Content Generator
              </h1>
            </div>
            <p className="text-sm text-gray-500">
              Create professional, healthcare-appropriate content for your practice in seconds.
            </p>
          </div>

          {/* Two-Column Layout */}
          <div className="grid gap-6 lg:grid-cols-5">
            {/* ── Left Panel: Configuration ─────────────────── */}
            <div className="lg:col-span-2">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6">
                <h2 className="text-base font-semibold text-gray-900 mb-5">Configure Your Content</h2>

                <div className="space-y-5">
                  {/* Content Type */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Content Type <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={contentType}
                      onChange={(e) => setContentType(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="">Select content type...</option>
                      {CONTENT_TYPES.map((ct) => (
                        <option key={ct.value} value={ct.value}>
                          {ct.icon} {ct.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      <option value="">Select category...</option>
                      {CATEGORIES.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Tone */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Tone</label>
                    <select
                      value={tone}
                      onChange={(e) => setTone(e.target.value)}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      disabled={isLoading}
                    >
                      {TONES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Length */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Length</label>
                    <div className="grid grid-cols-3 gap-2">
                      {LENGTHS.map((l) => (
                        <button
                          key={l.value}
                          type="button"
                          onClick={() => setLength(l.value)}
                          disabled={isLoading}
                          className={`rounded-lg border px-3 py-2 text-center text-sm font-medium transition-colors ${
                            length === l.value
                              ? 'border-primary-500 bg-primary-50 text-primary-700'
                              : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
                          } disabled:opacity-50`}
                        >
                          <div>{l.label}</div>
                          <div className="text-xs text-gray-400">{l.desc}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Topic */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Topic / Keywords <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      placeholder="e.g., flu season preparation tips"
                      maxLength={200}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Additional Notes */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">
                      Additional Notes <span className="text-gray-400 font-normal">(optional)</span>
                    </label>
                    <textarea
                      value={additionalNotes}
                      onChange={(e) => setAdditionalNotes(e.target.value)}
                      placeholder="Any specific points to include, offers to mention, or details about your practice..."
                      rows={3}
                      maxLength={500}
                      className="block w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 shadow-sm placeholder:text-gray-400 focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 disabled:opacity-50 resize-none"
                      disabled={isLoading}
                    />
                  </div>

                  {/* Generate Button */}
                  <button
                    type="button"
                    onClick={handleGenerate}
                    disabled={isLoading}
                    className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary-500 px-4 py-3 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-500 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      <>
                        <Zap className="h-4 w-4" />
                        Generate Content
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Usage Card (below config on mobile) */}
              {usage && (
                <div className="mt-4 rounded-xl border border-gray-200 bg-white p-4 shadow-sm lg:hidden">
                  <UsageDisplay used={usage.used} limit={usage.limit} remaining={usage.remaining} />
                </div>
              )}
            </div>

            {/* ── Right Panel: Results ──────────────────────── */}
            <div className="lg:col-span-3">
              <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm sm:p-6 min-h-[400px] flex flex-col">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-base font-semibold text-gray-900">Generated Content</h2>
                  {usage && (
                    <div className="hidden lg:block">
                      <UsageDisplay used={usage.used} limit={usage.limit} remaining={usage.remaining} />
                    </div>
                  )}
                </div>

                {/* Error State */}
                {error && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-red-100 mb-4">
                      <AlertCircle className="h-6 w-6 text-red-600" />
                    </div>

                    {/* API Key not configured */}
                    {errorCode === 'NO_API_KEY' ? (
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          AI Features Coming Soon
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mb-4">
                          Our AI engine is being configured. We&apos;re setting up the latest
                          language models to help you create amazing content for your practice.
                          Check back soon!
                        </p>
                        <Link
                          href="/dashboard"
                          className="inline-flex items-center gap-2 rounded-lg border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <ArrowLeft className="h-4 w-4" />
                          Back to Dashboard
                        </Link>
                      </>
                    ) : errorCode === 'LIMIT_REACHED' ? (
                      /* Limit Reached */
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Generation Limit Reached
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mb-2">{error}</p>
                        <p className="text-sm text-gray-400 max-w-md mb-4">
                          Upgrade your plan to unlock more AI generations and grow your practice faster.
                        </p>
                        <Link
                          href="/dashboard#pricing"
                          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                        >
                          View Plans
                          <ArrowUpRight className="h-4 w-4" />
                        </Link>
                      </>
                    ) : (
                      /* General Error */
                      <>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          Generation Failed
                        </h3>
                        <p className="text-sm text-gray-500 max-w-md mb-4">{error}</p>
                        <button
                          onClick={handleGenerate}
                          className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                        >
                          <RefreshCw className="h-4 w-4" />
                          Try Again
                        </button>
                      </>
                    )}
                  </div>
                )}

                {/* Loading State */}
                {isLoading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center p-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 mb-4">
                      <Loader2 className="h-6 w-6 text-primary-600 animate-spin" />
                    </div>
                    <p className="text-sm font-medium text-gray-700 mb-1">Generating your content...</p>
                    <p className="text-xs text-gray-400">
                      Crafting {contentType.toLowerCase()} with a {tone.toLowerCase()} tone
                    </p>
                    <div className="mt-6 w-full max-w-md space-y-3">
                      <div className="h-3 w-full animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-5/6 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-4/6 animate-pulse rounded-full bg-gray-100" />
                      <div className="h-3 w-3/6 animate-pulse rounded-full bg-gray-100" />
                    </div>
                  </div>
                )}

                {/* Result */}
                {generatedContent && !isLoading && !error && (
                  <div className="flex-1 flex flex-col">
                    <div className="flex-1 overflow-auto rounded-lg border border-gray-100 bg-gray-50 p-4 sm:p-5">
                      <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap font-sans leading-relaxed">
                        {generatedContent}
                      </div>
                    </div>

                    {/* Action bar */}
                    <div className="mt-4 flex flex-wrap items-center gap-2 pt-3 border-t border-gray-100">
                      <button
                        onClick={handleCopy}
                        className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                          copied
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'bg-white text-gray-700 border border-gray-200 hover:bg-gray-50'
                        }`}
                      >
                        {copied ? (
                          <>
                            <CheckCircle2 className="h-4 w-4" />
                            Copied!
                          </>
                        ) : (
                          <>
                            <Copy className="h-4 w-4" />
                            Copy to Clipboard
                          </>
                        )}
                      </button>
                      <button
                        onClick={handleGenerate}
                        disabled={isLoading}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors disabled:opacity-50"
                      >
                        <RefreshCw className="h-4 w-4" />
                        Regenerate
                      </button>
                    </div>

                    {/* Disclaimer */}
                    <div className="mt-3 rounded-lg bg-amber-50 border border-amber-100 p-3">
                      <p className="text-xs text-amber-700 leading-relaxed">
                        <strong>⚠️ Important:</strong> This content is generated by AI for general
                        informational purposes. Please review and approve all content before
                        publishing. This is not a substitute for professional medical advice.
                      </p>
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!generatedContent && !isLoading && !error && (
                  <div className="flex-1 flex flex-col items-center justify-center text-center p-6">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary-50 mb-4">
                      <FileText className="h-8 w-8 text-primary-400" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900 mb-1">
                      Ready to Create Content
                    </h3>
                    <p className="text-sm text-gray-500 max-w-sm">
                      Configure your content settings on the left, then click
                      <strong> Generate Content</strong> to create AI-powered posts,
                      articles, and more — tailored to your practice.
                    </p>
                    <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-gray-400">
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                        Professional tone
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                        Healthcare-compliant
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                        Practice-tailored
                      </div>
                      <div className="flex items-center gap-1.5">
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary-400" />
                        Ready to publish
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

// ─── Usage Display Component ──────────────────────────────────
function UsageDisplay({
  used,
  limit,
  remaining,
}: {
  used: number;
  limit: number;
  remaining: number;
}) {
  const percentage = Math.min(100, Math.round((used / limit) * 100));

  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-gray-500">
        <span className="font-semibold text-gray-700">{used}</span>
        <span className="mx-0.5">/</span>
        <span className="text-gray-400">{limit}</span>
        <span className="ml-1">generations used</span>
      </span>
      <div className="h-1.5 w-20 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all ${
            percentage > 90 ? 'bg-red-400' : percentage > 60 ? 'bg-yellow-400' : 'bg-primary-400'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      {remaining <= 3 && (
        <span className="text-xs font-medium text-red-500 whitespace-nowrap">
          {remaining} left
        </span>
      )}
    </div>
  );
}
