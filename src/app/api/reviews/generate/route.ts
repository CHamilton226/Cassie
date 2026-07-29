import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, users, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────
const SENTIMENTS = ['Positive', 'Neutral', 'Negative'] as const;

const TONES = [
  'Warm & Appreciative',
  'Professional',
  'Short & Sweet',
  'Apologetic',
  'Service Recovery',
] as const;

interface GenerateRequest {
  reviewText: string;
  sentiment: string;
  tone: string;
  practiceName?: string;
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
function buildSystemPrompt(
  practice: any,
  params: GenerateRequest
): string {
  const practiceDetails = [
    `Practice Name: ${practice.practiceName || 'N/A'}`,
    `Practice Type: ${practice.practiceType || 'N/A'}`,
    `Location: ${[practice.city, practice.state].filter(Boolean).join(', ') || 'N/A'}`,
    `Services: ${practice.services || 'N/A'}`,
    `Brand Voice: ${practice.brandVoice || 'Professional and caring'}`,
    `Communication Style: ${practice.communicationStyle || 'Clear and empathetic'}`,
  ].join('\n');

  const displayName = params.practiceName?.trim() || practice.practiceName || 'our practice';
  const displayType = practice.practiceType || 'healthcare practice';

  return `You are a professional healthcare practice manager at ${displayName}, a ${displayType}. Your task is to write a HIPAA-appropriate public response to an online review. You must follow these rules WITHOUT EXCEPTION:

─── ABSOLUTE RULES (HIPAA & LIABILITY COMPLIANCE) ───

1. NEVER confirm, imply, or suggest that the reviewer is or was a patient at this practice. Use phrases like "We appreciate all feedback," "We value everyone who shares their experience," or "Thank you for taking the time to share your thoughts."
2. NEVER disclose, reference, or allude to any protected health information (PHI) — including treatment details, appointment dates, conditions, medications, or any clinical information.
3. NEVER admit fault, liability, negligence, or wrongdoing. Do not apologize for specific clinical outcomes, medical errors, or treatment results.
4. NEVER discuss specific medical care, diagnoses, or treatment plans — even if the reviewer mentions them.
5. If the reviewer mentions specific care details, respond generally without acknowledging those details.
6. Do NOT use language that could be construed as a HIPAA violation or admission of liability.
7. Sign the response with the practice name and/or the name provided by the user (if any), but not with a specific doctor's name unless the user explicitly provided it.

─── RESPONSE GUIDELINES BY SENTIMENT ───

The review sentiment is: **${params.sentiment}**

${params.sentiment === 'Positive' ? `
**For Positive reviews:**
- Thank the reviewer warmly and sincerely — but do NOT say "Thank you for being our patient" or "We're glad you chose us for your care." Instead say things like "Thank you for your kind words," "We truly appreciate you taking the time to share your experience," or "Your feedback means so much to our team."
- Express that their feedback motivates the team.
- Mention that the practice strives to provide excellent service to everyone.
- Keep it warm, appreciative, and professional.
- Invite them to reach out anytime with questions (via phone or website — do not mention appointments unless the practice offers online booking).
` : params.sentiment === 'Negative' ? `
**For Negative reviews:**
- Start by acknowledging the reviewer's feelings without confirming they were a patient: "We hear your concerns," "We take all feedback seriously," "Thank you for bringing these matters to our attention."
- Express regret for their experience without admitting fault: "We're sorry to hear about your experience," "We regret that your interaction didn't meet expectations."
- Do NOT make specific promises about investigating or correcting issues — instead use general language: "We continuously work to improve the experience for everyone who visits us."
- Invite them to continue the conversation privately — provide the practice phone number or a general email address. Say something like: "We'd welcome the opportunity to hear more about your concerns. Please reach out to us directly at [phone]."
- Remain professional and constructive. Never be defensive, argumentative, or dismissive.
- End on a forward-looking note about the practice's commitment to quality.
` : `
**For Neutral reviews:**
- Thank them for taking the time to share their feedback.
- Appreciate their honest perspective — every piece of feedback helps the practice improve.
- Keep it professional, concise, and warm.
- Mention that the practice values continuous improvement and feedback from everyone in the community.
- End with a general invitation to reach out if they ever have questions.
`}

─── TONE GUIDANCE ───
The requested tone is: **${params.tone}**
Adjust the emotional register accordingly while maintaining all compliance rules above.

─── PRACTICE DETAILS ───
${practiceDetails}

Write a response that is professional, HIPAA-compliant, and appropriate for public display on review platforms like Google Reviews, Healthgrades, Yelp, or Facebook. The response should be 2-5 short paragraphs.`;
}

function buildUserPrompt(params: GenerateRequest): string {
  return `Here is the review to respond to:

"${params.reviewText}"

Please write a public response following all the guidelines in the system prompt.
Sentiment: ${params.sentiment}
Tone: ${params.tone}
${params.practiceName ? `Sign with: ${params.practiceName}` : ''}`;
}

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

