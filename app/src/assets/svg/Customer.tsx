/**
 * Customer.tsx — khách hàng đa dạng (thiết kế 10.3, 10.7).
 * Người lớn tuổi, trẻ em, nam nữ. Dựng bộ phận + hoán đổi biểu cảm.
 * QUAN TRỌNG: khi bé sai, biểu cảm là BỐI RỐI/KIÊN NHẪN — không bao giờ
 * thất vọng hay giận (thiết kế 4.2).
 */
import { Cut } from './paper';

export type CustomerMood = 'neutral' | 'happy' | 'patient';
export const CUSTOMER_VARIANTS = [0, 1, 2, 3, 4, 5] as const;
export type CustomerVariant = (typeof CUSTOMER_VARIANTS)[number];

const INK = '#4A3B32';

// mỗi khách: màu da (trong tông ấm), tóc/mũ, áo
const LOOK: Record<
  CustomerVariant,
  { skin: string; hair: string; cloth: string; kind: 'hair' | 'bun' | 'cap' | 'bald' | 'kid' | 'scarf' }
> = {
  0: { skin: '#F3C9A0', hair: '#4A3B32', cloth: '#A9C6A0', kind: 'hair' },
  1: { skin: '#EAB98A', hair: '#7BA07E', cloth: '#EBA7A0', kind: 'bun' },
  2: { skin: '#F0C6A2', hair: '#C98F55', cloth: '#9CC7D6', kind: 'cap' },
  3: { skin: '#E6B283', hair: '#B9B0A6', cloth: '#F3A46E', kind: 'bald' },
  4: { skin: '#F4CBA6', hair: '#4A3B32', cloth: '#F2CE85', kind: 'kid' },
  5: { skin: '#EBBB8C', hair: '#D67B78', cloth: '#7BA07E', kind: 'scarf' },
};

function Hair({ variant }: { variant: CustomerVariant }) {
  const l = LOOK[variant];
  switch (l.kind) {
    case 'hair':
      return <path d="M 46 60 q 0 -40 44 -40 q 44 0 44 40 q -10 -14 -44 -14 q -34 0 -44 14 Z" fill={l.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />;
    case 'bun':
      return (
        <g>
          <circle cx={90} cy={20} r={12} fill={l.hair} stroke={INK} strokeWidth={4} />
          <path d="M 48 62 q 0 -38 42 -38 q 42 0 42 38 q -12 -12 -42 -12 q -30 0 -42 12 Z" fill={l.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    case 'cap':
      return (
        <g>
          <path d="M 46 54 q 4 -34 44 -34 q 40 0 44 34 Z" fill={l.cloth} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 30 56 h 40 q -6 8 -24 8 q -12 0 -16 -8 Z" fill={l.cloth} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    case 'bald':
      return <path d="M 52 50 q 6 -20 38 -20 q 32 0 38 20 q -14 -8 -38 -8 q -24 0 -38 8 Z" fill={l.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity={0.9} />;
    case 'kid':
      return (
        <g>
          <path d="M 48 58 q 0 -38 42 -38 q 42 0 42 38 q -10 -12 -18 -8 q -6 -10 -24 -6 q -18 -2 -24 8 q -12 -2 -18 6 Z" fill={l.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    case 'scarf':
      return (
        <g>
          <path d="M 44 62 q 0 -42 46 -42 q 46 0 46 42 q -14 -14 -46 -14 q -32 0 -46 14 Z" fill={l.hair} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 42 60 q 48 20 96 0 l 0 14 q -48 18 -96 0 Z" fill={l.cloth} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
  }
}

function Face({ mood }: { mood: CustomerMood }) {
  return (
    <g>
      {/* mắt */}
      {mood === 'happy' ? (
        <g stroke={INK} strokeWidth={4} strokeLinecap="round" fill="none">
          <path d="M 68 74 q 8 -9 16 0" />
          <path d="M 96 74 q 8 -9 16 0" />
        </g>
      ) : (
        <g fill={INK}>
          <circle cx={76} cy={76} r={5} />
          <circle cx={104} cy={76} r={5} />
          {mood === 'patient' && (
            <path d="M 68 66 q 8 -4 16 0 M 96 66 q 8 -4 16 0" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
          )}
        </g>
      )}
      {/* má */}
      <circle cx={64} cy={90} r={7} fill="#EB9C94" opacity={0.5} />
      <circle cx={116} cy={90} r={7} fill="#EB9C94" opacity={0.5} />
      {/* miệng */}
      {mood === 'happy' && <path d="M 78 94 q 12 12 24 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      {mood === 'neutral' && <path d="M 82 96 h 16" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
      {/* patient: cười nhẹ, KHÔNG cau — chỉ kiên nhẫn/thông cảm (thiết kế 4.2) */}
      {mood === 'patient' && <path d="M 82 96 q 8 6 16 0" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" />}
    </g>
  );
}

export function Customer({
  variant,
  mood = 'neutral',
  width = 150,
}: {
  variant: CustomerVariant;
  mood?: CustomerMood;
  width?: number;
}) {
  const l = LOOK[variant];
  return (
    <svg viewBox="0 0 180 180" width={width} height={width} role="img" aria-label="Khách hàng">
      <Cut>
        {/* thân/vai */}
        <path d="M 36 180 q 8 -52 54 -52 q 46 0 54 52 Z" fill={l.cloth} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
        {/* cổ */}
        <rect x={78} y={104} width={24} height={26} rx={8} fill={l.skin} stroke={INK} strokeWidth={4} />
        {/* đầu */}
        <ellipse cx={90} cy={78} rx={44} ry={46} fill={l.skin} stroke={INK} strokeWidth={5} />
        <Hair variant={variant} />
        <Face mood={mood} />
      </Cut>
    </svg>
  );
}
