'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { getCourseById, getLessonsForModule, getModulesForCourse } from '@/lib/firestore';
import type { Course, Lesson, Module } from '@/types/models';

export default function CourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [course, setCourse] = useState<Course | null>(null);
  const [modules, setModules] = useState<Module[]>([]);
  const [lessons, setLessons] = useState<Record<string, Lesson[]>>({});
  const [selectedLesson, setSelectedLesson] = useState<Lesson | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      const [courseData, moduleData] = await Promise.all([
        getCourseById(courseId),
        getModulesForCourse(courseId)
      ]);
      setCourse(courseData);
      setModules(moduleData);

      if (moduleData.length > 0) {
        const firstModule = moduleData[0];
        const lessonsForFirst = await getLessonsForModule(courseId, firstModule.id);
        setLessons({ [firstModule.id]: lessonsForFirst });
        setSelectedLesson(lessonsForFirst[0] ?? null);
      }
    };
    fetchData();
  }, [courseId]);

  const handleModuleSelect = async (moduleId: string) => {
    if (!lessons[moduleId]) {
      const lessonData = await getLessonsForModule(courseId, moduleId);
      setLessons((prev) => ({ ...prev, [moduleId]: lessonData }));
      setSelectedLesson(lessonData[0] ?? null);
    } else {
      setSelectedLesson(lessons[moduleId][0] ?? null);
    }
  };

  return (
    <LayoutWrapper>
      {course ? (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-2 space-y-4">
            <Card title={course.title} description={course.description}>
              <div className="flex flex-wrap gap-2 text-sm text-slate-600">
                <Badge label={course.difficulty} variant="info" />
                <Badge label={course.category} variant="success" />
                <Badge label={course.status} variant="warning" />
              </div>
              <p className="mt-3 text-sm text-slate-700">Duration: {course.duration}</p>
              <ul className="mt-3 list-disc space-y-1 pl-4 text-sm text-slate-700">
                {course.outcomes.map((outcome) => (
                  <li key={outcome}>{outcome}</li>
                ))}
              </ul>
            </Card>
            {selectedLesson && (
              <Card title={selectedLesson.title} description={`Lesson type: ${selectedLesson.type}`}>
                <p className="text-sm text-slate-700 whitespace-pre-line">{selectedLesson.content ?? 'Content coming soon.'}</p>
                {selectedLesson.resourceUrl && (
                  <a className="mt-3 inline-block text-brand" href={selectedLesson.resourceUrl} target="_blank" rel="noreferrer">
                    Open resource
                  </a>
                )}
              </Card>
            )}
          </div>
          <div className="space-y-4">
            <Card title="Modules">
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
                          className="cursor-pointer rounded px-2 py-1 hover:bg-brand/10"
                          onClick={() => setSelectedLesson(lesson)}
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
      ) : (
        <p>Loading course...</p>
      )}
    </LayoutWrapper>
  );
}
