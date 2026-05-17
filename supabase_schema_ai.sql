-- ==========================================================
-- Supabase Schema & Row Level Security (RLS) Setup — AI Phase
-- ==========================================================

-- 1. Create the 'document_chunks' table
CREATE TABLE IF NOT EXISTS public.document_chunks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    chunk_index INT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create the 'chats' table
CREATE TABLE IF NOT EXISTS public.chats (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create the 'messages' table
CREATE TABLE IF NOT EXISTS public.messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    chat_id UUID NOT NULL REFERENCES public.chats(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
    content TEXT NOT NULL,
    source_references JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Enable RLS
ALTER TABLE public.document_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.messages ENABLE ROW LEVEL SECURITY;

-- 5. Policies for document_chunks
CREATE POLICY "Users can view their own document chunks"
ON public.document_chunks
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own document chunks"
ON public.document_chunks
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own document chunks"
ON public.document_chunks
FOR DELETE
USING (auth.uid() = user_id);

-- 6. Policies for chats
CREATE POLICY "Users can view their own chats"
ON public.chats
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own chats"
ON public.chats
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own chats"
ON public.chats
FOR DELETE
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own chats"
ON public.chats
FOR UPDATE
USING (auth.uid() = user_id);

-- 7. Policies for messages
CREATE POLICY "Users can view their own messages"
ON public.messages
FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own messages"
ON public.messages
FOR INSERT
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own messages"
ON public.messages
FOR DELETE
USING (auth.uid() = user_id);

-- 8. Full-text search index
CREATE INDEX IF NOT EXISTS document_chunks_content_fts_idx
ON public.document_chunks
USING gin(to_tsvector('english', content));