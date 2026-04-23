import { supabase } from "../supabase";
import type { Block, Page } from "./types";

export async function listPages(siteId: string): Promise<Page[]> {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPage(id: string): Promise<Page | null> {
  const { data, error } = await supabase
    .from("pages")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPage(
  siteId: string,
  slug: string,
  title: string
): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .insert({
      site_id: siteId,
      slug: slug.startsWith("/") ? slug : `/${slug}`,
      title,
      content_json: [],
      status: "draft",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePage(
  id: string,
  updates: { title?: string; slug?: string; content_json?: Block[]; meta_description?: string; og_image?: string }
): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publishPage(id: string): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unpublishPage(id: string): Promise<Page> {
  const { data, error } = await supabase
    .from("pages")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePage(id: string): Promise<void> {
  const { error } = await supabase.from("pages").delete().eq("id", id);
  if (error) throw error;
}
