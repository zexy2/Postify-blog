-- Postify canonical content model.
-- Apply after the Postify base schema migration has completed.

create extension if not exists pgcrypto;

alter table public.posts add column if not exists title text;
alter table public.posts add column if not exists body text;
alter table public.posts add column if not exists created_at timestamptz default now();
alter table public.posts add column if not exists slug text;
alter table public.posts add column if not exists excerpt text;
alter table public.posts add column if not exists body_html text;
alter table public.posts add column if not exists cover_image_url text;
alter table public.posts add column if not exists category text;
alter table public.posts add column if not exists reading_time integer;
alter table public.posts add column if not exists author_id uuid;
alter table public.posts add column if not exists is_published boolean default true;
alter table public.posts add column if not exists published_at timestamptz;
alter table public.posts add column if not exists updated_at timestamptz default now();
alter table public.profiles add column if not exists role text default 'user';
alter table public.profiles add column if not exists created_at timestamptz default now();

update public.posts
set is_published = true
where is_published is null;

update public.posts
set published_at = coalesce(published_at, created_at, now())
where published_at is null;

create unique index if not exists posts_slug_unique_idx
  on public.posts (slug);

create table if not exists public.post_translations (
  post_id text not null,
  locale text not null check (locale in ('tr', 'en')),
  title text not null,
  excerpt text not null default '',
  body text not null,
  body_html text not null default '',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  primary key (post_id, locale)
);

create index if not exists post_translations_locale_idx
  on public.post_translations (locale);

alter table public.posts enable row level security;
alter table public.post_translations enable row level security;
alter table public.profiles enable row level security;
alter table public.comments enable row level security;

drop policy if exists "published posts are public" on public.posts;
create policy "published posts are public"
  on public.posts for select
  using (is_published = true or auth.uid() = author_id);

drop policy if exists "authenticated users create their posts" on public.posts;
create policy "authenticated users create their posts"
  on public.posts for insert to authenticated
  with check (auth.uid() = author_id);

drop policy if exists "authors update their posts" on public.posts;
create policy "authors update their posts"
  on public.posts for update to authenticated
  using (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "authors delete their posts" on public.posts;
create policy "authors delete their posts"
  on public.posts for delete to authenticated
  using (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "published translations are public" on public.post_translations;
create policy "published translations are public"
  on public.post_translations for select
  using (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.is_published = true or public.posts.author_id = auth.uid())
  ));

drop policy if exists "authors manage translations" on public.post_translations;
create policy "authors manage translations"
  on public.post_translations for all to authenticated
  using (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  ))
  with check (exists (
    select 1 from public.posts
    where public.posts.id::text = post_translations.post_id
      and (public.posts.author_id = auth.uid() or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  ));

drop policy if exists "profiles are public" on public.profiles;
create policy "profiles are public"
  on public.profiles for select
  using (true);

drop policy if exists "users create their profile" on public.profiles;
create policy "users create their profile"
  on public.profiles for insert to authenticated
  with check (auth.uid() = id);

drop policy if exists "users update their profile" on public.profiles;
create policy "users update their profile"
  on public.profiles for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

drop policy if exists "published post comments are public" on public.comments;
create policy "published post comments are public"
  on public.comments for select
  using (exists (
    select 1 from public.posts
    where public.posts.id = comments.post_id
      and public.posts.is_published = true
  ));

drop policy if exists "authenticated users create comments" on public.comments;
create policy "authenticated users create comments"
  on public.comments for insert to authenticated
  with check (
    auth.uid() = author_id
    and exists (
      select 1 from public.posts
      where public.posts.id = comments.post_id
        and public.posts.is_published = true
    )
  );

drop policy if exists "authors manage their comments" on public.comments;
create policy "authors manage their comments"
  on public.comments for update to authenticated
  using (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'))
  with check (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

drop policy if exists "authors delete their comments" on public.comments;
create policy "authors delete their comments"
  on public.comments for delete to authenticated
  using (auth.uid() = author_id or exists (select 1 from public.profiles where id = auth.uid() and role = 'admin'));

-- Explicitly deny anonymous writes even if an older project grant existed.
revoke insert, update, delete on public.posts from anon;
revoke insert, update, delete on public.post_translations from anon;
revoke insert, update, delete on public.comments from anon;
