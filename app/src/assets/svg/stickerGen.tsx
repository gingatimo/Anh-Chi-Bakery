/**
 * stickerGen.tsx — GENERATOR sticker sưu tầm (thiết kế 10.5: "agent VIẾT asset").
 * Không thể vẽ tay 1000 hình bespoke → sinh bằng CODE: nhiều "recipe" hình theo
 * thể loại × biến thể màu, ghép bằng PRNG XÁC ĐỊNH (id ổn định để lưu được).
 * Phong cách nhất quán: hình phẳng, viền INK, màu trong bảng 12 màu.
 */
import type { ReactElement } from 'react';

const INK = '#4A3B32';
const S = (n: number) => n; // helper no-op cho dễ đọc toạ độ

// ── Bảng màu có TÊN tiếng Việt (dùng đặt tên sticker) ──
type Col = { name: string; fill: string; acc: string };
const PAL: Col[] = [
  { name: 'hồng', fill: '#EBA7A0', acc: '#D67B78' },
  { name: 'hồng đậm', fill: '#D67B78', acc: '#B85E5B' },
  { name: 'cam', fill: '#F3A46E', acc: '#C97D3E' },
  { name: 'vàng', fill: '#F2CE85', acc: '#D9A94E' },
  { name: 'xanh lá', fill: '#A9C6A0', acc: '#7BA07E' },
  { name: 'xanh rêu', fill: '#7BA07E', acc: '#5E8060' },
  { name: 'xanh biển', fill: '#9CC7D6', acc: '#6FA6B6' },
  { name: 'nâu', fill: '#E7B981', acc: '#C98F55' },
  { name: 'kem', fill: '#FBF1DE', acc: '#E7B981' },
  { name: 'tím', fill: '#B9A6C9', acc: '#8E77A6' },
];

type Recipe = { name: string; draw: (c: Col) => ReactElement };
type Cat = { key: string; name: string; recipes: Recipe[] };

// tiện ích nhỏ
const circle = (cx: number, cy: number, r: number, fill: string, sw = 4) => (
  <circle cx={cx} cy={cy} r={r} fill={fill} stroke={INK} strokeWidth={sw} />
);

