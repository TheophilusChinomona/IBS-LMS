'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { LayoutWrapper } from '@/components/layout/layout-wrapper';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/components/providers/auth-provider';
import { registerSchema } from '@/lib/validation';

export default function RegisterPage() {
  const { register } = useAuth();
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const payload = {
      name: String(formData.get('name')),
      email: String(formData.get('email')),
      password: String(formData.get('password'))
    };
    const parsed = registerSchema.safeParse(payload);
    if (!parsed.success) {
      setError('Please fill out all fields correctly.');
      return;
    }
    setError(null);
    await register(parsed.data.name, parsed.data.email, parsed.data.password);
  };

  return (
    <LayoutWrapper>
      <div className="mx-auto max-w-md">
        <Card title="Create your account" description="Start learning with IBS LMS.">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <label className="text-sm font-medium">Full Name</label>
              <Input name="name" type="text" placeholder="Jane Doe" required />
            </div>
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
              Register
            </Button>
          </form>
          <p className="mt-4 text-sm text-slate-600">
            Already have an account?{' '}
            <Link className="text-brand" href="/login">
              Login
            </Link>
          </p>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
