-- Per-page toggles to surface a page in the host site's nav or footer,
-- plus optional CSS selector overrides on the site for non-standard markup.
-- The snippet auto-detects <nav> and <footer> by default.

alter table public.pages
  add column if not exists show_in_nav boolean not null default false,
  add column if not exists show_in_footer boolean not null default false,
  add column if not exists nav_label text,
  add column if not exists nav_order int not null default 0;

alter table public.sites
  add column if not exists nav_selector text,
  add column if not exists footer_selector text;
