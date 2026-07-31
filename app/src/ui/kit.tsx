/**
 * kit.tsx — UI primitives dùng chung. Mục tiêu chạm ≥40px desktop, chữ ≥18px,
 * hover rõ (a11y 10.9). Không truyền đạt đúng/sai CHỈ bằng màu — luôn kèm icon.
 */
import type { ReactNode } from 'react';
import { motion } from 'framer-motion';
import { sfx } from './sfx';

export function BigButton({
  children,
  onClick,
  tone = 'peach',
  disabled,
  wide,
}: {
  children: ReactNode;
  onClick?: () => void;
  tone?: 'peach' | 'sage' | 'sky' | 'rose' | 'butter';
  disabled?: boolean;
  wide?: boolean;
}) {
  const bg = `var(--${tone})`;
  return (
    <motion.button
      whileHover={disabled ? undefined : { y: -2, scale: 1.03 }}
      whileTap={disabled ? undefined : { scale: 0.96, y: 1 }}
      onClick={() => {
        if (disabled) return;
        sfx.tap();
        onClick?.();
      }}
      disabled={disabled}
      style={{
        background: bg,
        color: 'var(--ink)',
        fontFamily: 'var(--font-display)',
        fontWeight: 700,
        fontSize: 20,
        padding: '14px 26px',
        borderRadius: 'var(--radius-lg)',
        boxShadow: disabled ? 'none' : 'var(--shadow)',
        border: '3px solid rgba(74,59,50,0.14)',
        opacity: disabled ? 0.5 : 1,
        width: wide ? '100%' : undefined,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 10,
        minHeight: 52,
      }}
    >
      {children}
    </motion.button>
  );
}

export function IconButton({
  children,
  onClick,
  label,
}: {
  children: ReactNode;
  onClick?: () => void;
  label: string;
}) {
  return (
    <motion.button
      aria-label={label}
      title={label}
      whileHover={{ scale: 1.1, y: -1 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => {
        sfx.tap();
        onClick?.();
      }}
      style={{
        width: 48,
        height: 48,
        borderRadius: 14,
        background: 'var(--bg-panel)',
        boxShadow: 'var(--shadow-soft)',
        display: 'grid',
        placeItems: 'center',
        fontSize: 22,
      }}
    >
      {children}
    </motion.button>
  );
}

/** Đồng xu (khác tiền VNĐ — thiết kế mục 6). */
export function Coin({ size = 26 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 40 40" aria-hidden>
      <circle cx={20} cy={20} r={17} fill="var(--butter)" stroke="var(--ink)" strokeWidth={3} />
      <circle cx={20} cy={20} r={11} fill="none" stroke="var(--wood-dark)" strokeWidth={2} />
      <text x={20} y={26} textAnchor="middle" fontFamily="Quicksand,sans-serif" fontWeight={700} fontSize={16} fill="var(--wood-dark)">
        ¢
      </text>
    </svg>
  );
}

export function XuBadge({ xu }: { xu: number }) {
  return (
    <div
      className="tnum"
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 6,
        background: 'var(--bg-panel)',
        padding: '6px 14px 6px 8px',
        borderRadius: 999,
        boxShadow: 'var(--shadow-soft)',
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
        fontSize: 19,
      }}
    >
      <Coin /> {xu}
    </div>
  );
}

export function Panel({
  children,
  style,
}: {
  children: ReactNode;
  style?: React.CSSProperties;
}) {
  return (
    <div
      style={{
        background: 'var(--bg-panel)',
        borderRadius: 'var(--radius-lg)',
        boxShadow: 'var(--shadow)',
        padding: 20,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

export function SpeechBubble({ children, tail = 'left' }: { children: ReactNode; tail?: 'left' | 'down' }) {
  return (
    <motion.div
      initial={{ scale: 0.8, opacity: 0, y: 6 }}
      animate={{ scale: 1, opacity: 1, y: 0 }}
      transition={{ type: 'spring', stiffness: 320, damping: 20 }}
      style={{
        position: 'relative',
        background: 'var(--paper)',
        color: 'var(--text)',
        borderRadius: 18,
        padding: '12px 18px',
        boxShadow: 'var(--shadow-soft)',
        border: '3px solid rgba(74,59,50,0.1)',
        fontWeight: 600,
        maxWidth: 320,
        lineHeight: 1.35,
      }}
    >
      {children}
      <span
        style={{
          position: 'absolute',
          ...(tail === 'left'
            ? { left: -12, top: 22, borderWidth: '8px 14px 8px 0', borderColor: 'transparent var(--paper) transparent transparent' }
            : { bottom: -12, left: 28, borderWidth: '14px 8px 0 8px', borderColor: 'var(--paper) transparent transparent transparent' }),
          width: 0,
          height: 0,
          borderStyle: 'solid',
          filter: 'drop-shadow(0 1px 0 rgba(74,59,50,0.1))',
        }}
      />
    </motion.div>
  );
}
