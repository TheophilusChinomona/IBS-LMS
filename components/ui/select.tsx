"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface SelectProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  helperText?: string;
}

const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
  ({ className, children, helperText, ...props }, ref) => (
    <div className="space-y-1.5">
      <div className="relative">
        <select
          ref={ref}
          className={cn(
            "h-11 w-full appearance-none rounded-2xl border border-slate-200/80 bg-white/90 px-4 text-sm text-slate-900",
            "shadow-subtle transition focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20",
            className,
          )}
          {...props}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-4 top-1/2 size-4 -translate-y-1/2 text-slate-400" />
      </div>
      {helperText && (
        <p className="text-xs text-slate-500">{helperText}</p>
      )}
    </div>
  ),
);
Select.displayName = "Select";

export { Select };
