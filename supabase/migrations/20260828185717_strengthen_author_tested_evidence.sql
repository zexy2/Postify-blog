-- Keep author-tested evidence meaningful across every write path, not only the editor UI.
-- Production preflight on 2026-08-28 found 0 author-tested rows, so this is additive
-- integrity hardening with no existing production rows to invalidate.

create or replace function public.enforce_post_evidence_integrity()
returns trigger
language plpgsql
security invoker
set search_path = pg_catalog
as $$
begin
  if new.tested_at is not null and new.tested_at > pg_catalog.now() + interval '5 minutes' then
    raise exception 'tested_at cannot be in the future';
  end if;

  if new.evidence_status = 'author-tested' then
    if new.tested_at is null then
      raise exception 'author-tested requires tested_at';
    end if;

    if pg_catalog.jsonb_typeof(new.environment) <> 'array'
      or not exists (
        select 1
        from pg_catalog.jsonb_array_elements_text(new.environment) as environment_item(value)
        where pg_catalog.char_length(pg_catalog.btrim(environment_item.value)) >= 3
      ) then
      raise exception 'author-tested requires meaningful environment evidence';
    end if;

    if pg_catalog.jsonb_typeof(new.verification_steps) <> 'array'
      or not exists (
        select 1
        from pg_catalog.jsonb_array_elements_text(new.verification_steps) as verification_item(value)
        where pg_catalog.char_length(pg_catalog.btrim(verification_item.value)) >= 12
      ) then
      raise exception 'author-tested requires meaningful verification steps';
    end if;
  end if;

  return new;
end;
$$;

-- Re-verification uses the same evidence threshold instead of relying on array non-emptiness.
-- Reject before snapshotting so invalid re-verification attempts do not create revision noise.
create or replace function public.reverify_post(
  target_post_id uuid,
  reverify_reason text default 'Author re-verified evidence'
)
returns public.posts
language plpgsql
security invoker
set search_path = pg_catalog, public
as $$
declare
  target public.posts;
  updated public.posts;
begin
  select * into target from public.posts where id = target_post_id;
  if target.id is null then raise exception 'post not found'; end if;
  if auth.uid() is null or not (
    target.author_id = auth.uid()
    or exists(select 1 from public.profiles where id = auth.uid() and role = 'admin')
  ) then
    raise exception 'not authorized';
  end if;

  if pg_catalog.jsonb_typeof(target.environment) <> 'array'
    or not exists (
      select 1
      from pg_catalog.jsonb_array_elements_text(target.environment) as environment_item(value)
      where pg_catalog.char_length(pg_catalog.btrim(environment_item.value)) >= 3
    )
    or pg_catalog.jsonb_typeof(target.verification_steps) <> 'array'
    or not exists (
      select 1
      from pg_catalog.jsonb_array_elements_text(target.verification_steps) as verification_item(value)
      where pg_catalog.char_length(pg_catalog.btrim(verification_item.value)) >= 12
    ) then
    raise exception 'reverification requires meaningful author-tested evidence';
  end if;

  perform public.capture_post_revision(target_post_id, reverify_reason);
  update public.posts
  set tested_at = pg_catalog.now(),
      evidence_status = 'author-tested',
      evidence_version = evidence_version + 1,
      updated_at = pg_catalog.now()
  where id = target_post_id
  returning * into updated;
  return updated;
end;
$$;
