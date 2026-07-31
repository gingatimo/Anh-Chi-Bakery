/**
 * Map.tsx — Mập, cá mập con phụ bếp (thiết kế 10.3).
 * Bạn phụ bếp hài hước, hậu đậu, luôn ủng hộ — KHÔNG phải thầy giáo.
 * Xanh xám (tránh vàng-cam "Baby Shark" — rủi ro 13), mõm tròn, mắt to,
 * răng không lộ nhọn, đeo tạp dề.
 *
 * Dựng theo BỘ PHẬN + hoán đổi mắt/miệng theo biểu cảm (không vẽ lại).
 * Hoạt hình (nhún, chớp mắt) do wrapper MapCharacter lo bằng Framer Motion.
 */
import { Cut } from './paper';

export type Mood = 'idle' | 'happy' | 'greet' | 'confused' | 'hint' | 'eat' | 'sleep';

const BLUE = '#9CC7D6';
const BLUE_D = '#6FA6B6';
const BELLY = '#FFFDF6';
const INK = '#4A3B32';
const APRON = '#EBA7A0';
const APRON_D = '#D67B78';
const CHEEK = '#EB9C94';

function Eyes({ mood }: { mood: Mood }) {
  if (mood === 'sleep') {
    // mắt nhắm thư giãn (cung cong xuống)
    return (
      <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M 86 104 q 12 8 24 0" />
        <path d="M 130 104 q 12 8 24 0" />
      </g>
    );
  }
  if (mood === 'eat') {
    // mắt nhắm sung sướng (^ ^)
    return (
      <g stroke={INK} strokeWidth={5} strokeLinecap="round" fill="none">
        <path d="M 88 108 q 10 -12 20 0" />
        <path d="M 132 108 q 10 -12 20 0" />
      </g>
    );
  }
  const lookUp = mood === 'hint';
  const py = lookUp ? 100 : 106;
  const px = lookUp ? 2 : 0;
  return (
    <g>
      <ellipse cx={98} cy={104} rx={15} ry={17} fill={BELLY} stroke={INK} strokeWidth={4} />
      <ellipse cx={142} cy={104} rx={15} ry={17} fill={BELLY} stroke={INK} strokeWidth={4} />
      <circle cx={98 + px} cy={py} r={7} fill={INK} />
      <circle cx={142 + px} cy={py} r={7} fill={INK} />
      <circle cx={101 + px} cy={py - 3} r={2.5} fill={BELLY} />
      <circle cx={145 + px} cy={py - 3} r={2.5} fill={BELLY} />
      {mood === 'confused' && (
        // một chân mày nhướn — bối rối, không buồn
        <path d="M 128 82 q 14 -6 26 2" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
      )}
    </g>
  );
}

function Mouth({ mood }: { mood: Mood }) {
  switch (mood) {
    case 'happy':
    case 'greet':
      return (
        <g>
          <path d="M 104 132 q 16 20 32 0 q -16 8 -32 0 Z" fill={APRON_D} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 108 133 q 12 4 24 0" fill={BELLY} opacity={0.5} />
        </g>
      );
    case 'confused':
      return <path d="M 110 136 q 10 -8 20 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    case 'hint':
      return <path d="M 112 136 h 16" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    case 'eat':
      return (
        <g>
          <path d="M 106 130 q 14 16 28 0 q -14 6 -28 0 Z" fill={APRON_D} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          {/* vụn bánh đang nếm trộm */}
          <circle cx={140} cy={128} r={4} fill="#E7B981" stroke={INK} strokeWidth={2} />
        </g>
      );
    case 'sleep':
      return <path d="M 114 132 q 6 6 12 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
    default: // idle
      return <path d="M 110 133 q 10 10 20 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />;
  }
}

export function Map({
  mood = 'idle',
  width = 220,
}: {
  mood?: Mood;
  width?: number;
}) {
  const S = 240;
  const raiseFin = mood === 'greet';
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={width} height={width} role="img" aria-label="Mập, bạn phụ bếp cá mập">
      <Cut>
        {/* đuôi sau lưng */}
        <path d="M 44 150 q -30 -10 -30 20 q 22 -4 34 6 Z" fill={BLUE_D} />
        {/* vây lưng */}
        <path d="M 120 34 q 16 -18 30 -6 q -8 12 -6 30 Z" fill={BLUE_D} />
        {/* thân */}
        <path
          d="M 120 44
             C 176 44 196 92 196 132
             C 196 186 160 210 120 210
             C 80 210 44 186 44 132
             C 44 92 64 44 120 44 Z"
          fill={BLUE}
          stroke={INK}
          strokeWidth={5}
        />
        {/* bụng sáng */}
        <path
          d="M 120 120 C 158 120 168 150 168 172 C 168 196 146 208 120 208 C 94 208 72 196 72 172 C 72 150 82 120 120 120 Z"
          fill={BELLY}
        />
        {/* má hồng */}
        <circle cx={80} cy={126} r={11} fill={CHEEK} opacity={0.55} />
        <circle cx={160} cy={126} r={11} fill={CHEEK} opacity={0.55} />

        {/* tạp dề */}
        <path d="M 96 150 h 48 v 44 q 0 10 -10 10 h -28 q -10 0 -10 -10 Z" fill={APRON} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <rect x={96} y={150} width={48} height={9} fill={APRON_D} />
        <path d="M 108 150 l 12 -12 l 12 12" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" />
        <rect x={110} y={170} width={20} height={16} rx={4} fill={BELLY} opacity={0.85} stroke={APRON_D} strokeWidth={2} />

        {/* vây trước — phải có thể giơ lên khi chào */}
        <path d="M 60 156 q -22 6 -20 30 q 16 -2 28 -12 Z" fill={BLUE_D} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        <g style={{ transformOrigin: '182px 158px', transform: raiseFin ? 'rotate(-42deg)' : 'none' }}>
          <path d="M 180 156 q 22 6 20 30 q -16 -2 -28 -12 Z" fill={BLUE_D} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>

        <Eyes mood={mood} />
        <Mouth mood={mood} />
      </Cut>

      {mood === 'greet' && (
        // bong bóng "chào!" nhỏ
        <g>
          <circle cx={206} cy={96} r={16} fill="#F2CE85" stroke={INK} strokeWidth={4} />
          <path d="M 200 108 l -2 12 l 12 -8 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      )}
    </svg>
  );
}
