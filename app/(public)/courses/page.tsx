'use client';

import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { getPublishedCourses } from "@/lib/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { cn } from "@/lib/utils";
import type { Course } from "@/types/models";

export default function PublicCoursesPage() {
  const { user } = useAuth();
  const {
    data: courses,
    isLoading,
    isError,
  } = useQuery<Course[]>({
    queryKey: ["published-courses"],
    queryFn: getPublishedCourses,
  });

  const cardVariants = {
    initial: { opacity: 0, y: 12 },
    animate: { opacity: 1, y: 0 },
  };

  return (
    <div className="space-y-8">
      <div className="space-y-3">
        <p className="text-sm font-semibold uppercase tracking-wide text-slate-500">
          Catalog
        </p>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-semibold text-slate-900">
              Course Catalog
            </h1>
            <p className="text-slate-600">
              Browse curated tracks aligned to compliance, leadership, and more.
            </p>
          </div>
          <Link
            href={user ? "/dashboard" : "/register"}
            className={buttonVariants({ variant: "secondary" })}
          >
            {user ? "Return to dashboard" : "Create account"}
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 3 }).map((_, index) => (
            <Skeleton key={index} className="h-48 rounded-3xl" />
          ))}
        </div>
      )}

      {isError && (
        <Card>
          <p className="text-sm text-danger">
            Unable to load courses right now. Please refresh shortly.
          </p>
        </Card>
      )}

      {!isLoading && !isError && (
        <>
          {courses?.length === 0 ? (
            <Card>
              <p className="text-sm text-slate-600">
                No courses available yet. Check back soon or request early
                access.
              </p>
            </Card>
          ) : (
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {courses?.map((course) => {
                const viewHref = user
                  ? `/courses/${course.id}`
                  : `/login?redirect=/courses/${course.id}`;
                return (
                  <motion.div
                    key={course.id}
                    variants={cardVariants}
                    initial="initial"
                    animate="animate"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <Card>
                      <div className="flex items-center justify-between">
                        <Badge>{course.difficulty}</Badge>
                        <p className="text-xs uppercase tracking-wide text-slate-400">
                          {course.duration}
                        </p>
                      </div>
                      <h3 className="mt-4 text-lg font-semibold text-slate-900">
                        {course.title}
                      </h3>
                      <p className="mt-2 text-sm text-slate-600 line-clamp-3">
                        {course.description}
                      </p>
                      <div className="mt-4 flex items-center justify-between text-sm font-semibold text-primary">
                        <span>{course.category}</span>
                        <span>
                          {course.outcomes?.length ?? 0} modules
                        </span>
                      </div>
                      <div className="mt-6 flex items-center justify-between gap-3">
                        <Link
                          href={viewHref}
                          className={cn(buttonVariants(), "flex-1 gap-2")}
                        >
                          View Course <ArrowRight className="size-4" />
                        </Link>
                        {!user && (
                          <span className="text-xs text-slate-500">
                            Login to enrol
                          </span>
                        )}
                      </div>
                    </Card>
                  </motion.div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}
