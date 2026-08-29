-- Optional canonical source URL for knowledge republished or imported from elsewhere.
-- This is provenance/SEO metadata, not an evidence claim.
alter table public.posts
  add column if not exists canonical_source_url text;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conrelid = 'public.posts'::regclass
      and conname = 'posts_canonical_source_url_http_check'
  ) then
    alter table public.posts
      add constraint posts_canonical_source_url_http_check
      check (
        canonical_source_url is null
        or (
          char_length(canonical_source_url) between 8 and 2048
          and canonical_source_url = btrim(canonical_source_url)
          and canonical_source_url ~* '^https?://[^[:space:]]+$'
        )
      );
  end if;
end $$;

comment on column public.posts.canonical_source_url is
  'Optional original/preferred HTTP(S) URL for republished knowledge. Separate from evidence sources.';
