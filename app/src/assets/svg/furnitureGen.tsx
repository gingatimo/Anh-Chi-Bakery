/**
 * furnitureGen.tsx — sinh thêm đồ trang trí bằng CODE (recipe tham số × biến thể
 * màu) để bộ nội thất phong phú (~100 món cùng các món vẽ tay ở Furniture.tsx).
 * id ổn định 'g{i}' để mua/đặt/lưu được.
 */
import type { ReactElement } from 'react';
import type { FurnitureDef } from './Furniture';

const INK = '#4A3B32';
type Col = { name: string; fill: string; acc: string };
const PAL: Col[] = [
  { name: 'hồng', fill: '#EBA7A0', acc: '#D67B78' },
  { name: 'cam', fill: '#F3A46E', acc: '#C97D3E' },
  { name: 'vàng', fill: '#F2CE85', acc: '#D9A94E' },
  { name: 'xanh lá', fill: '#A9C6A0', acc: '#7BA07E' },
  { name: 'xanh biển', fill: '#9CC7D6', acc: '#6FA6B6' },
  { name: 'tím', fill: '#B9A6C9', acc: '#8E77A6' },
];

type Recipe = { name: string; price: number; w: number; draw: (c: Col) => ReactElement };
const RECIPES: Recipe[] = [
  { name: 'Ghế', price: 60, w: 110, draw: (c) => (<g><rect x={44} y={26} width={12} height={72} rx={5} fill={c.acc} stroke={INK} strokeWidth={4} /><path d="M 44 30 q 20 -12 40 0 v 14 q -20 -10 -40 0 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={44} y={62} width={48} height={14} rx={5} fill={c.fill} stroke={INK} strokeWidth={4} /><rect x={80} y={62} width={12} height={38} rx={5} fill={c.acc} stroke={INK} strokeWidth={4} /></g>) },
  { name: 'Bàn tròn', price: 85, w: 120, draw: (c) => (<g><ellipse cx={70} cy={50} rx={40} ry={12} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M 58 58 l -6 48 M 82 58 l 6 48 M 70 60 v 46" stroke={c.acc} strokeWidth={6} strokeLinecap="round" /></g>) },
  { name: 'Chậu cây', price: 45, w: 110, draw: (c) => (<g><path d="M 70 62 q -26 -34 -12 -50 q 12 16 12 28 q 0 -20 16 -28 q 6 20 -4 38 Z" fill="#7BA07E" stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 48 62 h 44 l -6 34 q -1 6 -8 6 h -16 q -7 0 -8 -6 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>) },
  { name: 'Đèn', price: 60, w: 110, draw: (c) => (<g><path d="M 46 40 h 48 l -10 26 h -28 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={66} y={66} width={8} height={34} fill={c.acc} stroke={INK} strokeWidth={3} /><ellipse cx={70} cy={102} rx={22} ry={7} fill={c.acc} stroke={INK} strokeWidth={4} /></g>) },
  { name: 'Thảm', price: 65, w: 150, draw: (c) => (<g><ellipse cx={70} cy={70} rx={56} ry={26} fill={c.fill} stroke={INK} strokeWidth={5} /><ellipse cx={70} cy={70} rx={38} ry={15} fill={c.acc} stroke={INK} strokeWidth={3} /><ellipse cx={70} cy={70} rx={20} ry={6} fill="#FBF1DE" /></g>) },
  { name: 'Gối', price: 35, w: 110, draw: (c) => (<g><rect x={42} y={50} width={56} height={44} rx={14} fill={c.fill} stroke={INK} strokeWidth={4} /><circle cx={46} cy={54} r={3} fill={c.acc} /><circle cx={94} cy={54} r={3} fill={c.acc} /><path d="M 56 88 q 14 8 28 0" stroke={c.acc} strokeWidth={3} fill="none" /></g>) },
  { name: 'Bình hoa', price: 55, w: 110, draw: (c) => (<g><path d="M 66 44 q 4 -18 -6 -28 M 74 44 q 0 -20 12 -28" stroke="#7BA07E" strokeWidth={4} fill="none" strokeLinecap="round" /><circle cx={60} cy={14} r={6} fill={c.acc} stroke={INK} strokeWidth={3} /><circle cx={86} cy={14} r={6} fill={c.fill} stroke={INK} strokeWidth={3} /><path d="M 54 46 q -8 30 6 52 q 20 8 30 0 q 14 -22 6 -52 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>) },
  { name: 'Tranh', price: 80, w: 130, draw: (c) => (<g><rect x={30} y={26} width={80} height={64} rx={8} fill="#FFFDF6" stroke={INK} strokeWidth={5} /><path d="M 38 78 l 20 -28 l 14 16 l 12 -18 l 20 30 Z" fill={c.fill} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><circle cx={54} cy={44} r={7} fill={c.acc} /></g>) },
  { name: 'Đồng hồ', price: 60, w: 110, draw: (c) => (<g><circle cx={70} cy={56} r={30} fill={c.fill} stroke={INK} strokeWidth={5} /><path d="M 70 40 v 16 l 10 6" stroke={INK} strokeWidth={4} fill="none" strokeLinecap="round" /><circle cx={70} cy={56} r={3} fill={c.acc} /></g>) },
  { name: 'Ghế đẩu', price: 50, w: 110, draw: (c) => (<g><ellipse cx={70} cy={54} rx={26} ry={10} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M 50 58 l -8 40 M 90 58 l 8 40 M 70 60 v 42" stroke={c.acc} strokeWidth={6} strokeLinecap="round" /></g>) },
  { name: 'Rèm', price: 70, w: 130, draw: (c) => (<g><rect x={34} y={24} width={72} height={8} rx={3} fill={c.acc} stroke={INK} strokeWidth={3} /><path d="M 40 32 q -4 40 6 44 q 8 -6 8 -44 Z M 58 32 q -4 40 6 44 q 8 -6 8 -44 Z M 76 32 q -4 40 6 44 q 8 -6 8 -44 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>) },
  { name: 'Kệ', price: 55, w: 120, draw: (c) => (<g><rect x={34} y={70} width={72} height={12} rx={4} fill={c.acc} stroke={INK} strokeWidth={4} /><path d="M 40 82 l 8 12 M 100 82 l -8 12" stroke={INK} strokeWidth={4} strokeLinecap="round" /><rect x={48} y={48} width={16} height={22} rx={3} fill={c.fill} stroke={INK} strokeWidth={3} /><circle cx={84} cy={60} r={9} fill={c.fill} stroke={INK} strokeWidth={3} /></g>) },
];

function build(i: number): FurnitureDef {
  const recipe = RECIPES[Math.floor(i / PAL.length) % RECIPES.length];
  const col = PAL[i % PAL.length];
  return {
    id: `g${i}`,
    label: `${recipe.name} ${col.name}`,
    price: recipe.price + (i % 3) * 5,
    w: recipe.w,
    draw: () => recipe.draw(col),
  };
}

export const GEN_FURNITURE: FurnitureDef[] = Array.from({ length: RECIPES.length * PAL.length }, (_, i) => build(i));
