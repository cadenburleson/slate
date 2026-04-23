import { supabase } from "../supabase";
import type { SiteMember } from "./types";

export async function listMembers(siteId: string): Promise<SiteMember[]> {
  const { data, error } = await supabase
    .from("site_members")
    .select("*")
    .eq("site_id", siteId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function inviteMember(
  siteId: string,
  email: string
): Promise<SiteMember> {
  const token = crypto.randomUUID();
  const { data, error } = await supabase
    .from("site_members")
    .insert({
      site_id: siteId,
      user_id: null,
      role: "editor",
      invited_email: email,
      invite_token: token,
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function removeMember(
  siteId: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("site_members")
    .delete()
    .eq("site_id", siteId)
    .eq("user_id", userId);
  if (error) throw error;
}

export async function acceptInvite(
  token: string,
  userId: string
): Promise<void> {
  const { error } = await supabase
    .from("site_members")
    .update({ user_id: userId, accepted_at: new Date().toISOString() })
    .eq("invite_token", token);
  if (error) throw error;
}
