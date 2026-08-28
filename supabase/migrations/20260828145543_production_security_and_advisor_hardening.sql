-- Production follow-up after Verified Knowledge activation.
-- Removes exposed SECURITY DEFINER view behavior, tightens RPC ACLs,
-- and resolves low-risk RLS/index advisor findings without changing product data.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

-- Keep raw evidence private while exposing only deliberately aggregated rows.
-- These helpers live outside the exposed public API schema; the public views
-- are SECURITY INVOKER and callers can execute only these narrow row producers.
create or replace function private.post_evidence_summary_rows()
returns table(
  post_id uuid,
  confirmation_count integer,
  worked_count integer,
  failed_count integer,
  environment_count integer,
  last_community_check_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    p.id as post_id,
    count(c.id)::integer as confirmation_count,
    count(c.id) filter (where c.result = 'worked')::integer as worked_count,
    count(c.id) filter (where c.result = 'failed')::integer as failed_count,
    count(distinct nullif(trim(c.environment), ''))::integer as environment_count,
    max(c.updated_at) as last_community_check_at
  from public.posts p
  left join public.post_confirmations c on c.post_id = p.id
  where p.is_published = true
  group by p.id
$$;

create or replace function private.post_failure_report_rows()
returns table(
  post_id uuid,
  failure_count integer,
  last_failure_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select
    p.id as post_id,
    count(c.id)::integer as failure_count,
    max(c.updated_at) as last_failure_at
  from public.posts p
  left join public.post_confirmations c on c.post_id = p.id and c.result = 'failed'
  where p.is_published = true
  group by p.id
$$;

create or replace function private.post_revision_history_rows()
returns table(
  id uuid,
  post_id uuid,
  revision_number integer,
  reason text,
  created_at timestamptz
)
language sql
stable
security definer
set search_path = pg_catalog
as $$
  select r.id, r.post_id, r.revision_number, r.reason, r.created_at
  from public.post_revisions r
  join public.posts p on p.id = r.post_id
  where p.is_published = true
$$;

revoke all on function private.post_evidence_summary_rows() from public;
revoke all on function private.post_failure_report_rows() from public;
revoke all on function private.post_revision_history_rows() from public;
grant execute on function private.post_evidence_summary_rows() to anon, authenticated;
grant execute on function private.post_failure_report_rows() to anon, authenticated;
grant execute on function private.post_revision_history_rows() to anon, authenticated;

create or replace view public.post_evidence_summary
with (security_invoker = true)
as select * from private.post_evidence_summary_rows();

create or replace view public.post_failure_reports
with (security_invoker = true)
as select * from private.post_failure_report_rows();

create or replace view public.post_revision_history
with (security_invoker = true)
as select * from private.post_revision_history_rows();

grant select on public.post_evidence_summary to anon, authenticated;
grant select on public.post_failure_reports to anon, authenticated;
grant select on public.post_revision_history to anon, authenticated;

-- Trigger-only/authenticated RPC boundaries: do not leave direct anonymous EXECUTE.
revoke all on function public.handle_new_user() from public;
revoke all on function public.handle_new_user() from anon, authenticated;
revoke all on function public.enforce_post_evidence_integrity() from public;
revoke all on function public.enforce_post_evidence_integrity() from anon, authenticated;
revoke execute on function public.request_knowledge_gap(text) from anon;
revoke execute on function public.capture_post_revision(uuid,text) from anon;
revoke execute on function public.reverify_post(uuid,text) from anon;
revoke execute on function public.get_post_failure_details(uuid) from anon;
grant execute on function public.request_knowledge_gap(text) to authenticated;
grant execute on function public.capture_post_revision(uuid,text) to authenticated;
grant execute on function public.reverify_post(uuid,text) to authenticated;
grant execute on function public.get_post_failure_details(uuid) to authenticated;

-- Cover foreign keys used by ownership/deletion paths.
create index if not exists comment_likes_user_idx on public.comment_likes(user_id);
create index if not exists comments_author_idx on public.comments(author_id);
create index if not exists comments_parent_idx on public.comments(parent_id) where parent_id is not null;
create index if not exists knowledge_gap_requests_user_idx on public.knowledge_gap_requests(user_id);
create index if not exists post_confirmations_user_idx on public.post_confirmations(user_id);
create index if not exists post_revisions_author_idx on public.post_revisions(author_id);
create index if not exists posts_author_idx on public.posts(author_id);
create index if not exists user_knowledge_shelf_post_idx on public.user_knowledge_shelf(post_id);

-- `posts.slug` already owns a UNIQUE constraint-backed index (`posts_slug_key`).
drop index if exists public.posts_slug_unique_idx;

-- Cache auth.uid() once per statement instead of re-evaluating it per row.
drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public"
  on public.posts for select
  using (
    is_published = true
    or (select auth.uid()) = author_id
    or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')
  );

drop policy if exists "authenticated users create their posts" on public.posts;
create policy "authenticated users create their posts"
  on public.posts for insert to authenticated
  with check ((select auth.uid()) = author_id);

drop policy if exists "authors update their posts" on public.posts;
create policy "authors update their posts"
  on public.posts for update to authenticated
  using ((select auth.uid()) = author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  with check ((select auth.uid()) = author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'));

drop policy if exists "authors delete their posts" on public.posts;
create policy "authors delete their posts"
  on public.posts for delete to authenticated
  using ((select auth.uid()) = author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'));

drop policy if exists "published translations are public" on public.post_translations;
create policy "published translations are public"
  on public.post_translations for select
  using (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (
        public.posts.is_published = true
        or public.posts.author_id = (select auth.uid())
        or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin')
      )
  ));

drop policy if exists "authors manage translations" on public.post_translations;
drop policy if exists "authors insert translations" on public.post_translations;
drop policy if exists "authors update translations" on public.post_translations;
drop policy if exists "authors delete translations" on public.post_translations;
create policy "authors insert translations"
  on public.post_translations for insert to authenticated
  with check (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ));
create policy "authors update translations"
  on public.post_translations for update to authenticated
  using (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ))
  with check (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ));
create policy "authors delete translations"
  on public.post_translations for delete to authenticated
  using (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ));

