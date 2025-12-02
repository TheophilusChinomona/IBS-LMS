'use client';

// Learner-facing quiz page with premium UI, motion, and toasts.

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Circle,
  Clock3,
  Trophy,
} from "lucide-react";

import {
  getQuizById,
  getUserQuizAttemptsForQuiz,
  saveQuizAttempt,
} from "@/app/modules/courses/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Quiz, QuizAttempt, QuizQuestion } from "@/types/models";

interface AnswerState {
  [questionId: string]: number[];
}

const questionTypeCopy: Record<QuizQuestion["type"], string> = {
  single: "Single choice",
  multi: "Multi-select",
  truefalse: "True / False",
};

export default function QuizPage() {
  const params = useParams<{ courseId: string; quizId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [quiz, setQuiz] = useState<Quiz | null>(null);
  const [answers, setAnswers] = useState<AnswerState>({});
  const [attempts, setAttempts] = useState<QuizAttempt[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<{
    score: number;
    passed: boolean;
  } | null>(null);
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
        user?.id
          ? getUserQuizAttemptsForQuiz(user.id, params.quizId)
          : Promise.resolve([]),
      ]);
      setQuiz(quizData);
      setAttempts(attemptData);
      setLoading(false);
    };
    loadData();
  }, [params.courseId, params.quizId, user?.id]);

  const answeredCount = useMemo(() => {
    if (!quiz) return 0;
    return quiz.questions.filter(
      (question) => (answers[question.id] ?? []).length > 0,
    ).length;
  }, [answers, quiz]);

  const canAttempt = useMemo(() => {
    if (!quiz) return false;
    if (quiz.maxAttempts == null) return true;
    return attempts.length < quiz.maxAttempts;
  }, [attempts.length, quiz]);

  const attemptsRemaining =
    quiz?.maxAttempts != null
      ? Math.max(quiz.maxAttempts - attempts.length, 0)
      : null;

  const handleSelectionChange = (question: QuizQuestion, optionIndex: number) => {
    if (!canAttempt || submitting) return;
    setAnswers((prev) => {
      const current = prev[question.id] || [];
      if (question.type === "single" || question.type === "truefalse") {
        return { ...prev, [question.id]: [optionIndex] };
      }
      const exists = current.includes(optionIndex);
      const updated = exists
        ? current.filter((idx) => idx !== optionIndex)
        : [...current, optionIndex];
      return { ...prev, [question.id]: updated };
    });
  };

  const handleSubmit = async () => {
    if (!quiz || !user || submitting) return;
    const unanswered = quiz.questions.some(
      (q) => !answers[q.id] || answers[q.id].length === 0,
    );
    if (unanswered) {
      const message = "Please answer all questions before submitting.";
      setError(message);
      toast.error("Almost there", {
        description: message,
      });
      return;
    }
    setError(null);
    setSubmitting(true);

    const correctCount = quiz.questions.reduce((count, question) => {
      const selected = answers[question.id] || [];
      const correct = question.correctOptionIndexes;
      const isCorrect =
        selected.length === correct.length &&
        selected.every((index) => correct.includes(index));
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
        selectedOptionIndexes: answers[q.id] || [],
      })),
      createdAt: new Date().toISOString(),
    };

    try {
      await saveQuizAttempt(attempt);
      setAttempts((prev) => [...prev, attempt]);
      setResult({ score, passed });
      toast(passed ? "Quiz passed! 🎉" : "Quiz submitted", {
        description: `You scored ${score}% ${
          passed ? "— great work!" : "— review and try again."
        }`,
      });
    } catch (submissionError) {
      console.error("Failed to submit quiz attempt", submissionError);
      toast.error("Unable to submit quiz", {
        description: "Please try again in a moment.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <Card className="p-8 text-center text-sm text-slate-500">
          Fetching quiz experience...
        </Card>
      </div>
    );
  }

  if (!quiz) {
    return (
      <div className="space-y-6">
        <Card className="flex flex-col items-start gap-4 rounded-3xl p-8">
          <Badge variant="warning" className="gap-2">
            <AlertTriangle className="h-4 w-4" />
            Quiz unavailable
          </Badge>
          <p className="text-base text-slate-600">
            We couldn&apos;t find this quiz. It may have been moved or removed.
          </p>
          <Link
            href={`/courses/${params.courseId}`}
            className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
          >
            <ArrowLeft className="h-4 w-4" />
            Back to course
          </Link>
        </Card>
      </div>
    );
  }

  const progressValue =
    quiz.questions.length === 0
      ? 0
      : Math.round((answeredCount / quiz.questions.length) * 100);

  return (
    <div className="space-y-10">
      <div className="flex flex-col gap-6 lg:flex-row">
        <Card className="flex-1 space-y-6 p-6 sm:p-8">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <Badge className="gap-1">
                <Trophy className="h-4 w-4" />
                {quiz.questions.length} questions
              </Badge>
              <Badge variant="success">
                Passing score {quiz.passingScore}%
              </Badge>
              {attemptsRemaining != null ? (
                <Badge variant={attemptsRemaining > 0 ? "default" : "danger"}>
                  {attemptsRemaining} attempt
                  {attemptsRemaining === 1 ? "" : "s"} left
                </Badge>
              ) : (
                <Badge variant="default">Unlimited attempts</Badge>
              )}
            </div>
            <h1 className="text-3xl font-semibold text-slate-900">
              {quiz.title}
            </h1>
            <p className="text-base text-slate-600">
              {quiz.description ||
                "Complete this quiz to reinforce your understanding."}
            </p>
          </div>
          <div className="space-y-3">
            <div className="flex items-center justify-between text-sm text-slate-500">
              <span>Question progress</span>
              <span className="font-semibold text-slate-900">
                {answeredCount}/{quiz.questions.length}
              </span>
            </div>
            <Progress value={progressValue} />
          </div>
          {!canAttempt && (
            <div className="flex items-center gap-2 rounded-2xl border border-amber-200 bg-amber-50/80 px-4 py-3 text-sm text-amber-800">
              <AlertTriangle className="h-4 w-4" />
              You have reached the maximum number of attempts for this quiz.
            </div>
          )}
          <div className="flex flex-wrap gap-3 text-sm text-slate-500">
            <Clock3 className="h-4 w-4 text-slate-400" />
            Review your answers before submitting to boost your score.
          </div>
        </Card>
        {result && (
          <Card className="w-full max-w-sm space-y-4 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <Trophy className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Latest attempt</p>
                <p className="text-2xl font-semibold text-slate-900">
                  {result.score}%
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <Badge variant={result.passed ? "success" : "danger"}>
                {result.passed ? "Passed" : "Try again"}
              </Badge>
              <span className="text-slate-600">
                {result.passed
                  ? "You hit the benchmark!"
                  : "Keep pushing for mastery."}
              </span>
            </div>
          </Card>
        )}
      </div>

      <div className="space-y-6">
        {quiz.questions.map((question, index) => {
          const selectedOptions = answers[question.id] || [];
          return (
            <motion.div
              key={question.id}
              initial={{ opacity: 0, y: 24 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.04 }}
            >
              <Card className="space-y-4 p-6 sm:p-8" padded={false}>
                <div className="space-y-3 p-6">
                  <div className="flex flex-wrap items-center gap-3">
                    <Badge>Question {index + 1}</Badge>
                    <span className="text-xs font-medium uppercase tracking-[0.2em] text-slate-400">
                      {questionTypeCopy[question.type]}
                    </span>
                  </div>
                  <h3 className="text-xl font-semibold text-slate-900">
                    {question.prompt}
                  </h3>
                </div>
                <div className="grid gap-3 border-t border-slate-100 p-6 sm:grid-cols-2">
                  {question.options.map((option, optionIndex) => {
                    const isSelected = selectedOptions.includes(optionIndex);
                    return (
                      <button
                        key={option}
                        type="button"
                        disabled={!canAttempt || submitting}
                        onClick={() =>
                          handleSelectionChange(question, optionIndex)
                        }
                        className={cn(
                          "flex h-full w-full items-center gap-3 rounded-2xl border px-4 py-3 text-left text-sm font-semibold text-slate-700 transition",
                          "hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/5",
                          isSelected &&
                            "border-primary/60 bg-primary/5 text-primary shadow-subtle",
                          (!canAttempt || submitting) && "opacity-60",
                        )}
                      >
                        {isSelected ? (
                          <CheckCircle2 className="h-5 w-5 text-primary" />
                        ) : (
                          <Circle className="h-5 w-5 text-slate-300" />
                        )}
                        <span>{option}</span>
                      </button>
                    );
                  })}
                </div>
              </Card>
            </motion.div>
          );
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          <AlertTriangle className="h-4 w-4" />
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-4">
        <Button
          onClick={handleSubmit}
          disabled={!canAttempt || submitting}
          className="min-w-[180px]"
        >
          {submitting ? "Submitting..." : "Submit quiz"}
        </Button>
        <Link
          href={`/courses/${params.courseId}`}
          className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Return to course
        </Link>
      </div>
    </div>
  );
}
