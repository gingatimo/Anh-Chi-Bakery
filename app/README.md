# Tiệm Bánh Anh Chi

Game toán cho bé (lớp 3–4) theo [tài liệu thiết kế](../tiem-banh-anh-chi-thiet-ke-mvp.md).
Bé làm chủ tiệm bánh, dùng toán để phục vụ khách, **làm nhiệm vụ ba mẹ giao để nhận
xu**, sưu tầm sticker và trang trí tiệm — **không đồng hồ đếm ngược, sai không mất gì**.

Vite + React + TypeScript. Toàn bộ hình ảnh **sinh bằng code (SVG)**, không dùng ảnh
diffusion. Cài được như app (**PWA**) trên điện thoại/máy tính bảng.

## Chạy

```bash
cd app
npm install
npm run dev
```

Mở link Vite in ra (mặc định http://localhost:5173).

- `npm run build` — build production (tsc + vite)
- `npm run preview` — xem bản build (service worker/PWA chỉ chạy ở bản build này)

## Dữ liệu & tài khoản (Supabase — DB-first)

**Supabase là nguồn chân lý.** Mọi thay đổi tự lưu lên đám mây (`cloud/autosave.ts`),
mở app thì tải bản mới nhất về (`pullChild`); `localStorage` chỉ là **cache** tăng
tốc/offline. Bố mẹ **đăng nhập một lần** ở onboarding rồi bé chơi (không đăng nhập
lại; phiên giữ ≥1 tháng). Chưa cấu hình Supabase (không có env) → app chạy **local**
cho dev.

Mô hình (thiết kế 9.4/9.9): tài khoản của **bố mẹ**; trẻ không có tài khoản. Một phụ
huynh có thể có **nhiều hồ sơ bé**. Chỉ dùng **anon key** ở frontend; **RLS** đảm bảo
mỗi phụ huynh chỉ thấy hồ sơ con mình.

### Thiết lập backend (chạy từ thư mục gốc repo)

```bash
supabase login
supabase link --project-ref zafafpmkbuixkpuyxhel   # project "Timo" (FREE)
supabase db push                                    # tạo schema + bảng play.child_profiles
export RESEND_API_KEY=re_xxxxxxxx                   # SMTP gửi mail xác nhận (Resend)
supabase config push                                # auth + SMTP + template mail + jwt 1 tuần
```

- **Exposed schemas**: `play` phải nằm trong Data API. Đã khai trong
  `supabase/config.toml` (`[api].schemas`) nên `config push` tự bật; nếu app báo lỗi
  `PGRST106` thì thêm tay ở Dashboard → **Settings → Data API → Exposed schemas**.
- **Env frontend**: chép `.env.example` → `app/.env.local`, điền `VITE_SUPABASE_URL`
  và `VITE_SUPABASE_ANON_KEY` (Dashboard → Project Settings → API), rồi chạy lại dev.
- **Mail xác nhận**: bật (chống bot), gửi qua **Resend** từ `no-reply@timoagency.com`,
  template tiếng Việt ở `supabase/templates/confirmation.html`.

### Phân vùng & scale (dùng chung DB với store `anhchistore`)

Toàn bộ bảng của app nằm trong **schema riêng `play`** (không phải `public`), nên
**dùng chung 1 database Supabase** với store thật mà không đụng tên bảng. `auth.users`
dùng chung toàn project.

- Client chỉ định `db.schema='play'` (một chỗ: `src/cloud/supabase.ts` → `DB_SCHEMA`).
- Quyền: chỉ `authenticated` chạm được schema `play`; `anon` không; RLS lọc từng dòng.
- **Tách project riêng khi scale**: `pg_dump -n play` từ DB chung → restore sang
  project mới, đổi `VITE_SUPABASE_URL/ANON_KEY`. Mọi thứ gói trong 1 schema nên tách gọn.

## Deploy — Cloudflare Pages (GitHub Action, theo tag)

Deploy chạy khi **push một tag phiên bản `x.y.z`** (hoặc bấm tay *Run workflow*), qua
[`.github/workflows/deploy.yml`](../.github/workflows/deploy.yml):

```bash
git tag 0.2.0 && git push origin 0.2.0   # → build + deploy lên Cloudflare Pages
```

**Cấu hình 1 lần** — GitHub → Settings → Secrets and variables → Actions, thêm 4 secret:

- `CLOUDFLARE_API_TOKEN` — token quyền *Cloudflare Pages: Edit*
- `CLOUDFLARE_ACCOUNT_ID` — Account ID (Cloudflare dashboard)
- `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY` — Vite inline lúc build (anon key an
  toàn để công khai)

Workflow tự tạo Pages project `anh-chi-bakery` nếu chưa có. **Tên miền**: Cloudflare →
Pages → project → **Custom domains** → thêm `play.anhchistore.com`.
Deploy thủ công: `cd app && npm run build && npx wrangler pages deploy`.

## PWA (cài lên màn hình chính)

- `public/manifest.webmanifest` — `standalone`, nền/theme kem `#FBF1DE`, icon 192/512
  + maskable (tạo từ favicon cupcake).
- `public/sw.js` — service worker cache **vỏ app** (mở nhanh + chạy offline phần vỏ);
  Supabase & font để mạng lo. Đăng ký **chỉ ở bản PROD** (`main.tsx`) để không phá HMR.
- Android Chrome: hiện lời mời "Cài đặt". iOS Safari: Chia sẻ → Thêm vào MH chính.

## Route dev (kiểm tra nội bộ)

- `/#gallery` — **Asset gallery**: toàn bộ asset SVG (tiền, Mập, bánh, khách, sticker, nội thất, cảnh)
- `/#selfcheck` — **Engine self-check**: property-based test cho engine sinh câu hỏi
- `/#playtest` — **Playtest**: tự chơi nhanh nhiều ngày để soi cân bằng

## Có gì trong bản này

Vòng lặp lõi (thiết kế mục 4): **Khai trương** → **ngày bán hàng** (nhận đơn → làm
bánh → tính tiền → **thối tiền kéo-thả** → nghỉ trưa/nghỉ mắt 20-20-20 → tổng kết →
**bóc & dán sticker**) → cửa hàng → trang trí.

- **Onboarding tách vai trò**: bố mẹ (đăng nhập + đặt PIN + cấu hình thời gian + chọn
  lớp) → con (đặt tên tiệm + chọn màu tạp dề). Nhiều bé → màn chọn hồ sơ.
- **Lớp học**: lớp 3/4 → độ khó + kỹ năng theo lớp; lên lớp khi thành thạo.
- Chế độ trả lời: chạm chọn (A1), bàn phím máy tính tiền (A4), kéo tiền vào khay (A6),
  xếp khay bánh (B1/B2). Độ khó thích ứng + **đáp án nhiễu theo lỗi thật** + chẩn đoán.
- Gợi ý 3 cấp khi sai → Mập làm mẫu; **không phạt, không màn "Sai rồi!"**.
- **Nhiệm vụ hằng ngày**: ba mẹ giao việc thật (chọn mẫu hoặc tự tạo) → bé báo đã làm
  → ba mẹ **duyệt** → bé nhận **xu**. Reset mỗi ngày (mốc 04:00).
- **Sticker**: 16 cột mốc (bóc–dán tự do) + **1000 sticker sưu tầm** (10 thể loại,
  sinh bằng code); **đổi xu lấy sticker** (15 xu/lần).
- **Trang trí**: ~100 đồ nội thất (mua bằng xu → kho → kéo-thả vào **7 phòng**).
- **Khu phụ huynh** (sau PIN): tiến bộ của bé, quản lý nhiệm vụ, tài khoản, cấu hình
  số lượt/ngày · độ dài buổi · nghỉ mắt, âm thanh/giao diện, xoá dữ liệu.
- **Giới hạn ngày** (mốc 04:00) + đóng cửa diegetic + "tặng thêm lượt".
- Sáng/tối ấm, bật/tắt âm thanh; tôn trọng `prefers-reduced-motion`.

### Assets sinh bằng code (thiết kế 10.5)

Toàn bộ hình là **SVG generator** từ `src/design/tokens.ts` (12 màu, 2 độ dày nét,
bóng 135°, lưới 8px). Vân giấy phủ toàn cục bằng CSS. Xem `src/assets/svg/`.

## Cấu trúc

```
src/
  design/tokens.ts        # nguồn chân lý style (12 màu, nét, bóng, radii, font)
  assets/svg/             # generator: Money, Cake, Map (Mập), Customer, Sticker, Furniture, Scene, stickerGen, furnitureGen, paper
  engine/                 # money, questions (A1/A4/A5/A6/B1/B2), scheduler, selfcheck
  cloud/                  # supabase (client), auth, sync (push/pull), autosave
  game/                   # store (Zustand + persist=cache), days (day plan), taskTemplates
  ui/                     # kit, MapChar, StepShell, useAttempts, sfx (Web Audio)
  screens/                # Welcome, Hub, Serve(+steps/), Lunch, Summary, Reveal, StickerBook,
                          #   Shop, Decorate, Tasks, TaskManager, Parent, AccountSection
  dev/                    # Gallery, SelfCheck, Playtest (route kiểm tra)
  Game.tsx                # phase router + cổng đăng nhập (DB-first)
  App.tsx                 # theme/âm thanh + autosave + tải-từ-DB + dev routes + Game
public/                   # manifest.webmanifest, sw.js, icon-*.png, favicon.svg, _redirects
```

## Trạng thái & lộ trình

Đã vượt cột mốc M1 (vòng lặp lõi) và bổ sung theo yêu cầu: tài khoản DB-first, nhiều
bé, nhiệm vụ hằng ngày, 1000 sticker, ~100 đồ trang trí, 7 phòng, PWA, deploy tự động.

**Còn theo lộ trình thiết kế:** sân khấu PixiJS + puppet (M3), báo cáo tuần chi tiết +
paywall (M4), đủ 13 kỹ năng (còn A2/A3/A7/B3–B6 — chia cần UI mới), resume giữa phiên,
xử lý xung đột đồng bộ đa thiết bị (hiện last-write-wins).
