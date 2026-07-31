/**
 * store.ts — state machine "ngày bán hàng" + dữ liệu bền (Zustand + persist).
 * Local-first: mọi thứ lưu IndexedDB/localStorage; cloud là việc của M2 (9.3).
 * KHÔNG persist `plan` vì Question chứa hàm diagnose (không serialize được).
 */
import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { buildDay, type DayPlan, type CustomerPlan, type Step, type Levels, type SessionPreset } from './days';
import { STICKERS } from '../assets/svg/Sticker';
import { furnitureById } from '../assets/svg/Furniture';

export type Phase =
  | 'welcome'
  | 'hub'
  | 'serve'
  | 'lunch'
  | 'summary'
  | 'reveal'
  | 'book'
  | 'shop'
  | 'decorate'
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

interface GameState {
  // ── bền ──
  started: boolean;
  shopName: string;
  avatar: AvatarConfig;
  lop: 3 | 4; // lớp của bé — quyết định độ khó & mở khoá kỹ năng (thiết kế 3.6)
  childId: string; // UUID hồ sơ trẻ (sinh phía client) — khoá đồng bộ cloud (9.9)
  day: number; // ngày SẮP chơi (1 = khai trương)
  xu: number;
  levels: Levels;
  stickers: OwnedSticker[]; // sticker cột mốc (dán vào sổ)
  collected: string[]; // sticker SƯU TẦM (catalog 1000) đã có
  placed: Placed[];
  inventory: string[]; // KHO: đồ đã mua/tặng, chưa đặt vào phòng
  counters: { khach: number; me: number; days: number };
  settings: {
    sound: boolean;
    theme: 'light' | 'dark';
    session: SessionPreset; // độ dài MỘT lượt chơi (phụ huynh chỉnh)
    restSeconds: number; // thời gian nghỉ mắt giữa lượt
    sessionsPerDay: number; // số lượt chơi mỗi ngày thật
    parentPin: string | null; // PIN cổng phụ huynh (4 số)
  };
  // cưỡng chế giới hạn theo ngày (thiết kế 9.7)
  daily: { date: string; used: number; bonus: number };

  // ── tạm (không persist) ──
  phase: Phase;
  plan: DayPlan | null;
  beatIndex: number;
  stepIndex: number;
  recentA: boolean[];
  recentB: boolean[];
  dayResult: DayResult;
  pendingSticker: string | null;
  giftFurniture: string | null;
  promoted: boolean; // vừa lên lớp (hiện ở tổng kết)

  // ── actions ──
  startGame: (shopName: string, avatar: AvatarConfig, lop: 3 | 4) => void;
  openShop: () => void;
  currentCustomer: () => CustomerPlan | null;
  currentStep: () => Step | null;
  completeStep: (correct: boolean) => void;
  continueFromLunch: () => void;
  goto: (p: Phase) => void;
  placeSticker: (id: string, page: number, x: number, y: number, rotation: number) => void;
  moveSticker: (id: string, x: number, y: number, rotation: number) => void;
  buyFurniture: (id: string) => boolean;
  addToInventory: (id: string) => void;
  placeFromInventory: (id: string, room: number, x: number, y: number) => void;
  movePlaced: (key: number, x: number, y: number) => void;
  removePlaced: (key: number) => void; // xoá khỏi phòng → trả về KHO
  toggleSound: () => void;
  toggleTheme: () => void;
  setSession: (session: SessionPreset) => void;
  setRest: (seconds: number) => void;
  setSessionsPerDay: (n: number) => void;
  setParentPin: (pin: string | null) => void;
  refreshDaily: () => void;
  grantBonusSession: () => void;
  sessionsLeft: () => number;
  resetAll: () => void;
}

const START_LEVELS: Levels = { A: 1, B: 1 };
let placedKey = 1;

/** "Ngày chơi" reset lúc 04:00 giờ địa phương (thiết kế 9.7), không phải nửa đêm. */
function gameDay(): string {
  const d = new Date(Date.now() - 4 * 3600 * 1000);
  return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;
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
      day: 1,
      xu: 0,
      levels: { ...START_LEVELS },
      stickers: [],
      collected: [],
      placed: [],
      inventory: [],
      counters: { khach: 0, me: 0, days: 0 },
      settings: { sound: true, theme: 'light', session: 'vua', restSeconds: 30, sessionsPerDay: 1, parentPin: null },
      daily: { date: '', used: 0, bonus: 0 },

      phase: 'welcome',
      plan: null,
      beatIndex: 0,
      stepIndex: 0,
      recentA: [],
      recentB: [],
      dayResult: { served: 0, xu: 0, firstTry: 0, total: 0 },
      pendingSticker: null,
      giftFurniture: null,
      promoted: false,

      startGame: (shopName, avatar, lop) =>
        set((s) => ({
          started: true,
          shopName: shopName.trim() || 'Tiệm Bánh Anh Chi',
          avatar,
          lop,
          childId: s.childId || crypto.randomUUID(),
          levels: lop >= 4 ? { A: 3, B: 3 } : { A: 1, B: 1 }, // lớp 4 bắt đầu khó hơn
          phase: 'hub',
        })),

      openShop: () => {
        get().refreshDaily();
        if (get().sessionsLeft() <= 0) return; // tiệm đã đóng cửa hôm nay
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
        if (nextBeat >= beats.length) {
          endDay();
          return;
        }
        if (beats[nextBeat].kind === 'lunch') {
          set({ beatIndex: nextBeat + 1, stepIndex: 0, phase: 'lunch' });
        } else {
          set({ beatIndex: nextBeat, stepIndex: 0 });
        }
      },

      continueFromLunch: () => set({ phase: 'serve' }),

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

      buyFurniture: (id) => {
        const f = furnitureById(id);
        if (!f) return false;
        if (get().xu < f.price) return false;
        set((s) => ({ xu: s.xu - f.price, inventory: [...s.inventory, id] })); // mua → vào KHO
        return true;
      },

      addToInventory: (id) => set((s) => ({ inventory: [...s.inventory, id] })),

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
      setParentPin: (parentPin) => set((s) => ({ settings: { ...s.settings, parentPin } })),
      refreshDaily: () => {
        const today = gameDay();
        if (get().daily.date !== today) set({ daily: { date: today, used: 0, bonus: 0 } });
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
      // chỉ persist dữ liệu BỀN — không lưu plan (chứa hàm) hay trạng thái phiên
      partialize: (s) => ({
        started: s.started,
        shopName: s.shopName,
        avatar: s.avatar,
        lop: s.lop,
        childId: s.childId,
        day: s.day,
        xu: s.xu,
        levels: s.levels,
        stickers: s.stickers,
        collected: s.collected,
        placed: s.placed,
        inventory: s.inventory,
        counters: s.counters,
        settings: s.settings,
        daily: s.daily,
      }),
      // gộp sâu settings để save cũ (thiếu key mới) vẫn có mặc định
      merge: (persisted, current) => {
        const p = (persisted ?? {}) as Partial<GameState>;
        return { ...current, ...p, settings: { ...current.settings, ...(p.settings ?? {}) } };
      },
      // khi khôi phục: luôn về hub (không resume giữa phiên ở slice này)
      onRehydrateStorage: () => (state) => {
        if (state && state.started) state.phase = 'hub';
      },
    }
  )
);

// tiện cho playtest/dev — lộ store ra window (chỉ ở chế độ dev)
if (import.meta.env.DEV) {
  (window as unknown as { useGame?: typeof useGame }).useGame = useGame;
}
