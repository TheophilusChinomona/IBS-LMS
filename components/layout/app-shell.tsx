"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

import { useAuth } from "@/components/providers/auth-provider";
import { Sheet, SheetContent } from "@/components/ui/sheet";
import { Header } from "./header";
import { Sidebar } from "./sidebar";

const sidebarSegments = ["/dashboard", "/admin", "/modules", "/certificates"];

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);

  const showSidebar =
    !!user &&
    !!pathname &&
    sidebarSegments.some((segment) => pathname.startsWith(segment));

  return (
    <div className="relative min-h-screen bg-gradient-to-b from-slate-50 via-white to-slate-100 text-slate-900">
      <Header onOpenSidebar={() => setSidebarOpen(true)} />
      <div className="mx-auto flex w-full max-w-7xl gap-6 px-4 pb-16 pt-28 sm:px-6 lg:px-8">
        {showSidebar && (
          <Sidebar pathname={pathname ?? ""} variant="desktop" />
        )}
        <div className="flex-1">
          <AnimatePresence mode="wait">
            <motion.main
              key={pathname}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.25, ease: "easeOut" }}
              className="rounded-[32px] border border-white/40 bg-white/90 p-6 shadow-subtle sm:p-10"
            >
              {children}
            </motion.main>
          </AnimatePresence>
        </div>
      </div>

      {showSidebar && (
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-80 border-none bg-white">
            <Sidebar
              pathname={pathname ?? ""}
              variant="mobile"
              onNavigate={() => setSidebarOpen(false)}
            />
          </SheetContent>
        </Sheet>
      )}
    </div>
  );
}
