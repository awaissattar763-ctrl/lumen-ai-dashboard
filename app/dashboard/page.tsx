"use client";

import Link from "next/link";
import { useEffect, useState, useCallback } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { deleteUserDocument } from "@/lib/supabase/actions";
import { DbDocument } from "@/lib/supabase/types";
import {
  ArrowUpRight,
  FileText,
  TrendingUp,
  Search,
  Upload,
  MoreHorizontal,
  Sparkles,
  Clock,
  Filter,
  FileCheck2,
  Brain,
  ArrowRight,
  Trash2,
  Loader2,
} from "lucide-react";
import {
  Area,
  AreaChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  CartesianGrid,
} from "recharts";

const usageData = [
  { day: "Mon", queries: 124, docs: 8 },
  { day: "Tue", queries: 218, docs: 14 },
  { day: "Wed", queries: 187, docs: 11 },
  { day: "Thu", queries: 342, docs: 22 },
  { day: "Fri", queries: 412, docs: 28 },
  { day: "Sat", queries: 156, docs: 9 },
  { day: "Sun", queries: 89, docs: 4 },
];

const recentDocs = [
  {
    title: "Helios — Annual Report 2025",
    type: "PDF",
    size: "4.2 MB",
    pages: 84,
    status: "Indexed",
    time: "2 min ago",
    queries: 17,
  },
  {
    title: "Master Services Agreement — Vector",
    type: "PDF",
    size: "812 KB",
    pages: 22,
    status: "Indexed",
    time: "14 min ago",
    queries: 9,
  },
  {
    title: "Q3 Financial Model",
    type: "XLSX",
    size: "1.1 MB",
    pages: 12,
    status: "Processing",
    time: "1 hr ago",
    queries: 0,
  },
  {
    title: "Research — LLM Routing Strategies",
    type: "PDF",
    size: "2.8 MB",
    pages: 36,
    status: "Indexed",
    time: "3 hr ago",
    queries: 42,
  },
  {
    title: "Board deck — November",
    type: "PPTX",
    size: "6.4 MB",
    pages: 28,
    status: "Indexed",
    time: "Yesterday",
    queries: 6,
  },
];

const recentQueries = [
  {
    q: "What's the YoY revenue change in section 3?",
    doc: "Helios — Annual Report",
    time: "2m",
  },
  {
    q: "Summarize indemnification clauses.",
    doc: "Master Services Agreement",
    time: "14m",
  },
  {
    q: "Compare gross margin to last year.",
    doc: "Q3 Financial Model",
    time: "1h",
  },
  {
    q: "List every cited paper from Anthropic.",
    doc: "Research — LLM Routing",
    time: "3h",
  },
];

