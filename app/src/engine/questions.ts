/**
 * questions.ts — engine sinh câu hỏi có tham số (thiết kế 3.3–3.5).
 * Mỗi kỹ năng = template có tham số + cấp độ. Đáp án nhiễu là LỖI THẬT trẻ hay
 * mắc (không phải số ngẫu nhiên); cùng danh mục lỗi đó dùng để CHẨN ĐOÁN khi bé
 * gõ số — gợi ý nhắm thẳng vào lỗi.
 *
 * 4 chế độ trả lời (3.5): choose | keypad | money-drag | tray-drag.
 */
import { formatVND, makeChange, pick, shuffle, smallestNoteAbove, NOTES } from './money';
import type { NoteValue } from './money';

export type QMode = 'choose' | 'keypad' | 'money-drag' | 'tray-drag' | 'divide' | 'measure' | 'quiz' | 'geo' | 'fraction';
// A tiền; B nhân/chia; C đo lường; D toán đố; E hình học; F phân số (GDPT 2018 lớp 3–4).
// F1 "một phần mấy" (lớp 3); F2 phân số k/n (lớp 4). Đáp án phân số mã hoá tử*1000+mẫu.
export type SkillId = 'A1' | 'A4' | 'A5' | 'A6' | 'B1' | 'B2' | 'B3' | 'B5' | 'C1' | 'D1' | 'E1' | 'E2' | 'F1' | 'F2';

export interface Question {
  skill: SkillId;
  level: number;
  mode: QMode;
  /** khóa tham số — để chống lặp câu (KHÔNG dùng prompt vì có thể cố định) */
  key: string;
  prompt: string;
  answer: number;
  /** choose: danh sách lựa chọn (với A1 là mệnh giá tờ tiền) */
  choices?: number[];
  /** money-drag (S07): số tiền cần ghép bằng các tờ */
  target?: number;
  /** ngữ cảnh hiển thị */
  context?: {
    items?: number[]; // A4: giá từng món (đồng)
    total?: number;
    given?: number;
    rows?: number;
    per?: number;
    groups?: number; // B3: số hộp cần chia đều
    unit?: string; // C1: đơn vị đo (g, ml…)
    diff?: number; // D1: hiệu (cho sơ đồ đoạn thẳng tổng–hiệu)
    labels?: [string, string]; // D1: tên hai loại (nhiều hơn, ít hơn)
  };
  hints: [string, string, string];
  /** chẩn đoán lỗi khi nhập số — trả về gợi ý nhắm đúng lỗi, hoặc null */
  diagnose?: (typed: number) => string | null;
}

const clampLevel = (n: number) => Math.max(1, Math.min(5, n));

// ── Danh mục LỖI THẬT (làm việc trên đơn vị "nghìn" cho nhóm A) ──
/** Cộng nhưng quên nhớ: cộng từng cột, bỏ số nhớ. */
function forgetCarryAdd(a: number, b: number): number {
  let res = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    const d = ((a % 10) + (b % 10)) % 10; // bỏ nhớ
    res += d * place;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return res;
}
/** Trừ ngược từng cột: mỗi cột lấy |trên − dưới|. */
function reverseColumnSub(a: number, b: number): number {
  let res = 0;
  let place = 1;
  while (a > 0 || b > 0) {
    const d = Math.abs((a % 10) - (b % 10));
    res += d * place;
    a = Math.floor(a / 10);
    b = Math.floor(b / 10);
    place *= 10;
  }
  return res;
}

const kToVnd = (k: number) => k * 1000;

