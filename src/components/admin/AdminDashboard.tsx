'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';
import {
  Sparkles,
  LogOut,
  Users,
  DollarSign,
  UserPlus,
  TrendingUp,
  Zap,
  LayoutDashboard,
  ChevronDown,
  Download,
  Search,
  BarChart3,
  PieChart,
  Activity,
  Globe,
  Phone,
  Mail,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import Link from 'next/link';

// ─── Types ─────────────────────────────────────────────
interface StatsData {
  totalUsers: number;
  freeUsers: number;
  paidUsers: number;
  mrr: number;
  newSignupsThisMonth: number;
  conversionRate: number;
  tierCounts: Record<string, number>;
  totalAiUsage: number;
  growthData: { month: string; signups: number }[];
}

interface UserData {
  id: number;
  name: string;
  email: string;
  role: string;
  subscriptionTier: string;
  subscriptionStatus: string;
  aiGenerationsUsed: number;
  createdAt: string;
  practice: {
    practiceName: string;
    practiceType: string;
    city: string;
    state: string;
  } | null;
}

interface WebsiteLead {
  id: number;
  practiceId: number;
  userId: number;
  contactName: string;
  email: string;
  phone: string | null;
  budgetRange: string | null;
  message: string | null;
  status: string;
  createdAt: string;
  practiceName: string;
}

interface GrowthScoreLead {
  id: number;
  practiceName: string;
  websiteUrl: string;
  practiceType: string;
  city: string;
  state: string;
  email: string;
  score: number;
  createdAt: string;
}

// ─── Helpers ───────────────────────────────────────────
const TIER_LABELS: Record<string, string> = {
  free: 'Free',
  starter: 'Starter',
  pro: 'Pro',
  practice: 'Practice',
  agency: 'Agency',
};

const TIER_COLORS: Record<string, string> = {
  free: 'bg-gray-200 text-gray-700',
  starter: 'bg-blue-100 text-blue-700',
  pro: 'bg-purple-100 text-purple-700',
  practice: 'bg-primary-100 text-primary-700',
  agency: 'bg-accent-100 text-accent-700',
};

const TIER_CHART_COLORS: Record<string, string> = {
  free: '#e5e7eb',
  starter: '#3b82f6',
  pro: '#8b5cf6',
  practice: '#2a9d5e',
  agency: '#3b98f5',
};

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'in_progress', label: 'In Progress' },
  { value: 'completed', label: 'Completed' },
];

const STATUS_BADGES: Record<string, string> = {
  new: 'bg-blue-100 text-blue-700',
  contacted: 'bg-yellow-100 text-yellow-700',
  in_progress: 'bg-orange-100 text-orange-700',
  completed: 'bg-green-100 text-green-700',
};

function getScoreBadge(score: number): string {
  if (score < 40) return 'bg-red-100 text-red-700';
  if (score < 70) return 'bg-yellow-100 text-yellow-700';
  return 'bg-green-100 text-green-700';
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
  }).format(amount);
}

// ─── Sub-Components ────────────────────────────────────

function StatCard({
  label,
  value,
  subtitle,
  icon: Icon,
  trend,
}: {
  label: string;
  value: string;
  subtitle?: string;
  icon: React.ComponentType<{ className?: string }>;
  trend?: { value: string; positive: boolean };
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p>
        <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary-50">
          <Icon className="h-4 w-4 text-primary-600" />
        </div>
      </div>
      <p className="mt-2 text-2xl font-bold text-gray-900">{value}</p>
      {(subtitle || trend) && (
        <div className="mt-1 flex items-center gap-1.5">
          {trend && (
            <span
              className={`inline-flex items-center gap-0.5 text-xs font-medium ${
                trend.positive ? 'text-green-600' : 'text-red-600'
              }`}
            >
              <TrendingUp
                className={`h-3 w-3 ${trend.positive ? '' : 'rotate-180'}`}
              />
              {trend.value}
            </span>
          )}
          {subtitle && <span className="text-xs text-gray-400">{subtitle}</span>}
        </div>
      )}
    </div>
  );
}

