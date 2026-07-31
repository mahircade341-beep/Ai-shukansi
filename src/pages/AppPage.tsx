import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type FormEvent,
} from "react";
import { useNavigate } from "react-router-dom";
import type { User } from "@supabase/supabase-js";
import type { LucideIcon } from "lucide-react";
import {
  Flame,
  Heart,
  Laugh,
  Loader2,
  LogOut,
  Menu,
  MessageSquareText,
  Mic,
  PenLine,
  Plus,
  Send,
  ShieldCheck,
  Sparkles,
  Star,
  Trash2,
  X,
} from "lucide-react";
import { toast } from "sonner";

import { Logo } from "@/components/Logo";
import { SupabaseSetupNotice } from "@/components/SupabaseSetupNotice";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  isSupabaseConfigured,
  supabase,
  supabaseFunctionsUrl,
} from "@/lib/supabase";
import { isMediaRecordingSupported, startVoiceRecording, type RecorderController } from "@/lib/speech";
import { cn } from "@/lib/utils";

const quickPrompts = [
  {
    icon: MessageSquareText,
    label: "Bilow hadal",
    text: "Caawi aan bilaabo wada hadal shukaansi oo qurux badan. Qofka waan jaqaa laakiin aan horey u wada hadlin.",
  },
  {
    icon: Send,
    label: "Ka jawaab su'aal",
    text: "Qofku wuxuu ii yiri: '...'. Sidee baan uga jawaabaa si fiican oo dabiici ah?",
  },
  {
    icon: PenLine,
    label: "Sifee farriin",
    text: "Farriintayda qabyada ah: '...'. Fadlan ii sifee oo ka dhig mid fiican, adigoo ku hadlaya af-Soomaali.",
  },
];

type ToneKey = "balanced" | "romantic" | "playful" | "confident" | "respectful";

const tones: { key: ToneKey; label: string; icon: LucideIcon }[] = [
  { key: "balanced", label: "Caadi", icon: ShieldCheck },
  { key: "romantic", label: "Jacayl", icon: Heart },
  { key: "playful", label: "Ciyaar", icon: Laugh },
  { key: "confident", label: "Kalsooni", icon: Flame },
  { key: "respectful", label: "Xushmad", icon: Star },
];

interface Chat {
  id: string;
  user_id: string;
  title: string;
  created_at: string;
}

interface Message {
  id: string;
  chat_id: string;
  role: "user" | "assistant";
  content: string;
  created_at: string;
}

function TypingDots() {
  return (
    <div className="flex items-center gap-1.5 py-2 px-1">
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-2 w-2 animate-pulse-soft rounded-full bg-primary/50"
          style={{ animationDelay: `${i * 0.15}s` }}
        />
      ))}
    </div>
  );
}

