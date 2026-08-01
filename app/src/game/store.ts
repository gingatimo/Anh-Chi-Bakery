/**
 * store.ts — state machine "ngày bán hàng" + dữ liệu bền (Zustand + persist).
 * DB là NGUỒN CHÂN LÝ DUY NHẤT khi có Supabase: KHÔNG cache gameplay ra
 * localStorage nữa (tránh cache cũ đè DB mới lúc reload/đa thiết bị). App tải bản
 * mới nhất từ DB (pullChild) mỗi khi bé vào chơi. localStorage CHỈ dùng cho chế độ
 * dev/không-Supabase để reload không mất trạng thái (xem `storage` bên dưới).
 * Cả hai chế độ đều lưu ngày đang chơi dở (`plan`+vị trí) để resume đúng chỗ /
 * không né được màn nghỉ. Hàm `diagnose` trong Question bị JSON bỏ đi khi lưu —
 * an toàn: useAttempts đã guard `if (q.diagnose)`, resume chỉ mất chẩn đoán lỗi.
 */
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import { buildDay, type DayPlan, type CustomerPlan, type Step, type Levels, type SessionPreset, type ActivityKind } from './days';
import { STICKERS } from '../assets/svg/Sticker';
import { furnitureById } from '../assets/svg/Furniture';
import { supabaseConfigured } from '../cloud/supabase';

export type Phase =
  | 'welcome'
  | 'hub'
  | 'serve'
  | 'lunch'
  | 'summary'
  | 'reveal'
  | 'book'
  | 'home' // board danh sách bé (sau khi phụ huynh đăng nhập)
  | 'shop'
  | 'decorate'
  | 'tasks'
  | 'activity' // hoạt động thư giãn xen giữa (không toán)
  | 'parent';

export interface AvatarConfig {
  apron: string;
  hair: string;
}

export interface OwnedSticker {
  id: string;
  page: number;
  x: number; // % trong trang
  y: number;
  rotation: number;
}

export interface Placed {
  id: string;
  room: number; // phòng chứa món này (0 = tiệm chính)
  x: number; // % trong khung phòng
  y: number;
  key: number; // định danh instance
}

/** Các phòng trang trí (mỗi phòng một nền khác — xem Scene.tsx variant). */
export const ROOMS = [
  { id: 0, name: 'Tiệm chính' },
  { id: 1, name: 'Phòng bánh' },
  { id: 2, name: 'Góc đọc' },
  { id: 3, name: 'Sân vườn' },
  { id: 4, name: 'Phòng tiệc' },
  { id: 5, name: 'Phòng ngủ' }, // phòng ngủ của bé
  { id: 6, name: 'Phòng ngủ Mập' },
] as const;

interface DayResult {
  served: number;
  xu: number;
  firstTry: number;
  total: number;
}

/** Nhiệm vụ hằng ngày ba mẹ giao cho bé (việc thật ngoài đời → duyệt → thưởng xu).
 *  "Đã duyệt hôm nay" KHÔNG còn ở đây — suy từ `approvedToday` (nạp từ ledger DB
 *  play.task_rewards) để máy ba mẹ không ghi đè save_state. `raisedDay` (bé báo) vẫn
 *  ở save_state vì chỉ máy bé đổi. */
export interface Task {
  id: string;
  title: string;
  emoji: string;
  xu: number; // thưởng khi ba mẹ duyệt
  raisedDay: string | null; // gameDay bé "báo đã làm" gần nhất
}

