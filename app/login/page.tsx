"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowRight, Github, Eye, EyeOff } from "lucide-react";
import { login } from "@/lib/supabase/actions";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function handleAction(formData: FormData) {
    setError(null);
    setLoading(true);
    
    try {
      const result = await login(formData);
      if (result && result.error) {
        setError(result.error);
        setLoading(false);
      }
    } catch (err: any) {
      // In Next.js App Router, if the server action redirects, it throws an internal redirect error
      // which MUST be rethrown so that Next.js can perform the client-side navigation.
      if (err.digest?.startsWith("NEXT_REDIRECT")) {
        throw err;
      }
      setError(err.message || "An unexpected error occurred during login.");
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen grid grid-cols-1 lg:grid-cols-2">
      {/* Left: form */}
      <div className="flex flex-col px-8 md:px-16 py-10">
        <Logo />

        <div className="flex-1 flex items-center">
          <div className="w-full max-w-sm mx-auto">
            <h1 className="font-display text-5xl font-medium tracking-tight">
              Welcome back<span className="text-primary">.</span>
            </h1>
            <p className="mt-3 text-muted-foreground">
              Sign in to your workspace and pick up where you left off.
            </p>

            {/* OAuth */}
            <div className="mt-10 space-y-2.5">
              <Button variant="outline" size="lg" className="w-full justify-center">
                <svg className="h-4 w-4 mr-2" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                Continue with Google
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-center">
                <svg
                  className="h-4 w-4 mr-2"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                >
                  <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z" />
                </svg>
                Continue with Apple
              </Button>
              <Button variant="outline" size="lg" className="w-full justify-center">
                <Github className="h-4 w-4 mr-2" />
                Continue with GitHub
              </Button>
            </div>

            <div className="my-8 flex items-center gap-4">
              <div className="flex-1 border-t border-border" />
              <span className="text-xs uppercase tracking-wider text-muted-foreground">
                or
              </span>
              <div className="flex-1 border-t border-border" />
            </div>

            {/* Inline Error Message */}
            {error && (
              <div className="mb-6 p-3.5 text-xs font-medium text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400 rounded-xl border border-red-100 dark:border-red-900/30">
                {error}
              </div>
            )}

            {/* Email form */}
            <form action={handleAction} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="you@company.com"
                  autoComplete="email"
                  required
                />
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    href="#"
                    className="text-xs text-primary hover:underline"
                  >
                    Forgot?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    autoComplete="current-password"
                    className="pr-11"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <Button size="lg" className="w-full mt-2" type="submit" disabled={loading}>
                {loading ? "Signing in..." : "Sign in"}
                <ArrowRight className="ml-1 h-4 w-4" />
              </Button>
            </form>

            <p className="mt-8 text-center text-sm text-muted-foreground">
              New to Lumen?{" "}
              <Link href="/signup" className="text-foreground font-medium hover:text-primary transition-colors">
                Create an account
              </Link>
            </p>
          </div>
        </div>

        <p className="text-xs text-muted-foreground">
          By signing in you agree to our{" "}
          <Link href="#" className="underline">
            Terms
          </Link>{" "}
          and{" "}
          <Link href="#" className="underline">
            Privacy Policy
          </Link>
          .
        </p>
      </div>

      {/* Right: visual */}
      <div className="hidden lg:block relative bg-foreground overflow-hidden">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(ellipse 60% 50% at 70% 20%, rgba(239,68,68,0.35), transparent 60%), radial-gradient(ellipse 50% 50% at 20% 80%, rgba(239,68,68,0.18), transparent 70%)",
          }}
        />
        <div className="absolute inset-0 dot-pattern opacity-[0.12]" />

        <div className="relative h-full flex flex-col justify-between p-16 text-background">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-background/60">
            <span className="h-1 w-8 bg-primary" />
            A workspace for ideas
          </div>

          {/* Quote / testimonial */}
          <div className="max-w-md">
            <p className="font-display text-3xl md:text-4xl font-light leading-[1.2] tracking-tight text-balance">
              "Lumen replaced our research stack. It reads 200-page filings faster
              than I can pour coffee."
            </p>
            <div className="mt-8 flex items-center gap-4">
              <div className="h-10 w-10 rounded-full bg-background/10 flex items-center justify-center font-display font-medium">
                M
              </div>
              <div>
                <p className="text-sm font-medium">Maya Chen</p>
                <p className="text-xs text-background/60">
                  Head of Research, Vector Partners
                </p>
              </div>
            </div>
          </div>

          {/* Floating stats card */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { v: "12k+", l: "Active teams" },
              { v: "99.99%", l: "Uptime" },
              { v: "1.4s", l: "Avg. latency" },
            ].map((s) => (
              <div
                key={s.l}
                className="rounded-2xl border border-background/10 bg-background/5 backdrop-blur p-4"
              >
                <p className="font-display text-2xl font-medium tracking-tight">
                  {s.v}
                </p>
                <p className="text-[11px] text-background/60 mt-1 uppercase tracking-wider">
                  {s.l}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </main>
  );
}
