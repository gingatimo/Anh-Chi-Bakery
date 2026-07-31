# Tiệm Bánh Anh Chi — MVP vertical slice

Bản chạy được đầu tiên (M1 vertical slice) của game toán "Tiệm Bánh Anh Chi"
theo [tài liệu thiết kế](../tiem-banh-anh-chi-thiet-ke-mvp.md).

Bé làm chủ tiệm bánh, dùng toán để phục vụ khách, sưu tầm sticker và trang trí tiệm —
**không đồng hồ đếm ngược, sai không mất gì**.

## Chạy

```bash
cd app
npm install
npm run dev
```

Mở link Vite in ra (mặc định http://localhost:5173).

- `npm run build` — build production (tsc + vite)
- `npm run preview` — xem bản build

## Sao lưu & đồng bộ đám mây (Supabase — tùy chọn)

App **local-first**: không cấu hình gì vẫn chơi & lưu đầy đủ trên máy. Để bật tài
khoản phụ huynh (sao lưu + chơi nhiều máy):

**1. Áp schema bằng Supabase CLI** (migration ở [`../supabase/migrations/`](../supabase/migrations/), chạy từ thư mục gốc repo):

```bash
supabase login                                    # nếu chưa đăng nhập
supabase link --project-ref zafafpmkbuixkpuyxhel  # liên kết project
supabase db push                                  # áp migrations lên DB
```

**Rồi 1 lần** (bắt buộc): Supabase → **Settings → API → Exposed schemas** → thêm
`play`. App phân vùng bảng vào schema riêng `play` (xem dưới), nên Data API phải
được phép truy vấn schema này.

**2. Điền env** (trong `app/`): chép `.env.example` → `.env.local`, điền
`VITE_SUPABASE_URL` và `VITE_SUPABASE_ANON_KEY` (Supabase → Project Settings → API),
rồi `npm run dev` lại.

**3. Trong game:** ⚙ (Hub) → nhập PIN → **Tài khoản & Sao lưu** → tạo tài khoản.

Mô hình (thiết kế 9.9): tài khoản của **bố mẹ**, trẻ không đăng nhập; đăng ký →
đẩy save local lên; đăng nhập máy khác → tải về. Chỉ dùng **anon key** ở frontend;
RLS đảm bảo mỗi phụ huynh chỉ thấy hồ sơ con mình. (Mặc định Supabase bật xác nhận
email — tắt ở **Auth → Providers → Email** nếu muốn đăng nhập ngay khi thử.)

### Phân vùng & scale (dùng chung DB với store `anhchistore`)

Toàn bộ bảng của app play nằm trong **schema riêng `play`** (không phải `public`),
nên **dùng chung 1 database Supabase** với store mà không đụng tên bảng. Store cứ
dùng `public` (hoặc schema `store` riêng). `auth.users` dùng chung toàn project.

- Client chỉ định `db.schema='play'` (một chỗ: `src/cloud/supabase.ts` → `DB_SCHEMA`).
- Quyền: chỉ `authenticated` được chạm schema `play`; `anon` không có quyền; RLS lọc từng dòng.
- **Tách ra project riêng khi scale**: `pg_dump -n play` từ DB chung → restore sang
  project mới, rồi đổi `VITE_SUPABASE_URL/ANON_KEY`. Vì mọi thứ gói trong 1 schema
  nên tách rất gọn (chỉ cần migrate thêm các `auth.users` liên quan).

## Deploy — Cloudflare Pages (GitHub Action)

Đẩy code lên GitHub, mỗi lần push `main` sẽ tự build & deploy lên Cloudflare Pages
qua [`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml).

**Cấu hình 1 lần:**

1. **Đăng nhập & tạo Pages project** (một lần):
   ```bash
   cd app && npx wrangler login
   npx wrangler pages project create anh-chi-bakery --production-branch=main
   ```
2. **GitHub → Settings → Secrets and variables → Actions**, thêm 4 secret:
   - `CLOUDFLARE_API_TOKEN` — token quyền *Cloudflare Pages: Edit*
   - `CLOUDFLARE_ACCOUNT_ID` — Account ID (Cloudflare dashboard)
   - `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — để build có Supabase
     (Vite inline biến lúc build; anon key an toàn để công khai)
3. **Tên miền:** Cloudflare → Pages → project → **Custom domains** → thêm
   `play.anhchistore.com` (domain `anhchistore.com` cần nằm trên Cloudflare).

Deploy thủ công: `cd app && npm run build && npx wrangler pages deploy`.

## Route dev (kiểm tra nội bộ)

- `/#gallery` — **Asset gallery**: xem toàn bộ asset SVG (tiền, Mập, bánh, khách, sticker, nội thất, cảnh) — vòng render–review (thiết kế 10.5)
- `/#selfcheck` — **Engine self-check**: property-based test cho engine sinh câu hỏi (đáp án hợp lý, không âm, chống lặp 20 câu, chẩn đoán lỗi)

## Có gì trong slice này

Vòng lặp lõi đầy đủ (thiết kế mục 4):

**Khai trương (ngày 1)** → **ngày bán hàng** (nhận đơn → làm bánh → tính tiền →
**thối tiền kéo-thả** → nghỉ trưa/nghỉ mắt 20-20-20 → tổng kết → **bóc & dán
sticker** → trang trí).

- 4 chế độ trả lời (thiết kế 3.5): chạm chọn (A1), bàn phím máy tính tiền (A4),
  kéo tờ tiền vào khay (A6 — màn S07, đầu tư nhất), xếp khay bánh (B1)
- Engine sinh câu hỏi có tham số + độ khó thích ứng + **đáp án nhiễu theo lỗi
  thật** (quên nhớ, trừ ngược cột, cộng thay vì nhân) + chẩn đoán khi gõ số
- Gợi ý 3 cấp khi sai → Mập làm mẫu; **không phạt, không màn "Sai rồi!"**
- Sticker là bằng chứng (không may rủi); bóc & dán tự do, kéo lại được
- Cửa hàng nội thất (mua bằng xu) + trang trí tiệm kéo-thả tự do
- Lưu cục bộ (localStorage) — chơi lại giữ nguyên tiến trình
- Chế độ sáng/tối ấm, bật/tắt âm thanh; tôn trọng `prefers-reduced-motion`

### Assets sinh bằng code (thiết kế 10.5)

Toàn bộ hình là **SVG generator** từ `src/design/tokens.ts` (12 màu, 2 độ dày nét,
bóng 135°, lưới 8px) — không dùng ảnh diffusion. Vân giấy phủ toàn cục bằng CSS.
Xem `src/assets/svg/`.

## Cấu trúc

```
src/
  design/tokens.ts        # nguồn chân lý style (12 màu, nét, bóng, radii, font)
  assets/svg/             # generator: Money, Cake, Map (Mập), Customer, Sticker, Furniture, Scene, paper (filters)
  engine/                 # money, questions (A1/A4/A5/A6/B1), scheduler, selfcheck
  game/                   # store (Zustand + persist), days (day plan builder)
  ui/                     # kit, MapChar, StepShell, useAttempts, sfx (Web Audio)
  screens/                # Welcome, Hub, Serve(+steps/), Lunch, Summary, Reveal, StickerBook, Shop, Decorate
  dev/                    # Gallery, SelfCheck (route kiểm tra)
  Game.tsx                # phase router
  App.tsx                 # theme/âm thanh + dev routes + Game
```

## Ngoài phạm vi slice (theo lộ trình thiết kế)

Sân khấu PixiJS + puppet (M3), Supabase sync (M2), cổng phụ huynh có PIN + báo cáo
tuần (M4), paywall (M4), 13 kỹ năng đầy đủ (M2), 48 sticker (M3). Slice này là
**cổng kiểm M1**: vòng lặp lõi có đủ hấp dẫn để bé đòi chơi lại hôm sau không?
