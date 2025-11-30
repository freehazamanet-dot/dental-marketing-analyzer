"use client";

import * as React from "react";
import { cn } from "@/lib/utils";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, error, ...props }, ref) => {
    return (
      <div className="relative">
        <input
          type={type}
          className={cn(
            "flex h-11 w-full rounded-lg border-2 bg-white px-4 py-2 text-sm transition-all duration-200",
            "placeholder:text-slate-400",
            "focus:outline-none focus:ring-2 focus:ring-teal-500/20 focus:border-teal-500",
            "disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-slate-50",
            error
              ? "border-red-300 focus:border-red-500 focus:ring-red-500/20"
              : "border-slate-200 hover:border-slate-300",
            className
          )}
          ref={ref}
          {...props}
        />
        {error && (
          <p className="mt-1.5 text-sm text-red-500">{error}</p>
        )}
      </div>
    );
  }
);
Input.displayName = "Input";

export { Input };

