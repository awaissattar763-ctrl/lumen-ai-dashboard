"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Upload,
  FileText,
  X,
  Check,
  Sparkles,
  Lock,
  Zap,
  FileCheck2,
  ArrowRight,
  Cloud,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { createClient } from "@/lib/supabase/client";
import { saveDocumentMetadata, processDocumentTextAction } from "@/lib/supabase/actions";
import { User } from "@supabase/supabase-js";
import { motion, AnimatePresence } from "framer-motion";

type FileState = {
  id: string;
  name: string;
  size: number;
  progress: number;
  status: "uploading" | "indexing" | "done" | "error";
  pages?: number;
  errorMessage?: string;
};

export default function UploadPage() {
  const [files, setFiles] = useState<FileState[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [toast, setToast] = useState<{ message: string; type: "success" | "error" | "info" } | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const supabase = createClient();

  // Auto-dismiss toast after 4 seconds
  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => {
        setToast(null);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch the authenticated user on mount to secure uploads
  useEffect(() => {
    async function getSessionUser() {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (err) {
        console.error("Failed to load user session for uploads:", err);
      }
    }
    getSessionUser();
  }, [supabase]);

  const handleFiles = useCallback(async (selected: FileList | null) => {
    if (!selected || selected.length === 0) return;
    if (!user) {
      setToast({ message: "You must be authenticated to upload files.", type: "error" });
      return;
    }

    const filesArray = Array.from(selected);

    // Initial state: set all selected files as uploading with 0% progress
    const newFilesState: FileState[] = filesArray.map((f) => {
      const id = crypto.randomUUID();
      return {
        id,
        name: f.name,
        size: f.size,
        progress: 0,
        status: "uploading",
      };
    });

    setFiles((prev) => [...newFilesState, ...prev]);

    // Process each file upload in parallel
    filesArray.forEach((file, index) => {
      const fileState = newFilesState[index];
      uploadFileToSupabase(file, fileState.id);
    });
  }, [user, supabase]);

  const uploadFileToSupabase = async (file: File, fileId: string) => {
    if (!user) return;

    // Secure, user-isolated path inside 'documents' storage bucket
    const fileExt = file.name.split(".").pop();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9]/g, "_");
    const uniqueFileName = `${crypto.randomUUID()}.${fileExt}`;
    const storagePath = `${user.id}/${uniqueFileName}`;

    setToast({ message: `Uploading ${file.name} to Lumen Storage...`, type: "info" });

    try {
      // 1. Upload directly to Supabase Storage with progress updates
      const { data: storageData, error: storageError } = await supabase.storage
        .from("documents")
        .upload(storagePath, file, {
          cacheControl: "3600",
          upsert: false,
          onUploadProgress: (progress: any) => {
            const percentage = (progress.loaded / progress.total) * 100;
            setFiles((prev) =>
              prev.map((f) =>
                f.id === fileId
                  ? {
                      ...f,
                      progress: Math.min(99, Math.round(percentage)),
                      status: "uploading",
                    }
                  : f
              )
            );
          },
        } as any);

      if (storageError) {
        throw new Error(storageError.message || "Failed to upload file to storage.");
      }

      // 2. Save file metadata to PostgreSQL 'documents' table via Server Action
      const dbResult = await saveDocumentMetadata({
        file_name: file.name,
        file_size: file.size,
        storage_path: storagePath,
      });

      if (dbResult && dbResult.error) {
        throw new Error(dbResult.error);
      }

      const dbDocument = dbResult.data;

      // 3. Transition to Indexing & Embedding state
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                progress: 100,
                status: "indexing",
              }
            : f
        )
      );
      setToast({ message: `Parsing and embedding ${file.name}...`, type: "info" });

      // 4. Parse text & partition chunks in database via Server Action
      const parseResult = await processDocumentTextAction(dbDocument.id, storagePath) as any;

      if (parseResult && parseResult.error) {
        throw new Error(parseResult.error);
      }

      // 5. Mark file as completely uploaded & indexed
      const calculatedPages = Math.max(1, Math.floor(file.size / 35000));
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "done",
                pages: calculatedPages,
              }
            : f
        )
      );
      setToast({ message: `${file.name} successfully indexed & ready!`, type: "success" });
    } catch (err: any) {
      console.error(`Upload error for file ${file.name}:`, err);
      setFiles((prev) =>
        prev.map((f) =>
          f.id === fileId
            ? {
                ...f,
                status: "error",
                errorMessage: err.message || "An unexpected error occurred.",
              }
            : f
        )
      );
      setToast({ message: `Failed to index ${file.name}: ${err.message || 'Error'}`, type: "error" });
    }
  };

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragActive(false);
      handleFiles(e.dataTransfer.files);
    },
    [handleFiles]
  );

  const removeFile = (id: string) => {
    setFiles((prev) => prev.filter((f) => f.id !== id));
  };

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-center mb-12">
          <Badge variant="soft" className="rounded-full">
            <Sparkles className="h-3 w-3 mr-1 text-primary" />
            New document
          </Badge>
          <h1 className="mt-4 font-display text-6xl font-medium tracking-tight">
            Upload<span className="text-primary">.</span>
          </h1>
          <p className="mt-4 text-lg text-muted-foreground max-w-md mx-auto">
            Drop a PDF. We'll index it, embed it, and have it ready to answer
            questions in seconds.
          </p>
        </div>

        {/* Drop zone with smooth drag scale animation */}
        <motion.div
          animate={{ scale: dragActive ? 1.015 : 1 }}
          transition={{ type: "spring", stiffness: 350, damping: 22 }}
          className="w-full"
        >
          <Card
            onDragOver={(e) => {
              e.preventDefault();
              setDragActive(true);
            }}
            onDragLeave={() => setDragActive(false)}
            onDrop={onDrop}
            onClick={() => inputRef.current?.click()}
            className={cn(
              "relative p-12 md:p-20 cursor-pointer transition-all duration-300 group overflow-hidden",
              dragActive
                ? "border-primary bg-primary/[0.03] shadow-red-glow"
                : "border-dashed border-2 border-border hover:border-primary/40 hover:bg-secondary/30"
            )}
          >
          {/* Decorative grid */}
          <div className="absolute inset-0 grid-bg opacity-40 [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)]" />

          <input
            ref={inputRef}
            type="file"
            multiple
            accept=".pdf,.docx,.txt,.md"
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />

          <div className="relative flex flex-col items-center text-center">
            {/* Animated icon stack */}
            <div className="relative h-24 w-24 mb-6">
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl border border-border bg-white shadow-apple transition-all duration-500 -rotate-6",
                  dragActive && "rotate-3 translate-x-2 -translate-y-1"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl border border-border bg-white shadow-apple transition-all duration-500 rotate-3",
                  dragActive && "-rotate-6 -translate-x-2 translate-y-1"
                )}
              />
              <div
                className={cn(
                  "absolute inset-0 rounded-3xl bg-foreground text-background flex items-center justify-center shadow-apple-md transition-all duration-500",
                  dragActive && "scale-110 bg-primary"
                )}
              >
                {dragActive ? (
                  <Cloud className="h-9 w-9" strokeWidth={1.5} />
                ) : (
                  <Upload className="h-9 w-9" strokeWidth={1.5} />
                )}
              </div>
            </div>

            <h3 className="font-display text-3xl font-medium tracking-tight">
              {dragActive ? "Drop it like it's hot" : "Drag your files here"}
            </h3>
            <p className="mt-2 text-muted-foreground">
              or click to browse — PDF, DOCX, TXT up to 50MB
            </p>

            <Button size="lg" className="mt-7 pointer-events-none">
              <Upload className="h-4 w-4 mr-1.5" />
              Choose files
            </Button>

            <div className="mt-8 flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-xs text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <Lock className="h-3 w-3" />
                Encrypted in transit
              </span>
              <span className="flex items-center gap-1.5">
                <Zap className="h-3 w-3" />
                Indexed in seconds
              </span>
              <span className="flex items-center gap-1.5">
                <FileCheck2 className="h-3 w-3" />
                SOC 2 compliant
              </span>
            </div>
          </div>
        </Card>
      </motion.div>

        {/* File list */}
        {files.length > 0 && (
          <div className="mt-10">
            <div className="flex items-center justify-between mb-5">
              <h2 className="font-display text-2xl font-medium tracking-tight">
                In this session
              </h2>
              <p className="text-sm text-muted-foreground">
                {files.length} file{files.length !== 1 ? "s" : ""}
              </p>
            </div>

            <div className="space-y-2.5">
              {files.map((file) => (
                <FileRow key={file.id} file={file} onRemove={removeFile} />
              ))}
            </div>

            {files.some((f) => f.status === "done") && (
              <div className="mt-8 flex justify-end">
                <Button size="lg" asChild>
                  <a href="/dashboard">
                    Open workspace
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </a>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Tips strip */}
        <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              icon: Sparkles,
              title: "Smart OCR",
              body: "Scanned PDFs are recognized automatically.",
            },
            {
              icon: FileText,
              title: "Multi-doc context",
              body: "Ask questions across all your uploads at once.",
            },
            {
              icon: Lock,
              title: "Yours alone",
              body: "We never train on what you upload. Period.",
            },
          ].map((tip) => (
            <Card key={tip.title} className="p-5 flex items-start gap-4">
              <div className="h-9 w-9 shrink-0 rounded-xl bg-accent text-accent-foreground flex items-center justify-center">
                <tip.icon className="h-4 w-4" strokeWidth={1.8} />
              </div>
              <div>
                <p className="font-medium text-sm">{tip.title}</p>
                <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                  {tip.body}
                </p>
              </div>
            </Card>
          ))}
        </div>

        {/* Floating Toast Notification Bar */}
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -20, scale: 0.95 }}
              transition={{ duration: 0.25 }}
              className="fixed top-20 right-6 z-50 flex items-center gap-3 px-4.5 py-3 rounded-2xl border bg-card/85 backdrop-blur-md shadow-apple-lg animate-fade-in"
              style={{
                borderColor: 
                  toast.type === "success" 
                    ? "rgba(16, 185, 129, 0.4)" 
                    : toast.type === "error" 
                    ? "rgba(239, 68, 68, 0.4)" 
                    : "rgba(220, 38, 38, 0.25)"
              }}
            >
              <div 
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center shrink-0 text-white font-semibold text-xs",
                  toast.type === "success" 
                    ? "bg-emerald-500" 
                    : toast.type === "error" 
                    ? "bg-red-500" 
                    : "bg-primary"
                )}
              >
                {toast.type === "success" ? (
                  <Check className="h-4 w-4" />
                ) : toast.type === "error" ? (
                  <X className="h-4 w-4" />
                ) : (
                  <Sparkles className="h-4 w-4" />
                )}
              </div>
              <div className="flex-1 min-w-[200px]">
                <p className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                  {toast.type === "success" 
                    ? "System Verified" 
                    : toast.type === "error" 
                    ? "System Error" 
                    : "Workspace Indexing"}
                </p>
                <p className="text-xs text-foreground font-medium mt-0.5 leading-snug">
                  {toast.message}
                </p>
              </div>
              <button 
                onClick={() => setToast(null)} 
                className="text-muted-foreground hover:text-foreground p-1 hover:bg-secondary rounded-full shrink-0 transition-colors"
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </main>
    </>
  );
}

