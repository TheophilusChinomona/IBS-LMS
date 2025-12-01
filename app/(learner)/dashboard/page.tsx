'use client';

import Link from 'next/link';
import { useQuery } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { getUserEnrolments, getCourseById } from '@/lib/firestore';
import type { Enrolment } from '@/types/models';
import { useEffect, useState } from 'react';

export default function LearnerDashboard() {
  const { user } = useAuth();
  const { data: enrolments, isLoading } = useQuery<Enrolment[]>(['enrolments', user?.id], () => getUserEnrolments(user?.id ?? ''), {
    enabled: !!user?.id
  });
  const [courseTitles, setCourseTitles] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchTitles = async () => {
      if (!enrolments) return;
      const entries = await Promise.all(
        enrolments.map(async (enrolment) => {
          const course = await getCourseById(enrolment.courseId);
          return [enrolment.courseId, course?.title ?? 'Course'];
        })
      );
      setCourseTitles(Object.fromEntries(entries));
    };
    fetchTitles();
  }, [enrolments]);

  return (
    <LayoutWrapper>
      <h1 className="text-3xl font-semibold text-slate-900">My Learning</h1>
      <p className="text-slate-600">Track your progress and continue learning.</p>

      {isLoading && <p className="mt-4">Loading enrolments...</p>}

      {enrolments && enrolments.length === 0 && (
        <Card className="mt-6" title="No enrolments yet" description="Browse the catalog to start learning.">
          <Button asChild>
            <Link href="/courses">Browse Courses</Link>
          </Button>
        </Card>
      )}

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        {enrolments?.map((enrolment) => (
          <Card key={enrolment.id} title={courseTitles[enrolment.courseId] || 'Course'}>
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
