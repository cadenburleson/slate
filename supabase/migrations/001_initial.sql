-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ─── Sites ────────────────────────────────────────────────────────────────────
create table sites (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null references auth.users(id) on delete cascade,
  domain text not null unique,
  sitemap_url text,
  detected_platform text,
  snippet_token text not null unique default gen_random_uuid()::text,
  injection_selector text,
  header_html text,
  footer_html text,
  stripe_account_id text,
  created_at timestamptz not null default now()
);

-- ─── Site Members ─────────────────────────────────────────────────────────────
create table site_members (
  site_id uuid not null references sites(id) on delete cascade,
  user_id uuid references auth.users(id) on delete cascade,
  role text not null check (role in ('owner', 'editor')),
  invited_email text,
  invite_token text unique,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- ─── Content Types ────────────────────────────────────────────────────────────
create table content_types (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  name text not null,
  url_pattern text not null,
  type text not null check (type in ('page', 'post')),
  confidence float not null default 0,
  confirmed bool not null default false
);

-- ─── Pages ───────────────────────────────────────────────────────────────────
create table pages (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  slug text not null,
  title text not null,
  meta_description text,
  og_image text,
  content_json jsonb not null default '[]'::jsonb,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

-- ─── Posts ───────────────────────────────────────────────────────────────────
create table posts (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  slug text not null,
  title text not null,
  meta_description text,
  og_image text,
  content_json jsonb not null default '[]'::jsonb,
  tags text[] not null default '{}',
  author text,
  status text not null default 'draft' check (status in ('draft', 'published')),
  published_at timestamptz,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (site_id, slug)
);

-- ─── Media ───────────────────────────────────────────────────────────────────
create table media (
  id uuid primary key default gen_random_uuid(),
  site_id uuid not null references sites(id) on delete cascade,
  url text not null,
  filename text not null,
  size int not null,
  uploaded_at timestamptz not null default now()
);

-- ─── Auto-update updated_at ───────────────────────────────────────────────────
create or replace function update_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger pages_updated_at before update on pages
  for each row execute function update_updated_at();

create trigger posts_updated_at before update on posts
  for each row execute function update_updated_at();

-- ─── Row Level Security ───────────────────────────────────────────────────────
alter table sites enable row level security;
alter table site_members enable row level security;
alter table content_types enable row level security;
alter table pages enable row level security;
alter table posts enable row level security;
alter table media enable row level security;

-- Sites: visible to members only
create policy "sites_select" on sites for select
  using (
    auth.uid() = owner_id
    or exists (
      select 1 from site_members
      where site_members.site_id = sites.id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "sites_insert" on sites for insert
  with check (auth.uid() = owner_id);

create policy "sites_update" on sites for update
  using (auth.uid() = owner_id);

create policy "sites_delete" on sites for delete
  using (auth.uid() = owner_id);

-- Site members: members can read, owners can write
create policy "members_select" on site_members for select
  using (
    exists (
      select 1 from sites
      where sites.id = site_members.site_id
        and (
          sites.owner_id = auth.uid()
          or exists (
            select 1 from site_members sm2
            where sm2.site_id = sites.id
              and sm2.user_id = auth.uid()
              and sm2.accepted_at is not null
          )
        )
    )
  );

create policy "members_insert" on site_members for insert
  with check (
    exists (
      select 1 from sites
      where sites.id = site_members.site_id
        and sites.owner_id = auth.uid()
    )
  );

create policy "members_delete" on site_members for delete
  using (
    exists (
      select 1 from sites
      where sites.id = site_members.site_id
        and sites.owner_id = auth.uid()
    )
  );

-- Pages/posts: members can read+write, public can read published
create policy "pages_select" on pages for select
  using (
    status = 'published'
    or exists (
      select 1 from site_members
      where site_members.site_id = pages.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "pages_insert" on pages for insert
  with check (
    exists (
      select 1 from site_members
      where site_members.site_id = pages.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "pages_update" on pages for update
  using (
    exists (
      select 1 from site_members
      where site_members.site_id = pages.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "pages_delete" on pages for delete
  using (
    exists (
      select 1 from sites
      where sites.id = pages.site_id
        and sites.owner_id = auth.uid()
    )
  );

-- Same for posts
create policy "posts_select" on posts for select
  using (
    status = 'published'
    or exists (
      select 1 from site_members
      where site_members.site_id = posts.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "posts_insert" on posts for insert
  with check (
    exists (
      select 1 from site_members
      where site_members.site_id = posts.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "posts_update" on posts for update
  using (
    exists (
      select 1 from site_members
      where site_members.site_id = posts.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "posts_delete" on posts for delete
  using (
    exists (
      select 1 from sites
      where sites.id = posts.site_id
        and sites.owner_id = auth.uid()
    )
  );

-- Content types: same as pages
create policy "content_types_select" on content_types for select
  using (
    exists (
      select 1 from site_members
      where site_members.site_id = content_types.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

-- Media: members only
create policy "media_select" on media for select
  using (
    exists (
      select 1 from site_members
      where site_members.site_id = media.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

create policy "media_insert" on media for insert
  with check (
    exists (
      select 1 from site_members
      where site_members.site_id = media.site_id
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );
