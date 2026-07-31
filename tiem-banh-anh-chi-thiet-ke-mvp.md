# TIỆM BÁNH ANH CHI — Tài liệu thiết kế MVP

**Phiên bản:** 0.6 — asset sinh bằng AI agent qua code: generators SVG + tokens + linter + vòng render–review; bỏ Rive, chuyển puppet code-driven
**Ngày:** 30/07/2026
**Tên quốc tế (dự phòng):** Crumb & Coin
**Trạng thái:** Đang triển khai — đã vượt cột mốc M1 (vòng lặp lõi chạy end-to-end) + nhiều mở rộng. Xem [§0 Trạng thái triển khai](#0-trạng-thái-triển-khai-cập-nhật-31072026).

---

## 0. Trạng thái triển khai (cập nhật 31/07/2026)

> Tài liệu này là **tầm nhìn thiết kế** (giữ nguyên làm tham chiếu). Mục này ghi
> **thực tế đã build** và các điểm **lệch có chủ đích**. Code ở `app/` (Vite + React
> + TS); README: [`README.md`](README.md).

**Đã làm (chạy được):** vòng lặp lõi §4 (khai trương → ngày bán → làm bánh/tính
tiền/thối tiền kéo-thả → nghỉ mắt → tổng kết → bóc-dán sticker) · engine §3.3–3.5
(A1/A4/A5/A6/B1/B2, độ khó thích ứng, nhiễu theo lỗi thật) · lớp 3/4 §3.6 · giới hạn
ngày/phiên §9.7 · cổng phụ huynh §8 (PIN, báo cáo gọn, cấu hình thời gian) · onboarding
tách vai trò bố mẹ/con · trang trí §6 (kho + kéo-thả).

**Lệch CÓ CHỦ ĐÍCH so với tài liệu:**

| Mục | Thiết kế | Thực tế | Vì sao |
|---|---|---|---|
| §9.3, §9.9 | **Local-first** (cloud là lớp sao lưu) | **DB-first**: Supabase là nguồn chân lý, autosave lên cloud, `localStorage` chỉ là cache | Yêu cầu người dùng: "bỏ local-first, tất cả lưu DB" |
| §9.2, §10 | Sân khấu **PixiJS** + puppet | **DOM + SVG + Framer Motion** | Pixi hoãn M3; DOM/SVG đủ đẹp + ra sớm |
| §2 | Nhiều hồ sơ trẻ = v1.1 | **ĐÃ có** (1 phụ huynh → nhiều bé) | Làm sớm theo yêu cầu |
| §5.1 | 48 sticker (6×8) | **16 cột mốc + 1000 sticker sưu tầm** (sinh bằng code) | Yêu cầu "làm giàu asset" |
| §6, §7 | ~15 vật phẩm trang trí | **~100 vật phẩm, 7 phòng** | Yêu cầu "làm giàu đồ trang trí" |
| §10.5 | Asset qua AI-agent-code | ✅ đúng hướng: SVG generator từ `tokens.ts` | — |

**Thêm MỚI (ngoài tài liệu gốc, theo yêu cầu):**
- **Nhiệm vụ hằng ngày**: ba mẹ giao việc thật (chọn mẫu/tự tạo) → bé báo đã làm →
  ba mẹ **duyệt** → bé nhận **xu** (tiêu ở cửa hàng / đổi sticker). Reset mốc 04:00.
- **Đổi xu lấy sticker** sưu tầm (15 xu/lần).
- **PWA**: cài lên màn hình chính (manifest + icon + service worker cache vỏ).
- **Deploy tự động**: GitHub Action → Cloudflare Pages khi push tag `x.y.z`; miền
  `play.anhchistore.com`. SMTP Resend + mail xác nhận tiếng Việt; phiên đăng nhập ≥1 tháng.
- **Phân vùng DB**: bảng nằm trong schema riêng `play` (dùng chung DB với store
  `anhchistore` tương lai, tách project gọn khi scale).

**Chưa làm (theo lộ trình §12):** sân khấu Pixi + puppet (M3), báo cáo tuần chi tiết +
paywall §8.1 (M4), đủ 13 kỹ năng §3.1 (còn A2/A3/A7/B3–B6), resume giữa phiên, xử lý
xung đột đồng bộ đa thiết bị §9.5 (hiện last-write-wins), Tiệm tự do §3.6.

---

## Mục lục

1. [Tổng quan](#1-tổng-quan)
2. [Phạm vi MVP](#2-phạm-vi-mvp)
3. [Nội dung toán](#3-nội-dung-toán)
4. [Vòng lặp chính](#4-vòng-lặp-chính)
5. [Hệ thống sticker](#5-hệ-thống-sticker)
6. [Kinh tế trong game](#6-kinh-tế-trong-game)
7. [Danh sách màn hình](#7-danh-sách-màn-hình)
8. [Cổng phụ huynh](#8-cổng-phụ-huynh)
9. [Kiến trúc kỹ thuật](#9-kiến-trúc-kỹ-thuật)
10. [Nghệ thuật và pipeline asset](#10-nghệ-thuật-và-pipeline-asset)
11. [Chỉ số đo lường](#11-chỉ-số-đo-lường)
12. [Lộ trình](#12-lộ-trình)
13. [Rủi ro](#13-rủi-ro)
14. [Việc cần làm ngay](#14-việc-cần-làm-ngay)

---

## 1. Tổng quan

**Một câu:** Bé làm chủ một tiệm bánh, dùng toán để phục vụ khách, và sưu tầm sticker để trang trí tiệm của mình.

| Hạng mục | Nội dung |
|---|---|
| Đối tượng chính | Bé gái 8–10 tuổi (lớp 3–4) |
| Đối tượng phụ | Mọi học sinh tiểu học thích chơi bán hàng |
| Người trả tiền | Phụ huynh (chủ yếu là mẹ) |
| Thiết bị chính | **Desktop** — khoảng cách nhìn tốt hơn cho mắt trẻ |
| Thiết bị phụ | Tablet Android (phải chạy tốt trên máy 2–3GB RAM) |
| Kiến trúc phát hành | Lõi PWA → Tauri (desktop) + Capacitor (mobile) |
| Chế độ mạng | **Local-first.** Chơi được hoàn toàn không mạng; đồng bộ Supabase khi có |
| Thời lượng 1 phiên | **~20 phút** cho "một ngày bán hàng", có giờ nghỉ trưa ở giữa |
| Doanh thu | Miễn phí 14 ngày → thuê bao. **Không quảng cáo, không hộp quà ngẫu nhiên, không bán xu** |

### 1.1 Định vị

Hầu hết app toán trên thị trường xây quanh **tốc độ và đối kháng** — đếm ngược, bắn quái, bảng xếp hạng. Với một đứa trẻ đang lo mình "dốt toán", đồng hồ đếm ngược không tạo hứng thú mà tạo sợ hãi.

Khoảng trống ở đây không phải "toán màu hồng", mà là **toán không áp lực tốc độ**, học qua việc tạo dựng và sở hữu.

Sản phẩm định vị trung tính ("toán không áp lực, học qua sáng tạo") để không tự bó hẹp thị trường; marketing và thiết kế cảm xúc mới nhắm vào bé gái và mẹ.

### 1.2 Sáu nguyên tắc bất di bất dịch

1. **Không đồng hồ đếm ngược.** Không có bất kỳ cơ chế nào phạt vì chậm.
2. **Sai không mất gì.** Sai → được gợi ý → làm lại. Không mất tim, không mất điểm.
3. **Bé là chủ tiệm, không phải học trò.** Nhân vật hỗ trợ là bạn phụ bếp, không phải thầy giáo.
4. **Sticker là bằng chứng, không phải may rủi.** Mỗi sticker gắn với một kỹ năng cụ thể đã đạt.
5. **Bé tự quyết định thẩm mỹ.** App không tự sắp xếp, không tự dán.
6. **Không tối ưu cho thời gian sử dụng.** Hết ngày là hết, app chủ động dừng.

---

## 2. Phạm vi MVP

### Có trong MVP

- 1 tiệm bánh, nhân vật hỗ trợ **Mập** (cá mập con), avatar bé tự chọn
- **2 nhóm kỹ năng toán:** Tiền tệ Việt Nam + Nhân chia cơ bản (13 kỹ năng)
- Cây kỹ năng đủ cho **~25–30 ngày bán hàng** 20 phút; cộng "Tiệm tự do", vòng đời nội dung ~6–8 tuần với mặc định 1 ngày/ngày
- 6 bộ sticker × 8 = 48 sticker, sổ sticker kéo dán tự do
- Màn trang trí tiệm với ~15 vật phẩm
- Độ khó thích ứng theo từng kỹ năng
- Hệ thống giới hạn thời gian theo phiên và theo ngày
- Cổng phụ huynh: báo cáo tuần, cài đặt, xuất/xoá dữ liệu
- Đồng bộ đa thiết bị qua Supabase
- **Chế độ khách:** chơi ngay không cần tài khoản, liên kết sau (mục 9.9)
- **Tiệm tự do:** chế độ ôn tập không giới hạn sau khi hết cây kỹ năng (mục 3.6)
- Paywall thân thiện, chỉ hướng tới phụ huynh (mục 8.1)

### KHÔNG có trong MVP

Ghi rõ để chống scope creep:

- ❌ Phân số (v1.1)
- ❌ Hình học, đo lường, xem giờ (v1.2)
- ❌ Môn Tiếng Việt / Tiếng Anh
- ❌ PvP, bảng xếp hạng, bạn bè, guild/lớp học
- ❌ Cổng giáo viên
- ❌ Chấm bài bằng AI, nhận diện chữ viết tay
- ✅ Nhiều hồ sơ trẻ trên một tài khoản (ĐÃ làm sớm — xem [§0](#0-trạng-thái-triển-khai-cập-nhật-31072026))
- ❌ Lồng tiếng (dùng chữ + biểu tượng)
- ❌ iOS/iPad (v1.1)

---

## 3. Nội dung toán

> ⚠️ **Cần xác thực:** Phần ánh xạ dưới đây là bản nháp dựa trên khung GDPT 2018. Trước khi sản xuất nội dung, đối chiếu với sách giáo khoa thực tế (Cánh Diều / Kết nối tri thức / Chân trời sáng tạo) — thứ tự bài học khác nhau giữa các bộ. Nên nhờ một giáo viên tiểu học rà soát.

### 3.1 Cây kỹ năng

**Nhóm A — Tiền tệ.** Trục chính, vì trùng với hành vi "chơi bán hàng" mà trẻ đã tự nguyện làm ngoài đời.

| ID | Kỹ năng | Lớp | Ví dụ |
|---|---|---|---|
| A1 | Nhận biết mệnh giá | 3 | Đây là tờ bao nhiêu? |
| A2 | Cộng tiền không nhớ | 3 | 12.000 + 5.000 |
| A3 | Cộng tiền có nhớ | 3 | 18.000 + 7.000 |
| A4 | Tổng đơn hàng 2–3 món | 3 | 15.000 + 12.000 + 8.000 |
| A5 | Trừ để thối tiền | 3 | Khách đưa 50.000, hết 32.000 |
| A6 | Chọn tổ hợp tờ tiền để thối | 3–4 | 18.000 = 10 + 5 + 2 + 1 |
| A7 | Ước lượng, làm tròn | 4 | Đủ 100.000 mua được gì? |

**Nhóm B — Nhân chia.** Trục phụ, dùng ở khâu làm bánh.

| ID | Kỹ năng | Lớp | Ví dụ |
|---|---|---|---|
| B1 | Bảng nhân 2–5 | 3 | 4 khay × 6 bánh |
| B2 | Bảng nhân 6–9 | 3 | 7 hộp × 8 bánh |
| B3 | Chia trong bảng | 3 | 24 bánh chia 4 hộp |
| B4 | Nhân số 2 chữ số với 1 chữ số | 3–4 | Công thức ×3 |
| B5 | Chia có dư | 4 | 26 bánh, hộp 6 cái, thừa mấy? |
| B6 | Nhân với số tròn chục | 4 | 12 × 20 |

**Mở khoá:** B*n* mở khi B*(n−1)* đạt mastery. Hai nhóm tiến song song; mỗi ngày bán hàng trộn cả hai.

### 3.2 Tiền tệ dùng trong game

Chỉ dùng **tiền giấy polymer đang lưu hành**: 1.000 / 2.000 / 5.000 / 10.000 / 20.000 / 50.000 / 100.000 / 200.000 / 500.000.

- Giai đoạn đầu giới hạn ≤ 50.000, về sau mở dần lên 200.000
- Không dùng tiền xu (trẻ ngoài đời không gặp)
- Giá bánh luôn là **bội số của 1.000**

### 3.3 Sinh câu hỏi bằng thuật toán

Quyết định quan trọng nhất của phần nội dung. Viết tay 40 ngày × 12 câu = 480 câu là không bền, không thích ứng được, và không mở rộng sang phân số sau này.

Mỗi kỹ năng là một **template có tham số**:

```
Kỹ năng A5 — Trừ để thối tiền
  Tham số:
    tong_don   : bội số 1000, trong [min, max] theo cấp độ
    to_khach   : mệnh giá nhỏ nhất > tong_don (hoặc lớn hơn 1 bậc)
  Sinh ra:
    "Đơn hàng {tong_don}đ. Khách đưa tờ {to_khach}đ. Thối lại bao nhiêu?"
  Đáp án: to_khach − tong_don

  Cấp 1: tong_don ∈ [5.000, 20.000],  to_khach ∈ {20.000, 50.000}
  Cấp 2: tong_don ∈ [10.000, 45.000], to_khach ∈ {50.000}
  Cấp 3: tong_don ∈ [20.000, 90.000], to_khach ∈ {100.000}
  Cấp 4: có số lẻ nghìn, to_khach ∈ {100.000, 200.000}
```

**Ràng buộc bắt buộc:**

- Không lặp câu đã hỏi trong 20 câu gần nhất
- Đáp án luôn hợp lý về ngữ cảnh (không có "thối lại −3.000đ")
- Đáp án nhiễu phải là **lỗi thật trẻ hay mắc**, không phải số ngẫu nhiên:
  - Quên nhớ khi cộng
  - Trừ ngược từng cột (lấy nhỏ trừ lớn)
  - Lệch một hàng đơn vị (3.000 vs 30.000)

Danh mục lỗi này phục vụ hai việc. Với câu **chạm chọn**, nó sinh đáp án nhiễu. Với câu **nhập số**, nó dùng để **chẩn đoán**: nếu bé gõ đúng giá trị của một lỗi đã biết (gõ 22.000 cho 50.000 − 32.000 = trừ ngược từng cột), gợi ý cấp 1 nhắm thẳng vào lỗi đó thay vì gợi ý chung. Đây là nâng cấp sư phạm lớn nhất mà engine sinh câu hỏi mang lại.

### 3.4 Độ khó thích ứng

Mỗi kỹ năng có `level` (1–5) riêng cho mỗi bé.

```
Đúng liên tiếp 4 câu ở level N   → lên level N+1
Sai 2 trong 3 câu gần nhất       → xuống level N−1 (sàn = 1)
Mastery                          → level ≥4 và ≥90% đúng trong 10 câu gần nhất
Mastery → trao sticker của kỹ năng, mở kỹ năng kế tiếp
```

**Ôn tập xen kẽ:** mỗi ngày chèn 2 câu từ kỹ năng đã mastery ≥7 ngày trước. Sai → hạ level kỹ năng đó xuống 3, đưa lại vào vòng luyện. Chống học vẹt và quên nhanh.

**Chống đoán bừa:** trả lời đúng dưới 1,2 giây ở câu cần tính toán thì không tính vào chuỗi thăng cấp — nhưng vẫn cho đúng, không phạt gì cả.

### 3.5 Chế độ trả lời theo kỹ năng

Toán chỉ "là gameplay" khi thao tác trả lời mô phỏng hành động thật trong tiệm. Nếu mọi câu hỏi đều là trắc nghiệm với hình bánh trang trí, sản phẩm chỉ là phiếu bài tập khoác áo game.

| Chế độ | Mô phỏng | Dùng cho | Màn |
|---|---|---|---|
| **Chạm chọn** | Nhận biết | A1, A7, ôn tập xen kẽ | S04/S06 |
| **Bàn phím máy tính tiền** | Bấm máy tính tiền thật | A2–A5, nhóm B ở level cao | S06 |
| **Kéo tờ tiền** | Đếm tiền thối | A6; giai đoạn sau gộp A5+A6 thành "phục vụ trọn gói" | S07 |
| **Kéo khay / hộp / bánh** | Xếp bánh, đóng hộp | B1–B3, B5 | S05 |

Quy tắc "không gõ số" chỉ áp dụng cho S07 — máy tính tiền có bàn phím là điều tự nhiên, khay thối tiền thì không.

**Scaffold theo level:** level thấp hiện hình đầy đủ (4 khay × 6 bánh nhìn thấy được, đếm được); level cao bỏ dần hình, chỉ còn phép tính. Cùng một template, hai mức trừu tượng.

**Chia có dư (B5) là món quà của thiết kế diegetic:** bé kéo 26 bánh vào các hộp 6 cái — số bánh **nằm ngoài hộp chính là số dư**. Không cần giải thích khái niệm, bé nhìn thấy nó.

### 3.6 Phân theo lớp và khi hết nội dung

**Phân lớp:** mỗi kỹ năng gắn nhãn lớp (bảng 3.1). Hồ sơ trẻ có trường `lop`; kỹ năng lớp trên chỉ mở khi toàn bộ kỹ năng lớp hiện tại đạt mastery. Phụ huynh có thể khoá/mở thủ công trong cổng, nhưng mặc định không cần can thiệp. Kỹ năng gắn nhãn kép "3–4" xếp vào lớp 3 cho mục đích mở khoá; cổng lớp chỉ chặn kỹ năng thuần lớp 4 (A7, B5, B6).

**Khi hết cây kỹ năng — "Tiệm tự do":** ngày bán hàng vẫn diễn ra bình thường, trộn ôn tập tất cả kỹ năng đã học, đơn hàng nhiều món hơn, sticker mùa (bộ 4) tiếp tục theo lịch, và ngày Tiệm tự do vẫn tuân đầy đủ giới hạn thời gian (9.7). Cổng phụ huynh hiển thị trung thực: *"Bé đã hoàn thành chương trình hiện tại — nội dung mới sẽ đến trong bản cập nhật."* Nội dung MVP đủ cho 4–6 tuần; D30 phụ thuộc trực tiếp vào chế độ này, đừng làm nó qua loa.

---

## 4. Vòng lặp chính

### 4.1 Một "ngày bán hàng" (~20 phút)

```
1. MỞ TIỆM        Mập chào, xem tiệm mình hôm nay
                  (~1 phút, bỏ qua được)

2. BUỔI SÁNG      3–4 khách (~8 phút)
   Mỗi khách:
     a. Nhận đơn      → đọc yêu cầu, chọn món trên kệ
     b. Làm bánh      → 1–2 câu nhóm B (nhân/chia)
     c. Tính tiền     → 1 câu nhóm A (tổng đơn)
     d. Thối tiền     → kéo tờ tiền vào khay
     e. Khách vui, trả xu

3. GIỜ NGHỈ TRƯA  (~1–2 phút) Beat nhẹ KHÔNG có toán:
                  cho Mập ăn, chọn món đặc biệt ngày mai…
                  Mở đầu bằng cảnh nghỉ mắt: Mập rủ bé nhìn ra
                  cửa sổ tiệm 20 giây (đúng nhịp 20-20-20 — xem 9.6)

4. BUỔI CHIỀU     3–4 khách (~8 phút), đơn hàng nhỉnh hơn buổi sáng

5. ĐÓNG CỬA       Tổng kết: hôm nay đón mấy khách, kiếm bao nhiêu xu

6. PHONG BÌ       Mở phong bì sticker (nếu có sticker mới — mastery hoặc cột mốc)
   STICKER        → hoạt ảnh bóc → bé kéo dán vào sổ

7. TRANG TRÍ      (tuỳ chọn) Mua đồ, sắp xếp lại tiệm
                  Không giới hạn thời gian, nhưng sau 15 phút liên tục
                  có nhắc nhẹ bỏ qua được (Mập ngáp: "mai trang trí tiếp nha?")

8. HẸN MAI        Mập hé lộ: "Mai có đơn bánh sinh nhật đấy!"
```

**Tổng 24–32 câu hỏi mỗi ngày, chia đều hai buổi.** Nếu bé sai nhiều, số câu KHÔNG tăng — độ khó giảm. Ngày luôn kết thúc trong khoảng thời gian dự kiến.

**Chống mệt mỏi — "ngày vắng khách":** 20 phút nằm ở mép trên sức tập trung của lứa 8 tuổi với bài tập cần cố gắng, nên phiên phải biết tự co. Nếu độ chính xác buổi chiều sụt mạnh so với buổi sáng (dưới ~50% trên 6 câu gần nhất), buổi chiều lặng lẽ bớt một khách — Mập bảo "hôm nay vắng khách ghê". Không bao giờ đóng khung là hình phạt; ngày vẫn tính đủ, xu vẫn nhận.

### 4.2 Xử lý khi sai

```
Sai lần 1 → Khách nghiêng đầu bối rối (không buồn, không đỏ)
            Gợi ý cấp 1: gợi nhớ quy tắc
            "Nhớ nhé, cộng hàng nghìn trước"

Sai lần 2 → Gợi ý cấp 2: chia nhỏ bài toán
            Hiện phép tính từng bước, bé điền chỗ trống

Sai lần 3 → Mập làm mẫu, bé làm theo
            Vẫn tính là hoàn thành, vẫn nhận xu (ít hơn)
            Ghi log để đưa vào báo cáo phụ huynh
```

Không bao giờ có màn hình "Sai rồi!" toàn màn đỏ.

### 4.3 Ngày đầu tiên — "Khai trương" (dưới 5 phút)

Ngày 1 quyết định có ngày 2 hay không, và nó phải được thiết kế riêng, không phải "ngày thường nhưng dễ hơn".

```
- 1 khách duy nhất (bạn của Mập). Mập làm mẫu từng bước — "làm theo tớ nhé"
- 2 tương tác cực dễ: nhận đúng tờ 10.000 (A1) + xếp 6 bánh lên khay
- Không menu, không lựa chọn nhánh. Nút duy nhất cần bấm luôn phát sáng
- Mỗi bong bóng thoại ≤ 1 câu
- Kết thúc: sticker "Khai trương" (cột mốc, đảm bảo 100%) → bé tự bóc, tự dán lần đầu
- Tặng 1 vật trang trí nhỏ miễn phí → bé đặt vào tiệm
```

Nguyên tắc: bé phải chạm vào **cả ba trụ** — phục vụ khách, sticker, trang trí — ngay trong ngày đầu. Sticker "Khai trương" không vi phạm quy tắc "sticker là bằng chứng" vì nó là cột mốc thật: mở tiệm.

**Dốc khởi động:** ngày 1 dưới 5 phút; ngày 2–3 là bản rút gọn (~10 phút, 3 khách, chưa có giờ nghỉ trưa); từ ngày 4 mới vào nhịp 20 phút đầy đủ. Đừng ném bé vào phiên dài ngay.

---

## 5. Hệ thống sticker

### 5.1 Cấu trúc

**6 bộ × 8 sticker = 48.** Mỗi bộ một trang riêng trong sổ, có nền vẽ sẵn.

| Bộ | Chủ đề | Điều kiện tiêu biểu |
|---|---|---|
| 1 | Nguyên liệu | Mastery A1–A3 + cột mốc luyện tập nhóm A |
| 2 | Bánh ngọt | Mastery B1–B3 + cột mốc "nướng N mẻ bánh" |
| 3 | Khách quen | Tổng khách phục vụ, chuỗi ngày liên tiếp |
| 4 | Mùa & lễ hội | Sự kiện theo lịch (Trung thu, Tết…) |
| 5 | Dụng cụ bếp | Mastery B4–B6 + cột mốc nhóm B |
| 6 | Huy hiệu tiệm | Mastery A5–A7 + thành tích "Tiệm tự do" |

**Hạch toán nguồn** — 13 kỹ năng không thể lấp 48 ô, nên nguồn phải hỗn hợp và được đếm rõ:

```
13  mastery kỹ năng
15  cột mốc tiệm (khách phục vụ, mẻ bánh, xu tích luỹ, chuỗi ngày, món trang trí)
 8  mùa & lễ hội — theo lịch thật, kéo dài ra ngoài 40 ngày MVP
12  thành tích "Tiệm tự do" — giữ nhịp sau khi hết cây kỹ năng
──
48
```

Trong cung 40 ngày đầu bé đạt được **~28–32 sticker**. Sổ còn chỗ trống là **cố ý** — khoảng trống nhìn thấy được chính là lời mời quay lại.

### 5.2 Quy tắc trao

- **Nguồn duy nhất:** đạt mastery một kỹ năng, hoặc cột mốc rõ ràng (7 ngày liên tiếp, phục vụ 50 khách…)
- **Không ngẫu nhiên.** Bé luôn biết mình đang tiến tới sticker nào
- Màn bộ sưu tập hiện **bóng mờ** sticker chưa có, kèm dòng "Đạt được khi thành thạo phép chia trong bảng"
- Nhịp ~1 sticker mỗi ngày chơi, thỉnh thoảng 2 (ngày 20 phút dày câu hỏi hơn nên mastery đến nhanh hơn). Dày hơn nữa sẽ mất giá trị

### 5.3 Yêu cầu về cảm giác (không được cắt)

- **Bóc:** kéo ngón tay/chuột, sticker cong lên theo, âm thanh giấy dính
- **Dán:** bé tự chọn vị trí và góc xoay, thả xuống có rung nhẹ (nơi hỗ trợ)
- Đã dán vẫn di chuyển lại được — không khoá cứng
- Phóng to trang sổ để ngắm được

---

## 6. Kinh tế trong game

Cố tình giữ đơn giản để không biến thành game quản lý.

| Yếu tố | Thiết kế |
|---|---|
| Đơn vị | "Xu" — khác tiền VNĐ trong bài toán, tránh nhầm lẫn |
| Nguồn thu | 5–15 xu/khách, thưởng thêm khi đúng ngay lần đầu |
| Chi tiêu | Vật phẩm trang trí: 30–200 xu |
| Số vật phẩm MVP | 15 (bàn ghế, rèm, chậu cây, biển hiệu, đèn, tranh tường…) |
| Nhịp độ | Mỗi 2–3 ngày mua được 1 món |
| **Không có** | Hết năng lượng, chờ hồi, mua xu bằng tiền thật, vật phẩm giới hạn thời gian |

Xu **không bao giờ mua được bằng tiền thật.** Đây là ranh giới đạo đức, và cũng là điểm bán hàng với phụ huynh.

---

## 7. Danh sách màn hình

| # | Màn hình | Ghi chú |
|---|---|---|
| S01 | Khởi động / chọn hồ sơ | MVP 1 hồ sơ, UI sẵn cho nhiều |
| S02 | Tạo nhân vật | Tóc, da, tạp dề ~8 lựa chọn mỗi loại. Bé tự đặt tên tiệm (mặc định "Tiệm Bánh Anh Chi") |
| S03 | Tiệm bánh (hub) | Màn chính: Mở cửa / Sổ sticker / Cửa hàng |
| S04 | Nhận đơn hàng | Khách + bong bóng thoại + kệ bánh |
| S05 | Làm bánh | Nhóm B — kéo khay/hộp/bánh, scaffold theo level (mục 3.5) |
| S06 | Quầy tính tiền | Nhóm A — bàn phím máy tính tiền cỡ lớn (mục 3.5) |
| S07 | **Khay thối tiền** | Kéo thả tờ tiền — không gõ số |
| S08 | Tổng kết ngày | Số khách, xu kiếm được |
| S09 | Mở phong bì sticker | Chỉ hiện khi có sticker |
| S10 | Sổ sticker | 6 trang, vuốt ngang, kéo dán tự do |
| S11 | Cửa hàng nội thất | Lưới vật phẩm, giá bằng xu |
| S12 | Chế độ trang trí | Kéo thả trong tiệm, xoay, xoá |
| S13 | Cổng phụ huynh | Mở bằng PIN 4 số |
| S14 | Cài đặt | Âm thanh, giới hạn thời gian, dữ liệu |

**S07 là màn đáng đầu tư nhất.** Kéo tờ tiền vào khay là cơ chế cốt lõi và cũng là thứ giống "chơi bán hàng" ngoài đời nhất. Đừng thay bằng bàn phím số. Trên desktop, bàn phím vật lý dùng được ở S06 (máy tính tiền có bàn phím là điều tự nhiên); **S07 vẫn kéo-thả thuần trên mọi nền tảng** — ghép tờ tiền chính là kỹ năng A6, gõ số sẽ triệt tiêu nó.

**Bố cục:** desktop dùng layout ngang, tablet dùng layout dọc. Đây là **hai thiết kế màn hình khác nhau**, không phải một layout co giãn — nhớ tính vào khối lượng công việc.

---

## 8. Cổng phụ huynh

Mở bằng PIN 4 số.

**Báo cáo tuần**
- Số ngày đã chơi, tổng thời gian
- Bảng kỹ năng: Đang học / Đã thành thạo / Đang gặp khó
- 3 dạng bài sai nhiều nhất, kèm ví dụ cụ thể
- Một gợi ý hành động: *"Bé hay nhầm khi cộng có nhớ. Thử cùng bé đếm tiền lẻ khi đi chợ."*

**Cài đặt**
- Giới hạn thời gian — chi tiết ở mục 9.7
- Bật/tắt nhắc nhở và nhắc nghỉ 20-20-20
- Xuất dữ liệu ra JSON, xoá toàn bộ dữ liệu

**Ngôn ngữ báo cáo:** tránh xếp hạng và so sánh với trẻ khác. Nói về tiến bộ của chính bé. Không dùng từ tạo lo lắng ("tụt hậu", "kém hơn bạn bè").

### 8.1 Thuê bao và paywall

Nguyên tắc nền: **trẻ không bao giờ thấy màn hình thanh toán hay giá tiền.** Mọi thứ liên quan đến tiền thật nằm sau PIN trong cổng phụ huynh.

Khi hết 14 ngày dùng thử:

- Tiệm treo biển nhẹ nhàng: *"Tiệm nghỉ vài hôm — chờ bố mẹ nhé"* — diegetic, không phải màn hình khoá
- **Sổ sticker và việc ngắm/sắp xếp tiệm VẪN MỞ.** Không bao giờ lấy lại thứ bé đã đạt được — vừa là đạo đức, vừa giữ lý do quay lại sau khi phụ huynh đăng ký
- Chỉ "mở cửa đón khách" (nội dung học mới) cần thuê bao

**Nhịp trial ↔ nội dung:** với mặc định 1 ngày bán hàng/ngày, bé chạm paywall ở ngày 14 khi mới đi được ~nửa cây kỹ năng — hết trial **trước** khi hết nội dung là cố ý: phụ huynh ra quyết định khi đà học đang hiện rõ và phần giá trị lớn còn ở phía trước.

Kênh thanh toán:

| Kênh phát hành | Thanh toán |
|---|---|
| CH Play | Google Play Billing — **bắt buộc** theo chính sách, kiểm tra thêm yêu cầu của chương trình Families |
| Desktop / web | Cổng thanh toán web: ưu tiên nội địa (MoMo / ZaloPay / chuyển khoản) vì thẻ quốc tế ít phổ biến ở VN; license gắn tài khoản phụ huynh |

Giá: **TBD** — khảo sát mức sẵn lòng chi ở M5, neo theo các app học phổ biến tại Việt Nam. Một thuê bao dùng cho nhiều hồ sơ con (khi v1.1 mở nhiều hồ sơ).

---

## 9. Kiến trúc kỹ thuật

### 9.1 Nền tảng

Lõi PWA, bọc lại để ra nhiều nền tảng từ một codebase:

| Kênh | Cách phát hành | Ưu tiên |
|---|---|---|
| Desktop (Win/macOS) | Tauri | **P0** — lý do sức khoẻ mắt, xem 9.6 |
| Tablet Android | Capacitor → CH Play | P0 — nơi phụ huynh VN thật sự tìm app |
| Web/PWA | Cài từ trình duyệt | P1 — gửi link cho gia đình test nhanh |
| iPad | Capacitor → App Store | v1.1 — ngoài MVP |

### 9.2 Stack

| Lớp | Công nghệ | Ghi chú |
|---|---|---|
| UI, chữ, menu, báo cáo | React + TypeScript (DOM) | Chữ tiếng Việt phải là DOM, không phải sprite |
| Sân khấu game | PixiJS (WebGL) | Sprite, kéo thả, particle |
| Nhân vật & sticker | Puppet code-driven trên Pixi: bộ phận SVG + tween TS; MeshPlane cho bóc sticker | Không cần runtime hoạt hình riêng — xem 10.5 |
| Âm thanh | Howler.js | |
| Lưu cục bộ | IndexedDB (Dexie) | **Nguồn ghi đầu tiên, luôn luôn** |
| Đồng bộ & backup | Supabase (Postgres + Auth) | Nguồn chân lý giữa các thiết bị |
| Vỏ desktop | Tauri | Nhẹ hơn Electron nhiều |
| Vỏ mobile | Capacitor | |
| Telemetry sản phẩm | PostHog self-host, hoặc bảng riêng trên Supabase | `install_id` ngẫu nhiên, **không gắn** hồ sơ trẻ — xem 11.1 |

> **Không dùng Flutter/Flame.** Flutter web tải WASM nặng, render chữ kém, không hợp game này.

### 9.3 Nguyên tắc local-first

> ⚠️ **ĐÃ ĐỔI (31/07/2026, xem [§0](#0-trạng-thái-triển-khai-cập-nhật-31072026)):** bản
> hiện tại theo **DB-first** — Supabase là nguồn chân lý (autosave lên cloud, tải về
> khi mở), `localStorage` chỉ còn là **cache**. Có Supabase mà chưa đăng nhập thì bắt
> login (không cho chơi bằng cache). Phần dưới là thiết kế local-first gốc, giữ để tham chiếu.

**Gameplay không bao giờ chờ mạng.** Ràng buộc cứng.

```
Bé trả lời câu hỏi
   → ghi ngay vào IndexedDB       (đồng bộ, <5ms, UI phản hồi tức thì)
   → đẩy vào hàng đợi sync
   → cuối phiên, gửi cả lô lên Supabase
   → Supabase lỗi/mất mạng? Giữ hàng đợi, thử lại lần sau
```

**Tuyệt đối không gọi mạng giữa các câu hỏi.** Ghi từng câu lên cloud sẽ tạo độ trễ đúng khoảnh khắc quan trọng nhất — lúc bé vừa làm đúng và đang chờ phản hồi.

**Supabase sập thì game vẫn phải chơi được.** Cloud là lớp sao lưu và đồng bộ, không phải điều kiện để chạy.

Ba lý do vẫn cần Supabase dù đã local-first:

1. **Chơi trên hai thiết bị.** Desktop + tablet, không có cloud thì thành hai sổ sticker riêng
2. **Chống mất dữ liệu.** Trình duyệt được phép xoá IndexedDB. Mất 48 sticker là mất người dùng
3. **Cổng phụ huynh trên điện thoại** trong khi bé chơi ở máy khác

### 9.4 Mô hình dữ liệu

```sql
-- Tài khoản do PHỤ HUYNH tạo. Trẻ không có tài khoản riêng.
parent_account(
  id uuid,              -- = auth.users.id của Supabase
  email, created_at, subscription_status, trial_started_at
)

child_profile(
  id uuid, parent_id uuid,
  ten_hien_thi,         -- biệt danh tự do, KHÔNG phải tên thật
  avatar_config_json, ten_tiem, lop, created_at, updated_at
)

skill_state(
  child_id, skill_id, level, mastered_at,
  correct_streak, recent_results_json,
  updated_at, device_id
)

question_attempt(       -- append-only, không bao giờ sửa
  id uuid, child_id, skill_id, template_id,
  params_json, dap_an, tra_loi, dung,
  so_lan_thu, thoi_gian_ms, created_at
)

sticker_owned(
  child_id, sticker_id, earned_at,
  page, pos_x, pos_y, rotation, updated_at
)

shop_state(
  child_id, xu, items_json, updated_at, device_id
)

counters(               -- bộ đếm tích luỹ nuôi cột mốc sticker (5.1)
  child_id, key, value, updated_at
  -- key: 'khach_tong', 'me_banh', 'xu_tich_luy', 'chuoi_ngay'…
)

play_session(
  id uuid, child_id, bat_dau, ket_thuc,
  so_khach, so_cau, so_cau_dung, device_id
)

daily_usage(            -- cưỡng chế giới hạn thời gian, xem 9.7
  child_id, ngay, so_ngay_ban_hang, giay_hoat_dong, updated_at
)

sync_queue(             -- CHỈ ở IndexedDB, không lên cloud
  id, table_name, op, payload_json, created_at, retry_count
)
```

`question_attempt` là bảng quan trọng nhất — vừa nuôi thuật toán thích ứng, vừa sinh báo cáo phụ huynh. Ghi đầy đủ ngay từ đầu, kể cả trường chưa dùng tới.

**RLS bắt buộc bật trên mọi bảng, ngay từ ngày đầu:**

```sql
create policy "parent_owns_child" on child_profile
  for all using (parent_id = auth.uid());

create policy "parent_owns_child_data" on skill_state
  for all using (
    child_id in (select id from child_profile where parent_id = auth.uid())
  );
```

### 9.5 Giải quyết xung đột

| Bảng | Chiến lược |
|---|---|
| `question_attempt` | Append-only, không xung đột. Gửi cả lô cuối phiên |
| `skill_state` | Last-write-wins theo `updated_at`. Dùng **giờ máy chủ**, không tin đồng hồ thiết bị |
| `sticker_owned` | **Hợp nhất, không ghi đè.** Đã sở hữu thì không bao giờ mất. Vị trí dán lấy bản mới nhất |
| `shop_state` | Thay nguyên khối theo `updated_at`. Chấp nhận hiếm khi mất một lần sắp xếp |
| `counters` | Lấy **max** theo từng key. Chấp nhận đếm thiếu hiếm gặp khi hai máy cùng tăng offline — nhất quán với `daily_usage` |
| `daily_usage` | Lấy **giá trị lớn hơn**, không cộng dồn |

Không dùng Realtime của Supabase cho MVP — không có tính năng nhiều người cùng lúc.

### 9.6 Thiết kế cho sức khoẻ mắt

Lý do desktop được ưu tiên P0, và cũng là điểm bán hàng mạnh với phụ huynh Việt Nam.

Cơ chế chính là **khoảng cách nhìn**: màn hình desktop cách mắt 50–70cm, trong khi tablet thường bị cầm ở 25–30cm, đặc biệt khi trẻ nằm chơi.

- **Chữ tối thiểu 18px** ở desktop, tương phản cao. Không chữ mảnh, không xám nhạt trên trắng
- **Một ngày bán hàng ~20 phút, có giờ nghỉ trưa chia đôi**, app chủ động dừng khi hết ngày — đòn bẩy mạnh hơn cả việc chọn nền tảng
- **Nghỉ mắt tích hợp vào giờ nghỉ trưa** ở phút thứ ~10 của mỗi ngày bán hàng: Mập rủ bé nhìn ra cửa sổ tiệm 20 giây — đúng nhịp 20-20-20 mà không cần hiện đồng hồ. Cảnh này không bỏ qua được: ngắn đủ để không gây khó chịu, dài đủ để mắt được nghỉ. Ngoài giờ bán hàng, **thời gian liên tục trước màn hình** (trang trí, sổ sticker) vẫn được theo dõi để nhắc bổ sung
- **Chế độ tối / ánh sáng ấm** cho buổi tối
- **Không nhấp nháy nhanh, không màu bão hoà cao** trên nền lớn
- Trong cổng phụ huynh: gợi ý khoảng cách ngồi, và nhắc rằng **thời gian chơi ngoài trời là yếu tố bảo vệ mạnh nhất** với cận thị ở trẻ

### 9.7 Giới hạn thời gian

Đây là **tính năng bán hàng**, không phải hạn chế. Phụ huynh chọn app *vì* nó biết dừng.

#### Đơn vị hiển thị cho bé là KHÁCH, không phải PHÚT

Nguyên tắc số 1 là không tạo áp lực thời gian. Một đồng hồ đếm ngược sẽ phá vỡ chính nguyên tắc đó — bé sẽ đoán bừa cho kịp giờ.

- **Bé thấy:** "Hôm nay tiệm mình đón 7 khách" — cụ thể, đoán trước được, không gây lo
- **Phụ huynh đặt:** số ngày bán hàng / ngày thật, và khung giờ được phép
- Không bao giờ hiện đồng hồ, thanh thời gian, hay số phút còn lại cho bé

#### Kết thúc mà không gây khóc

Phần khó nhất. Nếu app gây cãi vã giữa mẹ và con, app sẽ bị gỡ.

```
Trước khách cuối   → "Khách cuối hôm nay rồi nhé!"
                     Báo trước, không bao giờ cắt bất ngờ

Hết khách          → Tiệm đóng cửa (diegetic, không phải thông báo hệ thống)
                     KHÔNG dùng: "Hết giờ chơi"
                     DÙNG:       "Tiệm đóng cửa rồi, mai mình mở lại nhé"

Sau đó vẫn có      → Mở sticker + trang trí tiệm
                     Phần thưởng nằm SAU giới hạn, không bị cắt mất
                     Ngân sách thời gian đã tính cả phần này

Cuối cùng          → Mập hé lộ ngày mai
```

**Ba điều tuyệt đối không làm:**

1. **Không cắt giữa câu hỏi.** Luôn kết ở ranh giới tự nhiên
2. **Không đổi toán lấy thời gian chơi.** "Giải thêm 10 câu để chơi thêm" biến việc học thành tiền tệ mua screen time, và khuyến khích làm ẩu
3. **Không trách móc.** Hết lượt không phải là bị phạt

#### Cài đặt cho phụ huynh

| Thiết lập | Mặc định |
|---|---|
| Số ngày bán hàng / ngày thật | **1** (~20 phút) |
| Khung giờ được phép | 06:00–20:00 |
| Khác biệt cuối tuần | Tắt (bật thì cho 2) |
| Nhắc nghỉ 20-20-20 | Bật |
| Tặng thêm 1 lượt | Cần PIN, **có ghi log** vào báo cáo tuần |

Ghi log việc tặng thêm lượt là cố ý: để phụ huynh tự nhìn thấy tần suất mình nhượng bộ.

#### Tình huống biên bắt buộc xử lý

| Tình huống | Cách xử lý |
|---|---|
| **Tắt app giữa chừng rồi mở lại** | **Tiếp tục phiên cũ.** Nếu tính phiên mới, bé sẽ học được mẹo tắt app để reset |
| **Chơi trên hai thiết bị** | Tính theo **hồ sơ trẻ trên Supabase**, không theo thiết bị |
| **Đang offline** | Cưỡng chế bằng dữ liệu cục bộ. Khi đồng bộ lấy **giá trị lớn hơn**, không cộng dồn, không để số nhỏ ghi đè |
| **Bé chỉnh giờ máy** | Ưu tiên giờ máy chủ. Offline thì phát hiện đồng hồ nhảy bất thường và giữ nguyên bộ đếm |
| **Ranh giới "một ngày"** | Reset lúc **04:00 giờ địa phương**, không phải nửa đêm |
| **Bé bỏ đi giữa chừng** | Tính **thời gian hoạt động thật**, tạm dừng khi mất focus hoặc không thao tác >60 giây |
| **Ngồi lì ở chế độ trang trí** | Không tính vào số ngày bán hàng, nhưng **có** tính vào `giay_hoat_dong`; kích hoạt nhắc 20-20-20 và nhắc nhẹ sau 15 phút |
| **Ngoài khung giờ cho phép** | Tiệm treo biển "đang nghỉ" (diegetic). Mọi chế độ đóng, **kể cả trang trí** — tôn trọng ý định của phụ huynh |

### 9.8 Quyền riêng tư và pháp lý

- Không thu thập tên thật, ảnh, vị trí, danh bạ của trẻ
- Chỉ phụ huynh có tài khoản; hồ sơ trẻ dùng biệt danh tự do
- Telemetry sản phẩm dùng `install_id` ngẫu nhiên, không gắn hồ sơ trẻ, tắt được hoàn toàn; tắt **không ảnh hưởng** gameplay, thích ứng hay báo cáo phụ huynh (hai dòng dữ liệu tách biệt — 11.1)
- Nút **xuất dữ liệu JSON** và **xoá toàn bộ dữ liệu** trong cổng phụ huynh

> ⚠️ **Cần luật sư rà trước khi phát hành.** Lưu dữ liệu trẻ em trên cloud làm thay đổi đáng kể nghĩa vụ pháp lý. Xem xét **Nghị định 13/2023** (bảo vệ dữ liệu cá nhân, có quy định riêng về dữ liệu trẻ em và sự đồng ý của cha mẹ) và **Nghị định 53/2022** (lưu trữ dữ liệu trong nước với một số loại dịch vụ). Chọn region Supabase cho phù hợp.

### 9.9 Chế độ khách và liên kết tài khoản

Local-first phải đúng nghĩa ngay từ phút đầu: **mở app là chơi được, không có màn hình đăng ký chắn trước.**

```
- Lần đầu mở: tạo child_profile cục bộ; MỌI id là UUID sinh phía client ngay từ đầu
- Cổng phụ huynh hoạt động cục bộ đầy đủ (PIN, giới hạn thời gian) — không cần tài khoản
- Banner nhẹ trong cổng: "Tạo tài khoản để sao lưu và chơi trên nhiều máy"
  — không bao giờ chặn gameplay
- Liên kết: đăng ký → đẩy toàn bộ IndexedDB lên Supabase, gán parent_id
  UUID giữ nguyên nên không đụng độ, không cần ánh xạ id
- Trial 14 ngày tính từ NGÀY CHƠI ĐẦU TIÊN (lưu cục bộ);
  khi liên kết, server ghi nhận mốc sớm nhất từng thấy
```

Chấp nhận có chủ đích: khi chưa liên kết, xoá app = mất dữ liệu và reset trial. Rủi ro lách thấp (người lách là phụ huynh, và họ mất toàn bộ tiến trình của con) — ghi ở mục 13, không xây hàng rào phức tạp cho MVP.

### 9.10 Cập nhật, di trú dữ liệu và cache offline

Ba nền tảng, một codebase — nghĩa là ba nhịp cập nhật khác nhau trên cùng một schema dữ liệu:

- **Schema có version.** Bản ghi IndexedDB và Supabase mang `schema_version`; app chạy migration tuần tự khi mở. Code mới không bao giờ đọc dữ liệu cũ mà không qua migration
- **Service worker precache toàn bộ atlas @1x + dữ liệu rig/animation JSON** (~30–50MB) để offline thật sự; @2x cho desktop tải nền sau. Cache theo version, kiểu stale-while-revalidate: bản mới tải ngầm, **áp dụng ở lần mở sau** — không bao giờ đổi tài nguyên giữa phiên chơi
- **Nhịp phát hành:** template câu hỏi nằm trong app, không phụ thuộc server — sửa nội dung nghĩa là phát hành bản mới. Web/PWA nhận ngay, Tauri dùng updater tích hợp, CH Play chịu độ trễ duyệt. Kỷ luật bắt buộc: mọi thay đổi nội dung phải tương thích ngược với dữ liệu cũ
- **Chuỗi hiển thị tách file ngay từ đầu** — chi phí gần bằng 0 bây giờ, chuẩn bị cho bản quốc tế (Crumb & Coin) sau này

---

## 10. Nghệ thuật và pipeline asset

### 10.1 Ràng buộc quyết định phong cách

Bốn điều kiện đã loại bỏ phần lớn lựa chọn:

1. **Desktop-first.** Màn hình 1920×1080 hoặc 2560×1440, trong khi tablet rẻ chỉ 1280×800. Raster vẽ cho tablet sẽ nhoè trên desktop
2. **Ngân sách 150MB** bộ nhớ texture trên tablet 2–3GB RAM
3. **Puppet chạy trên bộ phận vector.** Xoay/kéo giãn bộ phận raster sẽ nhoè — nguồn phải là SVG sạch
4. **Tờ tiền phải đọc được con số** ở mọi kích thước

Bốn điều này cộng lại chỉ về một hướng: **thiết kế bằng vector**.

### 10.2 Phong cách: vector cắt giấy + vân phủ toàn cục

Hình dạng vector, nhưng vẽ với **nét hơi run tay** thay vì đường hình học hoàn hảo. Các lớp xếp chồng như giấy cắt dán, đổ bóng nhẹ và đều một hướng.

Rồi phủ **một lớp vân giấy lên toàn màn hình bằng shader trong Pixi** — không nướng vân vào từng asset. Bạn có được sự ấm áp thủ công với chi phí bộ nhớ gần bằng không, và chỉnh độ đậm chỉ mất một dòng code thay vì xuất lại 200 file.

**Vì sao phong cách này hợp game của bạn:** cả thế giới đã trông như giấy cắt, nên **sticker trở thành vật thể tự nhiên trong đó**, không phải thứ dán đè lên. Cơ chế bóc-dán — thứ bạn đặt cược nhiều nhất — sẽ có lý về mặt thẩm mỹ.

Nó cũng trung tính về giới, hợp với việc Mập là nhân vật hỗ trợ.

**Đã loại:**
- *Painterly / màu nước* — đẹp nhất nhưng raster thuần, nhoè khi puppet kéo giãn, sản xuất tốn nhất — và agent không sinh được qua code
- *Pixel art* — sai đối tượng (hoài niệm pixel là cảm xúc của người lớn), và số trên tờ tiền khó đọc
- *Flat vector hình học thuần* — lạnh, giống hàng nghìn app khác

### 10.3 Nhân vật

**Mập (cá mập con)** — phân vai rõ ràng: **bé là chủ tiệm và là người giải toán**, Mập là bạn phụ bếp hài hước, hậu đậu, luôn ủng hộ.

- **Ngoại hình:** mõm tròn, mắt to, **răng nhỏ hoặc không lộ răng**. Vây trước ngắn mũm mĩm, đeo tạp dề. Xanh dương nhạt hoặc xám xanh — tránh xanh đậm trông dữ
- **Logic hoạt hình:** Mập cứ thế đi lại trong tiệm, không cần giải thích tại sao cá mập sống trên cạn. Trẻ không thắc mắc
- **Tính cách:** luôn đói, hay nếm trộm bột, đếm nhầm rồi tự sửa. Khi bé sai, Mập nói kiểu "ơ, tớ cũng hay nhầm chỗ này" — chuẩn hoá việc mắc lỗi thay vì sửa lưng
- **Không bao giờ:** chê, thất vọng, hay tỏ ra biết tuốt

**Khách hàng:** đa dạng — người lớn tuổi, trẻ em, nam nữ. Biểu cảm khi bé sai là **bối rối/kiên nhẫn**, tuyệt đối không thất vọng hay giận.

> ⚠️ Xem mục 13 về rủi ro liên tưởng "Baby Shark" (Pinkfong).

### 10.4 Style guide — ràng buộc cứng

Asset sẽ được sản xuất rải rác nhiều tháng. Cần ràng buộc đo được, không phải mô tả cảm tính:

- **Bảng màu đóng: đúng 12 màu**, không pha thêm. Tông ấm thủ công — gỗ nhạt, kem, hồng đất, xanh sage, cam đào. **Không hồng neon**
- **Độ dày nét chỉ 2 mức**, tính theo đơn vị canvas gốc
- **Bóng đổ một hướng duy nhất** (135°), một độ mờ duy nhất
- Mọi thứ vẽ trên **lưới 8px**
- Bo góc chỉ dùng 2 giá trị

Đây chính là thứ giữ cho 48 sticker vẽ cách nhau ba tháng vẫn trông cùng một thế giới.

### 10.5 Chiến lược sản xuất asset: AI agent sinh qua code

**Nguyên tắc nền: agent VIẾT asset (SVG), không VẼ asset (diffusion).** Các phản đối với "AI sinh asset cuối" ở bản cũ nhắm vào diffusion — khi asset là code, chúng đảo ngược từng cái:

| Vấn đề với diffusion | Khi asset là SVG code |
|---|---|
| Chữ số trên tờ tiền không tin được | `<text>` thật — tờ tiền thành trường hợp **dễ nhất** |
| Trôi dạt phong cách qua ~90 asset | **Linter cưỡng chế**: chỉ màu trong tokens, đúng 2 độ dày nét — máy kiểm, không dựa trí nhớ |
| Mập trôi về phía Baby Shark | Agent ghép hình khối theo spec, không kéo về prior ảnh trong dữ liệu huấn luyện |
| Bản quyền mập mờ | Code sinh từ spec của bạn, diff được, review được, version-control được |

Phong cách giấy cắt (10.2) vô tình là phong cách agent viết code giỏi nhất: hình khối phẳng, xếp lớp, bảng màu đóng, bóng một hướng. Lựa chọn phong cách càng đúng hơn với quyết định này.

**Bốn tầng:**

**Tầng 1 — Kenney CC0 làm placeholder cho M1.** Toàn bộ asset CC0, dùng thương mại thoải mái, không bắt buộc ghi công. Furniture Kit, Food, Board Game, UI Pack.

> Chìa khoá của lộ trình không đổi: **dựng vertical slice bằng placeholder, đừng chờ art.** Không qua cổng M1 thì tiết kiệm toàn bộ công sức generator.

**Tầng 2 — Generators: mỗi họ asset là một file code.**

```
assets/
  tokens.ts        # 12 màu, 2 độ dày nét, bóng 135° — nguồn DUY NHẤT về style
  primitives/      # bộ phận dùng chung: đĩa, khay, hơi nước, lấp lánh…
  generators/      # money.ts, cakes.ts, furniture.ts, stickers/…
  characters/      # map.ts — Mập: ~10 bộ phận SVG + rig (pivot, z-order)
  preview/         # harness render → PNG cho vòng review
  build.ts         # svgo → sharp @1x/@2x → free-tex-packer → atlas WebP
```

`money.ts` là một template với 9 bộ tham số (mệnh giá, màu) → 9 tờ tiền nhất quán tuyệt đối. **Style linter chạy trong CI**: parse SVG, assert chỉ dùng màu token, đúng độ dày nét, bóng một hướng — rủi ro "trôi phong cách qua nhiều tháng" chuyển từ kỷ luật con người sang kiểm tra máy.

**Tầng 3 — Vòng lặp render–review: điều kiện sống còn.** Agent sinh mù thì xấu; agent phải **nhìn thấy** thứ nó vừa sinh:

```
sửa generator → render PNG (resvg/sharp hoặc Playwright screenshot)
             → xuất ở 1x / 2x / cỡ nhỏ, nền sáng + tối
             → agent đa phương thức xem ảnh, đối chiếu checklist art direction
             → sửa tiếp, lặp
```

Chạy trong Claude Code / Codex với quyền chạy lệnh và đọc ảnh. Nếu môi trường agent không đọc được file cục bộ, thêm MCP chụp màn hình (ví dụ Playwright MCP) hoặc một server render nhỏ trả PNG. **Cổng cuối luôn là con người** — máy lo sạch và nhất quán, bạn và bé duyệt phần "duyên".

**Tầng 4 — Diffusion / image-gen MCP chỉ để khám phá.** Mood board, 20 phương án tạo hình Mập để chọn hướng — rồi **mã hoá phương án thắng thành generator**. Ảnh diffusion không bao giờ vào build: lý do cũ (nhất quán, Baby Shark, bản quyền) vẫn nguyên giá trị với ảnh, chỉ không còn áp cho code.

**Hoạt hình: bỏ Rive, chuyển puppet code-driven.** Rive editor là mắt xích duy nhất agent không tự sản xuất được (.riv là binary từ editor đồ hoạ). Thay thế: bộ phận SVG → texture trong atlas; rig và tween viết bằng TypeScript trên Pixi (idle nhún, chớp mắt, nhai vụng…); biểu cảm khách = hoán đổi bộ phận mắt/miệng; **bóc sticker = MeshPlane bẻ đỉnh theo ngón tay**, viết một lần, tham số hoá cho cả 48. Mất: timeline editor trực quan. Được: toàn pipeline agent sinh được, bớt một runtime trên tablet yếu. Nếu sau này có animator dùng Rive, kiến trúc không khoá đường quay lại.

**Toàn bộ quy trình mục này đã được đóng gói thành skill `tiem-banh-asset-forge`** (SKILL.md + tokens + generators mẫu + linter + harness) để bất kỳ agent nào cũng sinh asset đúng chuẩn.

`agent-sprite-forge` đã đánh giá ở vòng trước: kiến trúc agent-plans-scripts-process là đúng mẫu, nhưng nó là diffusion → raster → Godot — sai cả ba trục với dự án này. Ta dùng đúng mẫu đó với SVG.

### 10.6 Pipeline

```
tokens.ts ──► generators/*.ts ──► .svg ──► svgo ──► sharp @1x/@2x
                   │                                     │
                   │                        free-tex-packer ──► atlas WebP ──► PixiJS
                   ▼
            preview/render ──► PNG ──► agent XEM & SỬA (vòng lặp) ─── style linter (CI)

characters/map.ts (bộ phận + rig JSON) ──► texture từ atlas ──► puppet Pixi (tween TS)
Bóc sticker: Pixi MeshPlane — viết một lần, 48 sticker dùng chung
```

| Loại asset | Nguồn | Định dạng runtime |
|---|---|---|
| Nền, bánh, nội thất, tiền | Vector → atlas raster | WebP, @1x + @2x |
| Mập, khách hàng | Generator SVG bộ phận + rig | Texture atlas + rig JSON |
| Sticker (bóc + dán) | Generator SVG + MeshPlane | WebP trong atlas |
| UI, chữ | DOM + CSS | Font web |
| Vân giấy | Shader Pixi | 1 texture tile 512×512 |
| Hiệu ứng nhỏ | Particle Pixi | |

**Ngân sách hoạt hình runtime:** tối đa **3 puppet hoạt động đồng thời** — Mập, 1 khách đang phục vụ, 1 sticker đang bóc. Khách xếp hàng dùng frame tĩnh render sẵn từ chính bộ phận đó, đổi sang puppet sống khi đến lượt. Đây là điều kiện để chạy mượt trên tablet 2GB.

**Quy ước đặt tên:** `{loai}_{ten}_{bien-the}@{scale}.webp` — ví dụ `cake_matcha_01@2x.webp`, `money_20000_front@1x.webp`.

**Ngân sách bộ nhớ:** 4–6 atlas @1x cho toàn MVP, mỗi atlas 1024×1024 ≈ 4MB chưa nén. Desktop nạp @2x thì ×4. Nạp theo màn hình: sticker chỉ nạp khi mở sổ, nội thất chỉ nạp khi vào chế độ trang trí.

### 10.7 Danh sách asset MVP

- 9 mệnh giá tiền (mặt trước) — **ưu tiên cao nhất, vẽ tay**
- 12 loại bánh
- 15 vật phẩm trang trí
- 48 sticker
- 8 khách hàng × 3 biểu cảm (hoán đổi bộ phận mắt/miệng, không vẽ lại)
- Mập: puppet ~10 bộ phận, 6 hành vi tween (chào, làm bánh, gợi ý, vui, bối rối, ăn vụng)
- 14 màn hình UI × 2 bố cục (ngang/dọc)

### 10.8 Âm thanh

Nhạc nền nhẹ, tắt được. Âm thanh phản hồi phải "ngon": tiếng giấy, tiếng tiền, tiếng chuông cửa, tiếng lò nướng. **Không dùng tiếng "sai" chói tai.**

Vì haptic không có trên iOS và desktop, **âm thanh và hiệu ứng hình là lớp phản hồi chính**, rung chỉ là lớp phụ.

### 10.9 Tiếp cận và typography

- **Font:** Quicksand cho tiêu đề và UI lớn, Be Vietnam Pro cho nội dung — cả hai có tiếng Việt đầy đủ trên Google Fonts. Kiểm tra dấu thanh ở cỡ nhỏ trước khi chốt. Số dùng **tabular figures** (`font-variant-numeric`) để cột tiền thẳng hàng
- **Mù màu:** bảng 12 màu phải qua giả lập protanopia/deuteranopia. Đúng/sai **không bao giờ truyền đạt chỉ bằng màu** — luôn kèm biểu tượng và chuyển động
- **Tải đọc:** bong bóng thoại ≤ 1 câu, ≤ 12 từ, từ vựng trong vốn đọc lớp 3. TTS đọc đề bài để v1.1 (chất lượng Web Speech tiếng Việt không đều, cần đánh giá riêng)
- **Mục tiêu chạm:** ≥ 48px trên tablet; desktop ≥ 40px kèm trạng thái hover rõ
- Tôn trọng `prefers-reduced-motion`: tắt hiệu ứng rung lắc, giữ fade

---

## 11. Chỉ số đo lường

**Chỉ số Bắc Đẩu duy nhất: tỉ lệ bé tự mở app quay lại ngày thứ 7 mà không cần nhắc.**

| Chỉ số | Ngưỡng chấp nhận |
|---|---|
| D1 retention | > 50% |
| **D7 retention** | **> 30%** |
| D30 retention | > 15% |
| Phiên tự khởi xướng (bé tự mở) | > 60% |
| Thời lượng phiên trung bình | 18–25 phút (lệch xa về cả hai phía đều là tín hiệu xấu) |
| Tỉ lệ đúng chung | 70–85% (thấp hơn = nản, cao hơn = quá dễ) |
| Sụt độ chính xác buổi chiều so với buổi sáng | < 15 điểm % — sụt sâu hơn nghĩa là 20 phút quá dài, xem lại ở M1 |
| Hoàn thành 1 ngày bán hàng | > 85% |
| Phụ huynh mở báo cáo tuần | > 40% |
| Chuyển đổi dùng thử → thuê bao | > 5% (tham chiếu, đo ở M5–M6) |

Nếu D7 dưới 20%, **dừng thêm tính năng** và quay lại sửa vòng lặp lõi.

### 11.1 Bộ sự kiện analytics

Định nghĩa ngay từ M1 — không đo được thì mọi ngưỡng ở bảng trên là vô nghĩa:

```
app_open, session_start/end{device}
day_start/complete{so_khach}
question_shown/answered{skill, level, correct, ms, attempt}
hint_shown{level}, mastery_achieved{skill}
sticker_earned/placed, shop_purchase{item}, decorate_enter
limit_reached, parent_pin_open, report_viewed
trial_started/expired, subscribed
```

**Hai dòng dữ liệu tách biệt — đừng trộn:**

- **Dữ liệu học tập** (`question_attempt`, `skill_state`, `counters`…) là dữ liệu bậc nhất: luôn bật, gắn hồ sơ trẻ, đồng bộ qua `sync_queue`, phục vụ thích ứng và báo cáo phụ huynh
- **Telemetry sản phẩm** (danh sách sự kiện trên) là dòng thứ hai: pseudonymous theo `install_id`, không chứa biệt danh hay nội dung câu hỏi, có hàng đợi offline riêng, gửi theo lô cuối phiên, và tắt được trong cài đặt

**Hai sự thật về đo lường cần chấp nhận:**

- "Phiên tự khởi xướng" không đo trực tiếp được. Proxy: phiên không diễn ra trong 10 phút sau khi mở cổng phụ huynh — chấp nhận nhiễu, bù bằng phỏng vấn phụ huynh ở beta
- n = 20–30 gia đình ở M5 là mẫu nhỏ. Ngưỡng D7/D30 dùng làm **tín hiệu**, quyết định phát hành dựa cả định tính. Đừng tự lừa mình bằng phần trăm trên mẫu 25 người

---

## 12. Lộ trình

| Mốc | Thời gian | Kết quả |
|---|---|---|
| **M0 — Chuẩn bị** | 1 tuần | Dựng khung React + Pixi, tải pack Kenney, viết `tokens.ts` + **style linter**, dựng harness render–review, chạy generator **9 mệnh giá tiền** |
| **M1 — Vertical slice** | 4 tuần | Kỹ năng A5, loop đầy đủ từ mở tiệm đến dán sticker. **Art placeholder.** Test cả chuột lẫn ngón tay |
| — **Cổng kiểm** | | 3–5 bé chơi. Bé có tự đòi chơi lại hôm sau không? |
| **M2 — Đủ nội dung** | 6 tuần | 13 kỹ năng, engine sinh câu hỏi, thuật toán thích ứng, Supabase sync |
| **M3 — Art thật** | 4 tuần | Thay placeholder bằng asset từ generators, puppet Mập + khách, 48 sticker qua vòng render–review |
| **M4 — Phụ huynh & hoàn thiện** | 3 tuần | Cổng phụ huynh, giới hạn thời gian, **liên kết tài khoản + paywall + thanh toán**, nhắc nghỉ mắt, tinh chỉnh cảm giác, âm thanh |
| **M5 — Beta đóng** | 4 tuần | 20–30 gia đình, theo dõi D7/D30, phỏng vấn phụ huynh, **khảo sát mức giá** |
| **M6 — Phát hành** | 2 tuần | Desktop + CH Play, trang bán hàng, hệ thống thuê bao |

**Tổng ~24 tuần** cho người làm toàn thời gian và đã quen stack. Nếu là dự án ngoài giờ, **nhân đôi** — và đừng coi đó là thất bại.

**Kiểm thử tối thiểu (bắt đầu từ M1, không phải M5):** property-based test cho engine sinh câu hỏi — đáp án hợp lệ và không âm, không trùng trong cửa sổ 20 câu, đúng phân bố theo level; kịch bản đồng bộ hai thiết bị offline→online cho `sticker_owned`, `counters`, `daily_usage`; soak test 30 phút trên tablet Android 2GB (bộ nhớ, nhiệt độ); S07 test bằng chuột và cảm ứng như **hai bộ case riêng biệt**.

**Cổng kiểm sau M1 là thật — và phải đo được.** Với 3–5 bé chơi 3 ngày liên tiếp, ĐẠT khi:

- ≥ 3/5 bé tự hoàn thành một ngày bán hàng không cần người lớn trợ giúp (từ ngày thứ 2)
- ≥ 3/5 bé **tự đòi chơi lại** hôm sau — phụ huynh ghi nhận, không nhắc trước
- Không bé nào bỏ ngang vì chán ở 2 ngày liên tiếp

Không đạt → sửa vòng lặp lõi, không thêm tính năng. Nếu vertical slice không giữ chân được bé, thêm 47 sticker cũng không cứu được. Cám dỗ lớn nhất sẽ là bỏ qua bước này vì "đang có đà".

---

## 13. Rủi ro

| Rủi ro | Mức | Giảm thiểu |
|---|---|---|
| Loop lõi không đủ hấp dẫn | **Cao** | Cổng kiểm M1 nghiêm túc, sẵn sàng đổi hướng |
| Phụ huynh không thấy giá trị → không gia hạn | **Cao** | Báo cáo tuần phải cụ thể, có ví dụ bài sai thật |
| Nghĩa vụ pháp lý do lưu dữ liệu trẻ em trên cloud | **Trung bình–Cao** | Mục 9.8. Luật sư rà Nghị định 13/2023 và 53/2022 trước phát hành |
| **Nhân vật cá mập gợi liên tưởng "Baby Shark"** | **Trung bình–Cao** | Pinkfong bảo vệ IP rất mạnh. Không dùng tên "Baby Shark"/"Cá Mập Con", tránh bảng màu vàng-cam đặc trưng, không dùng giai điệu tương tự. Luật sư SHTT rà tạo hình |
| Asset agent sinh "sạch" nhưng thiếu duyên (nhất là 48 sticker) | **Trung bình–Cao** | Vòng render–review bắt buộc + cổng duyệt của người (10.5); linter lo nhất quán; nếu M3 vẫn đuối → thuê freelance chỉ cho sticker, kiến trúc không đổi |
| Nội dung toán lệch chương trình | Trung bình | Giáo viên tiểu học rà soát trước M2 |
| Chuột không tái tạo được cảm giác "chơi đồ hàng" | Trung bình | Vùng chạm to, viền sáng khi rê chuột, âm thanh bù. Playtest riêng trên desktop ở M1 |
| Thu hẹp thị trường vì nhắm bé gái | Trung bình | Định vị sản phẩm trung tính, marketing mới nhắm bé gái. Mập là nhân vật trung tính giới |
| Bé chán khi vào "Tiệm tự do" (hết cây kỹ năng sau ~4 tuần chơi đều) | Trung bình | 12 sticker nâng cao + bộ mùa theo lịch (5.1); theo dõi D30 |
| **Phiên 20 phút quá dài với một số bé** | **Trung bình** | Giờ nghỉ trưa chia đôi, dốc khởi động ngày 1–3, "ngày vắng khách" tự co, đo sụt chính xác buổi chiều (mục 11); quyết định lại ở cổng M1 |
| Trùng tên / trùng nhãn hiệu | Thấp | Tra Cục SHTT + CH Play/App Store trước khi chốt tên |
| Không có haptic trên iOS và desktop | Thấp | Rung chỉ là lớp phụ (10.8) |
| Thanh toán VN: thẻ quốc tế ít phổ biến | Trung bình | CH Play dùng Play Billing; desktop/web thêm MoMo/ZaloPay/chuyển khoản (8.1) |
| Trial dễ lách khi chưa liên kết tài khoản | Thấp | Chấp nhận ở MVP — người lách mất toàn bộ tiến trình của con (9.9) |

---

## 14. Việc cần làm ngay

1. **Viết `money.ts` + harness render–review.** Tờ tiền từng là "điểm chết" của diffusion — với SVG nó là trường hợp dễ nhất, và là bài test rẻ nhất cho cả pipeline
2. **Tải Kenney Furniture Kit + Food**, dựng màn S07 (khay thối tiền) bằng placeholder
3. **Viết engine sinh câu hỏi cho riêng kỹ năng A5**, kèm bộ test
4. Viết `tokens.ts` (12 màu) + style linter; cho agent sinh thử 1 bánh và 1 sticker qua vòng render–review trước khi cam kết cả ~90 asset
5. Tra cứu tên "Tiệm Bánh Anh Chi" và "Crumb & Coin" trên CH Play, App Store, cơ sở dữ liệu nhãn hiệu
6. Đối chiếu 13 kỹ năng ở mục 3 với SGK thực tế
7. Chốt font (Quicksand + Be Vietnam Pro) và chạy giả lập mù màu trên bảng 12 màu
8. Đọc chính sách Google Play Families + Play Billing, khảo sát cổng MoMo/ZaloPay — ảnh hưởng trực tiếp thiết kế paywall

**Phép thử sớm nhất và rẻ nhất:** làm xong việc 1 và 2, rồi kéo thử tờ tiền vào khay. Nếu thấy "đã" ngay cả khi hình còn xấu, concept đứng vững — lúc đó mới bàn tới 48 sticker.