drop policy if exists "users create their profile" on public.profiles;
create policy "users create their profile"
  on public.profiles for insert to authenticated
  with check ((select auth.uid()) = id);

drop policy if exists "users update their profile" on public.profiles;
create policy "users update their profile"
  on public.profiles for update to authenticated
  using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "authenticated users create comments" on public.comments;
create policy "authenticated users create comments"
  on public.comments for insert to authenticated
  with check (
    (select auth.uid()) = author_id
    and exists(select 1 from public.posts where public.posts.id=comments.post_id and public.posts.is_published=true)
  );

drop policy if exists "authors manage their comments" on public.comments;
create policy "authors manage their comments"
  on public.comments for update to authenticated
  using ((select auth.uid())=author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  with check ((select auth.uid())=author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'));

drop policy if exists "authors delete their comments" on public.comments;
create policy "authors delete their comments"
  on public.comments for delete to authenticated
  using ((select auth.uid())=author_id or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'));

drop policy if exists "authenticated users like published comments" on public.comment_likes;
create policy "authenticated users like published comments"
  on public.comment_likes for insert to authenticated
  with check (
    (select auth.uid()) = user_id
    and exists (
      select 1 from public.comments c
      join public.posts p on p.id=c.post_id
      where c.id=comment_likes.comment_id and p.is_published=true
    )
  );

drop policy if exists "users remove their comment likes" on public.comment_likes;
create policy "users remove their comment likes"
  on public.comment_likes for delete to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "users create confirmation" on public.post_confirmations;
create policy "users create confirmation" on public.post_confirmations for insert to authenticated
  with check (
    (select auth.uid())=user_id
    and exists(select 1 from public.posts p where p.id=post_id and p.is_published=true and p.author_id is distinct from (select auth.uid()))
  );
drop policy if exists "users update confirmation" on public.post_confirmations;
create policy "users update confirmation" on public.post_confirmations for update to authenticated
  using((select auth.uid())=user_id)
  with check(
    (select auth.uid())=user_id
    and exists(select 1 from public.posts p where p.id=post_id and p.is_published=true and p.author_id is distinct from (select auth.uid()))
  );
drop policy if exists "users delete confirmation" on public.post_confirmations;
create policy "users delete confirmation" on public.post_confirmations for delete to authenticated
  using((select auth.uid())=user_id);
drop policy if exists "users read own confirmation" on public.post_confirmations;
create policy "users read own confirmation" on public.post_confirmations for select to authenticated
  using((select auth.uid())=user_id);

drop policy if exists "authors insert revisions" on public.post_revisions;
create policy "authors insert revisions" on public.post_revisions for insert to authenticated
  with check(exists(
    select 1 from public.posts p
    where p.id=post_id
      and (p.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ));
drop policy if exists "authors read revisions" on public.post_revisions;
create policy "authors read revisions" on public.post_revisions for select to authenticated
  using(exists(
    select 1 from public.posts p
    where p.id=post_id
      and (p.author_id=(select auth.uid()) or exists(select 1 from public.profiles where id=(select auth.uid()) and role='admin'))
  ));

drop policy if exists "gap requests own read" on public.knowledge_gap_requests;
create policy "gap requests own read" on public.knowledge_gap_requests for select to authenticated
  using((select auth.uid())=user_id);

drop policy if exists "users read own shelf" on public.user_knowledge_shelf;
create policy "users read own shelf" on public.user_knowledge_shelf for select to authenticated using((select auth.uid())=user_id);
drop policy if exists "users insert own shelf" on public.user_knowledge_shelf;
create policy "users insert own shelf" on public.user_knowledge_shelf for insert to authenticated with check((select auth.uid())=user_id);
drop policy if exists "users update own shelf" on public.user_knowledge_shelf;
create policy "users update own shelf" on public.user_knowledge_shelf for update to authenticated using((select auth.uid())=user_id) with check((select auth.uid())=user_id);
drop policy if exists "users delete own shelf" on public.user_knowledge_shelf;
create policy "users delete own shelf" on public.user_knowledge_shelf for delete to authenticated using((select auth.uid())=user_id);
