/** S02 — tạo nhân vật + tên tiệm. Nhanh gọn (dốc khởi động, 4.3). */
import { useState } from 'react';
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { BigButton, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';

const APRONS = ['#EBA7A0', '#A9C6A0', '#9CC7D6', '#F3A46E', '#F2CE85'];

export function Welcome() {
  const startGame = useGame((s) => s.startGame);
  const [name, setName] = useState('Tiệm Bánh Anh Chi');
  const [apron, setApron] = useState(APRONS[0]);
  const [lop, setLop] = useState<3 | 4>(3);

  return (
    <div style={{ minHeight: '100%', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div
        initial={{ y: 20, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 200, damping: 22 }}
        style={{
          background: 'var(--bg-panel)',
          borderRadius: 'var(--radius-lg)',
          boxShadow: 'var(--shadow-lift)',
          padding: '28px 30px 32px',
          maxWidth: 460,
          width: '100%',
          textAlign: 'center',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 4 }}>
          <MapChar mood="greet" width={150} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 20 }}>
          <SpeechBubble tail="down">Chào cậu! Mình là Mập. Mở tiệm bánh chung nhé!</SpeechBubble>
        </div>

        <label style={{ display: 'block', textAlign: 'left', fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-display)' }}>
          Đặt tên tiệm
        </label>
        <input
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={24}
          style={{
            width: '100%',
            fontSize: 20,
            fontFamily: 'var(--font-body)',
            padding: '12px 16px',
            borderRadius: 14,
            border: '3px solid rgba(74,59,50,0.16)',
            background: 'var(--paper)',
            color: 'var(--text)',
            marginBottom: 20,
          }}
        />

        <div style={{ textAlign: 'left', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Chọn màu tạp dề</div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-start', marginBottom: 26 }}>
          {APRONS.map((c) => (
            <motion.button
              key={c}
              whileHover={{ scale: 1.12, y: -2 }}
              whileTap={{ scale: 0.92 }}
              onClick={() => {
                sfx.tap();
                setApron(c);
              }}
              aria-label={`Màu ${c}`}
              style={{
                width: 46,
                height: 46,
                borderRadius: '50%',
                background: c,
                boxShadow: apron === c ? '0 0 0 4px var(--ink)' : 'var(--shadow-soft)',
              }}
            />
          ))}
        </div>

        <div style={{ textAlign: 'left', fontWeight: 700, marginBottom: 8, fontFamily: 'var(--font-display)' }}>Bé học lớp mấy?</div>
        <div style={{ display: 'flex', gap: 12, marginBottom: 26 }}>
          {([3, 4] as const).map((g) => (
            <motion.button
              key={g}
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => { sfx.tap(); setLop(g); }}
              style={{
                flex: 1,
                padding: '12px 0',
                borderRadius: 16,
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 19,
                background: lop === g ? 'var(--sage)' : 'var(--paper)',
                color: 'var(--ink)',
                boxShadow: lop === g ? '0 0 0 3px var(--sage-dark)' : 'var(--shadow-soft)',
              }}
            >
              Lớp {g}
            </motion.button>
          ))}
        </div>

        <BigButton wide tone="peach" onClick={() => { sfx.bell(); startGame(name, { apron, hair: '#4A3B32' }, lop); }}>
          Mở tiệm thôi! 🎀
        </BigButton>
      </motion.div>
    </div>
  );
}
