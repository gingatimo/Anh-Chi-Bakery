/** A1 — nhận biết mệnh giá (choose). Chạm chọn đúng tờ tiền. */
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { Money, type NoteValue } from '../../assets/svg/Money';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';
import { sfx } from '../../ui/sfx';

export function ChooseNote({
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
  const choices = (q.choices ?? []) as NoteValue[];

  return (
    <StepShell
      title={q.prompt}
      stepLabel={stepLabel}
      customerVariant={customerVariant}
      customerMood={mood}
      customerSays={customerSays}
      hint={hint}
    >
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16 }}>
        {choices.map((v) => {
          const isAnswer = v === q.answer;
          const dim = revealed && !isAnswer;
          return (
            <motion.button
              key={v}
              onPointerDown={() => sfx.paper()}
              onClick={() => !done && submit(v)}
              whileHover={done ? undefined : { y: -4, scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              animate={revealed && isAnswer ? { scale: [1, 1.06, 1] } : {}}
              transition={{ repeat: revealed && isAnswer ? Infinity : 0, duration: 0.9 }}
              style={{
                borderRadius: 16,
                padding: 6,
                background: 'var(--bg-panel)',
                boxShadow: revealed && isAnswer ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: dim ? 0.4 : 1,
                cursor: done ? 'default' : 'pointer',
              }}
            >
              <Money value={v} width={200} />
            </motion.button>
          );
        })}
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Đúng rồi!
        </motion.div>
      )}
    </StepShell>
  );
}
