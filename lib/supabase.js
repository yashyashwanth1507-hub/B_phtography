import { createClient } from "@supabase/supabase-js";

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  console.warn("Supabase env vars missing. Check NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY.");
}

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// ── Auth helpers ─────────────────────────────────────────────────────────────

export async function signIn(email, password) {
  const { data, error } = await supabase.auth.signInWithPassword({ email, password });
  return { data, error };
}

export async function signOut() {
  return supabase.auth.signOut();
}

export async function getSession() {
  const { data } = await supabase.auth.getSession();
  return data.session;
}

export function onAuthChange(callback) {
  return supabase.auth.onAuthStateChange((_event, session) => callback(session));
}

// ── Storage helpers ──────────────────────────────────────────────────────────

const BUCKET = "portfolio_images";

export async function uploadImage(file) {
  const ext = file.name.split(".").pop();
  const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await supabase.storage.from(BUCKET).upload(filename, file, {
    cacheControl: "3600",
    upsert: false,
  });
  if (error) throw error;
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(filename);
  return data.publicUrl;
}

export async function deleteImage(imageUrl) {
  // Extract file path from full URL
  const urlParts = imageUrl.split(`/${BUCKET}/`);
  if (urlParts.length < 2) return;
  const filePath = urlParts[1];
  await supabase.storage.from(BUCKET).remove([filePath]);
}

// ── Portfolio DB helpers ─────────────────────────────────────────────────────

export async function fetchPhotos() {
  const { data, error } = await supabase
    .from("portfolio")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data;
}

export async function insertPhoto({ title, description, category, image_url }) {
  const { data, error } = await supabase
    .from("portfolio")
    .insert([{ title, description, category, image_url, created_at: new Date().toISOString() }])
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePhoto(id, { title, description, category, image_url }) {
  const payload = { title, description, category };
  if (image_url) payload.image_url = image_url;
  const { data, error } = await supabase
    .from("portfolio")
    .update(payload)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePhoto(id, imageUrl) {
  const { error } = await supabase.from("portfolio").delete().eq("id", id);
  if (error) throw error;
  if (imageUrl) await deleteImage(imageUrl).catch(() => {});
}
