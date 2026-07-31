/**
 * tokens.ts — NGUỒN CHÂN LÝ DUY NHẤT về style (thiết kế mục 10.4).
 *
 * Ràng buộc cứng, đo được — không phải mô tả cảm tính:
 *  - Bảng màu ĐÓNG: đúng 12 màu thế giới (warm, handcrafted, KHÔNG hồng neon)
 *  - Độ dày nét: chỉ 2 mức (theo đơn vị canvas gốc 240)
 *  - Bóng đổ MỘT hướng duy nhất (135°), một độ mờ duy nhất
 *  - Mọi thứ vẽ trên lưới 8px
 *  - Bo góc chỉ 2 giá trị
 *
 * Đây là thứ giữ cho asset vẽ cách nhau nhiều tuần vẫn trông cùng một thế giới.
 */

// ─────────────────────────────────────────────────────────────
// 12 MÀU THẾ GIỚI (đóng) — gỗ nhạt, kem, hồng đất, sage, cam đào
// ─────────────────────────────────────────────────────────────
export const PALETTE = {
  ink:      '#4A3B32', // nâu ấm đậm — thay cho đen thuần (nét viền + chữ)
  cream:    '#FBF1DE', // nền chính (kem)
  paper:    '#FFFDF6', // giấy sáng hơn — thẻ, kệ, khay
  wood:     '#E7B981', // gỗ nhạt
  woodDark: '#C98F55', // gỗ đậm (mặt bên, bóng khối gỗ)
  rose:     '#EBA7A0', // hồng đất
  roseDark: '#D67B78', // hồng đậm (nhấn ấm, "cần xem lại")
  peach:    '#F3A46E', // cam đào
  sage:     '#A9C6A0', // xanh sage ("đúng rồi")
  sageDark: '#7BA07E', // sage đậm
  sky:      '#9CC7D6', // xanh xám — màu của Mập (tránh vàng-cam Baby Shark)
  butter:   '#F2CE85', // vàng bơ ấm
} as const;

export type ColorName = keyof typeof PALETTE;

// Sắc độ dẫn xuất (tint/shade cơ học của 12 màu — KHÔNG phải màu mới).
// Dùng cho chi tiết bên trong asset. Giữ thế giới nhất quán.
export const SHADE = {
  creamDeep: '#F3E3C6', // kem sâu hơn — rãnh, nền chìm
  inkSoft:   'rgba(74, 59, 50, 0.55)', // chữ phụ
  white:     '#FFFFFF',
} as const;

// ─────────────────────────────────────────────────────────────
// NÉT VIỀN — đúng 2 mức (đơn vị canvas gốc 240)
// ─────────────────────────────────────────────────────────────
export const STROKE = {
  thin: 3,
  thick: 6,
  color: PALETTE.ink,
} as const;

// ─────────────────────────────────────────────────────────────
// BÓNG ĐỔ — một hướng (135° = xuống-phải), một độ mờ
// ─────────────────────────────────────────────────────────────
export const SHADOW = {
  angleDeg: 135,
  dx: 4,
  dy: 4,
  blur: 6,
  color: 'rgba(74, 59, 50, 0.22)',
  // CSS drop-shadow tương đương cho các lớp DOM
  css: '4px 4px 10px rgba(74, 59, 50, 0.16)',
  cssSoft: '2px 3px 6px rgba(74, 59, 50, 0.12)',
} as const;

// ─────────────────────────────────────────────────────────────
// BO GÓC — chỉ 2 giá trị (theo lưới 8px)
// ─────────────────────────────────────────────────────────────
export const RADIUS = {
  sm: 8,
  lg: 24,
} as const;

// ─────────────────────────────────────────────────────────────
// LƯỚI 8px
// ─────────────────────────────────────────────────────────────
export const GRID = 8;
export const grid = (n: number) => n * GRID;

// ─────────────────────────────────────────────────────────────
// TYPOGRAPHY (thiết kế 10.9) — Quicksand tiêu đề/UI, Be Vietnam Pro nội dung.
// Cả hai có tiếng Việt đầy đủ. Số dùng tabular figures để cột tiền thẳng hàng.
// ─────────────────────────────────────────────────────────────
export const FONT = {
  display: '"Quicksand", "Be Vietnam Pro", system-ui, sans-serif',
  body: '"Be Vietnam Pro", system-ui, sans-serif',
} as const;

// Kích thước chữ tối thiểu 18px trên desktop, tương phản cao (9.6)
export const TEXT = {
  min: 18,
} as const;
