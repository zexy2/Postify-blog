-- Dry-run only: run against the local PostgreSQL verification container after migrations.
-- This replaces the auth.uid stub with a JWT-like GUC lookup and simulates Supabase role grants.
create or replace function auth.uid() returns uuid language sql stable as $$
  select nullif(current_setting('request.jwt.claim.sub', true),'')::uuid
$$;

grant usage on schema public to anon, authenticated;
grant usage on schema auth to authenticated;
grant execute on function auth.uid() to authenticated;
grant select on all tables in schema public to anon, authenticated;
grant insert, update, delete on public.posts, public.post_confirmations, public.post_revisions, public.knowledge_gap_requests, public.user_knowledge_shelf to authenticated;
grant usage, select on all sequences in schema public to authenticated;
grant execute on function public.request_knowledge_gap(text) to authenticated;
grant execute on function public.capture_post_revision(uuid,text) to authenticated;
grant execute on function public.reverify_post(uuid,text) to authenticated;
grant execute on function public.get_post_failure_details(uuid) to authenticated;

delete from public.user_knowledge_shelf where user_id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
delete from public.post_confirmations where user_id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
delete from public.post_revisions where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
delete from public.knowledge_gap_requests where user_id in ('11111111-1111-1111-1111-111111111111','22222222-2222-2222-2222-222222222222');
delete from public.knowledge_gaps where normalized_query='need a deterministic test';
delete from public.posts where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
insert into auth.users(id,email) values
('11111111-1111-1111-1111-111111111111','author@example.test'),
('22222222-2222-2222-2222-222222222222','reader@example.test') on conflict do nothing;
insert into public.profiles(id,email,username) values
('11111111-1111-1111-1111-111111111111','author@example.test','author'),
('22222222-2222-2222-2222-222222222222','reader@example.test','reader') on conflict(id) do nothing;
insert into public.posts(id,slug,title,body,author_id,is_published,outcome,evidence_status,tested_at,environment,verification_steps)
values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','verified-test','Verified test','Body','11111111-1111-1111-1111-111111111111',true,'Outcome','author-tested',now(),'["Node 20"]','["Run check"]')
on conflict(id) do nothing;

-- Trust boundary: clients cannot claim Postify Verified in the database.
do $$
begin
  begin
    update public.posts set evidence_status='postify-verified' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    raise exception 'database accepted a forged Postify Verified claim';
  exception when check_violation then null;
  end;
end $$;

-- Author-tested timestamps cannot be placed in the future.
do $$
begin
  begin
    update public.posts set tested_at=now()+interval '1 day' where id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa';
    raise exception 'future tested_at unexpectedly succeeded';
  exception when others then
    if sqlerrm = 'future tested_at unexpectedly succeeded' then raise; end if;
  end;
end $$;

-- Reader can confirm somebody else's published post.
set role authenticated;
select set_config('request.jwt.claim.sub','22222222-2222-2222-2222-222222222222',false);
insert into public.post_confirmations(post_id,user_id,result,environment,note)
values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','worked','Node 20','passed');

-- Duplicate user+post cannot inflate aggregate; update same row instead.
insert into public.post_confirmations(post_id,user_id,result,environment,note)
values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','22222222-2222-2222-2222-222222222222','worked','Node 20','passed again')
on conflict(post_id,user_id) do update set note=excluded.note, updated_at=now();

-- Shelf is writable by owner.
insert into public.user_knowledge_shelf(user_id,post_id,state)
values('22222222-2222-2222-2222-222222222222','aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','reference');

-- Gap same user/query counts once.
select (public.request_knowledge_gap('Need a deterministic test')).request_count;
select (public.request_knowledge_gap('need   a deterministic test')).request_count;
update public.post_confirmations
set result='failed', environment='Node 20', note='Step 2 failed', updated_at=now()
where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa' and user_id='22222222-2222-2222-2222-222222222222';

-- A non-author cannot use the author-only failure detail RPC.
do $$
begin
  begin
    perform * from public.get_post_failure_details('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa');
    raise exception 'reader unexpectedly accessed author failure details';
  exception when others then
    if sqlerrm <> 'not authorized' then raise; end if;
  end;
end $$;
reset role;

-- Assert aggregate count stayed one.
do $$
begin
  if (select confirmation_count from public.post_evidence_summary where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'duplicate confirmation inflated aggregate';
  end if;
  if (select request_count from public.knowledge_gaps where normalized_query='need a deterministic test') <> 1 then
    raise exception 'duplicate knowledge gap inflated count';
  end if;
end $$;

-- Author cannot confirm own post.
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
do $$
begin
  begin
    insert into public.post_confirmations(post_id,user_id,result)
    values('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','11111111-1111-1111-1111-111111111111','worked');
    raise exception 'self confirmation unexpectedly succeeded';
  exception when insufficient_privilege then null;
  end;
end $$;

-- Author cannot read another user's individual confirmation details.
do $$
begin
  if exists(
    select 1 from public.post_confirmations
    where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa'
      and user_id='22222222-2222-2222-2222-222222222222'
  ) then
    raise exception 'individual confirmation leaked across users';
  end if;
end $$;

-- Author can inspect sanitized failure details for their own post.
do $$
begin
  if (select count(*) from public.get_post_failure_details('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa')) <> 1 then
    raise exception 'author failure detail RPC did not return the expected report';
  end if;
end $$;

-- Author can snapshot + reverify own post.
select (public.capture_post_revision('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','test revision')).revision_number;
select (public.reverify_post('aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa','test reverify')).evidence_version;
reset role;

-- Public aggregate remains visible without exposing confirmation identity.
set role anon;
do $$
begin
  if (select confirmation_count from public.post_evidence_summary where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'public aggregate disappeared after privacy tightening';
  end if;
  if exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='post_evidence_summary' and column_name='user_id'
  ) then
    raise exception 'aggregate view exposes user identity';
  end if;
  if exists(select 1 from public.post_confirmations where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') then
    raise exception 'anon can read raw confirmations';
  end if;
  if exists(select 1 from public.post_revisions where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') then
    raise exception 'anon can read raw revision snapshots';
  end if;
  if exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='post_failure_reports' and column_name in ('user_id','note','environment')
  ) then
    raise exception 'public failure view exposes raw user evidence';
  end if;
  if exists(
    select 1 from information_schema.columns
    where table_schema='public' and table_name='post_revision_history' and column_name='snapshot'
  ) then
    raise exception 'public revision history exposes raw snapshots';
  end if;
  if (select failure_count from public.post_failure_reports where post_id='aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa') <> 1 then
    raise exception 'failure aggregate is incorrect';
  end if;
end $$;
reset role;

-- Reader cannot see author's private shelf row and author cannot see reader's shelf.
set role authenticated;
select set_config('request.jwt.claim.sub','11111111-1111-1111-1111-111111111111',false);
do $$
begin
  if exists(select 1 from public.user_knowledge_shelf where user_id='22222222-2222-2222-2222-222222222222') then
    raise exception 'private shelf leaked across users';
  end if;
end $$;
reset role;

select 'verified knowledge RLS PASS' as result;
