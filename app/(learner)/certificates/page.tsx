'use client';

// Premium certificates gallery for learners.

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Award, Download, Sparkles } from "lucide-react";

import { getCertificatesForUser } from "@/app/modules/courses/services/firestore";
import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Certificate } from "@/types/models";

export default function CertificatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/login?redirect=/certificates");
    }
  }, [loading, router, user]);

  useEffect(() => {
    const loadCertificates = async () => {
      if (!user?.id) return;
      setLoadingCertificates(true);
      const data = await getCertificatesForUser(user.id);
      setCertificates(data);
      setLoadingCertificates(false);
    };
    loadCertificates();
  }, [user?.id]);

  const heroMotion = {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.35, ease: "easeOut" },
  };

  return (
    <div className="space-y-10">
      <motion.div
        {...heroMotion}
        className="overflow-hidden rounded-[32px] border border-slate-200/60 bg-gradient-to-r from-primary via-indigo-500 to-secondary p-8 text-white shadow-hero"
      >
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="space-y-4">
            <Badge className="bg-white/20 text-white backdrop-blur">IBS Certified</Badge>
            <div className="space-y-2">
              <p className="text-sm uppercase tracking-[0.25em] text-white/70">
                Achievements
              </p>
              <h1 className="text-3xl font-semibold leading-tight md:text-4xl">
                Celebrate your certified expertise
              </h1>
              <p className="text-base text-white/80">
                Each certificate is signed by IBS Academy and ready to share with your team or on LinkedIn.
              </p>
            </div>
            <div className="flex flex-wrap gap-3">
              <Link href="/courses" className={cn(buttonVariants({ size: "lg" }), "bg-white text-primary shadow-lg")}>
                Browse next course
              </Link>
              <Link
                href="/dashboard"
                className={cn(buttonVariants({ variant: "ghost", size: "lg" }), "text-white hover:bg-white/10")}
              >
                View learning plan
              </Link>
            </div>
          </div>
          <div className="rounded-3xl bg-white/15 p-6 text-center text-sm text-white/80">
            <Sparkles className="mx-auto mb-3 h-10 w-10" />
            <p className="font-semibold">
              {certificates.length > 0
                ? `${certificates.length} certificate${certificates.length > 1 ? "s" : ""} issued`
                : "Earn your first certificate"}
            </p>
            <p className="text-white/70">Premium templates with IBS branding</p>
          </div>
        </div>
      </motion.div>

      {loadingCertificates ? (
        <Card className="p-8 text-center text-sm text-slate-500">
          Preparing your certificate gallery...
        </Card>
      ) : certificates.length === 0 ? (
        <Card className="space-y-4 p-8 text-center">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-slate-100">
            <Award className="h-8 w-8 text-primary" />
          </div>
          <h2 className="text-2xl font-semibold text-slate-900">
            No certificates yet
          </h2>
          <p className="text-sm text-slate-600">
            Complete a course and pass the final assessment to unlock beautifully branded certificates.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/courses" className={cn(buttonVariants(), "gap-2")}>
              Browse catalog
            </Link>
            <Link
              href="/dashboard"
              className={cn(buttonVariants({ variant: "ghost" }), "gap-2")}
            >
              View progress
            </Link>
          </div>
        </Card>
      ) : (
        <div className="grid gap-5">
          {certificates.map((certificate, index) => {
            const issuedDate = new Date(certificate.issuedAt).toLocaleDateString();
            const status = certificate.downloadUrl
              ? { label: "Ready to download", variant: "success" as const }
              : { label: "Processing", variant: "warning" as const };

            return (
              <motion.div
                key={certificate.id}
                initial={{ opacity: 0, y: 24 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="flex flex-col gap-6 rounded-[28px] p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
                  <div className="space-y-3">
                    <div className="flex flex-wrap items-center gap-3">
                      <Badge variant={status.variant}>{status.label}</Badge>
                      <p className="text-xs uppercase tracking-[0.3em] text-slate-400">
                        Certificate #{certificate.certificateNumber}
                      </p>
                    </div>
                    <div>
                      <p className="text-sm text-slate-500">Course</p>
                      <h3 className="text-2xl font-semibold text-slate-900">
                        {certificate.courseId}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-600">
                      Issued on {issuedDate} - IBS LMS Accreditation Board
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 sm:items-end">
                    {certificate.downloadUrl ? (
                      <a
                        href={certificate.downloadUrl}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(buttonVariants({ variant: "secondary" }), "gap-2")}
                      >
                        <Download className="h-4 w-4" />
                        Download PDF
                      </a>
                    ) : (
                      <Button variant="ghost" disabled className="gap-2">
                        <Download className="h-4 w-4" />
                        Generating...
                      </Button>
                    )}
                    <div className="text-left text-xs uppercase tracking-[0.4em] text-slate-400 sm:text-right">
                      IBS LMS
                    </div>
                  </div>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}
