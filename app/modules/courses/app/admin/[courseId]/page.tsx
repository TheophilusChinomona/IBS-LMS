"use client";

import { FormEvent, useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { courseSchema } from '@/app/modules/courses/services/validation';
import { getCourseById, updateCourse } from '@/app/modules/courses/services/firestore';
import type { Course } from '@/types/models';

export default function AdminCourseDetailPage() {
  const params = useParams<{ courseId: string }>();
  const courseId = params.courseId;
  const [course, setCourse] = useState<Course | null>(null);
  const [message, setMessage] = useState<string>('');

  useEffect(() => {
    const fetchCourse = async () => {
      const result = await getCourseById(courseId);
      if (result) {
        setCourse(result);
      }
    };
    fetchCourse();
  }, [courseId]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get('title')),
      description: String(formData.get('description')),
      category: String(formData.get('category')),
      difficulty: formData.get('difficulty') as Course['difficulty'],
      duration: String(formData.get('duration')),
      outcomes: (String(formData.get('outcomes')) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      status: formData.get('status') as Course['status']
    };

    const parsed = courseSchema.safeParse(payload);
    if (!parsed.success) {
      setMessage('Please provide all required fields.');
      return;
    }
    await updateCourse(courseId, parsed.data);
    setMessage('Course updated successfully.');
  };

  return (
    <LayoutWrapper>
      <h1 className="text-3xl font-semibold text-slate-900">Edit Course</h1>
      {course ? (
        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Card title="Course metadata">
            <form onSubmit={handleSubmit} className="space-y-3">
              <Input name="title" defaultValue={course.title} required />
              <Textarea name="description" defaultValue={course.description} required rows={3} />
              <Input name="category" defaultValue={course.category} required />
              <Input name="duration" defaultValue={course.duration} required />
              <Input name="outcomes" defaultValue={course.outcomes.join(', ')} />
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Difficulty</label>
                <select name="difficulty" defaultValue={course.difficulty} className="rounded border border-slate-200 px-3 py-2 text-sm">
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <label className="text-sm">Status</label>
                <select name="status" defaultValue={course.status} className="rounded border border-slate-200 px-3 py-2 text-sm">
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
              <Button type="submit" className="w-full">
                Save changes
              </Button>
            </form>
            {message && <p className="mt-3 text-sm text-green-700">{message}</p>}
          </Card>
          <Card title="Modules & Lessons" description="TODO: Build nested module/lesson editors with drag/drop and rich content.">
            <p className="text-sm text-slate-600">Coming soon.</p>
          </Card>
        </div>
      ) : (
        <p>Loading course...</p>
      )}
    </LayoutWrapper>
  );
}
