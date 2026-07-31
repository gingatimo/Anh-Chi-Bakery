-- Gỡ postgres_changes realtime cho play.child_profiles.
--
-- Lý do: thông báo duyệt nhiệm vụ đã chuyển sang Supabase BROADCAST (payload tí hon,
-- không phụ thuộc kích thước hàng — xem app/src/cloud/realtime.ts). Broadcast KHÔNG
-- cần publication, nên bỏ bảng khỏi publication + trả replica identity về mặc định
-- để không sinh WAL thừa mỗi lần autosave. (Thay cho migration 20260731155834.)

-- Bỏ bảng khỏi publication realtime (idempotent).
do $$
begin
  if exists (
    select 1 from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'play'
      and tablename = 'child_profiles'
  ) then
    alter publication supabase_realtime drop table play.child_profiles;
  end if;
end $$;

-- Trả replica identity về mặc định (primary key) — hết cần cột đầy đủ cho RLS realtime.
alter table play.child_profiles replica identity default;
