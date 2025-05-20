import { supabase } from "./client";

// Sign up with email and password
export async function signUpWithEmail(email: string, password: string, fullName?: string) {
  // Create the auth user with metadata
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName,
      }
    }
  });
  
  if (error) throw error;
  return data;
}

// Sign in with email and password
export async function signInWithEmail(email: string, password: string) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data;
}

// Sign out
export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

// Get the current user
export function getCurrentUser() {
  return supabase.auth.getUser();
}
