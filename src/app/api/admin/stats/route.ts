import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { users, practices } from '@/db/schema';
import { sql, eq, and, gte, lt, count } from 'drizzle-orm';

// Pricing tiers for MRR calculation
const TIER_PRICES: Record<string, number> = {
  starter: 49,
  pro: 99,
  practice: 199,
  agency: 399,
  free: 0,
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfNextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);

    // Total users
    const allUsers = await db.select().from(users);
    const totalUsers = allUsers.length;
    const freeUsers = allUsers.filter(u => u.subscriptionTier === 'free').length;
    const paidUsers = totalUsers - freeUsers;

    // MRR calculation
    let mrr = 0;
    for (const user of allUsers) {
      const tier = user.subscriptionTier || 'free';
      mrr += TIER_PRICES[tier] || 0;
    }

    // New signups this month
    const newSignupsThisMonth = allUsers.filter(u => {
      const created = new Date(u.createdAt);
      return created >= startOfMonth && created < startOfNextMonth;
    }).length;

    // Conversion rate (free -> paid)
    const conversionRate = totalUsers > 0 
      ? Math.round((paidUsers / totalUsers) * 100) 
      : 0;

    // Subscription breakdown
    const tierCounts: Record<string, number> = { free: 0, starter: 0, pro: 0, practice: 0, agency: 0 };
    for (const user of allUsers) {
      const tier = user.subscriptionTier || 'free';
      tierCounts[tier] = (tierCounts[tier] || 0) + 1;
    }

    // AI usage this month
    const totalAiUsage = allUsers.reduce((sum, u) => sum + (u.aiGenerationsUsed || 0), 0);

    // User growth by month (last 6 months)
    const growthData: { month: string; signups: number }[] = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 1);
      const monthLabel = monthStart.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });

      const count = allUsers.filter(u => {
        const created = new Date(u.createdAt);
        return created >= monthStart && created < monthEnd;
      }).length;

      growthData.push({ month: monthLabel, signups: count });
    }

    return NextResponse.json({
      totalUsers,
      freeUsers,
      paidUsers,
      mrr,
      newSignupsThisMonth,
      conversionRate,
      tierCounts,
      totalAiUsage,
      growthData,
    });
  } catch (error) {
    console.error('Admin stats error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
