import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, users, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────
const CONTENT_TYPES = [
  'Facebook Post',
  'Instagram Caption',
  'Google Business Profile Post',
  'Blog Article',
  'Email Newsletter',
  'Service Description',
  'Patient Education Draft',
  'FAQ',
  'Seasonal Campaign',
  'Welcome Message',
] as const;

const CATEGORIES = [
  'Educational',
  'Promotional',
  'Community',
  'Seasonal',
  'Practice Updates',
  'Customer Acquisition',
  'Trust Building',
] as const;

const TONES = [
  'Professional',
  'Friendly',
  'Warm',
  'Reassuring',
  'Educational',
] as const;

const LENGTHS = ['Short', 'Medium', 'Long'] as const;

const WORD_COUNTS: Record<string, number> = {
  Short: 100,
  Medium: 250,
  Long: 500,
};

interface GenerateRequest {
  contentType: string;
  category: string;
  tone: string;
  length: string;
  topic: string;
  additionalNotes?: string;
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
    `Brand Voice: ${practice.brandVoice || 'Professional and caring'}`,
    `Communication Style: ${practice.communicationStyle || 'Clear and empathetic'}`,
    `Business Goals: ${practice.businessGoals || 'Grow practice and serve patients'}`,
  ].join('\n');

  const wordCount = WORD_COUNTS[params.length] || 250;

  return `You are a professional healthcare marketing content writer for ${practice.practiceName || 'a healthcare practice'}.

Your task is to generate high-quality, engaging content that is appropriate for a healthcare practice. Follow these rules strictly:

1. NEVER provide medical diagnoses, treatment recommendations, or specific medical advice.
2. Include a brief disclaimer when discussing any health topics (e.g., "Always consult with your healthcare provider...").
3. Write content that is empathetic, professional, and builds trust.
4. Adapt the tone to be "${params.tone}" — this is a healthcare context so maintain professionalism.
5. The content category is "${params.category}" — align the message accordingly.
6. Target approximately ${wordCount} words.
7. Include a clear call-to-action where appropriate (e.g., schedule an appointment, call us, visit our website).
8. Do NOT use placeholder text like "[Practice Name]" — use the actual practice name "${practice.practiceName || 'our practice'}".
9. Format the output with clear paragraphs. Use markdown-style formatting (no images).
10. If this is a social media post, include 3-5 relevant hashtags at the end.

PRACTICE DETAILS:
${practiceDetails}

Write content that genuinely helps and informs patients while maintaining the highest standards of healthcare communication.`;
}

function buildUserPrompt(params: GenerateRequest): string {
  const contentType = params.contentType;
  const topic = params.topic;
  const notes = params.additionalNotes;

  let prompt = `Please generate a ${contentType} about: ${topic}`;

  if (notes) {
    prompt += `\n\nAdditional notes to include: ${notes}`;
  }

  prompt += `\n\nContent type: ${contentType}`;
  prompt += `\nCategory: ${params.category}`;
  prompt += `\nTone: ${params.tone}`;
  prompt += `\nTarget length: ${params.length}`;

  return prompt;
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

    const { contentType, category, tone, length, topic, additionalNotes } = body;

    if (!contentType || !CONTENT_TYPES.includes(contentType as any)) {
      return NextResponse.json(
        { error: `Invalid content type. Must be one of: ${CONTENT_TYPES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!category || !CATEGORIES.includes(category as any)) {
      return NextResponse.json(
        { error: `Invalid category. Must be one of: ${CATEGORIES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!tone || !TONES.includes(tone as any)) {
      return NextResponse.json(
        { error: `Invalid tone. Must be one of: ${TONES.join(', ')}` },
        { status: 400 }
      );
    }

    if (!length || !LENGTHS.includes(length as any)) {
      return NextResponse.json(
        { error: `Invalid length. Must be one of: ${LENGTHS.join(', ')}` },
        { status: 400 }
      );
    }

    if (!topic || topic.trim().length < 3) {
      return NextResponse.json(
        { error: 'Please provide a topic/keywords (at least 3 characters).' },
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
          error: `You've used all ${used} of your ${limit} AI generations this month. Upgrade your plan to continue creating content.`,
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

    let generatedText: string;

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
          temperature: 0.7,
        }),
        signal: AbortSignal.timeout(45000),
      });

      if (!openaiResponse.ok) {
        const errorBody = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorBody);
        throw new Error(`OpenAI API returned ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      generatedText = data.choices?.[0]?.message?.content?.trim();

      if (!generatedText) {
        throw new Error('OpenAI returned empty response');
      }
    } catch (err: any) {
      console.error('OpenAI call failed:', err);
      return NextResponse.json(
        { error: 'Failed to generate content. The AI service may be temporarily unavailable. Please try again.', code: 'AI_ERROR' },
        { status: 502 }
      );
    }

    // 7. Update usage count
    await db
      .update(users)
      .set({ aiGenerationsUsed: used + 1 })
      .where(eq(users.id, userId));

    // 8. Log to audit trail
    await db.insert(auditLog).values({
      userId,
      action: `Generated ${contentType}`,
      details: `Topic: ${topic.substring(0, 100)} | Category: ${category} | Tone: ${tone} | Length: ${length}`,
    });

    // 9. Return result
    const newUsed = used + 1;

    return NextResponse.json({
      content: generatedText,
      usage: {
        used: newUsed,
        limit,
        remaining: Math.max(0, limit - newUsed),
      },
    });
  } catch (error) {
    console.error('Content generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
