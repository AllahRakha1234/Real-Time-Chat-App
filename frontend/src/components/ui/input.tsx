import * as React from "react";

import { cn } from "../../lib/utils";

interface InputProps extends React.ComponentProps<"input"> {
  label?: string;
  labelClassName?: string;
}

function Input({
  className,
  type,
  label,
  labelClassName,
  id,
  ...props
}: InputProps) {
  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className="flex flex-col gap-y-1">
      {label && (
        <label
          htmlFor={inputId}
          className={cn("text-xl font-medium", labelClassName)}
        >
          {label}
        </label>
      )}
      <input
        id={inputId}
        type={type}
        data-slot="input"
        className={cn(
          "placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-blue-200 flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-primary disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          "focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]",
          "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
          // File input specific styling - minimal and modern
          type === "file" && [
            "file:mr-3 file:py-1.5 file:px-3",
            "file:rounded-md file:border-0",
            "file:text-sm file:font-medium",
            "file:bg-slate-200 file:text-slate-700",
            "file:hover:bg-slate-50",
            "file:transition-all file:duration-150",
            "file:cursor-pointer",
            "file:focus:outline-none",
            "file:focus:ring-1 file:focus:ring-slate-400",
            "file:shadow-sm",
            "cursor-pointer",
            "text-sm text-slate-500",
            "file:border file:border-slate-200",
            "file:hover:border-slate-300",
            "file:hover:shadow-md",
            "file:active:scale-95",
            "file:font-sans",
            "hover:border-slate-300",
            "focus:border-slate-400",
          ],
          className
        )}
        {...props}
      />
    </div>
  );
}

export { Input };
