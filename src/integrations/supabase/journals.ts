import { supabase } from "./client";
import type { Database } from "./types";

// Type aliases for convenience
export type Journal = Database["public"]["Tables"]["journals"]["Row"];
export type JournalInsert = Database["public"]["Tables"]["journals"]["Insert"];
export type JournalUpdate = Database["public"]["Tables"]["journals"]["Update"];

// Fetch all journals for the current user (ordered by created_at desc)
export async function fetchJournals() {
  const { data, error } = await supabase
    .from("journals")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data as Journal[];
}

// Create a new journal
export async function createJournal(journal: JournalInsert) {
  const { data, error } = await supabase
    .from("journals")
    .insert([journal])
    .select()
    .single();
  if (error) throw error;
  return data as Journal;
}

// Update a journal by id
export async function updateJournal(id: string, updates: JournalUpdate) {
  const { data, error } = await supabase
    .from("journals")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data as Journal;
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