import { getServerSession } from 'next-auth';
import { NextResponse } from 'next/server';
import { authOptions } from '@/lib/auth';
import { db } from '@/db';
import { practices, users, auditLog } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────
interface AuditRequest {
  websiteUrl: string;
}

interface CategoryScore {
  label: string;
  score: number;
  summary: string;
}

interface Recommendation {
  id: string;
  tier: 'critical' | 'important' | 'optimization';
  category: string;
  whatToFix: string;
  whyItMatters: string;
  howToFix: string;
}

interface AuditResult {
  overallScore: number;
  categories: CategoryScore[];
  recommendations: Recommendation[];
  summaryText: string;
}

// ─── Helpers ──────────────────────────────────────────────────
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

function buildSystemPrompt(practice: any, websiteUrl: string): string {
  const practiceDetails = [
    `Practice Name: ${practice.practiceName || 'N/A'}`,
    `Practice Type: ${practice.practiceType || 'N/A'}`,
    `Location: ${[practice.city, practice.state].filter(Boolean).join(', ') || 'N/A'}`,
    `Services: ${practice.services || 'N/A'}`,
    `Target Customers: ${practice.targetCustomers || 'N/A'}`,
    `Phone: ${practice.phone || 'N/A'}`,
    `Business Goals: ${practice.businessGoals || 'N/A'}`,
    `Brand Voice: ${practice.brandVoice || 'Professional and caring'}`,
    `Communication Style: ${practice.communicationStyle || 'Clear and empathetic'}`,
  ].join('\n');

  return `You are an expert healthcare marketing consultant who analyzes practice websites for growth opportunities. You provide honest, actionable assessments. Your tone is supportive but direct — like a seasoned consultant who genuinely wants the practice to succeed.

You are analyzing the website: ${websiteUrl}
for a ${practice.practiceType || 'healthcare practice'} called "${practice.practiceName || 'the practice'}".

IMPORTANT: You do not have access to the actual website content, so you must base your analysis on:
1. The URL itself (domain name quality, TLD, structure, memorability, branding clues)
2. The practice details provided
3. Industry best practices for healthcare websites
4. Common patterns and pitfalls for ${practice.practiceType || 'healthcare'} practices

Be SPECIFIC and ACTIONABLE. Avoid vague advice. Every recommendation should be something a practice owner can act on.

Evaluate across these 6 categories:

1. **Website** (scored 0-100): 
   - Domain name quality (memorable? branded? keyword-rich?) 
   - Likely platform/infrastructure (based on URL patterns if any)
   - URL structure and cleanliness
   - Mobile-friendliness likelihood
   - Page speed considerations

2. **Visibility** (scored 0-100): 
   - Local SEO potential
   - Domain authority indicators
   - Google Business Profile opportunity assessment
   - Directory listing completeness likelihood
   - Search ranking potential for local ${practice.practiceType || 'healthcare'} queries

3. **Trust** (scored 0-100): 
   - Likely presence of trust signals (credentials, certifications, reviews)
   - HIPAA/privacy signals
   - Contact information accessibility
   - About/team page likelihood
   - Patient testimonial/review integration

4. **Conversion** (scored 0-100): 
   - Likely CTA effectiveness
   - Appointment booking flow
   - Phone number prominence
   - Contact form quality
   - New patient acquisition pathway

5. **Content** (scored 0-100): 
   - Likely content quality and depth
   - Service page completeness
   - FAQ/resource section
   - Blog or educational content
   - Readability and accessibility

6. **Customer Experience** (scored 0-100): 
   - Navigation likely usability
   - New patient onboarding experience
   - Insurance/financial information clarity
   - Hours and location accessibility
   - Pre-visit and post-visit information flow

Return your analysis as a JSON object with this EXACT structure — no markdown, no code fences, just raw JSON:

{
  "overallScore": <number 0-100, weighted average of categories, rounded to integer>,
  "summaryText": "<2-3 sentence executive summary of the practice's online presence, highlighting the biggest opportunity>",
  "categories": [
    { "label": "Website", "score": <0-100>, "summary": "<one-line assessment>" },
    { "label": "Visibility", "score": <0-100>, "summary": "<one-line assessment>" },
    { "label": "Trust", "score": <0-100>, "summary": "<one-line assessment>" },
    { "label": "Conversion", "score": <0-100>, "summary": "<one-line assessment>" },
    { "label": "Content", "score": <0-100>, "summary": "<one-line assessment>" },
    { "label": "Customer Experience", "score": <0-100>, "summary": "<one-line assessment>" }
  ],
  "recommendations": [
    {
      "id": "rec-1",
      "tier": "critical",
      "category": "<one of the 6 categories>",
      "whatToFix": "<specific issue — be concrete and actionable>",
      "whyItMatters": "<why this impacts patient acquisition or practice growth>",
      "howToFix": "<concrete 2-3 step fix>"
    }
  ]
}

RULES:
- Provide 4-8 recommendations total, spread across the three tiers ("critical", "important", "optimization")
- critical = urgent, directly costing patients/revenue
- important = should fix within 30 days
- optimization = nice-to-have improvements
- Ensure categories are distributed among the recommendations
- Scores should be honest and realistic — the average practice website scores 45-65
- If the URL looks professional (custom domain, no subdomain, .com), score higher in Website/Trust
- If it's a subdomain or free platform (wix, squarespace, etc.), note that as a limitation
- The overallScore should MATCH the raw average of the 6 category scores`;
}

