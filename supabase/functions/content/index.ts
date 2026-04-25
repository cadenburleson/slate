// Slate /content endpoint
//
// Public endpoint called by snippet/slate.js with ?site=<snippet_token>&slug=<path>.
// Returns the title/meta/content_json for one published page or post.

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey",
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
      ...(init.headers ?? {}),
    },
  });

const SELECT = "title, meta_description, og_image, content_json";

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("site");
  const slug = url.searchParams.get("slug");
  if (!token || !slug) {
    return json({ error: "missing site or slug param" }, { status: 400 });
  }

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
    { auth: { persistSession: false } },
  );

  const { data: site } = await supabase
    .from("sites")
    .select("id")
    .eq("snippet_token", token)
    .maybeSingle();

  if (!site) return json({ error: "site not found" }, { status: 404 });

  // Try pages first, then posts. Slug uniqueness is per (site_id, slug)
  // within each table but a site could conceivably have a page and post
  // at the same slug — pages win.
  const { data: page } = await supabase
    .from("pages")
    .select(SELECT)
    .eq("site_id", site.id)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (page) return json(page);

  const { data: post } = await supabase
    .from("posts")
    .select(SELECT)
    .eq("site_id", site.id)
    .eq("slug", slug)
    .eq("status", "published")
    .maybeSingle();

  if (post) return json(post);

  return json({ error: "not found" }, { status: 404 });
});
