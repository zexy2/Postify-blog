-- Keep privileged row mutation/read helpers outside the exposed public API
-- schema. Public RPCs preserve their existing signatures but run as the
-- caller and delegate to narrowly scoped private SECURITY DEFINER helpers.

create schema if not exists private;
revoke all on schema private from public;
grant usage on schema private to anon, authenticated;

create or replace function private.request_knowledge_gap_impl(query_text text)
returns public.knowledge_gaps
language plpgsql
security definer
set search_path = pg_catalog
as $$
declare
  normalized text;
  gap public.knowledge_gaps;
  inserted_request boolean := false;
begin
  if auth.uid() is null then
    raise exception 'authentication required';
  end if;

  normalized := lower(regexp_replace(trim(query_text), '[[:space:]]+', ' ', 'g'));
  if length(normalized) < 3 or length(normalized) > 200 then
    raise exception 'invalid query';
  end if;

  insert into public.knowledge_gaps(normalized_query, display_query)
  values(normalized, left(trim(query_text), 200))
  on conflict(normalized_query) do update set last_requested_at = now()
  returning * into gap;

  insert into public.knowledge_gap_requests(gap_id, user_id)
  values(gap.id, auth.uid())
  on conflict do nothing;
  get diagnostics inserted_request = row_count;

  if inserted_request then
    update public.knowledge_gaps
    set request_count = (
      select count(*) from public.knowledge_gap_requests where gap_id = gap.id
    ), last_requested_at = now()
    where id = gap.id
    returning * into gap;
  end if;

  return gap;
end;
$$;

create or replace function private.get_post_failure_details_impl(target_post_id uuid)
returns table(environment text, note text, updated_at timestamptz)
language plpgsql
security definer
set search_path = pg_catalog
as $$
begin
  if auth.uid() is null or not exists(
    select 1
    from public.posts p
    where p.id = target_post_id
      and (
        p.author_id = auth.uid()
        or exists(
          select 1 from public.profiles where id = auth.uid() and role = 'admin'
        )
      )
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select c.environment, c.note, c.updated_at
  from public.post_confirmations c
  where c.post_id = target_post_id and c.result = 'failed'
  order by c.updated_at desc
  limit 50;
end;
$$;

revoke all on function private.request_knowledge_gap_impl(text) from public;
revoke all on function private.request_knowledge_gap_impl(text) from anon;
revoke all on function private.request_knowledge_gap_impl(text) from authenticated;
revoke all on function private.get_post_failure_details_impl(uuid) from public;
revoke all on function private.get_post_failure_details_impl(uuid) from anon;
revoke all on function private.get_post_failure_details_impl(uuid) from authenticated;
grant execute on function private.request_knowledge_gap_impl(text) to authenticated;
grant execute on function private.get_post_failure_details_impl(uuid) to authenticated;

create or replace function public.request_knowledge_gap(query_text text)
returns public.knowledge_gaps
language plpgsql
security invoker
set search_path = pg_catalog
as $$
declare
  gap public.knowledge_gaps;
begin
  select * into gap from private.request_knowledge_gap_impl(query_text);
  return gap;
end;
$$;

create or replace function public.get_post_failure_details(target_post_id uuid)
returns table(environment text, note text, updated_at timestamptz)
language sql
security invoker
set search_path = pg_catalog
as $$
  select d.environment, d.note, d.updated_at
  from private.get_post_failure_details_impl(target_post_id) d
$$;

revoke all on function public.request_knowledge_gap(text) from public;
revoke all on function public.request_knowledge_gap(text) from anon;
revoke all on function public.get_post_failure_details(uuid) from public;
revoke all on function public.get_post_failure_details(uuid) from anon;
grant execute on function public.request_knowledge_gap(text) to authenticated;
grant execute on function public.get_post_failure_details(uuid) to authenticated;
