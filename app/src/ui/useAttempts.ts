/**
 * useAttempts — xử lý lượt trả lời (thiết kế 4.2). Sai lần 1→gợi nhớ, lần 2→
 * chia nhỏ, lần 3→Mập làm mẫu (vẫn hoàn thành, không phạt). Chẩn đoán lỗi khi
 * gõ số. Không bao giờ có màn "Sai rồi!".
 */
import { useState } from 'react';
import type { Question } from '../engine/questions';
import type { CustomerMood } from '../assets/svg/Customer';
import { sfx } from './sfx';

export function useAttempts(q: Question, onDone: (firstTry: boolean) => void) {
  const [attempt, setAttempt] = useState(0);
  const [hint, setHint] = useState<string | null>(null);
  const [mood, setMood] = useState<CustomerMood>('neutral');
  const [done, setDone] = useState(false);

  const revealed = attempt >= 3;

  function submit(value: number): boolean {
    if (done) return true;
    if (value === q.answer) {
      sfx.correct();
      setMood('happy');
      setDone(true);
      setTimeout(() => onDone(attempt === 0), 950);
      return true;
    }
    const a = attempt + 1;
    setAttempt(a);
    sfx.soft();
    setMood('patient');
    let h = q.hints[Math.min(a - 1, 2)];
    if (q.diagnose) {
      const d = q.diagnose(value);
      if (d) h = d;
    }
    setHint(h);
    if (a >= 3) {
      // Mập làm mẫu → hoàn thành (ít xu hơn, không phạt)
      setTimeout(() => {
        setDone(true);
        sfx.pop();
        onDone(false);
      }, 1700);
    }
    return false;
  }

  return { attempt, hint, mood, done, revealed, submit, setHint };
}
