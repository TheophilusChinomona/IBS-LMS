"use client";

import * as React from "react";
import { motion, AnimatePresence } from "framer-motion";

import { cn } from "@/lib/utils";

interface DropdownContextValue {
  open: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  triggerRef: React.RefObject<HTMLButtonElement>;
  contentRef: React.RefObject<HTMLDivElement>;
}

const DropdownContext = React.createContext<DropdownContextValue | null>(null);

const useDropdown = () => {
  const context = React.useContext(DropdownContext);
  if (!context) {
    throw new Error("Dropdown components must be used within <DropdownMenu>");
  }
  return context;
};

interface DropdownMenuProps {
  children: React.ReactNode;
}

export const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
  const [open, setOpen] = React.useState(false);
  const triggerRef = React.useRef<HTMLButtonElement>(null);
  const contentRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    function handleClick(event: MouseEvent) {
      if (
        !contentRef.current ||
        contentRef.current.contains(event.target as Node)
      ) {
        return;
      }
      if (
        triggerRef.current &&
        triggerRef.current.contains(event.target as Node)
      ) {
        return;
      }
      setOpen(false);
    }
    function handleKey(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
      }
    }
    if (open) {
      document.addEventListener("mousedown", handleClick);
      document.addEventListener("keydown", handleKey);
    }
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  return (
    <DropdownContext.Provider
      value={{ open, setOpen, triggerRef, contentRef }}
    >
      <div className="relative inline-flex">{children}</div>
    </DropdownContext.Provider>
  );
};

export interface DropdownMenuTriggerProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {}

export const DropdownMenuTrigger = React.forwardRef<
  HTMLButtonElement,
  DropdownMenuTriggerProps
>(({ className, onClick, ...props }, forwardedRef) => {
  const { open, setOpen, triggerRef } = useDropdown();
  const ref = forwardedRef ?? triggerRef;
  return (
    <button
      ref={(node) => {
        triggerRef.current = node ?? null;
        if (typeof ref === "function") {
          ref(node);
        } else if (ref) {
          (ref as React.MutableRefObject<HTMLButtonElement | null>).current =
            node;
        }
      }}
      aria-haspopup="menu"
      aria-expanded={open}
      onClick={(event) => {
        setOpen((prev) => !prev);
        onClick?.(event);
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 shadow-subtle transition hover:border-primary/50 hover:text-primary",
        className,
      )}
      {...props}
    />
  );
});
DropdownMenuTrigger.displayName = "DropdownMenuTrigger";

export interface DropdownMenuContentProps
  extends React.HTMLAttributes<HTMLDivElement> {
  align?: "start" | "end";
}

export const DropdownMenuContent = React.forwardRef<
  HTMLDivElement,
  DropdownMenuContentProps
>(({ className, children, align = "end", ...props }, forwardedRef) => {
  const { open, contentRef } = useDropdown();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          ref={(node) => {
            contentRef.current = node ?? null;
            if (typeof forwardedRef === "function") {
              forwardedRef(node);
            } else if (forwardedRef) {
              (
                forwardedRef as React.MutableRefObject<HTMLDivElement | null>
              ).current = node;
            }
          }}
          role="menu"
          initial={{ opacity: 0, y: 6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 6 }}
          transition={{ duration: 0.15 }}
          className={cn(
            "absolute z-50 mt-3 min-w-[200px] rounded-3xl border border-slate-200/80 bg-white/95 p-2 shadow-elevated backdrop-blur",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
          {...props}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
});
DropdownMenuContent.displayName = "DropdownMenuContent";

export const DropdownMenuItem = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement>
>(({ className, ...props }, ref) => (
  <button
    ref={ref}
    role="menuitem"
    className={cn(
      "flex w-full items-center gap-2 rounded-2xl px-3 py-2 text-sm text-slate-700 transition hover:bg-muted",
      className,
    )}
    {...props}
  />
));
DropdownMenuItem.displayName = "DropdownMenuItem";

export const DropdownMenuLabel = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p
    className={cn(
      "px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-slate-400",
      className,
    )}
    {...props}
  />
);

export const DropdownMenuSeparator = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn("my-1 h-px bg-slate-100", className)}
    role="separator"
    {...props}
  />
);
