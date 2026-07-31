-- Ledger THƯỞNG nhiệm vụ — sửa Finding 1 (đa thiết bị ghi đè tiến trình) cho ĐÚNG.
--
-- Vấn đề: xu & trạng thái duyệt nằm trong save_state (jsonb) mà CẢ hai máy ghi đè
-- nguyên hàng (bé chơi ↔ ba mẹ duyệt) → last-write-wins làm mất tiến trình.
--
-- Cách chuẩn: TÁCH phần thưởng ra bảng riêng, atomic + chống-cộng-đôi bằng khoá
-- (child_id, task_id, day). Máy BA MẸ khi duyệt chỉ INSERT/DELETE 1 dòng ở đây —
-- KHÔNG đụng save_state → không bao giờ đè vị trí chơi/level/sticker của máy bé.
--   • "đã duyệt hôm nay" = có dòng day = hôm nay (không còn lastDone trong save_state)
--   • xu thưởng = tổng xu bảng này; TỔNG xu hiển thị = save_state.xu (xu chơi) + thưởng
-- Máy bé chỉ SELECT bảng này (tính tổng) — không ghi → không có xung đột.

create table if not exists play.task_rewards (
  child_id   uuid not null references play.child_profiles (id) on delete cascade,
  parent_id  uuid not null references auth.users (id) on delete cascade,
  task_id    text not null,
  day        text not null,                 -- gameDay() 'YYYY-M-D'
  xu         int  not null default 0,
  created_at timestamptz not null default now(),
  primary key (child_id, task_id, day)       -- 1 thưởng / nhiệm vụ / ngày → chống cộng đôi
);

create index if not exists task_rewards_child_idx on play.task_rewards (child_id);

grant select, insert, delete on play.task_rewards to authenticated;

-- RLS: phụ huynh chỉ đụng dòng của con MÌNH (tài khoản bé = tài khoản phụ huynh).
alter table play.task_rewards enable row level security;
drop policy if exists "task_rewards_parent_all" on play.task_rewards;
create policy "task_rewards_parent_all" on play.task_rewards
  for all to authenticated
  using ((select auth.uid()) = parent_id)
  with check ((select auth.uid()) = parent_id);
