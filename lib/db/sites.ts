import { supabase } from "../supabase";
import type { Site } from "./types";

export async function listSites(userId: string): Promise<Site[]> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("owner_id", userId)
    .order("created_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getSite(id: string): Promise<Site | null> {
  const { data, error } = await supabase
    .from("sites")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createSite(
  domain: string,
  userId: string
): Promise<Site> {
  const snippetToken = crypto.randomUUID();
  const { data, error } = await supabase
    .from("sites")
    .insert({
      owner_id: userId,
      domain: domain.toLowerCase().replace(/^https?:\/\//, "").replace(/\/$/, ""),
      snippet_token: snippetToken,
    })
    .select()
    .single();
  if (error) throw error;

  await supabase.from("site_members").insert({
    site_id: data.id,
    user_id: userId,
    role: "owner",
    accepted_at: new Date().toISOString(),
  });

  return data;
}

export async function updateSite(
  id: string,
  updates: Partial<Site>
): Promise<Site> {
  const { data, error } = await supabase
    .from("sites")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deleteSite(id: string): Promise<void> {
  const { error } = await supabase.from("sites").delete().eq("id", id);
  if (error) throw error;
}
