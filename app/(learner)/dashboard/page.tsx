'use client';

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";

import { Card } from "@/components/ui/card";
import { Button, buttonVariants } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/components/providers/auth-provider";
import {
  getCourseById,
  getUserEnrolments,
} from "@/app/modules/courses/services/firestore";
import type { Course, Enrolment } from "@/types/models";
import { cn } from "@/lib/utils";

export default function LearnerDashboard() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const {
    data: enrolments,
    isLoading,
    isError,
  } = useQuery<Enrolment[]>({
    queryKey: ["enrolments", user?.id],
    queryFn: () => getUserEnrolments(user?.id ?? ""),
    enabled: !!user?.id,
  });
  const [courses, setCourses] = useState<Record<string, Course | null>>({});

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login");
    }
  }, [loading, router, user]);

  useEffect(() => {
    const fetchCourses = async () => {
      if (!enrolments) return;
      const entries = await Promise.all(
        enrolments.map(async (enrolment) => {
          const course = await getCourseById(enrolment.courseId);
          return [enrolment.courseId, course];
        }),
      );
      setCourses(Object.fromEntries(entries));
    };
    fetchCourses();
  }, [enrolments]);

  const totalCourses = enrolments?.length ?? 0;
  const completedCourses =
    enrolments?.filter((enrolment) => enrolment.status === "completed")
      ?.length ?? 0;
  const inProgress = totalCourses - completedCourses;
  const averageProgress = useMemo(() => {
    if (!enrolments?.length) return 0;
    const total = enrolments.reduce(
      (acc, enrolment) => acc + enrolment.progressPercent,
      0,
    );
    return Math.round(total / enrolments.length);
  }, [enrolments]);

  const recommendedCourse = enrolments?.find(
    (enrolment) => enrolment.status !== "completed",
  );

  return (
    <div className="space-y-10">
      <Card className="bg-gradient-to-r from-primary to-secondary text-white shadow-hero">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.3em] text-white/70">
              Welcome back
            </p>
            <h1 className="mt-2 text-3xl font-semibold text-white">
              {user?.name ?? "Learner"}
            </h1>
            <p className="mt-2 text-white/80">
              Your compliance goals are on track. Continue learning to unlock
              certificates faster.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/courses"
              className={cn(
                buttonVariants({ variant: "secondary" }),
                "bg-white/20 text-white hover:bg-white/30",
              )}
            >
              Browse catalog
            </Link>
            <Link
              href="/certificates"
              className={cn(buttonVariants(), "bg-white text-primary")}
            >
              View certificates
            </Link>
          </div>
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total courses", value: totalCourses },
          { label: "Completed", value: completedCourses },
          { label: "In progress", value: inProgress },
          { label: "Avg. progress", value: `${averageProgress}%` },
        ].map((stat) => (
          <Card key={stat.label}>
            <p className="text-sm uppercase tracking-wider text-slate-500">
              {stat.label}
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {stat.value}
            </p>
          </Card>
        ))}
      </div>

      {isLoading && (
        <Card>
          <p className="text-sm text-slate-600">Loading your enrolments...</p>
        </Card>
      )}

      {isError && (
        <Card>
          <p className="text-sm text-danger">
            Unable to load courses. Please refresh.
          </p>
        </Card>
      )}

      {enrolments && enrolments.length === 0 && (
        <Card title="No enrolments yet" description="Browse the catalog to start learning.">
          <Link href="/courses" className={buttonVariants()}>
            Browse Courses
          </Link>
        </Card>
      )}

      {enrolments && enrolments.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-sm uppercase tracking-wide text-slate-500">
                  Momentum
                </p>
                <h2 className="text-2xl font-semibold text-slate-900">
                  Keep your streak alive
                </h2>
              </div>
              <div className="flex items-center gap-3">
                <Progress value={averageProgress} className="h-2 w-40" />
                <span className="text-sm font-semibold text-primary">
                  {averageProgress}% overall
                </span>
              </div>
            </div>
                {recommendedCourse && (
                  <div className="mt-6 rounded-2xl border border-slate-100 p-4">
                    <p className="text-sm uppercase tracking-wide text-slate-500">
                      Next lesson
                    </p>
                    <h3 className="text-xl font-semibold text-slate-900">
                      {courses[recommendedCourse.courseId]?.title ?? "Course"}
                    </h3>
                    <p className="text-sm text-slate-600">
                      {recommendedCourse.progressPercent}% complete
                    </p>
                    <Link
                      href={`/courses/${recommendedCourse.courseId}`}
                      className={cn(buttonVariants(), "mt-4 inline-flex justify-center")}
                    >
                      Continue learning
                    </Link>
                  </div>
                )}
          </Card>
          <Card>
            <p className="text-sm uppercase tracking-wide text-slate-500">
              Certifications
            </p>
            <p className="mt-2 text-3xl font-semibold text-slate-900">
              {completedCourses}
            </p>
            <p className="text-sm text-slate-600">
              Completed courses ready for certificate requests.
            </p>
            <Link
              href="/certificates"
              className={cn(buttonVariants({ variant: "secondary" }), "mt-6 w-full")}
            >
              Manage certificates
            </Link>
          </Card>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2">
        {enrolments?.map((enrolment) => (
          <motion.div
            key={enrolment.id}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
          >
            <Card
              title={courses[enrolment.courseId]?.title || "Course"}
              description={
                courses[enrolment.courseId]?.description?.slice(0, 100) ??
                "Keep up the great work."
              }
            >
              <div className="flex items-center justify-between text-sm text-slate-500">
                <Badge variant={enrolment.status === "completed" ? "success" : "default"}>
                  {enrolment.status === "completed" ? "Completed" : "In progress"}
                </Badge>
                <span>{enrolment.progressPercent}% complete</span>
              </div>
              <Progress value={enrolment.progressPercent} className="mt-3" />
              <Link
                href={`/courses/${enrolment.courseId}`}
                className={cn(buttonVariants(), "mt-4 w-full text-center")}
              >
                {enrolment.status === "completed" ? "Review course" : "Continue learning"}
              </Link>
            </Card>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
