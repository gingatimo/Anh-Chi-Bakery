/**
 * sfx.ts — âm thanh phản hồi tổng hợp bằng Web Audio (thiết kế 10.8).
 * "Âm thanh và hiệu ứng hình là lớp phản hồi chính." KHÔNG tiếng "sai" chói tai.
 * Không cần file asset — chi phí ~0, tôn trọng toggle âm thanh.
 */
let ctx: AudioContext | null = null;
let enabled = true;

export function setSound(on: boolean) {
  enabled = on;
}

function ac(): AudioContext | null {
  if (!enabled) return null;
  if (!ctx) {
    try {
      ctx = new AudioContext();
    } catch {
      return null;
    }
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

function tone(freq: number, dur: number, type: OscillatorType, gain = 0.14, delay = 0, sweep?: number) {
  const c = ac();
  if (!c) return;
  const t0 = c.currentTime + delay;
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, t0);
  if (sweep) osc.frequency.exponentialRampToValueAtTime(sweep, t0 + dur);
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.012);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

export const sfx = {
  tap: () => tone(520, 0.07, 'sine', 0.09),
  pop: () => tone(660, 0.1, 'triangle', 0.12, 0, 880),
  coin: () => {
    tone(880, 0.08, 'square', 0.08);
    tone(1320, 0.12, 'square', 0.06, 0.05);
  },
  paper: () => tone(2200, 0.06, 'sawtooth', 0.03, 0, 1200),
  bell: () => {
    tone(784, 0.5, 'sine', 0.1);
    tone(1176, 0.5, 'sine', 0.05, 0.02);
  },
  correct: () => {
    tone(523, 0.12, 'sine', 0.12);
    tone(659, 0.12, 'sine', 0.12, 0.1);
    tone(784, 0.2, 'sine', 0.12, 0.2);
  },
  // "chưa đúng" — nhẹ nhàng, ấm, KHÔNG chói (không phạt)
  soft: () => tone(392, 0.16, 'sine', 0.08, 0, 330),
  sparkle: () => {
    tone(1046, 0.1, 'triangle', 0.06);
    tone(1568, 0.14, 'triangle', 0.05, 0.06);
    tone(2093, 0.18, 'triangle', 0.04, 0.12);
  },
};
