"use client";

import { useState } from "react";
import Link from "next/link";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Check, Sparkles, Building2, Zap, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

const tiers = [
  {
    name: "Starter",
    icon: Zap,
    description: "For individuals exploring intelligent documents.",
    monthly: 0,
    yearly: 0,
    cta: "Start free",
    href: "/login",
    features: [
      "50 pages per month",
      "5 documents",
      "Basic Q&A",
      "PDF & DOCX support",
      "Community support",
    ],
  },
  {
    name: "Pro",
    icon: Sparkles,
    description: "Everything a knowledge worker needs to read smarter.",
    monthly: 19,
    yearly: 15,
    cta: "Start 14-day trial",
    href: "/login",
    featured: true,
    features: [
      "10,000 pages per month",
      "Unlimited documents",
      "Advanced reasoning",
      "Citations & references",
      "Structured JSON export",
      "Priority processing",
      "Email support",
    ],
  },
  {
    name: "Team",
    icon: Building2,
    description: "Collaborative intelligence for the whole org.",
    monthly: 49,
    yearly: 39,
    cta: "Contact sales",
    href: "#",
    features: [
      "Unlimited pages",
      "Unlimited seats",
      "Shared workspaces",
      "SSO + SCIM",
      "Audit logs",
      "Custom retention",
      "Dedicated success manager",
      "SOC 2 Type II",
    ],
  },
];

const faqs = [
  {
    q: "How does Lumen handle my data?",
    a: "Documents are encrypted at rest with AES-256 and in transit with TLS 1.3. We never use your content to train models. You can delete a workspace and all derived embeddings at any time.",
  },
  {
    q: "Can I switch plans later?",
    a: "Yes. Upgrade or downgrade at any time. Prorated charges or credits apply automatically — no calls, no friction.",
  },
  {
    q: "What counts as a 'page'?",
    a: "A page is roughly 500 words. We measure intelligently — a slide deck won't burn the same quota as a dense research paper.",
  },
  {
    q: "Do you offer educational or non-profit pricing?",
    a: "Yes — 50% off Pro and Team plans. Reach out from your institutional email and we'll set you up.",
  },
];

export default function PricingPage() {
  const [yearly, setYearly] = useState(true);

  return (
    <>
      <Navbar />
      <main className="relative">
        <div className="absolute top-0 inset-x-0 h-[500px] red-radial pointer-events-none" />

        <section className="relative pt-24 pb-16">
          <div className="mx-auto max-w-7xl px-6 text-center">
            <Badge variant="soft" className="rounded-full">
              Pricing
            </Badge>
            <h1 className="mt-4 font-display text-6xl md:text-7xl font-medium tracking-tight text-balance">
              Simple, honest
              <br />
              <span className="italic font-light">pricing</span>
              <span className="text-primary">.</span>
            </h1>
            <p className="mt-6 text-lg text-muted-foreground max-w-xl mx-auto leading-relaxed text-balance">
              Start free. Scale when you're ready. No hidden fees, no surprise tiers.
            </p>

            {/* Billing toggle */}
            <div className="mt-10 inline-flex items-center gap-1 rounded-full border border-border bg-white p-1 shadow-apple">
              <button
                onClick={() => setYearly(false)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all",
                  !yearly
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                )}
              >
                Monthly
              </button>
              <button
                onClick={() => setYearly(true)}
                className={cn(
                  "px-5 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2",
                  yearly
                    ? "bg-foreground text-background"
                    : "text-muted-foreground"
                )}
              >
                Yearly
                <span
                  className={cn(
                    "text-[10px] px-1.5 py-0.5 rounded-full font-mono",
                    yearly
                      ? "bg-primary text-primary-foreground"
                      : "bg-primary/10 text-primary"
                  )}
                >
                  −20%
                </span>
              </button>
            </div>
          </div>
        </section>

        {/* Tiers */}
        <section className="relative pb-24">
          <div className="mx-auto max-w-7xl px-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {tiers.map((tier) => (
                <PriceCard key={tier.name} tier={tier} yearly={yearly} />
              ))}
            </div>

            <p className="text-center text-xs text-muted-foreground mt-10">
              All plans include unlimited workspace members, version history, and
              SSL.
            </p>
          </div>
        </section>

        {/* Comparison band */}
        <section className="py-20 bg-secondary/30 border-y border-border/60">
          <div className="mx-auto max-w-5xl px-6 text-center">
            <h2 className="font-display text-4xl md:text-5xl font-medium tracking-tight text-balance">
              Built for scale. Priced for sanity.
            </h2>
            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { stat: "99.99%", label: "Uptime SLA" },
                { stat: "<1.5s", label: "Median query latency" },
                { stat: "SOC 2", label: "Type II certified" },
              ].map((item) => (
                <div key={item.label}>
                  <p className="font-display text-5xl font-medium tracking-tight">
                    {item.stat.includes(".") || item.stat.includes("<") ? (
                      <span>
                        {item.stat}
                        <span className="text-primary">.</span>
                      </span>
                    ) : (
                      <span>{item.stat}</span>
                    )}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground uppercase tracking-wider">
                    {item.label}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ */}
        <section className="py-24">
          <div className="mx-auto max-w-3xl px-6">
            <div className="text-center mb-14">
              <Badge variant="outline" className="rounded-full">
                Questions
              </Badge>
              <h2 className="mt-4 font-display text-5xl font-medium tracking-tight">
                Quick answers<span className="text-primary">.</span>
              </h2>
            </div>

            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <Card key={i} className="p-7">
                  <h3 className="font-medium text-[15px]">{faq.q}</h3>
                  <p className="mt-2 text-sm text-muted-foreground leading-relaxed">
                    {faq.a}
                  </p>
                </Card>
              ))}
            </div>

            <div className="mt-12 text-center">
              <p className="text-sm text-muted-foreground">
                More questions? We're here.
              </p>
              <Button variant="link" className="text-primary" asChild>
                <Link href="#">
                  Talk to sales
                  <ArrowRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

