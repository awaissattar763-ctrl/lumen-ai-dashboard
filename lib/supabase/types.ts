/**
 * Strongly-typed database record interfaces for Supabase collections.
 */

export interface DbDocument {
  id: string;
  user_id: string;
  file_name: string;
  file_size: number;
  storage_path: string;
  created_at: string;
}