function UserGrowthChart({ data }: { data: { month: string; signups: number }[] }) {
  const maxVal = Math.max(...data.map((d) => d.signups), 1);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <BarChart3 className="h-5 w-5 text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">User Growth (Last 6 Months)</h3>
      </div>
      {data.every((d) => d.signups === 0) ? (
        <div className="flex flex-col items-center py-8 text-center">
          <BarChart3 className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No signup data yet</p>
        </div>
      ) : (
        <div className="flex items-end gap-2 h-40">
          {data.map((item) => {
            const height = Math.max((item.signups / maxVal) * 100, 2);
            return (
              <div key={item.month} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs font-medium text-gray-600">{item.signups}</span>
                <div
                  className="w-full rounded-t-md bg-primary-400 transition-all hover:bg-primary-500"
                  style={{ height: `${height}%` }}
                />
                <span className="text-[10px] text-gray-400 truncate w-full text-center">
                  {item.month}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function TierBreakdownChart({ tierCounts }: { tierCounts: Record<string, number> }) {
  const tiers = ['free', 'starter', 'pro', 'practice', 'agency'];
  const total = Object.values(tierCounts).reduce((s, c) => s + c, 0);
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
      <div className="mb-4 flex items-center gap-2">
        <PieChart className="h-5 w-5 text-gray-700" />
        <h3 className="text-sm font-semibold text-gray-900">Subscription Breakdown</h3>
      </div>
      {total === 0 ? (
        <div className="flex flex-col items-center py-8 text-center">
          <PieChart className="h-10 w-10 text-gray-300" />
          <p className="mt-2 text-sm text-gray-500">No users yet</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tiers.map((tier) => {
            const count = tierCounts[tier] || 0;
            const pct = total > 0 ? Math.round((count / total) * 100) : 0;
            return (
              <div key={tier}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs font-medium text-gray-700">
                    {TIER_LABELS[tier]}
                  </span>
                  <span className="text-xs text-gray-500">
                    {count} user{count !== 1 ? 's' : ''} ({pct}%)
                  </span>
                </div>
                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full transition-all"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: TIER_CHART_COLORS[tier],
                    }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function RecentUsersTable({ users }: { users: UserData[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Users className="h-5 w-5 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">Recent Signups</h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Practice
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Tier
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Signed Up
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {users.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <Users className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No users found</p>
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr key={user.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {user.name}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">{user.email}</td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {user.practice ? (
                      <span>
                        {user.practice.practiceName}
                        {user.practice.practiceType && (
                          <span className="text-gray-400 ml-1">
                            ({user.practice.practiceType})
                          </span>
                        )}
                      </span>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        TIER_COLORS[user.subscriptionTier] || TIER_COLORS.free
                      }`}
                    >
                      {TIER_LABELS[user.subscriptionTier] || 'Free'}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(user.createdAt)}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${
                        user.subscriptionStatus === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {user.subscriptionStatus}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function WebsiteLeadsTable({
  leads,
  onStatusChange,
}: {
  leads: WebsiteLead[];
  onStatusChange: (leadId: number, status: string) => void;
}) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Globe className="h-5 w-5 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">
            Website Services Leads
            {leads.length > 0 && (
              <span className="ml-2 text-xs font-medium text-gray-400">
                ({leads.length})
              </span>
            )}
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Practice
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Contact
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Phone
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Budget
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Status
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-5 py-10 text-center">
                  <Globe className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No website service leads yet</p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {lead.practiceName}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {lead.contactName}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {lead.phone ? (
                      <a
                        href={`tel:${lead.phone}`}
                        className="text-primary-600 hover:text-primary-700 hover:underline"
                      >
                        {lead.phone}
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {lead.budgetRange || <span className="text-gray-400">—</span>}
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <select
                      value={lead.status}
                      onChange={(e) => onStatusChange(lead.id, e.target.value)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium border-0 cursor-pointer appearance-none bg-no-repeat pr-6 ${STATUS_BADGES[lead.status] || STATUS_BADGES.new}`}
                      style={{
                        backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%236b7280' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                        backgroundPosition: 'right 6px center',
                      }}
                    >
                      {STATUS_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function GrowthScoreLeadsTable({ leads }: { leads: GrowthScoreLead[] }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Activity className="h-5 w-5 text-gray-700" />
          <h3 className="text-sm font-semibold text-gray-900">
            Growth Score Leads
            {leads.length > 0 && (
              <span className="ml-2 text-xs font-medium text-gray-400">
                ({leads.length})
              </span>
            )}
          </h3>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-gray-100 bg-gray-50">
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Practice Name
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Type
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Location
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Email
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Score
              </th>
              <th className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
                Date
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {leads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-5 py-10 text-center">
                  <Activity className="h-8 w-8 text-gray-300 mx-auto" />
                  <p className="mt-2 text-sm text-gray-500">No growth score leads yet</p>
                </td>
              </tr>
            ) : (
              leads.map((lead) => (
                <tr key={lead.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-5 py-3 font-medium text-gray-900 whitespace-nowrap">
                    {lead.practiceName}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    {lead.practiceType}
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {lead.city}, {lead.state}
                  </td>
                  <td className="px-5 py-3 text-gray-600 whitespace-nowrap">
                    <a
                      href={`mailto:${lead.email}`}
                      className="text-primary-600 hover:text-primary-700 hover:underline"
                    >
                      {lead.email}
                    </a>
                  </td>
                  <td className="px-5 py-3 whitespace-nowrap">
                    <span
                      className={`inline-flex rounded-full px-2 py-0.5 text-xs font-semibold ${getScoreBadge(lead.score)}`}
                    >
                      {lead.score}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-gray-500 whitespace-nowrap">
                    {formatDate(lead.createdAt)}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Skeleton Components ───────────────────────────────

function SkeletonCard() {
  return (
    <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-3 w-20 rounded bg-gray-200" />
        <div className="h-9 w-9 rounded-lg bg-gray-200" />
      </div>
      <div className="mt-2 h-7 w-16 rounded bg-gray-200" />
      <div className="mt-1 h-3 w-24 rounded bg-gray-200" />
    </div>
  );
}

function SkeletonTable({ cols = 6 }: { cols?: number }) {
  return (
    <div className="rounded-xl border border-gray-200 bg-white shadow-sm overflow-hidden animate-pulse">
      <div className="px-5 py-4 border-b border-gray-100">
        <div className="h-4 w-32 rounded bg-gray-200" />
      </div>
      <div className="divide-y divide-gray-50">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="px-5 py-3 flex gap-4">
            {[...Array(cols)].map((_, j) => (
              <div key={j} className="h-4 flex-1 rounded bg-gray-200" />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Main Dashboard Component ──────────────────────────

export default function AdminDashboard({ userName }: { userName: string }) {
  const { data: session, status: authStatus } = useSession();
  const [stats, setStats] = useState<StatsData | null>(null);
  const [users, setUsers] = useState<UserData[]>([]);
  const [websiteLeads, setWebsiteLeads] = useState<WebsiteLead[]>([]);
  const [growthScoreLeads, setGrowthScoreLeads] = useState<GrowthScoreLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSection, setActiveSection] = useState('overview');
  const [userPage, setUserPage] = useState(1);
  const [userSearch, setUserSearch] = useState('');

  useEffect(() => {
    if (authStatus === 'unauthenticated') {
      redirect('/login');
    }
  }, [authStatus]);

  useEffect(() => {
    if (authStatus !== 'authenticated') return;
    fetchAllData();
  }, [authStatus]);

  async function fetchAllData() {
    setLoading(true);
    setError('');
    try {
      const [statsRes, usersRes, websiteRes, growthRes] = await Promise.all([
        fetch('/api/admin/stats'),
        fetch('/api/admin/users?limit=10'),
        fetch('/api/admin/leads/website'),
        fetch('/api/admin/leads/growth-score'),
      ]);

      if (!statsRes.ok || !usersRes.ok || !websiteRes.ok || !growthRes.ok) {
        throw new Error('Failed to fetch data. Ensure you have admin access.');
      }

      const statsData = await statsRes.json();
      const usersData = await usersRes.json();
      const websiteData = await websiteRes.json();
      const growthData = await growthRes.json();

      setStats(statsData);
      setUsers(usersData.users || []);
      setWebsiteLeads(websiteData.leads || []);
      setGrowthScoreLeads(growthData.leads || []);
    } catch (err: any) {
      console.error('Error fetching admin data:', err);
      setError(err.message || 'Failed to load dashboard data.');
    } finally {
      setLoading(false);
    }
  }

  async function handleStatusChange(leadId: number, newStatus: string) {
    try {
      const res = await fetch(`/api/admin/leads/website/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setWebsiteLeads((prev) =>
          prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
        );
      }
    } catch (err) {
      console.error('Error updating lead status:', err);
    }
  }

  async function handleExportCSV() {
    try {
      const res = await fetch('/api/admin/users?limit=1000');
      const data = await res.json();
      const allUsers: UserData[] = data.users || [];

      const headers = [
        'Name',
        'Email',
        'Role',
        'Tier',
        'Status',
        'Practice Name',
        'Practice Type',
        'Location',
        'Signed Up',
      ];
      const rows = allUsers.map((u) => [
        u.name,
        u.email,
        u.role,
        u.subscriptionTier,
        u.subscriptionStatus,
        u.practice?.practiceName || '',
        u.practice?.practiceType || '',
        u.practice ? `${u.practice.city || ''}, ${u.practice.state || ''}` : '',
        formatDate(u.createdAt),
      ]);

      const csv =
        [headers.join(','), ...rows.map((r) => r.map((c) => `"${c}"`).join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `careconnect-users-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Error exporting CSV:', err);
    }
  }

  if (authStatus === 'loading') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary-500 border-t-transparent" />
      </div>
    );
  }

  if (authStatus === 'unauthenticated') {
    return null;
  }

  const sections = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'users', label: 'Users', icon: Users },
    { id: 'website-leads', label: 'Website Leads', icon: Globe },
    { id: 'growth-leads', label: 'Growth Score Leads', icon: Activity },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* ── Sidebar ──────────────────────────────────────── */}
      <aside className="hidden lg:flex lg:w-56 lg:flex-col lg:fixed lg:inset-y-0 border-r border-gray-200 bg-white">
        <div className="flex items-center gap-3 px-5 py-4 border-b border-gray-100">
          <Sparkles className="h-6 w-6 text-primary-500" />
          <span className="text-base font-bold text-gray-900">
            CareConnect<span className="text-primary-500">AI</span>
          </span>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1">
          {sections.map((section) => {
            const Icon = section.icon;
            return (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`w-full flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  activeSection === section.id
                    ? 'bg-primary-50 text-primary-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <Icon className="h-4 w-4" />
                {section.label}
              </button>
            );
          })}
        </nav>
        <div className="border-t border-gray-100 px-5 py-4 space-y-2">
          <button
            onClick={handleExportCSV}
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <Download className="h-4 w-4" />
            Export Users CSV
          </button>
          <Link
            href="/api/auth/signout"
            className="w-full flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
          >
            <LogOut className="h-4 w-4" />
            Sign Out
          </Link>
        </div>
      </aside>

      {/* ── Main Content ─────────────────────────────────── */}
      <div className="flex-1 lg:pl-56">
        {/* Mobile header */}
        <header className="sticky top-0 z-40 border-b border-gray-200 bg-white lg:hidden">
          <div className="flex items-center justify-between px-4 py-3">
            <Link href="/admin" className="flex items-center gap-2">
              <Sparkles className="h-6 w-6 text-primary-500" />
              <span className="text-base font-bold text-gray-900">
                CareConnect<span className="text-primary-500">AI</span>
              </span>
            </Link>
            <div className="flex items-center gap-2">
              <span className="text-sm text-gray-600">Admin</span>
              <Link
                href="/api/auth/signout"
                className="rounded-lg px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-100"
              >
                <LogOut className="h-4 w-4" />
              </Link>
            </div>
          </div>
          {/* Mobile nav tabs */}
          <div className="flex overflow-x-auto border-b border-gray-100 px-2">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => setActiveSection(section.id)}
                className={`shrink-0 px-4 py-2 text-xs font-medium transition-colors ${
                  activeSection === section.id
                    ? 'border-b-2 border-primary-500 text-primary-700'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                {section.label}
              </button>
            ))}
          </div>
        </header>

        {/* Desktop header */}
        <header className="hidden lg:flex items-center justify-between px-8 py-4 border-b border-gray-200 bg-white">
          <div>
            <h1 className="text-lg font-semibold text-gray-900">Admin Dashboard</h1>
            <p className="text-xs text-gray-500">Welcome back, {userName}</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-3 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
            >
              <Download className="h-4 w-4" />
              Export CSV
            </button>
            <span className="rounded-full bg-primary-50 px-3 py-1 text-xs font-medium text-primary-700">
              Admin
            </span>
          </div>
        </header>

        <main className="p-4 sm:p-6 lg:p-8">
          {error && (
            <div className="mb-6 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Overview Section */}
          {activeSection === 'overview' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              {loading ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  {[...Array(4)].map((_, i) => (
                    <SkeletonCard key={i} />
                  ))}
                </div>
              ) : stats ? (
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <StatCard
                    label="Total Users"
                    value={String(stats.totalUsers)}
                    subtitle={`${stats.freeUsers} free · ${stats.paidUsers} paid`}
                    icon={Users}
                  />
                  <StatCard
                    label="Monthly Revenue"
                    value={formatCurrency(stats.mrr)}
                    subtitle={`${stats.paidUsers} paying users`}
                    icon={DollarSign}
                  />
                  <StatCard
                    label="New Signups"
                    value={String(stats.newSignupsThisMonth)}
                    subtitle="this month"
                    icon={UserPlus}
                    trend={
                      stats.newSignupsThisMonth > 0
                        ? { value: 'this month', positive: true }
                        : undefined
                    }
                  />
                  <StatCard
                    label="Conversion Rate"
                    value={`${stats.conversionRate}%`}
                    subtitle="free → paid"
                    icon={TrendingUp}
                  />
                </div>
              ) : null}

              {/* Charts Row */}
              {loading ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse h-56" />
                  <div className="rounded-xl border border-gray-200 bg-white p-5 animate-pulse h-56" />
                </div>
              ) : stats ? (
                <div className="grid gap-6 lg:grid-cols-2">
                  <UserGrowthChart data={stats.growthData} />
                  <TierBreakdownChart tierCounts={stats.tierCounts} />
                </div>
              ) : null}

              {/* AI Usage Card */}
              {stats && (
                <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
                  <div className="flex items-center gap-2 mb-2">
                    <Zap className="h-5 w-5 text-primary-600" />
                    <h3 className="text-sm font-semibold text-gray-900">AI Usage Overview</h3>
                  </div>
                  <p className="text-3xl font-bold text-gray-900">
                    {stats.totalAiUsage.toLocaleString()}
                  </p>
                  <p className="text-xs text-gray-500">total AI generations across all users</p>
                </div>
              )}

              {/* Recent Users */}
              {loading ? (
                <SkeletonTable cols={6} />
              ) : (
                <RecentUsersTable users={users} />
              )}
            </div>
          )}

          {/* Users Section */}
          {activeSection === 'users' && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="relative flex-1 max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
                  <input
                    type="text"
                    placeholder="Search users..."
                    value={userSearch}
                    onChange={(e) => setUserSearch(e.target.value)}
                    className="w-full rounded-lg border border-gray-200 pl-9 pr-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-1.5 rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-50 transition-colors"
                >
                  <Download className="h-4 w-4" />
                  Export All
                </button>
              </div>
              <RecentUsersTable users={users} />
            </div>
          )}

          {/* Website Leads Section */}
          {activeSection === 'website-leads' && (
            <div className="space-y-4">
              {loading ? (
                <SkeletonTable cols={7} />
              ) : (
                <WebsiteLeadsTable
                  leads={websiteLeads}
                  onStatusChange={handleStatusChange}
                />
              )}
            </div>
          )}

          {/* Growth Score Leads Section */}
          {activeSection === 'growth-leads' && (
            <div className="space-y-4">
              {loading ? (
                <SkeletonTable cols={6} />
              ) : (
                <GrowthScoreLeadsTable leads={growthScoreLeads} />
              )}
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
