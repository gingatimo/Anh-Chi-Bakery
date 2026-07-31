/** Giờ nghỉ trưa (thiết kế 4.1, 9.6). Hai beat:
 *  1) NGHỈ MẮT THẬT: làm tối màn hình + KHÔNG đồng hồ đếm ngược → không còn gì để
 *     "canh cho hết giờ". Hướng dẫn nhìn ra cửa sổ THẬT ở xa / nhắm mắt (nhìn
 *     màn hình không hề cho mắt nghỉ). Mập ngủ, nhịp thở dịu, ~24s, chuông gọi dậy.
 *  2) Beat nhẹ có nội dung: chọn món đặc biệt cho ngày mai (không phải chờ suông).
 */
import { useEffect, useMemo, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import { useGame } from '../game/store';
import { MapChar } from '../ui/MapChar';
import { BigButton, SpeechBubble } from '../ui/kit';
import { sfx } from '../ui/sfx';
import { Cake, CAKE_KINDS, CAKE_LABEL, type CakeKind } from '../assets/svg/Cake';
import { shuffle } from '../engine/money';

const EYE_REST_SEC = 24; // ~20-20-20; chỉnh 1 số này để đổi độ dài nghỉ mắt

// Cảnh nghỉ là dark CỐ ĐỊNH ở cả hai theme (đêm ấm) → chữ sáng hardcode.
const NIGHT_TEXT = '#F6EAD3';
const NIGHT_SOFT = 'rgba(246,234,211,0.7)';

function EyeRest({ ready, onDone }: { ready: boolean; onDone: () => void }) {
  const reduce = useReducedMotion();
  const [inhale, setInhale] = useState(true);
  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setInhale((v) => !v), 3600);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div
      style={{
        minHeight: '100dvh',
        display: 'grid',
        placeItems: 'center',
        padding: 24,
        textAlign: 'center',
        background: 'radial-gradient(120% 90% at 50% 30%, #4A3A5A 0%, #2E2622 70%)',
        color: NIGHT_TEXT,
      }}
    >
      <div style={{ maxWidth: 460 }}>
        {/* trăng + sao */}
        <svg width={120} height={70} viewBox="0 0 120 70" style={{ opacity: 0.9 }} aria-hidden>
          <circle cx={92} cy={30} r={20} fill="#F2CE85" />
          <circle cx={100} cy={24} r={17} fill="#4A3A5A" />
          <path d="M 20 20 l 3 6 l 6 3 l -6 3 l -3 6 l -3 -6 l -6 -3 l 6 -3 Z" fill={NIGHT_TEXT} opacity={0.8} />
          <path d="M 52 46 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 Z" fill={NIGHT_TEXT} opacity={0.6} />
        </svg>

        <div style={{ position: 'relative', display: 'inline-block', marginTop: 4 }}>
          {/* vòng thở dịu (không phải đồng hồ — không hiện thời gian còn lại) */}
          {!ready && !reduce && (
            <motion.div
              aria-hidden
              animate={{ scale: inhale ? 1.25 : 0.9, opacity: inhale ? 0.35 : 0.15 }}
              transition={{ duration: 3.6, ease: 'easeInOut' }}
              style={{ position: 'absolute', inset: -30, borderRadius: '50%', background: '#9CC7D6', filter: 'blur(6px)' }}
            />
          )}
          <div style={{ position: 'relative' }}>
            <MapChar mood={ready ? 'happy' : 'sleep'} width={150} />
          </div>
          {!ready && (
            <motion.div
              aria-hidden
              animate={reduce ? {} : { y: [-4, -14], opacity: [0, 1, 0] }}
              transition={{ duration: 2.4, repeat: Infinity }}
              style={{ position: 'absolute', top: 6, right: 8, fontSize: 22, color: NIGHT_SOFT }}
            >
              z
            </motion.div>
          )}
        </div>

        {!ready ? (
          <>
            <h2 style={{ fontSize: 26, margin: '10px 0 8px', color: NIGHT_TEXT }}>Nghỉ mắt một chút nào 🌙</h2>
            <p style={{ fontSize: 20, lineHeight: 1.5, color: NIGHT_TEXT }}>
              Nhắm mắt lại, hoặc <strong>nhìn ra cửa sổ thật ở thật xa</strong> nhé.
            </p>
            <p style={{ color: NIGHT_SOFT, marginTop: 8 }}>Đừng nhìn màn hình — để mắt được nghỉ. Mập sẽ gọi con khi xong.</p>
            {!reduce && (
              <motion.p
                key={inhale ? 'in' : 'out'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 0.8 }}
                style={{ marginTop: 18, fontSize: 18, color: NIGHT_SOFT, fontFamily: 'var(--font-display)' }}
              >
                {inhale ? 'Hít vào…' : 'Thở ra…'}
              </motion.p>
            )}
          </>
        ) : (
          <>
            <h2 style={{ fontSize: 26, margin: '10px 0 8px', color: NIGHT_TEXT }}>Mắt sáng lại rồi! 🌿</h2>
            <div style={{ marginTop: 16 }}>
              <BigButton tone="butter" onClick={onDone}>Bữa trưa nào →</BigButton>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function PickSpecial({ onContinue }: { onContinue: () => void }) {
  const specials = useMemo<CakeKind[]>(() => shuffle([...CAKE_KINDS]).slice(0, 3), []);
  const [chosen, setChosen] = useState<CakeKind | null>(null);

  return (
    <div style={{ minHeight: '100dvh', display: 'grid', placeItems: 'center', padding: 24 }}>
      <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} style={{ textAlign: 'center', maxWidth: 520 }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 6 }}>
          <MapChar mood={chosen ? 'eat' : 'happy'} width={120} />
        </div>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 18 }}>
          <SpeechBubble tail="down">
            {chosen ? `Mai mình làm ${CAKE_LABEL[chosen].toLowerCase()} nhé!` : 'Chọn món đặc biệt cho ngày mai nào!'}
          </SpeechBubble>
        </div>

        <div style={{ display: 'flex', gap: 14, justifyContent: 'center', flexWrap: 'wrap' }}>
          {specials.map((k) => (
            <motion.button
              key={k}
              whileHover={{ y: -4, scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                setChosen(k);
                sfx.pop();
              }}
              style={{
                background: 'var(--bg-panel)',
                borderRadius: 'var(--radius-lg)',
                padding: '14px 16px 10px',
                boxShadow: chosen === k ? '0 0 0 4px var(--sage), var(--shadow)' : 'var(--shadow-soft)',
                opacity: chosen && chosen !== k ? 0.5 : 1,
              }}
            >
              <Cake kind={k} width={92} />
              <div style={{ fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--text)', marginTop: 4 }}>
                {CAKE_LABEL[k]}
              </div>
            </motion.button>
          ))}
        </div>

        <div style={{ marginTop: 26, minHeight: 56 }}>
          {chosen && <BigButton tone="peach" onClick={onContinue}>Quay lại bán hàng →</BigButton>}
        </div>
      </motion.div>
    </div>
  );
}

export function Lunch() {
  const continueFromLunch = useGame((s) => s.continueFromLunch);
  const restSeconds = useGame((s) => s.settings.restSeconds ?? EYE_REST_SEC);
  const [sub, setSub] = useState<'rest' | 'special'>('rest');
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (sub !== 'rest') return;
    const t = setTimeout(() => {
      setReady(true);
      sfx.bell();
    }, restSeconds * 1000);
    return () => clearTimeout(t);
  }, [sub, restSeconds]);

  if (sub === 'rest') return <EyeRest ready={ready} onDone={() => setSub('special')} />;
  return <PickSpecial onContinue={continueFromLunch} />;
}
