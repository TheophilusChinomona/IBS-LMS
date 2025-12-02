"use client";

import { ReactNode } from 'react';
import { withAdminAuth } from '@/lib/auth';

function AdminLayoutBase({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const ProtectedAdminLayout = withAdminAuth(AdminLayoutBase);

export default function AdminLayout({ children }: { children: ReactNode }) {
  return <ProtectedAdminLayout>{children}</ProtectedAdminLayout>;
}
