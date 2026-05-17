"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import React, { useEffect, useState, useRef, useCallback, memo, Suspense } from "react";
import { createClient } from "@/lib/supabase/client";
import { User } from "@supabase/supabase-js";
import { Navbar } from "@/components/navbar";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  getUserChats,
  getChatMessages,
  createChat,
  deleteChat,
  renameChat,
  deleteUserDocument,
} from "@/lib/supabase/actions";
import { DbDocument } from "@/lib/supabase/types";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  Lock,
  Send,
  FileText,
  Brain,
  Sparkles,
  Plus,
  Trash2,
  Loader2,
  Bot,
  User as UserIcon,
  CheckSquare,
  Square,
  ChevronRight,
  Bookmark,
  Edit2,
  Menu,
  X,
  Files,
  MessageSquare,
} from "lucide-react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";

type Message = {
  id?: string;
  role: "user" | "assistant";
  content: string;
  references?: Array<{
    document_id: string;
    file_name: string;
    chunk_index: number;
    snippet: string;
  }>;
};

type ChatSession = {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
};

/* ==========================================================================
   SHIMMER SKELETONS FOR APPLE-STYLE FLUID LOADING UX
   ========================================================================== */

const DocumentListSkeleton = () => (
  <div className="space-y-2.5 animate-pulse">
    {[1, 2, 3, 4].map((i) => (
      <div
        key={i}
        className="flex items-center gap-3 p-2.5 rounded-xl border border-border/10 bg-secondary/15 h-[46px] w-full"
      >
        <div className="h-4.5 w-4.5 rounded bg-muted-foreground/10 shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="h-3 rounded bg-muted-foreground/10 w-3/4" />
          <div className="h-2 rounded bg-muted-foreground/10 w-1/3" />
        </div>
      </div>
    ))}
  </div>
);

const ChatHistorySkeleton = () => (
  <div className="space-y-2 animate-pulse mt-2 pr-1">
    {[1, 2, 3].map((i) => (
      <div
        key={i}
        className="h-8.5 rounded-xl bg-secondary/15 border border-border/10 w-full"
      />
    ))}
  </div>
);

const MessagesSkeleton = () => (
  <div className="space-y-5 animate-pulse">
    {[1, 2, 3].map((i) => {
      const isEven = i % 2 === 0;
      return (
        <div
          key={i}
          className={cn(
            "flex gap-4 max-w-2xl",
            isEven ? "ml-auto flex-row-reverse" : "mr-auto"
          )}
        >
          <div className="h-8 w-8 rounded-full bg-secondary/35 shrink-0" />
          <div className="space-y-1.5 flex-1 min-w-0">
            <div
              className={cn(
                "h-14 rounded-2xl bg-secondary/25 border border-border/10 w-64",
                isEven ? "rounded-tr-sm" : "rounded-tl-sm"
              )}
            />
          </div>
        </div>
      );
    })}
  </div>
);

/* ==========================================================================
   MEMOIZED GROUNDING CONTEXT FILE CHECKLIST
   ========================================================================== */

