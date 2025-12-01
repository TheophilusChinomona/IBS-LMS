'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';

export function SiteHeader() {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
        <Link href="/" className="text-lg font-semibold text-brand">
          IBS LMS
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/courses" className={pathname?.startsWith('/courses') ? 'text-brand' : ''}>
            Courses
          </Link>
          {user ? (
            <div className="flex items-center gap-3">
              <Link href="/dashboard">Dashboard</Link>
              {(user.role === 'admin' || user.role === 'instructor' || user.role === 'superadmin') && (
                <Link href="/admin/dashboard">Admin</Link>
              )}
              <Button variant="ghost" onClick={() => logout()}>
                Logout
              </Button>
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/login">Login</Link>
              <Link
                href="/register"
                className="inline-flex items-center justify-center rounded-lg bg-brand px-4 py-2 text-sm font-semibold text-white shadow hover:bg-brand-dark"
              >
                Register
              </Link>
            </div>
          )}
        </nav>
      </div>
    </header>
  );
}
