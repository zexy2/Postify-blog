-- Security and Storage hardening for the Postify project.
-- Apply after 202608070001_postify_content_model.sql.

-- Public reads need aggregate-like data for the comment UI. Writes remain
-- limited to the authenticated user who owns the like.
drop policy if exists "published comment likes are public" on public.comment_likes;
create policy "published comment likes are public"
  on public.comment_likes for select
  using (exists (
    select 1
    from public.comments c
    join public.posts p on p.id = c.post_id
    where c.id = comment_likes.comment_id
      and p.is_published = true
  ));

drop policy if exists "authenticated users like published comments" on public.comment_likes;
create policy "authenticated users like published comments"
  on public.comment_likes for insert to authenticated
  with check (
    auth.uid() = user_id
    and exists (
      select 1
      from public.comments c
      join public.posts p on p.id = c.post_id
      where c.id = comment_likes.comment_id
        and p.is_published = true
    )
  );

drop policy if exists "users remove their comment likes" on public.comment_likes;
create policy "users remove their comment likes"
  on public.comment_likes for delete to authenticated
  using (auth.uid() = user_id);

revoke insert, update, delete on public.comment_likes from anon;

-- Storage buckets used by storageService. Public means image delivery is
-- cacheable without exposing upload or delete privileges.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values
  ('post-images', 'post-images', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[]),
  ('avatars', 'avatars', true, 5242880, array['image/jpeg', 'image/png', 'image/gif', 'image/webp']::text[])
on conflict (id) do update set
  public = excluded.public,
  file_size_limit = excluded.file_size_limit,
  allowed_mime_types = excluded.allowed_mime_types;

drop policy if exists "public can read post images and avatars" on storage.objects;
create policy "public can read post images and avatars"
  on storage.objects for select
  using (bucket_id in ('post-images', 'avatars'));

drop policy if exists "authenticated users upload post images" on storage.objects;
create policy "authenticated users upload post images"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'post-images'
    and (storage.foldername(name))[1] = 'posts'
  );

drop policy if exists "users upload their avatar" on storage.objects;
create policy "users upload their avatar"
  on storage.objects for insert to authenticated
  with check (
    bucket_id = 'avatars'
    and name like 'avatars/' || (select auth.uid()::text) || '.%'
  );

drop policy if exists "users update their avatar" on storage.objects;
create policy "users update their avatar"
  on storage.objects for update to authenticated
  using (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid()::text)
  )
  with check (
    bucket_id = 'avatars'
    and owner_id = (select auth.uid()::text)
  );

drop policy if exists "users delete their images" on storage.objects;
create policy "users delete their images"
  on storage.objects for delete to authenticated
  using (
    bucket_id in ('post-images', 'avatars')
    and owner_id = (select auth.uid()::text)
  );