function PriceCard({
  tier,
  yearly,
}: {
  tier: (typeof tiers)[number];
  yearly: boolean;
}) {
  const Icon = tier.icon;
  const price = yearly ? tier.yearly : tier.monthly;
  return (
    <Card
      className={cn(
        "relative p-8 flex flex-col rounded-[28px] transition-all duration-300",
        tier.featured
          ? "bg-foreground text-background border-foreground shadow-apple-lg md:-translate-y-2"
          : "hover:shadow-apple-md hover:-translate-y-0.5"
      )}
    >
      {tier.featured && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2">
          <Badge className="rounded-full px-3 py-1 shadow-red-glow">
            <Sparkles className="h-3 w-3 mr-1" />
            Most popular
          </Badge>
        </div>
      )}

      <div className="flex items-center gap-3">
        <div
          className={cn(
            "h-9 w-9 rounded-xl flex items-center justify-center",
            tier.featured
              ? "bg-background/10 text-background"
              : "bg-secondary text-foreground"
          )}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
        <h3 className="font-display text-2xl font-medium tracking-tight">
          {tier.name}
        </h3>
      </div>
      <p
        className={cn(
          "mt-3 text-sm leading-relaxed",
          tier.featured ? "text-background/70" : "text-muted-foreground"
        )}
      >
        {tier.description}
      </p>

      <div className="mt-7 pb-7 border-b border-current/10">
        <div className="flex items-baseline gap-1.5">
          <span className="font-display text-6xl font-medium tracking-tight">
            ${price}
          </span>
          <span
            className={cn(
              "text-sm",
              tier.featured ? "text-background/60" : "text-muted-foreground"
            )}
          >
            /{tier.name === "Team" ? "user/mo" : "mo"}
          </span>
        </div>
        {yearly && price > 0 && (
          <p
            className={cn(
              "text-xs mt-1.5",
              tier.featured ? "text-background/50" : "text-muted-foreground"
            )}
          >
            Billed annually · ${(price * 12).toFixed(0)}/yr
          </p>
        )}
        {price === 0 && (
          <p
            className={cn(
              "text-xs mt-1.5",
              tier.featured ? "text-background/50" : "text-muted-foreground"
            )}
          >
            Free, forever
          </p>
        )}
      </div>

      <ul className="mt-7 space-y-3 flex-1">
        {tier.features.map((feature) => (
          <li key={feature} className="flex items-start gap-2.5 text-sm">
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full flex items-center justify-center shrink-0",
                tier.featured ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary"
              )}
            >
              <Check className="h-2.5 w-2.5" strokeWidth={3} />
            </div>
            <span className={tier.featured ? "text-background/90" : ""}>
              {feature}
            </span>
          </li>
        ))}
      </ul>

      <Button
        size="lg"
        variant={tier.featured ? "default" : "outline"}
        className="mt-8 w-full"
        asChild
      >
        <Link href={tier.href}>
          {tier.cta}
          {tier.featured && <ArrowRight className="ml-1 h-4 w-4" />}
        </Link>
      </Button>
    </Card>
  );
}
