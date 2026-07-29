'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  Sparkles,
  Building2,
  Stethoscope,
  MapPin,
  Globe,
  Mail,
  ArrowRight,
  Loader2,
  AlertCircle,
  CheckCircle2,
  TrendingUp,
  Globe2,
  ShieldCheck,
  Zap,
  RefreshCw,
} from 'lucide-react';

const PRACTICE_TYPES = [
  'Primary Care',
  'Dental',
  'Physical Therapy',
  'Chiropractic',
  'Home Health',
  'Hospice',
  'Senior Care',
  'Mental Health',
  'Specialty Clinic',
  'Other',
] as const;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

interface CategoryScore {
  label: string;
  score: number;
  summary: string;
}

interface GrowthScoreResult {
  overallScore: number;
  categories: CategoryScore[];
  recommendations: string[];
}

type PageState = 'form' | 'loading' | 'results' | 'error';

export default function GrowthScorePage() {
  const [pageState, setPageState] = useState<PageState>('form');
  const [error, setError] = useState('');
  const [result, setResult] = useState<GrowthScoreResult | null>(null);

  // Form fields
  const [practiceName, setPracticeName] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [practiceType, setPracticeType] = useState('');
  const [city, setCity] = useState('');
  const [state, setState] = useState('');
  const [email, setEmail] = useState('');

  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const errors: Record<string, string> = {};
    if (!practiceName.trim()) errors.practiceName = 'Practice name is required';
    if (!websiteUrl.trim()) errors.websiteUrl = 'Website URL is required';
    else if (!/^https?:\/\/.+\..+/.test(websiteUrl.trim()) && !/^[\w.-]+\.[a-z]{2,}$/i.test(websiteUrl.trim())) {
      errors.websiteUrl = 'Please enter a valid URL (e.g., mypractice.com)';
    }
    if (!practiceType) errors.practiceType = 'Please select your practice type';
    if (!city.trim()) errors.city = 'City is required';
    if (!state) errors.state = 'Please select your state';
    if (!email.trim()) errors.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) errors.email = 'Please enter a valid email';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!validate()) return;

    setPageState('loading');
    window.scrollTo({ top: 0, behavior: 'smooth' });

    try {
      const res = await fetch('/api/growth-score', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          practiceName: practiceName.trim(),
          websiteUrl: websiteUrl.trim(),
          practiceType,
          city: city.trim(),
          state,
          email: email.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Something went wrong. Please try again.');
      }

      setResult({
        overallScore: data.overallScore,
        categories: data.categories,
        recommendations: data.recommendations,
      });
      setPageState('results');
    } catch (err: any) {
      setError(err.message || 'An unexpected error occurred.');
      setPageState('error');
    }
  };

  const handleTryAgain = () => {
    setError('');
    setPageState('form');
  };

  const getScoreColor = (score: number) => {
    if (score >= 70) return { ring: 'ring-green-400', bg: 'bg-green-500', text: 'text-green-700', label: 'Strong' };
    if (score >= 45) return { ring: 'ring-yellow-400', bg: 'bg-yellow-500', text: 'text-yellow-700', label: 'Growing' };
    return { ring: 'ring-red-400', bg: 'bg-red-500', text: 'text-red-700', label: 'Needs Work' };
  };

  const getCategoryIcon = (label: string) => {
    switch (label) {
      case 'Website': return Globe2;
      case 'Visibility': return TrendingUp;
      case 'Trust': return ShieldCheck;
      default: return Zap;
    }
  };

  const scoreColor = result ? getScoreColor(result.overallScore) : getScoreColor(0);

  return (
    <div className="flex min-h-screen flex-col bg-gradient-to-br from-primary-50 via-white to-accent-50">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/80 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link href="/" className="flex items-center gap-2">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-xl font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/login" className="text-sm font-medium text-gray-600 hover:text-primary-600 transition-colors">
              Log In
            </Link>
            <Link href="/signup" className="btn-primary text-sm py-2">
              Start Free
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-1">
        {/* Hero */}
        <section className="section-padding pb-8">
          <div className="section-inner">
            <div className="mx-auto max-w-3xl text-center">
              <div className="mb-6 inline-flex items-center gap-2 rounded-full bg-primary-100 px-4 py-1.5 text-sm font-medium text-primary-700">
                <TrendingUp className="h-4 w-4" />
                Free Practice Growth Assessment
              </div>
              <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 sm:text-5xl lg:text-6xl">
                Free Healthcare Practice Growth Score
              </h1>
              <p className="mt-6 text-lg leading-8 text-gray-600 sm:text-xl">
                See how your practice&apos;s online presence measures up — in under 60 seconds.
              </p>
              <div className="mt-4 flex items-center justify-center gap-2 text-sm text-gray-500">
                <CheckCircle2 className="h-4 w-4 text-primary-500" />
                <span>No account required — get your score instantly</span>
              </div>
            </div>
          </div>
        </section>

        {/* Form / Results */}
        <section className="px-4 pb-16 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-2xl">
            {/* FORM STATE */}
            {(pageState === 'form' || pageState === 'error') && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
                <h2 className="text-xl font-bold tracking-tight text-gray-900">
                  Tell us about your practice
                </h2>
                <p className="mt-1.5 text-sm text-gray-600">
                  Fill in the details below and we&apos;ll analyze your online presence.
                </p>

                {error && (
                  <div className="mt-6 flex items-start gap-3 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                    <AlertCircle className="mt-0.5 h-4 w-4 flex-shrink-0" />
                    <div className="flex-1">
                      <p>{error}</p>
                      <button
                        onClick={handleTryAgain}
                        className="mt-2 inline-flex items-center gap-1 text-sm font-medium text-red-700 underline hover:text-red-800"
                      >
                        <RefreshCw className="h-3 w-3" />
                        Try again
                      </button>
                    </div>
                  </div>
                )}

                <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                  {/* Practice Name */}
                  <div>
                    <label htmlFor="practiceName" className="block text-sm font-medium text-gray-700">
                      Practice Name <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Building2 className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="practiceName"
                        type="text"
                        value={practiceName}
                        onChange={(e) => setPracticeName(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.practiceName ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="e.g., Smith Family Practice"
                      />
                    </div>
                    {fieldErrors.practiceName && <p className="mt-1 text-xs text-red-600">{fieldErrors.practiceName}</p>}
                  </div>

                  {/* Website URL */}
                  <div>
                    <label htmlFor="websiteUrl" className="block text-sm font-medium text-gray-700">
                      Website URL <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Globe className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="websiteUrl"
                        type="text"
                        value={websiteUrl}
                        onChange={(e) => setWebsiteUrl(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.websiteUrl ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="https://yourpractice.com"
                      />
                    </div>
                    {fieldErrors.websiteUrl && <p className="mt-1 text-xs text-red-600">{fieldErrors.websiteUrl}</p>}
                  </div>

                  {/* Practice Type */}
                  <div>
                    <label htmlFor="practiceType" className="block text-sm font-medium text-gray-700">
                      Practice Type / Specialty <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Stethoscope className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <select
                        id="practiceType"
                        value={practiceType}
                        onChange={(e) => setPracticeType(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.practiceType ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                        } ${!practiceType ? 'text-gray-400' : 'text-gray-900'}`}
                      >
                        <option value="" disabled>Select your specialty...</option>
                        {PRACTICE_TYPES.map((type) => (
                          <option key={type} value={type}>{type}</option>
                        ))}
                      </select>
                    </div>
                    {fieldErrors.practiceType && <p className="mt-1 text-xs text-red-600">{fieldErrors.practiceType}</p>}
                  </div>

                  {/* City & State */}
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                        City <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <MapPin className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <input
                          id="city"
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            fieldErrors.city ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                          }`}
                          placeholder="City"
                        />
                      </div>
                      {fieldErrors.city && <p className="mt-1 text-xs text-red-600">{fieldErrors.city}</p>}
                    </div>
                    <div>
                      <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                        State <span className="text-red-500">*</span>
                      </label>
                      <div className="relative mt-1.5">
                        <select
                          id="state"
                          value={state}
                          onChange={(e) => setState(e.target.value)}
                          className={`block w-full rounded-lg border px-3 py-2.5 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                            fieldErrors.state ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                          } ${!state ? 'text-gray-400' : 'text-gray-900'}`}
                        >
                          <option value="" disabled>Select...</option>
                          {US_STATES.map((st) => (
                            <option key={st} value={st}>{st}</option>
                          ))}
                        </select>
                      </div>
                      {fieldErrors.state && <p className="mt-1 text-xs text-red-600">{fieldErrors.state}</p>}
                    </div>
                  </div>

                  {/* Email */}
                  <div>
                    <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                      Email <span className="text-red-500">*</span>
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className={`block w-full rounded-lg border pl-10 pr-3 py-2.5 text-sm shadow-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500/20 ${
                          fieldErrors.email ? 'border-red-300 focus:border-red-500' : 'border-gray-300 focus:border-primary-500'
                        }`}
                        placeholder="you@practice.com"
                      />
                    </div>
                    {fieldErrors.email && <p className="mt-1 text-xs text-red-600">{fieldErrors.email}</p>}
                    <p className="mt-1 text-xs text-gray-500">We&apos;ll send your score and recommendations to this address.</p>
                  </div>

                  <button
                    type="submit"
                    className="btn-primary w-full py-3 text-base"
                  >
                    <TrendingUp className="mr-2 h-5 w-5" />
                    Get My Free Score
                  </button>

                  <p className="text-center text-xs text-gray-400">
                    No spam, ever. Your information is never shared.
                  </p>
                </form>
              </div>
            )}

            {/* LOADING STATE */}
            {pageState === 'loading' && (
              <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
                <div className="text-center py-12">
                  <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-primary-100">
                    <Loader2 className="h-10 w-10 animate-spin text-primary-500" />
                  </div>
                  <h2 className="text-xl font-bold tracking-tight text-gray-900">
                    Analyzing your practice...
                  </h2>
                  <p className="mt-3 text-gray-600">
                    We&apos;re evaluating your online presence across key growth dimensions.
                  </p>
                  <div className="mt-8 space-y-3">
                    {['Checking website quality...', 'Evaluating local visibility...', 'Assessing trust signals...'].map((step, i) => (
                      <div key={i} className="flex items-center justify-center gap-2 text-sm text-gray-500">
                        <div
                          className="h-1.5 w-1.5 rounded-full bg-primary-400 animate-pulse"
                          style={{ animationDelay: `${i * 0.3}s` }}
                        />
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <p className="mt-8 text-xs text-gray-400">This usually takes about 30 seconds</p>
                </div>
              </div>
            )}

            {/* RESULTS STATE */}
            {pageState === 'results' && result && (
              <div>
                {/* Score Card */}
                <div className="rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
                  <div className="text-center">
                    <h2 className="text-xl font-bold tracking-tight text-gray-900">
                      Your Practice Growth Score
                    </h2>
                    <p className="mt-1 text-sm text-gray-500">
                      Based on our analysis of your online presence
                    </p>

                    {/* Score Gauge */}
                    <div className="mt-8 flex justify-center">
                      <div className="relative">
                        <svg className="h-48 w-48 -rotate-90" viewBox="0 0 160 160">
                          {/* Background track */}
                          <circle
                            cx="80" cy="80" r="68"
                            fill="none"
                            stroke="#e5e7eb"
                            strokeWidth="14"
                          />
                          {/* Score arc */}
                          <circle
                            cx="80" cy="80" r="68"
                            fill="none"
                            stroke={result.overallScore >= 70 ? '#22c55e' : result.overallScore >= 45 ? '#eab308' : '#ef4444'}
                            strokeWidth="14"
                            strokeLinecap="round"
                            strokeDasharray={`${(result.overallScore / 100) * 427} 427`}
                          />
                        </svg>
                        <div className="absolute inset-0 flex flex-col items-center justify-center">
                          <span className={`text-5xl font-extrabold ${scoreColor.text}`}>
                            {result.overallScore}
                          </span>
                          <span className="text-sm font-medium text-gray-500">out of 100</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4">
                      <span className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-sm font-medium ${
                        result.overallScore >= 70
                          ? 'bg-green-100 text-green-700'
                          : result.overallScore >= 45
                          ? 'bg-yellow-100 text-yellow-700'
                          : 'bg-red-100 text-red-700'
                      }`}>
                        {scoreColor.label}
                      </span>
                    </div>

                    {/* Category Breakdown */}
                    <div className="mt-8 grid gap-4 sm:grid-cols-3">
                      {result.categories.map((cat) => {
                        const CatIcon = getCategoryIcon(cat.label);
                        const catColor = getScoreColor(cat.score);
                        return (
                          <div
                            key={cat.label}
                            className="rounded-xl border border-gray-200 bg-gray-50/50 p-4 text-center"
                          >
                            <div className="mx-auto flex h-10 w-10 items-center justify-center rounded-lg bg-primary-100">
                              <CatIcon className="h-5 w-5 text-primary-600" />
                            </div>
                            <p className="mt-2 text-sm font-semibold text-gray-900">{cat.label}</p>
                            <p className={`mt-1 text-2xl font-bold ${catColor.text}`}>{cat.score}</p>
                            <p className="mt-1 text-xs text-gray-500 leading-relaxed">{cat.summary}</p>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Recommendations */}
                <div className="mt-6 rounded-2xl border border-gray-200 bg-white p-8 shadow-sm sm:p-10">
                  <h3 className="text-lg font-bold tracking-tight text-gray-900">
                    Top Recommendations
                  </h3>
                  <p className="mt-1 text-sm text-gray-600">
                    Here&apos;s where to focus to improve your online presence.
                  </p>
                  <ul className="mt-5 space-y-3">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-3 text-sm text-gray-700">
                        <span className="mt-0.5 flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full bg-primary-100 text-xs font-bold text-primary-600">
                          {i + 1}
                        </span>
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Gated CTA */}
                <div className="mt-6 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-800 p-8 text-white shadow-lg sm:p-10">
                  <div className="text-center">
                    <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-white/20 px-4 py-1.5 text-sm font-medium">
                      <Zap className="h-4 w-4" />
                      Unlock the Full Report
                    </div>
                    <h3 className="text-2xl font-bold tracking-tight">
                      Want the full report with detailed recommendations?
                    </h3>
                    <p className="mt-3 text-primary-100">
                      Create your free account to get a complete analysis with a 30-day improvement plan.
                    </p>

                    <ul className="mt-6 grid gap-3 text-left sm:grid-cols-2">
                      {[
                        'Full 6-category breakdown',
                        'Prioritized action plan',
                        '30-day improvement timeline',
                        'AI-powered content suggestions',
                      ].map((benefit) => (
                        <li key={benefit} className="flex items-center gap-2 text-sm text-primary-100">
                          <CheckCircle2 className="h-4 w-4 flex-shrink-0 text-primary-300" />
                          {benefit}
                        </li>
                      ))}
                    </ul>

                    <div className="mt-8 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
                      <Link
                        href="/signup"
                        className="btn-white px-8 py-3 text-base w-full sm:w-auto"
                      >
                        Create Free Account
                        <ArrowRight className="ml-2 h-5 w-5" />
                      </Link>
                      <Link
                        href="/login"
                        className="rounded-lg border border-white/30 px-8 py-3 text-base font-semibold text-white hover:bg-white/10 transition-colors w-full sm:w-auto text-center"
                      >
                        I Already Have an Account
                      </Link>
                    </div>

                    <p className="mt-4 text-xs text-primary-200">
                      Free plan available. No credit card required.
                    </p>
                  </div>
                </div>

                {/* Try Again link */}
                <div className="mt-4 text-center">
                  <button
                    onClick={handleTryAgain}
                    className="text-sm text-gray-500 hover:text-gray-700 underline transition-colors"
                  >
                    ← Check a different practice
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-gray-200 bg-gray-50">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex flex-col items-center justify-between gap-6 sm:flex-row">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-lg font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </div>
            <div className="flex gap-6 text-sm text-gray-500">
              <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy Policy</Link>
              <Link href="/terms" className="hover:text-gray-700 transition-colors">Terms of Service</Link>
              <Link href="/contact" className="hover:text-gray-700 transition-colors">Contact</Link>
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
