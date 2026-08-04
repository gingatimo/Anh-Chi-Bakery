/**
 * Roadmap.tsx — "Lộ trình lớn lên của tiệm". Bé xem CẤP TIỆM hiện tại (theo tổng
 * khách đã phục vụ), thanh tiến độ tới cấp sau, và cả 6 cấp: cái nào đã mở (✓) /
 * còn khoá (🔒 cần bao nhiêu khách) + mở khoá PHÒNG và CÔNG THỨC bánh gì. Chỉ đọc.
 */
import { motion, useReducedMotion } from 'framer-motion';
import { useGame, ROOMS, SHOP_LEVELS, shopLevelFor, nextLevelFor } from '../game/store';
import { Cake, CAKE_LABEL } from '../assets/svg/Cake';
import { IconButton } from '../ui/kit';

const roomName = (id: number) => ROOMS.find((r) => r.id === id)?.name ?? `Phòng ${id}`;

export function Roadmap() {
  const goto = useGame((s) => s.goto);
  const khach = useGame((s) => s.counters.khach);
  const reduce = useReducedMotion();

  const level = shopLevelFor(khach);
  const cur = SHOP_LEVELS[level - 1];
  const { next, need } = nextLevelFor(khach);
  // % tiến độ trong khoảng [cấp hiện tại → cấp sau]
  const pct = next ? Math.min(100, Math.round(((khach - cur.minKhach) / (next.minKhach - cur.minKhach)) * 100)) : 100;

  return (
    <div style={{ minHeight: '100dvh', padding: '10px 16px 28px', maxWidth: 620, margin: '0 auto' }}>
      <header style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <IconButton label="Quay lại" onClick={() => goto('hub')}>←</IconButton>
        <h1 style={{ fontSize: 22, color: 'var(--text)' }}>🗺️ Lộ trình tiệm</h1>
      </header>

      {/* HERO — cấp hiện tại + tiến độ */}
      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 240, damping: 22 }}
        style={{ background: 'var(--butter)', color: 'var(--ink)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lift)', padding: '18px 20px', marginBottom: 16, textAlign: 'center' }}
      >
        <div style={{ fontSize: 15, fontWeight: 700, opacity: 0.8 }}>Cấp tiệm hiện tại</div>
        <div style={{ fontSize: 30, fontWeight: 800, fontFamily: 'var(--font-display)', margin: '2px 0 4px' }}>
          ⭐ Cấp {level} — {cur.name}
        </div>
        <div className="tnum" style={{ fontWeight: 700, marginBottom: 10 }}>Đã phục vụ {khach} khách</div>

        {next ? (
          <>
            <div style={{ height: 16, borderRadius: 999, background: 'rgba(74,59,50,0.15)', overflow: 'hidden' }}>
              <motion.div
                initial={{ width: reduce ? `${pct}%` : 0 }}
                animate={{ width: `${pct}%` }}
                transition={{ type: 'spring', stiffness: 120, damping: 22, delay: 0.15 }}
                style={{ height: '100%', background: 'var(--rose-dark)', borderRadius: 999 }}
              />
            </div>
            <div style={{ fontWeight: 700, marginTop: 8 }}>
              Còn <span className="tnum">{need}</span> khách nữa → Cấp {next.level}: {next.name}
            </div>
          </>
        ) : (
          <div style={{ fontWeight: 800, fontSize: 18 }}>🎉 Tiệm đã đạt cấp cao nhất — 5 sao!</div>
        )}
      </motion.div>

      {/* DANH SÁCH CÁC CẤP */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {SHOP_LEVELS.map((lv) => {
          const reached = level >= lv.level;
          const isCurrent = level === lv.level;
          return (
            <div
              key={lv.level}
              style={{
                display: 'flex',
                gap: 12,
                alignItems: 'flex-start',
                background: 'var(--bg-panel)',
                borderRadius: 'var(--radius-lg)',
                boxShadow: isCurrent ? 'var(--shadow-lift)' : 'var(--shadow-soft)',
                border: isCurrent ? '3px solid var(--rose-dark)' : '3px solid transparent',
                padding: '12px 14px',
                opacity: reached ? 1 : 0.72,
              }}
            >
              {/* số cấp */}
              <div
                style={{
                  flex: '0 0 auto',
                  width: 44,
                  height: 44,
                  borderRadius: 999,
                  display: 'grid',
                  placeItems: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 800,
                  fontSize: 20,
                  background: reached ? 'var(--sage)' : 'var(--bg-sunk)',
                  color: reached ? 'var(--ink)' : 'var(--text-soft)',
                }}
                className="tnum"
              >
                {reached ? '✓' : lv.level}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 800, fontFamily: 'var(--font-display)', fontSize: 17 }}>
                    Cấp {lv.level} · {lv.name}
                  </span>
                  <span
                    style={{
                      fontSize: 13,
                      fontWeight: 800,
                      borderRadius: 999,
                      padding: '2px 10px',
                      background: reached ? 'var(--sage)' : 'var(--peach)',
                      color: 'var(--ink)',
                    }}
                  >
                    {reached ? 'Đã mở' : `🔒 Cần ${lv.minKhach} khách`}
                  </span>
                </div>

                {/* mở khoá phòng */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-soft)', fontWeight: 700 }}>🪴</span>
                  {lv.rooms.map((id) => (
                    <span key={id} style={{ fontSize: 13, fontWeight: 700, background: 'var(--bg-sunk)', borderRadius: 999, padding: '3px 10px' }}>
                      {roomName(id)}
                    </span>
                  ))}
                </div>

                {/* mở khoá bánh */}
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 8, alignItems: 'center' }}>
                  <span style={{ fontSize: 14, color: 'var(--text-soft)', fontWeight: 700 }}>🧁</span>
                  {lv.cakes.map((k) => (
                    <span key={k} style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', width: 52 }}>
                      <Cake kind={k} width={40} />
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-soft)', textAlign: 'center', lineHeight: 1.1 }}>
                        {CAKE_LABEL[k]}
                      </span>
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <p style={{ textAlign: 'center', color: 'var(--text-soft)', fontWeight: 600, marginTop: 16, fontSize: 14 }}>
        Phục vụ thật nhiều khách để tiệm lớn lên nhé! 🌟
      </p>
    </div>
  );
}
