/**
 * paper.tsx — nền tảng thị giác dùng chung cho MỌI asset SVG.
 *
 * - <PaperDefs/>: mount MỘT lần ở gốc app. Chứa filter dùng chung:
 *     #ac-edge   : mép "run tay" (giấy cắt thủ công) — feTurbulence + feDisplacementMap
 *     #ac-shadow : bóng đổ một hướng 135° (thiết kế 10.4)
 *     #ac-soft   : bóng mềm nhẹ cho lớp nổi
 * - Quy ước: KHÔNG áp #ac-edge lên <text> tờ tiền (số phải đọc được).
 * - Primitive dùng lại: Sparkle, Steam (thiết kế 10.5 "primitives/").
 */
import type { ReactNode } from 'react';

export function PaperDefs() {
  return (
    <svg
      aria-hidden
      width="0"
      height="0"
      style={{ position: 'absolute' }}
      focusable={false}
    >
      <defs>
        {/* Mép run tay — chủ đạo tạo cảm giác giấy cắt thủ công.
            Scale nhỏ để là "nét run", không phải "tan chảy". */}
        <filter id="ac-edge" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.014"
            numOctaves={1}
            seed={7}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={3.2}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Mép run mạnh hơn chút cho vật thể lớn (nền, biển hiệu) */}
        <filter id="ac-edge-lg" x="-8%" y="-8%" width="116%" height="116%">
          <feTurbulence
            type="fractalNoise"
            baseFrequency="0.008"
            numOctaves={1}
            seed={3}
            result="noise"
          />
          <feDisplacementMap
            in="SourceGraphic"
            in2="noise"
            scale={5}
            xChannelSelector="R"
            yChannelSelector="G"
          />
        </filter>

        {/* Bóng đổ MỘT hướng (135° = xuống-phải), một độ mờ */}
        <filter id="ac-shadow" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx={4}
            dy={4}
            stdDeviation={3}
            floodColor="#4A3B32"
            floodOpacity={0.22}
          />
        </filter>

        <filter id="ac-soft" x="-30%" y="-30%" width="160%" height="160%">
          <feDropShadow
            dx={2}
            dy={3}
            stdDeviation={2.5}
            floodColor="#4A3B32"
            floodOpacity={0.16}
          />
        </filter>
      </defs>
    </svg>
  );
}

/** Nhóm bọc để mọi asset có mép run + bóng nhất quán. */
export function Cut({
  children,
  shadow = true,
  big = false,
}: {
  children: ReactNode;
  shadow?: boolean;
  big?: boolean;
}) {
  return (
    <g filter={shadow ? 'url(#ac-shadow)' : undefined}>
      <g filter={big ? 'url(#ac-edge-lg)' : 'url(#ac-edge)'}>{children}</g>
    </g>
  );
}

/** Lấp lánh 4 cánh — dùng cho phần thưởng, mastery, sticker mới. */
export function Sparkle({
  x,
  y,
  r = 10,
  fill = '#F2CE85',
}: {
  x: number;
  y: number;
  r?: number;
  fill?: string;
}) {
  const d = `M ${x} ${y - r} C ${x + r * 0.18} ${y - r * 0.18}, ${x + r * 0.18} ${
    y - r * 0.18
  }, ${x + r} ${y} C ${x + r * 0.18} ${y + r * 0.18}, ${x + r * 0.18} ${
    y + r * 0.18
  }, ${x} ${y + r} C ${x - r * 0.18} ${y + r * 0.18}, ${x - r * 0.18} ${
    y + r * 0.18
  }, ${x - r} ${y} C ${x - r * 0.18} ${y - r * 0.18}, ${x - r * 0.18} ${
    y - r * 0.18
  }, ${x} ${y - r} Z`;
  return <path d={d} fill={fill} />;
}

/** Hơi nước bốc lên (bánh mới ra lò). */
export function Steam({ x, y }: { x: number; y: number }) {
  return (
    <path
      d={`M ${x} ${y} q -7 -10 0 -20 q 7 -10 0 -20`}
      fill="none"
      stroke="#FFFDF6"
      strokeWidth={5}
      strokeLinecap="round"
      opacity={0.75}
    />
  );
}
