"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

type TabsContextValue = {
  value: string;
  setValue?: (value: string) => void;
};

const TabsContext = React.createContext<TabsContextValue | undefined>(undefined);

interface TabsProps {
  value?: string;
  defaultValue: string;
  onValueChange?: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}

export const Tabs: React.FC<TabsProps> = ({
  value,
  defaultValue,
  onValueChange,
  children,
  className,
}) => {
  const [internalValue, setInternalValue] = React.useState(defaultValue);
  const activeValue = value ?? internalValue;

  const setValue = React.useCallback(
    (next: string) => {
      setInternalValue(next);
      onValueChange?.(next);
    },
    [onValueChange],
  );

  return (
    <TabsContext.Provider
      value={{ value: activeValue, setValue: value ? onValueChange : setValue }}
    >
      <div className={cn("space-y-6", className)}>{children}</div>
    </TabsContext.Provider>
  );
};

export const TabsList = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      "inline-flex h-12 items-center justify-start rounded-3xl border border-slate-200 bg-muted p-1 text-sm text-slate-600",
      className,
    )}
    {...props}
  />
);

export interface TabsTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  value: string;
}

export const TabsTrigger = ({
  value,
  className,
  children,
  ...props
}: TabsTriggerProps) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsTrigger must be used inside <Tabs>");
  const active = ctx.value === value;

  return (
    <button
      type="button"
      onClick={() => ctx.setValue?.(value)}
      className={cn(
        "relative inline-flex h-10 flex-1 items-center justify-center rounded-2xl px-4 font-semibold transition",
        active ? "text-primary" : "text-slate-500",
        className,
      )}
      {...props}
    >
      {active && (
        <motion.span
          layoutId="tabs-pill"
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute inset-0 rounded-2xl bg-white shadow-subtle"
        />
      )}
      <span className="relative z-10">{children}</span>
    </button>
  );
};

export interface TabsContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  value: string;
}

export const TabsContent = ({
  value,
  children,
  className,
  ...props
}: TabsContentProps) => {
  const ctx = React.useContext(TabsContext);
  if (!ctx) throw new Error("TabsContent must be used inside <Tabs>");

  const isActive = ctx.value === value;

  return (
    <AnimatePresence mode="wait">
      {isActive && (
        <motion.div
          key={value}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.2 }}
          className={cn("rounded-3xl border border-slate-100 p-6", className)}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};
