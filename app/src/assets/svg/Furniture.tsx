/**
 * Furniture.tsx — vật phẩm trang trí (thiết kế 6: ~15 món, 30–200 xu).
 * Dùng ở cửa hàng nội thất (S11) và chế độ trang trí (S12).
 * Bé tự quyết định thẩm mỹ — app không tự sắp xếp (nguyên tắc 5).
 */
import type { ReactElement } from 'react';
import { Cut } from './paper';
import { GEN_FURNITURE } from './furnitureGen';

const INK = '#4A3B32';

export type FurnitureDef = {
  id: string;
  label: string;
  price: number; // xu
  w: number; // bề rộng gợi ý khi đặt (px)
  draw: () => ReactElement;
};

const potPlant = () => (
  <g>
    <path d="M 70 60 q -30 -40 -14 -54 q 14 18 14 30 q 0 -22 18 -30 q 6 22 -4 40 Z" fill="#7BA07E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 70 60 q 8 -26 26 -30 q -4 20 -18 34 Z" fill="#A9C6A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 48 60 h 44 l -6 34 q -1 6 -8 6 h -16 q -7 0 -8 -6 Z" fill="#F3A46E" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
  </g>
);
const lamp = () => (
  <g>
    <path d="M 46 40 h 48 l -10 26 h -28 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={66} y={66} width={8} height={34} fill="#C98F55" stroke={INK} strokeWidth={3} />
    <ellipse cx={70} cy={102} rx={22} ry={7} fill="#C98F55" stroke={INK} strokeWidth={4} />
  </g>
);
const chair = () => (
  <g>
    <rect x={44} y={26} width={12} height={72} rx={5} fill="#C98F55" stroke={INK} strokeWidth={4} />
    <path d="M 44 30 q 20 -12 40 0 v 14 q -20 -10 -40 0 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <rect x={44} y={62} width={48} height={14} rx={5} fill="#E7B981" stroke={INK} strokeWidth={4} />
    <rect x={80} y={62} width={12} height={38} rx={5} fill="#C98F55" stroke={INK} strokeWidth={4} />
  </g>
);
const rug = () => (
  <g>
    <ellipse cx={70} cy={70} rx={56} ry={26} fill="#EBA7A0" stroke={INK} strokeWidth={5} />
    <ellipse cx={70} cy={70} rx={40} ry={16} fill="#F2CE85" stroke={INK} strokeWidth={3} />
    <ellipse cx={70} cy={70} rx={22} ry={7} fill="#9CC7D6" />
  </g>
);
const wallArt = () => (
  <g>
    <rect x={30} y={26} width={80} height={64} rx={8} fill="#FFFDF6" stroke={INK} strokeWidth={5} />
    <path d="M 38 78 l 20 -28 l 14 16 l 12 -18 l 20 30 Z" fill="#A9C6A0" stroke={INK} strokeWidth={3} strokeLinejoin="round" />
    <circle cx={54} cy={44} r={7} fill="#F2CE85" />
  </g>
);
const bunting = () => (
  <g>
    <path d="M 20 40 Q 70 58 120 40" fill="none" stroke={INK} strokeWidth={3} />
    {[0, 1, 2, 3, 4].map((i) => {
      const x = 26 + i * 22;
      const y = 44 + Math.sin(i) * 3;
      const c = ['#EBA7A0', '#F2CE85', '#9CC7D6', '#A9C6A0', '#F3A46E'][i];
      return <path key={i} d={`M ${x} ${y} h 18 l -9 18 Z`} fill={c} stroke={INK} strokeWidth={3} strokeLinejoin="round" />;
    })}
  </g>
);
const stool = () => (
  <g>
    <ellipse cx={70} cy={54} rx={26} ry={10} fill="#EBA7A0" stroke={INK} strokeWidth={4} />
    <path d="M 50 58 l -8 40 M 90 58 l 8 40 M 70 60 v 42" stroke="#C98F55" strokeWidth={6} strokeLinecap="round" />
  </g>
);
const vase = () => (
  <g>
    <path d="M 54 46 q -8 30 6 52 q 20 8 30 0 q 14 -22 6 -52 Z" fill="#9CC7D6" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 54 46 q 16 8 42 0" fill="none" stroke={INK} strokeWidth={3} />
    <path d="M 66 44 q 4 -20 -6 -30 M 74 44 q 0 -22 12 -30" stroke="#7BA07E" strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={54} cy={14} r={6} fill="#EBA7A0" stroke={INK} strokeWidth={3} />
    <circle cx={86} cy={14} r={6} fill="#F2CE85" stroke={INK} strokeWidth={3} />
  </g>
);
const clockSun = () => (
  // "đồng hồ mặt trời" trang trí — KHÔNG hiển thị giờ chơi (nguyên tắc không đếm ngược)
  <g>
    <circle cx={70} cy={64} r={30} fill="#F2CE85" stroke={INK} strokeWidth={5} />
    {Array.from({ length: 8 }).map((_, i) => {
      const a = (i / 8) * Math.PI * 2;
      return (
        <path
          key={i}
          d={`M ${70 + Math.cos(a) * 32} ${64 + Math.sin(a) * 32} L ${70 + Math.cos(a) * 42} ${64 + Math.sin(a) * 42}`}
          stroke="#F3A46E"
          strokeWidth={5}
          strokeLinecap="round"
        />
      );
    })}
    <circle cx={70} cy={64} r={7} fill="#D67B78" />
  </g>
);

