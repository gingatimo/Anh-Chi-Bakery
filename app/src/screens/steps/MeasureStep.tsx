/** C1 — Cân/đong nguyên liệu (đo lường lớp 3). Cân hiện số ĐANG CÓ, vạch mục tiêu CẦN;
 *  bé tính "cần thêm mấy" rồi chạm chọn. Diegetic: hành động cân bột/đường/sữa thật. */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';

const INK = '#4A3B32';

export function MeasureStep({
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
  const target = q.context?.total ?? 0;
  const have = q.context?.given ?? 0;
  const unit = q.context?.unit ?? 'g';
  const choices = q.choices ?? [q.answer];
  const fill = target > 0 ? Math.min(1, have / target) : 0;

  return (
    <StepShell title={q.prompt} stepLabel={stepLabel} customerVariant={customerVariant} customerMood={mood} customerSays={customerSays} hint={hint}>
      {/* Cái cân */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, flexWrap: 'wrap', marginBottom: 20 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          {/* tô đựng nguyên liệu */}
          <svg width={150} height={92} viewBox="0 0 150 92" aria-hidden style={{ display: 'block' }}>
            <path d="M 18 20 h 114 a 8 8 0 0 1 8 8 q -63 46 -130 0 a 8 8 0 0 1 8 -8 Z" fill="#F3E3C6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            {/* nguyên liệu (đầy theo tỉ lệ have/target) */}
            <clipPath id="ac-bowl"><path d="M 20 24 h 110 q -55 44 -110 0 Z" /></clipPath>
            <g clipPath="url(#ac-bowl)">
              <rect x={18} y={68 - 44 * fill} width={114} height={60} fill={unit === 'ml' ? '#B7D8E6' : '#E7B981'} opacity={0.95} />
            </g>
            <path d="M 6 20 h 138" stroke={INK} strokeWidth={4} strokeLinecap="round" />
          </svg>
          {/* thân cân + màn hình số */}
          <div style={{ background: 'var(--wood)', borderRadius: 14, padding: 10, boxShadow: 'var(--shadow)' }}>
            <div
              className="tnum"
              style={{ background: '#2E3A2A', color: '#CFE6B8', borderRadius: 8, padding: '8px 18px', fontSize: 30, fontFamily: 'var(--font-display)', fontWeight: 700, minWidth: 130, textAlign: 'center' }}
            >
              {have} {unit}
            </div>
          </div>
        </div>

        {/* vạch mục tiêu + thanh tiến độ */}
        <div style={{ minWidth: 200, flex: 1 }}>
          <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--rose-dark)', marginBottom: 6 }}>
            Cần: {target} {unit}
          </div>
          <div style={{ position: 'relative', height: 26, background: 'var(--bg-sunk)', borderRadius: 999, overflow: 'hidden', boxShadow: 'inset 0 1px 3px rgba(74,59,50,0.15)' }}>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${fill * 100}%` }}
              transition={{ type: 'spring', stiffness: 120, damping: 20 }}
              style={{ height: '100%', background: 'var(--sage)', borderRadius: 999 }}
            />
          </div>
          <div style={{ color: 'var(--text-soft)', fontSize: 14, marginTop: 6 }}>Đang có {have} {unit} — còn thiếu chút nữa nhé.</div>
        </div>
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Cần thêm mấy {unit}?</div>
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
                minWidth: 92,
                height: 76,
                padding: '0 14px',
                borderRadius: 16,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 26,
                background: 'var(--bg-panel)',
                color: 'var(--text)',
                boxShadow: revealed && isAnswer ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: dim ? 0.4 : 1,
              }}
            >
              {c} {unit}
            </motion.button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Cân đúng rồi!
        </motion.div>
      )}
    </StepShell>
  );
}
