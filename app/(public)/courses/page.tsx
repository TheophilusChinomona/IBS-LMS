'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { getPublishedCourses } from '@/lib/firestore';
import { useAuth } from '@/components/providers/auth-provider';
import type { Course } from '@/types/models';

export default function PublicCoursesPage() {
  const { user } = useAuth();
  // Load published courses for the public catalog view.
  const {
    data: courses,
    isLoading,
    isError
  } = useQuery<Course[]>(['published-courses'], getPublishedCourses);

  return (
    <LayoutWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Course Catalog</h1>
          <p className="text-slate-600">Browse published courses available to everyone.</p>
        </div>
      </div>

      {isLoading && <p>Loading courses...</p>}
      {isError && <p className="text-red-600">Unable to load courses right now.</p>}

      {!isLoading && !isError && courses?.length === 0 && <p>No courses available.</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {courses?.map((course) => {
          const viewHref = user ? `/courses/${course.id}` : `/login?redirect=/courses/${course.id}`;
          return (
            <Card key={course.id} title={course.title} description={course.description}>
              <div className="space-y-2 text-sm text-slate-600">
                <p className="font-medium text-brand">{course.category}</p>
                <p>Difficulty: {course.difficulty}</p>
                <p>{course.outcomes?.[0] ?? 'Start learning today.'}</p>
              </div>
              <div className="mt-4 flex items-center justify-between gap-3">
                <Link href={viewHref} className="text-brand font-semibold">
                  View course
                </Link>
                {!user && <p className="text-xs text-slate-500">Login to enrol.</p>}
              </div>
            </Card>
          );
        })}
      </div>
    </LayoutWrapper>
  );
}
