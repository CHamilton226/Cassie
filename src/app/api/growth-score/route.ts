import { NextResponse } from 'next/server';
import { db } from '@/db';
import { growthScoreLeads } from '@/db/schema';
import { env } from '@/lib/env';

// ─── Types ────────────────────────────────────────────────────
interface GrowthScoreRequest {
  practiceName: string;
  websiteUrl: string;
  practiceType: string;
  city: string;
  state: string;
  email: string;
}

interface CategoryScore {
  label: string;
  score: number;
  summary: string;
}

interface GrowthScoreResult {
  overallScore: number;
  categories: CategoryScore[];
  recommendations: string[];
}

// ─── Constants ────────────────────────────────────────────────
const PRACTICE_TYPES = [
  'Primary Care',
  'Dental',
  'Physical Therapy',
  'Chiropractic',
  'Home Health',
  'Hospice',
  'Senior Care',
  'Mental Health',
  'Specialty Clinic',
  'Other',
] as const;

const US_STATES = [
  'AL','AK','AZ','AR','CA','CO','CT','DE','FL','GA',
  'HI','ID','IL','IN','IA','KS','KY','LA','ME','MD',
  'MA','MI','MN','MS','MO','MT','NE','NV','NH','NJ',
  'NM','NY','NC','ND','OH','OK','OR','PA','RI','SC',
  'SD','TN','TX','UT','VT','VA','WA','WV','WI','WY',
  'DC',
] as const;

