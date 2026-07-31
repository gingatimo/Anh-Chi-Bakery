/** D1 — Toán đố TỔNG–HIỆU (quiz, lớp 4). Vẽ SƠ ĐỒ ĐOẠN THẲNG: hai thanh, thanh
 *  "nhiều hơn" dài hơn đúng một khúc = hiệu (tô đậm) — bé thấy phương pháp, rồi chọn. */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';

function BarRow({ label, base, extra, unit }: { label: string; base: number; extra: number; unit: number }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
      <div style={{ width: 92, textAlign: 'right', fontWeight: 700, fontFamily: 'var(--font-display)', fontSize: 14, color: 'var(--text)' }}>{label}</div>
      <div style={{ display: 'flex', height: 30, borderRadius: 8, overflow: 'hidden', boxShadow: 'var(--shadow-soft)' }}>
        <motion.div initial={{ width: 0 }} animate={{ width: Math.max(6, base * unit) }} transition={{ type: 'spring', stiffness: 120, damping: 20 }} style={{ background: 'var(--sage)' }} />
        {extra > 0 && (
          <motion.div initial={{ width: 0 }} animate={{ width: extra * unit }} transition={{ delay: 0.2, type: 'spring', stiffness: 120, damping: 20 }} style={{ background: 'var(--peach)', borderLeft: '2px dashed rgba(74,59,50,0.35)' }} />
        )}
      </div>
    </div>
  );
}

export function QuizStep({
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
  const { hint, mood, done, revealed, submit } = useAttempts(q, onDone);
  const choices = q.choices ?? [q.answer];
  const sum = q.context?.total ?? 0;
  const diff = q.context?.diff ?? 0;
  const [labA, labB] = q.context?.labels ?? ['Nhiều hơn', 'Ít hơn'];
  const small = (sum - diff) / 2;
  const large = (sum + diff) / 2;
  const unit = 300 / Math.max(1, large); // px mỗi cái để thanh dài nhất ~300px
  const showBars = q.skill === 'D1' && sum > 0;

  return (
    <StepShell title={q.prompt} stepLabel={stepLabel} customerVariant={customerVariant} customerMood={mood} customerSays={customerSays} hint={hint}>
      {showBars && (
        <div style={{ marginBottom: 22, maxWidth: 470 }}>
          <BarRow label={labA} base={small} extra={diff} unit={unit} />
          <BarRow label={labB} base={small} extra={0} unit={unit} />
          <div style={{ color: 'var(--text-soft)', fontSize: 14, marginTop: 4 }}>
            Tổng <b style={{ color: 'var(--text)' }}>{sum}</b> · <span style={{ color: 'var(--peach-dark, #C67C43)' }}>khúc cam = hiệu {diff}</span>
          </div>
        </div>
      )}

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Chọn đáp án:</div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        {choices.map((c) => {
          const isAnswer = c === q.answer;
          const dim = revealed && !isAnswer;
          return (
            <motion.button
              key={c}
              onClick={() => !done && submit(c)}
              whileHover={done ? undefined : { y: -3, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              animate={revealed && isAnswer ? { scale: [1, 1.08, 1] } : {}}
              transition={{ repeat: revealed && isAnswer ? Infinity : 0, duration: 0.9 }}
              className="tnum"
              style={{
                minWidth: 84,
                height: 76,
                padding: '0 12px',
                borderRadius: 16,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 30,
                background: 'var(--bg-panel)',
                color: 'var(--text)',
                boxShadow: revealed && isAnswer ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: dim ? 0.4 : 1,
              }}
            >
              {c}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Giỏi quá!
        </motion.div>
      )}
    </StepShell>
  );
}
