import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { marketingPlans, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';

interface UpdateDayRequest {
  planId: number;
  day: number;
  status: 'not_started' | 'in_progress' | 'completed';
}

const VALID_STATUSES = ['not_started', 'in_progress', 'completed'] as const;

export async function PUT(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);

    // 2. Parse and validate inputs
    let body: UpdateDayRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { planId, day, status } = body;

    if (!planId || typeof planId !== 'number' || planId < 1) {
      return NextResponse.json({ error: 'Invalid plan ID.' }, { status: 400 });
    }

    if (!day || typeof day !== 'number' || day < 1 || day > 30) {
      return NextResponse.json({ error: 'Invalid day number. Must be 1-30.' }, { status: 400 });
    }

    if (!status || !VALID_STATUSES.includes(status as any)) {
      return NextResponse.json(
        { error: `Invalid status. Must be one of: ${VALID_STATUSES.join(', ')}` },
        { status: 400 }
      );
    }

    // 3. Get the plan
    const plan = await db.query.marketingPlans.findFirst({
      where: eq(marketingPlans.id, planId),
    });

    if (!plan) {
      return NextResponse.json({ error: 'Marketing plan not found.' }, { status: 404 });
    }

    if (plan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // 4. Update the day status in plan_data JSON
    let planData: any;
    try {
      planData = JSON.parse(plan.planData);
    } catch {
      return NextResponse.json({ error: 'Plan data is corrupted.' }, { status: 500 });
    }

    if (!planData.days || !Array.isArray(planData.days)) {
      return NextResponse.json({ error: 'Plan data is corrupted.' }, { status: 500 });
    }

    const dayIndex = planData.days.findIndex((d: any) => d.day === day);
    if (dayIndex === -1) {
      return NextResponse.json({ error: `Day ${day} not found in plan.` }, { status: 404 });
    }

    planData.days[dayIndex].status = status;

    // 5. Count completed days
    const daysCompleted = planData.days.filter(
      (d: any) => d.status === 'completed'
    ).length;

    // 6. Save updated plan
    await db
      .update(marketingPlans)
      .set({
        planData: JSON.stringify(planData),
        daysCompleted,
      })
      .where(eq(marketingPlans.id, planId));

    // 7. Log to audit trail
    await db.insert(auditLog).values({
      userId,
      action: `Updated marketing plan day ${day}`,
      details: `Plan ID: ${planId} | Day: ${day} | Status: ${status} | ${daysCompleted}/30 completed`,
    });

    // 8. Return updated plan
    return NextResponse.json({
      plan: {
        id: plan.id,
        goal: plan.goal,
        targetService: plan.targetService,
        days: planData.days,
        daysCompleted,
        createdAt: plan.createdAt,
      },
    });
  } catch (error) {
    console.error('Marketing plan update error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
