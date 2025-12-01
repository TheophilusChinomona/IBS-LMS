'use client';

import { ReactNode } from 'react';
import { withAuth } from '@/lib/auth';

function LearnerLayoutBase({ children }: { children: ReactNode }) {
  return <>{children}</>;
}

const ProtectedLayout = withAuth(LearnerLayoutBase);

export default function LearnerLayout({ children }: { children: ReactNode }) {
  return <ProtectedLayout>{children}</ProtectedLayout>;
}
