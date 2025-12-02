"use client";

import Link from "next/link";
import * as React from "react";
import {
  LayoutDashboard,
  BookOpen,
  Award,
  Layers3,
  Users,
  BarChart3,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { motion } from "framer-motion";

import { useAuth } from "@/components/providers/auth-provider";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const adminRoles = new Set(["admin", "instructor", "superadmin"]);

const baseNav = [
  { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { label: "My Courses", href: "/modules/courses", icon: BookOpen },
  { label: "Certificates", href: "/certificates", icon: Award },
];

const adminNav = [
  { label: "Course Management", href: "/admin/courses", icon: Layers3 },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Reports", href: "/admin/reports", icon: BarChart3 },
];

interface SidebarProps {
  pathname: string;
  variant?: "desktop" | "mobile";
  onNavigate?: () => void;
}

export function Sidebar({
  pathname,
  variant = "desktop",
  onNavigate,
}: SidebarProps) {
  const { user } = useAuth();
  const [collapsed, setCollapsed] = React.useState(false);
  const isAdmin = !!(user && adminRoles.has(user.role));

  const wrapperClasses =
    variant === "desktop"
      ? "hidden xl:flex"
      : "flex w-full flex-col";

  const width = collapsed && variant === "desktop" ? 92 : 280;

  const navSections = React.useMemo(() => {
    return isAdmin ? [baseNav, adminNav] : [baseNav];
  }, [isAdmin]);

  const handleNavigate = () => {
    onNavigate?.();
  };

  if (!user) {
    return null;
  }

  return (
    <div className={wrapperClasses}>
      {variant === "desktop" ? (
        <motion.aside
          animate={{ width }}
          className="flex flex-col rounded-3xl border border-slate-200/80 bg-white/90 p-4 shadow-subtle"
        >
          <div className="flex items-center justify-between px-2">
            {!collapsed && (
              <div>
                <p className="text-xs uppercase tracking-widest text-slate-400">
                  Navigation
                </p>
                <p className="text-sm font-semibold text-slate-800">
                  Welcome, {user.name.split(" ")[0] ?? "Learner"}
                </p>
              </div>
            )}
            <button
              type="button"
              className="inline-flex size-9 items-center justify-center rounded-2xl border border-slate-200 text-slate-500 transition hover:border-primary/40 hover:text-primary"
              onClick={() => setCollapsed((prev) => !prev)}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
            >
              {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
            </button>
          </div>

          <div className="mt-6 space-y-4">
            {navSections.map((section, sectionIdx) => (
              <div key={sectionIdx} className="space-y-1">
                {sectionIdx === 1 && !collapsed && (
                  <Badge variant="warning" className="mb-2 px-3 py-1">
                    Admin
                  </Badge>
                )}
                {section.map((item) => {
                  const Icon = item.icon;
                  const active =
                    pathname === item.href ||
                    (item.href !== "/" && pathname.startsWith(item.href));
                  const link = (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={handleNavigate}
                      className={cn(
                        "group flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-semibold transition",
                        active
                          ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                          : "text-slate-500 hover:bg-muted hover:text-slate-900",
                      )}
                    >
                      <Icon
                        className={cn(
                          "size-4 transition",
                          active && "text-primary",
                        )}
                      />
                      <span
                        className={cn(
                          "whitespace-nowrap transition-opacity",
                          collapsed ? "opacity-0" : "opacity-100",
                        )}
                      >
                        {item.label}
                      </span>
                    </Link>
                  );

                  if (collapsed) {
                    return (
                      <Tooltip key={item.href}>
                        <TooltipTrigger>
                          <div>{link}</div>
                        </TooltipTrigger>
                        <TooltipContent>{item.label}</TooltipContent>
                      </Tooltip>
                    );
                  }

                  return (
                    <React.Fragment key={item.href}>{link}</React.Fragment>
                  );
                })}
              </div>
            ))}
          </div>
        </motion.aside>
      ) : (
        <div className="flex w-full flex-col gap-4">
          <div>
            <p className="text-xs uppercase tracking-widest text-slate-400">
              Navigation
            </p>
            <p className="text-sm font-semibold text-slate-800">
              Welcome, {user.name}
            </p>
          </div>
          {navSections.map((section, sectionIdx) => (
            <div key={sectionIdx} className="space-y-2">
              {sectionIdx === 1 && (
                <Badge variant="warning" className="px-3 py-1">
                  Admin
                </Badge>
              )}
              {section.map((item) => {
                const Icon = item.icon;
                const active =
                  pathname === item.href ||
                  (item.href !== "/" && pathname.startsWith(item.href));
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={handleNavigate}
                    className={cn(
                      "flex items-center gap-3 rounded-2xl px-4 py-3 text-sm font-semibold transition",
                      active
                        ? "bg-gradient-to-r from-primary/10 to-secondary/10 text-primary"
                        : "text-slate-500 hover:bg-muted hover:text-slate-900",
                    )}
                  >
                    <Icon className="size-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
