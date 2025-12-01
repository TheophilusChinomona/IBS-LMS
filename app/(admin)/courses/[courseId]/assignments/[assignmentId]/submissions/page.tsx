'use client';

// Admin view to review and grade assignment submissions.

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  getSubmissionsForAssignment,
  gradeAssignmentSubmission
} from '@/lib/firestore';
import type { AssignmentSubmission } from '@/types/models';

export default function AssignmentSubmissionsAdminPage() {
  const params = useParams<{ courseId: string; assignmentId: string }>();
  const [submissions, setSubmissions] = useState<AssignmentSubmission[]>([]);
  const [loading, setLoading] = useState(true);
  const [savingId, setSavingId] = useState<string | null>(null);
  const [grades, setGrades] = useState<Record<string, string>>({});
  const [passes, setPasses] = useState<Record<string, boolean>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});

  useEffect(() => {
    const loadSubmissions = async () => {
      const data = await getSubmissionsForAssignment(params.courseId, params.assignmentId);
      setSubmissions(data);
      const gradeValues: Record<string, string> = {};
      const passValues: Record<string, boolean> = {};
      const feedbackValues: Record<string, string> = {};
      data.forEach((submission) => {
        gradeValues[submission.id] = submission.grade?.toString() ?? '';
        passValues[submission.id] = submission.passed ?? false;
        feedbackValues[submission.id] = submission.feedback ?? '';
      });
      setGrades(gradeValues);
      setPasses(passValues);
      setFeedback(feedbackValues);
      setLoading(false);
    };
    loadSubmissions();
  }, [params.assignmentId, params.courseId]);

  const handleSave = async (submissionId: string) => {
    const gradeValue = Number(grades[submissionId] ?? 0);
    const passedValue = passes[submissionId] ?? false;
    const feedbackValue = feedback[submissionId];
    setSavingId(submissionId);
    await gradeAssignmentSubmission(
      params.courseId,
      params.assignmentId,
      submissionId,
      gradeValue,
      passedValue,
      feedbackValue
    );
    setSubmissions((prev) =>
      prev.map((submission) =>
        submission.id === submissionId
          ? { ...submission, grade: gradeValue, passed: passedValue, feedback: feedbackValue, status: 'graded' }
          : submission
      )
    );
    setSavingId(null);
  };

  return (
    <LayoutWrapper>
      <Card title="Assignment submissions" description="Review learner work and provide grades.">
        {loading ? (
          <p className="text-sm text-slate-700">Loading submissions...</p>
        ) : submissions.length === 0 ? (
          <p className="text-sm text-slate-700">No submissions yet.</p>
        ) : (
          <div className="space-y-4">
            {submissions.map((submission) => (
              <div key={submission.id} className="rounded-lg border border-slate-200 p-4">
                <div className="mb-2 text-sm text-slate-700">
                  <p className="font-semibold text-slate-800">Learner: {submission.userId}</p>
                  <p>Status: {submission.status}</p>
                  {submission.grade !== undefined && <p>Current grade: {submission.grade}</p>}
                  {submission.passed !== undefined && <p>Passed: {submission.passed ? 'Yes' : 'No'}</p>}
                </div>
                {submission.fileUrl && (
                  <a
                    href={submission.fileUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-sm text-brand hover:underline"
                  >
                    Download file
                  </a>
                )}
                {submission.textResponse && (
                  <p className="mt-2 whitespace-pre-line text-sm text-slate-700">{submission.textResponse}</p>
                )}
                <div className="mt-4 grid gap-3 md:grid-cols-2">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-800">Grade</label>
                    <Input
                      type="number"
                      value={grades[submission.id] ?? ''}
                      onChange={(e) => setGrades((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                      min={0}
                      max={100}
                    />
                  </div>
                  <div className="flex items-end gap-2">
                    <input
                      type="checkbox"
                      checked={passes[submission.id] ?? false}
                      onChange={(e) => setPasses((prev) => ({ ...prev, [submission.id]: e.target.checked }))}
                    />
                    <span className="text-sm text-slate-800">Passed</span>
                  </div>
                </div>
                <div className="mt-3 space-y-2">
                  <label className="block text-sm font-medium text-slate-800">Feedback</label>
                  <Textarea
                    value={feedback[submission.id] ?? ''}
                    onChange={(e) => setFeedback((prev) => ({ ...prev, [submission.id]: e.target.value }))}
                    rows={3}
                  />
                </div>
                <Button className="mt-3" onClick={() => handleSave(submission.id)} disabled={savingId === submission.id}>
                  {savingId === submission.id ? 'Saving...' : 'Save grade'}
                </Button>
              </div>
            ))}
          </div>
        )}
      </Card>
    </LayoutWrapper>
  );
}
