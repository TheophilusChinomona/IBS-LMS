'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { getPublishedCourses } from '@/lib/firestore';
import { useAuth } from '@/components/providers/auth-provider';
import type { Course } from '@/types/models';

export default function PublicCoursesPage() {
  const { user } = useAuth();
  const { data, isLoading } = useQuery<Course[]>(['published-courses'], getPublishedCourses);

  return (
    <LayoutWrapper>
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Course Catalog</h1>
          <p className="text-slate-600">Browse published courses available to everyone.</p>
        </div>
      </div>

      {isLoading && <p>Loading courses...</p>}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {data?.map((course) => (
          <Card key={course.id} title={course.title} description={course.description}>
            <div className="space-y-2 text-sm text-slate-600">
              <p className="font-medium text-brand">{course.category}</p>
              <p>Difficulty: {course.difficulty}</p>
              <p>Status: {course.status}</p>
            </div>
            <div className="mt-4 flex justify-between">
              <Link href={user ? `/courses/${course.id}` : '/login'} className="text-brand font-semibold">
                View Course
              </Link>
              {!user && (
                <Button variant="secondary" asChild>
                  <Link href="/register">Register</Link>
                </Button>
              )}
            </div>
          </Card>
        ))}
      </div>
    </LayoutWrapper>
  );
}
