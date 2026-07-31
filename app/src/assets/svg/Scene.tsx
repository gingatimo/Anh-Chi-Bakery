/**
 * Scene.tsx — nền phòng (hub S03 + trang trí S12). Mỗi PHÒNG một `variant` với
 * màu tường + sàn + đồ đặc trưng KHÁC NHAU, để đổi phòng là thấy đổi cảnh ngay.
 * Chữ tiếng Việt (biển hiệu) là DOM overlay ở lớp trên.
 */
import { PALETTE } from '../../design/tokens';

const INK = '#4A3B32';

type V = { wall: string; wallLow: string; floor: string; floorLine: string; kind: string };
const VARIANTS: V[] = [
  { wall: PALETTE.cream, wallLow: '#F3E3C6', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'shop' },
  { wall: '#F6DFBE', wallLow: '#E9CDA0', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'bakery' },
  { wall: '#DCE8D4', wallLow: '#C6DABA', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'reading' },
  { wall: '#C9E4EC', wallLow: '#A9C6A0', floor: '#A9C6A0', floorLine: '#7BA07E', kind: 'garden' },
  { wall: '#F4D6D3', wallLow: '#EABFBB', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'party' },
  { wall: '#F6DCE4', wallLow: '#EAC3D0', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'childbed' },
  { wall: '#DBD0E6', wallLow: '#C6B7D7', floor: PALETTE.wood, floorLine: PALETTE.woodDark, kind: 'bedroom' },
];

function Bunting({ colors }: { colors: string[] }) {
  return (
    <>
      <path d="M 40 46 Q 500 96 960 46" fill="none" stroke={INK} strokeWidth={3} opacity={0.7} />
      {Array.from({ length: 13 }).map((_, i) => {
        const t = i / 12;
        const x = 40 + t * 920;
        const y = 46 + Math.sin(t * Math.PI) * 46;
        return <path key={i} d={`M ${x - 11} ${y} h 22 l -11 20 Z`} fill={colors[i % colors.length]} stroke={INK} strokeWidth={2.5} strokeLinejoin="round" />;
      })}
    </>
  );
}

function Window({ evening }: { evening: boolean }) {
  const sky = evening ? '#3E5A7A' : PALETTE.sky;
  return (
    <g filter="url(#ac-shadow)">
      <rect x={96} y={70} width={250} height={196} rx={16} fill={PALETTE.woodDark} />
      <rect x={110} y={84} width={222} height={168} rx={10} fill={sky} />
      <circle cx={evening ? 150 : 290} cy={128} r={26} fill={evening ? '#F6EAD3' : PALETTE.butter} />
      <path d="M 110 252 q 60 -60 130 -20 q 50 28 92 8 v 12 h -222 Z" fill={evening ? '#4E6B57' : PALETTE.sage} />
      <path d="M 180 236 q -6 -34 14 -40 q 20 6 14 40 Z" fill={PALETTE.sageDark} />
      <rect x={191} y={232} width={6} height={16} fill={PALETTE.woodDark} />
      {!evening && <ellipse cx={160} cy={120} rx={30} ry={12} fill={PALETTE.paper} opacity={0.85} />}
      <path d="M 221 84 v 168 M 110 168 h 222" stroke={PALETTE.woodDark} strokeWidth={6} />
    </g>
  );
}

