'use client';

// Learner assignment submission page for uploading work and text responses.

import { FormEvent, useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { useAuth } from '@/components/providers/auth-provider';
import { getAssignmentById, submitAssignmentSubmission } from '@/app/modules/courses/services/firestore';
import type { Assignment, AssignmentSubmission } from '@/types/models';

export default function AssignmentSubmissionPage() {
  const params = useParams<{ courseId: string; assignmentId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [textResponse, setTextResponse] = useState('');
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/courses/${params.courseId}`);
    }
  }, [authLoading, params.courseId, router, user]);

  useEffect(() => {
    const loadAssignment = async () => {
      const data = await getAssignmentById(params.courseId, params.assignmentId);
      setAssignment(data);
    };
    loadAssignment();
  }, [params.assignmentId, params.courseId]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !assignment) return;
    setSubmitting(true);

    const submission: AssignmentSubmission = {
      id: `${Date.now()}`,
      assignmentId: assignment.id,
      courseId: params.courseId,
      userId: user.id,
      fileUrl: undefined,
      textResponse: textResponse.trim() || undefined,
      status: 'submitted',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    await submitAssignmentSubmission(submission, file || undefined);
    setSubmitted(true);
    setSubmitting(false);
  };

  return (
    <LayoutWrapper>
      <Card title={assignment?.title || 'Assignment'} description={assignment?.description || 'Submit your work for review.'}>
        {!submitted ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Text response</label>
              <Textarea
                value={textResponse}
                onChange={(e) => setTextResponse(e.target.value)}
                placeholder="Add notes or your answer here"
                rows={5}
              />
            </div>
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-800">Upload file (optional)</label>
              <input type="file" onChange={(e) => setFile(e.target.files?.[0] ?? null)} />
            </div>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit assignment'}
            </Button>
          </form>
        ) : (
          <p className="text-sm text-slate-700">Submission received. You will be notified when graded.</p>
        )}
      </Card>
    </LayoutWrapper>
  );
}
