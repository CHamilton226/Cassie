import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { marketingPlans, practices, users, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';

interface RegenerateDayRequest {
  planId: number;
  day: number;
}

// ─── Tier Limits ──────────────────────────────────────────────
const TIER_LIMITS: Record<string, number> = {
  free: 10,
  starter: 50,
  pro: 200,
  practice: 500,
  agency: 2000,
};

export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);

    // 2. Parse and validate inputs
    let body: RegenerateDayRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { planId, day } = body;

    if (!planId || typeof planId !== 'number' || planId < 1) {
      return NextResponse.json({ error: 'Invalid plan ID.' }, { status: 400 });
    }

    if (!day || typeof day !== 'number' || day < 1 || day > 30) {
      return NextResponse.json({ error: 'Invalid day number. Must be 1-30.' }, { status: 400 });
    }

    // 3. Check OpenAI API key
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error: 'AI features are being configured. Our team is setting up the AI engine. Check back soon!',
          code: 'NO_API_KEY',
        },
        { status: 503 }
      );
    }

    // 4. Get user, practice, and plan
    const user = await db.query.users.findFirst({
      where: eq(users.id, userId),
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found.' }, { status: 404 });
    }

    const practice = await db.query.practices.findFirst({
      where: eq(practices.userId, userId),
    });

    if (!practice) {
      return NextResponse.json({ error: 'Please complete onboarding first.' }, { status: 404 });
    }

    const plan = await db.query.marketingPlans.findFirst({
      where: eq(marketingPlans.id, planId),
    });

    if (!plan) {
      return NextResponse.json({ error: 'Marketing plan not found.' }, { status: 404 });
    }

    if (plan.userId !== userId) {
      return NextResponse.json({ error: 'Unauthorized.' }, { status: 403 });
    }

    // 5. Check usage limits
    const tier = user.subscriptionTier || 'free';
    const limit = TIER_LIMITS[tier] || 10;
    const used = user.aiGenerationsUsed || 0;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${used} of your ${limit} AI generations this month. Upgrade your plan to continue.`,
          code: 'LIMIT_REACHED',
          used,
          limit,
        },
        { status: 429 }
      );
    }

    // 6. Parse existing plan data
    let planData: any;
    try {
      planData = JSON.parse(plan.planData);
    } catch {
      return NextResponse.json({ error: 'Plan data is corrupted.' }, { status: 500 });
    }

    const dayIndex = planData.days.findIndex((d: any) => d.day === day);
    if (dayIndex === -1) {
      return NextResponse.json({ error: `Day ${day} not found in plan.` }, { status: 404 });
    }

    const existingDay = planData.days[dayIndex];

    // 7. Build context from surrounding days for consistency
    const contextDays = [];
    if (dayIndex > 0) contextDays.push(planData.days[dayIndex - 1]);
    if (dayIndex < planData.days.length - 1) contextDays.push(planData.days[dayIndex + 1]);

    const surroundingContext = contextDays.length > 0
      ? `\nSurrounding days for context:\n${contextDays.map((d: any) =>
        `Day ${d.day}: ${d.objective} (${d.platform}) — ${d.contentIdea}`
      ).join('\n')}`
      : '';

    // 8. Build AI prompt for single day regeneration
    const systemPrompt = `You are an expert healthcare marketing strategist for ${practice.practiceName || 'a healthcare practice'}, a ${practice.practiceType || 'healthcare practice'}.

Regenerate the content for a single day in a 30-day marketing plan. Create fresh, unique content that fits naturally within the overall plan.

─── PRACTICE CONTEXT ───
Name: ${practice.practiceName || 'N/A'}
Type: ${practice.practiceType || 'N/A'}
Location: ${[practice.city, practice.state].filter(Boolean).join(', ') || 'N/A'}
Services: ${practice.services || 'N/A'}
Target Customers: ${practice.targetCustomers || 'N/A'}
Brand Voice: ${practice.brandVoice || 'Professional and caring'}

─── PLAN CONTEXT ───
Goal: ${plan.goal}
Day to regenerate: Day ${day}
Previous platform: ${existingDay.platform || 'varies'}${surroundingContext}

─── RULES ───
1. NEVER provide medical diagnoses, treatment recommendations, or specific medical advice.
2. Generate a COMPLETE day entry with all fields.
3. The content draft must be actual usable marketing copy (50-200 words).
4. Be specific and practical — avoid vague advice.
5. Include proper formatting: hashtags for social, subject lines for email, etc.
6. Output as valid JSON only — a single JSON object with these keys:
   - "objective": string (headline, 5-12 words)
   - "platform": string (one of: "Facebook", "Instagram", "Google Business Profile", "Blog", "Email", "Website")
   - "contentIdea": string (brief description, 8-20 words)
   - "contentDraft": string (actual usable marketing copy)
   - "callToAction": string (specific CTA, 3-10 words)
   - "imageConcept": string (visual description, 5-15 words)

Return ONLY the JSON object. Start with "{" and end with "}".`;

    const userPrompt = `Regenerate the content for Day ${day} of the marketing plan. The goal is: "${plan.goal}".${plan.targetService ? ` This plan promotes: ${plan.targetService}.` : ''}

Create fresh content for this day. Output valid JSON only.`;

    // 9. Call OpenAI
    let generatedDay: any = null;

    try {
      const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt },
          ],
          max_tokens: 1500,
          temperature: 0.9,
          response_format: { type: 'json_object' },
        }),
        signal: AbortSignal.timeout(60000),
      });

      if (!openaiResponse.ok) {
        const errorBody = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorBody);
        throw new Error(`OpenAI API returned ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const rawText = data.choices?.[0]?.message?.content?.trim();

      if (!rawText) {
        throw new Error('OpenAI returned empty response');
      }

      let jsonStr = rawText;
      const codeFenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
      if (codeFenceMatch) {
        jsonStr = codeFenceMatch[1].trim();
      }
      const firstBrace = jsonStr.indexOf('{');
      const lastBrace = jsonStr.lastIndexOf('}');
      if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
        jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
      }

      generatedDay = JSON.parse(jsonStr);
    } catch (err: any) {
      console.error('OpenAI call failed:', err);
      return NextResponse.json(
        { error: 'Failed to regenerate day. The AI service may be temporarily unavailable. Please try again.', code: 'AI_ERROR' },
        { status: 502 }
      );
    }

    // 10. Merge regenerated day into plan (preserve status)
    const validPlatforms = ['Facebook', 'Instagram', 'Google Business Profile', 'Blog', 'Email', 'Website'];
    const newPlatform = validPlatforms.find(
      (v) => v.toLowerCase() === String(generatedDay.platform || '').trim().toLowerCase()
    ) || 'Facebook';

    planData.days[dayIndex] = {
      day,
      objective: String(generatedDay.objective || existingDay.objective).substring(0, 200),
      platform: newPlatform,
      contentIdea: String(generatedDay.contentIdea || existingDay.contentIdea).substring(0, 300),
      contentDraft: String(generatedDay.contentDraft || existingDay.contentDraft).substring(0, 3000),
      callToAction: String(generatedDay.callToAction || existingDay.callToAction).substring(0, 200),
      imageConcept: String(generatedDay.imageConcept || existingDay.imageConcept).substring(0, 300),
      status: existingDay.status, // Preserve existing status
    };

    // 11. Save updated plan
    await db
      .update(marketingPlans)
      .set({
        planData: JSON.stringify(planData),
      })
      .where(eq(marketingPlans.id, planId));

    // 12. Update usage count
    await db
      .update(users)
      .set({ aiGenerationsUsed: used + 1 })
      .where(eq(users.id, userId));

    // 13. Log to audit trail
    await db.insert(auditLog).values({
      userId,
      action: `Regenerated marketing plan day ${day}`,
      details: `Plan ID: ${planId} | Day: ${day} | New platform: ${newPlatform}`,
    });

    // 14. Return result
    const newUsed = used + 1;

    return NextResponse.json({
      plan: {
        id: plan.id,
        goal: plan.goal,
        targetService: plan.targetService,
        days: planData.days,
        daysCompleted: plan.daysCompleted,
        createdAt: plan.createdAt,
      },
      usage: {
        used: newUsed,
        limit,
        remaining: Math.max(0, limit - newUsed),
      },
    });
  } catch (error) {
    console.error('Marketing plan regeneration error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
