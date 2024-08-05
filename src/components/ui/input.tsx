import * as React from "react";

import { cn } from "@/lib/utils";
import { Label } from "./label";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string | React.ReactNode;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, leftIcon, rightIcon, label, error, id, ...props },
    ref
  ) => {
    return (
      <div className="flex flex-col gap-1.5 w-full">
        {label ? <Label htmlFor={id} className="mb-0.5">{label}</Label> : null}
        <div className="relative">
          {leftIcon ? (
            <span className="absolute left-1 z-20 top-[50%] -translate-y-[50%] text-fade">
              {leftIcon}
            </span>
          ) : null}
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
              className
            )}
            ref={ref}
            {...props}
            id={id}
          />
          {rightIcon ? (
            <span className="absolute right-1 z-20 top-[50%] -translate-y-[50%] text-fade">
              {rightIcon}
            </span>
          ) : null}
        </div>
        <p className="h-1 mt-0.5 text-red-500 text-[10px]">{error}</p>
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };
