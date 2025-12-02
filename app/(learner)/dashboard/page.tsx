'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { getCourseById, getUserEnrolments } from '@/app/modules/courses/services/firestore';
import type { Course, Enrolment } from '@/types/models';

export default function LearnerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Fetch enrolments for the signed-in learner.
  const { data: enrolments, isLoading, isError } = useQuery<Enrolment[]>({
    queryKey: ['enrolments', user?.id],
    queryFn: () => getUserEnrolments(user?.id ?? ''),
    enabled: !!user?.id
  });
  const [courses, setCourses] = useState<Record<string, Course | null>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login');
    }
  }, [loading, router, user]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!enrolments) return;
      const entries = await Promise.all(
        enrolments.map(async (enrolment) => {
          const course = await getCourseById(enrolment.courseId);
          return [enrolment.courseId, course];
        })
      );
      setCourses(Object.fromEntries(entries));
    };
    fetchCourses();
  }, [enrolments]);

  return (
    <LayoutWrapper>
      <h1 className="text-3xl font-semibold text-slate-900">My Learning</h1>
      <p className="text-slate-600">Track your progress and continue learning.</p>

      {isLoading && <p className="mt-4">Loading enrolments...</p>}
      {isError && <p className="mt-4 text-red-600">Unable to load your courses.</p>}

      {enrolments && enrolments.length === 0 && (
        <Card className="mt-6" title="No enrolments yet" description="Browse the catalog to start learning.">
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {enrolments?.map((enrolment) => (
          <Card key={enrolment.id} title={courses[enrolment.courseId]?.title || 'Course'}>
            <p className="text-sm text-slate-600">Status: {enrolment.status}</p>
            <div className="mt-2 h-2 rounded-full bg-slate-200">
              <div
                className="h-2 rounded-full bg-brand"
                style={{ width: `${enrolment.progressPercent}%` }}
                aria-label="progress"
              />
            </div>
            <p className="mt-2 text-sm font-semibold text-slate-700">{enrolment.progressPercent}% complete</p>
            <Link className="mt-3 inline-block text-sm font-semibold text-brand" href={`/courses/${enrolment.courseId}`}>
              Continue learning
            </Link>
          </Card>
        ))}
      </div>
    </LayoutWrapper>
  );
}
