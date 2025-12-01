'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { loginSchema } from '@/lib/validation';

export default function LoginPage() {
  const { login } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      email: String(formData.get('email')),
      password: String(formData.get('password'))
    };
    const parsed = loginSchema.safeParse(payload);
    if (!parsed.success) {
      setError('Please provide a valid email and password.');
      return;
    }
    setError(null);
    await login(parsed.data.email, parsed.data.password);
  };

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-md">
        <Card title="Welcome back" description="Login to access your courses and progress.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email</label>
              <Input name="email" type="email" placeholder="you@example.com" required />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Password</label>
              <Input name="password" type="password" placeholder="••••••••" required />
            </div>
            {error && <p className="text-sm text-red-600">{error}</p>}
            <Button type="submit" className="w-full">
              Login
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            New to IBS LMS?{' '}
            <Link className="text-brand" href="/register">
              Create an account
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