export default function AppPage() {
  const navigate = useNavigate();
  const [user, setUser] = useState<User | null>(null);
  const [chats, setChats] = useState<Chat[] | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[] | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [tone, setTone] = useState<ToneKey>("balanced");
  const [recording, setRecording] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recorderRef = useRef<RecorderController | null>(null);

  // --- Session -----------------------------------------------------------
  useEffect(() => {
    if (!supabase) return;
    let mounted = true;
    supabase.auth.getSession().then(({ data }) => {
      if (!mounted) return;
      if (!data.session) navigate("/auth?returnTo=/app", { replace: true });
      else setUser(data.session.user);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!mounted) return;
      if (!session) navigate("/auth?returnTo=/app", { replace: true });
      else setUser(session.user);
    });
    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [navigate]);

  // Stop the microphone when leaving the page.
  useEffect(() => {
    return () => {
      void recorderRef.current?.stop();
    };
  }, []);

  // --- Tone preference ---------------------------------------------------
  useEffect(() => {
    if (!supabase || !user) return;
    supabase
      .from("profiles")
      .select("tone")
      .eq("id", user.id)
      .maybeSingle()
      .then(({ data }) => {
        if (data?.tone) setTone(data.tone as ToneKey);
      });
  }, [user]);

  async function handleToneChange(next: ToneKey) {
    if (!supabase || !user) return;
    const prev = tone;
    setTone(next);
    const { error } = await supabase
      .from("profiles")
      .upsert({ id: user.id, tone: next });
    if (error) {
      console.error(error);
      setTone(prev);
      toast.error("Khalad ayaa dhacay — mar kale isku day.");
    }
  }

  // --- Chats -------------------------------------------------------------
  const loadChats = useCallback(async () => {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("chats")
      .select("id, user_id, title, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });
    if (!error) setChats(data ?? []);
  }, [user]);

  useEffect(() => {
    loadChats();
  }, [loadChats]);

  useEffect(() => {
    if (chats && chats.length > 0 && !selectedId) setSelectedId(chats[0].id);
  }, [chats, selectedId]);

  // --- Messages + realtime ----------------------------------------------
  useEffect(() => {
    if (!supabase || !selectedId) {
      setMessages(null);
      return;
    }
    let mounted = true;
    const load = () =>
      supabase!
        .from("messages")
        .select("*")
        .eq("chat_id", selectedId)
        .order("created_at", { ascending: true })
        .then(({ data, error }) => {
          if (!error && mounted) setMessages(data as Message[] | null);
        });
    load();
    const channel = supabase
      .channel(`chat-${selectedId}`)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "messages",
          filter: `chat_id=eq.${selectedId}`,
        },
        () => load()
      )
      .subscribe();
    return () => {
      mounted = false;
      supabase!.removeChannel(channel);
    };
  }, [selectedId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length, busy]);

  // --- Actions -----------------------------------------------------------
  async function handleNewChat() {
    if (!supabase || !user) return;
    const { data, error } = await supabase
      .from("chats")
      .insert({ user_id: user.id, title: "Wada hadal cusub" })
      .select("id, user_id, title, created_at")
      .single();
    if (error || !data) {
      console.error(error);
      toast.error("Khalad ayaa dhacay — mar kale isku day.");
      return;
    }
    setChats((prev) => [data, ...(prev ?? [])]);
    setSelectedId(data.id);
    setSidebarOpen(false);
  }

  async function handleDeleteChat(chatId: string) {
    if (!supabase) return;
    if (!confirm("Ma hubtaa inaad tirtirto wada hadalkan? Lama soo celin karo."))
      return;
    const { error } = await supabase.from("chats").delete().eq("id", chatId);
    if (error) {
      console.error(error);
      toast.error("Khalad ayaa dhacay — mar kale isku day.");
      return;
    }
    setChats((prev) => prev?.filter((c) => c.id !== chatId) ?? []);
    if (selectedId === chatId) setSelectedId(null);
  }

  async function fetchAiReply(): Promise<string> {
    if (!supabase) throw new Error("NO_SUPABASE");
    const {
      data: { session },
    } = await supabase.auth.getSession();
    const res = await fetch(`${supabaseFunctionsUrl}/functions/v1/generate-reply`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${session?.access_token ?? ""}`,
      },
      body: JSON.stringify({
        messages: (messages ?? [])
          .slice(-20)
          .map((m) => ({ role: m.role, content: m.content })),
        tone,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error((data as { error?: string }).error ?? "AI_ERROR");
    return (data as { reply: string }).reply;
  }

  async function handleSend(e: FormEvent) {
    e.preventDefault();
    const content = input.trim();
    if (!supabase || !selectedId || busy || transcribing) return;
    if (!content) return;
    setInput("");

    const { data: userMsg, error: insErr } = await supabase
      .from("messages")
      .insert({ chat_id: selectedId, role: "user", content })
      .select()
      .single();
    if (insErr || !userMsg) {
      console.error(insErr);
      toast.error("Khalad ayaa dhacay — mar kale isku day.");
      return;
    }

    // Give the conversation a real title from the first user message.
    const chat = chats?.find((c) => c.id === selectedId);
    if (chat?.title === "Wada hadal cusub") {
      const raw = content.trim();
      const title = raw.length > 40 ? `${raw.slice(0, 40)}…` : raw;
      await supabase.from("chats").update({ title }).eq("id", selectedId);
      setChats((prev) =>
        prev?.map((c) => (c.id === selectedId ? { ...c, title } : c)) ?? []
      );
    }

    setBusy(true);
    try {
      const reply = await fetchAiReply();
      await supabase
        .from("messages")
        .insert({ chat_id: selectedId, role: "assistant", content: reply });
    } catch (err) {
      console.error(err);
      const code = err instanceof Error ? err.message : "AI_ERROR";
      if (code === "MISSING_API_KEY") {
        toast.error(
          "Furaha AI (OPENROUTER_API_KEY) lama helin — ku qor 'Edge Functions → Secrets' ee Supabase."
        );
      } else if (code === "AI_SERVICE_ERROR" || code === "INTERNAL_ERROR") {
        toast.error("AI-ga ayaa dib u dhacay — mar kale isku day, fadlan.");
      } else if (code === "UNAUTHENTICATED") {
        toast.error("Session-kaagu wuu dhammaaday — dib u soo gal.");
      } else {
        toast.error("Waxba kuma qorna — mar kale isku day.");
      }
    } finally {
      setBusy(false);
      textareaRef.current?.focus();
    }
  }

  function usePrompt(prompt: string) {
    setInput(prompt);
    textareaRef.current?.focus();
  }

  // --- Voice input (Somali, cloud STT) ----------------------------------
  async function transcribeAudio(blob: Blob) {
    setTranscribing(true);
    try {
      const {
        data: { session },
      } = await supabase!.auth.getSession();
      const fd = new FormData();
      fd.append("audio", blob, "voice.webm");
      const res = await fetch(
        `${supabaseFunctionsUrl}/functions/v1/transcribe`,
        {
          method: "POST",
          headers: { Authorization: `Bearer ${session?.access_token ?? ""}` },
          body: fd,
        }
      );
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error((data as { error?: string }).error ?? "STT_ERROR");
      }
      const text = (data as { text?: string }).text?.trim();
      if (!text) {
        toast.error("Hadal lama maqal — mar kale isku day.");
        return;
      }
      setInput((prev) => (prev ? `${prev} ${text}` : text));
      textareaRef.current?.focus();
    } catch (err) {
      console.error(err);
      const code = err instanceof Error ? err.message : "STT_ERROR";
      if (code === "MISSING_STT_KEY") {
        toast.error(
          "Furaha cod-ku-qorista lama helin — ku qor 'Edge Functions → Secrets' ee Supabase."
        );
      } else if (code === "UNAUTHENTICATED") {
        toast.error("Session-kaagu wuu dhammaaday — dib u soo gal.");
      } else if (code === "AUDIO_TOO_LARGE") {
        toast.error("Codku aad buu u dheer yahay — isku day inaad gaabis qorto.");
      } else {
        toast.error("Cod-ku-qoristu waa fashilantay — mar kale isku day.");
      }
    } finally {
      setTranscribing(false);
    }
  }

  async function stopAndTranscribe() {
    setRecording(false);
    const blob = await recorderRef.current?.stop();
    recorderRef.current = null;
    if (blob) await transcribeAudio(blob);
  }

  async function toggleVoice() {
    if (!supabase || !selectedId || busy || transcribing) return;
    if (recording) {
      await stopAndTranscribe();
      return;
    }
    if (!isMediaRecordingSupported()) {
      toast.error(
        "Browser-kaagu ma taageero duubista codka — isticmaal Chrome ama Edge."
      );
      return;
    }
    try {
      const controller = await startVoiceRecording();
      recorderRef.current = controller;
      setRecording(true);
    } catch (err) {
      console.error(err);
      toast.error(
        "Microfoonka lama oggolaan — fadlan oggolow oo mar kale isku day."
      );
    }
  }

  if (!isSupabaseConfigured) return <SupabaseSetupNotice />;

  const selectedChat = chats?.find((c) => c.id === selectedId) ?? null;
  const emailName = user?.email?.split("@")[0] ?? "isticmaale";

  return (
    <div className="flex h-dvh overflow-hidden bg-background text-foreground">
      {/* Backdrop for mobile drawer */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-40 flex w-72 flex-col border-r border-border bg-card transition-transform duration-300 lg:static lg:translate-x-0",
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex items-center justify-between border-b border-border px-4 py-4">
          <Logo />
          <Button
            variant="ghost"
            size="iconSm"
            className="lg:hidden"
            onClick={() => setSidebarOpen(false)}
            aria-label="Xidh"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>

        <div className="px-4 py-3">
          <Button className="w-full" onClick={handleNewChat}>
            <Plus /> Wada hadal cusub
          </Button>
        </div>

        {/* Tone preference */}
        <div className="border-b border-border px-4 pb-3 pt-1">
          <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            Qaabka hadalka
          </p>
          <div className="grid grid-cols-2 gap-1.5">
            {tones.map((t) => (
              <button
                key={t.key}
                type="button"
                onClick={() => handleToneChange(t.key)}
                title={t.label}
                className={cn(
                  "flex items-center gap-1.5 rounded-lg border px-2.5 py-1.5 text-xs font-semibold transition-all",
                  tone === t.key
                    ? "border-primary/50 bg-primary/10 text-foreground"
                    : "border-border bg-background text-muted-foreground hover:border-primary/30 hover:text-foreground"
                )}
              >
                <t.icon
                  className={cn(
                    "h-3.5 w-3.5",
                    tone === t.key ? "text-primary" : "text-muted-foreground"
                  )}
                />
                {t.label}
              </button>
            ))}
          </div>
        </div>

        <p className="px-5 pb-1 pt-3 text-xs font-bold uppercase tracking-wider text-muted-foreground">
          Wada hadalladaada
        </p>

        <div className="scrollbar-thin flex-1 overflow-y-auto px-3 pb-3">
          {chats === null && (
            <div className="space-y-2 p-1">
              {[0, 1, 2].map((i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          )}
          {chats?.length === 0 && (
            <div className="rounded-2xl border border-dashed border-border p-4 text-center text-sm text-muted-foreground">
              Weli ma jiro wada hadal.{" "}
              <button onClick={handleNewChat} className="font-semibold text-primary hover:underline">
                Mid cusub samee
              </button>
              .
            </div>
          )}
          {chats?.map((chat) => (
            <div
              key={chat.id}
              className={cn(
                "group mb-1 flex cursor-pointer items-center gap-2 rounded-xl px-3 py-2.5 transition-colors",
                selectedId === chat.id
                  ? "bg-primary/10 text-foreground"
                  : "hover:bg-secondary/70"
              )}
              onClick={() => {
                setSelectedId(chat.id);
                setSidebarOpen(false);
              }}
            >
              <MessageSquareText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="min-w-0 flex-1 truncate text-sm font-medium">{chat.title}</span>
              <button
                className="opacity-0 transition-opacity hover:text-destructive group-hover:opacity-100"
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(chat.id);
                }}
                aria-label="Tirtir"
              >
                <Trash2 className="h-4 w-4" />
              </button>
            </div>
          ))}
        </div>

        <div className="border-t border-border p-4">
          <div className="flex items-center gap-3">
            <span className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-accent/20 text-sm font-bold text-accent-foreground">
              {emailName.slice(0, 1).toUpperCase()}
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-semibold">{emailName}</p>
              <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
            </div>
            <Button
              variant="ghost"
              size="iconSm"
              onClick={() => supabase?.auth.signOut()}
              aria-label="Ka bax"
              title="Ka bax"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </aside>

      {/* Main chat area */}
      <main className="flex min-w-0 flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex items-center gap-3 border-b border-border bg-card/70 px-4 py-3 backdrop-blur lg:hidden">
          <Button variant="ghost" size="iconSm" onClick={() => setSidebarOpen(true)} aria-label="Menu">
            <Menu className="h-5 w-5" />
          </Button>
          <div className="flex min-w-0 items-center gap-2">
            <span className="grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-primary">
              <Heart className="h-4 w-4 text-accent" fill="currentColor" />
            </span>
            <p className="truncate text-sm font-semibold">
              {selectedChat ? selectedChat.title : "Shukaansi AI"}
            </p>
          </div>
        </header>

        {/* Messages */}
        <div className="scrollbar-thin flex-1 overflow-y-auto">
          {!selectedId ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 px-6 text-center">
              <span className="grid h-16 w-16 place-items-center rounded-3xl bg-primary/10">
                <Heart className="h-8 w-8 text-primary" fill="currentColor" />
              </span>
              <div className="max-w-sm">
                <h2 className="font-display text-2xl font-semibold tracking-tight">
                  Diyaar ma u tahay?
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Abuur wada hadal cusub, qor waxa qofku kugu yiri, oo Shukaansi AI wuxuu
                  ku siinayaa jawaabo fiican — af-Soomaali oo dhan.
                </p>
              </div>
              <Button onClick={handleNewChat}>
                <Plus /> Wada hadal cusub
              </Button>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl px-4 py-6 sm:px-6">
              {messages === null && (
                <div className="space-y-4 pt-2">
                  <Skeleton className="h-14 w-2/3" />
                  <Skeleton className="ml-auto h-14 w-2/3" />
                  <Skeleton className="h-20 w-3/4" />
                </div>
              )}
              {messages?.length === 0 && (
                <div className="mt-6 rounded-3xl border border-dashed border-border bg-card/50 p-6 text-center">
                  <Badge variant="gold" className="mb-3">
                    <Sparkles className="h-3.5 w-3.5" /> Gargaar degdeg ah
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    Qor hadalka qofku kugu yiri, ama dooro tilmaam hoose:
                  </p>
                  <div className="mt-4 flex flex-wrap justify-center gap-2">
                    {quickPrompts.map((p) => (
                      <button
                        key={p.label}
                        onClick={() => usePrompt(p.text)}
                        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3.5 py-2 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                      >
                        <p.icon className="h-3.5 w-3.5 text-primary" />
                        {p.label}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              <div className="mt-4 space-y-4">
                {messages?.map((m) => (
                  <div
                    key={m.id}
                    className={cn(
                      "flex items-end gap-2.5",
                      m.role === "user" ? "justify-end" : "justify-start"
                    )}
                  >
                    {m.role === "assistant" && (
                      <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary shadow-sm">
                        <Heart className="h-4 w-4 text-accent" fill="currentColor" />
                      </span>
                    )}
                    <div
                      className={cn(
                        "max-w-[85%] whitespace-pre-wrap rounded-2xl px-4 py-3 text-sm leading-relaxed shadow-sm sm:max-w-[75%]",
                        m.role === "user"
                          ? "rounded-br-md bg-primary text-primary-foreground"
                          : "rounded-bl-md border border-border bg-card"
                      )}
                    >
                      {m.content}
                    </div>
                  </div>
                ))}
                {busy && (
                  <div className="flex items-end gap-2.5">
                    <span className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-primary shadow-sm">
                      <Heart className="h-4 w-4 text-accent" fill="currentColor" />
                    </span>
                    <div className="rounded-2xl rounded-bl-md border border-border bg-card px-4 py-2 shadow-sm">
                      <TypingDots />
                    </div>
                  </div>
                )}
              </div>
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Composer */}
        <div className="border-t border-border bg-card/70 backdrop-blur">
          <div className="mx-auto max-w-3xl px-4 py-3 sm:px-6">
            <div className="mb-2 hidden gap-2 sm:flex">
              {quickPrompts.map((p) => (
                <button
                  key={p.label}
                  onClick={() => usePrompt(p.text)}
                  className="inline-flex items-center gap-1.5 rounded-full border border-border bg-background px-3 py-1.5 text-xs font-semibold text-muted-foreground transition-all hover:border-primary/40 hover:text-foreground"
                >
                  <p.icon className="h-3.5 w-3.5 text-primary" />
                  {p.label}
                </button>
              ))}
            </div>
            <form
              onSubmit={handleSend}
              className="flex items-end gap-2 rounded-2xl border border-input bg-background p-2 shadow-sm transition-colors focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-ring/40"
            >
              <Button
                type="button"
                size="icon"
                variant={recording ? "default" : "ghost"}
                onClick={toggleVoice}
                disabled={!selectedId || busy || transcribing}
                aria-label={
                  recording
                    ? "Joogi duubista"
                    : transcribing
                      ? "Waa la qoranayaa…"
                      : "Cod ku qor (Af-Soomaali)"
                }
                title={
                  recording
                    ? "Joogi duubista"
                    : transcribing
                      ? "Waa la qoranayaa…"
                      : "Cod ku qor (Af-Soomaali)"
                }
                className={cn(
                  "shrink-0",
                  recording &&
                    "animate-pulse-soft bg-primary text-primary-foreground hover:bg-primary"
                )}
              >
                {transcribing ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Mic className="h-4 w-4" />
                )}
              </Button>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    handleSend(e);
                  }
                }}
                rows={1}
                placeholder={
                  selectedId
                    ? "Qor hadalka ama su'aasha…"
                    : "Abuur wada hadal si aad u qorto"
                }
                disabled={!selectedId || busy}
                className="max-h-40 min-h-[44px] flex-1 resize-none bg-transparent px-2 py-2.5 text-sm outline-none placeholder:text-muted-foreground disabled:opacity-50"
              />
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || !selectedId || busy || transcribing}
                aria-label="Dir"
                className="shrink-0"
              >
                {busy ? <Loader2 className="animate-spin" /> : <Send />}
              </Button>
            </form>
            <p className="mt-2 text-center text-[11px] text-muted-foreground">
              {recording ? (
                <span className="font-semibold text-primary">
                  🎙️ Waa la duubayaa — ku hadal Af-Soomaali, markaas dhufo joogsi…
                </span>
              ) : transcribing ? (
                <span className="font-semibold text-primary">
                  ⏳ Hadalkaagu waa la qoranayaa…
                </span>
              ) : (
                "Shukaansi AI waxa uu kaga jawaabaa Af-Soomaali — waa ballan. 🌹"
              )}
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
