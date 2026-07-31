import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const ENDPOINTS: Record<string, string> = {
  groq: "https://api.groq.com/openai/v1/audio/transcriptions",
  openai: "https://api.openai.com/v1/audio/transcriptions",
};

const DEFAULT_MODELS: Record<string, string> = {
  groq: "whisper-large-v3-turbo",
  openai: "whisper-1",
};

function json(body: unknown, status = 200, headers: Record<string, string> = {}) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json", ...corsHeaders, ...headers },
  });
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Verify the caller has a valid Supabase session.
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      {
        global: {
          headers: { Authorization: req.headers.get("Authorization") ?? "" },
        },
      }
    );
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return json({ error: "UNAUTHENTICATED" }, 401);

    // Which STT provider + key to use (configurable via secrets).
    const provider = (Deno.env.get("STT_PROVIDER") ?? "groq").toLowerCase();
    const apiKey =
      provider === "openai"
        ? Deno.env.get("OPENAI_API_KEY")
        : Deno.env.get("GROQ_API_KEY");
    if (!apiKey) {
      return json(
        { error: "MISSING_STT_KEY", provider },
        500
      );
    }

    const formData = await req.formData();
    const audio = formData.get("audio");
    if (!(audio instanceof Blob)) {
      return json({ error: "NO_AUDIO" }, 400);
    }
    if (audio.size > 25 * 1024 * 1024) {
      return json({ error: "AUDIO_TOO_LARGE" }, 413);
    }

    const model = Deno.env.get("STT_MODEL") ?? DEFAULT_MODELS[provider];

    // Build the provider request (Somali forced via language=so).
    const providerForm = new FormData();
    providerForm.set("model", model);
    providerForm.set("language", "so");
    providerForm.set("temperature", "0");
    providerForm.set("file", audio, "voice.webm");

    const res = await fetch(ENDPOINTS[provider], {
      method: "POST",
      headers: { Authorization: `Bearer ${apiKey}` },
      body: providerForm,
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("STT provider error", provider, res.status, text.slice(0, 500));
      return json({ error: "STT_SERVICE_ERROR", status: res.status }, 502);
    }

    const data = await res.json();
    const text = typeof data?.text === "string" ? data.text.trim() : "";
    if (!text) return json({ error: "EMPTY_TRANSCRIPT" }, 422);

    return json({ text });
  } catch (e) {
    console.error("transcribe failed", e);
    return json({ error: "INTERNAL_ERROR", detail: String(e) }, 500);
  }
});
