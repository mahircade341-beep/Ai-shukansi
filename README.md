# Ai-Shukansi (Shukaansi AI)

> **Gargaar shukaansi oo AI ah — af-Soomaali oo dhan.**
> An AI wingman that helps you succeed at flirting and dating conversations — strictly in Somali (Af-Soomaali).

## Maxay tahay? / What is it?

Shukaansi AI waxa ay ku caawinaysaa:

- **Bilow wada hadal** — hesho hadal bilow ah oo qurux badan (conversation starters)
- **Ka jawaab su'aal** — jawaabo degdeg ah oo laguugu soo diray (replies to what your date asked)
- **Sifee farriin** — farriintaada si fiican u qor (polish/improve a draft message)
- **Cod-ku-qorista Af-Soomaali** — ku hadal, Shukaansi AI waa ku qoraa (mic button → cloud Whisper STT, `language=so`)
- **Qaabka hadalka (tone)** — dooro sida AI-ga uu kugula hadlo: Caadi, Jacayl, Ciyaar, Kalsooni, ama Xushmad

Wax kasta oo AI-ga kaaga jawaabo waa **Af-Soomaali oo saafi ah**.

## Stack

- **Frontend:** React 19 + Vite + TypeScript + Tailwind CSS + shadcn/ui-style components + Framer Motion
- **Backend/DB/Auth:** Supabase (Postgres + Auth + Realtime)
- **AI:** OpenRouter — unified chat completions (default `openai/gpt-4o-mini`), called from a Supabase Edge Function (`generate-reply`) so the API key never reaches the browser
- **Speech-to-text:** Whisper via **Groq** (default, `whisper-large-v3-turbo`) or **OpenAI** (`whisper-1`) — called from the `transcribe` edge function; the browser only records audio (MediaRecorder)

## Setup

1. `bun install`
2. Create the database tables: run the files in `supabase/migrations/` (`0001_init.sql` + `0002_profiles_tone.sql`) in the Supabase **SQL Editor** (or `bunx supabase db push`).
3. Deploy the AI edge function: `bunx supabase login --token <access-token>`, then `bunx supabase functions deploy generate-reply --project-ref ynembuipmvydgsoqgwbg`.
4. Set the `OPENROUTER_API_KEY` secret in Supabase → **Edge Functions → Secrets** (model optional via `OPENROUTER_MODEL`).
5. Set the speech-to-text secret in Supabase → **Edge Functions → Secrets**: `GROQ_API_KEY` (default provider; free tier) or `OPENAI_API_KEY` (set `STT_PROVIDER=openai` to switch, `STT_MODEL` optional).
6. Add env vars (Freebuff **Keys/API keys** tab or local `.env.local`):
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`
7. `bun dev`

> Email confirmation is **disabled** (`mailer_autoconfirm = true`) — new email sign-ups get in instantly.

## Env vars

| Key | Required | Where it's used |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | ✅ | Supabase project URL (e.g. `https://ynembuipmvydgsoqgwbg.supabase.co`) |
| `VITE_SUPABASE_PUBLISHABLE_KEY` | ✅ | Supabase publishable (browser-safe) key (or `VITE_SUPABASE_ANON_KEY` — both accepted) |
| `OPENROUTER_API_KEY` | ✅ | Edge Function secret (Supabase → Edge Functions → Secrets) — powers the AI replies |
| `OPENROUTER_MODEL` | optional | Model id sent to OpenRouter (defaults to `openai/gpt-4o-mini`) |
| `GROQ_API_KEY` | ✅ (default) | Edge Function secret — powers voice transcription (Groq Whisper) |
| `OPENAI_API_KEY` | alt | Edge Function secret — used instead if `STT_PROVIDER=openai` |
| `STT_PROVIDER` | optional | `groq` (default) or `openai` — which Whisper API transcribes voice |
| `STT_MODEL` | optional | Model id, e.g. `whisper-large-v3-turbo` (groq) or `whisper-1` (openai) |

## Production deploy (Freebuff)

- The Vite build (`bun build`) outputs to `dist/` and the hosting builder runs `bun install` + `vite build` automatically — nothing extra to configure.
- Before the first deploy, add these **production env vars** (Freebuff → Deploy/Keys):
  - `VITE_SUPABASE_URL` = `https://ynembuipmvydgsoqgwbg.supabase.co`
  - `VITE_SUPABASE_PUBLISHABLE_KEY` = your `sb_publishable_…` key
- The OpenRouter key never lives in the frontend — it stays in Supabase **Edge Function secrets**.

## Scripts

| Command | What it does |
| --- | --- |
| `bun dev` | Starts the Vite dev server (binds 0.0.0.0, respects `PORT`) |
| `bun build` | Builds the production bundle into `dist/` |
| `bun typecheck` | Runs `tsc -b --noEmit` |
| `bun db:migrate` | Pushes `supabase/migrations` to the linked project |
| `bun functions:deploy` | Deploys the `generate-reply` + `transcribe` edge functions |

## Repository layout

```
supabase/
  migrations/0001_init.sql     # chats + messages tables, RLS, realtime
  migrations/0002_profiles_tone.sql  # profiles table (tone preference) + signup trigger
  functions/generate-reply/    # Deno edge function calling OpenRouter (Somali system prompt, tone-aware)
  functions/transcribe/        # Deno edge function: Somali Whisper STT via Groq/OpenAI (key server-side)
src/
  lib/supabase.ts              # Supabase client
  lib/speech.ts                # Somali voice input (MediaRecorder → transcribe edge function)
  pages/                       # Landing, Auth, App (chat dashboard)
```
