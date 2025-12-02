'use client';

import { useRouter } from 'next/navigation';
import { ComponentType, useEffect, useRef } from 'react';
import { useAuth } from '@/components/providers/auth-provider';
import { Role } from '@/config/roles';

export function withAuth<P extends object>(Component: ComponentType<P>) {
  return function Protected(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();

    useEffect(() => {
      if (!loading && !user) {
        router.replace('/login');
      }
    }, [loading, user, router]);

    if (loading || !user) {
      return <p className="p-4">Loading your dashboard...</p>;
    }

    return <Component {...(props as P)} />;
  };
}

export function withAdminAuth<P extends object>(Component: ComponentType<P>, allowed: Role[] = ['admin', 'instructor', 'superadmin']) {
  return function ProtectedAdmin(props: P) {
    const { user, loading } = useAuth();
    const router = useRouter();
    const allowedRoles = useRef(new Set(allowed));

    useEffect(() => {
      if (!loading) {
        if (!user) {
          router.replace('/login');
        } else if (!allowedRoles.current.has(user.role)) {
          router.replace('/dashboard');
        }
      }
    }, [loading, router, user]);

    if (loading || !user) {
      return <p className="p-4">Checking permissions...</p>;
    }

    return <Component {...(props as P)} />;
  };
}
