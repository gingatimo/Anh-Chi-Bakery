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

/** Hoạt động thư giãn xen giữa (KHÔNG toán, không điểm) — đổi nhịp cho bé. */
export type ActivityKind = 'stretch' | 'decorate' | 'petmap';
const ACTIVITIES: ActivityKind[] = ['stretch', 'decorate', 'petmap'];
const ACTIVITY_EVERY = 3; // xen 1 hoạt động sau mỗi 3 khách

export type Beat =
  | { kind: 'customer'; c: CustomerPlan }
  | { kind: 'lunch' }
  | { kind: 'activity'; act: ActivityKind };

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

function orderCakesFor(n: number, kinds: readonly CakeKind[]): CakeKind[] {
  const cakes: CakeKind[] = [];
  for (let i = 0; i < n; i++) cakes.push(pick(kinds));
  return cakes;
}

/** Câu khách gọi món: GỘP bánh trùng loại + đếm, tránh "ổ bánh mì với ổ bánh mì".
 *  [loaf,loaf] → "2 ổ bánh mì"; [loaf,cupcake] → "ổ bánh mì với bánh kem". */
function cakePhrase(cakes: CakeKind[]): string {
  const order: CakeKind[] = [];
  const counts = new Map<CakeKind, number>();
  for (const c of cakes) {
    if (!counts.has(c)) order.push(c);
    counts.set(c, (counts.get(c) ?? 0) + 1);
  }
  return order
    .map((k) => {
      const n = counts.get(k)!;
      const label = CAKE_LABEL[k].toLowerCase();
      return n > 1 ? `${n} ${label}` : label;
    })
    .join(' với ');
}

/** Kỹ năng nhóm B theo lớp (GDPT 2018). Nhân bảng + CHIA (bảng chia là nội dung lớp
 *  3). Lớp 4 thêm chia CÓ DƯ (B5) và nhân 6–9 nhiều hơn. */
function bakeSkillForGrade(lop: 3 | 4): SkillId {
  // Khâu chuẩn bị: làm bánh (nhân), chia hộp (chia), HOẶC cân/đong nguyên liệu (đo lường).
  const pool: SkillId[] =
    lop >= 4
      ? ['B2', 'B2', 'B3', 'B5', 'C1', 'D1', 'E2', 'F2']
      : ['B1', 'B2', 'B3', 'C1', 'E1', 'F1'];
  return pick(pool);
}

const isDivide = (s: SkillId) => s === 'B3' || s === 'B5';
const prepLabel = (s: SkillId) =>
  s === 'C1'
    ? 'Cân nguyên liệu'
    : s === 'D1'
    ? 'Đọc đơn hàng'
    : s === 'E1'
    ? 'Viền bánh'
    : s === 'E2'
    ? 'Cắt bánh'
    : s === 'F1' || s === 'F2'
    ? 'Chia phần bánh'
    : isDivide(s)
    ? 'Chia bánh vào hộp'
    : 'Làm bánh cho khách';

/** Một khách ngày thường: làm bánh / chia hộp (B) → tính tiền (A4) → thối tiền (A6 kéo).
 *  `kinds` = các loại bánh ĐÃ MỞ theo cấp tiệm (lộ trình) — khách chỉ đặt trong đó. */
function normalCustomer(sched: QuestionScheduler, levels: Levels, lop: 3 | 4, kinds: readonly CakeKind[]): CustomerPlan {
  const bakeSkill = bakeSkillForGrade(lop);
  const bake = sched.next(bakeSkill, levels.B, lop);
  const total = sched.next('A4', levels.A, lop);
  const items = total.context!.items!;
  const cakes = orderCakesFor(items.length, kinds);
  const given = smallestNoteAbove(total.answer);
  const change = generateChangeDrag(levels.A, given - total.answer, given);

  const wants =
    items.length >= 3
      ? `Cho mình ${items.length} món nhé!`
      : `Mình lấy ${cakePhrase(cakes)} nha!`;

  return {
    id: nid(),
    variant: (Math.floor(Math.random() * 6) as CustomerVariant),
    wants,
    orderCakes: cakes,
    given,
    baseXu: 8 + Math.floor(Math.random() * 6),
    steps: [
      { kind: 'bake', q: bake, label: prepLabel(bakeSkill) },
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
  ngan: { warmup: 7, full: 10, mins: '~20 phút' },
  vua: { warmup: 11, full: 15, mins: '~30 phút' },
  dai: { warmup: 14, full: 20, mins: '~40 phút' },
};

export const SESSION_LABEL: Record<SessionPreset, { name: string; desc: string }> = {
  ngan: { name: 'Ngắn', desc: `${SESSION_COUNTS.ngan.full} khách · ${SESSION_COUNTS.ngan.mins}` },
  vua: { name: 'Vừa', desc: `${SESSION_COUNTS.vua.full} khách · ${SESSION_COUNTS.vua.mins}` },
  dai: { name: 'Dài', desc: `${SESSION_COUNTS.dai.full} khách · ${SESSION_COUNTS.dai.mins}` },
};

export function customerCountFor(day: number, session: SessionPreset = 'vua'): number {
  if (day === 1) return 1;
  const p = SESSION_COUNTS[session];
  return day <= 3 ? p.warmup : p.full;
}

export function buildDay(
  day: number,
  levels: Levels,
  session: SessionPreset = 'vua',
  lop: 3 | 4 = 3,
  cakes: readonly CakeKind[] = CAKE_KINDS
): DayPlan {
  const sched = new QuestionScheduler();
  if (day === 1) {
    return { day, khaitruong: true, beats: [{ kind: 'customer', c: khaitruongCustomer() }] };
  }
  const n = customerCountFor(day, session);
  const lunchAfter = Math.floor(n / 2); // nghỉ trưa ~giữa ngày (thiết kế 4.1, 9.6)
  const beats: Beat[] = [];
  let actIdx = 0;
  for (let i = 0; i < n; i++) {
    beats.push({ kind: 'customer', c: normalCustomer(sched, levels, lop, cakes) });
    const isLast = i === n - 1;
    // Nghỉ trưa ưu tiên; còn lại xen hoạt động sau mỗi 3 khách (không sau khách cuối).
    if (i === lunchAfter - 1) {
      beats.push({ kind: 'lunch' });
    } else if (!isLast && (i + 1) % ACTIVITY_EVERY === 0) {
      beats.push({ kind: 'activity', act: ACTIVITIES[actIdx % ACTIVITIES.length] });
      actIdx++;
    }
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
  B3: 'Chia đều (bảng chia)',
  B5: 'Chia có dư',
  C1: 'Cân/đong nguyên liệu',
  D1: 'Toán đố tổng–hiệu',
  E1: 'Chu vi (viền bánh)',
  E2: 'Góc (cắt bánh)',
  F1: 'Một phần mấy',
  F2: 'Phân số',
};