interface GameState {
  // ── bền ──
  started: boolean;
  shopName: string;
  avatar: AvatarConfig;
  lop: 3 | 4; // lớp của bé — quyết định độ khó & mở khoá kỹ năng (thiết kế 3.6)
  childId: string; // UUID hồ sơ trẻ (sinh phía client) — khoá đồng bộ cloud (9.9)
  childPin: string | null; // mã PIN RIÊNG của bé để vào hồ sơ (tùy chọn; bố mẹ đặt/reset)
  day: number; // ngày SẮP chơi (1 = khai trương)
  xu: number;
  levels: Levels;
  stickers: OwnedSticker[]; // sticker cột mốc (dán vào sổ)
  collected: string[]; // sticker SƯU TẦM (catalog 1000) đã có
  placed: Placed[];
  inventory: string[]; // KHO: đồ đã mua/tặng, chưa đặt vào phòng
  tasks: Task[]; // nhiệm vụ hằng ngày ba mẹ giao (thưởng xu khi duyệt)
  rewardXu: number; // TỔNG xu thưởng nhiệm vụ (từ ledger DB) — TÁCH khỏi xu chơi để không đua
  approvedToday: string[]; // id nhiệm vụ ĐÃ DUYỆT hôm nay (suy từ ledger; thay lastDone)
  counters: { khach: number; me: number; days: number };
  settings: {
    sound: boolean;
    theme: 'light' | 'dark';
    session: SessionPreset; // độ dài MỘT lượt chơi (phụ huynh chỉnh)
    restSeconds: number; // thời gian nghỉ mắt giữa lượt
    sessionsPerDay: number; // (cũ) số lượt/ngày — không còn là giới hạn chính; giữ để tương thích
    dailyMinutes: number | null; // TRẦN phút/ngày (null = không giới hạn) — giới hạn CHÍNH, đo theo server
    parentPin: string | null; // PIN cổng phụ huynh (4 số)
  };
  // cưỡng chế giới hạn theo ngày (thiết kế 9.7)
  daily: { date: string; used: number; bonus: number };

  // ── tạm (không persist) ──
  phase: Phase;
  plan: DayPlan | null;
  beatIndex: number;
  stepIndex: number;
  activityKind: ActivityKind | null; // hoạt động thư giãn đang hiện (khi phase='activity')
  restEndsAt: number | null; // mốc kết thúc nghỉ trưa (epoch ms) → reload không đếm lại
  recentA: boolean[];
  recentB: boolean[];
  dayResult: DayResult;
  pendingSticker: string | null;
  giftFurniture: string | null;
  promoted: boolean; // vừa lên lớp (hiện ở tổng kết)
  addingChild: boolean; // đang tạo hồ sơ bé mới (onboarding lại)
  childUnlocked: boolean; // đã nhập đúng PIN của bé trong phiên này (tạm, không lưu)
  notice: string | null; // băng-rôn thông báo tạm (vd ba mẹ duyệt nhiệm vụ qua realtime)
  managing: boolean; // máy này đang QUẢN LÝ bé (mở từ Khu phụ huynh) chứ không phải chơi
  //  → chỉ ghi field quản lý (nhiệm vụ/cài đặt), GIỮ nguyên vị trí chơi của máy bé (Finding 1)
  playSeconds: number; // tổng giây chơi HÔM NAY theo SERVER (từ play.add_play_time; đo giờ chống chỉnh-giờ)

  // ── actions ──
  startGame: (shopName: string, avatar: AvatarConfig, lop: 3 | 4) => void;
  beginAddChild: () => void;
  openShop: () => void;
  currentCustomer: () => CustomerPlan | null;
  currentStep: () => Step | null;
  completeStep: (correct: boolean) => void;
  continueFromLunch: () => void;
  continueFromActivity: () => void; // rời hoạt động thư giãn → phục vụ tiếp
  goto: (p: Phase) => void;
  placeSticker: (id: string, page: number, x: number, y: number, rotation: number) => void;
  moveSticker: (id: string, x: number, y: number, rotation: number) => void;
  buyFurniture: (id: string) => boolean;
  buyRandomSticker: (cost: number) => string | null; // đổi xu lấy 1 sticker sưu tầm bất ngờ
  addToInventory: (id: string) => void;
  // ── nhiệm vụ hằng ngày ──
  addTask: (title: string, emoji: string, xu: number) => void;
  removeTask: (id: string) => void;
  totalXu: () => number; // xu tiêu được = xu chơi + xu thưởng nhiệm vụ
  toggleTaskDone: (id: string) => boolean; // ba mẹ duyệt/bỏ duyệt hôm nay (LOCAL) → trả: đã-duyệt?
  applyApprovals: (payload: { approvedToday: string[]; tasks: Task[] }) => void; // realtime từ máy khác
  setNotice: (msg: string | null) => void;
  childRaiseTask: (id: string) => void; // bé báo "đã làm" / hủy báo hôm nay
  placeFromInventory: (id: string, room: number, x: number, y: number) => void;
  movePlaced: (key: number, x: number, y: number) => void;
  removePlaced: (key: number) => void; // xoá khỏi phòng → trả về KHO
  toggleSound: () => void;
  toggleTheme: () => void;
  setSession: (session: SessionPreset) => void;
  setRest: (seconds: number) => void;
  setSessionsPerDay: (n: number) => void;
  setDailyMinutes: (m: number | null) => void; // đặt trần phút/ngày (null = không giới hạn)
  timeUp: () => boolean; // đã hết trần thời gian hôm nay chưa
  timeLeftMinutes: () => number | null; // phút còn lại hôm nay (null = không giới hạn)
  setParentPin: (pin: string | null) => void;
  setChildPin: (pin: string | null) => void; // đặt/xoá PIN riêng của bé đang chọn
  unlockChild: () => void; // đã nhập đúng PIN của bé → cho vào
  refreshDaily: () => void;
  grantBonusSession: () => void;
  sessionsLeft: () => number;
  resetAll: () => void;
}

