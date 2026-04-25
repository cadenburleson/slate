-- Fix infinite recursion between sites/site_members SELECT policies.
-- sites_select queried site_members; members_select queried sites; each fired the other.
-- Use a SECURITY DEFINER helper that bypasses RLS for the membership check.

create or replace function public.is_site_member(_site_id uuid)
returns boolean
language sql
security definer
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.site_members
    where site_id = _site_id
      and user_id = auth.uid()
      and accepted_at is not null
  );
$$;

drop policy if exists "sites_select" on public.sites;
create policy "sites_select" on public.sites for select
  using (auth.uid() = owner_id or public.is_site_member(id));

drop policy if exists "members_select" on public.site_members;
create policy "members_select" on public.site_members for select
  using (
    user_id = auth.uid()
    or exists (
      select 1 from public.sites
      where sites.id = site_members.site_id
        and sites.owner_id = auth.uid()
    )
  );
