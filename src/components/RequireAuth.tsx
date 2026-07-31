import { useEffect, useState, type ReactNode } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { Heart } from "lucide-react";

import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";

function FullScreenLoader() {
  return (
    <div className="flex h-dvh w-full flex-col items-center justify-center gap-4 bg-background">
      <div className="relative grid h-16 w-16 place-items-center">
        <span className="absolute inset-0 animate-ping rounded-full bg-primary/20" />
        <span className="relative grid h-14 w-14 place-items-center rounded-2xl bg-primary shadow-lg shadow-primary/30">
          <Heart className="h-7 w-7 text-accent" fill="currentColor" />
        </span>
      </div>
      <p className="animate-pulse-soft text-sm font-medium text-muted-foreground">
        Waxaa la xaqiijinayaa akoonkaaga…
      </p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
  const location = useLocation();
  const [state, setState] = useState<"loading" | "authed" | "unauthed">(
    "loading"
  );

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) {
      setState("unauthed");
      return;
    }
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (mounted) setState(data.session ? "authed" : "unauthed");
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (mounted) setState(session ? "authed" : "unauthed");
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, []);

  if (!isSupabaseConfigured) return <SupabaseSetupNotice />;
  if (state === "loading") return <FullScreenLoader />;
  if (state === "unauthed") {
    const returnTo = encodeURIComponent(location.pathname + location.search);
    return <Navigate to={`/auth?returnTo=${returnTo}`} replace />;
  }
  return <>{children}</>;
}
