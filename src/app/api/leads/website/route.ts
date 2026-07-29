import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, websiteLeads } from '@/db/schema';
import { eq } from 'drizzle-orm';

// ─── Types ────────────────────────────────────────────────────
interface LeadRequest {
  practiceId: number;
  contactName: string;
  email: string;
  phone?: string;
  budgetRange?: string;
  message?: string;
}

const BUDGET_RANGES = [
  'Under $500',
  '$500 – $1,500',
  '$1,500 – $5,000',
  '$5,000 – $10,000',
  '$10,000+',
  'Not sure yet',
] as const;

// ─── POST Handler ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      );
    }

    const userId = parseInt((session.user as any).id, 10);

    // 2. Parse and validate input
    let body: LeadRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { practiceId, contactName, email, phone, budgetRange, message } = body;

    // Validate required fields
    if (!contactName || !contactName.trim()) {
      return NextResponse.json(
        { error: 'Please provide your name.' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { error: 'Please provide your email address.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      return NextResponse.json(
        { error: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    if (!practiceId || typeof practiceId !== 'number') {
      return NextResponse.json(
        { error: 'Practice ID is required.' },
        { status: 400 }
      );
    }

    if (budgetRange && !BUDGET_RANGES.includes(budgetRange as any)) {
      return NextResponse.json(
        { error: `Invalid budget range. Must be one of: ${BUDGET_RANGES.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Verify practice belongs to user
    const practice = await db.query.practices.findFirst({
      where: eq(practices.id, practiceId),
    });

    if (!practice) {
      return NextResponse.json(
        { error: 'Practice not found.' },
        { status: 404 }
      );
    }

    if (practice.userId !== userId) {
      return NextResponse.json(
        { error: 'Unauthorized access to practice.' },
        { status: 403 }
      );
    }

    // 4. Insert lead
    const [lead] = await db
      .insert(websiteLeads)
      .values({
        practiceId,
        userId,
        contactName: contactName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone?.trim() || null,
        budgetRange: budgetRange || null,
        message: message?.trim() || null,
        status: 'new',
      })
      .returning();

    // 5. Return success
    return NextResponse.json({
      success: true,
      leadId: lead.id,
      message: 'Thank you! Our team will reach out to discuss how we can help improve your website.',
    });
  } catch (error) {
    console.error('Lead submission error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
