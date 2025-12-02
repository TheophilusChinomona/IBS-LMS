"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { AnimatePresence, motion } from "framer-motion";

import { cn } from "@/lib/utils";

interface TooltipContextValue {
  show: boolean;
  setShow: (show: boolean) => void;
}

const TooltipContext = React.createContext<TooltipContextValue | undefined>(
  undefined,
);

const useTooltip = () => {
  const ctx = React.useContext(TooltipContext);
  if (!ctx) throw new Error("Tooltip components must be used within <Tooltip>");
  return ctx;
};

interface TooltipProps {
  children: React.ReactNode;
}

export const Tooltip: React.FC<TooltipProps> = ({ children }) => {
  const [show, setShow] = React.useState(false);

  return (
    <TooltipContext.Provider value={{ show, setShow }}>
      <div className="relative inline-flex">{children}</div>
    </TooltipContext.Provider>
  );
};

export const TooltipTrigger = React.forwardRef<
  HTMLElement,
  React.HTMLAttributes<HTMLElement>
>(({ onMouseEnter, onMouseLeave, onFocus, onBlur, ...props }, ref) => {
  const { setShow } = useTooltip();
  return (
    <span
      ref={ref as React.Ref<HTMLSpanElement>}
      onMouseEnter={(event) => {
        setShow(true);
        onMouseEnter?.(event);
      }}
      onMouseLeave={(event) => {
        setShow(false);
        onMouseLeave?.(event);
      }}
      onFocus={(event) => {
        setShow(true);
        onFocus?.(event);
      }}
      onBlur={(event) => {
        setShow(false);
        onBlur?.(event);
      }}
      {...props}
    />
  );
});
TooltipTrigger.displayName = "TooltipTrigger";

export const TooltipContent = ({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => {
  const { show } = useTooltip();
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return createPortal(
    <AnimatePresence>
      {show && (
        <motion.div
          className="z-50"
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 4 }}
        >
          <div
            className={cn(
              "rounded-2xl border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 shadow-subtle",
              className,
            )}
            {...props}
          >
            {children}
          </div>
        </motion.div>
      )}
    </AnimatePresence>,
    document.body,
  );
};
