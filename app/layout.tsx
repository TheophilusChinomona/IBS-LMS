import type { Metadata } from "next";
import "./globals.css";
import { ReactNode } from "react";

import { AppShell } from "@/components/layout/app-shell";
import { AppProviders } from "@/components/providers/app-providers";
import { Toaster } from "@/components/ui/toast";

export const metadata: Metadata = {
  title: "IBS LMS",
  description:
    "Cloud-ready learning management system for individuals and enterprises.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <AppProviders>
          <AppShell>{children}</AppShell>
          <Toaster />
        </AppProviders>
      </body>
    </html>
  );
}
