"use client";

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { buttonVariants } from '@/components/ui/button';
import { getPublishedCourses } from '@/app/modules/courses/services/firestore';
import { cn } from '@/lib/utils';

import type { Course } from '@/types/models';

export default function AdminDashboardPage() {
  const { data: courses } = useQuery<Course[]>({
    queryKey: ['admin-courses'],
    queryFn: getPublishedCourses
  });

  return (
    <LayoutWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Admin Dashboard</h1>
          <p className="text-slate-600">Manage courses, modules, and lessons.</p>
        </div>
        <Link href="/admin/courses" className={cn(buttonVariants(), 'text-sm')}>
          Manage Courses
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <Card title="Courses" description="Published courses in the catalog">
          <p className="text-3xl font-bold text-brand">{courses?.length ?? 0}</p>
          <Link className="text-sm text-brand" href="/admin/courses">
            View all courses
          </Link>
        </Card>
        <Card title="Users" description="User metrics coming soon">
          <p className="text-3xl font-bold text-slate-900">--</p>
          <p className="text-sm text-slate-600">TODO: Integrate analytics</p>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
