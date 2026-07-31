/**
 * autosave.ts — DB là NGUỒN CHÂN LÝ: mọi thay đổi dữ liệu bền tự lưu lên Supabase.
 * localStorage chỉ còn là cache tăng tốc/chống mất khi offline.
 * Chống dội: gộp các thay đổi trong 1.5s rồi mới đẩy một lần (đẩy đủ save_state).
 */
import { supabase } from './supabase';
import { useGame } from '../game/store';
import { pushSnapshot } from './sync';

let timer: ReturnType<typeof setTimeout> | null = null;
let inited = false;

/** Bật tự-lưu-lên-DB. Gọi một lần khi app khởi động. */
export function initAutosave() {
  if (inited || !supabase) return;
  inited = true;
  useGame.subscribe(() => {
    const s = useGame.getState();
    if (!s.started || !s.childId) return; // chưa có hồ sơ bé đang chơi → chưa lưu
    if (timer) clearTimeout(timer);
    timer = setTimeout(async () => {
      const { data } = await supabase!.auth.getSession();
      const uid = data.session?.user.id;
      if (!uid) return; // phụ huynh chưa đăng nhập → chỉ giữ cache local
      try {
        await pushSnapshot(uid);
      } catch {
        /* offline / lỗi mạng — lần thay đổi kế tiếp sẽ thử lại */
      }
    }, 1500);
  });

  // Reload/đóng tab/ẩn app → đẩy NGAY thay đổi còn treo trong debounce, kẻo mất
  // (vd vừa duyệt xu xong bấm F5): DB cũ sẽ ghi đè cache tốt ở lần pull sau.
  const flushOnHide = () => {
    if (document.visibilityState === 'hidden') void flushNow();
  };
  document.addEventListener('visibilitychange', flushOnHide);
  window.addEventListener('pagehide', () => void flushNow());
}

/** Lưu NGAY lên DB (khi thoát về Home / đổi bé) — không chờ debounce. */
export async function flushNow() {
  if (!supabase) return;
  const s = useGame.getState();
  if (!s.started || !s.childId) return;
  const { data } = await supabase.auth.getSession();
  const uid = data.session?.user.id;
  if (!uid) return;
  try {
    await pushSnapshot(uid);
  } catch {
    /* offline — cache local đã có, để autosave thử lại sau */
  }
}
