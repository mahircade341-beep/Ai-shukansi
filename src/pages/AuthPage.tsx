import { useEffect, useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { Heart, Loader2, MailCheck, Sparkles, TriangleAlert } from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { isSupabaseConfigured, supabase } from "@/lib/supabase";
import { cn } from "@/lib/utils";

type Mode = "signIn" | "signUp";

export default function AuthPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const returnTo = searchParams.get("returnTo") ?? "/app";

  const [mode, setMode] = useState<Mode>("signIn");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;
    supabase.auth.getSession().then(({ data }) => {
      if (data.session) navigate(returnTo, { replace: true });
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) navigate(returnTo, { replace: true });
    });
    return () => sub.subscription.unsubscribe();
  }, [navigate, returnTo]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!supabase) return;
    if (!email || !password) {
      toast.error("Fadlan buuxi email-ka iyo furaha.");
      return;
    }
    setSubmitting(true);
    setNotice(null);
    try {
      if (mode === "signIn") {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
        toast.success("Waad soo gashay! 🌹");
        // The onAuthStateChange listener redirects to returnTo.
      } else {
        const { data, error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        if (data.session) {
          toast.success("Akoonkaagu waa la abuuray! 🌹");
        } else {
          setNotice(
            "Fariin xaqiijin ah ayaa loo diray email-kaaga. Fadlan ku dhufo isku-xirka fariinta si aad u xaqiijiso akoonka, ka dibna soo gal."
          );
        }
      }
    } catch (err) {
      console.error(err);
      toast.error(
        mode === "signIn"
          ? "Email ama furaha waa khalad — mar kale isku day."
          : "Akoon waa la aasaasay iyadoo la isticmaalayo email-kaas, ama furaha aad u gaaban (waa inuu yaraadaa 8 xaraf).",
        { icon: <TriangleAlert className="h-4 w-4" /> }
      );
    } finally {
      setSubmitting(false);
    }
  }

  if (!isSupabaseConfigured) return <SupabaseSetupNotice />;

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-background px-4 py-10">
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-32 right-[-8%] h-[420px] w-[420px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute bottom-[-12%] left-[-8%] h-[420px] w-[420px] rounded-full bg-primary/10 blur-3xl" />
        <div className="pattern-dots absolute inset-0 opacity-50" />
      </div>

      <div className="grid w-full max-w-4xl overflow-hidden rounded-[1.75rem] border border-border bg-card shadow-2xl shadow-primary/10 lg:grid-cols-[1fr_1.1fr]">
        {/* Brand panel */}
        <div className="relative hidden flex-col justify-between bg-primary p-10 text-primary-foreground lg:flex">
          <div className="pattern-dots absolute inset-0 opacity-20 [background-image:radial-gradient(hsl(40_80%_70%/0.35)_1.2px,transparent_1.2px)]" />
          <div className="relative">
            <Logo className="[&_span:last-child]:text-primary-foreground" />
          </div>
          <div className="relative">
            <span className="mb-5 inline-flex items-center gap-2 rounded-full border border-primary-foreground/25 bg-primary-foreground/10 px-3 py-1 text-xs font-semibold backdrop-blur">
              <Sparkles className="h-3.5 w-3.5 text-accent" />
              100% Af-Soomaali
            </span>
            <h1 className="text-balance font-display text-3xl font-semibold leading-tight">
              Gargaar shukaansi oo ku jawaaba si dabiici ah — qof kasta wuu u qalma.
            </h1>
            <ul className="mt-6 space-y-3 text-sm text-primary-foreground/85">
              {[
                "Bilow wada hadal qurux badan",
                "Ka jawaab su'aalaha laguugu soo diray",
                "Sifee farriimahaaga si qurux badan",
              ].map((li) => (
                <li key={li} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <Heart className="h-3 w-3" fill="currentColor" />
                  </span>
                  {li}
                </li>
              ))}
            </ul>
          </div>
          <p className="relative text-xs text-primary-foreground/60">
            Wada hadalladaagu waa kuwa qarsoon — adiga oo keliya ayaa arka.
          </p>
        </div>

        {/* Form panel */}
        <div className="p-8 sm:p-10">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>

          <h2 className="font-display text-2xl font-semibold tracking-tight">
            {mode === "signIn" ? "Soo gal akoonkaaga" : "Abuur akoon cusub"}
          </h2>
          <p className="mt-1.5 text-sm text-muted-foreground">
            {mode === "signIn"
              ? "Ku soo noqo wada hadalladaada shukaansiga."
              : "Bilow wada hadalkaaga koowaad — waxaa ku qaadanaya 30 ilbidhiqsi."}
          </p>

          <form onSubmit={handleSubmit} className="mt-8 space-y-5">
            <div className="grid grid-cols-2 gap-1 rounded-full bg-secondary p-1">
              {(["signIn", "signUp"] as const).map((m) => (
                <button
                  key={m}
                  type="button"
                  onClick={() => setMode(m)}
                  className={cn(
                    "rounded-full py-2 text-sm font-semibold transition-all duration-200",
                    mode === m
                      ? "bg-card text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {m === "signIn" ? "Gasho" : "Isdiiwaangeli"}
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium">
                Email-kaaga
              </label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                placeholder="qof@tusaale.so"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium">
                Furaha
              </label>
              <Input
                id="password"
                type="password"
                autoComplete={mode === "signIn" ? "current-password" : "new-password"}
                placeholder={mode === "signUp" ? "Ugu yaraan 8 xaraf" : "Furahaaga"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
              />
              <p className="text-xs text-muted-foreground">
                Furahaagu waa isaga la mid ah ee — waligeed hana ilaawin. 😄
              </p>
            </div>

            {notice && (
              <div className="flex items-start gap-2.5 rounded-2xl border border-primary/25 bg-primary/5 p-4 text-sm leading-relaxed">
                <MailCheck className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <p>{notice}</p>
              </div>
            )}

            <Button type="submit" size="lg" className="w-full" disabled={submitting}>
              {submitting ? (
                <>
                  <Loader2 className="animate-spin" />
                  {mode === "signIn" ? "Waa la gelinayaa…" : "Waa la abuurayaa…"}
                </>
              ) : mode === "signIn" ? (
                "Gasho"
              ) : (
                "Abuur akoon"
              )}
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            <Link to="/" className="font-medium text-primary hover:underline">
              ← Ku noqo bogga hore
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
