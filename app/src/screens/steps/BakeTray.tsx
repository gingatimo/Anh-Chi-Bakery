/** B1 — bảng nhân (tray-drag/scaffold). Xếp `rows` khay × `per` bánh: nhóm nhìn
 * thấy được (scaffold theo level, 3.5), rồi chọn tổng. */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { Cake, type CakeKind } from '../../assets/svg/Cake';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';
import { sfx } from '../../ui/sfx';

export function BakeTray({
  q,
  stepLabel,
  customerVariant,
  customerSays,
  cake,
  onDone,
}: {
  q: Question;
  stepLabel: string;
  customerVariant: CustomerVariant;
  customerSays: string;
  cake: CakeKind;
  onDone: (firstTry: boolean) => void;
}) {
  const { hint, mood, done, revealed, submit } = useAttempts(q, onDone);
  const rows = q.context?.rows ?? 2;
  const per = q.context?.per ?? 3;
  const choices = q.choices ?? [q.answer];

  return (
    <StepShell
      title={q.prompt}
      stepLabel={stepLabel}
      customerVariant={customerVariant}
      customerMood={mood}
      customerSays={customerSays}
      hint={hint}
    >
      {/* Khay bánh — nhóm nhìn thấy được */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 22 }}>
        {Array.from({ length: rows }).map((_, r) => (
          <motion.div
            key={r}
            initial={{ y: -14, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: r * 0.12, type: 'spring', stiffness: 260, damping: 18 }}
            style={{
              background: 'var(--wood)',
              border: '3px solid rgba(74,59,50,0.18)',
              borderRadius: 14,
              padding: '10px 12px',
              boxShadow: 'var(--shadow-soft)',
              display: 'flex',
              gap: 2,
            }}
          >
            {Array.from({ length: Math.min(per, 6) }).map((_, i) => (
              <motion.div
                key={i}
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: r * 0.1 + i * 0.05 + 0.15, type: 'spring', stiffness: 320, damping: 16 }}
                onAnimationComplete={i === Math.min(per, 6) - 1 && r === rows - 1 ? () => sfx.pop() : undefined}
              >
                <Cake kind={cake} width={per > 6 ? 38 : 54} />
              </motion.div>
            ))}
            {per > 6 && (
              <span style={{ alignSelf: 'center', padding: '0 8px', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 20, color: 'var(--ink)' }}>
                ×{per}
              </span>
            )}
          </motion.div>
        ))}
      </div>

      <div style={{ fontWeight: 600, marginBottom: 10 }}>Tất cả mấy bánh?</div>
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
                height: 84,
                borderRadius: 18,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 34,
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
          ✓ Bánh thơm quá!
        </motion.div>
      )}
    </StepShell>
  );
}
