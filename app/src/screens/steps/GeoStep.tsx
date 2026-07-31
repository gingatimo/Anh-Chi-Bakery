/** E1/E2 — HÌNH HỌC (geo) qua bánh (GDPT 2018 lớp 3–4).
 *  E1 chu vi: viền ruy-băng quanh mặt bánh chữ nhật (dài × rộng).
 *  E2 góc: cắt bánh tròn thành n miếng đều — góc mỗi miếng. Có hình minh hoạ. */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';

const INK = '#4A3B32';

function RectPerimeter({ a, b }: { a: number; b: number }) {
  const scale = Math.min(260 / a, 140 / b, 30);
  const w = a * scale;
  const h = b * scale;
  return (
    <svg width={w + 70} height={h + 60} viewBox={`0 0 ${w + 70} ${h + 60}`} aria-hidden style={{ display: 'block' }}>
      <rect x={40} y={34} width={w} height={h} rx={8} fill="#F3E3C6" stroke={INK} strokeWidth={3} />
      {/* ruy-băng viền (đường bao đậm) */}
      <rect x={40} y={34} width={w} height={h} rx={8} fill="none" stroke="var(--peach)" strokeWidth={6} strokeDasharray="10 6" />
      <text x={40 + w / 2} y={24} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={16} fill={INK}>{a} dm</text>
      <text x={28} y={34 + h / 2 + 5} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={16} fill={INK}>{b} dm</text>
    </svg>
  );
}

function PieAngle({ n }: { n: number }) {
  const R = 68;
  const cx = 84;
  const cy = 84;
  const rad = (d: number) => (d * Math.PI) / 180;
  const step = 360 / n;
  const a0 = -90;
  const a1 = -90 + step;
  const x0 = cx + R * Math.cos(rad(a0));
  const y0 = cy + R * Math.sin(rad(a0));
  const x1 = cx + R * Math.cos(rad(a1));
  const y1 = cy + R * Math.sin(rad(a1));
  const large = step > 180 ? 1 : 0;
  return (
    <svg width={168} height={168} viewBox="0 0 168 168" aria-hidden style={{ display: 'block' }}>
      <circle cx={cx} cy={cy} r={R} fill="#F6DCE4" stroke={INK} strokeWidth={3} />
      {/* miếng được hỏi — tô nổi bật */}
      <path d={`M ${cx} ${cy} L ${x0} ${y0} A ${R} ${R} 0 ${large} 1 ${x1} ${y1} Z`} fill="var(--peach)" stroke={INK} strokeWidth={2.5} />
      {/* các đường cắt còn lại */}
      {Array.from({ length: n }).map((_, i) => {
        const ang = -90 + i * step;
        return <line key={i} x1={cx} y1={cy} x2={cx + R * Math.cos(rad(ang))} y2={cy + R * Math.sin(rad(ang))} stroke={INK} strokeWidth={2} />;
      })}
      <text x={cx + 22 * Math.cos(rad(a0 + step / 2))} y={cy + 22 * Math.sin(rad(a0 + step / 2)) + 5} textAnchor="middle" fontFamily="var(--font-display)" fontWeight={700} fontSize={18} fill={INK}>?</text>
    </svg>
  );
}

export function GeoStep({
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
  const unit = q.context?.unit ?? '';

  return (
    <StepShell title={q.prompt} stepLabel={stepLabel} customerVariant={customerVariant} customerMood={mood} customerSays={customerSays} hint={hint}>
      <div style={{ marginBottom: 20 }}>
        {q.skill === 'E1' ? (
          <RectPerimeter a={q.context?.rows ?? 6} b={q.context?.per ?? 4} />
        ) : (
          <PieAngle n={q.context?.groups ?? 4} />
        )}
      </div>

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
                minWidth: 88,
                height: 76,
                padding: '0 12px',
                borderRadius: 16,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 28,
                background: 'var(--bg-panel)',
                color: 'var(--text)',
                boxShadow: revealed && isAnswer ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: dim ? 0.4 : 1,
              }}
            >
              {c}{unit === '°' ? '°' : unit ? ` ${unit}` : ''}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Chuẩn luôn!
        </motion.div>
      )}
    </StepShell>
  );
}
