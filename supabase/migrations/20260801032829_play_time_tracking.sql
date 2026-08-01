-- Theo dõi THỜI GIAN chơi + trần phút/ngày — CHỐNG CHỈNH-GIỜ.
--
-- Toàn bộ giới hạn ngày trước đây dựa vào ĐỒNG HỒ THIẾT BỊ (gameDay client) → bé
-- chỉnh giờ máy là bypass. Ở đây "ngày" và cộng-giây do SERVER quyết (now()), client
-- không can thiệp được. Phút online tích luỹ lưu DB (server) → xoá cache/đăng xuất
-- cũng không reset.

-- "Ngày chơi" phía SERVER: reset 04:00 giờ VN (Asia/Ho_Chi_Minh). Cùng định dạng
-- 'YYYY-M-D' không đệm 0 như gameDay() client.
create or replace function play.game_day() returns text
  language sql stable as $$
  select to_char((now() at time zone 'Asia/Ho_Chi_Minh') - interval '4 hours', 'FMYYYY-FMMM-FMDD');
$$;

create table if not exists play.play_time (
  child_id   uuid not null references play.child_profiles (id) on delete cascade,
  parent_id  uuid not null references auth.users (id) on delete cascade,
  day        text not null,                      -- play.game_day() lúc ghi (server)
  seconds    int  not null default 0,            -- tổng giây chơi trong ngày đó
  updated_at timestamptz not null default now(),
  primary key (child_id, day)
);

create index if not exists play_time_child_idx on play.play_time (child_id);

grant select, insert, update on play.play_time to authenticated;

alter table play.play_time enable row level security;
drop policy if exists "play_time_parent_all" on play.play_time;
create policy "play_time_parent_all" on play.play_time
  for all to authenticated
  using ((select auth.uid()) = parent_id)
  with check ((select auth.uid()) = parent_id);

-- Cộng `p_delta` giây vào NGÀY SERVER hôm nay cho bé, trả về TỔNG giây hôm nay.
-- Atomic (upsert). heartbeat client gọi hàm này ~30s/lần khi bé đang chơi.
create or replace function play.add_play_time(p_child uuid, p_delta int)
  returns int
  language plpgsql security invoker as $$
declare
  d text := play.game_day();
  total int;
begin
  insert into play.play_time (child_id, parent_id, day, seconds)
    values (p_child, (select auth.uid()), d, greatest(0, p_delta))
  on conflict (child_id, day)
    do update set seconds = play.play_time.seconds + greatest(0, p_delta), updated_at = now()
  returning seconds into total;
  return total;
end $$;

grant execute on function play.game_day() to authenticated;
grant execute on function play.add_play_time(uuid, int) to authenticated;
