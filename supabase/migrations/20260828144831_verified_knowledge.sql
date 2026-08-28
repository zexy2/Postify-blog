-- Postify Verified Knowledge: additive production schema.
-- Safe intent: no destructive changes to existing posts/comments/profiles.

create extension if not exists pgcrypto;

alter table public.posts add column if not exists content_type text
  check (content_type in ('guide','decision','explainer','fieldNote'));
alter table public.posts add column if not exists outcome text not null default '';
alter table public.posts add column if not exists evidence_status text not null default 'unverified'
  check (evidence_status in ('unverified','author-tested','postify-verified'));
alter table public.posts add column if not exists tested_at timestamptz;
alter table public.posts add column if not exists stale_after_days integer not null default 180
  check (stale_after_days between 7 and 1095);
alter table public.posts add column if not exists environment jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists prerequisites jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists verification_steps jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists caveats jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists sources jsonb not null default '[]'::jsonb;
alter table public.posts add column if not exists evidence_version integer not null default 1 check (evidence_version > 0);

create table if not exists public.post_confirmations (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  result text not null check (result in ('worked','failed')),
  environment text not null default '' check (length(environment) <= 500),
  note text not null default '' check (length(note) <= 2000),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique(post_id, user_id)
);
create index if not exists post_confirmations_post_idx on public.post_confirmations(post_id, updated_at desc);

create table if not exists public.post_revisions (
  id uuid primary key default gen_random_uuid(),
  post_id uuid not null references public.posts(id) on delete cascade,
  author_id uuid references public.profiles(id) on delete set null,
  revision_number integer not null check (revision_number > 0),
  reason text not null default '' check (length(reason) <= 1000),
  snapshot jsonb not null,
  created_at timestamptz not null default now(),
  unique(post_id, revision_number)
);
create index if not exists post_revisions_post_idx on public.post_revisions(post_id, revision_number desc);

create table if not exists public.knowledge_gaps (
  id uuid primary key default gen_random_uuid(),
  normalized_query text not null unique,
  display_query text not null,
  request_count integer not null default 1 check (request_count > 0),
  last_requested_at timestamptz not null default now(),
  created_at timestamptz not null default now()
);

create table if not exists public.knowledge_gap_requests (
  gap_id uuid not null references public.knowledge_gaps(id) on delete cascade,
  user_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key(gap_id, user_id)
);

create table if not exists public.user_knowledge_shelf (
  user_id uuid not null references public.profiles(id) on delete cascade,
  post_id uuid not null references public.posts(id) on delete cascade,
  state text not null check (state in ('saved','try','using','reference')),
  updated_at timestamptz not null default now(),
  primary key(user_id, post_id)
);

-- Aggregate view never exposes user IDs or notes.
create or replace view public.post_failure_reports as
select c.id, c.post_id, c.environment, c.note, c.updated_at
from public.post_confirmations c
join public.posts p on p.id=c.post_id
where p.is_published=true and c.result='failed' and length(trim(c.note)) > 0;

create or replace view public.post_evidence_summary as
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
group by p.id;

-- Revision snapshot helper: only post owners/admins can call through write policies.
create or replace function public.capture_post_revision(target_post_id uuid, revision_reason text default '')
returns public.post_revisions
language plpgsql
security invoker
set search_path = public
as $$
declare
  target public.posts;
  next_revision integer;
  inserted public.post_revisions;
begin
  select * into target from public.posts where id = target_post_id;
  if target.id is null then raise exception 'post not found'; end if;
  if auth.uid() is null or not (
    target.author_id = auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin')
  ) then raise exception 'not authorized'; end if;
  select coalesce(max(revision_number),0)+1 into next_revision from public.post_revisions where post_id=target_post_id;
  insert into public.post_revisions(post_id,author_id,revision_number,reason,snapshot)
  values(target_post_id,auth.uid(),next_revision,left(coalesce(revision_reason,''),1000),to_jsonb(target)) returning * into inserted;
  return inserted;
end;
$$;

create or replace function public.reverify_post(target_post_id uuid, reverify_reason text default 'Author re-verified evidence')
returns public.posts
language plpgsql
security invoker
set search_path = public
as $$
declare
  target public.posts;
  updated public.posts;
