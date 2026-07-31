import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  ArrowRight,
  ChevronRight,
  Clock,
  Heart,
  HeartHandshake,
  Languages,
  Lock,
  Menu,
  MessageSquareText,
  PenLine,
  Send,
  Sparkles,
  X,
} from "lucide-react";

import { Logo } from "@/components/Logo";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  show: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.08, duration: 0.6, ease: [0.22, 1, 0.36, 1] as const },
  }),
};

const APP_CTA = "/auth?returnTo=/app";

const steps = [
  {
    n: "1",
    title: "Qor waxa dhacay",
    body: "Qor hadalka qofku kugu yiri, su'aasha lagu weydiiyey, ama farriinta aad diyaarisay.",
  },
  {
    n: "2",
    title: "Xulo talada",
    body: "Shukaansi AI wuxuu ku siinayaa jawaabo kala duwan — xulo tan kugu habboon oo ku ekeyso qaabkaaga.",
  },
  {
    n: "3",
    title: "Ku guulayso",
    body: "U dir jawaabtaada si kalsooni leh, oo samee saameyn wanaagsan — af-Soomaali oo saafi ah.",
  },
];

const features = [
  {
    icon: MessageSquareText,
    title: "Bilow wada hadal",
    body: "Hadal bilow ah oo dabiici ah oo u qalma xaaladdaada — haddaba mas dhaqaajin 'Haye, sidee tahay?'.",
  },
  {
    icon: Send,
    title: "Ka jawaab su'aal",
    body: "Jawaabo degdeg ah oo laguugu soo diray, oo si fiican loo xisaabiyey — adiga oo aan wax ku qasan.",
  },
  {
    icon: PenLine,
    title: "Sifee farriintaada",
    body: "U beddel farriintaada qabyada ah mid qurux badan, oo cod dhab ah leh.",
  },
  {
    icon: HeartHandshake,
    title: "Talo dhaqameed",
    body: "Talocyin ku habboon dhaqanka iyo caadooyinka Soomaaliga — ixtiraam iyo qalbiga adag.",
  },
  {
    icon: Sparkles,
    title: "Qaabkaaga hadalka",
    body: "Qaab caqli-gal, ciyaar, ama jacayl — adiga ayaa dooranaya, AI-ga ayaa ku daba qoraya.",
  },
  {
    icon: Lock,
    title: "Sir iyo ammaan",
    body: "Wada hadalladaagu waxay ku qarsoon yihiin akoonkaaga — qof kale ma arko.",
  },
];

const testimonials = [
  {
    quote:
      "Waxaan isku filanayn inaan bilaabo wada hadal. Hadda waan ogaa waxa aan dhaho, oo way ka hadlaysee!",
    name: "Xasan",
    city: "Muqdisho",
  },
  {
    quote:
      "Su'aal culus baa ii timid, AI-ga ayaa i siiyay jawaab qosol badan oo fiican. Way ka helaysaa!",
    name: "Ayaan",
    city: "Hargeysa",
  },
  {
    quote:
      "Waxaa iga badbaadiyay inaan soo diro farriin aan laga soo laaban karin 😅 Hadda way iga jawaabaysaa.",
    name: "Cabdi",
    city: "Boosaaso",
  },
];

const faqs = [
  {
    q: "Shukaansi AI ma bilaash baa?",
    a: "Haa, waa bilaash xilligan. Kaliya waa inaad abuurto akoon yar, markaas waa bilowday.",
  },
  {
    q: "Ma wuxuu kaga jawaabaa Af-Ingiriisi?",
    a: "Maya! Shukaansi AI wuxuu had iyo jeer kaga jawaabaa Af-Soomaali oo saafi ah — waa ballan.",
  },
  {
    q: "Wada hadalladayda ma qof kale baa arki kara?",
    a: "Maya. Wada hadalladaagu waxay ku xiran yihiin akoonkaaga kaliya, waxayna ku keydsan yihiin si ammaan ah.",
  },
  {
    q: "Sideen u bilaabaa?",
    a: "Abuur akoon, riix 'Wada hadal cusub', oo qor waxa qofku kugu yiri. Waxa kale oo aad isticmaali kartaa tilmaamo diyaar ah.",
  },
];

