import type { Metadata } from 'next';
import './globals.css';
import { ReactNode } from 'react';
import { SiteHeader } from '@/components/nav/site-header';
import { AppProviders } from '@/components/providers/app-providers';

export const metadata: Metadata = {
  title: 'IBS LMS',
  description: 'Cloud-ready learning management system for individuals and enterprises.'
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AppProviders>
          <SiteHeader />
          <main>{children}</main>
        </AppProviders>
      </body>
    </html>
  );
}