const START_LEVELS: Levels = { A: 1, B: 1 };
let placedKey = 1;

/** "Ngày chơi" reset lúc 04:00 giờ địa phương (thiết kế 9.7), không phải nửa đêm. */
export function gameDay(): string {
  const d = new Date(Date.now() - 4 * 3600 * 1000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
}

/** Phase để KHÔI PHỤC khi mở lại một hồ sơ đang chơi dở: chỉ 'serve'/'lunch' (đang
 *  phục vụ / nghỉ trưa) mới resume — cần plan hợp lệ + beat trong phạm vi. Ngày đã
 *  xong (plan=null) hay các màn thưởng → về 'hub'. */
export function resumePhase(snap: { plan?: DayPlan | null; phase?: Phase | string; beatIndex?: number }): Phase {
  const { plan, phase, beatIndex = 0 } = snap;
  if (plan && plan.beats && (phase === 'serve' || phase === 'lunch' || phase === 'activity') && beatIndex >= 0 && beatIndex < plan.beats.length) {
    return phase;
  }
  return 'hub';
}

const CATALOG_SIZE = 1000;
/** Tặng n sticker sưu tầm chưa có (id 'c{index}') mỗi khi xong một ngày bán. */
function grantCatalog(owned: string[], n: number): string[] {
  const set = new Set(owned);
  const out: string[] = [];
  let tries = 0;
  while (out.length < n && tries < 60) {
    const id = `c${Math.floor(Math.random() * CATALOG_SIZE)}`;
    if (!set.has(id) && !out.includes(id)) out.push(id);
    tries++;
  }
  return out;
}

/** sticker được trao khi hoàn thành ngày — theo thứ tự, luôn có phần thưởng (5.2). */
function nextSticker(owned: OwnedSticker[]): string | null {
  const have = new Set(owned.map((s) => s.id));
  const next = STICKERS.find((s) => !have.has(s.id));
  return next ? next.id : null;
}

/** thích ứng độ khó (3.4): 4 đúng liên tiếp → +1; 2/3 gần nhất sai → −1. */
function adapt(recent: boolean[], level: number): { recent: boolean[]; level: number } {
  const r = recent.slice(-4);
  let lv = level;
  if (r.length >= 4 && r.slice(-4).every(Boolean)) {
    lv = Math.min(5, lv + 1);
    return { recent: [], level: lv };
  }
  const last3 = recent.slice(-3);
  if (last3.length >= 3 && last3.filter((x) => !x).length >= 2) {
    lv = Math.max(1, lv - 1);
  }
  return { recent, level: lv };
}

export const useGame = create<GameState>()(
  persist(
    (set, get) => ({
      started: false,
      shopName: 'Tiệm Bánh Anh Chi',
      avatar: { apron: '#EBA7A0', hair: '#4A3B32' },
      lop: 3,
      childId: '',
      childPin: null,
      day: 1,
      xu: 0,
      levels: { ...START_LEVELS },
      stickers: [],
      collected: [],
      placed: [],
      inventory: [],
      tasks: [],
      rewardXu: 0,
      approvedToday: [],
      counters: { khach: 0, me: 0, days: 0 },
      settings: { sound: true, theme: 'light', session: 'vua', restSeconds: 120, sessionsPerDay: 1, dailyMinutes: 60, parentPin: null },
      daily: { date: '', used: 0, bonus: 0 },

      phase: 'welcome',
      plan: null,
      beatIndex: 0,
      stepIndex: 0,
      activityKind: null,
      restEndsAt: null,
      recentA: [],
      recentB: [],
      dayResult: { served: 0, xu: 0, firstTry: 0, total: 0 },
      pendingSticker: null,
      giftFurniture: null,
      promoted: false,
      addingChild: false,
      childUnlocked: true,
      notice: null,
      managing: false,
      playSeconds: 0,

      // Tạo hồ sơ bé MỚI: reset sạch tiến trình + childId riêng (mỗi bé một hồ sơ).
      startGame: (shopName, avatar, lop) =>
        set({
          started: true,
          addingChild: false,
          childUnlocked: true, // bé mới chưa có PIN → vào thẳng
          managing: false, // bé mới = chơi trên máy này
          shopName: shopName.trim() || 'Tiệm Bánh Anh Chi',
          avatar,
          lop,
          childId: crypto.randomUUID(),
          childPin: null,
          levels: lop >= 4 ? { A: 3, B: 3 } : { A: 1, B: 1 }, // lớp 4 bắt đầu khó hơn
          day: 1,
          xu: 0,
          stickers: [],
          collected: [],
          placed: [],
          inventory: [],
          tasks: [], // mỗi bé có bộ nhiệm vụ riêng — ba mẹ giao lại
          rewardXu: 0,
          approvedToday: [],
          counters: { khach: 0, me: 0, days: 0 },
          daily: { date: '', used: 0, bonus: 0 },
          phase: 'hub',
        }),

      beginAddChild: () => set({ addingChild: true, phase: 'home' }),

      openShop: () => {
        get().refreshDaily();
        if (get().timeUp()) return; // hết TRẦN THỜI GIAN hôm nay → không mở buổi mới
        const { day, levels, settings, lop } = get();
        const plan = buildDay(day, levels, settings.session, lop);
        const total = plan.beats.filter((b) => b.kind === 'customer').length;
        set({
          plan,
          phase: 'serve',
          beatIndex: 0,
          stepIndex: 0,
          promoted: false,
          dayResult: { served: 0, xu: 0, firstTry: 0, total },
        });
      },

      currentCustomer: () => {
        const { plan, beatIndex } = get();
        const b = plan?.beats[beatIndex];
        return b && b.kind === 'customer' ? b.c : null;
      },

      currentStep: () => {
        const c = get().currentCustomer();
        if (!c) return null;
        return c.steps[get().stepIndex] ?? null;
      },

      completeStep: (correct) => {
        const st = get();
        const c = st.currentCustomer();
        if (!c) return;
        const step = c.steps[st.stepIndex];

        // ghi nhận thích ứng theo nhóm kỹ năng
        const group = step.q.skill.startsWith('A') ? 'A' : 'B';
        if (group === 'A') {
          const next = [...st.recentA, correct];
          const a = adapt(next, st.levels.A);
          set({ recentA: a.recent, levels: { ...st.levels, A: a.level } });
        } else {
          const next = [...st.recentB, correct];
          const b = adapt(next, st.levels.B);
          set({ recentB: b.recent, levels: { ...st.levels, B: b.level } });
        }

        if (correct) set((s) => ({ dayResult: { ...s.dayResult, firstTry: s.dayResult.firstTry + 1 } }));

        const isLastStep = st.stepIndex >= c.steps.length - 1;
        if (!isLastStep) {
          set({ stepIndex: st.stepIndex + 1 });
          return;
        }

        // khách xong: thưởng xu + đếm
        const gained = c.baseXu;
        set((s) => ({
          xu: s.xu + gained,
          counters: { ...s.counters, khach: s.counters.khach + 1, me: s.counters.me + 1 },
          dayResult: { ...s.dayResult, served: s.dayResult.served + 1, xu: s.dayResult.xu + gained },
        }));

        // sang beat kế
        const nextBeat = st.beatIndex + 1;
        const beats = st.plan!.beats;
        const endDay = () => {
          const cur = get();
          const sticker = nextSticker(cur.stickers);
          const gift = cur.day === 1 ? 'plant' : null;
          // Lên lớp khi TOÀN BỘ kỹ năng lớp hiện tại đạt mastery (thiết kế 3.6)
          const promote = cur.lop === 3 && cur.levels.A >= 5 && cur.levels.B >= 5;
          const today = gameDay();
          set((s) => {
            const d = s.daily.date === today ? s.daily : { date: today, used: 0, bonus: 0 };
            return {
              phase: 'summary',
              day: s.day + 1,
              lop: promote ? 4 : s.lop,
              promoted: promote,
              counters: { ...s.counters, days: s.counters.days + 1 },
              daily: { ...d, used: d.used + 1 }, // đã dùng 1 lượt hôm nay
              collected: [...s.collected, ...grantCatalog(s.collected, 3)], // tặng sticker sưu tầm
              pendingSticker: sticker,
              giftFurniture: gift,
              plan: null,
            };
          });
        };
        // HẾT GIỜ (trần phút/ngày): khách hiện tại vừa xong ở trên → ĐÓNG buổi tại đây
        // (không mở khách/nghỉ/hoạt động kế). "Cho xong khách đang phục vụ rồi đóng".
        if (get().timeUp()) {
          endDay();
          return;
        }
        if (nextBeat >= beats.length) {
          endDay();
          return;
        }
        const nb = beats[nextBeat];
        if (nb.kind === 'lunch') {
          // mốc hết nghỉ theo đồng hồ thật → reload/đổi máy không đếm lại từ đầu
          set({ beatIndex: nextBeat + 1, stepIndex: 0, phase: 'lunch', restEndsAt: Date.now() + st.settings.restSeconds * 1000 });
        } else if (nb.kind === 'activity') {
          // hoạt động thư giãn: nhảy QUA beat này (như nghỉ trưa), nhớ loại để vẽ
          set({ beatIndex: nextBeat + 1, stepIndex: 0, phase: 'activity', activityKind: nb.act });
        } else {
          set({ beatIndex: nextBeat, stepIndex: 0 });
        }
      },

      continueFromLunch: () => set({ phase: 'serve', restEndsAt: null }),
      continueFromActivity: () => set({ phase: 'serve', activityKind: null }),

      goto: (p) => set({ phase: p }),

      placeSticker: (id, page, x, y, rotation) =>
        set((s) => ({
          stickers: [...s.stickers.filter((k) => k.id !== id), { id, page, x, y, rotation }],
          pendingSticker: null,
        })),

      moveSticker: (id, x, y, rotation) =>
        set((s) => ({
          stickers: s.stickers.map((k) => (k.id === id ? { ...k, x, y, rotation } : k)),
        })),

      totalXu: () => get().xu + get().rewardXu, // xu tiêu được = xu chơi + xu thưởng

      buyFurniture: (id) => {
        const f = furnitureById(id);
        if (!f) return false;
        if (get().totalXu() < f.price) return false;
        // trừ vào xu chơi (có thể âm nếu đang tiêu xu thưởng — TỔNG vẫn đúng)
        set((s) => ({ xu: s.xu - f.price, inventory: [...s.inventory, id] }));
        return true;
      },

      // Đổi xu lấy 1 sticker sưu tầm CHƯA có (bất ngờ). Trả id để màn sổ khoe ra.
      buyRandomSticker: (cost) => {
        const s = get();
        if (s.totalXu() < cost) return null;
        const [id] = grantCatalog(s.collected, 1);
        if (!id) return null; // đã sưu tầm đủ bộ
        set((st) => ({ xu: st.xu - cost, collected: [...st.collected, id] }));
        return id;
      },

      addToInventory: (id) => set((s) => ({ inventory: [...s.inventory, id] })),

      addTask: (title, emoji, xu) =>
        set((s) => ({
          tasks: [
            ...s.tasks,
            { id: crypto.randomUUID(), title: title.trim() || 'Nhiệm vụ', emoji: emoji || '⭐', xu: Math.max(0, Math.round(xu)), raisedDay: null },
          ],
        })),

      removeTask: (id) => set((s) => ({ tasks: s.tasks.filter((t) => t.id !== id) })),

      // Ba mẹ duyệt/bỏ duyệt hôm nay — chỉ đổi LOCAL: approvedToday + rewardXu (thưởng),
      // KHÔNG đụng xu chơi. Ledger DB do caller ghi (sync.approveTaskReward). Trả TRẠNG
      // THÁI mới (đã duyệt?) để caller biết ghi hay xoá dòng ledger.
      toggleTaskDone: (id) => {
        const s = get();
        const t = s.tasks.find((x) => x.id === id);
        if (!t) return false;
        if (s.approvedToday.includes(id)) {
          set({ approvedToday: s.approvedToday.filter((x) => x !== id), rewardXu: Math.max(0, s.rewardXu - t.xu) });
          return false; // vừa BỎ duyệt
        }
        set({ approvedToday: [...s.approvedToday, id], rewardXu: s.rewardXu + t.xu });
        return true; // vừa DUYỆT
      },

      // Realtime từ MÁY KHÁC (ba mẹ duyệt): đồng bộ approvedToday + rewardXu theo DELTA,
      // KHÔNG đè xu chơi/plan/vị trí. Chỉ báo khi có nhiệm vụ MỚI duyệt; bỏ duyệt thì lặng
      // lẽ trừ. Echo (chính máy này) → delta 0 → không set.
      applyApprovals: ({ approvedToday, tasks }) => {
        const s = get();
        const local = new Set(s.approvedToday);
        const incoming = new Set(approvedToday);
        const xuOf = (id: string) => (tasks.find((t) => t.id === id) ?? s.tasks.find((t) => t.id === id))?.xu ?? 0;
        const titleOf = (id: string) => (tasks.find((t) => t.id === id) ?? s.tasks.find((t) => t.id === id))?.title ?? 'nhiệm vụ';
        const added = approvedToday.filter((id) => !local.has(id));
        const gone = s.approvedToday.filter((id) => !incoming.has(id));
        if (added.length === 0 && gone.length === 0) return; // echo / không đổi
        const addXu = added.reduce((n, id) => n + xuOf(id), 0);
        const delta = addXu - gone.reduce((n, id) => n + xuOf(id), 0);
        const notice =
          added.length === 0
            ? s.notice
            : added.length === 1
            ? `🎉 Ba mẹ đã duyệt “${titleOf(added[0])}” · +${addXu} xu!`
            : `🎉 Ba mẹ duyệt ${added.length} nhiệm vụ · +${addXu} xu!`;
        set({ approvedToday, rewardXu: Math.max(0, s.rewardXu + delta), notice });
      },

      setNotice: (notice) => set({ notice }),

      // Bé "báo đã làm" (chờ ba mẹ duyệt). Bấm lại để hủy báo. Đã duyệt rồi thì bỏ qua.
      childRaiseTask: (id) =>
        set((s) => {
          const today = gameDay();
          const t = s.tasks.find((x) => x.id === id);
          if (!t || s.approvedToday.includes(id)) return {}; // đã duyệt rồi thì thôi
          const raised = t.raisedDay === today;
          return { tasks: s.tasks.map((x) => (x.id === id ? { ...x, raisedDay: raised ? null : today } : x)) };
        }),

      placeFromInventory: (id, room, x, y) =>
        set((s) => {
          const i = s.inventory.indexOf(id);
          if (i < 0) return {};
          const inv = [...s.inventory];
          inv.splice(i, 1);
          return { inventory: inv, placed: [...s.placed, { id, room, x, y, key: placedKey++ }] };
        }),

      movePlaced: (key, x, y) =>
        set((s) => ({ placed: s.placed.map((p) => (p.key === key ? { ...p, x, y } : p)) })),

      removePlaced: (key) =>
        set((s) => {
          const item = s.placed.find((p) => p.key === key);
          return {
            placed: s.placed.filter((p) => p.key !== key),
            inventory: item ? [...s.inventory, item.id] : s.inventory, // xoá khỏi phòng → trả về KHO
          };
        }),

      toggleSound: () => set((s) => ({ settings: { ...s.settings, sound: !s.settings.sound } })),
      toggleTheme: () =>
        set((s) => ({ settings: { ...s.settings, theme: s.settings.theme === 'light' ? 'dark' : 'light' } })),
      setSession: (session) => set((s) => ({ settings: { ...s.settings, session } })),
      setRest: (seconds) => set((s) => ({ settings: { ...s.settings, restSeconds: seconds } })),
      setSessionsPerDay: (n) => set((s) => ({ settings: { ...s.settings, sessionsPerDay: Math.max(1, n) } })),
      setDailyMinutes: (dailyMinutes) => set((s) => ({ settings: { ...s.settings, dailyMinutes } })),
      timeUp: () => {
        const s = get();
        return s.settings.dailyMinutes != null && s.playSeconds >= s.settings.dailyMinutes * 60;
      },
      timeLeftMinutes: () => {
        const s = get();
        if (s.settings.dailyMinutes == null) return null;
        return Math.max(0, Math.ceil((s.settings.dailyMinutes * 60 - s.playSeconds) / 60));
      },
      setParentPin: (parentPin) => set((s) => ({ settings: { ...s.settings, parentPin } })),
      setChildPin: (childPin) => set({ childPin }),
      unlockChild: () => set({ childUnlocked: true }),
      refreshDaily: () => {
        const today = gameDay();
        if (get().daily.date !== today) set({ daily: { date: today, used: 0, bonus: 0 }, approvedToday: [] });
      },
      grantBonusSession: () => {
        get().refreshDaily();
        set((s) => ({ daily: { ...s.daily, bonus: s.daily.bonus + 1 } }));
      },
      sessionsLeft: () => {
        const s = get();
        const today = gameDay();
        const d = s.daily.date === today ? s.daily : { date: today, used: 0, bonus: 0 };
        return Math.max(0, s.settings.sessionsPerDay + d.bonus - d.used);
      },

      resetAll: () => {
        localStorage.removeItem('anhchi-save');
        location.reload();
      },
    }),
    {
      name: 'anhchi-save',
      // Prod (có Supabase) = DB-only: storage no-op → KHÔNG đọc/ghi localStorage
      // (khỏi cache cũ đè DB mới). Dev/không-Supabase → localStorage để còn resume.
      storage: createJSONStorage(() =>
        supabaseConfigured
          ? { getItem: () => null, setItem: () => {}, removeItem: () => {} }
          : localStorage
      ),
      // persist dữ liệu bền + ngày đang chơi dở (để resume). diagnose bị JSON bỏ (an toàn).
      partialize: (s) => ({
        started: s.started,
        shopName: s.shopName,
        avatar: s.avatar,
        lop: s.lop,
        childId: s.childId,
        childPin: s.childPin,
        day: s.day,
        xu: s.xu,
        levels: s.levels,
        stickers: s.stickers,
        collected: s.collected,
        placed: s.placed,
        inventory: s.inventory,
        tasks: s.tasks,
        rewardXu: s.rewardXu, // dev: giữ thưởng cục bộ (prod nạp lại từ ledger DB)
        approvedToday: s.approvedToday,
        counters: s.counters,
        settings: s.settings,
        daily: s.daily,
        // ngày đang chơi dở → reload resume đúng chỗ (hàm diagnose bị JSON bỏ, an toàn)
        phase: s.phase,
        plan: s.plan,
        beatIndex: s.beatIndex,
        stepIndex: s.stepIndex,
        activityKind: s.activityKind,
        restEndsAt: s.restEndsAt,
        dayResult: s.dayResult,
        recentA: s.recentA,
        recentB: s.recentB,
      }),
      // gộp sâu settings để save cũ (thiếu key mới) vẫn có mặc định
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return { ...current, ...p, settings: { ...current.settings, ...(p.settings ?? {}) } };
      },
      // Khi khôi phục cache:
      //  • Prod (có Supabase, đa con): về HOME (board chọn bé). Bé chọn hồ sơ →
      //    pullChild tải bản DB mới nhất VÀ resume ngày đang dở (nguồn chân lý là DB).
      //  • Dev (1 bé cục bộ, không DB): resume thẳng ngày đang dở nếu có, else hub.
      onRehydrateStorage: () => (state) => {
        if (!state || !state.started) return;
        if (supabaseConfigured) {
          state.phase = 'home';
          state.childUnlocked = false; // vào lại phải nhập PIN của bé nếu có
        } else {
          state.phase = resumePhase(state);
        }
      },
    }
  )
);

// tiện cho playtest/dev — lộ store ra window (chỉ ở chế độ dev)
if (import.meta.env.DEV) {
  (window as unknown as { useGame?: typeof useGame }).useGame = useGame;
}
