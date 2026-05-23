import { createClient } from "@supabase/supabase-js";

// Ensure you add these to .env.local and Netlify Env Vars!
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "https://placeholder.supabase.co";
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "placeholder";

// Exporting a singleton client
export const supabase = createClient(supabaseUrl, supabaseKey);

export interface User {
  email: string;
  password?: string;
  isPremium: boolean;
}

export async function findUserByEmail(email: string): Promise<User | undefined> {
  if (!supabaseUrl) return undefined;
  
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("email", email)
    .single();

  if (error || !data) return undefined;
  
  return {
    email: data.email,
    password: data.password,
    isPremium: data.is_premium
  };
}

export async function createUser(user: User): Promise<User> {
  if (!supabaseUrl) throw new Error("Supabase is not configured");

  const { data, error } = await supabase
    .from("users")
    .insert([{ 
      email: user.email, 
      password: user.password, 
      is_premium: user.isPremium 
    }])
    .select()
    .single();

  if (error) throw new Error(error.message);
  
  return {
    email: data.email,
    password: data.password,
    isPremium: data.is_premium
  };
}

export async function updateUser(email: string, updates: Partial<User>) {
  if (!supabaseUrl) return;

  const dbUpdates: any = {};
  if (updates.isPremium !== undefined) dbUpdates.is_premium = updates.isPremium;
  if (updates.password !== undefined) dbUpdates.password = updates.password;

  const { error } = await supabase
    .from("users")
    .update(dbUpdates)
    .eq("email", email);

  if (error) {
    console.error("Failed to update user in Supabase:", error.message);
  }
}
