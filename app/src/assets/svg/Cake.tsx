/**
 * Cake.tsx — generator bánh (thiết kế 10.7: ~12 loại).
 * Một template, nhiều `kind` → biến thể nhất quán trong thế giới 12 màu.
 * Dùng ở kệ bánh (S04), làm bánh (S05), khay (S05).
 */
import { Cut, Steam } from './paper';

export const CAKE_KINDS = [
  'cupcake',
  'croissant',
  'macaron',
  'donut',
  'cookie',
  'roll',
  'tart',
  'loaf',
] as const;
export type CakeKind = (typeof CAKE_KINDS)[number];

export const CAKE_LABEL: Record<CakeKind, string> = {
  cupcake: 'Bánh kem',
  croissant: 'Sừng bò',
  macaron: 'Macaron',
  donut: 'Bánh vòng',
  cookie: 'Bánh quy',
  roll: 'Bánh cuộn',
  tart: 'Tart trái cây',
  loaf: 'Ổ bánh mì',
};

const INK = '#4A3B32';

function Shape({ kind }: { kind: CakeKind }) {
  switch (kind) {
    case 'cupcake':
      return (
        <g>
          <path d="M 40 78 h 60 l -8 46 q -1 8 -9 8 h -26 q -8 0 -9 -8 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 44 84 h 52 M 47 98 h 46 M 50 112 h 40" stroke="#C98F55" strokeWidth={3} strokeLinecap="round" opacity={0.6} />
          <path d="M 38 80 q -4 -34 32 -34 q 36 0 32 34 q -14 -16 -32 -8 q -18 -8 -32 8 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={70} cy={40} r={6} fill="#D67B78" stroke={INK} strokeWidth={3} />
        </g>
      );
    case 'croissant':
      return (
        <path d="M 30 96 q 6 -40 40 -44 q -14 16 -6 28 q 22 -6 30 10 q -18 2 -14 18 q -34 6 -50 -12 q -4 -12 0 -28 Z" fill="#E7B981" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
      );
    case 'macaron':
      return (
        <g>
          <path d="M 34 66 q 36 -22 72 0 q 2 8 -6 12 h -60 q -8 -4 -6 -12 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <rect x={30} y={76} width={80} height={12} rx={6} fill="#FFFDF6" stroke={INK} strokeWidth={3} />
          <path d="M 34 100 q 36 22 72 0 q 2 -8 -6 -12 h -60 q -8 4 -6 12 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
        </g>
      );
    case 'donut':
      return (
        <g>
          <circle cx={70} cy={82} r={40} fill="#E7B981" stroke={INK} strokeWidth={4} />
          <path d="M 34 74 q 36 -22 72 0 q -6 22 -36 22 q -30 0 -36 -22 Z" fill="#9CC7D6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={70} cy={82} r={13} fill="#FBF1DE" stroke={INK} strokeWidth={4} />
          <path d="M 52 66 l 4 8 M 74 60 l 3 9 M 90 72 l 5 6" stroke="#D67B78" strokeWidth={3} strokeLinecap="round" />
        </g>
      );
    case 'cookie':
      return (
        <g>
          <circle cx={70} cy={82} r={40} fill="#E7B981" stroke={INK} strokeWidth={4} />
          <circle cx={56} cy={70} r={6} fill="#4A3B32" />
          <circle cx={84} cy={74} r={6} fill="#4A3B32" />
          <circle cx={66} cy={96} r={6} fill="#4A3B32" />
          <circle cx={90} cy={98} r={5} fill="#4A3B32" />
        </g>
      );
    case 'roll':
      return (
        <g>
          {/* thân bánh cuộn */}
          <rect x={34} y={58} width={72} height={48} rx={24} fill="#E7B981" stroke={INK} strokeWidth={4} />
          {/* mặt cắt tròn có xoáy cuộn */}
          <circle cx={44} cy={82} r={24} fill="#F3E3C6" stroke={INK} strokeWidth={4} />
          <path
            d="M 44 82 m 0 -16 a 16 16 0 1 1 -0.1 0 M 44 82 m 0 -9 a 9 9 0 1 1 -0.1 0"
            fill="none"
            stroke="#EBA7A0"
            strokeWidth={5}
            strokeLinecap="round"
          />
          <circle cx={44} cy={82} r={3.5} fill="#D67B78" />
        </g>
      );
    case 'tart':
      return (
        <g>
          <path d="M 30 92 q 40 -14 80 0 l -6 14 q -34 10 -68 0 Z" fill="#E7B981" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 30 92 q 40 -30 80 0 q -40 16 -80 0 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <circle cx={54} cy={82} r={7} fill="#D67B78" stroke={INK} strokeWidth={2} />
          <circle cx={74} cy={78} r={7} fill="#9CC7D6" stroke={INK} strokeWidth={2} />
          <circle cx={92} cy={83} r={7} fill="#7BA07E" stroke={INK} strokeWidth={2} />
        </g>
      );
    case 'loaf':
      return (
        <g>
          <path d="M 30 100 q 4 -46 40 -46 q 36 0 40 46 q -40 12 -80 0 Z" fill="#E7B981" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
          <path d="M 52 66 q 8 8 0 20 M 70 60 q 8 10 0 22 M 88 66 q 8 8 0 20" stroke="#C98F55" strokeWidth={3} strokeLinecap="round" fill="none" />
        </g>
      );
  }
}

export function Cake({
  kind,
  width = 120,
  steam = false,
}: {
  kind: CakeKind;
  width?: number;
  steam?: boolean;
}) {
  return (
    <svg viewBox="0 0 140 140" width={width} height={width} role="img" aria-label={CAKE_LABEL[kind]}>
      {steam && (
        <g opacity={0.8}>
          <Steam x={58} y={54} />
          <Steam x={82} y={54} />
        </g>
      )}
      <Cut>
        <Shape kind={kind} />
      </Cut>
    </svg>
  );
}
