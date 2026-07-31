/** Băng-rôn thông báo tạm (store.notice) — hiện trên mọi màn, tự tắt sau ~4.5s hoặc
 *  chạm để tắt. Dùng cho thông báo realtime "Ba mẹ đã duyệt nhiệm vụ · +xu". */
import { useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useGame } from '../game/store';
import { sfx } from './sfx';

export function Toast() {
  const notice = useGame((s) => s.notice);
  const setNotice = useGame((s) => s.setNotice);

  useEffect(() => {
    if (!notice) return;
    sfx.coin();
    const t = setTimeout(() => setNotice(null), 4500);
    return () => clearTimeout(t);
  }, [notice, setNotice]);

  return (
    <AnimatePresence>
      {notice && (
        <motion.button
          key={notice}
          initial={{ y: -70, opacity: 0, x: '-50%' }}
          animate={{ y: 0, opacity: 1, x: '-50%' }}
          exit={{ y: -70, opacity: 0, x: '-50%' }}
          transition={{ type: 'spring', stiffness: 380, damping: 26 }}
          onClick={() => setNotice(null)}
          style={{
            position: 'fixed',
            top: 'max(14px, env(safe-area-inset-top))',
            left: '50%',
            zIndex: 1000,
            background: 'var(--sage)',
            color: 'var(--ink)',
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            fontSize: 16,
            padding: '12px 20px',
            borderRadius: 999,
            boxShadow: 'var(--shadow-lift)',
            maxWidth: '92vw',
            textAlign: 'center',
          }}
        >
          {notice}
        </motion.button>
      )}
    </AnimatePresence>
  );
}
