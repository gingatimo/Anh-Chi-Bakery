/** Activity — hoạt động thư giãn XEN GIỮA các khách (không toán, không điểm, không
 *  áp lực). Ba loại xoay vòng: vươn vai/vận động, trang trí bánh nhanh, vỗ về Mập.
 *  Xong → continueFromActivity() về phục vụ. Resume được (phase='activity'). */
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { BigButton, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { Cake } from '../assets/svg/Cake';

const WRAP: CSSProperties = { minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24, textAlign: 'center' };

// ── Vươn vai / vận động (nghỉ VẬN ĐỘNG rời màn hình, ~12s) ──
const STRETCH_STEPS = [
  { t: 'Đứng dậy, vươn hai tay lên thật cao nào! 🙆', e: '🙆' },
  { t: 'Xoay vai tròn tròn ra sau 🔄', e: '💪' },
  { t: 'Nghiêng người sang trái… rồi sang phải 🤸', e: '🤸' },
  { t: 'Nhìn ra xa và hít thở thật sâu 🌿', e: '🌬️' },
  { t: 'Uống một ngụm nước cho khỏe nhé 💧', e: '💧' },
];
const STRETCH_SEC = 12;

function Stretch({ onDone }: { onDone: () => void }) {
  const reduce = useReducedMotion();
  const [i, setI] = useState(0);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const iv = setInterval(() => setI((v) => (v + 1) % STRETCH_STEPS.length), 2800);
    const t = setTimeout(() => { setReady(true); sfx.bell(); }, STRETCH_SEC * 1000);
    return () => { clearInterval(iv); clearTimeout(t); };
  }, []);
  const step = STRETCH_STEPS[i];
  return (
    <div style={{ ...WRAP, background: 'radial-gradient(120% 90% at 50% 25%, #FDEBD2 0%, #F7E3C6 70%)' }}>
      <div style={{ maxWidth: 460 }}>
        <SpeechBubble tail="down">{ready ? 'Khỏe khoắn chưa nào! Chơi tiếp thôi 🎉' : step.t}</SpeechBubble>
        <motion.div key={i} animate={reduce ? {} : { y: [0, -12, 0] }} transition={{ repeat: Infinity, duration: 1.4 }} style={{ fontSize: 70, margin: '10px 0' }}>
          {ready ? '🌟' : step.e}
        </motion.div>
        <MapChar mood={ready ? 'greet' : 'happy'} width={150} />
        <div style={{ marginTop: 18, minHeight: 56 }}>
          {ready ? (
            <BigButton tone="peach" onClick={onDone}>Chơi tiếp →</BigButton>
          ) : (
            <p style={{ color: 'var(--text-soft)', fontWeight: 600 }}>Cùng vận động một chút cho đỡ mỏi nhé…</p>
          )}
        </div>
      </div>
    </div>
  );
}

// ── Trang trí bánh nhanh (sáng tạo tự do, không đúng/sai) ──
const TOPPINGS = ['🍓', '🫐', '🍫', '🌟', '🍬', '🌈', '🍒', '🥜'];

