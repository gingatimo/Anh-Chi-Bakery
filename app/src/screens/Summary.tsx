/** S08 — tổng kết ngày. Đóng cửa diegetic, KHÔNG "Hết giờ chơi" (thiết kế 9.7). */
import { motion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { Furniture, furnitureById } from '../assets/svg/Furniture';
import { BigButton, Coin } from '../ui/kit';
import { sfx } from '../ui/sfx';

export function Summary() {
  const dayResult = useGame((s) => s.dayResult);
  const pending = useGame((s) => s.pendingSticker);
  const gift = useGame((s) => s.giftFurniture);
  const promoted = useGame((s) => s.promoted);
  const lop = useGame((s) => s.lop);
  const goto = useGame((s) => s.goto);
  const addToInventory = useGame((s) => s.addToInventory);
  const giftDef = gift ? furnitureById(gift) : null;

  function next() {
    if (gift) addToInventory(gift); // quà vào KHO, bé tự đặt ở Trang trí
    if (pending) {
      sfx.sparkle();
      goto('reveal');
    } else {
      goto('hub');
    }
  }

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: 'spring', stiffness: 220, damping: 20 }}
        style={{ background: 'var(--bg-panel)', borderRadius: 'var(--radius-lg)', boxShadow: 'var(--shadow-lift)', padding: '30px 34px', maxWidth: 440, width: '100%', textAlign: 'center' }}
      >
        <MapChar mood="happy" width={150} />
        <h2 style={{ fontSize: 26, margin: '6px 0 4px' }}>Tiệm đóng cửa rồi!</h2>
        <p style={{ color: 'var(--text-soft)', marginBottom: promoted ? 12 : 20 }}>Mai mình lại mở tiệm nhé.</p>

        {promoted && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            style={{ background: 'var(--butter)', color: 'var(--ink)', borderRadius: 14, padding: '10px 14px', marginBottom: 18, fontWeight: 700 }}
          >
            🎉 Bé giỏi quá — lên Lớp {lop} rồi! Bài toán mới đang chờ.
          </motion.div>
        )}

        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', marginBottom: gift ? 20 : 26 }}>
          <div style={{ background: 'var(--bg-sunk)', borderRadius: 16, padding: '14px 22px', minWidth: 120 }}>
            <div style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)' }} className="tnum">{dayResult.served}</div>
            <div style={{ color: 'var(--text-soft)', fontWeight: 600 }}>khách ghé</div>
          </div>
          <div style={{ background: 'var(--bg-sunk)', borderRadius: 16, padding: '14px 22px', minWidth: 120 }}>
            <div className="tnum" style={{ fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6 }}>
              <Coin size={24} /> {dayResult.xu}
            </div>
            <div style={{ color: 'var(--text-soft)', fontWeight: 600 }}>xu kiếm được</div>
          </div>
        </div>

        {dayResult.firstTry > 0 && (
          <p style={{ marginBottom: gift ? 18 : 24, fontWeight: 600, color: 'var(--sage-dark)' }}>
            ⭐ Đúng ngay lần đầu {dayResult.firstTry} lần!
          </p>
        )}

        {giftDef && (
          <motion.div
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3 }}
            style={{ background: 'var(--bg-sunk)', borderRadius: 16, padding: 14, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center' }}
          >
            <Furniture def={giftDef} width={80} />
            <div style={{ textAlign: 'left' }}>
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)' }}>Mập tặng bạn!</div>
              <div style={{ color: 'var(--text-soft)' }}>{giftDef.label} — vào Kho, đặt ở Trang trí nhé</div>
            </div>
          </motion.div>
        )}

        <BigButton wide tone="peach" onClick={next}>
          {pending ? 'Mở phong bì sticker 🎁' : 'Về tiệm →'}
        </BigButton>
      </motion.div>
    </div>
  );
}
