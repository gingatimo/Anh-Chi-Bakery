-- Bật REALTIME cho play.child_profiles.
--
-- Mục đích: ba mẹ DUYỆT nhiệm vụ ở máy khác → máy bé đang chơi nhận ngay (băng-rôn
-- "🎉 +xu" + cộng xu). Client nghe postgres_changes UPDATE, lọc theo id
-- (xem app/src/cloud/realtime.ts → store.applyApprovals). Realtime TÔN TRỌNG RLS:
-- policy `parent_select_own` (migration init) đảm bảo mỗi phụ huynh chỉ nhận thay
-- đổi hồ sơ con MÌNH.
--
-- Áp bằng CLI:  supabase db push
-- Chưa áp → app vẫn chạy; xu chỉ cộng khi bé mở lại tiệm (không có thông báo sống).

-- 1) Đưa bảng vào publication realtime của Supabase (idempotent: chạy lại không lỗi;
--    bỏ qua an toàn nếu publication chưa tồn tại, vd môi trường không bật realtime).
do $$
begin
  if exists (select 1 from pg_publication where pubname = 'supabase_realtime')
     and not exists (
       select 1 from pg_publication_tables
       where pubname = 'supabase_realtime'
         and schemaname = 'play'
         and tablename = 'child_profiles'
     ) then
    alter publication supabase_realtime add table play.child_profiles;
  end if;
end $$;

-- 2) REPLICA IDENTITY FULL: để Realtime có đủ cột (nhất là parent_id) đánh giá RLS
--    cho mọi loại sự kiện. Bảng nhỏ (1 dòng/bé) nên chi phí WAL không đáng kể.
alter table play.child_profiles replica identity full;
