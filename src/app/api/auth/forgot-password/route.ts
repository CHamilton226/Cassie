import { NextRequest, NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import { db } from '@/db';
import { users, passwordResetTokens } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      );
    }

    const trimmedEmail = email.trim().toLowerCase();

    // Find user by email
    const user = await db.query.users.findFirst({
      where: eq(users.email, trimmedEmail),
    });

    // Always return success to prevent email enumeration
    // But only create a token if the user exists
    if (user) {
      // Invalidate any existing unused tokens for this user
      await db
        .update(passwordResetTokens)
        .set({ used: true })
        .where(eq(passwordResetTokens.userId, user.id));

      // Create new reset token (expires in 1 hour)
      const token = uuidv4();
      const expiresAt = new Date(Date.now() + 60 * 60 * 1000); // 1 hour

      await db.insert(passwordResetTokens).values({
        userId: user.id,
        token,
        expiresAt,
        used: false,
      });

      // In production, send email with reset link
      // For development, we return the token (would be emailed in production)
      console.log(`[DEV] Password reset token for ${trimmedEmail}: ${token}`);
      console.log(`[DEV] Reset URL: ${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`);
    }

    return NextResponse.json({
      success: true,
      message: 'If an account with that email exists, we have sent a password reset link.',
    });
  } catch (error: any) {
    console.error('Forgot password error:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred. Please try again.' },
      { status: 500 }
    );
  }
}
