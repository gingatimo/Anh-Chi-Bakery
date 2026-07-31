-- Tiệm Bánh Anh Chi (play.anhchistore.com) — sao lưu & đồng bộ.
--
-- PHÂN VÙNG (quan trọng): mọi bảng của app "play" nằm trong SCHEMA RIÊNG `play`,
-- tách khỏi store (dùng `public`/schema khác). Nhờ vậy DÙNG CHUNG 1 database
-- Supabase (gói free) mà không đụng nhau, và sau này SCALE dễ: tách chỉ cần
-- `pg_dump -n play` sang project riêng. Auth (auth.users) dùng chung toàn project.
--
-- Áp bằng CLI:  supabase link --project-ref zafafpmkbuixkpuyxhel  &&  supabase db push
-- SAU ĐÓ 1 lần: Dashboard → Settings → API → "Exposed schemas" → THÊM `play`
--   (để Data API cho phép client truy vấn schema play; app đã set db.schema='play').

create schema if not exists play;

-- Chỉ role `authenticated` (phụ huynh đã đăng nhập) được chạm schema play.
-- anon KHÔNG có quyền — app chỉ gọi DB sau khi đăng nhập. RLS lọc tiếp từng dòng.
grant usage on schema play to authenticated;

create table if not exists play.child_profiles (
  id           uuid primary key,                       -- UUID hồ sơ trẻ (sinh phía client)
  parent_id    uuid not null references auth.users (id) on delete cascade,
  ten_hien_thi text,                                   -- biệt danh, KHÔNG phải tên thật (9.8)
  ten_tiem     text,
  lop          int,
  save_state   jsonb not null default '{}'::jsonb,
  updated_at   timestamptz not null default now()
);

create index if not exists child_profiles_parent_idx on play.child_profiles (parent_id);

grant select, insert, update, delete on play.child_profiles to authenticated;
-- bảng thêm sau này trong schema play cũng tự cấp quyền cho authenticated
alter default privileges in schema play grant select, insert, update, delete on tables to authenticated;

-- ── RLS: mỗi phụ huynh chỉ đọc/ghi hồ sơ con MÌNH (thiết kế 9.4) ──
alter table play.child_profiles enable row level security;

drop policy if exists "parent_select_own" on play.child_profiles;
create policy "parent_select_own" on play.child_profiles
  for select to authenticated
  using ((select auth.uid()) = parent_id);

drop policy if exists "parent_insert_own" on play.child_profiles;
create policy "parent_insert_own" on play.child_profiles
  for insert to authenticated
  with check ((select auth.uid()) = parent_id);

-- UPDATE cần cả USING lẫn WITH CHECK (chống đổi parent_id sang người khác)
drop policy if exists "parent_update_own" on play.child_profiles;
create policy "parent_update_own" on play.child_profiles
  for update to authenticated
  using ((select auth.uid()) = parent_id)
  with check ((select auth.uid()) = parent_id);

drop policy if exists "parent_delete_own" on play.child_profiles;
create policy "parent_delete_own" on play.child_profiles
  for delete to authenticated
  using ((select auth.uid()) = parent_id);
