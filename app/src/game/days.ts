/**
 * days.ts — dựng kế hoạch một "ngày bán hàng" (thiết kế 4.1, 4.3).
 * Ngày 1 = "Khai trương" thiết kế riêng, cực dễ (4.3). Ngày ≥2 có morning/
 * afternoon + giờ nghỉ trưa (nghỉ mắt 20-20-20, mục 9.6).
 * Mỗi khách = chuỗi bước, mỗi bước là một Question — màn hình chọn UI theo mode.
 */
import { generateChangeDrag, type Question, type SkillId } from '../engine/questions';
import { QuestionScheduler } from '../engine/scheduler';
import { smallestNoteAbove } from '../engine/money';
import { CAKE_KINDS, CAKE_LABEL, type CakeKind } from '../assets/svg/Cake';
import { pick } from '../engine/money';
import type { CustomerVariant } from '../assets/svg/Customer';

export type StepKind = 'order' | 'bake' | 'total' | 'change';

export interface Step {
  kind: StepKind;
  q: Question;
  label: string; // caption diegetic
}

export interface CustomerPlan {
  id: string;
  variant: CustomerVariant;
  wants: string; // bong bóng thoại (≤ 12 từ)
  orderCakes: CakeKind[];
  given?: number; // tờ khách đưa (bước thối tiền)
  steps: Step[];
  baseXu: number;
}

export type Beat = { kind: 'customer'; c: CustomerPlan } | { kind: 'lunch' };

export interface DayPlan {
  day: number;
  khaitruong: boolean;
  beats: Beat[];
}

export interface Levels {
  A: number;
  B: number;
}

let uid = 0;
const nid = () => `c${uid++}`;

function orderCakesFor(n: number): CakeKind[] {
  const cakes: CakeKind[] = [];
  for (let i = 0; i < n; i++) cakes.push(pick(CAKE_KINDS));
  return cakes;
}

/** Kỹ năng nhóm B theo lớp (thiết kế 3.6): lớp 3 nhân cơ bản, lớp 4 mở nhân 6–9. */
function bakeSkillForGrade(lop: 3 | 4): SkillId {
  const pool: SkillId[] = lop >= 4 ? ['B1', 'B2', 'B2'] : ['B1', 'B1', 'B2'];
  return pick(pool);
}

/** Một khách ngày thường: làm bánh (B) → tính tiền (A4) → thối tiền (A6 kéo). */
function normalCustomer(sched: QuestionScheduler, levels: Levels, lop: 3 | 4): CustomerPlan {
  const bake = sched.next(bakeSkillForGrade(lop), levels.B);
  const total = sched.next('A4', levels.A);
  const items = total.context!.items!;
  const cakes = orderCakesFor(items.length);
  const given = smallestNoteAbove(total.answer);
  const change = generateChangeDrag(levels.A, given - total.answer, given);

  const wants =
    items.length >= 3
      ? `Cho mình ${items.length} món nhé!`
      : `Mình lấy ${cakes.map((c) => CAKE_LABEL[c].toLowerCase()).join(' với ')} nha!`;

  return {
    id: nid(),
    variant: (Math.floor(Math.random() * 6) as CustomerVariant),
    wants,
    orderCakes: cakes,
    given,
    baseXu: 8 + Math.floor(Math.random() * 6),
    steps: [
      { kind: 'bake', q: bake, label: 'Làm bánh cho khách' },
      { kind: 'total', q: total, label: 'Tính tiền cả đơn' },
      { kind: 'change', q: change, label: 'Thối tiền cho khách' },
    ],
  };
}

