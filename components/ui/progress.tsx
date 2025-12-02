"use client";

import * as React from "react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  value: number;
}

export const Progress: React.FC<ProgressProps> = ({
  value,
  className,
  ...props
}) => (
  <div
    className={cn(
      "relative h-3 w-full overflow-hidden rounded-full bg-slate-100",
      className,
    )}
    {...props}
  >
    <motion.div
      className="h-full rounded-full bg-gradient-to-r from-primary to-secondary"
      initial={{ width: 0 }}
      animate={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      transition={{ type: "spring", stiffness: 120, damping: 20 }}
    />
  </div>
);
