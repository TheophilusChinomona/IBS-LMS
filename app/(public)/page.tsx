import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <div className="bg-gradient-to-b from-white to-slate-100">
      <LayoutWrapper>
        <div className="grid gap-10 lg:grid-cols-2 lg:items-center">
          <div className="space-y-6">
            <h1 className="text-4xl font-bold text-slate-900 sm:text-5xl">IBS Learning Management System</h1>
            <p className="text-lg text-slate-700">
              Deliver secure, compliant, and engaging training to individuals and teams. Launch quickly with our cloud-ready LMS
              built on Next.js and Firebase.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link href="/courses">
                <Button>View Courses</Button>
              </Link>
              <Link href="/login">
                <Button variant="secondary">Login</Button>
              </Link>
            </div>
          </div>
          <Card title="Why IBS?" description="Built for scale and trust">
            <ul className="space-y-3 text-sm text-slate-700">
              <li>✅ Secure authentication and role-based access</li>
              <li>✅ Modular course, module, and lesson management</li>
              <li>✅ Ready for Vercel + Firebase deployments</li>
              <li>✅ Corporate-ready with upcoming company support</li>
            </ul>
          </Card>
        </div>
      </LayoutWrapper>
    </div>
  );
}
