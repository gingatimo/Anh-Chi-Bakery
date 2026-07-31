/** S09 — mở phong bì sticker. Hoạt ảnh bóc → dẫn sang sổ để bé tự dán (thiết kế 4.1, 5.3). */
import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGame } from '../game/store';
import { stickerById, Sticker } from '../assets/svg/Sticker';
import { BigButton } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { PALETTE } from '../design/tokens';

export function Reveal() {
  const pending = useGame((s) => s.pendingSticker);
  const goto = useGame((s) => s.goto);
  const [open, setOpen] = useState(false);
  const def = pending ? stickerById(pending) : null;

  // an toàn: không có sticker thì về hub (dùng effect, không side-effect trong render)
  useEffect(() => {
    if (!def) goto('hub');
  }, [def, goto]);

  if (!def) return null;

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: 26, marginBottom: 6 }}>Có sticker mới!</h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: 24 }}>
          {open ? 'Kéo vào sổ để dán nhé.' : 'Chạm vào phong bì để mở.'}
        </p>

        <div style={{ position: 'relative', width: 300, height: 240, margin: '0 auto' }}>
          {/* sticker bung ra */}
          <AnimatePresence>
            {open && (
              <>
                {[...Array(7)].map((_, i) => (
                  <motion.span
                    key={i}
                    initial={{ scale: 0, x: 130, y: 120 }}
                    animate={{ scale: [0, 1, 0], x: 130 + Math.cos((i / 7) * 6.28) * 120, y: 120 + Math.sin((i / 7) * 6.28) * 100 }}
                    transition={{ duration: 1.1, delay: 0.1 + i * 0.03 }}
                    style={{ position: 'absolute', fontSize: 26, zIndex: 1 }}
                  >
                    ✨
                  </motion.span>
                ))}
                <motion.div
                  initial={{ scale: 0.2, y: 60, opacity: 0, rotate: -12 }}
                  animate={{ scale: 1, y: -10, opacity: 1, rotate: [-12, 6, 0] }}
                  transition={{ type: 'spring', stiffness: 180, damping: 14 }}
                  style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', zIndex: 2 }}
                >
                  <Sticker def={def} width={170} />
                </motion.div>
              </>
            )}
          </AnimatePresence>

          {/* phong bì */}
          {!open && (
            <motion.button
              whileHover={{ scale: 1.04, y: -3 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => { setOpen(true); sfx.sparkle(); }}
              style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center' }}
              aria-label="Mở phong bì"
            >
              <svg viewBox="0 0 300 220" width={300} height={220} filter="url(#ac-shadow)">
                <rect x={20} y={54} width={260} height={150} rx={16} fill={PALETTE.rose} stroke="#4A3B32" strokeWidth={5} />
                <path d="M 20 60 L 150 140 L 280 60" fill="none" stroke="#4A3B32" strokeWidth={5} strokeLinejoin="round" />
                <path d="M 20 58 L 150 30 L 280 58 L 150 138 Z" fill={PALETTE.roseDark} stroke="#4A3B32" strokeWidth={5} strokeLinejoin="round" />
                <circle cx={150} cy={92} r={16} fill={PALETTE.butter} stroke="#4A3B32" strokeWidth={4} />
                <path d="M 143 92 l 5 6 l 10 -12" stroke="#4A3B32" strokeWidth={4} fill="none" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </motion.button>
          )}
        </div>

        <div style={{ marginTop: 20 }}>
          {open ? (
            <>
              <div style={{ fontWeight: 700, fontSize: 20, fontFamily: 'var(--font-display)' }}>{def.label}</div>
              <div style={{ color: 'var(--text-soft)', marginBottom: 18 }}>Đạt được: {def.earn}</div>
              <BigButton tone="sky" onClick={() => goto('book')}>Dán vào sổ →</BigButton>
            </>
          ) : (
            <div style={{ height: 76 }} />
          )}
        </div>
      </div>
    </div>
  );
}
