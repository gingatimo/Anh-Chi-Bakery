/** Nút nổi vào Khu phụ huynh — hiện ở góc trên-phải trên các màn bé đang chơi dở
 *  (serve/nghỉ/hoạt động/tổng kết) để ba mẹ LUÔN vào được, kể cả giữa ván. PIN-gated
 *  (Parent có cổng PIN). Thoát ra quay lại ĐÚNG màn (store.closeParent). */
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { sfx } from './sfx';

export function ParentAccessButton() {
  const openParent = useGame((s) => s.openParent);
  return (
    <motion.button
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 0.8, y: 0 }}
      whileHover={{ opacity: 1, scale: 1.05 }}
      whileTap={{ scale: 0.92 }}
      onClick={() => { sfx.tap(); openParent(); }}
      aria-label="Khu phụ huynh"
      style={{
        position: 'fixed',
        top: 'max(10px, env(safe-area-inset-top))',
        right: 'max(10px, env(safe-area-inset-right))',
        zIndex: 900,
        display: 'flex',
        alignItems: 'center',
        gap: 5,
        padding: '6px 12px 6px 10px',
        borderRadius: 999,
        background: 'var(--bg-panel)',
        color: 'var(--text-soft)',
        boxShadow: 'var(--shadow-soft)',
        fontSize: 13,
        fontWeight: 700,
        fontFamily: 'var(--font-display)',
      }}
    >
      <span style={{ fontSize: 15 }}>👪</span>
      Bố mẹ
    </motion.button>
  );
}
