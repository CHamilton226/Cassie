import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, users, auditLog, marketingPlans } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────
const GOALS = [
  'Get more new customers',
  'Increase local visibility',
  'Promote a specific service',
  'Build trust & credibility',
  'Increase online reviews',
  'Improve website conversions',
] as const;

interface GenerateRequest {
  goal: string;
  targetService?: string;
}

interface DayPlan {
  day: number;
  objective: string;
  platform: string;
  contentIdea: string;
  contentDraft: string;
  callToAction: string;
  imageConcept: string;
  status: 'not_started' | 'in_progress' | 'completed';
}

interface FullPlan {
  goal: string;
  targetService: string | null;
  days: DayPlan[];
}

// ─── Tier Limits ──────────────────────────────────────────────
const TIER_LIMITS: Record<string, number> = {
  free: 10,
  starter: 50,
  pro: 200,
  practice: 500,
  agency: 2000,
};

// ─── Helpers ──────────────────────────────────────────────────
function buildSystemPrompt(practice: any, params: GenerateRequest): string {
  const practiceDetails = [
    `Practice Name: ${practice.practiceName || 'N/A'}`,
    `Practice Type: ${practice.practiceType || 'N/A'}`,
    `Location: ${[practice.city, practice.state].filter(Boolean).join(', ') || 'N/A'}`,
    `Services: ${practice.services || 'N/A'}`,
    `Target Customers: ${practice.targetCustomers || 'N/A'}`,
    `Website: ${practice.websiteUrl || 'N/A'}`,
    `Brand Voice: ${practice.brandVoice || 'Professional and caring'}`,
    `Communication Style: ${practice.communicationStyle || 'Clear and empathetic'}`,
    `Business Goals: ${practice.businessGoals || 'Grow practice and serve patients'}`,
  ].join('\n');

  const targetServiceLine = params.targetService
    ? `\nSpecific service to promote: ${params.targetService}`
    : '';

  return `You are an expert healthcare marketing strategist for ${practice.practiceName || 'a healthcare practice'}, a ${practice.practiceType || 'healthcare practice'}.

Your task is to create a comprehensive, practical 30-day marketing plan with one action per day. The plan must be diverse, actionable, and tailored to the practice's specific goal.

─── PRACTICE DETAILS ───
${practiceDetails}${targetServiceLine}

─── MARKETING GOAL ───
The primary goal is: **${params.goal}**

─── PLAN DESIGN RULES ───

1. **30 DAYS, ONE PER DAY**: Generate exactly 30 day entries (day 1 through day 30). Each day must have ONE clear marketing task.

2. **PLATFORM ROTATION**: Distribute across these platforms naturally, never using the same platform more than 2 days in a row:
   - Facebook (posts, stories, events, community engagement)
   - Instagram (posts, reels, stories, carousels)
   - Google Business Profile (posts, updates, offers, Q&A)
   - Blog (website articles, patient education, FAQs)
   - Email (newsletters, patient reminders, seasonal outreach)
   - Website (landing page copy, service page improvements, testimonials)

3. **CONTENT MIX**: Alternate between these content types:
   - Educational (health tips, wellness advice, procedure info — no medical diagnoses)
   - Promotional (service highlights, offers, new patient specials)
   - Community (local events, patient spotlights, community involvement)
   - Trust-building (testimonials, credentials, team introductions, awards)
   - Engagement (polls, questions, calls for reviews, interactive content)
   - Behind-the-scenes (team features, office tours, day-in-the-life)

4. **PROGRESSIVE STRUCTURE**:
   - Days 1-5: Foundation (profile optimization, content planning, review generation)
   - Days 6-15: Active growth (consistent posting, community engagement, content creation)
   - Days 16-25: Amplification (boosting successful content, partnerships, referral asks)
   - Days 26-30: Optimization & planning (analyze results, plan next month, capitalize on wins)

5. **Content Drafts**: Each day's contentDraft must be actual usable marketing copy — ready to post or send. Include proper formatting, hashtags for social platforms, subject lines for emails, etc. Drafts should be 50-200 words each.

6. **Image Concepts**: Describe a specific, practical image that would accompany the content (no generic advice).

7. **CTAs**: Every day must have a clear, specific call to action.

8. **NEVER provide medical diagnoses, treatment recommendations, or specific medical advice.** Include brief disclaimers when discussing health topics.

9. **Be specific and practical** — avoid vague advice like "post on social media." Each day's task must include exactly what to post/send/create.

10. **Output as valid JSON** — a JSON object with a "days" array of 30 day objects. Each day object must have these exact keys:
    - "day": number (1-30)
    - "objective": string (headline for the day's goal, 5-12 words)
    - "platform": string (one of: "Facebook", "Instagram", "Google Business Profile", "Blog", "Email", "Website")
    - "contentIdea": string (brief description of what to create, 8-20 words)
    - "contentDraft": string (the actual usable marketing copy)
    - "callToAction": string (specific CTA, 3-10 words)
    - "imageConcept": string (description of the visual to use, 5-15 words)

Return ONLY the JSON object, no other text. The response must start with "{" and end with "}".`;
}

function buildUserPrompt(params: GenerateRequest): string {
  return `Create a complete 30-day marketing plan for a healthcare practice with the goal: "${params.goal}"${params.targetService ? `, specifically promoting: ${params.targetService}` : ''}.

Generate exactly 30 days of diverse, actionable marketing tasks as specified in the system prompt. Output valid JSON only.`;
}

