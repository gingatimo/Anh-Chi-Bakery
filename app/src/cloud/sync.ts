/**
 * sync.ts — đồng bộ dữ liệu chơi ↔ Supabase (thiết kế 9.3, 9.9).
 * LOCAL-FIRST: chỉ chạy khi phụ huynh đã đăng nhập; gameplay không bao giờ chờ.
 * Lưu cả bản chụp save vào 1 dòng child_profiles (JSONB) — đơn giản cho MVP;
 * bản đầy đủ (schema chuẩn hoá + hợp nhất theo bảng) là việc của M2 (9.4, 9.5).
 */
import { supabase } from './supabase';
import { useGame, resumePhase } from '../game/store';

type S = ReturnType<typeof useGame.getState>;

function snapshot() {
  const s = useGame.getState();
  return {
    shopName: s.shopName,
    avatar: s.avatar,
    lop: s.lop,
    childPin: s.childPin,
    day: s.day,
    xu: s.xu,
    levels: s.levels,
    stickers: s.stickers,
    collected: s.collected,
    placed: s.placed,
    inventory: s.inventory,
    tasks: s.tasks,
    counters: s.counters,
    settings: s.settings,
    daily: s.daily,
    // ngày đang chơi dở (DB là nguồn chân lý → đa thiết bị cũng resume đúng chỗ)
    phase: s.phase,
    plan: s.plan,
    beatIndex: s.beatIndex,
    stepIndex: s.stepIndex,
    dayResult: s.dayResult,
    recentA: s.recentA,
    recentB: s.recentB,
  };
}

/** Đẩy toàn bộ save local lên cloud (liên kết / sao lưu). */
export async function pushSnapshot(parentId: string): Promise<void> {
  if (!supabase) throw new Error('Chưa cấu hình Supabase');
  const s = useGame.getState();
  let childId = s.childId;
  if (!childId) {
    childId = crypto.randomUUID();
    useGame.setState({ childId });
  }
  const { error } = await supabase.from('child_profiles').upsert(
    {
      id: childId,
      parent_id: parentId,
      ten_hien_thi: s.shopName, // biệt danh/tên tiệm — KHÔNG phải tên thật (9.8)
      ten_tiem: s.shopName,
      lop: s.lop,
      save_state: snapshot(),
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'id' }
  );
  if (error) throw error;
}

/** Tải save mới nhất của tài khoản về máy này (đa thiết bị). */
export async function pullSnapshot(parentId: string): Promise<boolean> {
  if (!supabase) throw new Error('Chưa cấu hình Supabase');
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, save_state, updated_at')
    .eq('parent_id', parentId)
    .order('updated_at', { ascending: false })
    .limit(1);
  if (error) throw error;
  const row = data?.[0];
  if (!row) return false;
  const snap = (row.save_state ?? {}) as Partial<S>;
  useGame.setState({ ...snap, childId: row.id as string, started: true });
  return true;
}

/** Sau khi đăng ký/đăng nhập: có dữ liệu trên cloud thì tải về, chưa có thì đẩy lên. */
export async function syncOnAuth(parentId: string): Promise<'pulled' | 'pushed'> {
  if (await pullSnapshot(parentId)) return 'pulled';
  await pushSnapshot(parentId);
  return 'pushed';
}

// ── Nhiều con: 1 phụ huynh có nhiều hồ sơ trẻ (thiết kế 9.4) ──
export interface ChildRow {
  id: string;
  ten_tiem: string | null;
  lop: number | null;
  save_state: Record<string, unknown>;
  updated_at: string;
}

/** Danh sách hồ sơ các bé của tài khoản phụ huynh (mới nhất trước). */
export async function listChildren(parentId: string): Promise<ChildRow[]> {
  if (!supabase) return [];
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, ten_tiem, lop, save_state, updated_at')
    .eq('parent_id', parentId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return (data ?? []) as ChildRow[];
}

/** Nạp hồ sơ một bé (đã chọn) vào máy này để chơi. */
export function activateChild(row: ChildRow) {
  const snap = (row.save_state ?? {}) as Partial<S>;
  useGame.setState({ ...snap, childId: row.id, started: true, addingChild: false, childUnlocked: false, phase: 'hub' });
}

/** Xoá hẳn hồ sơ một bé khỏi DB (dùng khi "chơi lại từ đầu"). */
export async function deleteChild(childId: string, parentId: string): Promise<void> {
  if (!supabase || !childId) return;
  await supabase.from('child_profiles').delete().eq('id', childId).eq('parent_id', parentId);
}

/** Tải BẢN MỚI NHẤT của hồ sơ bé đang chơi từ DB (DB là nguồn chân lý).
 *  `resume`: bé VÀO CHƠI (từ Home) → khôi phục đúng màn đang dở + re-gate PIN.
 *  Không resume (đổi tab trong Khu phụ huynh) → GIỮ NGUYÊN phase hiện tại. */
export async function pullChild(
  childId: string,
  parentId: string,
  opts?: { resume?: boolean }
): Promise<boolean> {
  if (!supabase) return false;
  const { data, error } = await supabase
    .from('child_profiles')
    .select('id, save_state')
    .eq('id', childId)
    .eq('parent_id', parentId)
    .maybeSingle();
  if (error || !data) return false;
  const snap = (data.save_state ?? {}) as Partial<S>;
  const patch: Partial<S> = { ...snap, childId: data.id, started: true };
  if (opts?.resume) {
    patch.phase = resumePhase(snap); // 'serve'/'lunch' nếu đang dở, else 'hub'
    patch.childUnlocked = false; // vào lại phải qua PIN riêng của bé (nếu có)
  } else {
    delete patch.phase; // đừng để phase của bé kéo phụ huynh ra khỏi Khu phụ huynh
  }
  useGame.setState(patch);
  return true;
}
