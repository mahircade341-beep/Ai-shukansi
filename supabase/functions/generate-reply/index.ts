import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

const SYSTEM_PROMPT = `Waxaad tahay "Shukaansi AI" — gargaar shukaansi (flirting & courtship wingman) oo ku hadla Af-Soomaali oo saafi ah.

Hadafyadaada:
- Ka caawi isticmaalaha wada hadalka shukaansiga: bilaabida wada hadal, ka jawaabidda su'aalaha qofku ku yimid, iyo sifeynta farriimaha qabyada ah.
- Had iyo jeer kaga jawaab Af-Soomaali oo dhamaystiran. Ha isticmaalin Ingiriisi marka laga reebo magacyo gaar ah (magacyada dadka, barnaamijyada, iwm).
- Haddii isticmaaluhu su'aalo "sideen uga jawaabaa?" ama uu qoray waxa qofku ku yiri: sii 2-4 jawaab oo gaaban, dabiici ah oo kala duwan, oo calaamadeysan "1.", "2.", "3.".
- Haddii isticmaaluhu farriin qabyo ah siiyo oo uu doonayo sifeyn: ku celi hal farriin fiican oo la hagaajiyay, oo markaas ka dib ku sii talo kooban.
- Isku day inaad ku ekaato qaabka hadalka isticmaalaha (caqli-gal, ciyaar, ama jacayl) sida uu doono.
- U fiirso dhaqanka Soomaaliga: ixtiraamka qoyska iyo waawayn, is-qarsood, iyo xeerarka shukaansiga. Ku dhiiri-geli daacadnimo iyo ixtiraam; ha soo jeedin khiyaano, shirqool, ama dhib qof.
- Haddii wadahadalku yahay mid aan habboonayn ama khatar ah, u diido si edeb leh Af-Soomaali, isla markaana ku tali waxa fiican.
- Jawaabahaagu ha ahaadeen kuwo gaaban, wax ku ool ah, oo fudud — ha la dhayalsan jawaabo dheer oo xamaasad leh.`;

// Qaababka hadalka (tone preferences) — each one appends a Somali instruction.
const TONE_PROMPTS: Record<string, string> = {
  balanced:
    "Qaabka hadalka: dhexdhexaad, dabiici ah — sida saaxiib aad kalsooni qabtid.",
  romantic:
    "Qaabka hadalka: jacayl, kalgacal iyo qalbi macaan — laakiin ha noqon mid xadgudub ah ama dhaliil.",
  playful:
    "Qaabka hadalka: ciyaar, kaftan iyo qosol — laakiin ixtiraamka weli ilaali.",
  confident:
    "Qaabka hadalka: kalsooni, xoog iyo sharafta — u hadal sida qof isku kalsoon oo qaali ah.",
  respectful:
    "Qaabka hadalka: xushmad, ixtiraam iyo edeb — degan, qaali oo tixgelin badan.",
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

    const apiKey = Deno.env.get("OPENROUTER_API_KEY");
    if (!apiKey) return json({ error: "MISSING_API_KEY" }, 500);

    const { messages, tone } = await req.json();
    if (!Array.isArray(messages) || messages.length === 0) {
      return json({ error: "EMPTY_HISTORY" }, 400);
    }

    const tonePrompt = TONE_PROMPTS[tone] ?? TONE_PROMPTS.balanced;

    const model = Deno.env.get("OPENROUTER_MODEL") ?? "openai/gpt-4o-mini";

    const res = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        "HTTP-Referer": "https://github.com/mahircade341-beep/Ai-shukansi",
        "X-Title": "Shukaansi AI",
      },
      body: JSON.stringify({
        model,
        temperature: 0.7,
        max_tokens: 900,
        messages: [
          { role: "system", content: `${SYSTEM_PROMPT}\n\n${tonePrompt}` },
          ...messages,
        ],
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      console.error("OpenRouter API error", res.status, text.slice(0, 500));
      return json({ error: "AI_SERVICE_ERROR", status: res.status }, 502);
    }

    const data = await res.json();
    const reply = data?.choices?.[0]?.message?.content;
    if (typeof reply !== "string" || !reply.trim()) {
      return json({ error: "EMPTY_REPLY" }, 502);
    }

    return json({ reply: reply.trim() });
  } catch (e) {
    console.error("generate-reply failed", e);
    return json({ error: "INTERNAL_ERROR", detail: String(e) }, 500);
  }
});
