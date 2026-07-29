import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { practices, auditLog, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import Link from 'next/link';
import DashboardClientWrapper from '@/components/DashboardClientWrapper';
import { UpgradePrompt, ManageSubscriptionButton } from '@/components/ManageSubscriptionButton';
import {
  Sparkles,
  LogOut,
  PenLine,
  MessageSquareText,
  SearchCheck,
  Target,
  HelpCircle,
  Layout,
  ArrowRight,
  TrendingUp,
  FileText,
  Star,
  ChevronRight,
  Activity,
  Zap,
  Globe,
  BarChart3,
  CreditCard,
  ExternalLink,
} from 'lucide-react';

// ─── Helpers ────────────────────────────────────────────────
function getScoreColor(score: number | null): string {
  if (score === null || score === 0) return 'text-gray-400';
  if (score < 40) return 'text-red-500';
  if (score < 70) return 'text-yellow-500';
  return 'text-green-500';
}

function getScoreBg(score: number | null): string {
  if (score === null || score === 0) return 'bg-gray-100';
  if (score < 40) return 'bg-red-50';
  if (score < 70) return 'bg-yellow-50';
  return 'bg-green-50';
}

function getScoreRing(score: number | null): string {
  if (score === null || score === 0) return 'stroke-gray-200';
  if (score < 40) return 'stroke-red-500';
  if (score < 70) return 'stroke-yellow-500';
  return 'stroke-green-500';
}

function getScoreTrack(score: number | null): string {
  if (score === null || score === 0) return 'stroke-gray-100';
  if (score < 40) return 'stroke-red-100';
  if (score < 70) return 'stroke-yellow-100';
  return 'stroke-green-100';
}

function formatRelativeTime(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'Just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

// ─── Quick Action Card ──────────────────────────────────────
function QuickActionCard({
  href,
  icon: Icon,
  label,
  description,
}: {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description: string;
}) {
  return (
    <Link
      href={href}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition-all duration-200 hover:border-primary-200 hover:shadow-md hover:-translate-y-0.5"
    >
      <div className="mb-3 flex h-11 w-11 items-center justify-center rounded-lg bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-100 group-hover:text-primary-700">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="text-sm font-semibold text-gray-900">{label}</h3>
      <p className="mt-1 text-xs text-gray-500">{description}</p>
    </Link>
  );
}

// ─── Recent Activity Icon ───────────────────────────────────
function ActivityIcon({ action }: { action: string }) {
  const iconClass = 'h-4 w-4';
  const actionLower = action.toLowerCase();

  if (actionLower.includes('audit') || actionLower.includes('score')) {
    return <SearchCheck className={`${iconClass} text-blue-500`} />;
  }
  if (actionLower.includes('content') || actionLower.includes('post') || actionLower.includes('blog')) {
    return <PenLine className={`${iconClass} text-purple-500`} />;
  }
  if (actionLower.includes('review')) {
    return <MessageSquareText className={`${iconClass} text-orange-500`} />;
  }
  if (actionLower.includes('plan') || actionLower.includes('marketing')) {
    return <Target className={`${iconClass} text-emerald-500`} />;
  }
  if (actionLower.includes('faq') || actionLower.includes('page')) {
    return <HelpCircle className={`${iconClass} text-indigo-500`} />;
  }
  return <Activity className={`${iconClass} text-gray-400`} />;
}

// ─── Page Component ─────────────────────────────────────────
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt((session.user as any).id, 10);

  const practice = await db.query.practices.findFirst({
    where: eq(practices.userId, userId),
  });

  // Redirect to onboarding if no practice record
  if (!practice) {
    redirect('/onboarding');
  }

  const user = await db.query.users.findFirst({
    where: eq(users.id, userId),
  });

  const recentActivity = await db.query.auditLog.findMany({
    where: eq(auditLog.userId, userId),
    orderBy: [desc(auditLog.createdAt)],
    limit: 5,
  });

  const growthScore = practice.growthScore;
  const hasScore = growthScore !== null && growthScore !== 0;
  const location =
    practice.city && practice.state
      ? `${practice.city}, ${practice.state}`
      : practice.city || practice.state || '';
  const displayScore = hasScore ? growthScore : 0;

  // Content generated this month (from audit_log)
  const contentActions = recentActivity.filter((a) => {
    const act = a.action.toLowerCase();
    return act.includes('content') || act.includes('post') || act.includes('blog');
  }).length;

  const reviewActions = recentActivity.filter((a) => {
    const act = a.action.toLowerCase();
    return act.includes('review');
  }).length;

  return (
    <DashboardClientWrapper
      userTier={user?.subscriptionTier || 'free'}
      userSubscriptionStatus={user?.subscriptionStatus || 'active'}
      hasStripeCustomer={!!user?.stripeCustomerId}
    >
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* ── Header ─────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
          <Link href="/dashboard" className="flex items-center gap-3 shrink-0">
            <Sparkles className="h-7 w-7 text-primary-500" />
            <span className="text-lg font-bold text-gray-900">
              CareConnect<span className="text-primary-500">AI</span>
            </span>
          </Link>

          <div className="flex items-center gap-4">
            <span className="hidden text-sm text-gray-600 sm:block">
              {session.user.name || session.user.email}
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
          {/* Welcome & Score Row */}
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                Welcome back, {practice.practiceName}
              </h1>
              {location && (
                <p className="mt-1 flex items-center gap-1.5 text-sm text-gray-500">
                  <Globe className="h-3.5 w-3.5" />
                  {location}
                  {practice.practiceType && (
                    <>
                      <span className="mx-1 text-gray-300">•</span>
                      {practice.practiceType}
                    </>
                  )}
                </p>
              )}
            </div>

            {/* Practice Growth Score Badge */}
            <div className="flex items-center gap-3 rounded-xl border border-gray-200 bg-white px-4 py-3 shadow-sm sm:min-w-[200px]">
              <div className="relative h-12 w-12 shrink-0">
                <svg className="h-12 w-12 -rotate-90" viewBox="0 0 48 48">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                    className={getScoreTrack(growthScore)}
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    fill="none"
                    strokeWidth="4"
                    strokeLinecap="round"
                    className={getScoreRing(growthScore)}
                    strokeDasharray={`${(displayScore / 100) * 125.66} 125.66`}
                  />
                </svg>
                <span
                  className={`absolute inset-0 flex items-center justify-center text-sm font-bold ${getScoreColor(growthScore)}`}
                >
                  {hasScore ? displayScore : '--'}
                </span>
              </div>
              <div>
                <p className="text-xs font-medium text-gray-500">Practice Growth Score</p>
                {!hasScore ? (
                  <Link
                    href="/dashboard/audit"
                    className="mt-0.5 inline-flex items-center gap-1 text-xs font-semibold text-primary-600 hover:text-primary-700"
                  >
                    Run first audit <ArrowRight className="h-3 w-3" />
                  </Link>
                ) : (
                  <p className={`text-xs font-medium ${getScoreColor(growthScore)}`}>
                    {displayScore < 40 ? 'Needs Attention' : displayScore < 70 ? 'Growing Steadily' : 'Thriving Practice'}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* ── Today's Recommended Action ─────────────────── */}
          <div className="mb-6 rounded-xl border border-primary-200 bg-gradient-to-br from-primary-50 to-white p-5 shadow-sm sm:p-6">
            <div className="flex items-start gap-4">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary-100">
                <Zap className="h-5 w-5 text-primary-600" />
              </div>
              <div className="flex-1">
                <p className="text-xs font-semibold uppercase tracking-wide text-primary-600">
                  Today&apos;s Recommended Action
                </p>
                {!hasScore ? (
                  <>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      Get Your Free Practice Growth Score
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Run a quick website audit to discover how your online presence stacks up
                      against other {practice.practiceType?.toLowerCase() || 'healthcare'} practices —
                      and get a personalized action plan.
                    </p>
                    <Link
                      href="/dashboard/audit"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                    >
                      <SearchCheck className="h-4 w-4" />
                      Run Free Audit
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : growthScore! < 40 ? (
                  <>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      Fix These Website Issues First
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Your practice website has room for improvement. Addressing the top issues
                      in your audit can significantly boost your visibility and bring in more patients.
                    </p>
                    <Link
                      href="/dashboard/audit"
                      className="mt-3 inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                    >
                      <SearchCheck className="h-4 w-4" />
                      View Audit Details
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </>
                ) : growthScore! < 70 ? (
                  <>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      Build on Your Momentum
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Your practice is growing — keep the momentum going by creating fresh
                      content and responding to reviews consistently.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/dashboard/content"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                      >
                        <PenLine className="h-4 w-4" />
                        Create Content
                      </Link>
                      <Link
                        href="/dashboard/reviews"
                        className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        Respond to Reviews
                      </Link>
                    </div>
                  </>
                ) : (
                  <>
                    <h2 className="mt-1 text-lg font-bold text-gray-900">
                      Your Practice Is Thriving — Stay Ahead
                    </h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Great job! Keep refining your strategy with a fresh marketing plan
                      and proactive review management to stay ahead of the competition.
                    </p>
                    <div className="mt-3 flex flex-wrap gap-2">
                      <Link
                        href="/dashboard/marketing"
                        className="inline-flex items-center gap-2 rounded-lg bg-primary-500 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-primary-600 transition-colors"
                      >
                        <Target className="h-4 w-4" />
                        New Marketing Plan
                      </Link>
                      <Link
                        href="/dashboard/reviews"
                        className="inline-flex items-center gap-2 rounded-lg border border-primary-200 bg-white px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 transition-colors"
                      >
                        <MessageSquareText className="h-4 w-4" />
                        Manage Reviews
                      </Link>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>

          {/* ── Two-Column Layout ──────────────────────────── */}
          <div className="grid gap-6 lg:grid-cols-3">
            {/* Quick Actions — takes 2 columns */}
            <div className="lg:col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Quick Actions</h2>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <QuickActionCard
                  href="/dashboard/content"
                  icon={PenLine}
                  label="Create Social Post"
                  description="Generate engaging posts for Facebook, Instagram, and more"
                />
                <QuickActionCard
                  href="/dashboard/reviews"
                  icon={MessageSquareText}
                  label="Respond to Review"
                  description="Craft professional responses to patient reviews in seconds"
                />
                <QuickActionCard
                  href="/dashboard/audit"
                  icon={SearchCheck}
                  label="Audit My Website"
                  description="Get a detailed analysis and actionable recommendations"
                />
                <QuickActionCard
                  href="/dashboard/marketing"
                  icon={Target}
                  label="Create Marketing Plan"
                  description="Generate a 30-day plan tailored to your practice goals"
                />
                <QuickActionCard
                  href="/dashboard/faq"
                  icon={HelpCircle}
                  label="Generate FAQ"
                  description="Build a comprehensive FAQ page from your practice details"
                />
                <QuickActionCard
                  href="/dashboard/audit?tab=homepage"
                  icon={Layout}
                  label="Improve My Homepage"
                  description="Get AI-powered suggestions to optimize your homepage"
                />
              </div>

              {/* Recent Activity — below quick actions on mobile/tablet */}
              <div className="mt-6">
                <div className="flex items-center gap-2 mb-4">
                  <Activity className="h-5 w-5 text-gray-700" />
                  <h2 className="text-lg font-bold text-gray-900">Recent Activity</h2>
                </div>
                <div className="rounded-xl border border-gray-200 bg-white shadow-sm">
                  {recentActivity.length === 0 ? (
                    <div className="flex flex-col items-center justify-center px-4 py-10 text-center">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
                        <Activity className="h-6 w-6 text-gray-400" />
                      </div>
                      <p className="mt-3 text-sm font-medium text-gray-900">No activity yet</p>
                      <p className="mt-1 text-xs text-gray-500">
                        Complete your first action — like running a website audit or creating
                        a social post — and it will appear here.
                      </p>
                      <Link
                        href="/dashboard/audit"
                        className="mt-4 inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700"
                      >
                        Get started <ArrowRight className="h-4 w-4" />
                      </Link>
                    </div>
                  ) : (
                    <ul className="divide-y divide-gray-100">
                      {recentActivity.map((entry) => (
                        <li
                          key={entry.id}
                          className="flex items-center gap-4 px-5 py-3.5 hover:bg-gray-50 transition-colors"
                        >
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-gray-100">
                            <ActivityIcon action={entry.action} />
                          </div>
                          <div className="min-w-0 flex-1">
                            <p className="text-sm font-medium text-gray-900 truncate">
                              {entry.action}
                            </p>
                            {entry.details && (
                              <p className="text-xs text-gray-500 truncate">{entry.details}</p>
                            )}
                          </div>
                          <span className="shrink-0 text-xs text-gray-400">
                            {formatRelativeTime(new Date(entry.createdAt))}
                          </span>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </div>

            {/* Practice Snapshot Sidebar */}
            <div className="lg:col-span-1">
              <div className="flex items-center gap-2 mb-4">
                <BarChart3 className="h-5 w-5 text-gray-700" />
                <h2 className="text-lg font-bold text-gray-900">Practice Snapshot</h2>
              </div>

              <div className="space-y-4">
                {/* Growth Score Card */}
                <div className={`rounded-xl border p-5 shadow-sm ${getScoreBg(growthScore)}`}>
                  <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                    Practice Growth Score
                  </p>
                  {!hasScore ? (
                    <div className="mt-3 text-center">
                      <p className="text-4xl font-extrabold text-gray-300">--</p>
                      <p className="mt-1 text-sm text-gray-500">
                        Not yet scored — run your first audit
                      </p>
                      <Link
                        href="/dashboard/audit"
                        className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-primary-600 shadow-sm ring-1 ring-inset ring-gray-200 hover:bg-primary-50 transition-colors"
                      >
                        <SearchCheck className="h-3.5 w-3.5" />
                        Run Audit
                      </Link>
                    </div>
                  ) : (
                    <div className="mt-3">
                      <div className="flex items-end gap-1">
                        <span className={`text-4xl font-extrabold ${getScoreColor(growthScore)}`}>
                          {displayScore}
                        </span>
                        <span className="text-sm text-gray-400 mb-1">/ 100</span>
                      </div>
                      <div className="mt-2 h-2 w-full rounded-full bg-gray-200">
                        <div
                          className={`h-2 rounded-full transition-all ${getScoreRing(growthScore)}`}
                          style={{ width: `${displayScore}%` }}
                        />
                      </div>
                      <p className={`mt-2 text-sm font-medium ${getScoreColor(growthScore)}`}>
                        {displayScore < 40
                          ? 'Needs Attention'
                          : displayScore < 70
                            ? 'Growing Steadily'
                            : 'Thriving Practice'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Stats Cards */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-blue-50">
                      <Globe className="h-4 w-4 text-blue-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Website</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {practice.websiteUrl ? (
                          <a
                            href={practice.websiteUrl.startsWith('http') ? practice.websiteUrl : `https://${practice.websiteUrl}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 hover:underline"
                          >
                            {practice.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').substring(0, 28)}
                            {practice.websiteUrl.replace(/^https?:\/\//, '').replace(/\/$/, '').length > 28 ? '…' : ''}
                          </a>
                        ) : (
                          <span className="text-gray-400">Not provided</span>
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-purple-50">
                      <FileText className="h-4 w-4 text-purple-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Content This Month</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {contentActions === 0 ? (
                          <span className="text-gray-400">No content yet</span>
                        ) : (
                          `${contentActions} piece${contentActions !== 1 ? 's' : ''} generated`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-50">
                      <Star className="h-4 w-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-xs text-gray-500">Reviews This Month</p>
                      <p className="text-sm font-semibold text-gray-900">
                        {reviewActions === 0 ? (
                          <span className="text-gray-400">No responses yet</span>
                        ) : (
                          `${reviewActions} response${reviewActions !== 1 ? 's' : ''} sent`
                        )}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Plan / Tier Card */}
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
                      <Zap className="h-4 w-4 text-primary-600" />
                    </div>
                    <div className="flex-1">
                      <p className="text-xs text-gray-500">Plan</p>
                      <p className="text-sm font-semibold capitalize text-gray-900">
                        {user?.subscriptionTier || 'Free'}
                      </p>
                    </div>
                    {(user?.subscriptionTier || 'free') !== 'free' && (
                      <span className="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                        Active
                      </span>
                    )}
                  </div>
                  {user && (
                    <>
                      <div className="mt-3 pt-3 border-t border-gray-100">
                        <div className="flex items-center justify-between text-xs">
                          <span className="text-gray-500">AI Generations Used</span>
                          <span className="font-medium text-gray-700">
                            {user.aiGenerationsUsed || 0} / {user.aiGenerationLimit || 10}
                          </span>
                        </div>
                        <div className="mt-1.5 h-1.5 w-full rounded-full bg-gray-100">
                          <div
                            className="h-1.5 rounded-full bg-primary-400 transition-all"
                            style={{
                              width: `${Math.min(
                                100,
                                ((user.aiGenerationsUsed || 0) / (user.aiGenerationLimit || 10)) * 100
                              )}%`,
                            }}
                          />
                        </div>
                      </div>
                      {(user?.subscriptionTier || 'free') === 'free' ? (
                        <UpgradePrompt />
                      ) : (
                        <div className="mt-2">
                          <ManageSubscriptionButton />
                          <p className="mt-1 text-center text-[10px] text-gray-400">
                            Update payment method, change plan, or cancel
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
    </DashboardClientWrapper>
  );
}
