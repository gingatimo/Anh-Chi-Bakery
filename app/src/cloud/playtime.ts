/**
 * playtime.ts — đo THỜI GIAN CHƠI thật của bé, CHỐNG CHỈNH-GIỜ.
 * Heartbeat ~30s/lần KHI bé đang chơi (màn game + foreground) → gọi RPC
 * `play.add_play_time` (server tự tính ngày + cộng giây) → cập nhật store.playSeconds
 * (tổng giây hôm nay theo SERVER). Trần phút/ngày enforce bằng số này (xem store.timeUp).
 * Ẩn app / ở Khu phụ huynh / máy quản lý → KHÔNG tính.
 */
import { supabase } from './supabase';
import { useGame } from '../game/store';

const HEARTBEAT_SEC = 30;
const IDLE_MS = 90_000; // không thao tác (chạm/bấm/phím) quá 90s → coi là IDLE, TẠM DỪNG đếm
// 'tasks' (Nhiệm vụ) = việc THẬT ngoài đời, KHÔNG tính là chơi → không đếm giờ (và luôn mở kể cả hết giờ).
const PLAY_PHASES = new Set(['hub', 'serve', 'lunch', 'activity', 'summary', 'reveal', 'book', 'shop', 'decorate']);

let inited = false;
let lastActive = Date.now();
const markActive = () => { lastActive = Date.now(); };

/** Bé có đang THỰC SỰ chơi trên máy này không (để tính giờ): màn game + foreground +
 *  VỪA thao tác trong 90s gần đây (không tính lúc app mở bỏ đó). */
function isPlaying(): boolean {
  if (!supabase) return false;
  const s = useGame.getState();
  return (
    s.started &&
    !!s.childId &&
    !s.managing &&
    PLAY_PHASES.has(s.phase) &&
    document.visibilityState === 'visible' &&
    Date.now() - lastActive < IDLE_MS
  );
}

/** Cộng `delta` giây (0 = chỉ lấy tổng) rồi cập nhật playSeconds theo SERVER. */
async function tick(delta: number) {
  const s = useGame.getState();
  if (!supabase || !s.childId) return;
  try {
    const { data } = await supabase.rpc('add_play_time', { p_child: s.childId, p_delta: delta });
    if (typeof data === 'number') useGame.setState({ playSeconds: data });
  } catch {
    /* offline / RPC chưa có → bỏ qua, không chặn gameplay */
  }
}

/** Lấy lại tổng giây hôm nay (không cộng) — gọi khi bé vừa được nạp/vào chơi. */
export function refreshPlayTime() {
  void tick(0);
}

/** AWAIT tổng giây chơi hôm nay (server) — để ENFORCE trần NGAY khi vào (không để
 *  bé lọt vào game lúc playSeconds chưa nạp xong). Lỗi/không có supabase → 0. */
export async function fetchTodaySeconds(childId: string): Promise<number> {
  if (!supabase || !childId) return 0;
  try {
    const { data } = await supabase.rpc('add_play_time', { p_child: childId, p_delta: 0 });
    return typeof data === 'number' ? data : 0;
  } catch {
    return 0;
  }
}

/** Bật đo giờ (một lần khi app khởi động). */
export function initPlayTime() {
  if (inited || !supabase) return;
  inited = true;
  // Theo dõi thao tác của bé → để biết đang chơi thật hay để app mở bỏ đó (idle).
  for (const ev of ['pointerdown', 'keydown', 'touchstart']) {
    window.addEventListener(ev, markActive, { passive: true });
  }
  setInterval(() => { if (isPlaying()) void tick(HEARTBEAT_SEC); }, HEARTBEAT_SEC * 1000);
  // Vừa CHUYỂN sang trạng thái đang chơi → lấy tổng hiện tại (để enforce trần ngay).
  let was = false;
  useGame.subscribe(() => {
    const now = isPlaying();
    if (now && !was) void tick(0);
    was = now;
  });
}

/** Lịch sử phút/ngày (báo cáo Khu phụ huynh) — 7 ngày gần nhất. */
export async function loadPlayHistory(childId: string, parentId: string): Promise<{ day: string; seconds: number }[]> {
  if (!supabase || !childId) return [];
  const { data } = await supabase
    .from('play_time')
    .select('day, seconds')
    .eq('child_id', childId)
    .eq('parent_id', parentId)
    .order('day', { ascending: false })
    .limit(7);
  return (data ?? []) as { day: string; seconds: number }[];
}
