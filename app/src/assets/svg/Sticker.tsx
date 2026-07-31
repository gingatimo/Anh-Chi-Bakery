/**
 * Sticker.tsx — generator sticker (thiết kế 5). Die-cut viền trắng như sticker
 * thật, hợp thế giới giấy cắt. Mỗi sticker gắn một kỹ năng/cột mốc cụ thể —
 * "bằng chứng, không phải may rủi".
 * Bóc-dán (MeshPlane trong thiết kế) tạm mô phỏng ở lớp UI bằng Framer Motion.
 */
import type { ReactElement } from 'react';
import { Cut } from './paper';

const INK = '#4A3B32';

export type StickerDef = {
  id: string;
  label: string;
  earn: string; // điều kiện đạt — hiện dưới bóng mờ khi chưa có
  color: string;
  ink?: string;
  draw: () => ReactElement;
};

const bill = () => (
  <g>
    <rect x={-24} y={-14} width={48} height={30} rx={6} fill="#CFE0C4" stroke={INK} strokeWidth={4} />
    <circle cx={0} cy={1} r={9} fill="#7BA07E" />
    <path d="M -18 -8 h 8 M 10 10 h 8" stroke="#7BA07E" strokeWidth={3} strokeLinecap="round" />
  </g>
);
const plus = () => (
  <g stroke={INK} strokeWidth={7} strokeLinecap="round">
    <path d="M 0 -20 V 20" />
    <path d="M -20 0 H 20" />
  </g>
);
const coins = () => (
  <g>
    <ellipse cx={-8} cy={10} rx={18} ry={7} fill="#F2CE85" stroke={INK} strokeWidth={4} />
    <ellipse cx={-8} cy={2} rx={18} ry={7} fill="#F2CE85" stroke={INK} strokeWidth={4} />
    <ellipse cx={8} cy={-8} rx={16} ry={6} fill="#E7B981" stroke={INK} strokeWidth={4} />
  </g>
);
const cake = () => (
  <g>
    <path d="M -20 8 h 40 l -4 14 h -32 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -22 8 q 4 -20 22 -20 q 18 0 22 20 q -10 -8 -22 -2 q -12 -6 -22 2 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={0} cy={-16} r={4} fill="#D67B78" stroke={INK} strokeWidth={2} />
  </g>
);
const times = () => (
  <g stroke={INK} strokeWidth={7} strokeLinecap="round">
    <path d="M -15 -15 L 15 15" />
    <path d="M 15 -15 L -15 15" />
  </g>
);
const heart = () => (
  <path d="M 0 18 C -26 0 -18 -20 0 -8 C 18 -20 26 0 0 18 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);
const medal = () => (
  <g>
    <path d="M -10 -18 l -8 16 M 10 -18 l 8 16" stroke="#D67B78" strokeWidth={5} strokeLinecap="round" />
    <circle cx={0} cy={6} r={16} fill="#F2CE85" stroke={INK} strokeWidth={4} />
    <path d="M 0 -3 l 3 7 h 7 l -6 5 l 2 8 l -6 -5 l -6 5 l 2 -8 l -6 -5 h 7 Z" fill="#D67B78" />
  </g>
);
const star = () => (
  <path d="M 0 -22 L 6 -6 L 23 -6 L 9 4 L 14 21 L 0 10 L -14 21 L -9 4 L -23 -6 L -6 -6 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
);
const whisk = () => (
  <g>
    <rect x={-4} y={-22} width={8} height={16} rx={3} fill="#C98F55" stroke={INK} strokeWidth={3} />
    <path d="M -12 -6 q 0 24 12 26 q 12 -2 12 -26 M -6 -6 q 0 20 6 24 M 6 -6 q 0 20 -6 24" fill="none" stroke={INK} strokeWidth={3} strokeLinecap="round" />
  </g>
);
const box = () => (
  <g>
    <path d="M -20 -6 h 40 v 22 q 0 4 -4 4 h -32 q -4 0 -4 -4 Z" fill="#E7B981" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -22 -12 h 44 v 8 h -44 Z" fill="#EBA7A0" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M 0 -12 v 32 M -6 -20 q 6 6 6 8 q 0 -2 6 -8" stroke={INK} strokeWidth={3} fill="none" strokeLinecap="round" />
  </g>
);
const crown = () => (
  <g>
    <path d="M -22 12 L -18 -14 L -6 2 L 0 -18 L 6 2 L 18 -14 L 22 12 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <circle cx={-18} cy={-14} r={3} fill="#D67B78" />
    <circle cx={0} cy={-18} r={3} fill="#D67B78" />
    <circle cx={18} cy={-14} r={3} fill="#D67B78" />
  </g>
);
const flower = () => (
  <g>
    {[0, 1, 2, 3, 4].map((i) => {
      const a = (i / 5) * Math.PI * 2 - Math.PI / 2;
      return <circle key={i} cx={Math.cos(a) * 12} cy={Math.sin(a) * 12} r={8} fill="#EBA7A0" stroke={INK} strokeWidth={3} />;
    })}
    <circle cx={0} cy={0} r={7} fill="#F2CE85" stroke={INK} strokeWidth={3} />
  </g>
);
const rainbow = () => (
  <g fill="none" strokeWidth={5} strokeLinecap="round">
    <path d="M -22 12 a 22 22 0 0 1 44 0" stroke="#EBA7A0" />
    <path d="M -15 12 a 15 15 0 0 1 30 0" stroke="#F2CE85" />
    <path d="M -8 12 a 8 8 0 0 1 16 0" stroke="#9CC7D6" />
  </g>
);
const balloon = () => (
  <g>
    <ellipse cx={0} cy={-6} rx={15} ry={18} fill="#EBA7A0" stroke={INK} strokeWidth={4} />
    <path d="M 0 12 v 12" stroke={INK} strokeWidth={3} strokeLinecap="round" />
    <path d="M -3 12 l 6 0 l -3 4 Z" fill="#D67B78" />
    <ellipse cx={-5} cy={-10} rx={4} ry={6} fill="#FFFFFF" opacity={0.5} />
  </g>
);
const moon = () => (
  <g>
    <path d="M 8 -20 a 22 22 0 1 0 0 40 a 17 17 0 0 1 0 -40 Z" fill="#F2CE85" stroke={INK} strokeWidth={4} strokeLinejoin="round" />
    <path d="M -14 -14 l 2 4 l 4 2 l -4 2 l -2 4 l -2 -4 l -4 -2 l 4 -2 Z" fill="#F2CE85" />
  </g>
);

export const STICKERS: StickerDef[] = [
  { id: 'khaitruong', label: 'Khai trương', earn: 'Mở tiệm ngày đầu', color: '#F2CE85', draw: star },
  { id: 'tien-dau', label: 'Biết mặt tiền', earn: 'Thành thạo nhận mệnh giá', color: '#A9C6A0', draw: bill },
  { id: 'cong-gioi', label: 'Cộng giỏi', earn: 'Thành thạo cộng tiền', color: '#9CC7D6', draw: plus },
  { id: 'thoi-tai', label: 'Thối tiền tài', earn: 'Thành thạo thối tiền', color: '#EBA7A0', draw: coins },
  { id: 'me-dau', label: 'Mẻ bánh đầu', earn: 'Nướng 10 mẻ bánh', color: '#F3A46E', draw: cake },
  { id: 'nhan-nhanh', label: 'Nhân nhanh', earn: 'Thành thạo bảng nhân', color: '#F2CE85', draw: times },
  { id: 'khach-quen', label: 'Khách quen', earn: 'Phục vụ 50 khách', color: '#EBA7A0', draw: heart },
  { id: 'sao-vang', label: 'Sao vàng', earn: 'Chơi 7 ngày liên tiếp', color: '#A9C6A0', draw: medal },
  { id: 'cay-danh', label: 'Cây đánh trứng', earn: 'Thành thạo nhân 6–9', color: '#9CC7D6', draw: whisk },
  { id: 'hop-banh', label: 'Hộp bánh', earn: 'Đóng gói 20 hộp', color: '#F3A46E', draw: box },
  { id: 'vuong-mien', label: 'Vương miện', earn: 'Lên lớp mới', color: '#F2CE85', draw: crown },
  { id: 'bong-hoa', label: 'Bông hoa', earn: 'Trang trí 5 món', color: '#EBA7A0', draw: flower },
  { id: 'cau-vong', label: 'Cầu vồng', earn: 'Thành thạo chia có dư', color: '#A9C6A0', draw: rainbow },
  { id: 'bong-bay', label: 'Bóng bay', earn: 'Làm bánh sinh nhật', color: '#9CC7D6', draw: balloon },
  { id: 'trang-non', label: 'Trăng non', earn: 'Chơi buổi tối', color: '#F2CE85', draw: moon },
  { id: 'cham-chi', label: 'Chăm chỉ', earn: 'Phục vụ 100 khách', color: '#F3A46E', draw: star },
];

export function stickerById(id: string) {
  return STICKERS.find((s) => s.id === id);
}

export function Sticker({
  def,
  width = 120,
  ghost = false,
}: {
  def: StickerDef;
  width?: number;
  ghost?: boolean;
}) {
  const S = 160;
  const cloud = ghost ? '#E7DAC1' : '#FFFDF6';
  return (
    <svg viewBox={`0 0 ${S} ${S}`} width={width} height={width} role="img" aria-label={def.label}>
      <g opacity={ghost ? 0.32 : 1}>
        <Cut>
          {/* viền die-cut */}
          <circle cx={80} cy={62} r={50} fill={ghost ? '#E7DAC1' : '#FFFDF6'} />
          {/* huy hiệu màu */}
          <circle cx={80} cy={62} r={44} fill={ghost ? '#D9CBB2' : def.color} stroke={INK} strokeWidth={4} />
          <circle cx={80} cy={62} r={44} fill="#FFFFFF" opacity={ghost ? 0 : 0.12} />
          {!ghost && (
            <g transform="translate(80 56)" opacity={0.98}>
              {def.draw()}
            </g>
          )}
        </Cut>
      </g>

      {/* nền tên kiểu ĐÁM MÂY — để tên không đè lên sticker (dễ đọc) */}
      <g filter="url(#ac-soft)" opacity={ghost ? 0.6 : 1}>
        <circle cx={44} cy={128} r={12} fill={cloud} />
        <circle cx={70} cy={121} r={16} fill={cloud} />
        <circle cx={98} cy={123} r={14} fill={cloud} />
        <circle cx={120} cy={129} r={10} fill={cloud} />
        <ellipse cx={82} cy={135} rx={58} ry={15} fill={cloud} />
      </g>
      <text
        x={82}
        y={140}
        textAnchor="middle"
        fontFamily='"Quicksand",sans-serif'
        fontWeight={700}
        fontSize={16}
        fill={ghost ? 'rgba(74,59,50,0.5)' : '#4A3B32'}
      >
        {def.label}
      </text>
    </svg>
  );
}
