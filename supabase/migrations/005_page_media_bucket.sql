-- Public storage bucket for page/post media (images uploaded by editors).
-- Path convention: page-media/<site_id>/<uuid>.<ext>
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values (
  'page-media',
  'page-media',
  true,
  10485760, -- 10 MB
  array['image/png','image/jpeg','image/webp','image/gif','image/svg+xml']
)
on conflict (id) do update
  set public = excluded.public,
      file_size_limit = excluded.file_size_limit,
      allowed_mime_types = excluded.allowed_mime_types;

-- Public read access (bucket is public; explicit policy for clarity).
drop policy if exists "page_media_select" on storage.objects;
create policy "page_media_select"
  on storage.objects for select
  to public
  using (bucket_id = 'page-media');

-- Site members can manage objects in their site's folder.
drop policy if exists "page_media_insert" on storage.objects;
create policy "page_media_insert"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'page-media'
    and exists (
      select 1 from public.site_members
      where site_members.site_id = ((storage.foldername(name))[1])::uuid
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

drop policy if exists "page_media_update" on storage.objects;
create policy "page_media_update"
  on storage.objects for update
  to authenticated
  using (
    bucket_id = 'page-media'
    and exists (
      select 1 from public.site_members
      where site_members.site_id = ((storage.foldername(name))[1])::uuid
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );

drop policy if exists "page_media_delete" on storage.objects;
create policy "page_media_delete"
  on storage.objects for delete
  to authenticated
  using (
    bucket_id = 'page-media'
    and exists (
      select 1 from public.site_members
      where site_members.site_id = ((storage.foldername(name))[1])::uuid
        and site_members.user_id = auth.uid()
        and site_members.accepted_at is not null
    )
  );