// ─── Parse AI response ────────────────────────────────────────
function parsePlanResponse(rawText: string): FullPlan | null {
  // Try to extract JSON from the response
  let jsonStr = rawText.trim();
  
  // Remove markdown code fences if present
  const codeFenceMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
  if (codeFenceMatch) {
    jsonStr = codeFenceMatch[1].trim();
  }

  // Try to find JSON object boundaries
  const firstBrace = jsonStr.indexOf('{');
  const lastBrace = jsonStr.lastIndexOf('}');
  if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
    jsonStr = jsonStr.substring(firstBrace, lastBrace + 1);
  }

  try {
    const parsed = JSON.parse(jsonStr);
    
    if (!parsed.days || !Array.isArray(parsed.days)) {
      console.error('Missing days array in parsed response');
      return null;
    }

    const days: DayPlan[] = parsed.days.slice(0, 30).map((d: any, idx: number) => ({
      day: typeof d.day === 'number' ? d.day : idx + 1,
      objective: String(d.objective || `Day ${idx + 1} Marketing Task`).substring(0, 200),
      platform: validatePlatform(String(d.platform || 'Facebook')),
      contentIdea: String(d.contentIdea || 'Create engaging content').substring(0, 300),
      contentDraft: String(d.contentDraft || 'Create a post about your services.').substring(0, 3000),
      callToAction: String(d.callToAction || 'Contact us today').substring(0, 200),
      imageConcept: String(d.imageConcept || 'Professional healthcare imagery').substring(0, 300),
      status: 'not_started' as const,
    }));

    // Ensure we have exactly 30 days
    while (days.length < 30) {
      const nextDay = days.length + 1;
      days.push({
        day: nextDay,
        objective: `Day ${nextDay} Marketing Task`,
        platform: 'Facebook',
        contentIdea: 'Create engaging healthcare content',
        contentDraft: 'Share valuable health information with your community.',
        callToAction: 'Contact us today',
        imageConcept: 'Professional healthcare image',
        status: 'not_started',
      });
    }

    // Re-number days 1-30
    days.forEach((d, i) => {
      d.day = i + 1;
    });

    return {
      goal: parsed.goal || '',
      targetService: parsed.targetService || null,
      days,
    };
  } catch (err) {
    console.error('Failed to parse plan JSON:', err);
    return null;
  }
}

function validatePlatform(platform: string): string {
  const valid = ['Facebook', 'Instagram', 'Google Business Profile', 'Blog', 'Email', 'Website'];
  const normalized = platform.trim();
  // Try to find a match
  const found = valid.find(
    (v) => v.toLowerCase() === normalized.toLowerCase()
  );
  return found || 'Facebook';
}

// ─── POST Handler ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Authenticate
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized. Please log in.' }, { status: 401 });
    }

    const userId = parseInt((session.user as any).id, 10);

    // 2. Parse and validate inputs
    let body: GenerateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
    }

    const { goal, targetService } = body;

    if (!goal || !GOALS.includes(goal as any)) {
      return NextResponse.json(
        { error: `Invalid goal. Must be one of: ${GOALS.join(', ')}` },
        { status: 400 }
      );
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

    // 4. Get user and practice
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

    // 5. Check usage limits
    const tier = user.subscriptionTier || 'free';
    const limit = TIER_LIMITS[tier] || 10;
    const used = user.aiGenerationsUsed || 0;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${used} of your ${limit} AI generations this month. Upgrade your plan to continue creating marketing plans.`,
          code: 'LIMIT_REACHED',
          used,
          limit,
        },
        { status: 429 }
      );
    }

    // 6. Call OpenAI API
    const systemPrompt = buildSystemPrompt(practice, body);
    const userPrompt = buildUserPrompt(body);

    let planData: FullPlan | null = null;
    let retries = 0;
    const maxRetries = 2;

    while (!planData && retries <= maxRetries) {
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
            max_tokens: 8000,
            temperature: 0.8,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(120000),
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

        planData = parsePlanResponse(rawText);

        if (!planData) {
          retries++;
          console.error(`Failed to parse plan on attempt ${retries}`);
        }
      } catch (err: any) {
        retries++;
        console.error('OpenAI call failed:', err);
        if (retries > maxRetries) {
          return NextResponse.json(
            { error: 'Failed to generate marketing plan. The AI service may be temporarily unavailable. Please try again.', code: 'AI_ERROR' },
            { status: 502 }
          );
        }
      }
    }

    if (!planData) {
      return NextResponse.json(
        { error: 'Failed to generate a valid marketing plan. Please try again.', code: 'AI_ERROR' },
        { status: 502 }
      );
    }

    // Set the goal from the request
    planData.goal = goal;
    planData.targetService = targetService?.trim() || null;

    // 7. Update usage count
    await db
      .update(users)
      .set({ aiGenerationsUsed: used + 1 })
      .where(eq(users.id, userId));

    // 8. Save plan to database
    const planJson = JSON.stringify(planData);
    
    const [savedPlan] = await db
      .insert(marketingPlans)
      .values({
        userId,
        practiceId: practice.id,
        goal,
        targetService: targetService?.trim() || null,
        planData: planJson,
        daysCompleted: 0,
      })
      .returning();

    // 9. Log to audit trail
    await db.insert(auditLog).values({
      userId,
      action: 'Generated 30-Day Marketing Plan',
      details: `Goal: ${goal}${targetService ? ` | Service: ${targetService}` : ''}`,
    });

    // 10. Return result
    const newUsed = used + 1;

    return NextResponse.json({
      plan: {
        id: savedPlan.id,
        ...planData,
        daysCompleted: 0,
        createdAt: savedPlan.createdAt,
      },
      usage: {
        used: newUsed,
        limit,
        remaining: Math.max(0, limit - newUsed),
      },
    });
  } catch (error) {
    console.error('Marketing plan generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
