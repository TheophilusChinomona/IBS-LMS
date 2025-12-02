"use client";

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { courseSchema } from '@/app/modules/courses/services/validation';
import { createCourse, getPublishedCourses } from '@/app/modules/courses/services/firestore';
import type { Course } from '@/types/models';
import { useAuth } from '@/components/providers/auth-provider';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { data: courses } = useQuery<Course[]>({
    queryKey: ['admin-courses'],
    queryFn: getPublishedCourses
  });
  const [formError, setFormError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: createCourse,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    }
  });

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      title: String(formData.get('title')),
      description: String(formData.get('description')),
      category: String(formData.get('category')),
      difficulty: (formData.get('difficulty') as Course['difficulty']) || 'beginner',
      duration: String(formData.get('duration')),
      outcomes: (String(formData.get('outcomes')) || '')
        .split(',')
        .map((item) => item.trim())
        .filter(Boolean),
      thumbnailUrl: '',
      status: (formData.get('status') as Course['status']) || 'draft',
      createdBy: user?.id || 'admin'
    };

    const parsed = courseSchema.safeParse(payload);
    if (!parsed.success) {
      setFormError('Please complete all required fields.');
      return;
    }
    setFormError(null);
    mutation.mutate(parsed.data);
    event.currentTarget.reset();
  };

  return (
    <LayoutWrapper>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-slate-900">Courses</h1>
          <p className="text-slate-600">Create and manage catalog courses.</p>
        </div>
      </div>

      <div className="mt-6 grid gap-4 lg:grid-cols-2">
        <Card title="Create new course">
          <form onSubmit={handleSubmit} className="space-y-3">
            <Input name="title" placeholder="Course title" required />
            <Textarea name="description" placeholder="Description" required rows={3} />
            <Input name="category" placeholder="Category" required />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Difficulty</label>
              <select name="difficulty" className="rounded border border-slate-200 px-3 py-2 text-sm">
                <option value="beginner">Beginner</option>
                <option value="intermediate">Intermediate</option>
                <option value="advanced">Advanced</option>
              </select>
            </div>
            <Input name="duration" placeholder="4h 30m" required />
            <Input name="outcomes" placeholder="Comma separated outcomes" />
            <div className="grid grid-cols-2 gap-3">
              <label className="text-sm">Status</label>
              <select name="status" className="rounded border border-slate-200 px-3 py-2 text-sm">
                <option value="draft">Draft</option>
                <option value="published">Published</option>
              </select>
            </div>
            {formError && <p className="text-sm text-red-600">{formError}</p>}
            <Button type="submit" className="w-full">
              Create course
            </Button>
          </form>
        </Card>

        <Card title="Existing courses">
          <ul className="space-y-3">
            {courses?.map((course) => (
              <li key={course.id} className="rounded border border-slate-200 p-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold">{course.title}</p>
                    <p className="text-sm text-slate-600">{course.category}</p>
                  </div>
                  <Link className="text-sm text-brand" href={`/admin/courses/${course.id}`}>
                    Edit
                  </Link>
                </div>
              </li>
            ))}
          </ul>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