const DocumentList = memo(({
  documents,
  selectedDocIds,
  toggleDocSelection,
  handleDeleteDoc,
  loading
}: {
  documents: DbDocument[];
  selectedDocIds: string[];
  toggleDocSelection: (id: string) => void;
  handleDeleteDoc: (id: string, storagePath: string, e: React.MouseEvent) => void;
  loading: boolean;
}) => {
  if (loading) {
    return <DocumentListSkeleton />;
  }

  if (documents.length === 0) {
    return (
      <div className="text-center py-8 text-xs text-muted-foreground border border-dashed border-border/50 rounded-xl bg-secondary/20 animate-fade-in">
        <FileText className="h-5 w-5 mx-auto mb-2 opacity-40" />
        No files in workspace.<br />
        <Link href="/upload" className="text-primary hover:underline mt-1 block">
          Upload PDF
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-2 max-h-[44vh] overflow-y-auto scrollbar-hide pr-1">
      {documents.map((doc) => {
        const isSelected = selectedDocIds.includes(doc.id);
        return (
          <div
            key={doc.id}
            onClick={() => toggleDocSelection(doc.id)}
            className={cn(
              "group flex items-center justify-between p-2.5 rounded-xl cursor-pointer transition-all border animate-fade-in",
              isSelected
                ? "bg-primary/[0.03] border-primary/20 hover:bg-primary/[0.05]"
                : "border-transparent hover:bg-secondary/40"
            )}
          >
            <div className="flex items-center gap-3 min-w-0 flex-1">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  toggleDocSelection(doc.id);
                }}
                className="text-primary shrink-0 transition-transform active:scale-90"
              >
                {isSelected ? (
                  <CheckSquare className="h-4.5 w-4.5 text-primary" />
                ) : (
                  <Square className="h-4.5 w-4.5 text-muted-foreground/60" />
                )}
              </button>
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate leading-tight">
                  {doc.file_name}
                </p>
                <p className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                  {Math.max(1, Math.floor(doc.file_size / 35000))} pages
                </p>
              </div>
            </div>
            <button
              onClick={(e) => handleDeleteDoc(doc.id, doc.storage_path, e)}
              className="text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-red-50 rounded-full shrink-0"
              title="Delete document"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
});

DocumentList.displayName = "DocumentList";

/* ==========================================================================
   MEMOIZED SIDEBAR CONVERSATIONS LIST
   ========================================================================== */

const ChatHistory = memo(({
  chats,
  activeChatId,
  setActiveChatId,
  handleDeleteChat,
  handleRenameChat,
  loading
}: {
  chats: ChatSession[];
  activeChatId: string | null;
  setActiveChatId: (id: string) => void;
  handleDeleteChat: (id: string, e: React.MouseEvent) => void;
  handleRenameChat: (id: string, newTitle: string) => Promise<void>;
  loading: boolean;
}) => {
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startRename = (id: string, currentTitle: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingId(id);
    setEditTitle(currentTitle);
  };

  const submitRename = async (id: string, e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (editTitle.trim()) {
      await handleRenameChat(id, editTitle.trim());
    }
    setEditingId(null);
  };

  if (loading) {
    return <ChatHistorySkeleton />;
  }

  return (
    <div className="flex-1 space-y-1 overflow-y-auto scrollbar-hide pr-1 mt-2">
      {chats.map((c) => {
        const isActive = c.id === activeChatId;
        const isEditing = c.id === editingId;

        return (
          <div
            key={c.id}
            onClick={() => !isEditing && setActiveChatId(c.id)}
            className={cn(
              "group flex items-center justify-between p-2 rounded-xl cursor-pointer transition-all border animate-fade-in",
              isActive
                ? "bg-white border-border text-foreground shadow-apple"
                : "border-transparent text-muted-foreground hover:bg-secondary/40 hover:text-foreground"
            )}
          >
            <div className="flex items-center gap-2 min-w-0 flex-1">
              <ChevronRight
                className={cn(
                  "h-3 w-3 shrink-0 text-muted-foreground",
                  isActive && "text-primary"
                )}
              />
              {isEditing ? (
                <form
                  onSubmit={(e) => submitRename(c.id, e)}
                  onClick={(e) => e.stopPropagation()}
                  className="flex-1"
                >
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => submitRename(c.id)}
                    className="w-full text-xs bg-transparent border-b border-primary/50 focus:outline-none py-0.5 text-foreground font-medium"
                    autoFocus
                  />
                </form>
              ) : (
                <p className="text-xs font-medium truncate leading-normal">
                  {c.title}
                </p>
              )}
            </div>
            {!isEditing && (
              <div className="flex items-center gap-1 shrink-0">
                <button
                  onClick={(e) => startRename(c.id, c.title, e)}
                  className="text-muted-foreground hover:text-foreground opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-secondary rounded-full"
                  title="Rename thread"
                >
                  <Edit2 className="h-3 w-3" />
                </button>
                <button
                  onClick={(e) => handleDeleteChat(c.id, e)}
                  className="text-muted-foreground hover:text-red-600 opacity-0 group-hover:opacity-100 transition-opacity p-0.5 hover:bg-red-50 rounded-full"
                  title="Delete thread"
                >
                  <Trash2 className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
});

ChatHistory.displayName = "ChatHistory";

/* ==========================================================================
   MEMOIZED CONVERSATIONAL CHAT MESSAGE ITEM
   ========================================================================== */

const MessageItem = memo(({ 
  msg, 
  onCitationClick 
}: { 
  msg: Message; 
  onCitationClick: (ref: any) => void;
}) => {
  const isAssistant = msg.role === "assistant";
  return (
    <div
      className={cn(
        "flex gap-4 max-w-3xl animate-fade-in",
        isAssistant ? "mr-auto" : "ml-auto flex-row-reverse"
      )}
    >
      {/* Profile Avatar */}
      <div
        className={cn(
          "h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 border shadow-apple",
          isAssistant
            ? "bg-primary/10 border-primary/20 text-primary"
            : "bg-secondary border-border/60 text-muted-foreground"
        )}
      >
        {isAssistant ? <Bot className="h-4 w-4" /> : <UserIcon className="h-4 w-4" />}
      </div>

      {/* Chat Bubble Body */}
      <div className="space-y-1.5 flex-1 min-w-0">
        <div
          className={cn(
            "px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-apple border prose prose-sm dark:prose-invert max-w-none",
            isAssistant
              ? "bg-white border-border text-foreground rounded-tl-sm"
              : "bg-foreground border-transparent text-background rounded-tr-sm"
          )}
        >
          <ReactMarkdown 
            remarkPlugins={[remarkGfm]}
            components={{
              p: ({ children }) => <p className="mb-2 last:mb-0 leading-relaxed">{children}</p>,
              ul: ({ children }) => <ul className="list-disc pl-4 mb-2 space-y-1">{children}</ul>,
              ol: ({ children }) => <ol className="list-decimal pl-4 mb-2 space-y-1">{children}</ol>,
              li: ({ children }) => <li className="text-xs sm:text-sm leading-relaxed">{children}</li>,
              code: ({ node, inline, className, children, ...props }: any) => {
                const codeString = String(children).replace(/\n$/, "");
                const [copied, setCopied] = useState(false);
                
                const handleCopy = () => {
                  navigator.clipboard.writeText(codeString);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                };

                if (inline) {
                  return (
                    <code 
                      className="px-1.5 py-0.5 rounded bg-secondary/80 font-mono text-[11.5px] text-primary"
                      {...props}
                    >
                      {children}
                    </code>
                  );
                }

                return (
                  <div className="relative group/code my-3 rounded-xl overflow-hidden border border-border/50 bg-secondary/35">
                    <div className="flex items-center justify-between px-3.5 py-2 bg-secondary/60 border-b border-border/40 text-[10px] text-muted-foreground font-mono">
                      <span>{className?.replace("language-", "") || "code"}</span>
                      <button
                        onClick={handleCopy}
                        className="flex items-center gap-1 hover:text-foreground transition-colors py-0.5 px-1.5 rounded hover:bg-secondary shrink-0"
                      >
                        {copied ? (
                          <>
                            <Check className="h-2.5 w-2.5 text-emerald-600 font-bold" />
                            <span className="text-[10px] text-emerald-600 font-medium">Copied!</span>
                          </>
                        ) : (
                          <>
                            <Bookmark className="h-2.5 w-2.5" />
                            <span className="text-[10px]">Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                    <pre className="p-3.5 overflow-x-auto font-mono text-xs text-foreground leading-normal scrollbar-hide">
                      <code className={className} {...props}>
                        {children}
                      </code>
                    </pre>
                  </div>
                );
              },
              a: ({ href, children }) => (
                <a href={href} target="_blank" rel="noopener noreferrer" className="text-primary underline hover:text-primary/80">
                  {children}
                </a>
              ),
              table: ({ children }) => (
                <div className="overflow-x-auto my-3 border border-border/60 rounded-xl bg-secondary/15">
                  <table className="min-w-full divide-y divide-border/60 text-xs">{children}</table>
                </div>
              ),
              thead: ({ children }) => <thead className="bg-secondary/40">{children}</thead>,
              tbody: ({ children }) => <tbody className="divide-y divide-border/40 bg-transparent">{children}</tbody>,
              tr: ({ children }) => <tr>{children}</tr>,
              th: ({ children }) => <th className="px-3 py-1.5 text-left font-medium text-muted-foreground">{children}</th>,
              td: ({ children }) => <td className="px-3 py-1.5 text-foreground font-mono">{children}</td>,
            }}
          >
            {msg.content}
          </ReactMarkdown>
        </div>

        {/* Citations references drawer */}
        {isAssistant && msg.references && msg.references.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-1">
            {msg.references.map((ref, rIdx) => (
              <Badge
                key={rIdx}
                variant="outline"
                onClick={() => onCitationClick(ref)}
                className="rounded-full text-[9px] font-normal cursor-pointer gap-1 border-primary/20 text-primary bg-primary/[0.01] hover:bg-primary/[0.03] transition-colors py-0.5 px-2"
                title="Click to view full reference"
              >
                <Bookmark className="h-2.5 w-2.5" />
                {ref.file_name}
              </Badge>
            ))}
          </div>
        )}
      </div>
    </div>
  );
});

MessageItem.displayName = "MessageItem";

/* ==========================================================================
   MAIN HIGH-PERFORMANCE WORKSPACE CHAT CONTEXT
   ========================================================================== */

function WorkspaceChatContent() {
  const searchParams = useSearchParams();
  const targetDocId = searchParams?.get("docId");

  const [user, setUser] = useState<User | null>(null);
  const [documents, setDocuments] = useState<DbDocument[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const [chats, setChats] = useState<ChatSession[]>([]);
  const [activeChatId, setActiveChatId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState("");
  const [loadingChats, setLoadingChats] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);
  const [streamingText, setStreamingText] = useState("");
  
  // Custom states for citation drawer & responsive mobile sidebars
  const [selectedCitation, setSelectedCitation] = useState<{
    file_name: string;
    chunk_index: number;
    snippet: string;
  } | null>(null);
  const [showSourcesMobile, setShowSourcesMobile] = useState(false);
  const [showHistoryMobile, setShowHistoryMobile] = useState(false);

  // Advanced SaaS Integrations
  const [provider, setProvider] = useState<'groq' | 'openai'>('groq');
  const [model, setModel] = useState<string>('llama-3.3-70b-versatile');
  const [searchType, setSearchType] = useState<'fts' | 'vector'>('fts');

  const [showUpgradeModal, setShowUpgradeModal] = useState(false);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);
  const [onboardingData, setOnboardingData] = useState({ name: "", workspace: "Core Analytics Workspace" });
  const [stripeLoading, setStripeLoading] = useState(false);
  
  const [supabase] = useState(() => createClient());
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const activeChatIdRef = useRef<string | null>(null);

  useEffect(() => {
    activeChatIdRef.current = activeChatId;
  }, [activeChatId]);

  // 1. Parallel loading context pipeline to eliminate sequential waterfalls
  useEffect(() => {
    async function initWorkspace() {
      try {
        setLoadingChats(true);
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        setUser(currentUser);

        if (currentUser) {
          // Check onboarding completed state
          const onboardingDone = localStorage.getItem("lumen_onboarding_completed");
          if (!onboardingDone) {
            setShowOnboarding(true);
          }

          // Perform parallelized fetches for documents and chat lists
          const [docsRes, chatsRes] = await Promise.all([
            supabase
              .from("documents")
              .select("id, file_name, file_size, storage_path, created_at")
              .order("created_at", { ascending: false }),
            supabase
              .from("chats")
              .select("*")
              .order("updated_at", { ascending: false })
          ]);

          const loadedDocs = (docsRes.data as DbDocument[]) || [];
          setDocuments(loadedDocs);

          const sortedChats = (chatsRes.data as ChatSession[]) || [];
          setChats(sortedChats);

          if (sortedChats.length > 0) {
            let nextActiveId = sortedChats[0].id;
            
            // Smart Workspace Resume: Try to find a chat thread that already has this document selected
            if (targetDocId) {
              for (const chat of sortedChats) {
                const saved = localStorage.getItem(`lumen_chat_docs_${chat.id}`);
                if (saved && saved.includes(targetDocId)) {
                  nextActiveId = chat.id;
                  break;
                }
              }
            }
            
            setActiveChatId(nextActiveId);
          } else {
            // Auto create General Analysis chat thread if empty
            const { data: newChat } = await supabase
              .from("chats")
              .insert({ title: "General Analysis", user_id: currentUser.id })
              .select()
              .single();
            
            if (newChat) {
              setChats([newChat as ChatSession]);
              setActiveChatId(newChat.id);
            }
          }
        }
      } catch (err) {
        console.error("Failed loading chat workspace:", err);
      } finally {
        setLoadingChats(false);
      }
    }

    initWorkspace();
  }, [supabase]);

  // Handle per-chat document selection & smart targeting
  useEffect(() => {
    if (!activeChatId || documents.length === 0) return;

    // If smart resume via URL param
    if (targetDocId && documents.some(d => d.id === targetDocId)) {
      setSelectedDocIds([targetDocId]);
      // Remove it from URL so we don't lock the user into it on reload
      window.history.replaceState(null, '', '/dashboard/chat');
      return;
    }

    // Load chat-specific selection from persistent storage
    const savedIds = localStorage.getItem(`lumen_chat_docs_${activeChatId}`);
    if (savedIds) {
      try {
        const parsed = JSON.parse(savedIds);
        if (Array.isArray(parsed) && parsed.length > 0) {
          const validIds = parsed.filter((id) => documents.some((d) => d.id === id));
          if (validIds.length > 0) {
            setSelectedDocIds(validIds);
            return;
          }
        }
      } catch (e) {
        // ignore JSON parse error
      }
    }
    
    // Fallback: Check global legacy selection (e.g. from upload page purge)
    const legacyIds = localStorage.getItem("lumen_selected_doc_ids");
    if (legacyIds) {
      try {
        const parsedLegacy = JSON.parse(legacyIds);
        if (Array.isArray(parsedLegacy) && parsedLegacy.length > 0) {
          const validLegacy = parsedLegacy.filter((id) => documents.some((d) => d.id === id));
          if (validLegacy.length > 0) {
            setSelectedDocIds(validLegacy);
            return;
          }
        }
      } catch (e) {
        // ignore
      }
    }

    // Default to all documents
    setSelectedDocIds(documents.map((d) => d.id));
  }, [activeChatId, documents, targetDocId]);

  // Save chat-specific document selection when it changes
  useEffect(() => {
    if (activeChatId && selectedDocIds.length > 0) {
      localStorage.setItem(`lumen_chat_docs_${activeChatId}`, JSON.stringify(selectedDocIds));
    }
  }, [selectedDocIds, activeChatId]);

  // Load chat messages when active room switches
  useEffect(() => {
    if (!activeChatId) return;
    setLoadingMessages(true);
    setStreamingText("");
    async function loadMessages() {
      try {
        const res = await getChatMessages(activeChatId as string);
        if (res.data) {
          setMessages(res.data as Message[]);
        }
      } catch (err) {
        console.error("Error loading messages:", err);
      } finally {
        setLoadingMessages(false);
      }
    }
    loadMessages();
  }, [activeChatId]);

  // Autoscroll panel
  const scrollToBottom = useCallback((force = false) => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const isNearBottom = container.scrollHeight - container.scrollTop - container.clientHeight <= 140;
    
    if (force || isNearBottom) {
      container.scrollTo({
        top: container.scrollHeight,
        behavior: force ? "auto" : "smooth",
      });
    }
  }, []);

  // Force scroll to bottom on initial message load or user send
  useEffect(() => {
    scrollToBottom(true);
  }, [messages.length, scrollToBottom]);

  // Smooth scroll to bottom during active token stream if near bottom
  useEffect(() => {
    if (streamingText) {
      scrollToBottom(false);
    }
  }, [streamingText, scrollToBottom]);

  // 2. Wrap all callback handlers with useCallback to prevent breaking child memoizations
  const fetchChats = useCallback(async (selectId?: string) => {
    setLoadingChats(true);
    try {
      const res = await getUserChats();
      if (res.data && res.data.length > 0) {
        const sortedChats = res.data as ChatSession[];
        setChats(sortedChats);
        setActiveChatId(selectId || sortedChats[0].id);
      } else {
        const { data: { user: currentUser } } = await supabase.auth.getUser();
        if (currentUser) {
          const newChatRes = await createChat("General Analysis");
          if (newChatRes.data) {
            const freshChat = newChatRes.data as ChatSession;
            setChats([freshChat]);
            setActiveChatId(freshChat.id);
          }
        }
      }
    } catch (err) {
      console.error("Error loading chat list:", err);
    } finally {
      setLoadingChats(false);
    }
  }, [supabase]);

  const handleCreateChat = useCallback(async () => {
    try {
      const title = prompt("Enter conversation title:", "Custom Grounding");
      if (!title || !title.trim()) return;
      const res = await createChat(title);
      if (res.data) {
        const newSession = res.data as ChatSession;
        setChats((prev) => [newSession, ...prev]);
        setActiveChatId(newSession.id);
      }
    } catch (err) {
      console.error("Error creating chat session:", err);
    }
  }, []);

  const handleDeleteChat = useCallback(async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Permanently delete this discussion and its history?")) return;

    try {
      const res = await deleteChat(id);
      if (res.success) {
        setChats((prev) => {
          const remaining = prev.filter((c) => c.id !== id);
          if (remaining.length > 0) {
            setActiveChatId((active) => {
              if (active === id) {
                return remaining[0].id;
              }
              return active;
            });
          } else {
            fetchChats();
          }
          return remaining;
        });
      }
    } catch (err) {
      console.error("Failed to delete chat session:", err);
    }
  }, [fetchChats]);

  const handleRenameChat = useCallback(async (id: string, newTitle: string) => {
    try {
      const res = await renameChat(id, newTitle);
      if (res.success) {
        setChats((prev) =>
          prev.map((c) => (c.id === id ? { ...c, title: newTitle } : c))
        );
      } else {
        alert("Failed to rename chat: " + (res.error || "Unknown error"));
      }
    } catch (err: any) {
      alert("Error renaming chat: " + err.message);
    }
  }, []);

  const handleDeleteDoc = useCallback(async (id: string, storagePath: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (!confirm("Are you sure you want to permanently delete this document from your workspace?")) return;

    // Optimistically update document list and selected state
    setDocuments((prev) => prev.filter((d) => d.id !== id));
    setSelectedDocIds((prev) => prev.filter((item) => item !== id));

    try {
      const res = await deleteUserDocument(id, storagePath);
      if (res && res.error) {
        alert("Failed to delete document: " + res.error);
        // Reload docs if failed
        const { data } = await supabase
          .from("documents")
          .select("id, file_name, file_size, storage_path, created_at")
          .order("created_at", { ascending: false });
        if (data) setDocuments(data as DbDocument[]);
      }
    } catch (err: any) {
      alert("Error: " + err.message);
    }
  }, [supabase]);

  const toggleDocSelection = useCallback((id: string) => {
    setSelectedDocIds((prev) => {
      const updated = prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id];
      if (activeChatId) {
        localStorage.setItem(`lumen_chat_docs_${activeChatId}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [activeChatId]);

  const toggleSelectAll = useCallback(() => {
    setSelectedDocIds((prev) => {
      const updated = prev.length === documents.length ? [] : documents.map((d) => d.id);
      if (activeChatId) {
        localStorage.setItem(`lumen_chat_docs_${activeChatId}`, JSON.stringify(updated));
      }
      return updated;
    });
  }, [documents, activeChatId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputText.trim() || sending || !activeChatId) return;

    const userQuestion = inputText.trim();
    setInputText("");
    setSending(true);
    setStreamingText("");

    const tempUserMsg: Message = {
      role: "user",
      content: userQuestion,
    };
    setMessages((prev) => [...prev, tempUserMsg]);

    const originChatId = activeChatId;

    try {
      const fullMessagesList = [...messages, tempUserMsg];

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: fullMessagesList,
          chatId: activeChatId,
          selectedDocumentIds: selectedDocIds,
          provider,
          model,
          searchType,
        }),
      });

      if (response.status === 402) {
        setShowUpgradeModal(true);
        setMessages((prev) => prev.filter((m) => m !== tempUserMsg));
        setSending(false);
        return;
      }

      if (!response.ok) {
        const errJson = await response.json();
        throw new Error(errJson.error || "Failed to submit completions request");
      }

      const xSources = response.headers.get("X-Sources");
      let references: any[] = [];
      if (xSources) {
        try {
          references = JSON.parse(decodeURIComponent(xSources));
        } catch (err) {
          console.error("Error decoding grounding references:", err);
        }
      }

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      if (!reader) {
        throw new Error("API streaming channel did not return readable reader stream.");
      }

      let done = false;
      let accumulatedReply = "";

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        if (value) {
          const chunkText = decoder.decode(value);
          accumulatedReply += chunkText;
          if (activeChatIdRef.current === originChatId) {
            setStreamingText(accumulatedReply);
          }
        }
      }

      if (activeChatIdRef.current === originChatId) {
        const tempAssistantMsg: Message = {
          role: "assistant",
          content: accumulatedReply,
          references: references,
        };
        setMessages((prev) => [...prev, tempAssistantMsg]);
      }

    } catch (err: any) {
      console.error("Chat communication failure:", err);
      if (activeChatIdRef.current === originChatId) {
        setMessages((prev) => [
          ...prev,
          {
            role: "assistant",
            content: `[Error: ${err.message || "Failed to reach AI pipeline. Ensure GROQ_API_KEY is configured."}]`,
          },
        ]);
      }
    } finally {
      if (activeChatIdRef.current === originChatId) {
        setStreamingText("");
      }
      setSending(false);
    }
  };

  return (
    <>
      <Navbar />
      <div className="mx-auto max-w-7xl px-4 py-8">
        {/* Navigation Head */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" className="rounded-full gap-1.5" asChild>
              <Link href="/dashboard">
                <ArrowLeft className="h-4 w-4" />
                Back
              </Link>
            </Button>
            <div className="flex items-center gap-2">
              <Badge variant="soft" className="rounded-full">
                <Sparkles className="h-3 w-3 mr-1 text-primary animate-subtle-pulse" />
                Lumen intelligence
              </Badge>
            </div>
          </div>
        </div>

        {/* Mobile Sidebar Triggers */}
        <div className="flex lg:hidden items-center justify-between gap-3 mb-4 bg-secondary/15 p-2 rounded-xl border border-border/50">
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowSourcesMobile(true)}
            className="flex-1 text-xs gap-1.5 h-9 rounded-lg"
          >
            <Files className="h-4 w-4 text-primary" />
            Sources ({selectedDocIds.length})
          </Button>
          <div className="h-4 w-[1px] bg-border" />
          <Button 
            variant="ghost" 
            size="sm" 
            onClick={() => setShowHistoryMobile(true)}
            className="flex-1 text-xs gap-1.5 h-9 rounded-lg"
          >
            <MessageSquare className="h-4 w-4 text-primary" />
            History ({chats.length})
          </Button>
        </div>

        {/* Triple Split Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 h-[76vh] min-h-[580px]">
          
          {/* Left Column: Context Files Box (Hidden on Mobile) */}
          <Card className="hidden lg:flex p-5 flex-col justify-between overflow-hidden lg:col-span-1 border border-border/50 bg-card/60 backdrop-blur-sm shadow-apple">
            <div>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                <h3 className="font-display text-lg font-medium">Grounding context</h3>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-xs h-7 text-muted-foreground hover:text-foreground"
                  onClick={toggleSelectAll}
                  disabled={documents.length === 0 || loadingChats}
                >
                  {selectedDocIds.length === documents.length ? "Clear" : "All"}
                </Button>
              </div>

              <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                Check files to feed their contents directly into the conversational query.
              </p>

              {/* Memoized Scrollable Checkbox List */}
              <DocumentList
                documents={documents}
                selectedDocIds={selectedDocIds}
                toggleDocSelection={toggleDocSelection}
                handleDeleteDoc={handleDeleteDoc}
                loading={loadingChats}
              />
            </div>

            {/* Selected files count bottom summary */}
            <div className="pt-3 border-t border-border/40 mt-4">
              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Active documents:</span>
                <span className="font-semibold text-foreground">
                  {selectedDocIds.length} / {documents.length}
                </span>
              </div>
            </div>
          </Card>

          {/* Central Main Chat & Streaming Engine */}
          <div className="lg:col-span-3 flex flex-col lg:flex-row gap-6 h-full overflow-hidden">
            
            {/* Main Chat Panel */}
            <Card className="flex-1 flex flex-col justify-between overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm shadow-apple">
              
              {/* Active Conversation Top Bar */}
              <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between bg-secondary/20">
                <div className="flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-foreground text-background flex items-center justify-center shadow-apple">
                    <Brain className="h-4.5 w-4.5" />
                  </div>
                  <div>
                    <h2 className="font-medium text-sm leading-none">
                      {chats.find((c) => c.id === activeChatId)?.title || "Workspace Analysis"}
                    </h2>
                    <p className="text-[10.5px] text-muted-foreground mt-1">
                      Powered by Llama 3.3 grounded in your library
                    </p>
                  </div>
                </div>
                
                {/* Switcher/New discussion buttons */}
                <div className="flex items-center gap-1.5">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-8 rounded-full text-xs font-normal"
                    onClick={handleCreateChat}
                  >
                    <Plus className="h-3 w-3 mr-1" />
                    New chat
                  </Button>
                </div>
              </div>

              {/* Chat Messages Panel */}
              <div ref={scrollContainerRef} className="flex-1 overflow-y-auto px-6 py-6 space-y-5 scrollbar-hide bg-gradient-to-b from-transparent to-secondary/10">
                {loadingMessages ? (
                  <MessagesSkeleton />
                ) : messages.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-center max-w-sm mx-auto animate-fade-in">
                    <div className="h-12 w-12 rounded-2xl bg-secondary border border-border/50 flex items-center justify-center mb-4 text-muted-foreground">
                      <Sparkles className="h-5 w-5 text-primary" />
                    </div>
                    <h3 className="font-display text-xl font-medium tracking-tight">Ask Lumen</h3>
                    <p className="text-xs text-muted-foreground mt-2 leading-relaxed">
                      Select document sources on the left panel, and ask questions. Lumen will extract and query text sections natively.
                    </p>
                  </div>
                ) : (
                  <>
                    {messages.map((msg, index) => (
                      <MessageItem 
                        key={msg.id || index} 
                        msg={msg} 
                        onCitationClick={(ref) => setSelectedCitation(ref)}
                      />
                    ))}

                    {/* Streaming bubble animation */}
                    {streamingText && (
                      <div className="flex gap-4 max-w-3xl mr-auto animate-fade-in">
                        <div className="h-8 w-8 rounded-full flex items-center justify-center text-xs shrink-0 border bg-primary/10 border-primary/20 text-primary shadow-apple">
                          <Bot className="h-4 w-4" />
                        </div>
                        <div className="space-y-1.5 flex-1 min-w-0">
                          <div className="px-4 py-3 rounded-2xl rounded-tl-sm text-sm leading-relaxed whitespace-pre-wrap bg-white border border-border text-foreground shadow-apple">
                            {streamingText}
                          </div>
                        </div>
                      </div>
                    )}
                  </>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Premium Grounding AI Config Bar */}
              <div className="px-4 py-2.5 bg-secondary/15 border-t border-border/30 flex flex-wrap items-center justify-between gap-3 text-xs">
                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Provider:</span>
                  <div className="inline-flex rounded-lg border border-border/40 bg-white dark:bg-card p-0.5 shadow-apple-sm">
                    <button
                      type="button"
                      onClick={() => {
                        setProvider('groq');
                        setModel('llama-3.3-70b-versatile');
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all text-[10.5px]",
                        provider === 'groq'
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      Groq
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setProvider('openai');
                        setModel('gpt-4o-mini');
                      }}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all text-[10.5px]",
                        provider === 'openai'
                          ? "bg-foreground text-background"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                    >
                      OpenAI
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Model:</span>
                  <select
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                    className="bg-white dark:bg-card border border-border/50 rounded-lg px-2 py-1 text-[11px] font-medium focus:outline-none focus:ring-1 focus:ring-primary text-foreground"
                  >
                    {provider === 'groq' ? (
                      <>
                        <option value="llama-3.3-70b-versatile">Llama 3.3 70B</option>
                        <option value="mixtral-8x7b-32768">Mixtral 8x7B</option>
                        <option value="gemma2-9b-it">Gemma 2 9B</option>
                      </>
                    ) : (
                      <>
                        <option value="gpt-4o-mini">GPT-4o Mini</option>
                        <option value="gpt-4o">GPT-4o (Premium)</option>
                      </>
                    )}
                  </select>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-muted-foreground font-medium">Retrieval:</span>
                  <div className="inline-flex rounded-lg border border-border/40 bg-white dark:bg-card p-0.5 shadow-apple-sm">
                    <button
                      type="button"
                      onClick={() => setSearchType('fts')}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all text-[10.5px] flex items-center gap-1",
                        searchType === 'fts'
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Keyword-based PostgreSQL Text Search"
                    >
                      Keyword
                    </button>
                    <button
                      type="button"
                      onClick={() => setSearchType('vector')}
                      className={cn(
                        "px-2.5 py-1 rounded-md font-medium transition-all text-[10.5px] flex items-center gap-1",
                        searchType === 'vector'
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground"
                      )}
                      title="Semantic Cosine Similarity Embeddings Vector Search"
                    >
                      Vector Match
                    </button>
                  </div>
                </div>
              </div>

              {/* Chat Input panel */}
              <form
                onSubmit={handleSendMessage}
                className="p-4 border-t border-border/40 bg-secondary/15 flex items-center gap-2"
              >
                <Input
                  value={inputText}
                  onChange={(e) => setInputText(e.target.value)}
                  placeholder={
                    selectedDocIds.length === 0
                      ? "Select files on left panel to query..."
                      : "Ground question in active library..."
                  }
                  className="flex-1 h-11 rounded-xl bg-white border-border/80 focus-visible:ring-primary"
                  disabled={sending || selectedDocIds.length === 0}
                />
                <Button
                  type="submit"
                  size="icon"
                  className="h-11 w-11 rounded-xl shrink-0 transition-transform active:scale-95"
                  disabled={!inputText.trim() || sending || selectedDocIds.length === 0}
                >
                  {sending ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                </Button>
              </form>
            </Card>

            {/* Right Panel: Chat Session Switcher Drawer (Hidden on Mobile) */}
            <Card className="hidden lg:flex w-full lg:w-56 p-4 flex flex-col overflow-hidden border border-border/50 bg-card/60 backdrop-blur-sm shadow-apple shrink-0">
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  History
                </span>
                <span className="text-[10px] text-muted-foreground font-medium font-mono">
                  {chats.length} threads
                </span>
              </div>

              {/* Memoized Chats session loops */}
              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={setActiveChatId}
                handleDeleteChat={handleDeleteChat}
                handleRenameChat={handleRenameChat}
                loading={loadingChats}
              />
            </Card>
          </div>
        </div>
      </div>

      {/* ==========================================================================
         RESPONSIVE SIDEBAR MOBILE DRAWERS & INTERACTIVE CITATION DETAILS MODALS
         ========================================================================== */}

      {/* Mobile Sources Drawer */}
      <AnimatePresence>
        {showSourcesMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden flex justify-start"
            onClick={() => setShowSourcesMobile(false)}
          >
            <motion.div 
              initial={{ x: -150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: -150, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="w-80 h-full bg-card border-r border-border p-5 flex flex-col justify-between overflow-hidden shadow-apple-md"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div>
                <div className="flex items-center justify-between mb-4 pb-2 border-b border-border/40">
                  <h3 className="font-display text-lg font-medium">Grounding context</h3>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-xs h-7 px-2 text-muted-foreground hover:text-foreground"
                      onClick={toggleSelectAll}
                      disabled={documents.length === 0 || loadingChats}
                    >
                      {selectedDocIds.length === documents.length ? "Clear" : "All"}
                    </Button>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setShowSourcesMobile(false)}
                      className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                    >
                      <X className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <p className="text-xs text-muted-foreground mb-4 leading-relaxed">
                  Check files to feed their contents directly into the query.
                </p>

                <DocumentList
                  documents={documents}
                  selectedDocIds={selectedDocIds}
                  toggleDocSelection={toggleDocSelection}
                  handleDeleteDoc={handleDeleteDoc}
                  loading={loadingChats}
                />
              </div>

              <div className="pt-3 border-t border-border/40 mt-4">
                <div className="flex items-center justify-between text-xs text-muted-foreground">
                  <span>Active documents:</span>
                  <span className="font-semibold text-foreground">
                    {selectedDocIds.length} / {documents.length}
                  </span>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile History Drawer */}
      <AnimatePresence>
        {showHistoryMobile && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 lg:hidden flex justify-end"
            onClick={() => setShowHistoryMobile(false)}
          >
            <motion.div 
              initial={{ x: 150, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 150, opacity: 0 }}
              transition={{ type: "spring", stiffness: 380, damping: 26 }}
              className="w-72 h-full bg-card border-l border-border p-5 flex flex-col overflow-hidden shadow-apple-md"
              onClick={(e: React.MouseEvent) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between border-b border-border/40 pb-2">
                <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  History
                </span>
                <div className="flex items-center gap-1">
                  <span className="text-[10px] text-muted-foreground font-medium font-mono mr-2">
                    {chats.length} threads
                  </span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => setShowHistoryMobile(false)}
                    className="h-7 w-7 rounded-full text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              <ChatHistory
                chats={chats}
                activeChatId={activeChatId}
                setActiveChatId={(id) => {
                  setActiveChatId(id);
                  setShowHistoryMobile(false);
                }}
                handleDeleteChat={handleDeleteChat}
                handleRenameChat={handleRenameChat}
                loading={loadingChats}
              />
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Grounding Citation Detail Modal */}
      {selectedCitation && (
        <div 
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in"
          onClick={() => setSelectedCitation(null)}
        >
          <Card 
            className="w-full max-w-xl p-6 bg-card border border-border/50 shadow-apple-md max-h-[80vh] overflow-y-auto relative animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setSelectedCitation(null)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-full"
            >
              <X className="h-4 w-4" />
            </button>
            <div className="flex items-center gap-2 mb-4 text-primary">
              <Bookmark className="h-4.5 w-4.5" />
              <span className="text-xs font-semibold uppercase tracking-wider">Grounding Source Citation</span>
            </div>
            <h3 className="font-display text-lg font-medium text-foreground mb-1 leading-snug">
              {selectedCitation.file_name}
            </h3>
            <p className="text-[10px] text-muted-foreground font-mono mb-4">
              Chunk offset: index {selectedCitation.chunk_index}
            </p>
            <div className="p-4 rounded-xl border border-border/50 bg-secondary/20 text-xs sm:text-sm leading-relaxed text-foreground whitespace-pre-wrap font-mono italic">
              "{selectedCitation.snippet}"
            </div>
          </Card>
        </div>
      )}

      {/* ==========================================================================
         ONBOARDING WIZARD MODAL (MULTISTEP)
         ========================================================================== */}
      {showOnboarding && (
        <div className="fixed inset-0 bg-background/90 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card 
            className="w-full max-w-lg p-8 bg-card border border-border/60 shadow-apple-lg relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Step Indicators */}
            <div className="flex items-center justify-between mb-8">
              <div className="flex items-center gap-2">
                <Sparkles className="h-5 w-5 text-primary animate-pulse" />
                <span className="text-sm font-semibold tracking-tight">Onboarding Wizard</span>
              </div>
              <div className="flex gap-1">
                {[1, 2, 3].map((s) => (
                  <div 
                    key={s} 
                    className={cn(
                      "h-1.5 w-8 rounded-full transition-all duration-300",
                      onboardingStep >= s ? "bg-primary" : "bg-secondary"
                    )}
                  />
                ))}
              </div>
            </div>

            {onboardingStep === 1 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Welcome to Lumen<span className="text-primary">.</span></h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Let's personalize your document intelligence workspace. Tell us your name and workspace preferences.
                  </p>
                </div>
                <div className="space-y-4">
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">YOUR FULL NAME</label>
                    <Input 
                      placeholder="e.g. Alexis Sterling" 
                      value={onboardingData.name}
                      onChange={(e) => setOnboardingData({ ...onboardingData, name: e.target.value })}
                      className="mt-1 h-10 rounded-xl bg-secondary/20"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground">WORKSPACE TITLE</label>
                    <Input 
                      placeholder="e.g. Core Analytics Workspace" 
                      value={onboardingData.workspace}
                      onChange={(e) => setOnboardingData({ ...onboardingData, workspace: e.target.value })}
                      className="mt-1 h-10 rounded-xl bg-secondary/20"
                    />
                  </div>
                </div>
                <Button 
                  onClick={() => setOnboardingStep(2)}
                  className="w-full mt-4 h-10 rounded-xl"
                  disabled={!onboardingData.name.trim() || !onboardingData.workspace.trim()}
                >
                  Configure AI Engines
                  <ArrowRight className="h-4 w-4 ml-1.5" />
                </Button>
              </div>
            )}

            {onboardingStep === 2 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Choose Default Model<span className="text-primary">.</span></h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Lumen connects to multiple state-of-the-art models. You can change this switch at any time.
                  </p>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <button 
                    onClick={() => {
                      setProvider('groq');
                      setModel('llama-3.3-70b-versatile');
                    }}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
                      provider === 'groq' 
                        ? "border-primary bg-primary/[0.02]" 
                        : "border-border/60 bg-white hover:bg-secondary/30 dark:bg-transparent"
                    )}
                  >
                    <h4 className="font-semibold text-sm">Groq Llama 3.3</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      Ultra-low latency open-source reasoning model.
                    </p>
                    {provider === 'groq' && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                  <button 
                    onClick={() => {
                      setProvider('openai');
                      setModel('gpt-4o-mini');
                    }}
                    className={cn(
                      "p-4 rounded-2xl border text-left transition-all relative overflow-hidden",
                      provider === 'openai' 
                        ? "border-primary bg-primary/[0.02]" 
                        : "border-border/60 bg-white hover:bg-secondary/30 dark:bg-transparent"
                    )}
                  >
                    <h4 className="font-semibold text-sm">OpenAI GPT-4o</h4>
                    <p className="text-[10px] text-muted-foreground mt-1 leading-normal">
                      High cognitive accuracy proprietary model.
                    </p>
                    {provider === 'openai' && (
                      <span className="absolute top-3 right-3 h-2 w-2 rounded-full bg-primary" />
                    )}
                  </button>
                </div>
                <div className="flex gap-2.5 mt-6">
                  <Button variant="outline" onClick={() => setOnboardingStep(1)} className="flex-1 h-10 rounded-xl">
                    Back
                  </Button>
                  <Button onClick={() => setOnboardingStep(3)} className="flex-1 h-10 rounded-xl">
                    Next: Grounding
                  </Button>
                </div>
              </div>
            )}

            {onboardingStep === 3 && (
              <div className="space-y-5 animate-fade-in">
                <div>
                  <h3 className="font-display text-2xl font-semibold tracking-tight">Select Grounding Index<span className="text-primary">.</span></h3>
                  <p className="text-xs text-muted-foreground mt-1.5 leading-relaxed">
                    Grounding retrieves file segments context. Keyword matches specific phrases; Vector matches semantic topics.
                  </p>
                </div>
                <div className="space-y-3 mt-4">
                  <button 
                    onClick={() => setSearchType('fts')}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between",
                      searchType === 'fts' 
                        ? "border-primary bg-primary/[0.01]" 
                        : "border-border/60 bg-white hover:bg-secondary/30 dark:bg-transparent"
                    )}
                  >
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm">Keyword Indexing (Postgres FTS)</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        High accuracy exact word searching inside documents.
                      </p>
                    </div>
                    {searchType === 'fts' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </button>
                  <button 
                    onClick={() => setSearchType('vector')}
                    className={cn(
                      "w-full p-4 rounded-2xl border text-left transition-all flex items-center justify-between",
                      searchType === 'vector' 
                        ? "border-primary bg-primary/[0.01]" 
                        : "border-border/60 bg-white hover:bg-secondary/30 dark:bg-transparent"
                    )}
                  >
                    <div>
                      <h4 className="font-semibold text-xs sm:text-sm">Vector Semantic Search (pgvector)</h4>
                      <p className="text-[10px] sm:text-xs text-muted-foreground mt-0.5">
                        Reads topics and meanings even if wording differs.
                      </p>
                    </div>
                    {searchType === 'vector' && <span className="h-2 w-2 rounded-full bg-primary" />}
                  </button>
                </div>
                <div className="flex gap-2.5 mt-6">
                  <Button variant="outline" onClick={() => setOnboardingStep(2)} className="flex-1 h-10 rounded-xl">
                    Back
                  </Button>
                  <Button 
                    onClick={() => {
                      localStorage.setItem("lumen_onboarding_completed", "true");
                      localStorage.setItem("lumen_profile_name", onboardingData.name);
                      localStorage.setItem("lumen_workspace_title", onboardingData.workspace);
                      setShowOnboarding(false);
                      alert(`Workspace created! Welcome ${onboardingData.name}.`);
                    }} 
                    className="flex-1 h-10 rounded-xl bg-primary text-primary-foreground"
                  >
                    Complete Setup
                  </Button>
                </div>
              </div>
            )}
          </Card>
        </div>
      )}

      {/* ==========================================================================
         STRIPE INTEGRATION CHECKOUT UPGRADE MODAL
         ========================================================================== */}
      {showUpgradeModal && (
        <div className="fixed inset-0 bg-background/80 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fade-in">
          <Card 
            className="w-full max-w-md p-6 bg-card border border-border/50 shadow-apple-lg relative overflow-hidden animate-scale-in"
            onClick={(e) => e.stopPropagation()}
          >
            <button 
              onClick={() => setShowUpgradeModal(false)}
              className="absolute top-4 right-4 text-muted-foreground hover:text-foreground transition-colors p-1 hover:bg-secondary rounded-full"
            >
              <X className="h-4 w-4" />
            </button>

            <div className="text-center mb-6">
              <Badge className="bg-primary/10 text-primary hover:bg-primary/20 border-transparent rounded-full mb-2">
                <Sparkles className="h-3 w-3 mr-1" />
                LUMEN PRO
              </Badge>
              <h3 className="font-display text-2xl font-semibold tracking-tight">Upgrade Your Quota</h3>
              <p className="text-xs text-muted-foreground mt-1.5 max-w-xs mx-auto">
                You have reached the free tier limit of 15 queries. Upgrade to Pro for full, unrestricted intelligence.
              </p>
            </div>

            <div className="p-4 rounded-2xl border border-primary/20 bg-primary/[0.02] mb-6">
              <div className="flex items-baseline justify-between">
                <span className="text-xs font-semibold text-muted-foreground">PRO SUBSCRIPTION</span>
                <div className="text-right">
                  <span className="text-2xl font-bold font-display">$15</span>
                  <span className="text-[10px] text-muted-foreground">/month</span>
                </div>
              </div>
              <ul className="mt-3 space-y-2 border-t border-border/40 pt-3 text-[11px] text-foreground">
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={3} />
                  <span>Unlimited conversational Q&A queries</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={3} />
                  <span>Priority GPU pipeline processing</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="h-3.5 w-3.5 text-primary shrink-0" strokeWidth={3} />
                  <span>Interactive cosine vector chunk citation drawers</span>
                </li>
              </ul>
            </div>

            {/* Simulated Stripe Checkout Form */}
            <form 
              onSubmit={async (e) => {
                e.preventDefault();
                setStripeLoading(true);
                
                // Simulate communication to Stripe Checkout API
                await new Promise(r => setTimeout(r, 1500));
                
                try {
                  // Authenticated Supabase state mutation: Inject Stripe subscription details into user metadata!
                  const { error } = await supabase.auth.updateUser({
                    data: { 
                      subscription_status: 'active',
                      stripe_subscription_id: 'sub_sim_' + Math.random().toString(36).slice(2, 10),
                      stripe_subscription_tier: 'pro'
                    }
                  });
                  
                  if (error) throw error;
                  
                  setStripeLoading(false);
                  setShowUpgradeModal(false);
                  alert("Subscription processed successfully! Welcome to Lumen Pro!");
                  
                } catch (err: any) {
                  setStripeLoading(false);
                  alert("Billing Error: " + err.message);
                }
              }} 
              className="space-y-4"
            >
              <div>
                <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                  Cardholder Name
                </label>
                <Input placeholder="Alexis Sterling" required className="h-9 rounded-lg" />
              </div>
              
              <div className="grid grid-cols-3 gap-2">
                <div className="col-span-2">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    Card Number
                  </label>
                  <Input placeholder="4242 4242 4242 4242" required className="h-9 rounded-lg font-mono text-xs" />
                </div>
                <div>
                  <label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground block mb-1">
                    CVC
                  </label>
                  <Input placeholder="123" required className="h-9 rounded-lg font-mono text-xs" />
                </div>
              </div>

              <Button 
                type="submit" 
                className="w-full mt-4 h-10 rounded-xl bg-primary text-primary-foreground shadow-red-glow font-medium flex items-center justify-center gap-1.5 transition-all hover:shadow-red-glow-lg active:scale-[0.98]"
                disabled={stripeLoading}
              >
                {stripeLoading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Securing session...
                  </>
                ) : (
                  <>
                    <Lock className="h-3.5 w-3.5" />
                    Subscribe via Stripe
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      )}
    </>
  );
}

export default function WorkspaceChatPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-full items-center justify-center bg-background">
        <div className="flex flex-col items-center justify-center gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-xl bg-secondary/50 animate-bounce" />
          <p className="text-sm font-medium text-muted-foreground">Initializing Workspace...</p>
        </div>
      </div>
    }>
      <WorkspaceChatContent />
    </Suspense>
  );
}
