'use client';

// Elevated learner assignment submission experience.

import { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { motion } from "framer-motion";
import {
  ArrowLeft,
  CheckCircle2,
  ClipboardList,
  FileText,
  UploadCloud,
} from "lucide-react";

import {
  getAssignmentById,
  submitAssignmentSubmission,
} from "@/app/modules/courses/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/toast";
import { cn } from "@/lib/utils";
import type { Assignment, AssignmentSubmission } from "@/types/models";

export default function AssignmentSubmissionPage() {
  const params = useParams<{ courseId: string; assignmentId: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loadingAssignment, setLoadingAssignment] = useState(true);
  const [textResponse, setTextResponse] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.replace(`/login?redirect=/courses/${params.courseId}`);
    }
  }, [authLoading, params.courseId, router, user]);

  useEffect(() => {
    const loadAssignment = async () => {
      setLoadingAssignment(true);
      const data = await getAssignmentById(
        params.courseId,
        params.assignmentId,
      );
      setAssignment(data);
      setLoadingAssignment(false);
    };
    loadAssignment();
  }, [params.assignmentId, params.courseId]);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0] ?? null;
    setFile(selectedFile);
  };

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!user || !assignment || submitting) return;
    setSubmitting(true);

    const submission: AssignmentSubmission = {
      id: `${Date.now()}`,
      assignmentId: assignment.id,
      courseId: params.courseId,
      userId: user.id,
      fileUrl: undefined,
      textResponse: textResponse.trim() || undefined,
      status: "submitted",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    try {
      await submitAssignmentSubmission(submission, file || undefined);
      setSubmitted(true);
      toast("Assignment submitted", {
        description: "We've notified your instructor. Sit tight for feedback.",
      });
    } catch (error) {
      console.error("Failed to submit assignment", error);
      toast.error("Submission failed", {
        description: "Please retry after checking your connection.",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingAssignment) {
    return (
      <Card className="p-8 text-center text-sm text-slate-500">
        Loading assignment details...
      </Card>
    );
  }

  if (!assignment) {
    return (
      <Card className="space-y-4 p-8 text-center">
        <Badge variant="warning" className="mx-auto w-fit gap-2">
          <ClipboardList className="h-4 w-4" />
          Assignment unavailable
        </Badge>
        <p className="text-base text-slate-600">
          We couldn&apos;t find this assignment. It might have been archived.
        </p>
        <Link
          href={`/courses/${params.courseId}`}
          className={cn(buttonVariants({ variant: "outline" }), "gap-2")}
        >
          <ArrowLeft className="h-4 w-4" />
          Back to course
        </Link>
      </Card>
    );
  }

  const statusLabel = submitted
    ? "Submitted"
    : assignment.required
      ? "Awaiting submission"
      : "Optional task";
  const statusVariant: "default" | "success" | "warning" | "danger" = submitted
    ? "success"
    : assignment.required
      ? "warning"
      : "default";

  return (
    <div className="space-y-10">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="overflow-hidden rounded-[32px] border border-transparent bg-gradient-to-r from-primary to-secondary p-8 text-white"
      >
        <div className="space-y-3">
          <Badge className="bg-white/20 text-white backdrop-blur">
            Assignment
          </Badge>
          <h1 className="text-3xl font-semibold">{assignment.title}</h1>
          <p className="text-base text-white/80">
            {assignment.description ||
              "Upload your work or provide additional commentary for review."}
          </p>
        </div>
        <div className="mt-6 flex flex-wrap items-center gap-4 text-sm">
          <Badge variant={statusVariant} className="bg-white/90 text-slate-900">
            {statusLabel}
          </Badge>
          <span className="text-white/80">
            {assignment.required
              ? "Required for course completion"
              : "Great for bonus mastery and instructor feedback"}
          </span>
        </div>
      </motion.div>

      <div className="grid gap-6 lg:grid-cols-[2fr,1fr]">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.05 }}
        >
          <Card className="space-y-6 p-6 sm:p-8">
            {submitted ? (
              <div className="flex flex-col items-center gap-4 text-center">
                <div className="rounded-3xl bg-success/10 p-4 text-success">
                  <CheckCircle2 className="h-8 w-8" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-slate-900">
                    Submission received
                  </h2>
                  <p className="mt-2 text-sm text-slate-600">
                    We&apos;ll send you a notification as soon as grading is
                    complete. Feel free to continue learning meanwhile.
                  </p>
                </div>
                <Link
                  href={`/courses/${params.courseId}`}
                  className={cn(buttonVariants(), "gap-2")}
                >
                  <ArrowLeft className="h-4 w-4" />
                  Return to course
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-slate-800">
                    Written response
                  </label>
                  <Textarea
                    value={textResponse}
                    onChange={(event) => setTextResponse(event.target.value)}
                    rows={6}
                    placeholder="Summarize your approach, methodology, or supporting commentary..."
                    className="min-h-[160px]"
                  />
                </div>
                <div className="space-y-3">
                  <label className="text-sm font-semibold text-slate-800">
                    Upload supporting file (optional)
                  </label>
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="flex w-full items-center justify-between rounded-2xl border border-dashed border-slate-300 bg-slate-50/70 px-5 py-4 text-left text-sm font-semibold text-slate-700 transition hover:border-primary/50 hover:bg-white"
                  >
                    <div className="flex items-center gap-3">
                      <div className="rounded-2xl bg-white p-3 text-primary shadow-subtle">
                        <UploadCloud className="h-5 w-5" />
                      </div>
                      <div>
                        <p>{file?.name || "Drag & drop or choose a file"}</p>
                        <p className="text-xs font-normal text-slate-500">
                          PDF, DOCX, or ZIP up to 20MB
                        </p>
                      </div>
                    </div>
                    <Badge variant="default">
                      {file ? "Replace file" : "Choose file"}
                    </Badge>
                  </button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileChange}
                    className="sr-only"
                  />
                </div>
                <div className="flex flex-wrap gap-4">
                  <Button type="submit" disabled={submitting}>
                    {submitting ? "Submitting..." : "Submit assignment"}
                  </Button>
                  {file && (
                    <Button
                      type="button"
                      variant="ghost"
                      onClick={() => setFile(null)}
                    >
                      Remove file
                    </Button>
                  )}
                </div>
              </form>
            )}
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card className="space-y-6 p-6 sm:p-8">
            <div className="flex items-center gap-3">
              <div className="rounded-2xl bg-primary/10 p-3 text-primary">
                <FileText className="h-6 w-6" />
              </div>
              <div>
                <p className="text-sm text-slate-500">Assignment status</p>
                <p className="text-lg font-semibold text-slate-900">
                  {statusLabel}
                </p>
              </div>
            </div>
            <div className="space-y-4 text-sm text-slate-600">
              <div className="rounded-2xl bg-slate-50/70 p-4">
                <p className="font-semibold text-slate-800">Instructor notes</p>
                <p className="mt-1 text-sm">
                  Provide clear references, link to any resources, and note any
                  blockers that reviewers should know about.
                </p>
              </div>
              <div className="rounded-2xl border border-slate-100 p-4">
                <p className="font-semibold text-slate-800">Submission tips</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-relaxed">
                  <li>Double-check formatting and include supporting docs.</li>
                  <li>Use the text field for context and decision rationale.</li>
                  <li>Reach out to your mentor if you need extensions.</li>
                </ul>
              </div>
            </div>
          </Card>
        </motion.div>
      </div>
    </div>
  );
}
