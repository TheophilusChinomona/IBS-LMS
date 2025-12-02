'use client';

// Learner certificates list showing issued course certificates.

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/components/providers/auth-provider';
import { getCertificatesForUser } from '@/app/modules/courses/services/firestore';
import type { Certificate } from '@/types/models';

export default function CertificatesPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loadingCertificates, setLoadingCertificates] = useState(true);

  useEffect(() => {
    if (!loading && !user) {
      router.replace('/login?redirect=/certificates');
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

  return (
    <LayoutWrapper>
      <Card title="My certificates" description="Certificates generated for your completed courses.">
        {loadingCertificates ? (
          <p className="text-sm text-slate-700">Loading certificates...</p>
        ) : certificates.length === 0 ? (
          <p className="text-sm text-slate-700">No certificates yet. Complete a course to request one.</p>
        ) : (
          <ul className="space-y-3">
            {certificates.map((certificate) => (
              <li key={certificate.id} className="rounded-lg border border-slate-200 p-3">
                <p className="text-sm font-semibold text-slate-800">Course: {certificate.courseId}</p>
                <p className="text-xs text-slate-600">Issued: {new Date(certificate.issuedAt).toLocaleDateString()}</p>
                <p className="text-xs text-slate-600">Certificate #: {certificate.certificateNumber}</p>
                {certificate.downloadUrl ? (
                  <a href={certificate.downloadUrl} className="text-sm text-brand hover:underline" target="_blank" rel="noreferrer">
                    Download
                  </a>
                ) : (
                  <span className="text-xs text-slate-600">Processing...</span>
                )}
              </li>
            ))}
          </ul>
        )}
        <p className="mt-3 text-xs text-slate-600">
          Need a certificate? Visit your <Link href="/courses">courses</Link> and request it from the course page once you finish.
        </p>
      </Card>
    </LayoutWrapper>
  );
}