function FileRow({
  file,
  onRemove,
}: {
  file: FileState;
  onRemove: (id: string) => void;
}) {
  return (
    <Card className="p-4 flex items-center gap-4 transition-all hover:shadow-apple-md group">
      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-secondary border border-border/40 relative overflow-hidden">
        <FileText
          className={cn(
            "h-5 w-5 transition-colors",
            file.status === "done" ? "text-primary" : "text-muted-foreground"
          )}
          strokeWidth={1.8}
        />
        {file.status === "uploading" && (
          <div className="absolute inset-0 shimmer-bg animate-shimmer" />
        )}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-sm font-medium truncate">{file.name}</p>
          {file.status === "done" && file.pages && (
            <Badge variant="outline" className="rounded-full font-normal text-[10.5px] h-5 px-2 shrink-0">
              {file.pages} pages
            </Badge>
          )}
        </div>
        <div className="flex items-center gap-3 mt-1.5">
          <p className="text-xs text-muted-foreground">
            {formatSize(file.size)}
          </p>
          <span className="text-xs text-muted-foreground">·</span>
          <StatusLabel status={file.status} progress={file.progress} errorMessage={file.errorMessage} />
        </div>
        {file.status !== "done" && file.status !== "error" && (
          <Progress
            value={
              file.status === "uploading"
                ? file.progress
                : file.status === "indexing"
                ? 75
                : 0
            }
            className="h-1 mt-2.5"
          />
        )}
      </div>

      <div className="flex items-center gap-2">
        {file.status === "done" ? (
          <div className="h-8 w-8 rounded-full bg-primary/10 text-primary flex items-center justify-center">
            <Check className="h-4 w-4" strokeWidth={2.5} />
          </div>
        ) : file.status === "error" ? (
          <div className="h-8 w-8 rounded-full bg-red-100 text-red-600 flex items-center justify-center font-bold text-xs">
            !
          </div>
        ) : (
          <div className="h-8 w-8 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
        )}
        <button
          onClick={() => onRemove(file.id)}
          className="h-8 w-8 rounded-full hover:bg-secondary flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors opacity-0 group-hover:opacity-100"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Card>
  );
}

function StatusLabel({
  status,
  progress,
  errorMessage,
}: {
  status: FileState["status"];
  progress: number;
  errorMessage?: string;
}) {
  const label =
    status === "uploading"
      ? `Uploading ${Math.round(progress)}%`
      : status === "indexing"
      ? "Indexing & embedding..."
      : status === "done"
      ? "Ready"
      : errorMessage || "Error uploading file";

  const color =
    status === "done"
      ? "text-emerald-600"
      : status === "error"
      ? "text-red-600"
      : "text-primary";

  return <span className={cn("text-xs font-medium truncate max-w-md block", color)}>{label}</span>;
}

function formatSize(bytes: number) {
  if (bytes < 1024) return bytes + " B";
  if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
  return (bytes / (1024 * 1024)).toFixed(1) + " MB";
}
