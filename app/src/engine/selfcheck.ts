/**
 * selfcheck.ts — property-based test cho engine (thiết kế mục 12).
 * Chạy nhiều lần sinh câu, khẳng định bất biến. Mở bằng #selfcheck.
 */
import { generate, generateChangeDrag } from './questions';
import { makeChange } from './money';
import { QuestionScheduler } from './scheduler';

export interface CheckResult {
  name: string;
  pass: boolean;
  detail: string;
}

const N = 400;

export function runSelfCheck(): CheckResult[] {
  const out: CheckResult[] = [];
  const add = (name: string, pass: boolean, detail = '') => out.push({ name, pass, detail });

  // A1 — đáp án là mệnh giá, choices chứa đáp án, phân biệt
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('A1', 1 + (i % 5));
      if (!q.choices || !q.choices.includes(q.answer)) { ok = false; why = 'choices thiếu đáp án'; break; }
      if (new Set(q.choices).size !== q.choices.length) { ok = false; why = 'choices trùng'; break; }
    }
    add('A1: choices hợp lệ, chứa đáp án', ok, why);
  }

  // A4 — tổng = cộng các món, bội số 1000, ≥ 0
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('A4', 1 + (i % 5));
      const items = q.context!.items!;
      const sum = items.reduce((s, x) => s + x, 0);
      if (q.answer !== sum) { ok = false; why = `tổng sai ${q.answer}≠${sum}`; break; }
      if (q.answer % 1000 !== 0) { ok = false; why = 'không bội số 1000'; break; }
      if (items.length < 2 || items.length > 3) { ok = false; why = 'số món ngoài 2–3'; break; }
    }
    add('A4: tổng đúng, bội số 1000, 2–3 món', ok, why);
  }

  // A4 — chẩn đoán "quên nhớ" hoạt động ít nhất đôi lần
  {
    let fired = 0;
    for (let i = 0; i < N; i++) {
      const q = generate('A4', 3);
      // thử một giá trị "quên nhớ" phổ biến: cộng từng cột không nhớ
      const items = q.context!.items!.map((x) => x / 1000);
      let f = 0,
        place = 1,
        a = items[0],
        b = items.slice(1).reduce((s, x) => s + x, 0);
      while (a > 0 || b > 0) { f += (((a % 10) + (b % 10)) % 10) * place; a = Math.floor(a / 10); b = Math.floor(b / 10); place *= 10; }
      if (q.diagnose && q.diagnose(f * 1000)) fired++;
    }
    add('A4: chẩn đoán lỗi "quên nhớ" kích hoạt', fired > 0, `${fired} lần/${N}`);
  }

  // A5 — thối tiền: 0 < answer < given, given > total, bội số 1000
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('A5', 1 + (i % 5));
      const { total, given } = q.context!;
      if (!(given! > total!)) { ok = false; why = 'given ≤ total'; break; }
      if (!(q.answer > 0)) { ok = false; why = 'thối ≤ 0 (âm!)'; break; }
      if (q.answer >= given!) { ok = false; why = 'thối ≥ tiền đưa'; break; }
      if (q.answer % 1000 !== 0) { ok = false; why = 'không bội số 1000'; break; }
    }
    add('A5: thối > 0, < tiền đưa, hợp lý (không âm)', ok, why);
  }

  // A6 — makeChange đúng tổng, target = answer
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const change = (1 + Math.floor(Math.random() * 90)) * 1000;
      const q = generateChangeDrag(1 + (i % 5), change);
      if (q.target !== change) { ok = false; why = 'target ≠ change'; break; }
      const notes = makeChange(change);
      const s = notes.reduce((a, b) => a + b, 0);
      if (s !== change) { ok = false; why = `makeChange sai ${s}≠${change}`; break; }
    }
    add('A6: makeChange đúng tổng, target khớp', ok, why);
  }

  // B1 — tích đúng, choices chứa đáp án & phân biệt
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('B1', 1 + (i % 5));
      const { rows, per } = q.context!;
      if (q.answer !== rows! * per!) { ok = false; why = 'tích sai'; break; }
      if (!q.choices!.includes(q.answer)) { ok = false; why = 'choices thiếu đáp án'; break; }
      if (new Set(q.choices).size !== q.choices!.length) { ok = false; why = 'choices trùng'; break; }
    }
    add('B1: tích đúng, choices hợp lệ', ok, why);
  }

  // Lớp 3 — chặn phạm vi tiền ≤ 100.000 (đúng GDPT 2018 lớp 3)
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const a4 = generate('A4', 5, 3); // level cao nhất, lớp 3
      if (a4.answer > 100000) { ok = false; why = `A4 lớp3 tổng ${a4.answer} > 100k`; break; }
      const a5 = generate('A5', 5, 3);
      if (a5.context!.given! > 100000) { ok = false; why = `A5 lớp3 khách đưa ${a5.context!.given} > 100k`; break; }
    }
    add('Lớp 3: tiền ≤ 100.000 (đúng phạm vi)', ok, why);
  }

  // B3 — chia đều: total = số hộp × mỗi hộp; choices chứa đáp án & phân biệt
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('B3', 1 + (i % 5));
      const { total, groups } = q.context!;
      if (total !== groups! * q.answer) { ok = false; why = `B3 ${total}≠${groups}×${q.answer}`; break; }
      if (!q.choices!.includes(q.answer)) { ok = false; why = 'B3 choices thiếu đáp án'; break; }
      if (new Set(q.choices).size !== q.choices!.length) { ok = false; why = 'B3 choices trùng'; break; }
    }
    add('B3: chia đều đúng (N = số hộp × mỗi hộp)', ok, why);
  }

  // B5 — chia có dư: 0 < số thừa < mỗi hộp; số thừa = N mod hộp; choices hợp lệ
  {
    let ok = true,
      why = '';
    for (let i = 0; i < N; i++) {
      const q = generate('B5', 1 + (i % 5));
      const { total, per } = q.context!;
      if (!(q.answer > 0 && q.answer < per!)) { ok = false; why = `B5 dư ${q.answer} ngoài (0,${per})`; break; }
      if (total! % per! !== q.answer) { ok = false; why = `B5 ${total}%${per}≠${q.answer}`; break; }
      if (!q.choices!.includes(q.answer)) { ok = false; why = 'B5 choices thiếu đáp án'; break; }
    }
    add('B5: chia có dư đúng (số thừa = N mod hộp)', ok, why);
  }

  // Scheduler — không lặp prompt trong cửa sổ 20
  {
    const sch = new QuestionScheduler();
    const seen: string[] = [];
    let ok = true,
      why = '';
    for (let i = 0; i < 200; i++) {
      const q = sch.next('A4', 3);
      const win = seen.slice(-20);
      if (win.includes(q.key)) { ok = false; why = `lặp ở câu ${i}`; break; }
      seen.push(q.key);
    }
    add('Scheduler: không lặp trong 20 câu', ok, why);
  }

  return out;
}
