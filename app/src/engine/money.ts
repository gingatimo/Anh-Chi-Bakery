/**
 * money.ts — tiện ích tiền tệ VN (thiết kế 3.2).
 * Chỉ tiền giấy polymer đang lưu hành. Giá bánh luôn bội số 1.000. Không tiền xu.
 */
import { NOTES, type NoteValue } from '../assets/svg/Money';

export { NOTES };
export type { NoteValue };

export const NOTES_DESC = [...NOTES].sort((a, b) => b - a) as NoteValue[];

export function formatVND(n: number): string {
  return n.toLocaleString('vi-VN');
}

/**
 * makeChange — tổ hợp tờ tiền ÍT NHẤT để đủ `amount` (bội số 1.000).
 * Hệ mệnh giá VN là canonical nên tham lam cho kết quả tối ưu.
 */
export function makeChange(amount: number, cap?: NoteValue): NoteValue[] {
  const out: NoteValue[] = [];
  let rest = amount;
  for (const n of NOTES_DESC) {
    if (cap && n > cap) continue;
    while (rest >= n) {
      out.push(n);
      rest -= n;
    }
  }
  return out; // rest phải = 0 với amount bội số 1.000
}

/** Đếm số tờ mỗi mệnh giá. */
export function tally(notes: NoteValue[]): Map<NoteValue, number> {
  const m = new Map<NoteValue, number>();
  for (const n of notes) m.set(n, (m.get(n) ?? 0) + 1);
  return m;
}

/** Mệnh giá nhỏ nhất > value (để chọn "tờ khách đưa"). */
export function smallestNoteAbove(value: number): NoteValue {
  for (const n of NOTES_DESC.slice().reverse()) {
    if (n > value) return n;
  }
  return NOTES_DESC[0];
}

/** Random bội số step trong [min, max]. */
export function randMultiple(min: number, max: number, step = 1000): number {
  const lo = Math.ceil(min / step);
  const hi = Math.floor(max / step);
  return (lo + Math.floor(Math.random() * (hi - lo + 1))) * step;
}

export function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}
