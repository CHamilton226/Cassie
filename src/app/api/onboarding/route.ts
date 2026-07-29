import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);

    const body = await request.json();
    const {
      practiceName,
      practiceType,
      city,
      state,
      phone,
      websiteUrl,
      services,
      targetCustomers,
      hours,
      bookingUrl,
      brandVoice,
      communicationStyle,
      businessGoals,
    } = body;

    // Validate required fields
    if (!practiceName || typeof practiceName !== 'string' || practiceName.trim().length === 0) {
      return NextResponse.json({ error: 'Practice name is required' }, { status: 400 });
    }
    if (!practiceType || typeof practiceType !== 'string' || practiceType.trim().length === 0) {
      return NextResponse.json({ error: 'Practice type is required' }, { status: 400 });
    }
    if (!city || typeof city !== 'string' || city.trim().length === 0) {
      return NextResponse.json({ error: 'City is required' }, { status: 400 });
    }
    if (!state || typeof state !== 'string' || state.trim().length === 0) {
      return NextResponse.json({ error: 'State is required' }, { status: 400 });
    }

    // Check if user already has a practice
    const existingPractice = await db.query.practices.findFirst({
      where: eq(practices.userId, userId),
    });

    if (existingPractice) {
      return NextResponse.json({ error: 'Practice already exists for this user' }, { status: 409 });
    }

    const [practice] = await db.insert(practices).values({
      userId,
      practiceName: practiceName.trim(),
      practiceType: practiceType.trim(),
      city: city.trim(),
      state: state.trim().toUpperCase(),
      phone: phone?.trim() || null,
      websiteUrl: websiteUrl?.trim() || null,
      services: services?.trim() || null,
      targetCustomers: targetCustomers?.trim() || null,
      hours: hours?.trim() || null,
      bookingUrl: bookingUrl?.trim() || null,
      brandVoice: brandVoice?.trim() || null,
      communicationStyle: communicationStyle?.trim() || null,
      businessGoals: businessGoals?.trim() || null,
      growthScore: null as any,
    }).returning();

    return NextResponse.json({
      success: true,
      message: 'Practice profile saved successfully',
      practiceId: practice.id,
    });
  } catch (error) {
    console.error('Onboarding error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
