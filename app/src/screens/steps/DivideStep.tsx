/** B3/B5 — phép CHIA (diegetic): chia bánh vào hộp (GDPT 2018 lớp 3–4).
 *  B3 chia đều: mỗi hộp mấy bánh. B5 chia có dư: bánh nằm NGOÀI hộp CHÍNH LÀ số dư —
 *  bé nhìn thấy, không cần giải thích khái niệm (thiết kế 3.5). Level thấp hiện đầy đủ
 *  (đếm được); level cao bỏ hình, chỉ còn phép tính. Trả lời bằng chạm chọn số. */
import { motion } from 'framer-motion';
import type { ReactNode } from 'react';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { Cake, type CakeKind } from '../../assets/svg/Cake';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';

function Box({ n, cake, empty }: { n: number; cake: CakeKind; empty?: boolean }) {
  return (
    <div
      style={{
        background: 'var(--wood)',
        border: '3px solid rgba(74,59,50,0.18)',
        borderRadius: 12,
        padding: '8px',
        boxShadow: 'var(--shadow-soft)',
        display: 'flex',
        flexWrap: 'wrap',
        gap: 2,
        width: 96,
        minHeight: 54,
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      {empty ? (
        <span style={{ color: 'var(--ink)', opacity: 0.4, fontSize: 24, fontWeight: 700 }}>?</span>
      ) : (
        Array.from({ length: Math.min(n, 6) }).map((_, i) => <Cake key={i} kind={cake} width={26} />)
      )}
      {!empty && n > 6 && <span style={{ alignSelf: 'center', fontWeight: 700, color: 'var(--ink)' }}>×{n}</span>}
    </div>
  );
}

export function DivideStep({
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
  const total = q.context?.total ?? 0;
  const choices = q.choices ?? [q.answer];
  const concrete = q.level <= 2; // scaffold: level thấp hiện đầy đủ để đếm

  let scene: ReactNode = null;
  if (q.skill === 'B3') {
    const groups = q.context?.groups ?? 2;
    scene = (
      <>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>
          {groups} hộp{concrete ? '' : ` · tất cả ${total} bánh`}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 20 }}>
          {Array.from({ length: groups }).map((_, i) => (
            <Box key={i} n={concrete ? q.answer : 0} cake={cake} empty={!concrete} />
          ))}
        </div>
      </>
    );
  } else {
    // B5 — chia có dư
    const per = q.context?.per ?? 3;
    const full = Math.floor(total / per);
    const rem = total - full * per;
    scene = concrete ? (
      <>
        <div style={{ fontWeight: 600, marginBottom: 8, color: 'var(--text)' }}>Hộp đựng {per} cái · tất cả {total} bánh</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 12 }}>
          {Array.from({ length: full }).map((_, i) => (
            <Box key={i} n={per} cake={cake} />
          ))}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20, padding: '8px 12px', background: 'var(--bg-sunk)', borderRadius: 12, width: 'fit-content' }}>
          <span style={{ fontWeight: 700, color: 'var(--rose-dark)' }}>Thừa:</span>
          {Array.from({ length: rem }).map((_, i) => (
            <Cake key={i} kind={cake} width={30} />
          ))}
        </div>
      </>
    ) : (
      <div style={{ fontWeight: 600, marginBottom: 20, color: 'var(--text)' }}>Có {total} bánh, mỗi hộp {per} cái.</div>
    );
  }

  return (
    <StepShell title={q.prompt} stepLabel={stepLabel} customerVariant={customerVariant} customerMood={mood} customerSays={customerSays} hint={hint}>
      {scene}
      <div style={{ fontWeight: 600, marginBottom: 10 }}>{q.skill === 'B5' ? 'Còn thừa mấy bánh?' : 'Mỗi hộp mấy bánh?'}</div>
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
          ✓ Chia khéo quá!
        </motion.div>
      )}
    </StepShell>
  );
}
