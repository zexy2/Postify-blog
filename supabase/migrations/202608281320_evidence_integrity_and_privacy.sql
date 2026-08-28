-- Verified Knowledge hardening: immutable follow-up to 202608280900.
-- Keeps automatic Postify verification outside author-writable post metadata,
-- validates evidence structure, and exposes only privacy-safe public evidence views.

alter table public.posts drop constraint if exists posts_evidence_status_check;
alter table public.posts add constraint posts_evidence_status_check
  check (evidence_status in ('unverified','author-tested'));

alter table public.posts drop constraint if exists posts_environment_array_check;
alter table public.posts add constraint posts_environment_array_check check (jsonb_typeof(environment) = 'array');
alter table public.posts drop constraint if exists posts_prerequisites_array_check;
alter table public.posts add constraint posts_prerequisites_array_check check (jsonb_typeof(prerequisites) = 'array');
alter table public.posts drop constraint if exists posts_verification_steps_array_check;
alter table public.posts add constraint posts_verification_steps_array_check check (jsonb_typeof(verification_steps) = 'array');
alter table public.posts drop constraint if exists posts_caveats_array_check;
alter table public.posts add constraint posts_caveats_array_check check (jsonb_typeof(caveats) = 'array');
alter table public.posts drop constraint if exists posts_sources_array_check;
alter table public.posts add constraint posts_sources_array_check check (jsonb_typeof(sources) = 'array');

create or replace function public.enforce_post_evidence_integrity()
returns trigger
language plpgsql
security invoker
set search_path = public
as $$
begin
  if new.tested_at is not null and new.tested_at > now() + interval '5 minutes' then
    raise exception 'tested_at cannot be in the future';
  end if;
  if new.evidence_status = 'author-tested' then
    if new.tested_at is null then raise exception 'author-tested requires tested_at'; end if;
    if jsonb_typeof(new.environment) <> 'array' or jsonb_array_length(new.environment) = 0 then
      raise exception 'author-tested requires environment evidence';
    end if;
    if jsonb_typeof(new.verification_steps) <> 'array' or jsonb_array_length(new.verification_steps) = 0 then
      raise exception 'author-tested requires verification steps';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists posts_evidence_integrity on public.posts;
create trigger posts_evidence_integrity
before insert or update of evidence_status, tested_at, environment, verification_steps
on public.posts
for each row execute function public.enforce_post_evidence_integrity();

-- Public views expose aggregate/sanitized evidence only; no user id, raw note,
-- environment string, or revision snapshot is published.
drop view if exists public.post_failure_reports;
create view public.post_failure_reports as
select
  p.id as post_id,
  count(c.id)::integer as failure_count,
  max(c.updated_at) as last_failure_at
from public.posts p
left join public.post_confirmations c on c.post_id=p.id and c.result='failed'
where p.is_published=true
group by p.id;

create or replace view public.post_revision_history as
select r.id, r.post_id, r.revision_number, r.reason, r.created_at
from public.post_revisions r
join public.posts p on p.id=r.post_id
where p.is_published=true;

-- Raw confirmation and revision rows are private to their owner/author.
drop policy if exists "authenticated read confirmations" on public.post_confirmations;
drop policy if exists "users read own confirmation" on public.post_confirmations;
create policy "users read own confirmation"
on public.post_confirmations for select to authenticated
using (auth.uid()=user_id);

drop policy if exists "published revisions public" on public.post_revisions;
drop policy if exists "authors read revisions" on public.post_revisions;
create policy "authors read revisions"
on public.post_revisions for select to authenticated
using (
  exists(
    select 1 from public.posts p
    where p.id=post_id
      and (p.author_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin'))
  )
);


-- Authors/admins can inspect failure details for their own posts without exposing contributor identity.
create or replace function public.get_post_failure_details(target_post_id uuid)
returns table(environment text, note text, updated_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
begin
  if auth.uid() is null or not exists(
    select 1 from public.posts p
    where p.id=target_post_id
      and (p.author_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin'))
  ) then
    raise exception 'not authorized';
  end if;

  return query
  select c.environment, c.note, c.updated_at
  from public.post_confirmations c
  where c.post_id=target_post_id and c.result='failed'
  order by c.updated_at desc
  limit 50;
end;
$$;

revoke all on public.post_confirmations,public.post_revisions,public.knowledge_gap_requests,public.user_knowledge_shelf from anon;
revoke all on public.post_confirmations,public.post_revisions from authenticated;
grant select,insert,update,delete on public.post_confirmations to authenticated;
grant select,insert on public.post_revisions to authenticated;
grant select on public.post_evidence_summary to anon, authenticated;
grant select on public.post_failure_reports to anon, authenticated;
grant select on public.post_revision_history to anon, authenticated;

revoke all on function public.request_knowledge_gap(text) from public;
revoke all on function public.capture_post_revision(uuid,text) from public;
revoke all on function public.reverify_post(uuid,text) from public;
revoke all on function public.get_post_failure_details(uuid) from public;
grant execute on function public.request_knowledge_gap(text) to authenticated;
grant execute on function public.capture_post_revision(uuid,text) to authenticated;
grant execute on function public.reverify_post(uuid,text) to authenticated;
grant execute on function public.get_post_failure_details(uuid) to authenticated;
