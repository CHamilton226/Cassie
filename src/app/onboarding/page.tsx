import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { db } from '@/db';
import { practices } from '@/db/schema';
import { eq } from 'drizzle-orm';
import OnboardingForm from '@/components/OnboardingForm';

export default async function OnboardingPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  const userId = parseInt((session.user as any).id, 10);

  // Check if user already has a practice — if so, skip onboarding
  const existingPractice = await db.query.practices.findFirst({
    where: eq(practices.userId, userId),
  });

  if (existingPractice) {
    redirect('/dashboard');
  }

  return <OnboardingForm />;
}
