'use client';

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { BookOpenCheck, CheckCircle2, Clock } from "lucide-react";

import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Accordion } from "@/components/ui/accordion";
import { Breadcrumb } from "@/components/ui/breadcrumb";
import { Progress } from "@/components/ui/progress";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import {
  createEnrolment,
  getCourseById,
  getEnrolmentForUserAndCourse,
  getLessonsForCourseModule,
  getModulesForCourse,
  getQuizzesForCourse,
  getAssignmentsForCourse,
  createCertificateRecord,
  getCertificatesForUser
} from '@/app/modules/courses/services/firestore';
import { useAuth } from '@/components/providers/auth-provider';
import type {
  Assignment,
  Certificate,
  Course,
  Enrolment,
  Lesson,
  Module,
  Quiz
} from '@/types/models';

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const courseId = params.courseId;
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [selectedLessonId, setSelectedLessonId] = useState<string | null>(null);
  const [enrolment, setEnrolment] = useState<Enrolment | null>(null);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [certificateMessage, setCertificateMessage] = useState<string | null>(null);
  const [loadingCourse, setLoadingCourse] = useState(true);
  const [enrolling, setEnrolling] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/courses/${courseId}`);
    }
  }, [authLoading, courseId, router, user]);

  useEffect(() => {
    // Load course structure for rendering lesson navigation.
    const fetchData = async () => {
      setLoadingCourse(true);
      const [courseData, moduleData, quizData, assignmentData] = await Promise.all([
        getCourseById(courseId),
        getModulesForCourse(courseId),
        getQuizzesForCourse(courseId),
        getAssignmentsForCourse(courseId)
      ]);
      setCourse(courseData);
      setModules(moduleData);
      setQuizzes(quizData);
      setAssignments(assignmentData);

      const lessonsByModule: Record<string, Lesson[]> = {};
      await Promise.all(
        moduleData.map(async (module) => {
          const lessonData = await getLessonsForCourseModule(courseId, module.id);
          lessonsByModule[module.id] = lessonData;
        })
      );
      setLessons(lessonsByModule);

      const firstModule = moduleData[0];
      const firstLesson = firstModule ? lessonsByModule[firstModule.id]?.[0] : null;
      setSelectedLessonId(firstLesson?.id ?? null);
      setLoadingCourse(false);
    };
    fetchData();
  }, [courseId]);

  useEffect(() => {
    // Determine enrolment state for current learner.
    const fetchEnrolment = async () => {
      if (!user?.id) return;
      const existing = await getEnrolmentForUserAndCourse(user.id, courseId);
      setEnrolment(existing);
    };
    fetchEnrolment();
  }, [courseId, user?.id]);

  useEffect(() => {
    const fetchCertificates = async () => {
      if (!user?.id) return;
      const userCertificates = await getCertificatesForUser(user.id);
      setCertificates(userCertificates);
    };
    fetchCertificates();
  }, [user?.id]);

  const handleModuleSelect = (moduleId: string) => {
    const lesson = lessons[moduleId]?.[0];
    setSelectedLessonId(lesson?.id ?? null);
  };

  const handleLessonSelect = (lesson: Lesson) => {
    setSelectedLessonId(lesson.id);
  };

  const handleEnrol = async () => {
    if (!user) {
      router.push(`/login?redirect=/courses/${courseId}`);
      return;
    }
    setEnrolling(true);
    await createEnrolment(user.id, courseId);
    const refreshed = await getEnrolmentForUserAndCourse(user.id, courseId);
    setEnrolment(refreshed);
    setEnrolling(false);
    toast.success("Enrolment confirmed", {
      description: `You're now enrolled in ${course?.title ?? "this course"}.`,
    });
  };

  const lessonList = useMemo(() => Object.values(lessons).flat(), [lessons]);

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    return lessonList.find((lesson) => lesson.id === selectedLessonId) ?? null;
  }, [lessonList, selectedLessonId]);

  const completedLessonIds = useMemo(() => {
    if (!lessonList.length) return new Set<string>();
    const totalLessons = lessonList.length;
    const completedCount = Math.round(
      ((enrolment?.progressPercent ?? 0) / 100) * totalLessons,
    );
    return new Set(
      lessonList.slice(0, completedCount).map((lesson) => lesson.id),
    );
  }, [lessonList, enrolment?.progressPercent]);

  const courseCertificate = useMemo(
    () => certificates.find((certificate) => certificate.courseId === courseId) || null,
    [certificates, courseId]
  );

  const handleRequestCertificate = async () => {
    if (!user) return;
    setCertificateMessage("Requesting certificate...");
    const created = await createCertificateRecord(user.id, courseId);
    setCertificates((prev) => [...prev, created]);
    setCertificateMessage("Certificate will be generated. Please check back later.");
    toast.success("Certificate requested", {
      description: "We'll notify you when it is ready to download.",
    });
  };

  const moduleItems = modules.map((module) => ({
    id: module.id,
    title: module.title,
    content: (
      <div className="space-y-1">
        {lessons[module.id]?.map((lesson) => {
          const isActive = selectedLessonId === lesson.id;
          const isCompleted = completedLessonIds.has(lesson.id);
          return (
            <button
              key={lesson.id}
              type="button"
              onClick={() => handleLessonSelect(lesson)}
              className={cn(
                "flex w-full items-center justify-between rounded-2xl px-3 py-2 text-left text-sm transition",
                isActive
                  ? "bg-primary/10 text-primary"
                  : "text-slate-600 hover:bg-muted",
              )}
            >
              <span>{lesson.title}</span>
              {isCompleted && (
                <CheckCircle2 className="size-4 text-success" />
              )}
            </button>
          );
        })}
      </div>
    ),
  }));

  return (
    <div className="space-y-8">
      {loadingCourse && (
        <div className="space-y-4">
          <Skeleton className="h-32 rounded-3xl" />
          <Skeleton className="h-96 rounded-3xl" />
        </div>
      )}
      {!loadingCourse && !course && (
        <Card>
          <p className="text-sm text-danger">Course not found.</p>
        </Card>
      )}

      {course && (
        <>
          <Breadcrumb
            items={[
              { label: "Courses", href: "/courses" },
              { label: course.title },
            ]}
          />
          <Card>
            <div className="space-y-4">
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-600">
                <Badge variant="default">{course.difficulty}</Badge>
                <Badge variant="success">{course.category}</Badge>
                <Badge variant="warning">{course.status}</Badge>
                {enrolment && (
                  <Badge variant="success">Enrolled</Badge>
                )}
              </div>
              <div>
                <h1 className="text-3xl font-semibold text-slate-900">
                  {course.title}
                </h1>
                <p className="mt-2 text-slate-600">{course.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-4 text-sm text-slate-500">
                <span className="flex items-center gap-2">
                  <Clock className="size-4" />
                  {course.duration}
                </span>
                <span className="flex items-center gap-2">
                  <BookOpenCheck className="size-4" />
                  {course.outcomes.length} learning outcomes
                </span>
              </div>
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="w-full sm:w-1/2">
                  <Progress value={enrolment?.progressPercent ?? 0} />
                  <p className="mt-2 text-xs text-slate-500">
                    {enrolment
                      ? `${enrolment.progressPercent}% complete`
                      : "Enrol to start tracking progress."}
                  </p>
                </div>
                <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
                  <Button
                    onClick={handleEnrol}
                    disabled={!!enrolment || enrolling}
                  >
                    {enrolment
                      ? "Continue course"
                      : enrolling
                        ? "Enrolling..."
                        : "Enrol now"}
                  </Button>
                  <Link
                    href="/courses"
                    className={buttonVariants({ variant: "secondary" })}
                  >
                    Browse catalog
                  </Link>
                </div>
              </div>
            </div>
          </Card>

          <div className="grid gap-6 xl:grid-cols-[300px_minmax(0,1fr)_320px]">
            <div className="space-y-6">
              <Card title="Course structure" description="Navigate modules and lessons.">
                {moduleItems.length > 0 ? (
                  <Accordion items={moduleItems} defaultOpen={moduleItems[0]?.id} />
                ) : (
                  <p className="text-sm text-slate-600">
                    Modules coming soon.
                  </p>
                )}
              </Card>
            </div>
            <div className="space-y-6">
              <motion.div
                key={selectedLessonId ?? "placeholder"}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25 }}
              >
                {selectedLesson ? (
                  <Card
                    title={selectedLesson.title}
                    description={`Lesson type: ${selectedLesson.type}`}
                  >
                    <p className="text-sm text-slate-700 whitespace-pre-line">
                      {selectedLesson.content
                        ? selectedLesson.content
                        : `Lesson content for ${selectedLesson.title} will appear here.`}
                    </p>
                  </Card>
                ) : (
                  <Card title="Select a lesson" description="Choose a lesson from the course structure to begin." />
                )}
              </motion.div>
            </div>
            <div className="space-y-6">
              <Card title="Course intelligence">
                <ul className="list-disc space-y-2 pl-4 text-sm text-slate-600">
                  {course.outcomes.map((outcome) => (
                    <li key={outcome}>{outcome}</li>
                  ))}
                </ul>
              </Card>

              <Card title="Quizzes" description="Assess your understanding.">
                {quizzes.length === 0 ? (
                  <p className="text-sm text-slate-600">No quizzes available yet.</p>
                ) : (
                  <div className="space-y-3">
                    {quizzes.map((quiz) => (
                        <div
                          key={quiz.id}
                          className="flex items-center justify-between rounded-2xl border border-slate-100 p-3"
                        >
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              {quiz.title}
                            </p>
                            <p className="text-xs text-slate-500">
                              Passing score: {quiz.passingScore}%
                            </p>
                          </div>
                          <Link
                            href={`/courses/${courseId}/quizzes/${quiz.id}`}
                            className={cn(
                              buttonVariants({ size: "sm", variant: "secondary" }),
                              "text-center",
                            )}
                          >
                            Take quiz
                          </Link>
                        </div>
                    ))}
                  </div>
                )}
              </Card>

              <Card title="Assignments" description="Submit deliverables for review.">
                {assignments.length === 0 ? (
                  <p className="text-sm text-slate-600">No assignments yet.</p>
                ) : (
                  <div className="space-y-3">
                    {assignments.map((assignment) => {
                      const status =
                        enrolment?.status === "completed"
                          ? "Graded"
                          : assignment.required
                            ? "Not submitted"
                            : "Submitted";
                      const variant =
                        status === "Graded"
                          ? "success"
                          : status === "Submitted"
                            ? "default"
                            : "warning";
                      return (
                        <div
                          key={assignment.id}
                          className="rounded-2xl border border-slate-100 p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="text-sm font-semibold text-slate-900">
                                {assignment.title}
                              </p>
                              <p className="text-xs text-slate-500">
                                {assignment.required ? "Required" : "Optional"}
                              </p>
                            </div>
                            <Badge variant={variant as "default" | "success" | "warning"}>
                              {status}
                            </Badge>
                          </div>
                          <Link
                            href={`/courses/${courseId}/assignments/${assignment.id}`}
                            className={cn(buttonVariants({ size: "sm" }), "mt-3 w-full text-center")}
                          >
                            Submit assignment
                          </Link>
                        </div>
                      );
                    })}
                  </div>
                )}
              </Card>

              <Card title="Certificate" description="Request your certificate after completion.">
                {courseCertificate ? (
                  <div className="space-y-1 text-sm text-slate-700">
                    <p>Certificate #: {courseCertificate.certificateNumber}</p>
                    <p>
                      Issued:{" "}
                      {new Date(courseCertificate.issuedAt).toLocaleDateString()}
                    </p>
                    {courseCertificate.downloadUrl ? (
                      <a
                        href={courseCertificate.downloadUrl}
                        className="text-primary hover:underline"
                        target="_blank"
                        rel="noreferrer"
                      >
                        Download certificate
                      </a>
                    ) : (
                      <p className="text-xs text-slate-500">
                        Processing... check back soon.
                      </p>
                    )}
                  </div>
                ) : enrolment?.status === "completed" ? (
                  <>
                    <Button size="sm" onClick={handleRequestCertificate}>
                      Request certificate
                    </Button>
                    {certificateMessage && (
                      <p className="text-xs text-slate-500">{certificateMessage}</p>
                    )}
                  </>
                ) : (
                  <p className="text-sm text-slate-600">
                    Complete the course to request your certificate.
                  </p>
                )}
              </Card>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
