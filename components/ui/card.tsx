import * as React from "react";

import { cn } from "@/lib/utils";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: React.ReactNode;
  description?: React.ReactNode;
  padded?: boolean;
}

const BaseCard = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, title, description, children, padded = true, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "rounded-3xl border border-slate-200/80 bg-card shadow-subtle",
        "bg-white/95 backdrop-blur supports-[backdrop-filter]:bg-white/80",
        className,
      )}
      {...props}
    >
      {(title || description) && (
        <div className="space-y-1.5 border-b border-slate-100 px-6 py-5">
          {title && (
            <h3 className="text-lg font-semibold tracking-tight text-card-foreground">
              {title}
            </h3>
          )}
          {description && <p className="text-sm text-slate-500">{description}</p>}
        </div>
      )}
      <div className={cn(padded && "p-6", description && "pt-4")}>{children}</div>
    </div>
  ),
);
BaseCard.displayName = "Card";

const CardHeader = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("space-y-1.5 p-6", className)} {...props} />
);

const CardTitle = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLHeadingElement>) => (
  <h3
    className={cn(
      "text-xl font-semibold tracking-tight text-card-foreground",
      className,
    )}
    {...props}
  />
);

const CardDescription = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement>) => (
  <p className={cn("text-sm text-slate-500", className)} {...props} />
);

const CardContent = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("p-6 pt-0", className)} {...props} />
);

const CardFooter = ({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn("flex items-center p-6 pt-0", className)} {...props} />
);

export {
  BaseCard as Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
};
