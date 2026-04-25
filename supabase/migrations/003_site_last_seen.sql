-- Track when the snippet last pinged the manifest endpoint, so the dashboard
-- can show a "Connected" indicator. Written by the manifest edge function
-- using the service role, so no RLS policy changes are needed.

alter table public.sites
  add column if not exists last_seen_at timestamptz,
  add column if not exists last_seen_referer text;
