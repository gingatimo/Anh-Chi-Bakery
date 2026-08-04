# Lộ trình lớn lên của tiệm (Bakery Progression)

Ngày: 2026-08-04 · Phạm vi: **Đầy đủ** (đã duyệt)

## Mục tiêu
Cho bé cảm giác "tiệm đang lớn lên": phục vụ càng nhiều khách → tiệm lên cấp →
mở khoá **phòng trang trí** và **công thức bánh** mới. Có huy hiệu cấp, khoảnh
khắc ăn mừng lên cấp, và một màn "Lộ trình" để bé thấy chặng đường phía trước.

## Metric: `counters.khach` (tổng khách đã phục vụ, cộng dồn)
Chọn vì đã có sẵn, cộng dồn, gắn trực tiếp với vòng lặp cốt lõi (phục vụ khách).
**Hồi tố**: cấp suy ra từ số khách ĐÃ tích luỹ → bé đang chơi lên cấp cao ngay,
KHÔNG mất phòng/bánh nào. Bé mới bắt đầu ở Cấp 1 và lớn dần.

## Bảng cấp (6 cấp)

| Cấp | Tên | minKhach | Phòng mới | Bánh mới |
|----|----|----|----|----|
| 1 | Tiệm nhỏ mới mở | 0 | Tiệm chính(0), Phòng bánh(1) | cupcake, cookie, donut |
| 2 | Có tiếng trong xóm | 8 | Góc đọc(2) | croissant |
| 3 | Khách quen đông vui | 20 | Sân vườn(3) | roll |
| 4 | Tiệm bánh nổi tiếng | 40 | Phòng tiệc(4) | macaron |
| 5 | Thợ bánh cừ khôi | 70 | Phòng ngủ(5) | tart |
| 6 | Tiệm bánh 5 sao ⭐ | 110 | Phòng ngủ Mập(6) | loaf |

Cấp 6 = đủ 7 phòng + 8 bánh (bằng hiện trạng). Cấp 1 luôn có ≥3 bánh hợp lệ; khách
khai trương (ngày 1) đặt `cookie` ∈ Cấp 1 ✓.

## Data & selectors (store.ts)
```ts
interface ShopLevel { level; name; minKhach; rooms: number[]; cakes: CakeKind[]; }
SHOP_LEVELS: ShopLevel[]   // mỗi dòng = phòng/bánh MỚI mở ở cấp đó
shopLevelFor(khach): number            // cấp cao nhất có minKhach ≤ khach
unlockedRoomsFor(level): number[]      // gộp rooms của các cấp ≤ level
unlockedCakesFor(level): CakeKind[]    // gộp cakes của các cấp ≤ level
nextLevelFor(khach): { next: ShopLevel|null; need: number }  // cho thanh tiến độ
```
State mới:
- `seenLevel: number` (persist) — cấp cao nhất ĐÃ ăn mừng. Khi nạp hồ sơ cũ chưa có
  field này → set = `shopLevelFor(khach)` để KHÔNG spam ăn mừng dồn cho cấp đã qua.
- `pendingUnlocks: number[]` (tạm, không persist) — các cấp vừa mở ở lần `endDay` này,
  để màn ăn mừng render; xoá khi rời reveal.

## Điểm cắm (plumb)
- **days.ts**: `buildDay(day, levels, session, lop, cakes)` — khách chỉ đặt trong
  `cakes = unlockedCakesFor(shopLevel)`. `pick(cakes)` thay `pick(CAKE_KINDS)`.
- **store.ts**: `startDay` truyền cakes đã mở; `endDay` tính `pendingUnlocks` +
  cập nhật `seenLevel`. `openShop`/gameplay không đổi khác.
- **Decorate.tsx**: phòng chưa mở → nút 🔒 disabled + nhãn "Mở ở Cấp N".
- **Hub.tsx**: huy hiệu `⭐ Cấp N` + thanh tiến độ "còn X khách"; nút mới "🗺️ Lộ trình".
- **Reveal/Summary**: nếu `pendingUnlocks` không rỗng → thẻ ăn mừng
  "🎉 Tiệm lên Cấp N! Mở khoá: [phòng] + [bánh]".
- **Screen mới `Roadmap.tsx`** + phase `'roadmap'`: liệt kê 6 cấp (✓ mở / 🔒 khoá +
  cần bao nhiêu khách), highlight cấp hiện tại. Thêm vào GAME_PHASES + Game.tsx view.

## Ăn mừng lên cấp — timing
Gom vào lúc **cuối ngày** (reveal), không cắt ngang lúc phục vụ. `endDay` so
`shopLevelFor(khach)` với `seenLevel`; nếu cao hơn → `pendingUnlocks = [seenLevel+1..new]`,
`seenLevel = new`. Reveal render từng cấp trong `pendingUnlocks`.

## Không làm (YAGNI)
- KHÔNG tier nội thất theo cấp (30 món vẫn mua bằng xu như cũ — xu đã là lộ trình mềm).
- KHÔNG thưởng xu khi lên cấp (phần thưởng là phòng/bánh + sticker cột mốc nếu có sẵn).
- KHÔNG đổi công thức tính giờ/trần thời gian.

## Verify (không có Playwright)
`tsc --noEmit` + `vite build` + rà logic. Bất biến kiểm: mọi cấp `unlockedCakesFor ≥ 3`;
`unlockedRoomsFor(6)` = đủ 7 phòng; đơn khai trương hợp lệ ở Cấp 1. User test prod.
