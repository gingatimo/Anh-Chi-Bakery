/** F1/F2 — PHÂN SỐ (fraction) qua bánh (GDPT 2018). F1 "một phần mấy" (lớp 3),
 *  F2 phân số k/n (lớp 4). Bánh cắt n phần, tô k phần → bé đọc phân số (tử/mẫu) rồi
 *  chọn. Đáp án/lựa chọn mã hoá tử*1000+mẫu (decFrac để vẽ lại). */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import { decFrac } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';

const INK = '#4A3B32';

function FractionLabel({ v }: { v: number }) {
  const [t, m] = decFrac(v);
  return (
    <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', lineHeight: 1.02 }}>
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{t}</span>
      <span style={{ width: 30, height: 3, background: 'currentColor', borderRadius: 2, margin: '3px 0' }} />
      <span style={{ fontSize: 26, fontWeight: 700, fontFamily: 'var(--font-display)' }}>{m}</span>
    </div>
  );
}

function FracPie({ n, k }: { n: number; k: number }) {
  const R = 76;
  const cx = 90;
  const cy = 90;
  const rad = (d: number) => (d * Math.PI) / 180;
  const step = 360 / n;
  const wedge = (i: number) => {
    const a0 = -90 + i * step;
    const a1 = -90 + (i + 1) * step;
    const x0 = cx + R * Math.cos(rad(a0));
    const y0 = cy + R * Math.sin(rad(a0));
    const x1 = cx + R * Math.cos(rad(a1));
    const y1 = cy + R * Math.sin(rad(a1));
    const large = step > 180 ? 1 : 0;
    return `M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`;
  };
  return (
    <svg width={180} height={180} viewBox="0 0 180 180" aria-hidden style={{ display: 'block' }}>
      {Array.from({ length: n }).map((_, i) => (
        <path key={i} d={wedge(i)} fill={i < k ? 'var(--peach)' : '#F6DCE4'} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />
      ))}
      <circle cx={cx} cy={cy} r={R} fill="none" stroke={INK} strokeWidth={3} />
    </svg>
  );
}

export function FractionStep({
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
  const n = q.context?.groups ?? 3;
  const k = q.context?.per ?? 1;
  const choices = q.choices ?? [q.answer];

  return (
    <StepShell title={q.prompt} stepLabel={stepLabel} customerVariant={customerVariant} customerMood={mood} customerSays={customerSays} hint={hint}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, flexWrap: 'wrap' }}>
        <FracPie n={n} k={k} />
        <div style={{ color: 'var(--text-soft)', fontWeight: 600 }}>
          Tô <b style={{ color: 'var(--peach-dark, #C67C43)' }}>{k}</b> / {n} phần
        </div>
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Chọn phân số đúng:</div>
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
                width: 84,
                height: 92,
                borderRadius: 16,
                background: 'var(--bg-panel)',
                color: 'var(--text)',
                boxShadow: revealed && isAnswer ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: dim ? 0.4 : 1,
                display: 'grid',
                placeItems: 'center',
              }}
            >
              <FractionLabel v={c} />
            </motion.button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Đọc phân số giỏi lắm!
        </motion.div>
      )}
    </StepShell>
  );
}