const table = () => (
  <g>
    <rect x={30} y={54} width={80} height={12} rx={4} fill="#E7B981" stroke={INK} strokeWidth={4} />
    <rect x={38} y={66} width={8} height={40} fill="#C98F55" stroke={INK} strokeWidth={3} />
    <rect x={94} y={66} width={8} height={40} fill="#C98F55" stroke={INK} strokeWidth={3} />
  </g>
);
const roundTable = () => (
  <g>
    <ellipse cx={70} cy={52} rx={40} ry={12} fill="#EBA7A0" stroke={INK} strokeWidth={4} />
    <path d="M 60 60 l -6 46 M 80 60 l 6 46 M 70 62 v 44" stroke="#C98F55" strokeWidth={6} strokeLinecap="round" />
  </g>
);
const sofa = () => (
  <g>
    <rect x={26} y={58} width={88} height={34} rx={12} fill="#9CC7D6" stroke={INK} strokeWidth={4} />
    <rect x={26} y={40} width={88} height={30} rx={12} fill="#9CC7D6" stroke={INK} strokeWidth={4} />
    <rect x={20} y={54} width={18} height={40} rx={8} fill="#6FA6B6" stroke={INK} strokeWidth={4} />
    <rect x={102} y={54} width={18} height={40} rx={8} fill="#6FA6B6" stroke={INK} strokeWidth={4} />
    <rect x={44} y={90} width={10} height={12} fill="#C98F55" /><rect x={86} y={90} width={10} height={12} fill="#C98F55" />
  </g>
);
const bench = () => (
  <g>
    <rect x={32} y={62} width={76} height={12} rx={5} fill="#E7B981" stroke={INK} strokeWidth={4} />
    <path d="M 40 74 v 30 M 100 74 v 30" stroke="#C98F55" strokeWidth={6} strokeLinecap="round" />
    <rect x={32} y={44} width={76} height={8} rx={4} fill="#C98F55" stroke={INK} strokeWidth={3} />
  </g>
);
const bookshelf = () => (
  <g>
    <rect x={40} y={24} width={60} height={82} rx={6} fill="#C98F55" stroke={INK} strokeWidth={4} />
    {[38, 62, 86].map((y) => (
      <g key={y}>
        <rect x={44} y={y} width={52} height={6} fill="#E7B981" />
        {[0, 1, 2, 3].map((i) => (
          <rect key={i} x={46 + i * 12} y={y - 18} width={10} height={18} rx={2} fill={['#EBA7A0', '#A9C6A0', '#9CC7D6', '#F2CE85'][i]} stroke={INK} strokeWidth={2} />
        ))}
      </g>
    ))}
  </g>
);
const wallClock = () => (
  <g>
    <circle cx={70} cy={56} r={30} fill="#FBF1DE" stroke={INK} strokeWidth={5} />
    <path d="M 70 40 v 16 l 10 6" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" />
    <circle cx={70} cy={56} r={3} fill="#D67B78" />
  </g>
);
const mirror = () => (
  <g>
    <ellipse cx={70} cy={56} rx={30} ry={40} fill="#C98F55" stroke={INK} strokeWidth={5} />
    <ellipse cx={70} cy={56} rx={22} ry={32} fill="#CFE6EC" stroke={INK} strokeWidth={3} />
    <path d="M 60 40 q 10 -4 18 6" stroke="#FFFFFF" strokeWidth={4} fill="none" strokeLinecap="round" opacity={0.6} />
  </g>
);
const radio = () => (
  <g>
    <rect x={34} y={54} width={72} height={44} rx={8} fill="#F2CE85" stroke={INK} strokeWidth={4} />
    <circle cx={54} cy={76} r={11} fill="#E7B981" stroke={INK} strokeWidth={3} />
    <circle cx={54} cy={76} r={4} fill={INK} />
    <rect x={74} y={66} width={26} height={20} rx={3} fill="#7BA07E" stroke={INK} strokeWidth={3} />
    <path d="M 44 54 l -8 -14 M 96 54 l 8 -14" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>
);
const cushion = () => (
  <g>
    <rect x={40} y={54} width={60} height={46} rx={14} fill="#EBA7A0" stroke={INK} strokeWidth={4} />
    <circle cx={44} cy={58} r={3} fill="#D67B78" /><circle cx={96} cy={58} r={3} fill="#D67B78" />
    <path d="M 54 90 q 16 8 32 0" stroke="#D67B78" strokeWidth={3} fill="none" />
  </g>
);
const teddy = () => (
  <g>
    {[[54, 40], [86, 40]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={9} fill="#E7B981" stroke={INK} strokeWidth={4} />)}
    <circle cx={70} cy={54} r={20} fill="#E7B981" stroke={INK} strokeWidth={4} />
    <circle cx={62} cy={52} r={2.5} fill={INK} /><circle cx={78} cy={52} r={2.5} fill={INK} />
    <ellipse cx={70} cy={60} rx={7} ry={5} fill="#EBA7A0" /><circle cx={70} cy={58} r={2} fill={INK} />
    <ellipse cx={70} cy={90} rx={22} ry={16} fill="#E7B981" stroke={INK} strokeWidth={4} />
  </g>
);
const balloons = () => (
  <g>
    {[[52, 44, '#EBA7A0'], [70, 34, '#F2CE85'], [88, 44, '#9CC7D6']].map(([x, y, c], i) => (
      <g key={i}><ellipse cx={x as number} cy={y as number} rx={13} ry={16} fill={c as string} stroke={INK} strokeWidth={4} /><path d={`M ${x} ${(y as number) + 16} L 70 90`} stroke={INK} strokeWidth={2} /></g>
    ))}
    <circle cx={70} cy={92} r={4} fill="#C98F55" />
  </g>
);
const cakeStand = () => (
  <g>
    <ellipse cx={70} cy={44} rx={34} ry={9} fill="#FBF1DE" stroke={INK} strokeWidth={4} />
    <path d="M 46 44 q 4 -18 24 -18 q 20 0 24 18 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" opacity={0.9} />
    <rect x={66} y={50} width={8} height={40} fill="#C98F55" stroke={INK} strokeWidth={3} />
    <ellipse cx={70} cy={94} rx={22} ry={8} fill="#C98F55" stroke={INK} strokeWidth={4} />
  </g>
);
const hangPlant = () => (
  <g>
    <path d="M 50 22 h 40 M 70 22 v 8" stroke={INK} strokeWidth={3} />
    <path d="M 50 40 h 40 l -6 20 h -28 Z" fill="#C98F55" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 56 60 q -6 30 4 44 M 70 60 q 0 34 0 46 M 84 60 q 6 30 -4 44" fill="none" stroke="#7BA07E" strokeWidth={5} strokeLinecap="round" />
  </g>
);
const wallShelf = () => (
  <g>
    <rect x={34} y={70} width={72} height={12} rx={4} fill="#C98F55" stroke={INK} strokeWidth={4} />
    <path d="M 40 82 l 8 12 M 100 82 l -8 12" stroke={INK} strokeWidth={4} strokeLinecap="round" />
    <circle cx={54} cy={60} r={9} fill="#EBA7A0" stroke={INK} strokeWidth={3} />
    <rect x={76} y={50} width={16} height={20} rx={3} fill="#9CC7D6" stroke={INK} strokeWidth={3} />
  </g>
);
const lantern = () => (
  <g>
    <path d="M 70 24 v 6" stroke={INK} strokeWidth={3} />
    <ellipse cx={70} cy={58} rx={22} ry={26} fill="#F3A46E" stroke={INK} strokeWidth={4} />
    <path d="M 54 40 q 16 5 32 0 M 54 76 q 16 5 32 0" stroke={INK} strokeWidth={3} fill="none" />
    <path d="M 70 84 v 8 M 64 92 h 12" stroke="#D67B78" strokeWidth={4} strokeLinecap="round" />
  </g>
);
const birdcage = () => (
  <g>
    <path d="M 46 44 q 24 -22 48 0 v 50 h -48 Z" fill="none" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    {[58, 70, 82].map((x) => <path key={x} d={`M ${x} 30 ${x < 70 ? 'q -8 8' : x > 70 ? 'q 8 8' : 'q 0 8'} 0 64`} stroke={INK} strokeWidth={2} fill="none" opacity={0.6} />)}
    <rect x={44} y={94} width={52} height={10} rx={4} fill="#C98F55" stroke={INK} strokeWidth={4} />
    <circle cx={70} cy={64} r={9} fill="#F2CE85" stroke={INK} strokeWidth={3} />
  </g>
);
const fishbowl = () => (
  <g>
    <path d="M 44 56 q 0 40 26 40 q 26 0 26 -40 q -26 12 -52 0 Z" fill="#CFE6EC" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <ellipse cx={70} cy={56} rx={26} ry={8} fill="#9CC7D6" stroke={INK} strokeWidth={3} />
    <path d="M 66 76 l 12 -8 v 16 Z" fill="#F3A46E" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
    <circle cx={64} cy={74} r={2} fill={INK} />
  </g>
);
const easel = () => (
  <g>
    <path d="M 44 100 L 60 30 L 80 30 L 96 100 M 70 30 v 70" stroke="#C98F55" strokeWidth={5} fill="none" strokeLinecap="round" />
    <rect x={52} y={40} width={36} height={30} fill="#FBF1DE" stroke={INK} strokeWidth={4} />
    <path d="M 56 62 l 8 -12 l 6 6 l 6 -8 l 8 14 Z" fill="#A9C6A0" stroke={INK} strokeWidth={2} strokeLinejoin="round" />
  </g>
);
const standClock = () => (
  <g>
    <rect x={54} y={30} width={32} height={76} rx={8} fill="#C98F55" stroke={INK} strokeWidth={4} />
    <circle cx={70} cy={48} r={12} fill="#FBF1DE" stroke={INK} strokeWidth={3} />
    <path d="M 70 42 v 6 l 5 3" stroke={INK} strokeWidth={2} fill="none" strokeLinecap="round" />
    <circle cx={70} cy={80} r={5} fill="#F2CE85" stroke={INK} strokeWidth={2} />
  </g>
);

