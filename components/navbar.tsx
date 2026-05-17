"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "./logo";
import { Button } from "./ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRight, Sun, Moon } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";

const navItems = [
  { label: "Home", href: "/" },
  { label: "Dashboard", href: "/dashboard" },
  { label: "Upload", href: "/upload" },
  { label: "Pricing", href: "/pricing" },
];

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const supabase = createClient();

  useEffect(() => {
    // 1. Initial user loading
    async function getInitialUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Failed to fetch initial user:", err);
      } finally {
        setLoading(false);
      }
    }
    getInitialUser();

    // 2. Initial theme sync
    const savedTheme = localStorage.getItem("lumen-theme");
    const isDark = savedTheme === "dark" || (!savedTheme && window.matchMedia("(prefers-color-scheme: dark)").matches);
    if (isDark) {
      document.documentElement.classList.add("dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      setTheme("light");
    }

    // 3. Listen for state changes (e.g. sign in, sign out)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase]);

  const toggleTheme = () => {
    if (theme === "light") {
      document.documentElement.classList.add("dark");
      localStorage.setItem("lumen-theme", "dark");
      setTheme("dark");
    } else {
      document.documentElement.classList.remove("dark");
      localStorage.setItem("lumen-theme", "light");
      setTheme("light");
    }
  };

  async function handleSignOut() {
    try {
      await supabase.auth.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Error signing out:", err);
    }
  }

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="absolute inset-0 glass border-b border-border/40" />
      <div className="relative mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
        <div className="flex items-center gap-10">
          <Logo />
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative px-3.5 py-1.5 text-[13.5px] font-medium rounded-full transition-all",
                    active
                      ? "text-foreground"
                      : "text-muted-foreground hover:text-foreground"
                  )}
                >
                  {active && (
                    <span className="absolute inset-0 rounded-full bg-secondary" />
                  )}
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center gap-2">
          {/* Light/Dark Toggle */}
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={toggleTheme} 
            className="h-9 w-9 rounded-full mr-1 shrink-0"
            title="Toggle theme"
          >
            {theme === "light" ? (
              <Moon className="h-[17px] w-[17px] text-foreground" />
            ) : (
              <Sun className="h-[17px] w-[17px] text-foreground" />
            )}
          </Button>

          {/* Render layout conditionally with smooth placeholder space to avoid hydration mismatch/flickering */}
          {loading ? (
            <div className="w-[170px] h-9" /> // spacer with exact dimensions
          ) : user ? (
            <>
              <Button variant="ghost" size="sm" onClick={handleSignOut}>
                Sign out
              </Button>
              <Button size="sm" asChild className="group">
                <Link href="/dashboard/chat">
                  Workspace
                  <ArrowUpRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button size="sm" asChild className="group">
                <Link href="/dashboard">
                  Get started
                  <ArrowUpRight className="ml-0.5 h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                </Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
