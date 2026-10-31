import { redirect } from 'next/navigation';
import { requireAdmin } from '@/lib/security/admin';
export const dynamic = 'force-dynamic';
export const metadata = { robots: { index: false, follow: false } };
export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  try { await requireAdmin(); } catch { redirect('/login'); }
  return children;
}