const CURATED: FurnitureDef[] = [
  { id: 'plant', label: 'Chậu cây', price: 40, w: 110, draw: potPlant },
  { id: 'lamp', label: 'Đèn ấm', price: 60, w: 110, draw: lamp },
  { id: 'chair', label: 'Ghế tựa', price: 80, w: 110, draw: chair },
  { id: 'rug', label: 'Thảm tròn', price: 70, w: 150, draw: rug },
  { id: 'art', label: 'Tranh tường', price: 90, w: 130, draw: wallArt },
  { id: 'bunting', label: 'Dây cờ', price: 30, w: 150, draw: bunting },
  { id: 'stool', label: 'Ghế đẩu', price: 50, w: 110, draw: stool },
  { id: 'vase', label: 'Bình hoa', price: 65, w: 110, draw: vase },
  { id: 'sun', label: 'Mặt trời', price: 120, w: 120, draw: clockSun },
  { id: 'table', label: 'Bàn gỗ', price: 90, w: 130, draw: table },
  { id: 'round-table', label: 'Bàn tròn', price: 85, w: 120, draw: roundTable },
  { id: 'sofa', label: 'Ghế sofa', price: 150, w: 150, draw: sofa },
  { id: 'bench', label: 'Băng ghế', price: 70, w: 130, draw: bench },
  { id: 'bookshelf', label: 'Kệ sách', price: 130, w: 120, draw: bookshelf },
  { id: 'wallclock', label: 'Đồng hồ', price: 60, w: 110, draw: wallClock },
  { id: 'mirror', label: 'Gương', price: 75, w: 110, draw: mirror },
  { id: 'radio', label: 'Đài cát-xét', price: 65, w: 120, draw: radio },
  { id: 'cushion', label: 'Gối tựa', price: 35, w: 110, draw: cushion },
  { id: 'teddy', label: 'Gấu bông', price: 95, w: 110, draw: teddy },
  { id: 'balloons', label: 'Chùm bóng', price: 40, w: 110, draw: balloons },
  { id: 'cakestand', label: 'Kệ bánh', price: 110, w: 110, draw: cakeStand },
  { id: 'hangplant', label: 'Cây treo', price: 50, w: 110, draw: hangPlant },
  { id: 'wallshelf', label: 'Kệ tường', price: 55, w: 120, draw: wallShelf },
  { id: 'lantern', label: 'Đèn lồng', price: 45, w: 110, draw: lantern },
  { id: 'birdcage', label: 'Lồng chim', price: 80, w: 110, draw: birdcage },
  { id: 'fishbowl', label: 'Bể cá', price: 85, w: 110, draw: fishbowl },
  { id: 'easel', label: 'Giá vẽ', price: 95, w: 120, draw: easel },
  { id: 'standclock', label: 'Đồng hồ đứng', price: 120, w: 110, draw: standClock },
];

/** Toàn bộ nội thất = vẽ tay (curated) + sinh bằng code (recipe × màu) ≈ 100 món. */
export const FURNITURE: FurnitureDef[] = [...CURATED, ...GEN_FURNITURE];

export function furnitureById(id: string) {
  return FURNITURE.find((f) => f.id === id);
}

export function Furniture({ def, width = 120 }: { def: FurnitureDef; width?: number }) {
  return (
    <svg viewBox="0 0 140 120" width={width} height={(width * 120) / 140} role="img" aria-label={def.label}>
      <Cut>{def.draw()}</Cut>
    </svg>
  );
}
