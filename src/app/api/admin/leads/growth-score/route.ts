import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { growthScoreLeads } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const leads = await db
      .select()
      .from(growthScoreLeads)
      .orderBy(desc(growthScoreLeads.createdAt))
      .all();

    return NextResponse.json({ leads });
  } catch (error) {
    console.error('Admin growth score leads error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
