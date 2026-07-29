import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, auditLog, users } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);

    const practice = await db.query.practices.findFirst({
      where: eq(practices.userId, userId),
    });

    if (!practice) {
      return NextResponse.json({ error: 'No practice found' }, { status: 404 });
    }

    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    const recentActivity = await db.query.auditLog.findMany({
      where: eq(auditLog.userId, userId),
      orderBy: [desc(auditLog.createdAt)],
      limit: 5,
    });

    return NextResponse.json({
      practice: {
        id: practice.id,
        practiceName: practice.practiceName,
        practiceType: practice.practiceType,
        city: practice.city,
        state: practice.state,
        websiteUrl: practice.websiteUrl,
        growthScore: practice.growthScore,
        services: practice.services,
        brandVoice: practice.brandVoice,
        businessGoals: practice.businessGoals,
      },
      user: {
        name: user?.name || session.user.name,
        email: user?.email || session.user.email,
        subscriptionTier: user?.subscriptionTier || 'free',
        aiGenerationsUsed: user?.aiGenerationsUsed || 0,
        aiGenerationLimit: user?.aiGenerationLimit || 10,
      },
      recentActivity: recentActivity.map((entry) => ({
        id: entry.id,
        action: entry.action,
        details: entry.details,
        createdAt: entry.createdAt,
      })),
    });
  } catch (error) {
    console.error('Dashboard API error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
