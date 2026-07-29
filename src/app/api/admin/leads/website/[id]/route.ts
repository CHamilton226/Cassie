import { getServerSession } from 'next-auth';
import { NextRequest, NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { websiteLeads } from '@/db/schema';
import { eq } from 'drizzle-orm';

const VALID_STATUSES = ['new', 'contacted', 'in_progress', 'completed'];

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || (session.user as any).role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const leadId = parseInt(params.id, 10);
    if (isNaN(leadId)) {
      return NextResponse.json({ error: 'Invalid lead ID.' }, { status: 400 });
    }

    let body: { status: string };
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    if (!body.status || !VALID_STATUSES.includes(body.status)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // Verify lead exists
    const lead = await db.query.websiteLeads.findFirst({
      where: eq(websiteLeads.id, leadId),
    });

    if (!lead) {
      return NextResponse.json({ error: 'Lead not found.' }, { status: 404 });
    }

    // Update status
    const newStatus = body.status as 'new' | 'contacted' | 'in_progress' | 'completed';
    await db
      .update(websiteLeads)
      .set({ status: newStatus })
      .where(eq(websiteLeads.id, leadId));

    return NextResponse.json({
      success: true,
      leadId,
      status: body.status,
    });
  } catch (error) {
    console.error('Admin update lead error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred.' },
      { status: 500 }
    );
  }
}
