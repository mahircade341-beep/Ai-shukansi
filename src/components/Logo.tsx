import { Heart } from "lucide-react";

import { cn } from "@/lib/utils";

export function Logo({ className }: { className?: string }) {
  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <span className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-primary shadow-md shadow-primary/25">
        <Heart className="h-5 w-5 text-accent" fill="currentColor" />
      </span>
      <span className="font-display text-lg font-semibold tracking-tight">
        Shukaansi<span className="text-primary"> AI</span>
      </span>
    </div>
  );
}
