/** Bàn phím PIN 4 số tái dùng (dùng cho khoá của bé). Gọi onComplete(code) khi đủ
 * 4 số rồi tự xoá để nhập lại; truyền shake=true để lắc báo sai. */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { sfx } from './sfx';

export function PinPad({ onComplete, shake }: { onComplete: (code: string) => void; shake?: boolean }) {
  const [entry, setEntry] = useState('');

  const push = (d: string) => {
    if (entry.length >= 4) return;
    sfx.tap();
    const next = entry + d;
    setEntry(next);
    if (next.length === 4)
      setTimeout(() => {
        onComplete(next);
        setEntry('');
      }, 140);
  };

  return (
    <motion.div animate={shake ? { x: [0, -10, 10, -6, 6, 0] } : {}} style={{ display: 'inline-block' }}>
      <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: 22 }}>
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            style={{
              width: 44,
              height: 52,
              borderRadius: 12,
              background: 'var(--bg-panel)',
              boxShadow: 'var(--shadow-soft)',
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              fontWeight: 700,
              color: 'var(--text)',
            }}
          >
            {entry[i] ? '●' : ''}
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 72px)', gap: 10, justifyContent: 'center' }}>
        {['1', '2', '3', '4', '5', '6', '7', '8', '9', '', '0', '⌫'].map((k, i) =>
          k === '' ? (
            <div key={i} />
          ) : (
            <motion.button
              key={i}
              whileTap={{ scale: 0.9 }}
              onClick={() => (k === '⌫' ? (sfx.tap(), setEntry((e) => e.slice(0, -1))) : push(k))}
              style={{
                height: 60,
                borderRadius: 14,
                fontSize: 24,
                fontWeight: 700,
                fontFamily: 'var(--font-display)',
                background: 'var(--bg-panel)',
                color: 'var(--text)',
                boxShadow: 'var(--shadow-soft)',
              }}
            >
              {k}
            </motion.button>
          )
        )}
      </div>
    </motion.div>
  );
}
