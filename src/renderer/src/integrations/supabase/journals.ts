import { supabase } from "./client";
import type { Database } from "./types";

// Type aliases for convenience
export type Journal = Database["public"]["Tables"]["journals"]["Row"] & {
  author_name?: string;
  profiles?: {
    full_name: string | null;
  } | null;
};

export type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];
export type JournalUpdate = Database["public"]["Tables"]["journals"]["Update"];

// Fetch all journals for the current user (ordered by created_at desc)
export async function fetchJournals() {
  const { data, error } = await supabase
    .from("journals")
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .order("created_at", { ascending: false });
  
  if (error) throw error;
  
  // Transform the data to include author_name
  return (data || []).map(journal => {
    const author_name = 
      typeof journal.profiles === 'object' && 
      journal.profiles && 
      'full_name' in journal.profiles
        ? journal.profiles.full_name || 'Anonymous'
        : 'Anonymous';
    
    return {
      ...journal,
      author_name
    } as unknown as Journal;
  });
}

// Create a new journal
export async function createJournal(journal: JournalInsert) {
  const { data, error } = await supabase
    .from("journals")
    .insert([journal])
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .single();
  
  if (error) throw error;
  
  // Transform the data to include author_name
  const author_name = 
    typeof data?.profiles === 'object' && 
    data?.profiles && 
    'full_name' in data.profiles
      ? data.profiles.full_name || 'Anonymous'
      : 'Anonymous';
  
  return {
    ...data,
    author_name
  } as unknown as Journal;
}

// Update a journal by id
export async function updateJournal(id: string, updates: JournalUpdate) {
  const { data, error } = await supabase
    .from("journals")
    .update(updates)
    .eq("id", id)
    .select(`
      *,
      profiles:user_id (
        full_name
      )
    `)
    .single();
  
  if (error) throw error;
  
  // Transform the data to include author_name
  const author_name = 
    typeof data?.profiles === 'object' && 
    data?.profiles && 
    'full_name' in data.profiles
      ? data.profiles.full_name || 'Anonymous'
      : 'Anonymous';
  
  return {
    ...data,
    author_name
  } as unknown as Journal;
}

// Delete a journal by id
export async function deleteJournal(id: string) {
  const { error } = await supabase
    .from("journals")
    .delete()
    .eq("id", id);
  if (error) throw error;
  return true;
}