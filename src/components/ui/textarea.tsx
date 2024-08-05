import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface TextareaProps
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string | React.ReactNode;
  error?: string;
}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, label, error, id, ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? (
          <Label htmlFor={id} className="mb-0.5">
            {label}
          </Label>
        ) : null}
        <textarea
          className={cn(
            "flex min-h-[60px] w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
            className
          )}
          ref={ref}
          {...props}
        />
        <p className="h-1 mt-0.5 text-red-500 text-[10px]">{error}</p>
      </div>
    );
  }
);
Textarea.displayName = "Textarea";

export { Textarea };
