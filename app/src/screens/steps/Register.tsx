/** A4 — tổng đơn hàng (keypad máy tính tiền, S06). Bấm số như máy tính tiền thật. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import type { Question } from '../../engine/questions';
import type { CustomerVariant } from '../../assets/svg/Customer';
import { formatVND } from '../../engine/money';
import { StepShell } from '../../ui/StepShell';
import { useAttempts } from '../../ui/useAttempts';
import { sfx } from '../../ui/sfx';

const KEYS = ['7', '8', '9', '4', '5', '6', '1', '2', '3', '⌫', '0', '✓'];

export function Register({
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
  const { hint, mood, done, submit } = useAttempts(q, onDone);
  const [typed, setTyped] = useState('');
  const items = q.context?.items ?? [];

  function press(k: string) {
    if (done) return;
    if (k === '⌫') {
      sfx.tap();
      setTyped((t) => t.slice(0, -1));
    } else if (k === '✓') {
      if (!typed) return;
      const ok = submit(Number(typed));
      if (!ok) setTyped('');
    } else {
      if (typed.length >= 7) return;
      sfx.tap();
      setTyped((t) => (t === '0' ? k : t + k));
    }
  }

  return (
    <StepShell
      title={q.prompt}
      stepLabel={stepLabel}
      customerVariant={customerVariant}
      customerMood={mood}
      customerSays={customerSays}
      hint={hint}
    >
      <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap' }}>
        {/* Hoá đơn */}
        <div style={{ background: 'var(--paper)', borderRadius: 14, padding: '16px 18px', boxShadow: 'var(--shadow-soft)', minWidth: 220 }}>
          <div style={{ fontFamily: 'var(--font-display)', fontWeight: 700, marginBottom: 8 }}>Hoá đơn</div>
          {items.map((p, i) => (
            <div key={i} className="tnum" style={{ display: 'flex', justifyContent: 'space-between', gap: 20, padding: '4px 0', fontSize: 19 }}>
              <span style={{ color: 'var(--text-soft)' }}>Món {i + 1}</span>
              <span style={{ fontWeight: 600 }}>{formatVND(p)}đ</span>
            </div>
          ))}
          <div style={{ borderTop: '2px dashed rgba(74,59,50,0.2)', margin: '8px 0' }} />
          <div className="tnum" style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 700, fontSize: 20 }}>
            <span>Tổng</span>
            <span style={{ color: 'var(--rose-dark)' }}>?</span>
          </div>
        </div>

        {/* Máy tính tiền */}
        <div style={{ background: 'var(--wood)', borderRadius: 18, padding: 14, boxShadow: 'var(--shadow)' }}>
          <div
            className="tnum"
            style={{
              background: '#2E3A2A',
              color: '#CFE6B8',
              borderRadius: 10,
              padding: '12px 16px',
              fontSize: 30,
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              textAlign: 'right',
              minWidth: 200,
              marginBottom: 12,
              letterSpacing: 1,
            }}
          >
            {typed ? formatVND(Number(typed)) : '0'}
            <span style={{ fontSize: 18 }}> đ</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 64px)', gap: 8 }}>
            {KEYS.map((k) => (
              <motion.button
                key={k}
                whileTap={{ scale: 0.9 }}
                whileHover={{ y: -2 }}
                onClick={() => press(k)}
                style={{
                  height: 58,
                  borderRadius: 12,
                  fontSize: 24,
                  fontWeight: 700,
                  fontFamily: 'var(--font-display)',
                  background: k === '✓' ? 'var(--sage)' : k === '⌫' ? 'var(--rose)' : '#FFFDF6',
                  color: 'var(--ink)',
                  boxShadow: 'var(--shadow-soft)',
                }}
              >
                {k}
              </motion.button>
            ))}
          </div>
        </div>
      </div>
      {done && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ marginTop: 16, fontSize: 22, fontWeight: 700, color: 'var(--sage-dark)' }}>
          ✓ Tính tiền giỏi lắm!
        </motion.div>
      )}
    </StepShell>
  );
}
