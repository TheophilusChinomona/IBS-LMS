"use client";

import { Toaster as SonnerToaster, toast } from "sonner";

export const Toaster = () => (
  <SonnerToaster
    position="top-right"
    toastOptions={{
      style: {
        borderRadius: "1.5rem",
        background: "#ffffff",
        border: "1px solid rgba(226, 232, 240, 0.9)",
        boxShadow: "0 15px 30px rgba(15, 23, 42, 0.1)",
        color: "#0f172a",
      },
      className: "text-sm font-semibold",
    }}
  />
);

export { toast };