function Decorate({ onDone }: { onDone: () => void }) {
  const [items, setItems] = useState<{ id: number; e: string; x: number; y: number }[]>([]);
  const idRef = useRef(0);
  const add = (e: string) => {
    if (items.length >= 14) return;
    sfx.pop();
    setItems((v) => [...v, { id: idRef.current++, e, x: 24 + Math.random() * 48, y: 16 + Math.random() * 30 }]);
  };
  return (
    <div style={{ ...WRAP, background: 'radial-gradient(120% 90% at 50% 25%, #FBEFE0 0%, #F5E6D2 70%)' }}>
      <div style={{ maxWidth: 460, width: '100%' }}>
        <SpeechBubble tail="down">Trang trí một chiếc bánh thật xinh nào! 🧁</SpeechBubble>
        <div style={{ position: 'relative', width: 220, height: 220, margin: '14px auto 6px' }}>
          <Cake kind="cupcake" width={220} />
          {items.map((it) => (
            <motion.span key={it.id} initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: 'spring', stiffness: 500, damping: 16 }}
              style={{ position: 'absolute', left: `${it.x}%`, top: `${it.y}%`, fontSize: 28, pointerEvents: 'none' }}>
              {it.e}
            </motion.span>
          ))}
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginBottom: 10 }}>
          {TOPPINGS.map((e) => (
            <motion.button key={e} whileTap={{ scale: 0.85 }} onClick={() => add(e)}
              style={{ width: 52, height: 52, borderRadius: 14, fontSize: 26, background: 'var(--bg-panel)', boxShadow: 'var(--shadow-soft)' }}>
              {e}
            </motion.button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 12, justifyContent: 'center', alignItems: 'center' }}>
          {items.length > 0 && (
            <button onClick={() => { sfx.tap(); setItems([]); }} style={{ color: 'var(--text-soft)', fontWeight: 600, textDecoration: 'underline' }}>Xoá hết</button>
          )}
          <BigButton tone="sage" onClick={onDone}>Xong! 🎉</BigButton>
        </div>
      </div>
    </div>
  );
}

// ── Vỗ về Mập (thư giãn cảm xúc) ──
const PRAISE = ['Con giỏi lắm! 💛', 'Nghỉ tí cho khỏe nha!', 'Mập thương con nè 🥰', 'Con làm tốt lắm đó!', 'Cùng cố lên nào! ✨'];

function PetMap({ onDone }: { onDone: () => void }) {
  const [hearts, setHearts] = useState<{ id: number; x: number }[]>([]);
  const [praise, setPraise] = useState(PRAISE[0]);
  const [ready, setReady] = useState(false);
  const idRef = useRef(0);
  useEffect(() => { const t = setTimeout(() => setReady(true), 4000); return () => clearTimeout(t); }, []);
  const pet = () => {
    sfx.pop();
    setPraise(PRAISE[Math.floor(Math.random() * PRAISE.length)]);
    setHearts((v) => [...v.slice(-6), { id: idRef.current++, x: 38 + Math.random() * 24 }]);
  };
  return (
    <div style={{ ...WRAP, background: 'radial-gradient(120% 90% at 50% 25%, #FCEAF0 0%, #F6DEE8 70%)' }}>
      <div style={{ maxWidth: 440 }}>
        <SpeechBubble tail="down">{praise}</SpeechBubble>
        <div style={{ position: 'relative', display: 'inline-block', marginTop: 12 }}>
          <AnimatePresence>
            {hearts.map((h) => (
              <motion.span key={h.id} initial={{ opacity: 0, y: 0, scale: 0.6 }} animate={{ opacity: 1, y: -90, scale: 1.2 }} exit={{ opacity: 0 }} transition={{ duration: 1.2 }}
                onAnimationComplete={() => setHearts((v) => v.filter((x) => x.id !== h.id))}
                style={{ position: 'absolute', left: `${h.x}%`, top: 10, fontSize: 30, pointerEvents: 'none' }}>
                💖
              </motion.span>
            ))}
          </AnimatePresence>
          <motion.button whileTap={{ scale: 0.92 }} onClick={pet} aria-label="Vỗ về Mập" style={{ background: 'transparent' }}>
            <MapChar mood="eat" width={170} />
          </motion.button>
        </div>
        <p style={{ color: 'var(--text-soft)', fontWeight: 600, marginTop: 6 }}>Chạm để vỗ về Mập nhé 🥰</p>
        <div style={{ marginTop: 14, minHeight: 56 }}>
          {ready && <BigButton tone="peach" onClick={onDone}>Chơi tiếp →</BigButton>}
        </div>
      </div>
    </div>
  );
}

export function Activity() {
  const kind = useGame((s) => s.activityKind);
  const done = useGame((s) => s.continueFromActivity);
  if (kind === 'decorate') return <Decorate onDone={done} />;
  if (kind === 'petmap') return <PetMap onDone={done} />;
  return <Stretch onDone={done} />; // 'stretch' hoặc mặc định
}
