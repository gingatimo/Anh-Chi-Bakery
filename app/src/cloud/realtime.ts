/**
 * realtime.ts — nghe DB đổi hồ sơ bé đang chơi (Supabase Realtime). Dùng để khi
 * BA MẸ DUYỆT nhiệm vụ ở MÁY KHÁC, máy bé đang chơi nhận ngay: cộng xu + băng-rôn
 * thông báo (store.applyApprovals — phẫu thuật, không đè state đang chơi). Cũng chặn
 * lỗi last-write-wins (bé nhận lượt duyệt trước khi autosave của bé kịp đè).
 *
 * ⚠️ CẦN BẬT REALTIME cho bảng (một lần, phía DB — mình không có access token):
 *   alter publication supabase_realtime add table play.child_profiles;
 * Chưa bật → app vẫn chạy, chỉ là không có thông báo sống (xu cộng khi bé mở lại).
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useGame, type Task } from '../game/store';

let channel: RealtimeChannel | null = null;
let currentId: string | null = null;
let inited = false;

/** Đổi kênh theo bé đang active (mỗi bé một hồ sơ = một dòng DB). */
function resubscribe() {
  if (!supabase) return;
  const s = useGame.getState();
  const id = s.started && s.childId ? s.childId : null;
  if (id === currentId) return; // không đổi bé → giữ kênh
  if (channel) {
    supabase.removeChannel(channel);
    channel = null;
  }
  currentId = id;
  if (!id) return;
  channel = supabase
    .channel(`child-${id}`)
    .on(
      'postgres_changes',
      { event: 'UPDATE', schema: 'play', table: 'child_profiles', filter: `id=eq.${id}` },
      (payload) => {
        const save = (payload.new as { save_state?: { tasks?: Task[] } } | null)?.save_state;
        useGame.getState().applyApprovals(save?.tasks ?? []);
      }
    )
    .subscribe();
}

/** Bật nghe realtime (một lần khi app khởi động). Tự đổi kênh khi đổi bé. */
export function initRealtime() {
  if (inited || !supabase) return;
  inited = true;
  resubscribe();
  useGame.subscribe(resubscribe); // childId đổi → resubscribe (early-return nếu không đổi)
}
