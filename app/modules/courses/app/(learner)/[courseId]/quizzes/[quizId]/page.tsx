'use client';

// Learner-facing quiz page allowing users to complete course quizzes and store attempts.

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import {
  getQuizById,
  getUserQuizAttemptsForQuiz,
  saveQuizAttempt
} from '@/app/modules/courses/services/firestore';
import type { Quiz, QuizAttempt, QuizQuestion } from '@/types/models';

interface AnswerState {
  [questionId: string]: number[];
}

export default function QuizPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{ score: number; passed: boolean } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/courses/${params.courseId}`);
    }
  }, [authLoading, params.courseId, router, user]);

  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      const [quizData, attemptData] = await Promise.all([
        getQuizById(params.courseId, params.quizId),
        user?.id ? getUserQuizAttemptsForQuiz(user.id, params.quizId) : Promise.resolve([])
      ]);
      setQuiz(quizData);
      setAttempts(attemptData);
      setLoading(false);
    };
    loadData();
  }, [params.courseId, params.quizId, user?.id]);

  const canAttempt = useMemo(() => {
    if (!quiz) return false;
    if (quiz.maxAttempts == null) return true;
    return attempts.length < quiz.maxAttempts;
  }, [attempts.length, quiz]);

  const handleSelectionChange = (question: QuizQuestion, optionIndex: number) => {
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.type === 'single' || question.type === 'truefalse') {
        return { ...prev, [question.id]: [optionIndex] };
      }
      const exists = current.includes(optionIndex);
      const updated = exists ? current.filter((idx) => idx !== optionIndex) : [...current, optionIndex];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !user) return;
    const unanswered = quiz.questions.some((q) => !answers[q.id] || answers[q.id].length === 0);
    if (unanswered) {
      setError('Please answer all questions before submitting.');
      return;
    }
    setError(null);
    setSubmitting(true);

    const correctCount = quiz.questions.reduce((count, question) => {
      const selected = answers[question.id] || [];
      const correct = question.correctOptionIndexes;
      const isCorrect =
        selected.length === correct.length && selected.every((index) => correct.includes(index));
      return count + (isCorrect ? 1 : 0);
    }, 0);

    const score = Math.round((correctCount / quiz.questions.length) * 100);
    const passed = score >= quiz.passingScore;
    const attempt: QuizAttempt = {
      id: `${Date.now()}`,
      quizId: params.quizId,
      courseId: params.courseId,
      userId: user.id,
      score,
      passed,
      answers: quiz.questions.map((q) => ({
        questionId: q.id,
        selectedOptionIndexes: answers[q.id] || []
      })),
      createdAt: new Date().toISOString()
    };

    await saveQuizAttempt(attempt);
    setAttempts((prev) => [...prev, attempt]);
    setResult({ score, passed });
    setSubmitting(false);
  };

  return (
    <LayoutWrapper>
      <div className="space-y-4">
        {loading && <p>Loading quiz...</p>}
        {!loading && !quiz && <p>Quiz not found.</p>}

        {quiz && (
          <>
            <Card title={quiz.title} description={quiz.description || 'Complete this quiz to test your knowledge.'}>
              <div className="mb-3 text-sm text-slate-700">
                Passing score: {quiz.passingScore}%{' '}
                {quiz.maxAttempts ? `· Attempts remaining: ${Math.max(quiz.maxAttempts - attempts.length, 0)}` : '· Unlimited attempts'}
              </div>
              {!canAttempt && (
                <p className="text-sm text-red-600">You have reached the maximum number of attempts for this quiz.</p>
              )}
              <div className="space-y-4">
                {quiz.questions.map((question) => (
                  <div key={question.id} className="rounded-lg border border-slate-200 p-4">
                    <p className="font-semibold text-slate-800">{question.prompt}</p>
                    <div className="mt-2 space-y-2 text-sm text-slate-700">
                      {question.options.map((option, index) => {
                        const isChecked = answers[question.id]?.includes(index) ?? false;
                        const inputType = question.type === 'multi' ? 'checkbox' : 'radio';
                        return (
                          <label key={option} className="flex items-center gap-2">
                            <input
                              type={inputType}
                              name={question.id}
                              value={index}
                              checked={isChecked}
                              onChange={() => handleSelectionChange(question, index)}
                              disabled={!canAttempt || submitting}
                            />
                            <span>{option}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
              {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
              <div className="mt-4 flex flex-wrap items-center gap-3">
                <Button onClick={handleSubmit} disabled={!canAttempt || submitting}>
                  {submitting ? 'Submitting...' : 'Submit Quiz'}
                </Button>
                <Link href={`/courses/${params.courseId}`} className="text-sm text-brand hover:underline">
                  Return to course
                </Link>
              </div>
            </Card>

            {result && (
              <Card title="Quiz result" description="Your latest attempt outcome.">
                <p className="text-sm text-slate-700">You scored {result.score}%.</p>
                <p className="text-sm font-semibold text-slate-800">{result.passed ? 'Passed' : 'Failed'}</p>
              </Card>
            )}
          </>
        )}
      </div>
    </LayoutWrapper>
  );
}
