/**
 * Money.tsx — generator 9 mệnh giá tiền polymer đang lưu hành (thiết kế 3.2).
 * Ưu tiên #1: số trên tờ tiền phải ĐỌC ĐƯỢC ở mọi cỡ → dùng <text> thật,
 * KHÔNG áp filter mép-run lên chữ. Đây là trường hợp DỄ NHẤT của pipeline SVG.
 *
 * Một template + 9 bộ tham số → 9 tờ nhất quán tuyệt đối.
 */
import { Cut } from './paper';

export const NOTES = [
  1000, 2000, 5000, 10000, 20000, 50000, 100000, 200000, 500000,
] as const;
export type NoteValue = (typeof NOTES)[number];

// Mỗi mệnh giá: màu nền + khung + nhấn, chọn trong thế giới 12 màu (ấm, desaturated).
// Đủ khác nhau để phân biệt, nhưng số vẫn là tín hiệu chính.
const STYLE: Record<
  NoteValue,
  { base: string; frame: string; accent: string; motif: string }
> = {
  1000: { base: '#CFE0C4', frame: '#7BA07E', accent: '#A9C6A0', motif: '#7BA07E' },
  2000: { base: '#F1D6B4', frame: '#C98F55', accent: '#E7B981', motif: '#C98F55' },
  5000: { base: '#CFE6EC', frame: '#6FA6B6', accent: '#9CC7D6', motif: '#6FA6B6' },
  10000: { base: '#F7D8BE', frame: '#D98A54', accent: '#F3A46E', motif: '#D98A54' },
  20000: { base: '#BFD9E8', frame: '#5E92AE', accent: '#9CC7D6', motif: '#5E92AE' },
  50000: { base: '#F4CFCC', frame: '#D67B78', accent: '#EBA7A0', motif: '#D67B78' },
  100000: { base: '#B9D9B4', frame: '#5E8E63', accent: '#A9C6A0', motif: '#5E8E63' },
  200000: { base: '#F3C7A0', frame: '#C97D3E', accent: '#F3A46E', motif: '#C97D3E' },
  500000: { base: '#AFD3D9', frame: '#4E8A96', accent: '#9CC7D6', motif: '#4E8A96' },
};

/** "10000" → "10.000" (dấu chấm ngăn cách nghìn, chuẩn VN) */
export function formatVND(n: number): string {
  return n.toLocaleString('vi-VN');
}

export function Money({
  value,
  width = 220,
  className,
}: {
  value: NoteValue;
  width?: number;
  className?: string;
}) {
  const s = STYLE[value];
  const W = 300;
  const H = 158;
  const label = formatVND(value);
  // cỡ chữ số co theo độ dài (500.000 dài hơn 1.000)
  const digits = label.length;
  const numSize = digits >= 7 ? 52 : digits >= 5 ? 60 : 70;

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      width={width}
      height={(width * H) / W}
      className={className}
      role="img"
      aria-label={`Tờ ${label} đồng`}
    >
      {/* thân tờ tiền + khung — có mép run + bóng */}
      <Cut>
        <rect x={6} y={6} width={W - 12} height={H - 12} rx={16} fill={s.base} />
        {/* watermark: vòng tròn mờ như hoa văn nền */}
        <circle cx={72} cy={H / 2} r={44} fill={s.accent} opacity={0.5} />
        <circle cx={72} cy={H / 2} r={30} fill={s.base} opacity={0.7} />
        {/* khung viền kép */}
        <rect
          x={16}
          y={16}
          width={W - 32}
          height={H - 32}
          rx={10}
          fill="none"
          stroke={s.frame}
          strokeWidth={3}
        />
        <rect
          x={22}
          y={22}
          width={W - 44}
          height={H - 44}
          rx={7}
          fill="none"
          stroke={s.frame}
          strokeWidth={1.5}
          opacity={0.6}
        />
        {/* motif ổ bánh nhỏ bên trái (duyên, trong palette) */}
        <g transform={`translate(72 ${H / 2})`}>
          <path
            d="M -22 6 Q -22 -14 0 -14 Q 22 -14 22 6 Z"
            fill={s.motif}
            opacity={0.9}
          />
          <rect x={-26} y={4} width={52} height={9} rx={4} fill={s.frame} />
          <circle cx={-9} cy={-6} r={2.5} fill={s.base} />
          <circle cx={2} cy={-9} r={2.5} fill={s.base} />
          <circle cx={11} cy={-5} r={2.5} fill={s.base} />
        </g>
      </Cut>

      {/* SỐ — ngoài filter mép-run để nét chữ crisp, tabular */}
      <text
        x={W - 30}
        y={H / 2 + 6}
        textAnchor="end"
        fontFamily='"Quicksand","Be Vietnam Pro",sans-serif'
        fontWeight={700}
        fontSize={numSize}
        fill="#4A3B32"
        style={{ fontVariantNumeric: 'tabular-nums' }}
        dominantBaseline="middle"
      >
        {label}
      </text>
      <text
        x={W - 30}
        y={H - 26}
        textAnchor="end"
        fontFamily='"Be Vietnam Pro",sans-serif'
        fontWeight={600}
        fontSize={17}
        letterSpacing={2}
        fill={s.frame}
      >
        ĐỒNG
      </text>
      {/* số nhỏ góc trên-trái như tiền thật */}
      <text
        x={30}
        y={40}
        fontFamily='"Quicksand",sans-serif'
        fontWeight={700}
        fontSize={20}
        fill="#4A3B32"
        style={{ fontVariantNumeric: 'tabular-nums' }}
        opacity={0.85}
      >
        {label}
      </text>
    </svg>
  );
}