/** Ngày 1 — Khai trương (4.3): 1 khách (bạn Mập), 2 tương tác cực dễ. */
function khaitruongCustomer(): CustomerPlan {
  // A1: nhận đúng tờ 10.000 ; B1: xếp 6 bánh (2 khay × 3)
  const a1: Question = {
    skill: 'A1',
    level: 1,
    mode: 'choose',
    key: 'A1:10000-khaitruong',
    prompt: 'Bạn Mập đưa tiền — chọn tờ 10.000đ nhé!',
    answer: 10000,
    choices: [10000, 2000, 5000],
    hints: [
      'Nhìn con số to trên tờ tiền.',
      'Mình cần tờ ghi số 10.000.',
      'Tớ chỉ nhé: tờ có số 10.000 đó!',
    ],
  };
  const b1: Question = {
    skill: 'B1',
    level: 1,
    mode: 'tray-drag',
    key: 'B1:2x3-khaitruong',
    prompt: 'Xếp 2 khay, mỗi khay 3 bánh nhé!',
    answer: 6,
    choices: [6, 5, 9, 8],
    context: { rows: 2, per: 3 },
    hints: ['Mỗi khay 3 bánh, có 2 khay.', 'Đếm: 3 + 3.', '2 × 3 = 6 bánh.'],
  };
  return {
    id: nid(),
    variant: 4,
    wants: 'Chúc mừng khai trương! Cho mình bánh quy nha!',
    orderCakes: ['cookie'],
    baseXu: 5,
    steps: [
      { kind: 'order', q: a1, label: 'Nhận tiền của khách' },
      { kind: 'bake', q: b1, label: 'Xếp bánh lên khay' },
    ],
  };
}

/**
 * Độ dài buổi chơi — phụ huynh cấu hình (thiết kế 9.7). Đơn vị hiển thị là KHÁCH,
 * không phải phút (không tạo áp lực thời gian). Số khách theo ngày vẫn DỐC KHỞI
 * ĐỘNG (4.3): ngày 1 cực ngắn, ngày 2–3 rút gọn, ngày 4+ đầy đủ.
 */
export type SessionPreset = 'ngan' | 'vua' | 'dai';

const SESSION_COUNTS: Record<SessionPreset, { warmup: number; full: number; mins: string }> = {
  ngan: { warmup: 3, full: 4, mins: '~10 phút' },
  vua: { warmup: 5, full: 7, mins: '~15 phút' },
  dai: { warmup: 6, full: 9, mins: '~20 phút' },
};

export const SESSION_LABEL: Record<SessionPreset, { name: string; desc: string }> = {
  ngan: { name: 'Ngắn', desc: `4 khách · ${SESSION_COUNTS.ngan.mins}` },
  vua: { name: 'Vừa', desc: `7 khách · ${SESSION_COUNTS.vua.mins}` },
  dai: { name: 'Dài', desc: `9 khách · ${SESSION_COUNTS.dai.mins}` },
};

export function customerCountFor(day: number, session: SessionPreset = 'vua'): number {
  if (day === 1) return 1;
  const p = SESSION_COUNTS[session];
  return day <= 3 ? p.warmup : p.full;
}

export function buildDay(day: number, levels: Levels, session: SessionPreset = 'vua', lop: 3 | 4 = 3): DayPlan {
  const sched = new QuestionScheduler();
  if (day === 1) {
    return { day, khaitruong: true, beats: [{ kind: 'customer', c: khaitruongCustomer() }] };
  }
  const n = customerCountFor(day, session);
  const lunchAfter = Math.floor(n / 2); // nghỉ trưa ~giữa ngày (thiết kế 4.1, 9.6)
  const beats: Beat[] = [];
  for (let i = 0; i < n; i++) {
    beats.push({ kind: 'customer', c: normalCustomer(sched, levels, lop) });
    if (i === lunchAfter - 1) beats.push({ kind: 'lunch' });
  }
  return { day, khaitruong: false, beats };
}

export const SKILL_LABEL: Record<SkillId, string> = {
  A1: 'Nhận biết tiền',
  A4: 'Cộng tiền',
  A5: 'Thối tiền',
  A6: 'Đếm tiền thối',
  B1: 'Bảng nhân',
  B2: 'Bảng nhân 6–9',
};
