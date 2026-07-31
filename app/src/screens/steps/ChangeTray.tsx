/** A6 — khay thối tiền (money-drag, S07). Màn đáng đầu tư nhất (thiết kế mục 7):
 * kéo/chạm tờ tiền vào khay cho đủ số thối. KHÔNG gõ số — ghép tờ chính là kỹ
 * năng A6. Tổng chạy hiển thị (scaffold). */
import { useRef, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { Money, type NoteValue } from '../../assets/svg/Money';
import { NOTES_DESC, formatVND, makeChange } from '../../engine/money';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';
import { sfx } from '../../ui/sfx';

const sum = (a: NoteValue[]) => a.reduce((s, n) => s + n, 0);

export function ChangeTray({
  q,
  stepLabel,
  customerVariant,
  customerSays,
  onDone,
}: {
  q: Question;
  stepLabel: string;
  customerVariant: CustomerVariant;
  customerSays: string;
  onDone: (firstTry: boolean) => void;
}) {
  const { attempt, hint, mood, done, revealed, submit, setHint } = useAttempts(q, onDone);
  const target = q.target ?? q.answer;
  const given = q.context?.given ?? 0;
  const [added, setAdded] = useState<NoteValue[]>([]);
  const trayRef = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();

  const palette = NOTES_DESC.filter((n) => n <= target).slice().reverse(); // nhỏ → lớn
  const total = sum(added);
  const remaining = target - total;

  function tryAdd(note: NoteValue) {
    if (done || revealed) return;
    const s = total + note;
    if (s > target) {
      sfx.soft();
      submit(s); // tính là một lần thử sai → gợi ý leo thang
      if (attempt + 1 >= 3) setAdded(makeChange(target)); // Mập làm mẫu
      return;
    }
    const next = [...added, note];
    setAdded(next);
    if (s === target) {
      sfx.coin();
      submit(target);
    } else {
      sfx.paper();
      setHint(null);
    }
  }

  function removeAt(i: number) {
    if (done || revealed) return;
    sfx.paper();
    setAdded((a) => a.filter((_, k) => k !== i));
  }

  function pointInTray(x: number, y: number) {
    const r = trayRef.current?.getBoundingClientRect();
    return !!r && x >= r.left && x <= r.right && y >= r.top && y <= r.bottom;
  }

  return (
    <StepShell
      title={q.prompt}
      stepLabel={stepLabel}
      customerVariant={customerVariant}
      customerMood={mood}
      customerSays={customerSays}
      hint={hint}
      mapMood="hint"
    >
      {/* thông tin thối */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap', marginBottom: 16 }}>
        {given > 0 && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Khách đưa</span>
            <Money value={given as NoteValue} width={110} />
          </div>
        )}
        <div className="tnum" style={{ fontSize: 20, fontWeight: 700 }}>
          Cần thối:{' '}
          <span style={{ color: 'var(--rose-dark)', fontSize: 26 }}>{formatVND(target)}đ</span>
        </div>
      </div>

      {/* KHAY thối tiền (drop zone) */}
      <motion.div
        ref={trayRef}
        animate={done ? { boxShadow: '0 0 0 4px var(--sage), var(--shadow)' } : {}}
        style={{
          minHeight: 130,
          borderRadius: 18,
          background: 'var(--bg-sunk)',
          border: '3px dashed rgba(74,59,50,0.28)',
          padding: 14,
          display: 'flex',
          flexWrap: 'wrap',
          gap: 8,
          alignItems: 'center',
          marginBottom: 6,
        }}
      >
        {added.length === 0 && (
          <span style={{ color: 'var(--text-soft)', fontWeight: 600, padding: '0 8px' }}>
            Kéo hoặc chạm tờ tiền để bỏ vào khay…
          </span>
        )}
        {added.map((n, i) => (
          <motion.button
            key={`${n}-${i}`}
            layout
            initial={{ scale: 0.4, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ type: 'spring', stiffness: 380, damping: 20 }}
            onClick={() => removeAt(i)}
            title="Chạm để bỏ ra"
          >
            <Money value={n} width={96} />
          </motion.button>
        ))}
      </motion.div>

      {/* tổng chạy */}
      <div className="tnum" style={{ display: 'flex', gap: 18, alignItems: 'baseline', marginBottom: 18, fontSize: 19 }}>
        <span>
          Trong khay:{' '}
          <strong style={{ color: total === target ? 'var(--sage-dark)' : 'var(--text)', fontSize: 23 }}>
            {formatVND(total)}đ
          </strong>
        </span>
        {!done && remaining > 0 && <span style={{ color: 'var(--text-soft)' }}>còn thiếu {formatVND(remaining)}đ</span>}
        {added.length > 0 && !done && (
          <button onClick={() => { sfx.tap(); setAdded([]); }} style={{ marginLeft: 'auto', color: 'var(--rose-dark)', fontWeight: 700 }}>
            ↺ Làm lại
          </button>
        )}
      </div>

      {/* ví tiền — nguồn tờ tiền để kéo/chạm */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {palette.map((n) => (
          <motion.div
            key={n}
            drag={done || revealed || reduce ? false : true}
            dragSnapToOrigin
            whileDrag={{ scale: 1.12, zIndex: 50, boxShadow: 'var(--shadow-lift)' }}
            whileHover={done ? undefined : { y: -4 }}
            whileTap={{ scale: 0.96 }}
            onDragStart={() => sfx.paper()}
            onDragEnd={(_, info) => {
              if (pointInTray(info.point.x, info.point.y)) tryAdd(n);
            }}
            onClick={() => tryAdd(n)}
            style={{ borderRadius: 12, cursor: done ? 'default' : 'grab', touchAction: 'none' }}
          >
            <Money value={n} width={118} />
          </motion.div>
        ))}
      </div>

      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Thối đúng rồi, khách vui lắm!
        </motion.div>
      )}
    </StepShell>
  );
}