export default function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="relative min-h-dvh overflow-x-hidden bg-background">
      {/* Decorative background */}
      <div className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute -top-40 right-[-10%] h-[520px] w-[520px] rounded-full bg-accent/15 blur-3xl" />
        <div className="absolute top-[30%] left-[-12%] h-[460px] w-[460px] rounded-full bg-primary/10 blur-3xl" />
        <div className="absolute bottom-[-10%] right-[15%] h-[420px] w-[420px] rounded-full bg-[#e8a2a8]/20 blur-3xl" />
        <div className="pattern-dots absolute inset-0 opacity-60" />
      </div>

      {/* Navbar */}
      <header className="sticky top-0 z-40 border-b border-border/60 bg-background/80 backdrop-blur-xl">
        <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5 lg:px-8">
          <Link to="/" aria-label="Shukaansi AI — guri">
            <Logo />
          </Link>

          <div className="hidden items-center gap-8 text-sm font-medium text-muted-foreground md:flex">
            <a href="#how" className="transition-colors hover:text-foreground">
              Sida ay u shaqeyso
            </a>
            <a href="#features" className="transition-colors hover:text-foreground">
              Astaamaha
            </a>
            <a href="#faq" className="transition-colors hover:text-foreground">
              Su'aalo
            </a>
          </div>

          <div className="hidden md:block">
            <Button asChild>
              <Link to={APP_CTA}>
                Gasho <ArrowRight />
              </Link>
            </Button>
          </div>

          <button
            className="grid h-10 w-10 place-items-center rounded-xl border border-border md:hidden"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </nav>

        {menuOpen && (
          <div className="border-t border-border/60 bg-background px-5 py-4 md:hidden">
            <div className="flex flex-col gap-4 text-sm font-medium">
              <a href="#how" onClick={() => setMenuOpen(false)}>
                Sida ay u shaqeyso
              </a>
              <a href="#features" onClick={() => setMenuOpen(false)}>
                Astaamaha
              </a>
              <a href="#faq" onClick={() => setMenuOpen(false)}>
                Su'aalo
              </a>
              <Button asChild className="mt-1">
                <Link to={APP_CTA}>
                  Gasho <ArrowRight />
                </Link>
              </Button>
            </div>
          </div>
        )}
      </header>

      {/* Hero */}
      <section className="relative mx-auto max-w-6xl px-5 pb-20 pt-14 lg:px-8 lg:pt-20">
        <div className="grid items-center gap-12 lg:grid-cols-2">
          <motion.div
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
          >
            <Badge variant="gold" className="mb-6">
              <Sparkles className="h-3.5 w-3.5" />
              AI-gaaga shukaansiga · 100% Af-Soomaali
            </Badge>
            <h1 className="text-balance font-display text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl lg:text-[3.4rem]">
              Ku guulayso wada hadalka shukaansiga,{" "}
              <em className="text-primary">si fudud</em> oo{" "}
              <span className="relative whitespace-nowrap text-accent-foreground">
                kalsooni leh
                <svg
                  className="absolute -bottom-2 left-0 w-full text-accent"
                  viewBox="0 0 200 12"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M2 9C60 2 140 2 198 9"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                  />
                </svg>
              </span>
            </h1>
            <p className="mt-6 max-w-lg text-balance text-base leading-relaxed text-muted-foreground sm:text-lg">
              Shukaansi AI waa gargaar caqliga leh oo kaa caawiya inaad bilowdo wada
              hadal, ka jawaabto su'aalaha lagugu soo diray, oo farriimahaaga ka dhigto
              kuwo qurux badan — dhammaantood{" "}
              <span className="font-semibold text-foreground">
                af-Soomaali oo saafi ah
              </span>
              .
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <Button size="lg" asChild>
                <Link to={APP_CTA}>
                  Bilow bilaash <ArrowRight />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <a href="#how">Sida ay u shaqeyso</a>
              </Button>
            </div>
            <p className="mt-4 flex items-center gap-2 text-xs font-medium text-muted-foreground">
              <Clock className="h-3.5 w-3.5 text-primary" />
              Waxba kuma kharash gasho — 24/7 diyaar kugu
            </p>
          </motion.div>

          {/* Chat mockup */}
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="relative mx-auto w-full max-w-md"
          >
            <div className="absolute -inset-4 -z-10 rounded-[2rem] bg-gradient-to-br from-primary/10 via-accent/15 to-transparent blur-xl" />
            <Card className="animate-float overflow-hidden shadow-2xl shadow-primary/10">
              <div className="flex items-center gap-3 border-b border-border bg-card px-5 py-4">
                <span className="grid h-10 w-10 place-items-center rounded-full bg-primary">
                  <Heart className="h-5 w-5 text-accent" fill="currentColor" />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold">Xafiiska Shukaansi AI</p>
                  <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                    Diyaar · Af-Soomaali
                  </p>
                </div>
              </div>
              <CardContent className="space-y-3 bg-muted/40 p-5">
                <div className="max-w-[80%] rounded-2xl rounded-bl-sm bg-card px-4 py-2.5 text-sm shadow-sm">
                  Haye! Sidee tahay? 😊
                </div>
                <div className="ml-auto max-w-[80%] rounded-2xl rounded-br-sm bg-primary px-4 py-2.5 text-sm text-primary-foreground shadow-sm">
                  Waan fiicnahay, adiga?
                </div>
                <div className="max-w-[92%] rounded-2xl rounded-bl-sm bg-card p-4 text-sm shadow-sm">
                  <p className="mb-2 flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-primary">
                    <Sparkles className="h-3.5 w-3.5" /> Shukaansi AI ayaa kugula talinaysa
                  </p>
                  <div className="space-y-2">
                    {[
                      "Waan fiicnahay, mahadsanid! Adiga sidee tahay?",
                      "Fiicnaa! Waad ii timi waqtigiisa — maanta sidee tahay? 😄",
                      "Hadda waxaan fiicnahay, laakiin hadaad i xasuusatay waa laga fiicnaaday!",
                    ].map((opt, i) => (
                      <div
                        key={i}
                        className="flex items-start gap-2 rounded-xl border border-border bg-background px-3 py-2 text-[13px] leading-snug"
                      >
                        <span className="mt-0.5 grid h-4 w-4 shrink-0 place-items-center rounded-full bg-accent/20 text-[10px] font-bold text-accent-foreground">
                          {i + 1}
                        </span>
                        {opt}
                      </div>
                    ))}
                  </div>
                </div>
                <div className="flex w-16 items-center gap-1 px-4 py-2">
                  <span className="h-2 w-2 animate-pulse-soft rounded-full bg-muted-foreground/50" />
                  <span
                    className="h-2 w-2 animate-pulse-soft rounded-full bg-muted-foreground/50"
                    style={{ animationDelay: "0.15s" }}
                  />
                  <span
                    className="h-2 w-2 animate-pulse-soft rounded-full bg-muted-foreground/50"
                    style={{ animationDelay: "0.3s" }}
                  />
                </div>
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* Stats strip */}
      <section className="border-y border-border/60 bg-card/70 backdrop-blur">
        <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-5 py-8 sm:grid-cols-4 lg:px-8">
          {[
            { v: "3", l: "Qaab oo caawimaad ah" },
            { v: "100%", l: "Af-Soomaali" },
            { v: "24/7", l: "Diyaar kugu" },
            { v: "🔒", l: "Sirtaada ammaan" },
          ].map((s, i) => (
            <motion.div
              key={s.l}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
              className="text-center"
            >
              <p className="font-display text-2xl font-semibold text-primary sm:text-3xl">
                {s.v}
              </p>
              <p className="mt-1 text-xs font-medium text-muted-foreground sm:text-sm">{s.l}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section id="how" className="mx-auto max-w-6xl scroll-mt-24 px-5 py-20 lg:px-8 lg:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Sida ay u shaqeyso
          </Badge>
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Saddex tillaabo oo fudud
          </h2>
          <p className="mt-4 text-muted-foreground">
            Ma aheyn mid adag — qor, xulo, oo dir. Shukaansi AI ayaa inta kale ka
            shaqaynaysa.
          </p>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map((s, i) => (
            <motion.div
              key={s.n}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
                <CardContent className="p-7">
                  <div className="mb-5 grid h-11 w-11 place-items-center rounded-2xl bg-primary/10 font-display text-lg font-semibold text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    {s.n}
                  </div>
                  <h3 className="font-display text-lg font-semibold">{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{s.body}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section
        id="features"
        className="scroll-mt-24 border-y border-border/60 bg-card/50 py-20 lg:py-24"
      >
        <div className="mx-auto max-w-6xl px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="mx-auto max-w-2xl text-center"
          >
            <Badge variant="gold" className="mb-4">
              Astaamaha
            </Badge>
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Wax kasta oo aad u baahan tahay — dhammi Af-Soomaali
            </h2>
            <p className="mt-4 text-muted-foreground">
              Laga soo bilaabo hadal bilow ilaa jawaab su'aal adag — gargaar kasta waa
              af-Soomaali oo dhamaystiran.
            </p>
          </motion.div>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-60px" }}
              >
                <Card className="group h-full transition-all duration-300 hover:-translate-y-1 hover:border-accent/50 hover:shadow-lg hover:shadow-accent/10">
                  <CardContent className="p-6">
                    <div className="mb-4 grid h-11 w-11 place-items-center rounded-2xl bg-accent/15 text-accent-foreground transition-transform duration-300 group-hover:scale-110">
                      <f.icon className="h-5 w-5" />
                    </div>
                    <h3 className="font-display text-base font-semibold">{f.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{f.body}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Example band */}
      <section className="relative overflow-hidden bg-primary py-20 text-primary-foreground lg:py-24">
        <div className="pattern-dots absolute inset-0 opacity-20 [background-image:radial-gradient(hsl(40_80%_70%/0.35)_1.2px,transparent_1.2px)]" />
        <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-5 lg:grid-cols-2 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
          >
            <Badge className="border-primary-foreground/20 bg-primary-foreground/10 text-primary-foreground">
              Tusaale dhab ah
            </Badge>
            <h2 className="mt-4 text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              "Maxaad maanta sameysay?" — hadda, sidee uga jawaabtaa?
            </h2>
            <p className="mt-4 max-w-md text-primary-foreground/80">
              Su'aalo sidaan oo kale ah ayaa mararka qaarkood iga dhigi karta inaadan
              garanayn waxaad dhahdo. Shukaansi AI wuxuu ku siinayaa jawaabo kala duwan —
              markiiba.
            </p>
            <ul className="mt-6 space-y-3 text-sm">
              {[
                "Jawaabo dabiici ah oo aan xoog la isku dayin",
                "Qaab kasta oo aad doonto — caqli-gal, ciyaar, ama jacayl",
                "Talocyin ku habboon dhaqanka Soomaaliga",
              ].map((li) => (
                <li key={li} className="flex items-center gap-2.5">
                  <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-accent-foreground">
                    <ChevronRight className="h-3 w-3" />
                  </span>
                  {li}
                </li>
              ))}
            </ul>
            <Button size="lg" variant="gold" asChild className="mt-8">
              <Link to={APP_CTA}>
                Tijaabi hadda <ArrowRight />
              </Link>
            </Button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 32 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: "-80px" }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="mx-auto w-full max-w-md"
          >
            <div className="rounded-3xl bg-primary-foreground/10 p-1.5 shadow-2xl ring-1 ring-primary-foreground/15 backdrop-blur">
              <div className="rounded-[1.4rem] bg-primary-foreground p-5 text-foreground">
                <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-primary">
                  Jawaabo ay soo jeedisay Shukaansi AI
                </p>
                <div className="space-y-2.5">
                  {[
                    {
                      n: "1",
                      t: "Maanta waxaan maqlay hees aad jeceshahay — way iga xusuusisay adiga.",
                    },
                    { n: "2", t: "Maalmo fiican! Adiga maanta sidee tahay? 😄" },
                    { n: "3", t: "Waxaan shaqaynayay, laakiin hadda waan firaaqaysanay — waad i soo qabatay waqtigiisa." },
                  ].map((o) => (
                    <div
                      key={o.n}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-card p-4 text-sm leading-snug shadow-sm transition-transform hover:scale-[1.01]"
                    >
                      <span className="grid h-5 w-5 shrink-0 place-items-center rounded-full bg-accent text-[11px] font-bold text-accent-foreground">
                        {o.n}
                      </span>
                      {o.t}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="mx-auto max-w-2xl text-center"
        >
          <Badge variant="secondary" className="mb-4">
            Waxa ay dhahaan
          </Badge>
          <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
            Dadka isticmaalaya ayaa saameyn arkay
          </h2>
        </motion.div>
        <div className="mt-12 grid gap-5 md:grid-cols-3">
          {testimonials.map((t, i) => (
            <motion.div
              key={t.name}
              custom={i}
              variants={fadeUp}
              initial="hidden"
              whileInView="show"
              viewport={{ once: true, margin: "-60px" }}
            >
              <Card className="h-full">
                <CardContent className="flex h-full flex-col p-6">
                  <div className="mb-4 flex gap-1 text-accent" aria-label="5 qoraal">
                    {Array.from({ length: 5 }).map((_, s) => (
                      <span key={s}>★</span>
                    ))}
                  </div>
                  <p className="flex-1 text-sm leading-relaxed">"{t.quote}"</p>
                  <div className="mt-5 flex items-center gap-3">
                    <span className="grid h-9 w-9 place-items-center rounded-full bg-primary/10 font-display text-sm font-semibold text-primary">
                      {t.name[0]}
                    </span>
                    <div>
                      <p className="text-sm font-semibold">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.city}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FAQ */}
      <section id="faq" className="scroll-mt-24 border-t border-border/60 bg-card/50 py-20 lg:py-24">
        <div className="mx-auto max-w-3xl px-5 lg:px-8">
          <motion.div
            variants={fadeUp}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-80px" }}
            className="text-center"
          >
            <Badge variant="gold" className="mb-4">
              Su'aalo
            </Badge>
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Su'aalaha inta badan la weydiiyo
            </h2>
          </motion.div>
          <div className="mt-10 space-y-3">
            {faqs.map((f, i) => (
              <motion.details
                key={f.q}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="show"
                viewport={{ once: true, margin: "-40px" }}
                className="group rounded-2xl border border-border bg-card px-6 py-4 transition-colors open:border-primary/30"
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-semibold [&::-webkit-details-marker]:hidden">
                  {f.q}
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-secondary text-sm transition-transform duration-300 group-open:rotate-45">
                    +
                  </span>
                </summary>
                <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{f.a}</p>
              </motion.details>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="mx-auto max-w-6xl px-5 py-20 lg:px-8 lg:py-24">
        <motion.div
          variants={fadeUp}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true, margin: "-80px" }}
          className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-primary via-[#8a2433] to-[#5e1521] px-6 py-14 text-center text-primary-foreground shadow-2xl shadow-primary/25 sm:px-12 lg:py-16"
        >
          <div className="pattern-dots absolute inset-0 opacity-20 [background-image:radial-gradient(hsl(40_80%_70%/0.35)_1.2px,transparent_1.2px)]" />
          <div className="relative mx-auto max-w-2xl">
            <span className="mx-auto mb-6 grid h-14 w-14 place-items-center rounded-2xl bg-accent shadow-lg shadow-black/20">
              <Heart className="h-7 w-7 text-accent-foreground" fill="currentColor" />
            </span>
            <h2 className="text-balance font-display text-3xl font-semibold tracking-tight sm:text-4xl">
              Diyaar ma u tahay inaad dhalaalayso?
            </h2>
            <p className="mx-auto mt-4 max-w-md text-primary-foreground/80">
              Samee saameyn wanaagsan — wada hadal kasta, qof kasta, iyo xaalad kasta.
              Gargaarku waa hal riix uun.
            </p>
            <Button size="lg" variant="gold" asChild className="mt-8">
              <Link to={APP_CTA}>
                Bilow hadalkaaga koowaad <ArrowRight />
              </Link>
            </Button>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/60 bg-card/60">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-5 py-8 sm:flex-row lg:px-8">
          <Logo />
          <p className="flex items-center gap-2 text-sm text-muted-foreground">
            <Languages className="h-4 w-4 text-primary" />
            Gargaarkaaga shukaansiga ee AI — af-Soomaali oo dhan
          </p>
          <p className="text-xs text-muted-foreground">© 2026 Shukaansi AI</p>
        </div>
        <Separator className="mx-auto max-w-6xl" />
      </footer>
    </div>
  );
}
