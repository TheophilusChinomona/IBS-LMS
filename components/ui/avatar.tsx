"use client";

import * as React from "react";
import { User } from "lucide-react";

import { cn } from "@/lib/utils";

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string | null;
  alt?: string;
  name?: string;
}

export const Avatar: React.FC<AvatarProps> = ({
  src,
  alt,
  name,
  className,
  ...props
}) => {
  const initials = React.useMemo(() => {
    if (!name) return "";
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  }, [name]);

  return (
    <div
      className={cn(
        "relative inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-200 bg-muted text-sm font-semibold text-slate-700",
        className,
      )}
      {...props}
    >
      {src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt ?? name ?? "Avatar"}
          className="h-full w-full rounded-full object-cover"
        />
      ) : initials ? (
        initials
      ) : (
        <User className="h-4 w-4 text-slate-400" />
      )}
    </div>
  );
};
