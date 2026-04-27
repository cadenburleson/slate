// Slate /upload-url endpoint
//
// Mints presigned PUT URLs for uploading image variants to Cloudflare R2.
// Verifies the caller is a member of the target site (mirroring the bucket
// RLS that lived on Supabase Storage in migration 005).

import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "jsr:@supabase/supabase-js@2";
import { AwsClient } from "https://esm.sh/aws4fetch@1.0.20";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
};

const json = (body: unknown, init: ResponseInit = {}) =>
  new Response(JSON.stringify(body), {
    ...init,
    headers: {
      ...corsHeaders,
      "Content-Type": "application/json",
      ...(init.headers ?? {}),
    },
  });

const SIZES = [400, 800, 1600] as const;

const ACCOUNT_ID = Deno.env.get("R2_ACCOUNT_ID")!;
const BUCKET = Deno.env.get("R2_BUCKET")!;
const R2_ENDPOINT = `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`;

const aws = new AwsClient({
  accessKeyId: Deno.env.get("R2_ACCESS_KEY_ID")!,
  secretAccessKey: Deno.env.get("R2_SECRET_ACCESS_KEY")!,
  service: "s3",
  region: "auto",
});

async function presignPut(key: string, contentType: string, expiresIn = 60): Promise<string> {
  const url = new URL(`${R2_ENDPOINT}/${BUCKET}/${key}`);
  url.searchParams.set("X-Amz-Expires", String(expiresIn));
  const signed = await aws.sign(
    new Request(url, { method: "PUT", headers: { "Content-Type": contentType } }),
    { aws: { signQuery: true } },
  );
  return signed.url;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }
  if (req.method !== "POST") {
    return json({ error: "method not allowed" }, { status: 405 });
  }

  const auth = req.headers.get("Authorization");
  if (!auth) return json({ error: "unauthorized" }, { status: 401 });

  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    {
      global: { headers: { Authorization: auth } },
      auth: { persistSession: false },
    },
  );

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return json({ error: "unauthorized" }, { status: 401 });

  let body: { siteId?: unknown; contentType?: unknown };
  try {
    body = await req.json();
  } catch {
    return json({ error: "invalid json body" }, { status: 400 });
  }

  const siteId = typeof body.siteId === "string" ? body.siteId : null;
  const contentType = typeof body.contentType === "string" ? body.contentType : null;
  if (!siteId) return json({ error: "missing siteId" }, { status: 400 });
  if (contentType !== "image/webp") {
    return json({ error: "contentType must be image/webp" }, { status: 400 });
  }

  const { data: member } = await supabase
    .from("site_members")
    .select("user_id")
    .eq("site_id", siteId)
    .eq("user_id", user.id)
    .not("accepted_at", "is", null)
    .maybeSingle();
  if (!member) return json({ error: "forbidden" }, { status: 403 });

  const id = Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
  const stem = `${siteId}/${id}`;

  const uploadUrls: Record<number, string> = {};
  for (const size of SIZES) {
    uploadUrls[size] = await presignPut(`${stem}-${size}.webp`, "image/webp");
  }

  return json({ uploadUrls, key: stem });
});
