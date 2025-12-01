'use client';

import { useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  createEnrolment,
  getCourseById,
  getEnrolmentForUserAndCourse,
  getLessonsForCourseModule,
  getModulesForCourse
} from '@/lib/firestore';
import { useAuth } from '@/components/providers/auth-provider';
import type { Course, Enrolment, Lesson, Module } from '@/types/models';

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
      const [courseData, moduleData] = await Promise.all([
        getCourseById(courseId),
        getModulesForCourse(courseId)
      ]);
      setCourse(courseData);
      setModules(moduleData);

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
  };

  const selectedLesson = useMemo(() => {
    if (!selectedLessonId) return null;
    const lessonList = Object.values(lessons).flat();
    return lessonList.find((lesson) => lesson.id === selectedLessonId) ?? null;
  }, [lessons, selectedLessonId]);

  return (
    <LayoutWrapper>
      {loadingCourse && <p>Loading course...</p>}
      {!loadingCourse && !course && <p>Course not found.</p>}

      {course && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-4 lg:col-span-2">
            <Card title={course.title} description={course.description}>
              <div className="flex flex-wrap items-center gap-3 text-sm text-slate-600">
                <Badge label={course.difficulty} variant="info" />
                <Badge label={course.category} variant="success" />
                <Badge label={course.status} variant="warning" />
                <Button size="sm" onClick={handleEnrol} disabled={!!enrolment || enrolling}>
                  {enrolment ? 'Continue course' : enrolling ? 'Enrolling...' : 'Enrol in course'}
                </Button>
              </div>
              <p className="mt-3 text-sm text-slate-700">Duration: {course.duration}</p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-700">
                {course.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </Card>
            {selectedLesson ? (
              <Card title={selectedLesson.title} description={`Lesson type: ${selectedLesson.type}`}>
                <p className="text-sm text-slate-700 whitespace-pre-line">
                  Lesson content for {selectedLesson.title} will appear here.
                </p>
              </Card>
            ) : (
              <Card title="Select a lesson" description="Choose a lesson from the sidebar to start learning." />
            )}
          </div>
          <div className="space-y-4">
            <Card title="Modules & lessons">
              <ul className="space-y-2">
                {modules.map((module) => (
                  <li key={module.id}>
                    <button
                      type="button"
                      onClick={() => handleModuleSelect(module.id)}
                      className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-left text-sm font-semibold hover:border-brand"
                    >
                      {module.title}
                    </button>
                    <ul className="mt-2 space-y-1 pl-3 text-xs text-slate-600">
                      {lessons[module.id]?.map((lesson) => (
                        <li
                          key={lesson.id}
                          className={`cursor-pointer rounded px-2 py-1 hover:bg-brand/10 ${
                            selectedLessonId === lesson.id ? 'bg-brand/10 font-semibold text-slate-800' : ''
                          }`}
                          onClick={() => handleLessonSelect(lesson)}
                        >
                          {lesson.title}
                        </li>
                      ))}
                    </ul>
                  </li>
                ))}
              </ul>
            </Card>
          </div>
        </div>
      )}
    </LayoutWrapper>
  );
}