const CATS: Cat[] = [
  {
    key: 'dong-vat',
    name: 'Động vật',
    recipes: [
      { name: 'Mèo', draw: (c) => (<g><path d="M -16 -8 l -4 -14 l 12 6 M 16 -8 l 4 -14 l -12 6" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />{circle(0, 2, 18, c.fill)}<circle cx={-7} cy={0} r={2.5} fill={INK} /><circle cx={7} cy={0} r={2.5} fill={INK} /><path d="M -2 6 l 2 3 l 2 -3 M -12 8 h 6 M 6 8 h 6" stroke={INK} strokeWidth={2.5} fill="none" strokeLinecap="round" /></g>) },
      { name: 'Cá', draw: (c) => (<g><path d="M 18 0 l 14 -10 v 20 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><ellipse cx={-2} cy={0} rx={20} ry={13} fill={c.fill} stroke={INK} strokeWidth={4} /><circle cx={-10} cy={-2} r={3} fill={INK} /><path d="M -2 -4 q 6 -3 10 0 M -2 4 q 6 3 10 0" stroke={INK} strokeWidth={2} fill="none" /></g>) },
      { name: 'Chim', draw: (c) => (<g>{circle(0, 2, 16, c.fill)}<circle cx={0} cy={-14} r={9} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M 8 -14 l 10 -2 l -8 6 Z" fill={c.acc} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><circle cx={2} cy={-15} r={2.5} fill={INK} /><path d="M -14 4 q -8 4 -2 10" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /></g>) },
      { name: 'Thỏ', draw: (c) => (<g><path d="M -8 -14 q -4 -18 2 -18 q 5 0 4 16 M 8 -14 q 4 -18 -2 -18 q -5 0 -4 16" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" />{circle(0, 4, 15, c.fill)}<circle cx={-6} cy={2} r={2.5} fill={INK} /><circle cx={6} cy={2} r={2.5} fill={INK} /><circle cx={0} cy={8} r={2.5} fill={c.acc} /></g>) },
      { name: 'Gấu', draw: (c) => (<g>{circle(-13, -12, 7, c.fill)}{circle(13, -12, 7, c.fill)}{circle(0, 2, 18, c.fill)}<circle cx={-7} cy={-1} r={2.5} fill={INK} /><circle cx={7} cy={-1} r={2.5} fill={INK} /><ellipse cx={0} cy={8} rx={7} ry={5} fill={c.acc} /><circle cx={0} cy={6} r={2} fill={INK} /></g>) },
      { name: 'Rùa', draw: (c) => (<g><ellipse cx={0} cy={2} rx={20} ry={15} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M 0 -13 v 30 M -18 2 h 36 M -12 -8 l 24 20 M 12 -8 l -24 20" stroke={INK} strokeWidth={2} opacity={0.5} /><circle cx={-20} cy={-4} r={5} fill={c.acc} stroke={INK} strokeWidth={3} /></g>) },
    ],
  },
  {
    key: 'hoa',
    name: 'Hoa',
    recipes: [
      { name: 'Cúc', draw: (c) => (<g>{[0, 1, 2, 3, 4, 5].map((i) => { const a = (i / 6) * Math.PI * 2; return <ellipse key={i} cx={Math.cos(a) * 12} cy={Math.sin(a) * 12} rx={7} ry={11} fill={c.fill} stroke={INK} strokeWidth={3} transform={`rotate(${(a * 180) / Math.PI} ${Math.cos(a) * 12} ${Math.sin(a) * 12})`} />; })}{circle(0, 0, 7, c.acc)}</g>) },
      { name: 'Tulip', draw: (c) => (<g><path d="M -12 -6 q 2 -16 12 -16 q 10 0 12 16 q -6 -6 -12 0 q -6 -6 -12 0 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 0 -6 v 24 M 0 6 q 10 -2 12 -8 M 0 12 q -10 -2 -12 -8" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /></g>) },
      { name: 'Bông', draw: (c) => (<g>{[0, 1, 2, 3, 4].map((i) => { const a = (i / 5) * Math.PI * 2 - 1.57; return circle(Math.cos(a) * 11, Math.sin(a) * 11, 8, c.fill); })}{circle(0, 0, 6, c.acc)}</g>) },
      { name: 'Hướng dương', draw: (c) => (<g>{[...Array(10)].map((_, i) => { const a = (i / 10) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 12} ${Math.sin(a) * 12} l ${Math.cos(a) * 9} ${Math.sin(a) * 9}`} stroke={c.fill} strokeWidth={6} strokeLinecap="round" />; })}{circle(0, 0, 11, c.acc)}</g>) },
    ],
  },
  {
    key: 'cay',
    name: 'Cây cối',
    recipes: [
      { name: 'Cây thông', draw: (c) => (<g><path d="M 0 -20 l 12 16 h -8 l 8 12 h -24 l 8 -12 h -8 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-3} y={8} width={6} height={10} fill={c.acc} stroke={INK} strokeWidth={3} /></g>) },
      { name: 'Cây tròn', draw: (c) => (<g>{circle(0, -6, 16, c.fill)}<rect x={-4} y={6} width={8} height={14} fill={c.acc} stroke={INK} strokeWidth={3} /></g>) },
      { name: 'Xương rồng', draw: (c) => (<g><path d="M -5 18 v -22 q 0 -8 5 -8 q 5 0 5 8 v 22 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -5 -2 q -10 0 -10 -8 M 5 2 q 10 0 10 -10" fill="none" stroke={INK} strokeWidth={4} strokeLinecap="round" /><path d="M -13 -10 v -4 M 13 -8 v -4" stroke={c.acc} strokeWidth={3} strokeLinecap="round" /></g>) },
      { name: 'Nấm', draw: (c) => (<g><path d="M -18 0 q 0 -18 18 -18 q 18 0 18 18 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-6} y={0} width={12} height={16} rx={5} fill={c.acc} stroke={INK} strokeWidth={3} /><circle cx={-7} cy={-8} r={3} fill="#FFFDF6" /><circle cx={6} cy={-6} r={2.5} fill="#FFFDF6" /></g>) },
    ],
  },
  {
    key: 'do-vat',
    name: 'Đồ vật',
    recipes: [
      { name: 'Ly', draw: (c) => (<g><path d="M -12 -12 h 24 l -3 26 q 0 4 -4 4 h -10 q -4 0 -4 -4 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 12 -6 q 10 0 10 8 q 0 8 -9 8" fill="none" stroke={INK} strokeWidth={4} /><path d="M -4 -18 q 4 4 0 6 M 4 -18 q 4 4 0 6" stroke={c.acc} strokeWidth={3} fill="none" strokeLinecap="round" /></g>) },
      { name: 'Quà', draw: (c) => (<g><rect x={-16} y={-6} width={32} height={22} rx={3} fill={c.fill} stroke={INK} strokeWidth={4} /><rect x={-18} y={-12} width={36} height={8} rx={2} fill={c.acc} stroke={INK} strokeWidth={4} /><path d="M 0 -12 v 28 M -8 -18 q 8 4 8 6 q 0 -2 8 -6" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /></g>) },
      { name: 'Bóng bay', draw: (c) => (<g><ellipse cx={0} cy={-6} rx={14} ry={17} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M 0 11 v 12" stroke={INK} strokeWidth={3} strokeLinecap="round" /><path d="M -3 11 l 6 0 l -3 4 Z" fill={c.acc} /></g>) },
      { name: 'Chìa khoá', draw: (c) => (<g>{circle(-8, -8, 9, c.fill)}<circle cx={-8} cy={-8} r={3} fill={INK} /><path d="M -2 -2 l 16 16 M 10 10 l 5 -5 M 14 14 l 4 -4" stroke={c.acc} strokeWidth={5} strokeLinecap="round" /></g>) },
      { name: 'Đồng hồ', draw: (c) => (<g>{circle(0, 0, 17, c.fill)}<path d="M 0 -10 v 10 l 7 4" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" /><circle cx={0} cy={0} r={2.5} fill={c.acc} /></g>) },
      { name: 'Ô', draw: (c) => (<g><path d="M -20 0 q 4 -20 20 -20 q 16 0 20 20 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 0 0 v 16 q 0 5 -6 5" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" /><path d="M -20 0 q 5 -6 10 0 q 5 -6 10 0 q 5 -6 10 0" fill="none" stroke={c.acc} strokeWidth={2} /></g>) },
    ],
  },
  {
    key: 'trang-phuc',
    name: 'Trang phục',
    recipes: [
      { name: 'Áo', draw: (c) => (<g><path d="M -18 -10 l 8 -6 h 20 l 8 6 l -6 8 l -4 -2 v 20 h -16 v -20 l -4 2 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -2 -16 q 2 4 4 0" fill="none" stroke={c.acc} strokeWidth={3} /></g>) },
      { name: 'Váy', draw: (c) => (<g><path d="M -8 -16 h 16 l 14 34 h -44 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -8 -16 q 8 6 16 0" fill="none" stroke={c.acc} strokeWidth={3} /></g>) },
      { name: 'Mũ', draw: (c) => (<g><path d="M -20 8 q 4 4 20 4 q 16 0 20 -4 q -4 -22 -20 -22 q -16 0 -20 22 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -14 4 q 14 5 28 0" fill="none" stroke={c.acc} strokeWidth={4} /></g>) },
      { name: 'Giày', draw: (c) => (<g><path d="M -18 6 q 0 -14 8 -14 q 4 12 12 12 l 12 2 q 4 1 4 5 v 3 h -36 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -8 -6 q 4 6 8 6" fill="none" stroke={c.acc} strokeWidth={3} /></g>) },
      { name: 'Vương miện', draw: (c) => (<g><path d="M -18 12 L -14 -12 L -4 2 L 0 -16 L 4 2 L 14 -12 L 18 12 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><circle cx={0} cy={-16} r={3} fill={c.acc} /></g>) },
    ],
  },
  {
    key: 'phuong-tien',
    name: 'Phương tiện',
    recipes: [
      { name: 'Ô tô', draw: (c) => (<g><path d="M -20 6 v -6 l 6 -10 h 20 l 8 10 v 6 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-8} y={-9} width={12} height={7} rx={2} fill={c.acc} /><circle cx={-11} cy={7} r={5} fill={INK} /><circle cx={11} cy={7} r={5} fill={INK} /></g>) },
      { name: 'Thuyền', draw: (c) => (<g><path d="M -20 4 h 40 l -6 12 h -28 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 0 4 v -22 l 14 14 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M 0 -18 v 22" stroke={INK} strokeWidth={3} /></g>) },
      { name: 'Máy bay', draw: (c) => (<g><path d="M -22 2 l 44 -8 q 6 -1 4 4 l -10 8 l 4 10 l -6 2 l -8 -10 l -14 2 l -2 8 l -4 -2 l 2 -10 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /></g>) },
      { name: 'Tàu lửa', draw: (c) => (<g><rect x={-20} y={-8} width={26} height={18} rx={3} fill={c.fill} stroke={INK} strokeWidth={4} /><rect x={-16} y={-4} width={8} height={8} fill={c.acc} /><path d="M 6 -8 h 12 v 18 h -12 Z" fill={c.acc} stroke={INK} strokeWidth={4} /><circle cx={-12} cy={12} r={4} fill={INK} /><circle cx={2} cy={12} r={4} fill={INK} /></g>) },
      { name: 'Tên lửa', draw: (c) => (<g><path d="M 0 -22 q 10 8 10 22 l -4 8 h -12 l -4 -8 q 0 -14 10 -22 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><circle cx={0} cy={-4} r={4} fill={c.acc} /><path d="M -6 14 l -4 8 M 6 14 l 4 8" stroke={c.acc} strokeWidth={4} strokeLinecap="round" /></g>) },
    ],
  },
  {
    key: 'ngay-le',
    name: 'Ngày lễ',
    recipes: [
      { name: 'Lồng đèn', draw: (c) => (<g><path d="M 0 -16 v 4 M 0 12 v 4" stroke={INK} strokeWidth={3} /><ellipse cx={0} cy={-2} rx={14} ry={14} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M -8 -14 q 8 3 16 0 M -8 10 q 8 3 16 0" stroke={INK} strokeWidth={3} fill="none" /><path d="M 0 16 v 6 M -3 22 h 6" stroke={c.acc} strokeWidth={3} strokeLinecap="round" /></g>) },
      { name: 'Trứng', draw: (c) => (<g><ellipse cx={0} cy={2} rx={14} ry={18} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M -14 0 q 7 6 14 0 q 7 -6 14 0" fill="none" stroke={c.acc} strokeWidth={3} /><circle cx={-4} cy={-8} r={3} fill={c.acc} /></g>) },
      { name: 'Trái tim', draw: (c) => (<path d="M 0 16 C -22 0 -16 -18 0 -6 C 16 -18 22 0 0 16 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /> ) },
      { name: 'Pháo hoa', draw: (c) => (<g>{[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 6} ${Math.sin(a) * 6} L ${Math.cos(a) * 18} ${Math.sin(a) * 18}`} stroke={c.fill} strokeWidth={4} strokeLinecap="round" />; })}{circle(0, 0, 5, c.acc)}</g>) },
    ],
  },
  {
    key: 'dia-danh',
    name: 'Địa danh',
    recipes: [
      { name: 'Ngôi nhà', draw: (c) => (<g><path d="M -16 -2 l 16 -14 l 16 14 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-12} y={-2} width={24} height={18} fill={c.fill} stroke={INK} strokeWidth={4} /><rect x={-3} y={4} width={6} height={12} fill={c.acc} /></g>) },
      { name: 'Tháp', draw: (c) => (<g><path d="M 0 -20 l 4 6 h -8 Z" fill={c.acc} stroke={INK} strokeWidth={3} /><path d="M -8 -12 h 16 l -2 28 h -12 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-3} y={-4} width={6} height={8} fill={c.acc} /></g>) },
      { name: 'Chùa', draw: (c) => (<g><path d="M -18 -6 h 36 l -6 -8 h -24 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><rect x={-12} y={-6} width={24} height={22} fill={c.fill} stroke={INK} strokeWidth={4} /><rect x={-4} y={2} width={8} height={14} fill={c.acc} /></g>) },
      { name: 'Núi', draw: (c) => (<g><path d="M -20 16 l 12 -28 l 8 12 l 6 -8 l 14 24 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -8 -12 l 4 6 l 4 -4 l 2 4" fill="#FFFDF6" stroke={INK} strokeWidth={2} /></g>) },
    ],
  },
  {
    key: 'do-an',
    name: 'Đồ ăn',
    recipes: [
      { name: 'Kem', draw: (c) => (<g><path d="M -10 -4 h 20 l -10 22 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" />{circle(0, -10, 11, c.fill)}<circle cx={0} cy={-18} r={4} fill={c.acc} /></g>) },
      { name: 'Kẹo', draw: (c) => (<g><ellipse cx={0} cy={0} rx={12} ry={12} fill={c.fill} stroke={INK} strokeWidth={4} /><path d="M -12 0 l -10 -6 l 4 6 l -4 6 Z M 12 0 l 10 -6 l -4 6 l 4 6 Z" fill={c.acc} stroke={INK} strokeWidth={3} strokeLinejoin="round" /><path d="M -5 -5 q 5 5 10 0" stroke="#FFFDF6" strokeWidth={2} fill="none" /></g>) },
      { name: 'Táo', draw: (c) => (<g>{circle(0, 4, 15, c.fill)}<path d="M 0 -10 q 2 -8 8 -8" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" /><path d="M 0 -10 q -4 -6 -10 -4 q 4 6 10 4 Z" fill={c.acc} stroke={INK} strokeWidth={2} /></g>) },
      { name: 'Bánh kem', draw: (c) => (<g><path d="M -14 4 h 28 l -3 14 h -22 Z" fill={c.acc} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><path d="M -16 4 q 3 -16 16 -16 q 13 0 16 16 q -8 -6 -16 -2 q -8 -4 -16 2 Z" fill={c.fill} stroke={INK} strokeWidth={4} strokeLinejoin="round" /><circle cx={0} cy={-14} r={3} fill={c.acc} /></g>) },
    ],
  },
  {
    key: 'thoi-tiet',
    name: 'Thời tiết',
    recipes: [
      { name: 'Mặt trời', draw: (c) => (<g>{[...Array(8)].map((_, i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${Math.cos(a) * 13} ${Math.sin(a) * 13} L ${Math.cos(a) * 20} ${Math.sin(a) * 20}`} stroke={c.acc} strokeWidth={4} strokeLinecap="round" />; })}{circle(0, 0, 12, c.fill)}</g>) },
      { name: 'Mây', draw: (c) => (<g>{circle(-10, 2, 9, c.fill)}{circle(4, -4, 12, c.fill)}{circle(14, 4, 8, c.fill)}<rect x={-14} y={2} width={30} height={10} rx={5} fill={c.fill} /></g>) },
      { name: 'Cầu vồng', draw: (c) => (<g fill="none" strokeWidth={5} strokeLinecap="round"><path d="M -20 14 a 20 20 0 0 1 40 0" stroke={c.fill} /><path d="M -13 14 a 13 13 0 0 1 26 0" stroke={c.acc} /><path d="M -6 14 a 6 6 0 0 1 12 0" stroke="#F2CE85" /></g>) },
      { name: 'Bông tuyết', draw: (c) => (<g stroke={c.fill} strokeWidth={4} strokeLinecap="round">{[...Array(6)].map((_, i) => { const a = (i / 6) * Math.PI * 2; return <g key={i}><path d={`M 0 0 L ${Math.cos(a) * 18} ${Math.sin(a) * 18}`} /><path d={`M ${Math.cos(a) * 10} ${Math.sin(a) * 10} l ${Math.cos(a + 1) * 6} ${Math.sin(a + 1) * 6} M ${Math.cos(a) * 10} ${Math.sin(a) * 10} l ${Math.cos(a - 1) * 6} ${Math.sin(a - 1) * 6}`} /></g>; })}</g>) },
    ],
  },
];

// PRNG xác định (mulberry32) — id ổn định giữa các phiên
function rng(seed: number) {
  return () => {
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export interface CatalogSticker {
  id: string;
  label: string;
  catKey: string;
  catName: string;
  color: string;
  draw: () => ReactElement;
}

export const STICKER_CATEGORIES = CATS.map((c) => ({ key: c.key, name: c.name }));

function buildOne(i: number): CatalogSticker {
  const r = rng((i * 2654435761) >>> 0);
  const cat = CATS[Math.floor(r() * CATS.length)];
  const recipe = cat.recipes[Math.floor(r() * cat.recipes.length)];
  const bg = PAL[Math.floor(r() * PAL.length)];
  const fg = PAL[Math.floor(r() * PAL.length)];
  return {
    id: `c${i}`,
    label: `${recipe.name} ${fg.name}`,
    catKey: cat.key,
    catName: cat.name,
    color: bg.fill,
    draw: () => recipe.draw(fg),
  };
}

export const CATALOG_SIZE = 1000;

let _catalog: CatalogSticker[] | null = null;
export function catalog(): CatalogSticker[] {
  if (!_catalog) _catalog = Array.from({ length: CATALOG_SIZE }, (_, i) => buildOne(i));
  return _catalog;
}

export function catalogById(id: string): CatalogSticker | undefined {
  const i = Number(id.slice(1));
  if (!Number.isInteger(i) || i < 0 || i >= CATALOG_SIZE) return undefined;
  return buildOne(i);
}

/** Sticker sưu tầm — die-cut + nền tên đám mây (giống milestone). */
export function CatalogStickerView({ s, width = 96, ghost = false }: { s: CatalogSticker; width?: number; ghost?: boolean }) {
  const cloud = ghost ? '#E7DAC1' : '#FFFDF6';
  return (
    <svg viewBox="0 0 160 160" width={width} height={width} role="img" aria-label={s.label}>
      <g opacity={ghost ? 0.3 : 1}>
        <g filter="url(#ac-shadow)">
          <g filter="url(#ac-edge)">
            {circle(80, 62, 50, ghost ? '#E7DAC1' : '#FFFDF6')}
            {circle(80, 62, 44, ghost ? '#D9CBB2' : s.color)}
            {!ghost && (
              <g transform="translate(80 60) scale(1.55)" opacity={0.98}>
                {s.draw()}
              </g>
            )}
          </g>
        </g>
      </g>
      <g filter="url(#ac-soft)" opacity={ghost ? 0.6 : 1}>
        <circle cx={44} cy={128} r={12} fill={cloud} />
        <circle cx={70} cy={121} r={16} fill={cloud} />
        <circle cx={98} cy={123} r={14} fill={cloud} />
        <circle cx={120} cy={129} r={10} fill={cloud} />
        <ellipse cx={82} cy={135} rx={58} ry={15} fill={cloud} />
      </g>
      <text x={82} y={140} textAnchor="middle" fontFamily='"Quicksand",sans-serif' fontWeight={700} fontSize={15} fill={ghost ? 'rgba(74,59,50,0.5)' : '#4A3B32'}>
        {s.label}
      </text>
    </svg>
  );
}

void S; // giữ helper để dễ mở rộng recipe
