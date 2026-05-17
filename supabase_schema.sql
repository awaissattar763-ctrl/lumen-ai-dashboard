-- ==========================================================
-- Supabase Schema & Row Level Security (RLS) Setup
-- Run this script inside your Supabase SQL Editor (SQL Editor -> New Query)
-- ==========================================================

-- 1. Create the 'documents' table in the public schema
CREATE TABLE IF NOT EXISTS public.documents (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    file_name TEXT NOT NULL,
    file_size BIGINT NOT NULL,
    storage_path TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Enable Row Level Security (RLS) on the table
ALTER TABLE public.documents ENABLE ROW LEVEL SECURITY;

-- 3. Create RLS Policies for the public.documents table
-- Users can only select/view their own records
CREATE POLICY "Users can view their own documents" 
ON public.documents 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can only insert documents for themselves
CREATE POLICY "Users can insert their own documents" 
ON public.documents 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can only delete their own records
CREATE POLICY "Users can delete their own documents" 
ON public.documents 
FOR DELETE 
USING (auth.uid() = user_id);

-- Users can only update their own records
CREATE POLICY "Users can update their own documents" 
ON public.documents 
FOR UPDATE 
USING (auth.uid() = user_id);

-- 4. Supabase Storage Bucket Initialization
-- Ensure the storage bucket 'documents' is created and set to private
INSERT INTO storage.buckets (id, name, public)
VALUES ('documents', 'documents', false)
ON CONFLICT (id) DO NOTHING;

-- 5. Row Level Security Policies for Supabase Storage (storage.objects)
-- Users can only upload objects into a folder named after their own authenticated user_id
CREATE POLICY "Allow users to upload files to their own folder"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only view/read files inside their own user_id folder
CREATE POLICY "Allow users to view their own files"
ON storage.objects
FOR SELECT
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);

-- Users can only delete files inside their own user_id folder
CREATE POLICY "Allow users to delete their own files"
ON storage.objects
FOR DELETE
TO authenticated
USING (
  bucket_id = 'documents' AND
  (storage.foldername(name))[1] = auth.uid()::text
);
