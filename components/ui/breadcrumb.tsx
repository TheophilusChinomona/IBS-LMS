"use client";

import * as React from "react";
import Link from "next/link";
import { Slash } from "lucide-react";

import { cn } from "@/lib/utils";

export interface BreadcrumbItem {
  label: string;
  href?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
  className?: string;
}

export const Breadcrumb: React.FC<BreadcrumbProps> = ({
  items,
  className,
}) => (
  <nav
    aria-label="Breadcrumb"
    className={cn("flex items-center gap-1 text-sm text-slate-500", className)}
  >
    {items.map((item, index) => {
      const last = index === items.length - 1;
      return (
        <React.Fragment key={item.label + index}>
          {item.href && !last ? (
            <Link
              href={item.href}
              className="rounded-xl px-2 py-1 text-slate-600 transition hover:bg-muted hover:text-slate-900"
            >
              {item.label}
            </Link>
          ) : (
            <span className="rounded-xl px-2 py-1 font-semibold text-slate-900">
              {item.label}
            </span>
          )}
          {!last && <Slash className="size-3 text-slate-400" />}
        </React.Fragment>
      );
    })}
  </nav>
);
