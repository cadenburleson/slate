import { supabase } from "../supabase";
import type { Block, Post } from "./types";

export async function listPosts(siteId: string): Promise<Post[]> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("site_id", siteId)
    .order("updated_at", { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function getPost(id: string): Promise<Post | null> {
  const { data, error } = await supabase
    .from("posts")
    .select("*")
    .eq("id", id)
    .single();
  if (error) throw error;
  return data;
}

export async function createPost(
  siteId: string,
  slug: string,
  title: string
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .insert({
      site_id: siteId,
      slug: slug.startsWith("/") ? slug : `/${slug}`,
      title,
      content_json: [],
      tags: [],
      status: "draft",
    })
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function updatePost(
  id: string,
  updates: {
    title?: string;
    slug?: string;
    content_json?: Block[];
    tags?: string[];
    author?: string;
    meta_description?: string;
    og_image?: string;
  }
): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update(updates)
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function publishPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "published", published_at: new Date().toISOString() })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function unpublishPost(id: string): Promise<Post> {
  const { data, error } = await supabase
    .from("posts")
    .update({ status: "draft", published_at: null })
    .eq("id", id)
    .select()
    .single();
  if (error) throw error;
  return data;
}

export async function deletePost(id: string): Promise<void> {
  const { error } = await supabase.from("posts").delete().eq("id", id);
  if (error) throw error;
}
