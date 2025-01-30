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
    ref,
  ) => {
    // Function to handle input number type restrictions
    const handleWheel = (event: React.WheelEvent<HTMLInputElement>) => {
      if (type === "number") {
        event.currentTarget.blur(); // Remove focus from input to prevent change
      }
    };

    const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
      if (
        type === "number" &&
        (event.key === "ArrowUp" || event.key === "ArrowDown")
      ) {
        event.preventDefault(); // Prevent the arrow key behavior
      }
    };

    return (
      <div className="flex w-full flex-col gap-1.5">
        {label ? (
          <Label htmlFor={id} className="mb-0.5">
            {label}
          </Label>
        ) : null}
        <div className="relative">
          {leftIcon ? (
            <span className="text-fade absolute left-1 top-[50%] z-20 -translate-y-[50%]">
              {leftIcon}
            </span>
          ) : null}
          <input
            type={type}
            className={cn(
              "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-primary disabled:cursor-not-allowed disabled:opacity-50",
              type === "number" && "hide-number-arrows", // Add a class for custom styles
              className,
            )}
            ref={ref}
            {...props}
            id={id}
            onWheel={handleWheel} // Prevent scrolling
            onKeyDown={handleKeyDown} // Prevent arrow key behavior
          />
          {rightIcon ? (
            <span className="text-fade absolute right-1 top-[50%] z-20 -translate-y-[50%]">
              {rightIcon}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 min-h-1 text-[10px] text-red-500">{error}</p>
      </div>
    );
  },
);
Input.displayName = "Input";

export { Input };