/** Đồ đặc trưng theo phòng. */
function Decor({ v, evening }: { v: V; evening: boolean }) {
  switch (v.kind) {
    case 'shop':
      return (
        <>
          <Window evening={evening} />
          <g filter="url(#ac-shadow)">
            <rect x={660} y={150} width={250} height={20} rx={8} fill={PALETTE.woodDark} />
            <rect x={676} y={110} width={40} height={40} rx={10} fill={PALETTE.rose} stroke={INK} strokeWidth={4} />
            <rect x={772} y={104} width={40} height={46} rx={10} fill={PALETTE.sage} stroke={INK} strokeWidth={4} />
            <rect x={856} y={112} width={38} height={38} rx={10} fill={PALETTE.butter} stroke={INK} strokeWidth={4} />
          </g>
          <Bunting colors={[PALETTE.rose, PALETTE.butter, PALETTE.sky, PALETTE.sage, PALETTE.peach]} />
          <g filter="url(#ac-shadow)">
            <rect x={150} y={452} width={700} height={150} rx={18} fill={PALETTE.wood} stroke={INK} strokeWidth={5} />
            <rect x={150} y={452} width={700} height={30} rx={14} fill={PALETTE.woodDark} />
          </g>
        </>
      );
    case 'bakery':
      return (
        <>
          {/* lò nướng */}
          <g filter="url(#ac-shadow)">
            <rect x={120} y={300} width={210} height={190} rx={18} fill={PALETTE.woodDark} stroke={INK} strokeWidth={5} />
            <rect x={140} y={330} width={170} height={120} rx={12} fill="#3A2E28" stroke={INK} strokeWidth={4} />
            <path d="M 155 400 q 70 -50 140 0" fill={evening ? '#8A5A3A' : '#F3A46E'} opacity={0.8} />
            <circle cx={225} cy={318} r={8} fill={PALETTE.butter} stroke={INK} strokeWidth={3} />
            <rect x={140} y={456} width={170} height={22} rx={6} fill={PALETTE.wood} stroke={INK} strokeWidth={3} />
          </g>
          {/* kệ bánh mì */}
          <g filter="url(#ac-shadow)">
            <rect x={560} y={190} width={320} height={18} rx={8} fill={PALETTE.woodDark} />
            {[600, 690, 780].map((x) => (
              <path key={x} d={`M ${x - 26} 190 q 4 -40 26 -40 q 22 0 26 40 Z`} fill={PALETTE.wood} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            ))}
            <rect x={560} y={330} width={320} height={18} rx={8} fill={PALETTE.woodDark} />
            {[600, 690, 780].map((x) => (
              <ellipse key={x} cx={x} cy={318} rx={28} ry={16} fill={PALETTE.butter} stroke={INK} strokeWidth={4} />
            ))}
          </g>
          {/* bao bột */}
          <g filter="url(#ac-shadow)">
            <path d="M 380 470 q -6 -40 40 -46 q 46 6 40 46 Z" fill={PALETTE.paper} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <path d="M 400 424 q 20 -8 40 0" fill="none" stroke={INK} strokeWidth={3} />
          </g>
        </>
      );
    case 'reading':
      return (
        <>
          {/* tủ sách bên trái — sách nằm GỌN trong khung, kệ đỡ dưới mỗi hàng */}
          <g filter="url(#ac-shadow)">
            <rect x={110} y={150} width={250} height={350} rx={12} fill={PALETTE.woodDark} stroke={INK} strokeWidth={5} />
            {[214, 314, 414].map((y) => (
              <g key={y}>
                {[0, 1, 2, 3, 4, 5, 6].map((i) => {
                  const c = [PALETTE.rose, PALETTE.sage, PALETTE.sky, PALETTE.peach, PALETTE.butter][i % 5];
                  return <rect key={i} x={132 + i * 30} y={y - 44} width={22} height={44} rx={3} fill={c} stroke={INK} strokeWidth={3} />;
                })}
                <rect x={122} y={y} width={226} height={12} fill={PALETTE.wood} stroke={INK} strokeWidth={2} />
              </g>
            ))}
          </g>
          {/* cửa sổ bên PHẢI — không đè lên tủ sách */}
          <g transform="translate(540 20)">
            <Window evening={evening} />
          </g>
          {/* ghế đọc */}
          <g filter="url(#ac-shadow)">
            <path d="M 610 500 q -6 -70 60 -70 q 66 0 60 70 Z" fill={PALETTE.rose} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <rect x={610} y={480} width={120} height={30} rx={10} fill={PALETTE.roseDark} />
          </g>
        </>
      );
    case 'garden':
      return (
        <>
          {/* mặt trời + mây */}
          <circle cx={840} cy={120} r={54} fill={evening ? '#F6EAD3' : PALETTE.butter} />
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => { const a = (i / 8) * Math.PI * 2; return <path key={i} d={`M ${840 + Math.cos(a) * 60} ${120 + Math.sin(a) * 60} l ${Math.cos(a) * 20} ${Math.sin(a) * 20}`} stroke={PALETTE.peach} strokeWidth={7} strokeLinecap="round" />; })}
          <ellipse cx={230} cy={110} rx={70} ry={26} fill={PALETTE.paper} opacity={0.9} />
          <ellipse cx={180} cy={124} rx={50} ry={20} fill={PALETTE.paper} opacity={0.85} />
          {/* hàng rào */}
          <g filter="url(#ac-shadow)">
            {Array.from({ length: 12 }).map((_, i) => (
              <path key={i} d={`M ${80 + i * 75} 452 v -70 l 14 -14 l 14 14 v 70 Z`} fill={PALETTE.paper} stroke={INK} strokeWidth={4} strokeLinejoin="round" />
            ))}
            <rect x={70} y={400} width={880} height={12} rx={5} fill={PALETTE.paper} stroke={INK} strokeWidth={3} />
          </g>
          {/* bụi cây */}
          {[[300, 470], [640, 480]].map(([x, y], i) => (
            <g key={i} filter="url(#ac-shadow)">
              <circle cx={x - 24} cy={y} r={30} fill={PALETTE.sageDark} stroke={INK} strokeWidth={4} />
              <circle cx={x + 6} cy={y - 14} r={34} fill={PALETTE.sage} stroke={INK} strokeWidth={4} />
              <circle cx={x + 30} cy={y} r={26} fill={PALETTE.sageDark} stroke={INK} strokeWidth={4} />
            </g>
          ))}
        </>
      );
    case 'party':
      return (
        <>
          <Bunting colors={[PALETTE.rose, PALETTE.butter, PALETTE.sky, PALETTE.sage, PALETTE.peach]} />
          {/* bóng bay */}
          {[[180, 220, PALETTE.rose], [300, 180, PALETTE.butter], [720, 200, PALETTE.sky], [840, 240, PALETTE.sage]].map(([x, y, c], i) => (
            <g key={i} filter="url(#ac-shadow)">
              <ellipse cx={x as number} cy={y as number} rx={40} ry={50} fill={c as string} stroke={INK} strokeWidth={5} />
              <path d={`M ${x} ${(y as number) + 50} q 10 40 -6 90`} fill="none" stroke={INK} strokeWidth={3} />
              <ellipse cx={(x as number) - 12} cy={(y as number) - 16} rx={10} ry={16} fill="#FFFFFF" opacity={0.45} />
            </g>
          ))}
          {/* bàn tiệc */}
          <g filter="url(#ac-shadow)">
            <rect x={330} y={430} width={340} height={30} rx={10} fill={PALETTE.rose} stroke={INK} strokeWidth={5} />
            <path d="M 470 430 q 3 -30 30 -30 q 27 0 30 30 Z" fill={PALETTE.butter} stroke={INK} strokeWidth={5} strokeLinejoin="round" />
            <circle cx={500} cy={392} r={5} fill={PALETTE.roseDark} />
          </g>
          {/* giấy confetti */}
          {[[120, 320], [880, 300], [500, 150], [420, 340], [760, 360]].map(([x, y], i) => (
            <rect key={i} x={x as number} y={y as number} width={12} height={12} rx={2} transform={`rotate(${i * 40} ${x} ${y})`} fill={[PALETTE.rose, PALETTE.butter, PALETTE.sky, PALETTE.sage][i % 4]} />
          ))}
        </>
      );
    case 'childbed':
      return (
        <>
          <Window evening={evening} />
          {/* giường của bé */}
          <g filter="url(#ac-shadow)">
            <rect x={560} y={382} width={360} height={118} rx={16} fill={PALETTE.sky} stroke={INK} strokeWidth={5} />
            <rect x={830} y={360} width={92} height={140} rx={14} fill={PALETTE.woodDark} stroke={INK} strokeWidth={5} />
            <rect x={846} y={392} width={64} height={52} rx={12} fill={PALETTE.paper} stroke={INK} strokeWidth={4} />
            <path d="M 578 500 v -82 h 250 v 82" fill={PALETTE.rose} stroke={INK} strokeWidth={4} />
            <path d="M 578 430 q 62 14 125 0 q 63 -14 125 0" fill="none" stroke={PALETTE.roseDark} strokeWidth={3} />
          </g>
          {/* rương đồ chơi */}
          <g filter="url(#ac-shadow)">
            <rect x={150} y={430} width={140} height={70} rx={10} fill={PALETTE.peach} stroke={INK} strokeWidth={5} />
            <rect x={150} y={418} width={140} height={22} rx={8} fill={PALETTE.roseDark} stroke={INK} strokeWidth={4} />
            <path d="M 220 500 C 200 484 208 470 220 480 C 232 470 240 484 220 500 Z" fill={PALETTE.butter} stroke={INK} strokeWidth={3} strokeLinejoin="round" />
          </g>
          {/* dây sao trang trí */}
          <path d="M 60 60 Q 300 92 540 60" fill="none" stroke={INK} strokeWidth={2.5} opacity={0.6} />
          {[0, 1, 2, 3, 4].map((i) => { const t = i / 4; const x = 60 + t * 480; const y = 60 + Math.sin(t * Math.PI) * 30; return <path key={i} d={`M ${x} ${y - 8} l 3 6 l 6 1 l -5 4 l 1 6 l -5 -3 l -5 3 l 1 -6 l -5 -4 l 6 -1 Z`} fill={[PALETTE.butter, PALETTE.rose, PALETTE.sky][i % 3]} stroke={INK} strokeWidth={1.5} />; })}
        </>
      );
    case 'bedroom':
      return (
        <>
          {/* cửa sổ đêm */}
          <g filter="url(#ac-shadow)">
            <rect x={620} y={90} width={230} height={180} rx={16} fill={PALETTE.woodDark} />
            <rect x={634} y={104} width={202} height={152} rx={10} fill="#3E4A6A" />
            <circle cx={720} cy={150} r={22} fill="#F6EAD3" />
            <circle cx={730} cy={144} r={18} fill="#3E4A6A" />
            {[[680, 130], [800, 180], [770, 120]].map(([x, y], i) => (
              <path key={i} d={`M ${x} ${(y as number) - 6} l 2 5 l 5 2 l -5 2 l -2 5 l -2 -5 l -5 -2 l 5 -2 Z`} fill="#F6EAD3" opacity={0.85} />
            ))}
            <path d="M 735 104 v 152 M 634 180 h 202" stroke={PALETTE.woodDark} strokeWidth={6} />
          </g>
          {/* giường */}
          <g filter="url(#ac-shadow)">
            <rect x={120} y={380} width={420} height={120} rx={16} fill={PALETTE.sky} stroke={INK} strokeWidth={5} />
            <rect x={120} y={360} width={90} height={140} rx={14} fill={PALETTE.woodDark} stroke={INK} strokeWidth={5} />
            <rect x={150} y={392} width={110} height={54} rx={12} fill={PALETTE.paper} stroke={INK} strokeWidth={4} />
            <path d="M 300 500 v -80 h 240 v 80" fill={PALETTE.rose} stroke={INK} strokeWidth={4} />
          </g>
        </>
      );
    default:
      return null;
  }
}

export function ShopScene({ evening = false, variant = 0 }: { evening?: boolean; variant?: number }) {
  const v = VARIANTS[variant % VARIANTS.length];
  const wall = evening ? '#2E2622' : v.wall;
  const wallLow = evening ? '#271F1B' : v.wallLow;
  const floor = evening ? '#3A302A' : v.floor;
  return (
    <svg viewBox="0 0 1000 620" preserveAspectRatio="xMidYMid slice" width="100%" height="100%" aria-hidden style={{ display: 'block' }}>
      <rect x={0} y={0} width={1000} height={452} fill={wall} />
      <rect x={0} y={330} width={1000} height={122} fill={wallLow} opacity={0.6} />
      <rect x={0} y={326} width={1000} height={6} fill={v.floorLine} opacity={0.5} />
      <rect x={0} y={452} width={1000} height={168} fill={floor} />
      {[120, 340, 560, 780].map((x) => (
        <path key={x} d={`M ${x} 452 L ${x - 40} 620`} stroke={v.floorLine} strokeWidth={3} opacity={0.4} />
      ))}
      <rect x={0} y={452} width={1000} height={8} fill={v.floorLine} opacity={0.5} />
      <Decor v={v} evening={evening} />
    </svg>
  );
}
