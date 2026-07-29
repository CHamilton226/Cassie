import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { websiteLeads, practices } from '@/db/schema';
import { desc } from 'drizzle-orm';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const leads = await db
      .select()
      .from(websiteLeads)
      .orderBy(desc(websiteLeads.createdAt))
      .all();

    // Attach practice name
    const allPractices = await db.select().from(practices).all();
    const enriched = leads.map(lead => {
      const practice = allPractices.find(p => p.id === lead.practiceId);
      return {
        ...lead,
        practiceName: practice?.practiceName || 'Unknown',
      };
    });

    return NextResponse.json({ leads: enriched });
  } catch (error) {
    console.error('Admin website leads error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
