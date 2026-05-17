import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  ArrowRight,
  Sparkles,
  FileText,
  Brain,
  Shield,
  Zap,
  Layers,
  Search,
  ChevronRight,
} from "lucide-react";

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden">
        {/* HERO */}
        <section className="relative pt-24 pb-32">
          <div className="absolute inset-0 red-radial pointer-events-none" />
          <div className="absolute inset-0 grid-bg opacity-[0.35] [mask-image:radial-gradient(ellipse_at_top,black,transparent_70%)] pointer-events-none" />

          <div className="relative mx-auto max-w-7xl px-6">
            <div className="mx-auto max-w-3xl text-center">
              <div className="inline-flex items-center gap-2 rounded-full border border-border/80 bg-white/60 backdrop-blur px-3 py-1 text-xs font-medium text-muted-foreground animate-fade-in">
                <span className="flex h-1.5 w-1.5 rounded-full bg-primary" />
                Introducing Lumen 2.0 — now with reasoning
                <ChevronRight className="h-3 w-3" />
              </div>

              <h1 className="mt-8 font-display text-[64px] md:text-[88px] leading-[0.95] tracking-[-0.04em] font-medium text-balance animate-fade-up">
                Intelligence,
                <br />
                <span className="italic font-light">distilled</span>
                <span className="text-primary">.</span>
              </h1>

              <p className="mt-8 text-lg md:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed text-balance animate-fade-up [animation-delay:120ms] opacity-0">
                Upload a document. Get answers, summaries, and structured insight in
                seconds — with the precision of a research assistant who never sleeps.
              </p>

              <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 animate-fade-up [animation-delay:240ms] opacity-0">
                <Button size="xl" asChild>
                  <Link href="/upload">
                    Try it free
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
                <Button size="xl" variant="outline" asChild>
                  <Link href="/dashboard">See dashboard</Link>
                </Button>
              </div>

              <p className="mt-6 text-xs text-muted-foreground animate-fade-up [animation-delay:360ms] opacity-0">
                No credit card. Free for the first 50 pages.
              </p>
            </div>

            {/* Hero visual */}
            <div className="mt-20 relative animate-fade-up [animation-delay:480ms] opacity-0">
              <HeroPreview />
            </div>
          </div>
        </section>

        {/* LOGO STRIP */}
        <section className="border-y border-border/60 bg-secondary/30">
          <div className="mx-auto max-w-7xl px-6 py-10">
            <p className="text-center text-xs uppercase tracking-[0.18em] text-muted-foreground mb-8">
              Trusted by teams shipping serious work
            </p>
            <div className="flex flex-wrap items-center justify-center gap-x-12 gap-y-6 opacity-60">
              {["Northwind", "Acme Co.", "Helios", "Vector", "Quantum", "Stride"].map(
                (name) => (
                  <span
                    key={name}
                    className="font-display text-xl md:text-2xl font-medium tracking-tight text-foreground/70"
                  >
                    {name}
                  </span>
                )
              )}
            </div>
          </div>
        </section>

        {/* FEATURES */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-6">
            <div className="max-w-2xl">
              <Badge variant="soft" className="rounded-full">
                <Sparkles className="mr-1 h-3 w-3" />
                Capabilities
              </Badge>
              <h2 className="mt-4 font-display text-5xl md:text-6xl font-medium tracking-tight text-balance">
                Built for the way modern teams think
                <span className="text-primary">.</span>
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Lumen blends large language reasoning with structured retrieval. Ask
                anything. Get cited, verifiable answers.
              </p>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              <FeatureCard
                icon={Brain}
                title="Reasoning that scales"
                body="Multi-step inference across hundreds of pages. The model holds the whole document in mind — not just the nearest paragraph."
              />
              <FeatureCard
                icon={Search}
                title="Citations, always"
                body="Every answer maps to the exact passage. Click to verify, never guess."
                accent
              />
              <FeatureCard
                icon={Layers}
                title="Structured output"
                body="Pull tables, dates, entities, and clauses into clean JSON. Pipe it anywhere."
              />
              <FeatureCard
                icon={Zap}
                title="Instant indexing"
                body="A 400-page PDF is ready in under twelve seconds. No waiting room."
              />
              <FeatureCard
                icon={Shield}
                title="Private by design"
                body="SOC 2 Type II. Your documents are encrypted, isolated, and never used for training."
              />
              <FeatureCard
                icon={FileText}
                title="Any format"
                body="PDF, DOCX, scans, slides, contracts, research papers. If it has words, Lumen reads it."
              />
            </div>
          </div>
        </section>

        {/* SHOWCASE BLOCK */}
        <section className="py-32 bg-gradient-to-b from-transparent via-secondary/40 to-transparent">
          <div className="mx-auto max-w-7xl px-6 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <Badge variant="outline" className="rounded-full">
                Workflow
              </Badge>
              <h2 className="mt-4 font-display text-5xl font-medium tracking-tight text-balance">
                From document to decision — in one breath.
              </h2>
              <p className="mt-5 text-lg text-muted-foreground leading-relaxed">
                Drop a contract. Ask what changed. Get a summary, a redline view, and a
                draft response. All in the same window.
              </p>
              <div className="mt-8 space-y-4">
                {[
                  { n: "01", t: "Upload", d: "Drag and drop. We handle the rest." },
                  { n: "02", t: "Ask", d: "Natural language. No prompt engineering." },
                  { n: "03", t: "Act", d: "Export, share, or push to your stack." },
                ].map((step) => (
                  <div key={step.n} className="flex gap-5 group">
                    <span className="font-mono text-xs text-primary pt-1.5 tracking-widest">
                      {step.n}
                    </span>
                    <div className="flex-1 pb-4 border-b border-border/60">
                      <p className="font-medium">{step.t}</p>
                      <p className="text-sm text-muted-foreground mt-0.5">
                        {step.d}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Card className="p-2 shadow-apple-lg overflow-hidden">
              <div className="rounded-[20px] bg-secondary/60 border border-border/60 p-6 font-mono text-xs space-y-3">
                <div className="flex items-center gap-1.5 pb-2 border-b border-border/60">
                  <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
                  <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
                  <span className="ml-auto text-[10px] text-muted-foreground">
                    /api/v2/query
                  </span>
                </div>
                <pre className="text-[12px] leading-relaxed whitespace-pre-wrap">
{`{
  "doc": "q4-financials.pdf",
  "question": "What drove the revenue beat?",
  "answer": {
    "text": "Enterprise ARR grew 38% YoY,
             driven by 14 new logos > $250k.",
    "confidence": 0.94,
    "sources": [
      { "page": 12, "lines": "4-9" },
      { "page": 18, "lines": "22-25" }
    ]
  }
}`}
                </pre>
              </div>
            </Card>
          </div>
        </section>

        {/* CTA */}
        <section className="py-32">
          <div className="mx-auto max-w-7xl px-6">
            <Card className="relative overflow-hidden border-0 bg-foreground text-background p-16 md:p-24 rounded-[40px]">
              <div className="absolute inset-0 opacity-30 dot-pattern" />
              <div
                className="absolute -top-32 -right-32 h-96 w-96 rounded-full opacity-60"
                style={{
                  background:
                    "radial-gradient(circle, rgba(239,68,68,0.5) 0%, transparent 60%)",
                }}
              />
              <div className="relative max-w-2xl">
                <h2 className="font-display text-5xl md:text-7xl font-medium tracking-tight text-balance">
                  Start reading
                  <br />
                  <span className="italic font-light text-background/70">smarter</span>
                  <span className="text-primary">.</span>
                </h2>
                <p className="mt-6 text-lg text-background/70 leading-relaxed max-w-md">
                  Join thousands of teams who replaced ten tabs with one.
                </p>
                <div className="mt-10 flex flex-col sm:flex-row gap-3">
                  <Button size="xl" variant="default" asChild>
                    <Link href="/upload">
                      Upload your first PDF
                      <ArrowRight className="ml-1 h-4 w-4" />
                    </Link>
                  </Button>
                  <Button
                    size="xl"
                    variant="ghost"
                    asChild
                    className="text-background hover:bg-background/10 hover:text-background"
                  >
                    <Link href="/pricing">See pricing</Link>
                  </Button>
                </div>
              </div>
            </Card>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function FeatureCard({
  icon: Icon,
  title,
  body,
  accent = false,
}: {
  icon: any;
  title: string;
  body: string;
  accent?: boolean;
}) {
  return (
    <Card className="group p-7 hover:shadow-apple-md transition-all duration-500 hover:-translate-y-0.5">
      <div
        className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${
          accent
            ? "bg-primary text-primary-foreground"
            : "bg-secondary text-foreground"
        } transition-colors`}
      >
        <Icon className="h-4.5 w-4.5" strokeWidth={1.8} />
      </div>
      <h3 className="mt-5 font-display text-xl font-medium tracking-tight">
        {title}
      </h3>
      <p className="mt-2 text-[14.5px] text-muted-foreground leading-relaxed">
        {body}
      </p>
    </Card>
  );
}

function HeroPreview() {
  return (
    <div className="relative mx-auto max-w-5xl">
      <div className="absolute -inset-6 bg-gradient-to-b from-primary/5 to-transparent blur-2xl rounded-[48px]" />
      <Card className="relative p-2 shadow-apple-lg rounded-[28px] overflow-hidden">
        <div className="rounded-[22px] bg-gradient-to-b from-white to-secondary/40 border border-border/40 overflow-hidden">
          {/* Browser chrome */}
          <div className="flex items-center gap-1.5 px-5 py-3.5 border-b border-border/60 bg-white/80">
            <span className="h-2.5 w-2.5 rounded-full bg-red-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-yellow-300" />
            <span className="h-2.5 w-2.5 rounded-full bg-green-300" />
            <div className="ml-4 flex-1 max-w-md mx-auto text-center text-[11px] text-muted-foreground bg-secondary/80 rounded-md py-1 px-3">
              lumen.ai/workspace
            </div>
          </div>
          {/* Content */}
          <div className="grid grid-cols-12 min-h-[420px]">
            {/* Sidebar */}
            <div className="col-span-3 border-r border-border/60 p-4 space-y-1 hidden md:block">
              {[
                { label: "All documents", count: 142, active: true },
                { label: "Contracts", count: 38 },
                { label: "Research", count: 21 },
                { label: "Financials", count: 17 },
                { label: "Archived", count: 66 },
              ].map((item) => (
                <div
                  key={item.label}
                  className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                    item.active
                      ? "bg-primary/8 text-primary"
                      : "text-muted-foreground"
                  }`}
                >
                  <span className="font-medium">{item.label}</span>
                  <span className="text-[10px]">{item.count}</span>
                </div>
              ))}
            </div>
            {/* Main */}
            <div className="col-span-12 md:col-span-9 p-6">
              <div className="flex items-center justify-between mb-5">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-muted-foreground">
                    Q4 — 2025
                  </p>
                  <h3 className="font-display text-2xl font-medium mt-0.5">
                    Annual Report — Helios
                  </h3>
                </div>
                <Badge variant="soft" className="rounded-full">
                  Indexed
                </Badge>
              </div>

              <div className="space-y-3">
                {[
                  {
                    q: "Summarize the executive letter in three points.",
                    out: true,
                  },
                  { q: "What is the YoY revenue change?", out: false },
                ].map((item, i) => (
                  <div
                    key={i}
                    className={`p-4 rounded-2xl text-[13px] ${
                      item.out
                        ? "bg-secondary/60 border border-border/40"
                        : "bg-primary/5 border border-primary/15"
                    }`}
                  >
                    <p className="text-[11px] uppercase tracking-wider text-muted-foreground mb-1.5">
                      {item.out ? "You" : "Lumen"}
                    </p>
                    <p className="leading-relaxed">{item.q}</p>
                  </div>
                ))}
                <div className="p-4 rounded-2xl bg-primary/5 border border-primary/15 text-[13px]">
                  <p className="text-[11px] uppercase tracking-wider text-primary mb-1.5">
                    Lumen
                  </p>
                  <p className="leading-relaxed">
                    Revenue grew{" "}
                    <span className="font-medium text-foreground">38.2% YoY</span>,
                    driven primarily by enterprise ARR expansion and 14 new
                    seven-figure logos.
                  </p>
                  <div className="flex flex-wrap gap-1.5 mt-3">
                    {["p. 12", "p. 18", "p. 24"].map((p) => (
                      <span
                        key={p}
                        className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-white border border-border/60"
                      >
                        {p}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  );
}
