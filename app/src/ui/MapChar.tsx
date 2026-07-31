/**
 * MapChar.tsx — Mập sống động: nhún nhẹ (idle), phản ứng theo mood.
 * Tôn trọng prefers-reduced-motion (giữ fade, bỏ nhún — 10.9).
 */
import { motion, useReducedMotion } from 'framer-motion';
import { Map, type Mood } from '../assets/svg/Map';

export function MapChar({ mood = 'idle', width = 200 }: { mood?: Mood; width?: number }) {
  const reduce = useReducedMotion();
  const bob = mood === 'happy' || mood === 'greet';
  return (
    <motion.div
      animate={
        reduce
          ? {}
          : bob
          ? { y: [0, -10, 0], rotate: [0, -2, 2, 0] }
          : { y: [0, -5, 0] }
      }
      transition={{ duration: bob ? 0.9 : 2.6, repeat: Infinity, ease: 'easeInOut' }}
      style={{ width, display: 'inline-block' }}
    >
      <Map mood={mood} width={width} />
    </motion.div>
  );
}