// ─── Helpers ──────────────────────────────────────────────────
function isValidUrl(url: string): boolean {
  try {
    const parsed = new URL(url.startsWith('http') ? url : `https://${url}`);
    return parsed.hostname.includes('.');
  } catch {
    return false;
  }
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Generate a deterministic-but-reasonable mock score when no API key is available.
 * Uses URL characteristics to create a plausible score.
 */
function generateMockScore(url: string, practiceType: string, city: string): GrowthScoreResult {
  const normalizedUrl = url.startsWith('http') ? url : `https://${url}`;
  let parsed: URL;
  try {
    parsed = new URL(normalizedUrl);
  } catch {
    parsed = new URL('https://example.com');
  }

  const hostname = parsed.hostname.toLowerCase();

  // Score the Website category based on URL quality
  let websiteScore = 50;
  if (hostname.endsWith('.com')) websiteScore += 15;
  else if (hostname.endsWith('.org')) websiteScore += 10;
  else if (hostname.endsWith('.net')) websiteScore += 5;

  // Custom domain vs subdomain
  const parts = hostname.split('.');
  if (parts.length <= 3 && !hostname.includes('wix') && !hostname.includes('squarespace') && !hostname.includes('wordpress')) {
    websiteScore += 10;
  }
  if (hostname.includes('wix') || hostname.includes('squarespace') || hostname.includes('weebly')) {
    websiteScore -= 15;
  }

  // Domain length
  const domainName = parts[0];
  if (domainName.length >= 4 && domainName.length <= 15) websiteScore += 5;
  if (domainName.length > 20) websiteScore -= 5;

  // Has keywords related to practice
  const healthcareKeywords = ['care', 'health', 'med', 'clinic', 'doctor', 'dental', 'therapy', 'wellness', 'patient'];
  if (healthcareKeywords.some((kw) => domainName.includes(kw))) websiteScore += 5;

  websiteScore = Math.max(10, Math.min(95, websiteScore));

  // Visibility score based on URL + location hints
  let visibilityScore = 40;
  // City in domain helps local SEO
  const cityLower = city.toLowerCase().replace(/\s+/g, '');
  if (domainName.includes(cityLower)) visibilityScore += 15;
  if (domainName.length <= 12) visibilityScore += 5;
  if (domainName.includes(practiceType.toLowerCase().replace(/\s+/g, ''))) visibilityScore += 5;
  visibilityScore = Math.max(10, Math.min(90, visibilityScore));

  // Trust score
  let trustScore = 45;
  if (hostname.endsWith('.com') || hostname.endsWith('.org')) trustScore += 10;
  if (!hostname.includes('free') && !hostname.includes('blog')) trustScore += 5;
  if (parts.length <= 3) trustScore += 5;
  trustScore = Math.max(10, Math.min(90, trustScore));

  // Calculate overall
  const overallScore = Math.round((websiteScore + visibilityScore + trustScore) / 3);

  // Generate category summaries
  const websiteSummary = websiteScore >= 70
    ? 'Your domain looks professional and well-branded.'
    : websiteScore >= 45
    ? 'Your website foundation is decent but could be strengthened.'
    : 'Your website domain could benefit from a more professional, branded URL.';

  const visibilitySummary = visibilityScore >= 70
    ? 'Good local visibility signals detected in your web presence.'
    : visibilityScore >= 45
    ? 'Your visibility has room to grow with better local SEO.'
    : 'Your practice may be hard to find online in local searches.';

  const trustSummary = trustScore >= 70
    ? 'Strong trust signals in your domain and web presence.'
    : trustScore >= 45
    ? 'Building more trust signals would help patient conversion.'
    : 'Adding trust-building elements to your website should be a priority.';

  // Recommendations
  const recommendations: string[] = [];

  if (websiteScore < 55) {
    recommendations.push('Consider upgrading to a custom .com domain that reflects your practice name for better branding and trust.');
  }
  if (visibilityScore < 55) {
    recommendations.push(`Claim and optimize your Google Business Profile to improve local search visibility in ${city}.`);
  }
  if (trustScore < 55) {
    recommendations.push('Add trust signals to your website: patient reviews, professional credentials, and clear contact information.');
  }

  // Always add a general recommendation if we have fewer than 3
  if (recommendations.length < 3) {
    recommendations.push('Ensure your website is mobile-friendly and loads quickly — these are key ranking factors for local search.');
  }
  if (recommendations.length < 3) {
    recommendations.push('Create a blog or resources section to establish authority and improve search visibility.');
  }
  if (recommendations.length < 3) {
    recommendations.push('Encourage satisfied patients to leave reviews on Google and other platforms to build social proof.');
  }

  return {
    overallScore,
    categories: [
      { label: 'Website', score: websiteScore, summary: websiteSummary },
      { label: 'Visibility', score: visibilityScore, summary: visibilitySummary },
      { label: 'Trust', score: trustScore, summary: trustSummary },
    ],
    recommendations: recommendations.slice(0, 3),
  };
}

function buildAIPrompt(input: GrowthScoreRequest): { system: string; user: string } {
  const practiceContext = [
    `Practice Name: ${input.practiceName}`,
    `Practice Type: ${input.practiceType}`,
    `Location: ${input.city}, ${input.state}`,
  ].join('\n');

  const system = `You are an expert healthcare marketing consultant who analyzes practice websites for growth opportunities. You provide honest, actionable assessments. Your tone is supportive but direct — like a seasoned consultant who genuinely wants the practice to succeed.

You are analyzing the website: ${input.websiteUrl}
for a ${input.practiceType || 'healthcare practice'} called "${input.practiceName}".

IMPORTANT: You do not have access to the actual website content, so you must base your analysis on:
1. The URL itself (domain name quality, TLD, structure, memorability, branding clues)
2. The practice details provided
3. Industry best practices for healthcare websites
4. Common patterns and pitfalls for ${input.practiceType || 'healthcare'} practices

Evaluate across these 3 categories:

1. **Website** (scored 0-100): Domain name quality, likely platform, URL structure, mobile-friendliness, page speed considerations
2. **Visibility** (scored 0-100): Local SEO potential, search ranking likelihood, directory presence, Google Business Profile opportunity
3. **Trust** (scored 0-100): Likely trust signals, contact information, credentials visibility, patient review integration

Return ONLY valid JSON — no markdown, no code fences, no explanation outside JSON:

{
  "overallScore": <number 0-100, average of the 3 categories, integer>,
  "categories": [
    { "label": "Website", "score": <0-100>, "summary": "<one-line realistic assessment>" },
    { "label": "Visibility", "score": <0-100>, "summary": "<one-line realistic assessment>" },
    { "label": "Trust", "score": <0-100>, "summary": "<one-line realistic assessment>" }
  ],
  "recommendations": [
    "<actionable recommendation 1>",
    "<actionable recommendation 2>",
    "<actionable recommendation 3>"
  ]
}

RULES:
- Provide exactly 3 recommendations — one per category
- Scores should be honest and realistic — a typical practice website scores 40-65 overall
- If URL looks professional (custom domain, .com), score higher
- If it's a free-builder subdomain, note the limitation
- Recommendations must be specific and actionable`;

  const user = `Analyze: ${input.websiteUrl}\nPractice: ${input.practiceName} (${input.practiceType}) in ${input.city}, ${input.state}\n\nReturn ONLY valid JSON.`;

  return { system, user };
}

// ─── POST Handler ─────────────────────────────────────────────
export async function POST(request: Request) {
  try {
    // 1. Parse and validate input
    let body: GrowthScoreRequest;
    try {
      body = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Invalid request body.' },
        { status: 400 }
      );
    }

    const { practiceName, websiteUrl, practiceType, city, state, email } = body;

    // Validate required fields
    const errors: string[] = [];
    if (!practiceName || !practiceName.trim()) errors.push('Practice name is required.');
    if (!websiteUrl || !websiteUrl.trim()) errors.push('Website URL is required.');
    else if (!isValidUrl(websiteUrl.trim())) errors.push('Please enter a valid website URL (e.g., mypractice.com).');
    if (!practiceType || !PRACTICE_TYPES.includes(practiceType as any)) errors.push('Please select a valid practice type.');
    if (!city || !city.trim()) errors.push('City is required.');
    if (!state || !US_STATES.includes(state as any)) errors.push('Please select a valid state.');
    if (!email || !email.trim()) errors.push('Email is required.');
    else if (!isValidEmail(email.trim())) errors.push('Please enter a valid email address.');

    if (errors.length > 0) {
      return NextResponse.json({ error: errors[0], errors }, { status: 400 });
    }

    const trimmedUrl = websiteUrl.trim();
    const trimmedEmail = email.trim().toLowerCase();

    // 2. Generate score
    let result: GrowthScoreResult;
    const apiKey = env.OPENAI_API_KEY;

    if (apiKey && apiKey.length > 10) {
      // Use AI
      try {
        const { system, user } = buildAIPrompt({
          practiceName: practiceName.trim(),
          websiteUrl: trimmedUrl,
          practiceType,
          city: city.trim(),
          state,
          email: trimmedEmail,
        });

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
                { role: 'system', content: system },
                { role: 'user', content: user },
              ],
              max_tokens: 1500,
              temperature: 0.4,
              response_format: { type: 'json_object' },
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
        const rawContent = data.choices?.[0]?.message?.content?.trim();

        if (!rawContent) {
          throw new Error('OpenAI returned empty response');
        }

        let parsed: any;
        try {
          parsed = JSON.parse(rawContent);
        } catch {
          const jsonMatch = rawContent.match(/```(?:json)?\s*([\s\S]*?)\s*```/);
          if (jsonMatch) {
            parsed = JSON.parse(jsonMatch[1]);
          } else {
            throw new Error('Failed to parse AI response as JSON');
          }
        }

        if (
          typeof parsed.overallScore !== 'number' ||
          !Array.isArray(parsed.categories) ||
          parsed.categories.length < 3
        ) {
          throw new Error('AI response missing required fields');
        }

        result = {
          overallScore: Math.max(0, Math.min(100, Math.round(parsed.overallScore))),
          categories: parsed.categories.slice(0, 3).map((c: any) => ({
            label: c.label || 'Unknown',
            score: Math.max(0, Math.min(100, Math.round(c.score || 0))),
            summary: c.summary || '',
          })),
          recommendations: (parsed.recommendations || []).slice(0, 3).map((r: any) =>
            typeof r === 'string' ? r : (r.text || r.recommendation || JSON.stringify(r))
          ),
        };
      } catch (err: any) {
        console.error('OpenAI call failed, falling back to mock:', err.message);
        result = generateMockScore(trimmedUrl, practiceType, city.trim());
      }
    } else {
      // No API key — use mock generator
      result = generateMockScore(trimmedUrl, practiceType, city.trim());
    }

    // 3. Store lead in database
    try {
      await db.insert(growthScoreLeads).values({
        practiceName: practiceName.trim(),
        websiteUrl: trimmedUrl,
        practiceType,
        city: city.trim(),
        state,
        email: trimmedEmail,
        score: result.overallScore,
      });
    } catch (dbError) {
      console.error('Failed to save lead:', dbError);
      // Non-fatal — we still return the score even if save fails
    }

    // 4. Return result
    return NextResponse.json({
      success: true,
      overallScore: result.overallScore,
      categories: result.categories,
      recommendations: result.recommendations,
      message: 'Score generated successfully.',
    });
  } catch (error) {
    console.error('Growth score error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