export default function DashboardPage() {
  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [loadingDocs, setLoadingDocs] = useState(true);
  const [queryCount, setQueryCount] = useState(0);
  const [isPro, setIsPro] = useState(false);
  const supabase = createClient();

  const fetchDocuments = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from("documents")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setDocuments((data as DbDocument[]) || []);
    } catch (err) {
      console.error("Failed to fetch user documents:", err);
    } finally {
      setLoadingDocs(false);
    }
  }, [supabase]);

  useEffect(() => {
    async function getSessionUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
        
        if (user) {
          // 1. Determine active plan tier from authentic Supabase user metadata
          const userIsPro = user.user_metadata?.subscription_status === 'active' || user.user_metadata?.stripe_subscription_id !== undefined;
          setIsPro(userIsPro);

          // 2. Count active query count dynamically from messages database table
          const { count } = await supabase
            .from("messages")
            .select("id", { count: "exact", head: true })
            .eq("user_id", user.id)
            .eq("role", "user");
          setQueryCount(count || 0);
        }
      } catch (err) {
        console.error("Failed to get session user in dashboard:", err);
      }
    }
    getSessionUser();
  }, [supabase]);

  useEffect(() => {
    if (user) {
      fetchDocuments();
    }
  }, [user, fetchDocuments]);

  const handleDelete = async (id: string, storagePath: string) => {
    if (!confirm("Are you sure you want to permanently delete this document?")) return;
    
    // Optimistic UI state update
    setDocuments((prev) => prev.filter((d) => d.id !== id));

    try {
      const result = await deleteUserDocument(id, storagePath);
      if (result && result.error) {
        alert("Failed to delete document: " + result.error);
        fetchDocuments(); // Revert back
      }
    } catch (err: any) {
      alert("Error: " + err.message);
      fetchDocuments();
    }
  };

  const displayName = user?.email ? user.email.split("@")[0] : "Sarah";

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-7xl px-6 py-12">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-sm text-muted-foreground">Welcome back, {displayName}</p>
            <h1 className="font-display text-5xl font-medium tracking-tight mt-1">
              Workspace
              <span className="text-primary">.</span>
            </h1>
          </div>
          <div className="flex items-center gap-2">
            <Link href="/dashboard/chat" className="relative block group">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors" />
              <Input
                placeholder="Ask anything…"
                readOnly
                className="pl-10 w-72 h-10 rounded-full bg-secondary/60 border-transparent focus-visible:bg-white cursor-pointer group-hover:border-primary/20 transition-all"
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground bg-white border border-border rounded px-1.5 py-0.5">
                ⌘K
              </kbd>
            </Link>
            <Button asChild>
              <Link href="/upload">
                <Upload className="h-4 w-4 mr-1" />
                Upload
              </Link>
            </Button>
          </div>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-10">
          <StatCard
            label="Documents"
            value={loadingDocs ? "..." : documents.length.toString()}
            change={`+${documents.length}`}
            icon={FileText}
            trend="up"
          />
          <StatCard
            label="Queries this week"
            value={queryCount.toString()}
            change={`+${queryCount}`}
            icon={Brain}
            trend="up"
            accent
          />
          <StatCard
            label="Pages indexed"
            value={loadingDocs ? "..." : documents.reduce((acc, d) => acc + Math.max(1, Math.floor(d.file_size / 35000)), 0).toLocaleString()}
            change="Dynamic"
            icon={FileCheck2}
            trend="up"
          />
          <StatCard
            label="Avg. response time"
            value="1.4s"
            change="−180ms"
            icon={Clock}
            trend="up"
          />
        </div>

        {/* Main grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
          {/* Usage chart */}
          <Card className="lg:col-span-2 p-7">
            <div className="flex items-center justify-between mb-1">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight">
                  Activity
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Last 7 days of queries and uploads
                </p>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="rounded-full font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-primary mr-1.5" />
                  Queries
                </Badge>
                <Badge variant="outline" className="rounded-full font-normal">
                  <span className="h-1.5 w-1.5 rounded-full bg-foreground mr-1.5" />
                  Docs
                </Badge>
              </div>
            </div>
            <div className="h-72 mt-6 -ml-3">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={usageData}>
                  <defs>
                    <linearGradient id="g1" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(220,38,38)" stopOpacity={0.18} />
                      <stop
                        offset="100%"
                        stopColor="rgb(220,38,38)"
                        stopOpacity={0}
                      />
                    </linearGradient>
                    <linearGradient id="g2" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="rgb(20,20,20)" stopOpacity={0.1} />
                      <stop offset="100%" stopColor="rgb(20,20,20)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid
                    strokeDasharray="3 3"
                    vertical={false}
                    stroke="rgba(0,0,0,0.05)"
                  />
                  <XAxis
                    dataKey="day"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "rgba(0,0,0,0.5)" }}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 11, fill: "rgba(0,0,0,0.5)" }}
                    width={32}
                  />
                  <Tooltip
                    contentStyle={{
                      borderRadius: 12,
                      border: "1px solid rgba(0,0,0,0.06)",
                      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
                      fontSize: 12,
                      padding: "8px 12px",
                    }}
                    cursor={{ stroke: "rgba(0,0,0,0.1)", strokeDasharray: "3 3" }}
                  />
                  <Area
                    type="monotone"
                    dataKey="queries"
                    stroke="rgb(220,38,38)"
                    strokeWidth={2}
                    fill="url(#g1)"
                  />
                  <Area
                    type="monotone"
                    dataKey="docs"
                    stroke="rgb(20,20,20)"
                    strokeWidth={2}
                    fill="url(#g2)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Usage / quota */}
          <Card className="p-7 flex flex-col">
            <div>
              <p className="text-sm text-muted-foreground">Plan</p>
              <div className="flex items-baseline gap-2 mt-1">
                <h3 className="font-display text-2xl font-medium tracking-tight">
                  {isPro ? "Pro Tier" : "Starter (Free)"}
                </h3>
                <Badge variant={isPro ? "soft" : "outline"} className="rounded-full">
                  {isPro ? (
                    <>
                      <Sparkles className="h-2.5 w-2.5 mr-1 text-primary" />
                      Active
                    </>
                  ) : (
                    "Limited"
                  )}
                </Badge>
              </div>
            </div>

            <div className="mt-6 space-y-5 flex-1">
              <QuotaRow 
                label="Pages indexed" 
                value={documents.reduce((acc, d) => acc + Math.max(1, Math.floor(d.file_size / 35000)), 0)} 
                max={isPro ? 10000 : 100} 
              />
              <QuotaRow 
                label="Queries" 
                value={queryCount} 
                max={isPro ? 5000 : 15} 
              />
              <QuotaRow 
                label="Storage size" 
                value={Number((documents.reduce((acc, d) => acc + d.file_size, 0) / (1024 * 1024)).toFixed(1))} 
                max={isPro ? 500 : 50} 
                unit=" MB"
              />
            </div>

            <div className="mt-6 pt-6 border-t border-border/60">
              <p className="text-xs text-muted-foreground">
                {isPro ? (
                  <>
                    Subscription: <span className="text-foreground font-medium">Stripe Active</span>
                  </>
                ) : (
                  <>
                    Usage: <span className="text-foreground font-medium">{queryCount} / 15 free queries</span>
                  </>
                )}
              </p>
              <Button variant="outline" size="sm" className="w-full mt-3" asChild>
                <Link href="/pricing">
                  {isPro ? "Manage Subscription" : "Upgrade to Pro"}
                  <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
                </Link>
              </Button>
            </div>
          </Card>

          {/* Recent documents */}
          <Card className="lg:col-span-2 p-7">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="font-display text-2xl font-medium tracking-tight">
                  Recent documents
                </h2>
                <p className="text-sm text-muted-foreground mt-0.5">
                  Last touched files across your workspace
                </p>
              </div>
              <Button variant="ghost" size="sm">
                <Filter className="h-3.5 w-3.5 mr-1" />
                Filter
              </Button>
            </div>

            <div className="space-y-1">
              {loadingDocs ? (
                <div className="flex items-center justify-center py-12 text-muted-foreground">
                  <Loader2 className="h-5 w-5 animate-spin mr-2" />
                  Loading workspace...
                </div>
              ) : documents.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 px-4 text-center rounded-2xl border border-dashed border-border/60 bg-secondary/10">
                  <div className="h-10 w-10 rounded-2xl bg-secondary flex items-center justify-center text-muted-foreground mb-4">
                    <Upload className="h-5 w-5" />
                  </div>
                  <p className="text-sm font-medium">No documents uploaded yet</p>
                  <p className="text-xs text-muted-foreground mt-1 max-w-[240px] mx-auto leading-relaxed">
                    Upload your research papers, financial reports, or agreements to get started.
                  </p>
                  <Button size="sm" variant="outline" className="mt-4" asChild>
                    <Link href="/upload">Upload PDF</Link>
                  </Button>
                </div>
              ) : (
                documents.map((doc) => {
                  const calculatedPages = Math.max(1, Math.floor(doc.file_size / 35000));
                  const fileType = doc.file_name.split(".").pop()?.toUpperCase() || "PDF";
                  return (
                    <div
                      key={doc.id}
                      className="flex items-center gap-4 py-3.5 px-2 -mx-2 rounded-xl hover:bg-secondary/60 transition-colors cursor-pointer group"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-secondary border border-border/40">
                        <FileText
                          className="h-4 w-4 text-primary"
                          strokeWidth={1.8}
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{doc.file_name}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {fileType} · {calculatedPages} pages · {formatSize(doc.file_size)}
                        </p>
                      </div>
                      <div className="hidden sm:flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{formatTimeAgo(doc.created_at)}</span>
                        <Badge
                          variant="outline"
                          className="rounded-full font-normal text-[10.5px] gap-1"
                        >
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                          Indexed
                        </Badge>
                      </div>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(doc.id, doc.storage_path);
                        }}
                        className="h-8 w-8 rounded-full hover:bg-red-50 hover:text-red-600 flex items-center justify-center text-muted-foreground opacity-0 group-hover:opacity-100 transition-all duration-200"
                        title="Delete Document"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          {/* Recent queries */}
          <Card className="p-7">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                Recent asks
              </h2>
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div className="space-y-4">
              {recentQueries.map((item, i) => (
                <div key={i} className="group">
                  <p className="text-sm font-medium leading-relaxed group-hover:text-primary transition-colors cursor-pointer">
                    {item.q}
                  </p>
                  <div className="flex items-center justify-between mt-1.5">
                    <p className="text-xs text-muted-foreground truncate max-w-[180px]">
                      {item.doc}
                    </p>
                    <span className="text-xs text-muted-foreground">
                      {item.time}
                    </span>
                  </div>
                  {i < recentQueries.length - 1 && (
                    <div className="border-b border-border/60 mt-4" />
                  )}
                </div>
              ))}
            </div>
            <Button variant="ghost" size="sm" className="w-full mt-6 -mb-2">
              View all queries
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </Card>
        </div>
      </main>
    </>
  );
}

