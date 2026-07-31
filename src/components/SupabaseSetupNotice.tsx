import { Settings2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";

export function SupabaseSetupNotice() {
  return (
    <div className="flex min-h-dvh items-center justify-center bg-background px-4">
      <div className="max-w-md rounded-3xl border border-border bg-card p-8 text-center shadow-lg">
        <span className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-accent/15">
          <Settings2 className="h-7 w-7 text-accent-foreground" />
        </span>
        <Badge variant="gold" className="mb-3">
          Xeeyguurinta loo baahan yahay
        </Badge>
        <h1 className="font-display text-xl font-semibold tracking-tight">
          Supabase uma diyaarsan wali
        </h1>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Ku qor labadan qiyam ee tabta{" "}
          <span className="font-semibold text-foreground">Keys / API keys</span>:
        </p>
        <div className="mt-4 space-y-2 rounded-2xl bg-secondary p-4 text-left font-mono text-xs">
          <p>VITE_SUPABASE_URL</p>
          <p>VITE_SUPABASE_PUBLISHABLE_KEY</p>
          <p className="text-muted-foreground">ama VITE_SUPABASE_ANON_KEY</p>
        </div>
        <p className="mt-4 text-xs text-muted-foreground">
          Markaas ka dib soo celi bogga (refresh) — hannaanku wuu bilaaban doonaa.
        </p>
      </div>
    </div>
  );
}
