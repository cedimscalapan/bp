-- Row level security checks for KaPamana. Run after supabase-stub.sql, the migration and seed.
-- Every block raises an exception (and psql stops) if a rule is violated.
\set ON_ERROR_STOP 1
set client_min_messages = warning;

insert into auth.users (id, email) values
  ('00000000-0000-0000-0000-00000000000a', 'admin@kapamana.test'),
  ('00000000-0000-0000-0000-00000000000e', 'editor@kapamana.test'),
  ('00000000-0000-0000-0000-00000000000b', 'traveler@kapamana.test'),
  ('00000000-0000-0000-0000-00000000000c', 'other@kapamana.test');
select public.promote_to_admin('admin@kapamana.test');
update public.profiles set role = 'editor' where email = 'editor@kapamana.test';

create or replace function pg_temp.expect_denied(sql text, why text) returns void language plpgsql as $$
begin
  begin execute sql; exception when insufficient_privilege or check_violation or raise_exception or not_null_violation then return; end;
  raise exception 'EXPECTED DENIAL: %', why;
end $$;
create or replace function pg_temp.act_as(uid text) returns void language plpgsql as $$
begin
  perform set_config('request.jwt.claim.sub', coalesce(uid, ''), false);
  execute format('set role %I', case when uid is null then 'anon' else 'authenticated' end);
end $$;

-- A draft destination must be invisible to the public.
update public.destinations set is_published = false where id = 'oriental_mindoro_victoria';

-- ── anon ──
select pg_temp.act_as(null);
do $$ begin
  if (select count(*) from public.destinations) <> 68 then raise exception 'anon should see 68 published destinations'; end if;
  if (select count(*) from public.history_questions) <> 105 then raise exception 'anon reads history questions'; end if;
end $$;
select pg_temp.expect_denied($$select 1 from public.profiles$$, 'anon read profiles');
select pg_temp.expect_denied($$select 1 from public.player_saves$$, 'anon read saves');
select pg_temp.expect_denied($$insert into public.sources (id, title, publisher, url) values ('x','x','x','https://x')$$, 'anon insert');
select pg_temp.expect_denied($$select public.admin_overview()$$, 'anon overview');
select pg_temp.expect_denied($$select public.handle_new_user()$$, 'trigger function via API');
select pg_temp.expect_denied($$truncate public.player_saves$$, 'anon truncate');
reset role;

-- ── traveler ──
select pg_temp.act_as('00000000-0000-0000-0000-00000000000b');
do $$ begin
  if (select count(*) from public.destinations) <> 68 then raise exception 'traveler should not see drafts'; end if;
  if (select count(*) from public.profiles) <> 1 then raise exception 'traveler sees only own profile'; end if;
  if exists (select 1 from public.content_audit_log) then raise exception 'traveler must not read audit log'; end if;
  update public.shop_powerups set price = 1 where id = 'forcefield';
  if (select price from public.shop_powerups where id = 'forcefield') = 1 then raise exception 'traveler changed a price'; end if;
  delete from public.sources;
  if (select count(*) from public.sources) = 0 then raise exception 'traveler deleted content'; end if;
  insert into public.player_saves (save) values ('{"version":1,"name":"Bea","coins":290,"xp":2175}');
  if (select coins from public.player_saves) <> 290 then raise exception 'generated coins column'; end if;
  update public.player_saves set save = jsonb_set(save, '{coins}', '300');
  update public.profiles set display_name = 'Bea' where id = auth.uid();
end $$;
select pg_temp.expect_denied($$update public.profiles set role = 'admin' where id = auth.uid()$$, 'self-promotion');
select pg_temp.expect_denied($$update public.profiles set email = 'admin@kapamana.test' where id = auth.uid()$$, 'profile email is read-only');
select pg_temp.expect_denied($$truncate public.sources$$, 'truncate bypasses RLS');
select pg_temp.expect_denied($$insert into public.player_saves (user_id, save) values ('00000000-0000-0000-0000-00000000000c', '{}')$$, 'write another player save');
select pg_temp.expect_denied($$insert into public.player_saves (save) values ('[]')$$, 'save must be an object');
reset role;

-- ── other traveler cannot see Bea's save ──
select pg_temp.act_as('00000000-0000-0000-0000-00000000000c');
do $$ begin if exists (select 1 from public.player_saves) then raise exception 'cross-player save leak'; end if; end $$;
reset role;

-- ── editor: full content CRUD, no saves or user management ──
select pg_temp.act_as('00000000-0000-0000-0000-00000000000e');
do $$ declare n int; begin
  if (select count(*) from public.destinations) <> 69 then raise exception 'editor should see drafts'; end if;
  insert into public.announcements (id, title, body, category) values ('typhoon', 'Typhoon advisory', 'Stay safe.', 'advisory');
  update public.announcements set body = 'Stay safe, Mindoro.' where id = 'typhoon';
  if (select updated_by from public.announcements where id = 'typhoon') <> auth.uid() then raise exception 'updated_by not stamped'; end if;
  delete from public.announcements where id = 'typhoon';
  select count(*) into n from public.content_audit_log where record_id = 'typhoon';
  if n <> 3 then raise exception 'expected 3 audit rows, got %', n; end if;
  update public.shop_powerups set price = 210 where id = 'forcefield';
  if ((public.admin_overview() -> 'destinations' ->> 'published')::int) <> 68 then raise exception 'overview count'; end if;
  if exists (select 1 from public.player_saves) then raise exception 'editor must not read saves'; end if;
end $$;
select pg_temp.expect_denied($$update public.profiles set role = 'admin' where email = 'editor@kapamana.test'$$, 'editor self-promotion');
select pg_temp.expect_denied($$insert into public.destinations (id, name, adventure_group, image, signature_item_name, signature_image, levels) values ('x','x','Mars','i','k','k','[]')$$, 'group check constraint');
select pg_temp.expect_denied($$insert into public.sources (id, title, publisher, url) values ('bad','b','b','javascript:alert(1)')$$, 'url check constraint');
reset role;

-- ── admin: roles, saves, last-admin guard ──
select pg_temp.act_as('00000000-0000-0000-0000-00000000000a');
do $$ begin
  if (select count(*) from public.profiles) <> 4 then raise exception 'admin sees all profiles'; end if;
  update public.profiles set role = 'editor' where email = 'other@kapamana.test';
  update public.player_saves set save = jsonb_set(save, '{coins}', '1000') where traveler_name = 'Bea';
  if (select coins from public.player_saves where traveler_name = 'Bea') <> 1000 then raise exception 'admin save edit failed'; end if;
  if not exists (select 1 from public.content_audit_log where table_name = 'player_saves' and action = 'UPDATE') then raise exception 'admin save edit not audited'; end if;
end $$;
select pg_temp.expect_denied($$update public.profiles set role = 'learner' where email = 'admin@kapamana.test'$$, 'demote last admin');
reset role;

select 'ALL RLS CHECKS PASSED' as result;
