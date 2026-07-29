import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { users, practices } from '@/db/schema';
import { eq, desc, like, or, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const url = new URL(request.url);
    const page = parseInt(url.searchParams.get('page') || '1', 10);
    const limit = parseInt(url.searchParams.get('limit') || '20', 10);
    const search = url.searchParams.get('search') || '';
    const offset = (page - 1) * limit;

    let userRows: any[];
    let totalCount: number;

    if (search) {
      // Search across name, email, and practice name
      const searchPattern = `%${search}%`;
      const allUsers = await db.select().from(users).all();
      const allPractices = await db.select().from(practices).all();

      const matchedUsers = allUsers.filter(u => {
        const practice = allPractices.find(p => p.userId === u.id);
        return (
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          (practice && practice.practiceName.toLowerCase().includes(search.toLowerCase()))
        );
      });

      totalCount = matchedUsers.length;
      userRows = matchedUsers.slice(offset, offset + limit);
    } else {
      const allUsers = await db
        .select()
        .from(users)
        .orderBy(desc(users.createdAt))
        .all();

      totalCount = allUsers.length;
      userRows = allUsers.slice(offset, offset + limit);
    }

    // Attach practice info
    const allPractices = await db.select().from(practices).all();
    const enriched = userRows.map(user => {
      const practice = allPractices.find(p => p.userId === user.id);
      return {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        subscriptionTier: user.subscriptionTier,
        subscriptionStatus: user.subscriptionStatus,
        aiGenerationsUsed: user.aiGenerationsUsed,
        createdAt: user.createdAt,
        practice: practice ? {
          practiceName: practice.practiceName,
          practiceType: practice.practiceType,
          city: practice.city,
          state: practice.state,
        } : null,
      };
    });

    return NextResponse.json({
      users: enriched,
      total: totalCount,
      page,
      totalPages: Math.ceil(totalCount / limit),
    });
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