    // 2. Parse and validate inputs
    let body: GenerateRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { reviewText, sentiment, tone, practiceName } = body;

    if (!reviewText || reviewText.trim().length < 10) {
      return NextResponse.json(
        { error: 'Please paste a review (at least 10 characters).' },
        { status: 400 }
      );
    }

    if (reviewText.length > 3000) {
      return NextResponse.json(
        { error: 'Review text is too long. Maximum 3,000 characters.' },
        { status: 400 }
      );
    }

    if (!sentiment || !SENTIMENTS.includes(sentiment as any)) {
      return NextResponse.json(
        {
          error: `Invalid sentiment. Must be one of: ${SENTIMENTS.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (!tone || !TONES.includes(tone as any)) {
      return NextResponse.json(
        {
          error: `Invalid tone. Must be one of: ${TONES.join(', ')}`,
        },
        { status: 400 }
      );
    }

    if (practiceName && practiceName.length > 100) {
      return NextResponse.json(
        { error: 'Practice/Doctor name is too long. Maximum 100 characters.' },
        { status: 400 }
      );
    }

    // 3. Check OpenAI API key
    const apiKey = env.OPENAI_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            'AI features are being configured. Our team is setting up the AI engine. Check back soon!',
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
      return NextResponse.json(
        { error: 'Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // 5. Check usage limits
    const tier = user.subscriptionTier || 'free';
    const limit = TIER_LIMITS[tier] || 10;
    const used = user.aiGenerationsUsed || 0;

    if (used >= limit) {
      return NextResponse.json(
        {
          error: `You've used all ${used} of your ${limit} AI generations this month. Upgrade your plan to continue generating review responses.`,
          code: 'LIMIT_REACHED',
          used,
          limit,
        },
        { status: 429 }
      );
    }

    // 6. Call OpenAI API
    const systemPrompt = buildSystemPrompt(practice, {
      reviewText: reviewText.trim(),
      sentiment,
      tone,
      practiceName: practiceName?.trim(),
    });
    const userPrompt = buildUserPrompt({
      reviewText: reviewText.trim(),
      sentiment,
      tone,
      practiceName: practiceName?.trim(),
    });

    let generatedText: string;

    try {
      const openaiResponse = await fetch(
        'https://api.openai.com/v1/chat/completions',
        {
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
            max_tokens: 800,
            temperature: 0.7,
          }),
          signal: AbortSignal.timeout(45000),
        }
      );

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
        {
          error:
            'Failed to generate response. The AI service may be temporarily unavailable. Please try again.',
          code: 'AI_ERROR',
        },
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
      action: `Responded to ${sentiment} review`,
      details: `Sentiment: ${sentiment} | Tone: ${tone}${practiceName ? ` | Name: ${practiceName}` : ''} | Review preview: ${reviewText.trim().substring(0, 80)}...`,
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
    console.error('Review generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
