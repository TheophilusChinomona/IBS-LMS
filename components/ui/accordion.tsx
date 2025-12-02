"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";

import { cn } from "@/lib/utils";

export interface AccordionItem {
  id: string;
  title: string;
  content: React.ReactNode;
}

interface AccordionProps {
  items: AccordionItem[];
  defaultOpen?: string;
  allowMultiple?: boolean;
  className?: string;
}

export const Accordion: React.FC<AccordionProps> = ({
  items,
  defaultOpen,
  allowMultiple = false,
  className,
}) => {
  const [openItems, setOpenItems] = React.useState<string[]>(
    defaultOpen ? [defaultOpen] : [],
  );

  const toggleItem = (id: string) => {
    setOpenItems((prev) => {
      if (allowMultiple) {
        return prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      }
      return prev[0] === id ? [] : [id];
    });
  };

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item) => {
        const isOpen = openItems.includes(item.id);
        return (
          <div
            key={item.id}
            className="rounded-2xl border border-slate-200/80 bg-white/90 shadow-subtle"
          >
            <button
              className="flex w-full items-center justify-between px-5 py-4 text-left text-sm font-semibold text-slate-700"
              onClick={() => toggleItem(item.id)}
            >
              <span>{item.title}</span>
              <ChevronDown
                className={cn(
                  "size-4 text-slate-400 transition-transform",
                  isOpen && "rotate-180",
                )}
              />
            </button>
            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key={item.id}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.2 }}
                  className="overflow-hidden px-5 pb-4 text-sm text-slate-600"
                >
                  {item.content}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
};