// ─────────────────────────────────────────────────────────────
// A1 — Nhận biết mệnh giá (choose)
// ─────────────────────────────────────────────────────────────
function genA1(level: number): Question {
  const pool: NoteValue[] =
    level <= 1
      ? [1000, 2000, 5000, 10000]
      : level <= 2
      ? [1000, 2000, 5000, 10000, 20000, 50000]
      : [2000, 5000, 10000, 20000, 50000, 100000, 200000];
  const answer = pick(pool);
  const others = shuffle(pool.filter((n) => n !== answer)).slice(0, 3);
  const choices = shuffle([answer, ...others]);
  return {
    skill: 'A1',
    level,
    mode: 'choose',
    key: `A1:${answer}`,
    prompt: `Đâu là tờ ${formatVND(answer)}đ?`,
    answer,
    choices,
    hints: [
      'Nhìn con số to nhất trên tờ tiền nhé.',
      `Mình cần tìm số ${formatVND(answer)}.`,
      `Tớ chỉ nhé: tờ có ghi ${formatVND(answer)} chính là nó!`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// A4 — Tổng đơn hàng 2–3 món (keypad)
// ─────────────────────────────────────────────────────────────
// Phạm vi theo LỚP (GDPT 2018): lớp 3 số ≤ 100.000 → tổng đơn ≤ ~100k;
// lớp 4 số lớn hơn (bối cảnh tiền, tối đa mệnh giá 500k).
const A4_RANGES: Record<3 | 4, [number, number][]> = {
  3: [[3, 10], [5, 15], [8, 20], [10, 28], [12, 32]], // level5: 3×32 = 96k ≤ 100k
  4: [[5, 20], [10, 35], [15, 55], [20, 75], [25, 95]],
};
function genA4(level: number, lop: 3 | 4 = 3): Question {
  const [lo, hi] = A4_RANGES[lop][clampLevel(level) - 1];
  const count = level >= 3 ? 3 : 2;
  const itemsK = Array.from({ length: count }, () => lo + Math.floor(Math.random() * (hi - lo + 1)));
  const totalK = itemsK.reduce((s, x) => s + x, 0);
  const answer = kToVnd(totalK);

  const forgot = kToVnd(itemsK.reduce((acc, x) => forgetCarryAdd(acc, x)));
  const shift = answer * 10;

  return {
    skill: 'A4',
    level,
    mode: 'keypad',
    key: `A4:${itemsK.slice().sort((a, b) => a - b).join('+')}`,
    prompt: `Cộng cả đơn giúp Mập nhé!`,
    answer,
    context: { items: itemsK.map(kToVnd), total: answer },
    hints: [
      'Cộng hàng nghìn trước, đừng quên số nhớ.',
      `Thử cộng dần: ${itemsK.map((x) => formatVND(kToVnd(x))).join(' + ')}.`,
      `Kết quả là ${formatVND(answer)}đ. Mình bấm số này nha.`,
    ],
    diagnose: (t) => {
      if (t === forgot && forgot !== answer) return 'Hình như quên số nhớ rồi — cộng lại hàng nghìn nhé.';
      if (t === shift || t * 10 === answer) return 'Coi chừng lệch một hàng số 0 nha.';
      return null;
    },
  };
}

// ─────────────────────────────────────────────────────────────
// A5 — Trừ để thối tiền (keypad) — tính số tiền thối
// ─────────────────────────────────────────────────────────────
// Lớp 3: tổng ≤ 88k → khách đưa ≤ 100k (mốc lớp 3). Lớp 4: lớn hơn.
const A5_RANGES: Record<3 | 4, [number, number][]> = {
  3: [[5, 18], [10, 30], [15, 45], [20, 60], [25, 88]],
  4: [[10, 40], [20, 70], [30, 110], [40, 150], [50, 180]],
};
function genA5(level: number, lop: 3 | 4 = 3): Question {
  const [lo, hi] = A5_RANGES[lop][clampLevel(level) - 1];
  const totalK = lo + Math.floor(Math.random() * (hi - lo + 1));
  const total = kToVnd(totalK);
  const given = smallestNoteAbove(total);
  const answer = given - total;

  const reverse = kToVnd(reverseColumnSub(given / 1000, totalK));

  return {
    skill: 'A5',
    level,
    mode: 'keypad',
    key: `A5:${total}/${given}`,
    prompt: `Khách đưa tờ ${formatVND(given)}đ. Thối lại bao nhiêu?`,
    answer,
    context: { total, given },
    hints: [
      'Lấy tiền khách đưa trừ đi tiền món hàng.',
      `${formatVND(given)} − ${formatVND(total)} = ?`,
      `Thối lại ${formatVND(answer)}đ nhé.`,
    ],
    diagnose: (t) => {
      if (t === reverse && reverse !== answer) return 'Nhớ mượn khi trừ nha, đừng lấy số nhỏ trừ số lớn.';
      return null;
    },
  };
}

// ─────────────────────────────────────────────────────────────
// A6 — Chọn tổ hợp tờ tiền để thối (money-drag, S07)
// ─────────────────────────────────────────────────────────────
function genA6(level: number, lop: 3 | 4 = 3, changeAmount?: number, givenNote?: number): Question {
  // Nếu đến từ luồng phục vụ: thối đúng số change đã tính.
  // Nếu độc lập: sinh một số tiền thối hợp lý.
  let total: number, given: number, answer: number;
  if (changeAmount != null) {
    answer = changeAmount;
    given = givenNote ?? 0;
    total = givenNote ? givenNote - changeAmount : 0;
  } else {
    const q = genA5(level, lop);
    total = q.context!.total!;
    given = q.context!.given!;
    answer = q.answer;
  }
  const notes = makeChange(answer);
  return {
    skill: 'A6',
    level,
    mode: 'money-drag',
    key: `A6:${total}/${given}/${answer}`,
    prompt: `Kéo tiền thối vào khay: ${formatVND(answer)}đ`,
    answer,
    target: answer,
    context: { total, given },
    hints: [
      'Kéo từng tờ vào khay cho đủ số tiền thối.',
      `Thử tờ lớn trước: cần đủ ${formatVND(answer)}đ.`,
      `Gợi ý: ${notes.map((n) => formatVND(n)).join(' + ')}.`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// B1 — Bảng nhân 2–5 (tray-drag, S05) — scaffold theo level
// ─────────────────────────────────────────────────────────────
function genB1(level: number): Question {
  // level thấp: số nhỏ, hiện đủ khay để đếm; level cao: số lớn hơn, bớt hình.
  const rows = 2 + Math.floor(Math.random() * (level <= 2 ? 3 : 4)); // 2..5
  const per = 2 + Math.floor(Math.random() * (level <= 2 ? 4 : 6)); // 2..7
  const answer = rows * per;

  const sumInstead = rows + per;
  const offRow = (rows + 1) * per;
  const adjacent = rows * (per + 1);
  const choicePool = shuffle([answer, sumInstead, offRow, adjacent].filter((v, i, a) => a.indexOf(v) === i && v !== answer));
  const choices = shuffle([answer, ...choicePool.slice(0, 3)]);

  return {
    skill: 'B1',
    level,
    mode: 'tray-drag',
    key: `B1:${rows}x${per}`,
    prompt: `Xếp ${rows} khay, mỗi khay ${per} bánh. Tất cả mấy bánh?`,
    answer,
    choices,
    context: { rows, per },
    hints: [
      `Mỗi khay ${per} bánh, có ${rows} khay.`,
      `Đếm theo nhóm: ${Array.from({ length: rows }, () => per).join(' + ')}.`,
      `${rows} × ${per} = ${answer} bánh.`,
    ],
    diagnose: (t) => {
      if (t === sumInstead) return 'Đây là phép NHÂN nhé, không phải cộng hai số.';
      if (t === offRow || t === adjacent) return 'Đếm lại số khay và số bánh mỗi khay nha.';
      return null;
    },
  };
}

// B2 — Bảng nhân 6–9 (tray-drag) — khó hơn B1
function genB2(level: number): Question {
  const rows = 2 + Math.floor(Math.random() * 8); // 2..9
  const per = 6 + Math.floor(Math.random() * 4); // 6..9
  const answer = rows * per;
  const sumInstead = rows + per;
  const offRow = (rows + 1) * per;
  const adjacent = rows * (per + 1);
  const choicePool = shuffle([sumInstead, offRow, adjacent].filter((v, i, a) => a.indexOf(v) === i && v !== answer));
  const choices = shuffle([answer, ...choicePool.slice(0, 3)]);
  return {
    skill: 'B2',
    level,
    mode: 'tray-drag',
    key: `B2:${rows}x${per}`,
    prompt: `Xếp ${rows} khay, mỗi khay ${per} bánh. Tất cả mấy bánh?`,
    answer,
    choices,
    context: { rows, per },
    hints: [`Mỗi khay ${per} bánh, có ${rows} khay.`, `Đếm theo nhóm ${per} một.`, `${rows} × ${per} = ${answer} bánh.`],
    diagnose: (t) => {
      if (t === sumInstead) return 'Đây là phép NHÂN nhé, không phải cộng.';
      if (t === offRow || t === adjacent) return 'Đếm lại số khay và số bánh mỗi khay nha.';
      return null;
    },
  };
}

// ─────────────────────────────────────────────────────────────
// B3 — Chia trong bảng (divide, S05): "chia đều N bánh vào K hộp" (lớp 3)
// ─────────────────────────────────────────────────────────────
function genB3(level: number): Question {
  const hi = level <= 2 ? 5 : 9; // scaffold: level thấp số nhỏ, level cao tới bảng 9
  const groups = 2 + Math.floor(Math.random() * (hi - 1)); // số hộp 2..hi
  const quotient = 2 + Math.floor(Math.random() * (hi - 1)); // mỗi hộp 2..hi
  const total = groups * quotient;
  const answer = quotient;
  const pool = shuffle(
    [groups, quotient + 1, Math.max(1, quotient - 1)].filter((v, i, a) => a.indexOf(v) === i && v !== answer)
  );
  const choices = shuffle([answer, ...pool.slice(0, 3)]);
  return {
    skill: 'B3',
    level,
    mode: 'divide',
    key: `B3:${total}/${groups}`,
    prompt: `Chia đều ${total} bánh vào ${groups} hộp. Mỗi hộp mấy bánh?`,
    answer,
    choices,
    context: { total, groups },
    hints: [
      'Chia đều nghĩa là mỗi hộp bằng nhau nhé.',
      `${groups} hộp — mỗi hộp mấy cái thì vừa đủ ${total}?`,
      `${total} : ${groups} = ${answer} bánh mỗi hộp.`,
    ],
  };
}

// B5 — Chia có dư (divide): "N bánh, hộp K cái, thừa mấy?" — số dư NHÌN THẤY (lớp 3–4)
function genB5(level: number): Question {
  const per = 3 + Math.floor(Math.random() * 5); // mỗi hộp 3..7 cái
  const full = 2 + Math.floor(Math.random() * (level <= 2 ? 3 : 6)); // số hộp đầy
  const rem = 1 + Math.floor(Math.random() * (per - 1)); // dư 1..per-1
  const total = per * full + rem;
  const answer = rem;
  const cand = new Set<number>([answer]);
  let guard = 0;
  while (cand.size < Math.min(4, per) && guard < 30) {
    cand.add(Math.floor(Math.random() * per)); // các số dư có thể: 0..per-1
    guard++;
  }
  const choices = shuffle([...cand]);
  return {
    skill: 'B5',
    level,
    mode: 'divide',
    key: `B5:${total}/${per}`,
    prompt: `${total} bánh, mỗi hộp ${per} cái. Xếp xong còn thừa mấy bánh?`,
    answer,
    choices,
    context: { total, per },
    hints: [
      `Xếp đầy từng hộp ${per} cái, đếm số bánh còn thừa.`,
      `${full} hộp đầy hết ${per * full} bánh; còn lại là số thừa.`,
      `${total} : ${per} = ${full} dư ${answer}.`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// C1 — Cân/đong nguyên liệu (measure): đo khối lượng (g) / dung tích (ml) (lớp 3)
// ─────────────────────────────────────────────────────────────
const INGREDIENTS = [
  { unit: 'g', label: 'bột', step: 50 },
  { unit: 'g', label: 'đường', step: 50 },
  { unit: 'g', label: 'bơ', step: 50 },
  { unit: 'ml', label: 'sữa', step: 50 },
  { unit: 'ml', label: 'nước', step: 100 },
];
function genC1(level: number): Question {
  const ing = pick(INGREDIENTS);
  const step = ing.step;
  const maxSteps = level <= 2 ? 8 : 18; // level cao → số lớn hơn (tới ~900–1800)
  const targetSteps = 2 + Math.floor(Math.random() * (maxSteps - 1));
  const haveSteps = 1 + Math.floor(Math.random() * (targetSteps - 1)); // 1..(target-1) → luôn < target
  const target = targetSteps * step;
  const have = haveSteps * step;
  const answer = target - have; // cần thêm bao nhiêu
  const pool = shuffle(
    [answer + step, answer - step, answer + 2 * step].filter((v, i, a) => a.indexOf(v) === i && v !== answer && v > 0)
  );
  const choices = shuffle([answer, ...pool.slice(0, 3)]);
  return {
    skill: 'C1',
    level,
    mode: 'measure',
    key: `C1:${ing.label}:${have}/${target}`,
    prompt: `Công thức cần ${target}${ing.unit} ${ing.label}. Cân đang có ${have}${ing.unit}. Cần thêm mấy ${ing.unit}?`,
    answer,
    choices,
    context: { total: target, given: have, unit: ing.unit },
    hints: [
      'Lấy số CẦN trừ số ĐANG CÓ nhé.',
      `${target} − ${have} = ?`,
      `Cần thêm ${answer}${ing.unit} nữa.`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// D1 — Toán đố TỔNG–HIỆU (quiz): tìm hai số biết tổng & hiệu (lớp 4)
// ─────────────────────────────────────────────────────────────
const CAKE_PAIRS: [string, string][] = [
  ['bánh quy', 'bánh kem'],
  ['bánh mì', 'bánh ngọt'],
  ['bánh su', 'bông lan'],
  ['bánh flan', 'bánh donut'],
];
function genD1(level: number): Question {
  const [a, b] = pick(CAKE_PAIRS);
  const small = 2 + Math.floor(Math.random() * (level <= 2 ? 8 : 20));
  const diff = 1 + Math.floor(Math.random() * (level <= 2 ? 6 : 12));
  const large = small + diff;
  const sum = small + large;
  const answer = large; // hỏi loại NHIỀU hơn
  const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const pool = shuffle(
    [small, sum, large + 1, Math.max(1, large - 1)].filter((v, i, ar) => ar.indexOf(v) === i && v !== answer && v > 0)
  );
  const choices = shuffle([answer, ...pool.slice(0, 3)]);
  return {
    skill: 'D1',
    level,
    mode: 'quiz',
    key: `D1:${sum}/${diff}`,
    prompt: `Bán tổng ${sum} cái. ${cap(a)} nhiều hơn ${b} là ${diff} cái. Hỏi có mấy ${a}?`,
    answer,
    choices,
    context: { total: sum, diff, labels: [a, b] },
    hints: [
      'Vẽ hai đoạn: loại nhiều hơn dài hơn một khúc bằng hiệu.',
      `Loại nhiều = (tổng + hiệu) : 2 = (${sum} + ${diff}) : 2`,
      `Có ${answer} ${a}.`,
    ],
  };
}

// ─────────────────────────────────────────────────────────────
// E1 — Chu vi (geo): viền ruy-băng quanh mặt bánh chữ nhật (lớp 3)
// ─────────────────────────────────────────────────────────────
function genE1(level: number): Question {
  const a = 3 + Math.floor(Math.random() * (level <= 2 ? 6 : 14)); // dài
  const b = 2 + Math.floor(Math.random() * Math.min(a - 1, level <= 2 ? 4 : 9)); // rộng < dài
  const answer = 2 * (a + b);
  const pool = shuffle(
    [a + b, a * b, answer + 2, Math.max(2, answer - 2)].filter((v, i, ar) => ar.indexOf(v) === i && v !== answer && v > 0)
  );
  const choices = shuffle([answer, ...pool.slice(0, 3)]);
  return {
    skill: 'E1',
    level,
    mode: 'geo',
    key: `E1:${a}x${b}`,
    prompt: `Mặt bánh chữ nhật dài ${a}dm, rộng ${b}dm. Viền ruy-băng quanh cần bao nhiêu dm?`,
    answer,
    choices,
    context: { rows: a, per: b, unit: 'dm' }, // rows = dài, per = rộng
    hints: ['Chu vi = (dài + rộng) × 2.', `(${a} + ${b}) × 2 = ?`, `Cần ${answer}dm ruy-băng.`],
  };
}

// E2 — Góc (geo): cắt bánh tròn thành n miếng đều, mỗi miếng bao nhiêu độ (lớp 4)
function genE2(level: number): Question {
  const options = level <= 2 ? [2, 3, 4, 6] : [2, 3, 4, 5, 6, 8, 9, 10, 12];
  const n = pick(options);
  const answer = 360 / n;
  const pool = shuffle(
    [n, answer + 10, Math.max(10, answer - 10), answer * 2].filter(
      (v, i, ar) => ar.indexOf(v) === i && v !== answer && Number.isInteger(v) && v > 0
    )
  );
  const choices = shuffle([answer, ...pool.slice(0, 3)]);
  return {
    skill: 'E2',
    level,
    mode: 'geo',
    key: `E2:${n}`,
    prompt: `Cắt bánh tròn thành ${n} miếng đều nhau. Mỗi miếng có góc bao nhiêu độ?`,
    answer,
    choices,
    context: { groups: n, unit: '°' }, // groups = số miếng
    hints: ['Cả vòng tròn là 360°.', `360 : ${n} = ?`, `Mỗi miếng ${answer}°.`],
  };
}

// ── Phân số: mã hoá tử/mẫu thành 1 số nguyên để dùng chung answer/choices ──
export const encFrac = (t: number, m: number) => t * 1000 + m;
export const decFrac = (v: number): [number, number] => [Math.floor(v / 1000), v % 1000];

// F1 — "Một phần mấy": nhận biết 1/n từ bánh cắt n phần, tô 1 phần (lớp 3)
function genF1(level: number): Question {
  const n = 2 + Math.floor(Math.random() * (level <= 2 ? 4 : 7)); // mẫu 2..5 / 2..8
  const answer = encFrac(1, n);
  const opts = new Set<number>([answer]);
  let g = 0;
  while (opts.size < 5 && g < 30) {
    opts.add(encFrac(1, 2 + Math.floor(Math.random() * 8)));
    g++;
  }
  const distinct = [...opts].filter((v) => v !== answer).slice(0, 3);
  const choices = shuffle([answer, ...distinct]);
  return {
    skill: 'F1',
    level,
    mode: 'fraction',
    key: `F1:1/${n}`,
    prompt: `Cắt bánh thành ${n} phần bằng nhau, tô 1 phần. Phần tô là phân số nào?`,
    answer,
    choices,
    context: { groups: n, per: 1 },
    hints: ['Cả bánh chia mấy phần thì mẫu số là số đó.', `1 phần trong ${n} phần = một phần ${n}.`, `Đó là 1/${n}.`],
  };
}

// F2 — Phân số k/n: nhận biết k/n từ bánh cắt n phần, tô k phần (lớp 4)
function genF2(level: number): Question {
  const n = 3 + Math.floor(Math.random() * (level <= 2 ? 4 : 7)); // mẫu 3..6 / 3..9
  const k = 1 + Math.floor(Math.random() * (n - 1)); // tử 1..n-1
  const answer = encFrac(k, n);
  const opts = new Set<number>([answer, encFrac(n, k)]); // đảo tử–mẫu (lỗi hay gặp)
  let g = 0;
  while (opts.size < 5 && g < 30) {
    opts.add(encFrac(1 + Math.floor(Math.random() * (n - 1)), n));
    g++;
  }
  const distinct = [...opts].filter((v) => v !== answer).slice(0, 3);
  const choices = shuffle([answer, ...distinct]);
  return {
    skill: 'F2',
    level,
    mode: 'fraction',
    key: `F2:${k}/${n}`,
    prompt: `Bánh chia ${n} phần bằng nhau, tô ${k} phần. Phần tô là phân số nào?`,
    answer,
    choices,
    context: { groups: n, per: k },
    hints: ['Tử số = số phần TÔ; mẫu số = TỔNG số phần.', `${k} phần tô trong ${n} phần → ${k}/${n}.`, `Đó là ${k}/${n}.`],
  };
}

const GEN: Record<SkillId, (level: number, lop: 3 | 4) => Question> = {
  A1: (l) => genA1(l),
  A4: (l, lop) => genA4(l, lop),
  A5: (l, lop) => genA5(l, lop),
  A6: (l, lop) => genA6(l, lop),
  B1: (l) => genB1(l),
  B2: (l) => genB2(l),
  B3: (l) => genB3(l),
  B5: (l) => genB5(l),
  C1: (l) => genC1(l),
  D1: (l) => genD1(l),
  E1: (l) => genE1(l),
  E2: (l) => genE2(l),
  F1: (l) => genF1(l),
  F2: (l) => genF2(l),
};

export function generate(skill: SkillId, level: number, lop: 3 | 4 = 3): Question {
  return GEN[skill](clampLevel(level), lop);
}

/** Thối tiền dựa trên change đã tính (nối A5→A6 trong luồng phục vụ). */
export function generateChangeDrag(level: number, changeAmount: number, givenNote?: number): Question {
  return genA6(clampLevel(level), 3, changeAmount, givenNote);
}

export { NOTES };