function StatCard({
  label,
  value,
  change,
  icon: Icon,
  trend,
  accent = false,
}: {
  label: string;
  value: string;
  change: string;
  icon: any;
  trend: "up" | "down";
  accent?: boolean;
}) {
  return (
    <Card
      className={`p-6 ${
        accent
          ? "bg-foreground text-background border-foreground shadow-apple-md"
          : ""
      }`}
    >
      <div className="flex items-start justify-between">
        <div>
          <p
            className={`text-xs uppercase tracking-wider font-medium ${
              accent ? "text-background/60" : "text-muted-foreground"
            }`}
          >
            {label}
          </p>
          <p className="font-display text-4xl font-medium tracking-tight mt-3">
            {value}
          </p>
        </div>
        <div
          className={`flex h-9 w-9 items-center justify-center rounded-xl ${
            accent
              ? "bg-background/10 text-background"
              : "bg-secondary text-foreground"
          }`}
        >
          <Icon className="h-4 w-4" strokeWidth={1.8} />
        </div>
      </div>
      <div className="flex items-center gap-1 mt-3">
        <TrendingUp
          className={`h-3 w-3 ${
            accent ? "text-background/70" : "text-primary"
          }`}
        />
        <span
          className={`text-xs font-medium ${
            accent ? "text-background/70" : "text-primary"
          }`}
        >
          {change}
        </span>
        <span
          className={`text-xs ${
            accent ? "text-background/50" : "text-muted-foreground"
          }`}
        >
          vs last week
        </span>
      </div>
    </Card>
  );
}

function QuotaRow({
  label,
  value,
  max,
  unit,
}: {
  label: string;
  value: number;
  max: number;
  unit?: string;
}) {
  const pct = (value / max) * 100;
  return (
    <div>
      <div className="flex justify-between items-baseline mb-2">
        <span className="text-sm font-medium">{label}</span>
        <span className="text-xs text-muted-foreground font-mono">
          {value.toLocaleString()}
          {unit ? unit : ""} /{" "}
          <span className="text-foreground">
            {max.toLocaleString()}
            {unit ? unit : ""}
          </span>
        </span>
      </div>
      <Progress value={pct} className="h-1" />
    </div>
  );
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}

function formatTimeAgo(dateString: string) {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "Just now";
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays === 1) return "Yesterday";
  return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
}
