import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import AdminDashboard from '@/components/admin/AdminDashboard';

export const metadata = {
  title: 'Admin Dashboard — CareConnect AI',
  description: 'Manage users, view metrics, and oversee the CareConnect AI platform.',
};

export default async function AdminPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/login');
  }

  if ((session.user as any).role !== 'admin') {
    redirect('/dashboard');
  }

  return <AdminDashboard userName={session.user.name || 'Admin'} />;
}
