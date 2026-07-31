/**
 * realtime.ts — thông báo SỐNG khi ba mẹ DUYỆT nhiệm vụ (Supabase Realtime BROADCAST).
 * Khi ba mẹ duyệt ở máy này → gửi 1 tin broadcast tí hon (danh sách nhiệm vụ) trên
 * kênh `child-<id>`; máy bé đang chơi (cùng kênh) nhận → store.applyApprovals cộng xu
 * + băng-rôn (phẫu thuật, không đè state đang chơi; echo tự no-op).
 *
 * VÌ SAO broadcast chứ không postgres_changes: postgres_changes phát NGUYÊN hàng
 * child_profiles — mà save_state nay chứa cả `plan` (~30-40KB) → mỗi autosave (1.5s)
 * broadcast cả hàng nặng, phí băng thông + rủi ro cắt payload. Broadcast chỉ gửi
 * đúng lúc duyệt, payload vài trăm byte. Không cần bật publication phía DB.
 *
 * Không nhận sống (offline/đóng app) cũng KHÔNG mất xu: DB vẫn là nguồn chân lý,
 * bé mở lại (pullChild) là thấy — broadcast chỉ thêm thông báo tức thì.
 */
import type { RealtimeChannel } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { useGame, type Task } from '../game/store';

let channel: RealtimeChannel | null = null;
let currentId: string | null = null;
let inited = false;

/** Đổi kênh theo bé đang active (mỗi bé một hồ sơ). */
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
    .channel(`child-${id}`, { config: { broadcast: { self: false } } })
    .on('broadcast', { event: 'approval' }, ({ payload }) => {
      const p = payload as { approvedToday?: string[]; tasks?: Task[] } | null;
      useGame.getState().applyApprovals({ approvedToday: p?.approvedToday ?? [], tasks: p?.tasks ?? [] });
    })
    .subscribe();
}

/** Bật nghe realtime (một lần khi app khởi động). Tự đổi kênh khi đổi bé. */
export function initRealtime() {
  if (inited || !supabase) return;
  inited = true;
  resubscribe();
  useGame.subscribe(resubscribe); // childId đổi → resubscribe (early-return nếu không đổi)
}

/** Ba mẹ vừa duyệt nhiệm vụ → báo cho máy bé đang chơi (nếu đang online) cộng xu ngay.
 *  Gửi cả danh sách nhiệm vụ (nhỏ) để máy bé tự đối chiếu cái nào mới duyệt. */
export function notifyApproval() {
  if (!channel) return; // chưa có kênh (chưa đăng nhập / chưa chọn bé) → bỏ qua, ledger vẫn lưu
  const s = useGame.getState();
  channel.send({ type: 'broadcast', event: 'approval', payload: { approvedToday: s.approvedToday, tasks: s.tasks } });
}
