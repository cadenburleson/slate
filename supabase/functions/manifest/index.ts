// Slate /manifest endpoint
//
// Public endpoint called by snippet/slate.js with ?site=<snippet_token>.
// Returns the list of published page+post slugs for that site so the
// snippet can decide whether to render Slate content for the current URL.
//
// Auth: snippet_token in the query string. The site row is members-only
// under RLS, so we look it up with the service role and only expose the
// resolved id, never the row.

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
      "Cache-Control": "public, max-age=60",
      ...(init.headers ?? {}),
    },
  });

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const url = new URL(req.url);
  const token = url.searchParams.get("site");
  if (!token) {
    return json({ error: "missing site param" }, { status: 400 });
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

  if (!site) return json({ slugs: [] });

  const [pagesRes, postsRes] = await Promise.all([
    supabase
      .from("pages")
      .select("slug")
      .eq("site_id", site.id)
      .eq("status", "published"),
    supabase
      .from("posts")
      .select("slug")
      .eq("site_id", site.id)
      .eq("status", "published"),
  ]);

  // existsOnSite: false makes the snippet rebuild the body from cached
  // header/footer rather than swapping <main>. This is the safer default
  // for testing because it works whether or not a static HTML file exists
  // at the same path.
  const slugs = [
    ...(pagesRes.data ?? []).map((r) => ({
      slug: r.slug,
      type: "page",
      existsOnSite: false,
    })),
    ...(postsRes.data ?? []).map((r) => ({
      slug: r.slug,
      type: "post",
      existsOnSite: false,
    })),
  ];

  return json({ slugs });
});