function buildUserPrompt(websiteUrl: string): string {
  return `Analyze: ${websiteUrl}

Remember to return ONLY valid JSON — no markdown, no explanation outside the JSON. The JSON must parse with JSON.parse().`;
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

    // 2. Parse and validate input
    let body: AuditRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { websiteUrl } = body;

    if (!websiteUrl || !websiteUrl.trim()) {
      return NextResponse.json(
        { error: 'Please provide a website URL to audit.' },
        { status: 400 }
      );
    }

    const trimmedUrl = websiteUrl.trim();

    if (!isValidUrl(trimmedUrl)) {
      return NextResponse.json(
        { error: 'Please enter a valid website URL (e.g., mypractice.com).' },
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
      return NextResponse.json(
        { error: 'Please complete onboarding first.' },
        { status: 404 }
      );
    }

    // 5. Call OpenAI API
    const systemPrompt = buildSystemPrompt(practice, trimmedUrl);
    const userPrompt = buildUserPrompt(trimmedUrl);

    let result: AuditResult;

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
            max_tokens: 2500,
            temperature: 0.4,
            response_format: { type: 'json_object' },
          }),
          signal: AbortSignal.timeout(60000),
        }
      );

      if (!openaiResponse.ok) {
        const errorBody = await openaiResponse.text();
        console.error('OpenAI API error:', openaiResponse.status, errorBody);
        throw new Error(`OpenAI API returned ${openaiResponse.status}`);
      }

      const data = await openaiResponse.json();
      const rawContent = data.choices?.[0]?.message?.content?.trim();

      if (!rawContent) {
        throw new Error('OpenAI returned empty response');
      }

      // Parse the JSON
      let parsed: any;
      try {
        parsed = JSON.parse(rawContent);
      } catch {
        // Try to extract JSON from markdown code fences
        const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
        if (jsonMatch) {
          parsed = JSON.parse(jsonMatch[1]);
        } else {
          throw new Error('Failed to parse AI response as JSON');
        }
      }

      // Validate the parsed result
      if (
        typeof parsed.overallScore !== 'number' ||
        !Array.isArray(parsed.categories) ||
        parsed.categories.length < 6 ||
        !Array.isArray(parsed.recommendations)
      ) {
        throw new Error('AI response missing required fields');
      }

      // Ensure overall score is within bounds
      const overallScore = Math.max(0, Math.min(100, Math.round(parsed.overallScore)));

      result = {
        overallScore,
        summaryText: parsed.summaryText || '',
        categories: parsed.categories.slice(0, 6).map((c: any) => ({
          label: c.label || 'Unknown',
          score: Math.max(0, Math.min(100, Math.round(c.score || 0))),
          summary: c.summary || '',
        })),
        recommendations: parsed.recommendations.map((r: any, i: number) => ({
          id: r.id || `rec-${i + 1}`,
          tier: ['critical', 'important', 'optimization'].includes(r.tier)
            ? r.tier
            : 'important',
          category: r.category || 'General',
          whatToFix: r.whatToFix || '',
          whyItMatters: r.whyItMatters || '',
          howToFix: r.howToFix || '',
        })),
      };
    } catch (err: any) {
      console.error('OpenAI call failed:', err);
      return NextResponse.json(
        {
          error: 'Failed to generate audit. The AI service may be temporarily unavailable. Please try again.',
          code: 'AI_ERROR',
        },
        { status: 502 }
      );
    }

    // 6. Save growth score to practice
    await db
      .update(practices)
      .set({ growthScore: result.overallScore })
      .where(eq(practices.id, practice.id));

    // 7. Log to audit trail
    await db.insert(auditLog).values({
      userId,
      action: 'Ran Website Growth Audit',
      details: `URL: ${trimmedUrl} | Score: ${result.overallScore}/100 | Categories: ${result.categories.map((c) => `${c.label}=${c.score}`).join(', ')}`,
    });

    // 8. Return result
    return NextResponse.json({
      success: true,
      overallScore: result.overallScore,
      summaryText: result.summaryText,
      categories: result.categories,
      recommendations: result.recommendations,
      websiteUrl: trimmedUrl,
      practiceId: practice.id,
      previousScore: practice.growthScore || null,
    });
  } catch (error) {
    console.error('Audit generation error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