begin
  select * into target from public.posts where id=target_post_id;
  if target.id is null then raise exception 'post not found'; end if;
  if auth.uid() is null or not (target.author_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin')) then raise exception 'not authorized'; end if;
  perform public.capture_post_revision(target_post_id, reverify_reason);
  update public.posts set tested_at=now(), evidence_status=case when jsonb_array_length(environment)>0 and jsonb_array_length(verification_steps)>0 then 'author-tested' else 'unverified' end, evidence_version=evidence_version+1, updated_at=now() where id=target_post_id returning * into updated;
  return updated;
end;
$$;

-- Atomic demand recording without fake counts; each authenticated user counts once.
create or replace function public.request_knowledge_gap(query_text text)
returns public.knowledge_gaps
language plpgsql
security definer
set search_path = public
as $$
declare
  normalized text;
  gap public.knowledge_gaps;
  inserted_request boolean := false;
begin
  if auth.uid() is null then raise exception 'authentication required'; end if;
  normalized := lower(regexp_replace(trim(query_text), '\\s+', ' ', 'g'));
  if length(normalized) < 3 or length(normalized) > 200 then raise exception 'invalid query'; end if;
  insert into public.knowledge_gaps(normalized_query,display_query)
  values(normalized,left(trim(query_text),200))
  on conflict(normalized_query) do update set last_requested_at=now()
  returning * into gap;
  insert into public.knowledge_gap_requests(gap_id,user_id) values(gap.id,auth.uid())
    on conflict do nothing;
  get diagnostics inserted_request = row_count;
  if inserted_request then
    update public.knowledge_gaps set request_count=(select count(*) from public.knowledge_gap_requests where gap_id=gap.id), last_requested_at=now() where id=gap.id returning * into gap;
  end if;
  return gap;
end;
$$;

alter table public.post_confirmations enable row level security;
alter table public.post_revisions enable row level security;
alter table public.knowledge_gaps enable row level security;
alter table public.knowledge_gap_requests enable row level security;
alter table public.user_knowledge_shelf enable row level security;

-- Public evidence summary; individual confirmation notes/environments are authenticated-only.
drop policy if exists "authenticated read confirmations" on public.post_confirmations;
create policy "authenticated read confirmations" on public.post_confirmations for select to authenticated using (true);
drop policy if exists "users create confirmation" on public.post_confirmations;
create policy "users create confirmation" on public.post_confirmations for insert to authenticated with check (auth.uid()=user_id and exists(select 1 from public.posts p where p.id=post_id and p.is_published=true and p.author_id is distinct from auth.uid()));
drop policy if exists "users update confirmation" on public.post_confirmations;
create policy "users update confirmation" on public.post_confirmations for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id and exists(select 1 from public.posts p where p.id=post_id and p.is_published=true and p.author_id is distinct from auth.uid()));
drop policy if exists "users delete confirmation" on public.post_confirmations;
create policy "users delete confirmation" on public.post_confirmations for delete to authenticated using(auth.uid()=user_id);

-- Public revision history is safe because snapshot contains public post content only.
drop policy if exists "published revisions public" on public.post_revisions;
create policy "published revisions public" on public.post_revisions for select using(exists(select 1 from public.posts p where p.id=post_id and p.is_published=true));
drop policy if exists "authors insert revisions" on public.post_revisions;
create policy "authors insert revisions" on public.post_revisions for insert to authenticated with check(exists(select 1 from public.posts p where p.id=post_id and (p.author_id=auth.uid() or exists(select 1 from public.profiles where id=auth.uid() and role='admin'))));

-- Gap aggregate is public; requester identities are private.
drop policy if exists "gaps public" on public.knowledge_gaps;
create policy "gaps public" on public.knowledge_gaps for select using(true);
drop policy if exists "gap requests own read" on public.knowledge_gap_requests;
create policy "gap requests own read" on public.knowledge_gap_requests for select to authenticated using(auth.uid()=user_id);

-- Shelf is private to its owner.
drop policy if exists "users read own shelf" on public.user_knowledge_shelf;
create policy "users read own shelf" on public.user_knowledge_shelf for select to authenticated using(auth.uid()=user_id);
drop policy if exists "users insert own shelf" on public.user_knowledge_shelf;
create policy "users insert own shelf" on public.user_knowledge_shelf for insert to authenticated with check(auth.uid()=user_id);
drop policy if exists "users update own shelf" on public.user_knowledge_shelf;
create policy "users update own shelf" on public.user_knowledge_shelf for update to authenticated using(auth.uid()=user_id) with check(auth.uid()=user_id);
drop policy if exists "users delete own shelf" on public.user_knowledge_shelf;
create policy "users delete own shelf" on public.user_knowledge_shelf for delete to authenticated using(auth.uid()=user_id);

revoke insert,update,delete on public.post_confirmations,public.post_revisions,public.knowledge_gaps,public.knowledge_gap_requests,public.user_knowledge_shelf from anon;
grant select on public.post_evidence_summary to anon, authenticated;
grant select on public.post_failure_reports to anon, authenticated;
grant execute on function public.request_knowledge_gap(text) to authenticated;
grant execute on function public.capture_post_revision(uuid,text) to authenticated;
grant execute on function public.reverify_post(uuid,text) to authenticated;
