import * as React from "react";
import { cn } from "@/lib/utils"; // shadcn/ui provides this helper

export function Loader({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center justify-center", className)}>
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent"></div>
    </div>
  );
}
