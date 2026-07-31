/**
 * Shop.tsx — Cửa hàng nội thất (S11). Lưới thẻ; mua bằng xu (mua nhiều lần được).
 * Mua thành công → tiếng xu + toast "Đã thêm vào kho!". Đồ mua vào KHO — đặt vào
 * phòng ở màn Trang trí. Không đủ xu → nút mờ + lắc nhẹ (không phạt).
 * Tôn trọng prefers-reduced-motion (bỏ lắc & trượt, giữ fade).
 */
import { useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useGame } from '../game/store';
import { FURNITURE, Furniture } from '../assets/svg/Furniture';
import { BigButton, Coin, IconButton, Panel, XuBadge } from '../ui/kit';
import { sfx } from '../ui/sfx';

export function Shop() {
  const goto = useGame((s) => s.goto);
  const xu = useGame((s) => s.xu);
  const buyFurniture = useGame((s) => s.buyFurniture);
  const reduce = !!useReducedMotion();

  const [toast, setToast] = useState<number | null>(null);
  const [denied, setDenied] = useState<string | null>(null);

  function onBuy(id: string) {
    if (buyFurniture(id)) {
      sfx.coin();
      const t = Date.now();
      setToast(t);
      window.setTimeout(() => setToast((cur) => (cur === t ? null : cur)), 1200);
    } else {
      // Nút đã mờ khi thiếu xu; nhánh này là phản hồi nhẹ nhàng phòng khi vẫn bấm được.
      sfx.soft();
      setDenied(id);
      window.setTimeout(() => setDenied((d) => (d === id ? null : d)), 480);
    }
  }

  return (
    <div style={{ padding: '20px 20px 40px', maxWidth: 1000, margin: '0 auto' }}>
      {/* toast "đã thêm vào kho" — nổi trên cùng, tự tắt */}
      <div
        style={{
          position: 'fixed',
          top: 18,
          left: 0,
          right: 0,
          display: 'flex',
          justifyContent: 'center',
          zIndex: 100,
          pointerEvents: 'none',
        }}
      >
        <AnimatePresence>
          {toast !== null && (
            <motion.div
              key={toast}
              initial={reduce ? { opacity: 0 } : { opacity: 0, y: -14 }}
              animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              style={{
                background: 'var(--sage)',
                color: 'var(--ink)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                fontSize: 16,
                padding: '10px 20px',
                borderRadius: 999,
                boxShadow: 'var(--shadow)',
              }}
            >
              ✓ Đã thêm vào kho!
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <header style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
        <IconButton label="Quay lại" onClick={() => goto('hub')}>
          ←
        </IconButton>
        <h1 style={{ fontSize: 28, color: 'var(--text)' }}>Cửa hàng</h1>
        <div style={{ marginLeft: 'auto' }}>
          <XuBadge xu={xu} />
        </div>
      </header>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 18,
        }}
      >
        {FURNITURE.map((f) => {
          const afford = xu >= f.price;
          return (
            <motion.div
              key={f.id}
              animate={denied === f.id && !reduce ? { x: [0, -7, 7, -5, 5, 0] } : { x: 0 }}
              transition={{ duration: 0.42 }}
            >
              <Panel style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
                <Furniture def={f} width={110} />
                <div style={{ fontWeight: 700, fontSize: 18, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                  {f.label}
                </div>
                <div
                  className="tnum"
                  style={{ display: 'flex', alignItems: 'center', gap: 6, fontWeight: 700, fontSize: 18, color: 'var(--text)' }}
                >
                  <Coin /> {f.price}
                </div>
                <BigButton tone="sage" disabled={!afford} onClick={() => onBuy(f.id)}>
                  Mua
                </BigButton>
              </Panel>
            </motion.div>
          );
        })}
      </div>

      <div style={{ marginTop: 28, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12 }}>
        <p
          style={{
            margin: 0,
            color: 'var(--text-soft)',
            fontSize: 15,
            textAlign: 'center',
            maxWidth: 520,
            lineHeight: 1.4,
          }}
        >
          Đồ đã mua nằm trong Kho — vào Trang trí để đặt vào phòng.
        </p>
        <BigButton tone="peach" onClick={() => goto('decorate')}>
          Trang trí tiệm →
        </BigButton>
      </div>
    </div>
  );
}
