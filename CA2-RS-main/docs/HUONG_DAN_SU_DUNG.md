# Hướng dẫn sử dụng CA2 Remote Signing

> **Ứng dụng:** CA2 Remote Signing (CA2 RS)  
> **Phiên bản tham chiếu:** 1.3.5  
> **Nhà cung cấp:** Nacencomm  
> **Giấy phép:** Số 604/GP-BTTTT  
> **Cập nhật tài liệu:** 30/06/2026

---

## Mục lục

1. [Giới thiệu](#1-giới-thiệu)
2. [Yêu cầu hệ thống](#2-yêu-cầu-hệ-thống)
3. [Lần đầu mở ứng dụng](#3-lần-đầu-mở-ứng-dụng)
4. [Đăng ký tài khoản mới](#4-đăng-ký-tài-khoản-mới)
5. [Kích hoạt thiết bị và thiết lập PIN](#5-kích-hoạt-thiết-bị-và-thiết-lập-pin)
6. [Đăng nhập](#6-đăng-nhập)
7. [Giao diện chính (Trang chủ)](#7-giao-diện-chính-trang-chủ)
8. [Ký tài liệu](#8-ký-tài-liệu)
9. [Quản lý tài liệu đã ký](#9-quản-lý-tài-liệu-đã-ký)
10. [Tải hợp đồng và ký cá nhân](#10-tải-hợp-đồng-và-ký-cá-nhân)
11. [Quản lý đăng nhập web](#11-quản-lý-đăng-nhập-web)
12. [Tài khoản và cài đặt](#12-tài-khoản-và-cài-đặt)
13. [Thông báo](#13-thông-báo)
14. [Mở app từ link bên ngoài](#14-mở-app-từ-link-bên-ngoài)
15. [Xử lý sự cố thường gặp](#15-xử-lý-sự-cố-thường-gặp)
16. [Liên hệ hỗ trợ](#16-liên-hệ-hỗ-trợ)

---

## 1. Giới thiệu

**CA2 Remote Signing** là ứng dụng di động giúp bạn:

- Đăng ký và sử dụng **chứng thư số cá nhân** (CTS) trên điện thoại
- **Ký số tài liệu** mọi lúc, mọi nơi — không cần USB Token
- Nhận yêu cầu ký qua **thông báo đẩy** và xử lý ngay trên app
- **Đăng nhập website** bằng bút ký số từ xa (Remote Signing)
- Tự soạn và ký hợp đồng cá nhân trên thiết bị

App áp dụng mức độ tin cậy **SCAL2** theo tiêu chuẩn **eIDAS**, hỗ trợ xác thực danh tính qua **eKYC** (CCCD gắn chip), **OCR** (CCCD thường) hoặc **VNeID**.

---

## 2. Yêu cầu hệ thống

| Yêu cầu | Chi tiết |
|---------|----------|
| Hệ điều hành | Android 7.0 trở lên / iOS 15.5 trở lên |
| Kết nối | Internet (Wi‑Fi hoặc 4G/5G) |
| Phần cứng (eKYC) | Camera, NFC (đọc chip CCCD) |
| Sinh trắc học | Vân tay hoặc Face ID (tùy chọn, khuyến nghị bật) |
| Quyền app | Camera, thông báo, NFC (khi dùng eKYC) |

---

## 3. Lần đầu mở ứng dụng

### 3.1. Màn hình giới thiệu

Khi mở app lần đầu, bạn sẽ thấy **3 slide giới thiệu**:

| Slide | Nội dung |
|-------|----------|
| 1 | **Ký số mọi lúc, mọi nơi** — Làm việc từ xa, không cần USB Token |
| 2 | **Bảo mật tuyệt đối** — Mức tin cậy SCAL2 theo tiêu chuẩn eIDAS |
| 3 | **Hỗ trợ đa kênh** — Đội ngũ hỗ trợ liên tục trên nhiều nền tảng |

Bấm **Tiếp tục** để vào màn hình đăng nhập/đăng ký.

> Góc phải màn hình có biểu tượng cờ để **đổi ngôn ngữ** (Tiếng Việt / English).

### 3.2. Màn hình chào mừng

Sau slide giới thiệu, app hiển thị:

- Slogan: *Công cụ chữ ký số tất cả trong một của bạn*
- Nút **Đăng nhập**
- Liên kết **Đăng ký tại đây** (nếu chưa có tài khoản)

Nếu thiết bị đã từng đăng ký và có PIN, app có thể **tự chuyển** sang màn hình đăng nhập.

---

## 4. Đăng ký tài khoản mới

### 4.1. Chọn hình thức đăng ký

Tại màn **Đăng ký**, bạn có thể:

**A. Nhập mã đăng ký offline** (nếu được cấp sẵn mã) → bấm **Tiếp tục**

**B. Chọn 1 trong 3 hình thức đăng ký online:**

| Hình thức | Đối tượng |
|-----------|-----------|
| **Cá nhân** | Cá nhân đăng ký CTS riêng |
| **Cá nhân thuộc tổ chức** | Nhân viên/cán bộ thuộc tổ chức |
| **Tổ chức** | Đăng ký cho tổ chức/doanh nghiệp |

> Hướng dẫn chi tiết bên dưới mô tả luồng **Cá nhân** — luồng phổ biến nhất.

---

### 4.2. Đăng ký cá nhân — 3 bước

Màn **Hướng dẫn đăng ký** liệt kê 3 bước cần hoàn thành:

#### Bước 1: Chọn gói dịch vụ

- Chọn **gói CTS** phù hợp (thời hạn, số lượt ký, mô tả gói)
- Bấm xác nhận → trạng thái bước chuyển sang **Hoàn thành**

#### Bước 2: Xác thực thông tin

Chọn **một** trong các hình thức xác thực danh tính:

##### a) Căn cước công dân gắn chip (eKYC) — khuyến nghị

1. Bấm **Căn cước công dân gắn chip**
2. **Quét MRZ** — lật CCCD, đặt vùng MRZ (3 dòng chữ ở cuối thẻ) vào khung camera
3. **Đọc chip NFC** — giữ CCCD sát mặt sau điện thoại (vùng NFC) cho đến khi đọc xong
4. **Xác thực khuôn mặt** — nhìn thẳng camera theo hướng dẫn liveness
5. Màn **Thông tin CCCD gắn chip** hiển thị dữ liệu đã xác minh:
   - Thông tin cá nhân (họ tên, ngày sinh, địa chỉ, số CCCD…)
   - Thông tin thiết bị (tự động)
   - MRZ trên CCCD
6. Nhập **Số điện thoại** và **Email** (bắt buộc)
7. Nhập **Mã nhân viên** (nếu có — không bắt buộc)
8. Bấm **Tiếp tục**

##### b) Căn cước công dân thường (OCR)

1. Bấm **Căn cước công dân thường**
2. **Quét mã QR** trên CCCD bằng camera
3. Kiểm tra **Thông tin định danh** → điền thông tin liên hệ → **Tiếp tục**

##### c) Sử dụng VNeID

1. Bấm **Sử dụng VNeID**
2. Nhập **số CCCD**
3. App mở **ứng dụng/website VNeID** để xác thực
4. Sau khi VNeID xác nhận, quay lại app → kiểm tra dữ liệu → **Tiếp tục**

> Khi dùng VNeID, bạn cần đồng ý các điều khoản xử lý dữ liệu cá nhân theo Nghị định 13/2023/NĐ-CP.

#### Bước 3: Chụp ảnh CCCD

1. Chụp **mặt trước** CCCD/CMND
2. Chụp **mặt sau** CCCD/CMND

**Lưu ý khi chụp:**
- Giấy tờ còn hiệu lực, là bản gốc (không phải bản sao)
- Ảnh rõ nét, không mờ, không mất góc, không chói sáng

---

### 4.3. Hoàn tất đăng ký

Sau khi hoàn thành cả 3 bước:

1. Tích đồng ý **Điều khoản** xử lý dữ liệu cá nhân của Nacencomm
2. Bấm **Hoàn tất đăng ký**
3. App gửi hồ sơ lên hệ thống (có thể mất vài phút)

Màn **Hoàn tất đăng ký thông tin** thông báo:

> *Bạn đã hoàn tất đăng ký thông tin, chúng tôi sẽ thẩm định trong vòng 8–10 phút và gửi kết quả về email đã đăng ký.*

Tại đây bạn có thể:
- **Xem đơn đăng ký sử dụng** — mở PDF đơn đăng ký
- **Ký điện tử đơn đăng ký** (nếu được yêu cầu)
- **Về trang đăng nhập**

---

## 5. Kích hoạt thiết bị và thiết lập PIN

Sau khi đăng ký thành công, bạn nhận **Mã kích hoạt / Mã tài khoản** qua email. Dùng mã này để liên kết thiết bị:

### 5.1. Kích hoạt thiết bị

1. Tại màn chào mừng, chọn luồng kích hoạt (hoặc app tự chuyển nếu thiết bị chưa kích hoạt)
2. Màn **Kích hoạt thiết bị** — nhập **Mã tài khoản**
3. App kiểm tra mã → chuyển sang xác thực OTP

### 5.2. Xác thực OTP thiết bị

1. Nhập **mã OTP 4 số** gửi đến thiết bị (hoặc hiện qua thông báo push)
2. Xác thực thành công → màn **Xác thực thiết bị thành công**

> OTP cũng có thể hiện dạng popup toàn app khi nhận push thông báo hệ thống.

### 5.3. Thiết lập mã PIN

1. Màn **Thiết lập mã PIN** — nhập **6 chữ số**
2. Xác nhận lại PIN
3. Hoàn tất → chuyển sang màn **Đăng nhập**

> **Mã PIN** dùng để đăng nhập app và xác thực mỗi lần ký tài liệu. Hãy ghi nhớ và không chia sẻ cho người khác.

---

## 6. Đăng nhập

### 6.1. Đăng nhập bằng PIN

1. Nhập **MÃ PIN** (6 số)
2. Bấm xác nhận → vào **Trang chủ**

### 6.2. Đăng nhập bằng sinh trắc học

Nếu đã bật Face ID / vân tay trong cài đặt:

- Bấm **Đăng nhập bằng vân tay** hoặc **Đăng nhập bằng Face ID**
- Xác thực sinh trắc → vào Trang chủ

### 6.3. Quên mã PIN

1. Bấm **Quên mã PIN**
2. Gửi yêu cầu hỗ trợ qua email **support@cavn.vn**

### 6.4. Phiên đăng nhập

- App theo dõi phiên làm việc; khi hết hạn sẽ yêu cầu đăng nhập lại
- Bấm **Đăng xuất** tại màn Tài khoản để thoát an toàn

---

## 7. Giao diện chính (Trang chủ)

Sau đăng nhập, bạn vào **Trang chủ** với thanh tab dưới cùng:

| Tab | Chức năng |
|-----|-----------|
| **Trang chủ** | Tổng quan công việc cần xử lý |
| **(+)** | Tải hợp đồng, ký cá nhân, quét QR |
| **Mở rộng** | Màn Tài khoản & cài đặt |

### 7.1. Thanh header

- **Avatar + tên** chủ chứng thư số
- **ID bút ký** và ngày hiệu lực CTS
- **Biểu tượng chuông** → mở **Thông báo**
- **Làm mới** (pull-to-refresh hoặc nút refresh) — cập nhật danh sách

### 7.2. Khối "Cần xử lý"

Hiển thị tài liệu **đang chờ ký**:

- Bấm một tài liệu → **Ký tài liệu**
- Chọn nhiều tài liệu (checkbox) → thanh đáy *"Đã chọn X mục cần xử lý"* → **Tiếp tục** → **Ký lô**
- **Chọn tất cả** / **Bỏ chọn tất cả**

### 7.3. Khối "Đã ký gần đây"

- Tối đa 4 tài liệu vừa ký
- **Xem lịch sử ký** → mở Quản lý tài liệu đã ký

### 7.4. Khối "Chờ cấp CTS"

Hiển thị khi chứng thư số đang được cấp — thường mất **8–10 phút** sau đăng ký.

### 7.5. Khối "Đăng nhập gần đây"

- Các website bạn đã đăng nhập bằng bút ký số
- **Quản lý đăng nhập** → xem chi tiết, ngắt kết nối

---

## 8. Ký tài liệu

### 8.1. Nhận yêu cầu ký

Yêu cầu ký đến qua:

- **Thông báo đẩy** (push notification)
- Danh sách **Cần xử lý** trên Trang chủ
- **Link bên ngoài** (email, SMS — xem mục 14)

Khi có yêu cầu, app hiện hộp thoại:

> **"Bạn có một yêu cầu cần ký"** → bấm **Ký ngay**

### 8.2. Ký một tài liệu

1. Màn **Ký tài liệu** hiển thị:
   - Tên văn bản
   - Mã yêu cầu
   - Tên chứng thư
   - Hệ thống yêu cầu ký
2. Bấm **Xem văn bản** — mở file PDF gốc
3. Chọn:
   - **Ký tài liệu** — tiếp tục ký
   - **Từ chối** — từ chối yêu cầu ký
4. Nếu bật **Xác thực 2FA** → xác thực vân tay/Face ID
5. Nhập **mã PIN** (6 số)
6. Chờ kết quả — thông báo *"Đã ký văn bản thành công"*

> Màn ký có **đếm ngược 2 phút** — hết thời gian sẽ quay về Trang chủ.

### 8.3. Ký lô (nhiều tài liệu)

**Cách 1 — từ Trang chủ:**
1. Chọn nhiều tài liệu trong **Cần xử lý**
2. Bấm **Tiếp tục**
3. Màn **Yêu cầu ký lô** — xem danh sách → **Ký** hoặc **Từ chối**
4. Xác thực sinh trắc (nếu bật) + nhập PIN
5. Xem kết quả từng tài liệu (thành công / thất bại)
6. Có thể **Tải ZIP** hoặc **Chia sẻ** tài liệu đã ký

**Cách 2 — từ thông báo push (ký lô một lần):**

Nếu bật **Xác thực một lần cho ký lô** trong Tài khoản:
- Nhận push → xác thực sinh trắc + PIN **một lần** → ký tất cả yêu cầu chờ

**Cách 3 — Nhớ Pincode:**

Nếu bật **Nhớ Pincode** trong Bảo mật:
- Một số thao tác ký có thể dùng PIN đã lưu, không cần nhập lại mỗi lần

### 8.4. CTS hết hạn khi ký

Nếu chứng thư số hết hạn khi bạn cố ký:

| Tình huống | Hành động app |
|------------|---------------|
| Hết hạn, đủ điều kiện **cấp bù** | Dialog **Cấp bù thời hạn CTS** → gọi **1900 5454 07** |
| Hết hạn, cần gia hạn | Dialog **Hết hạn chữ ký số** → **Mua thêm** (đăng ký gia hạn) |

---

## 9. Quản lý tài liệu đã ký

**Đường dẫn:** Tài khoản → **Quản lý tài liệu đã ký**  
Hoặc: Trang chủ → **Xem lịch sử ký**

### 9.1. Hai tab

| Tab | Nội dung |
|-----|----------|
| **Tài liệu đã ký** | Tài liệu bạn đã ký |
| **Tài liệu hoàn tất** | Tài liệu đã hoàn tất quy trình |

### 9.2. Thao tác

- **Tìm kiếm** theo tên tài liệu
- Lọc theo **Tháng này** / **Tháng trước**
- Bấm tài liệu → **Chi tiết tài liệu**:
  - Mã yêu cầu, hệ thống, tên chứng thư
  - Thời gian ký, trạng thái văn bản
  - Tiến trình ký (chờ ký / ký hợp lệ / từ chối…)
- **Tải xuống** file đã ký
- **Chia sẻ** file

---

## 10. Tải hợp đồng và ký cá nhân

Bấm nút **(+)** ở giữa thanh tab → mở sheet **Tải lên hợp đồng**:

| Tùy chọn | Mô tả |
|----------|-------|
| **Tải lên tài liệu** | Chọn file PDF từ thiết bị (tối đa 20MB) |
| **Tải lên ảnh** | Chọn ảnh từ thư viện (tối đa 20MB) |
| **Chụp ảnh** | Chụp trực tiếp bằng camera |
| **Quét QR** | Kết nối Passkey / ký nhanh qua website |

Sau khi chọn tài liệu/ảnh → màn **PDF Viewer** để xem, chỉnh vị trí chữ ký và ký.

### Quét QR — Kết nối Passkey

1. Bấm **Quét QR** → hướng camera vào mã QR trên website
2. App đọc QR và mở trình duyệt đăng ký Passkey
3. Hoàn tất liên kết → có thể đăng nhập website bằng bút ký trên app

> Nếu CTS hết hạn, nút (+) sẽ hiện cảnh báo thay vì mở sheet tải hợp đồng.

---

## 11. Quản lý đăng nhập web

**Đường dẫn:** Trang chủ → **Quản lý đăng nhập**  
Hoặc: Tài khoản → **Quản lý đăng nhập**

Cho phép xem các website đã đăng nhập bằng CA2 Remote Signing:

- Tên miền / hệ thống
- Email tài khoản liên kết
- Thời gian đăng nhập gần nhất
- **Ngắt kết nối** website không còn sử dụng

---

## 12. Tài khoản và cài đặt

**Đường dẫn:** Tab **Mở rộng** (Tài khoản)

### 12.1. Ứng dụng

| Mục | Chức năng |
|-----|-----------|
| Quản lý tài liệu đã ký | Xem lịch sử ký (mục 9) |
| Quản lý đăng nhập | Quản lý website đã liên kết (mục 11) |

### 12.2. Quản lý dịch vụ

| Mục | Chức năng |
|-----|-----------|
| **Thông tin chứng thư số** | Serial, họ tên, email, ngày hết hạn, trạng thái; **Huỷ đăng ký thiết bị** |
| **Thông tin gói dịch vụ** | Gói hiện tại, mực ký, **Mua thêm**, lịch sử cấp CTS, xem hồ sơ |

### 12.3. Thiết lập

| Mục | Chức năng |
|-----|-----------|
| **Thiết lập chữ ký** | Tùy chỉnh hình ảnh chữ ký hiển thị trên tài liệu |
| **Đổi mã PIN** | Nhập PIN cũ → PIN mới → xác nhận |
| **Bảo mật sinh trắc** | Bật/tắt **FaceID / TouchID** cho xác thực 2FA khi ký |
| **Xác thực một lần cho ký lô** | Bật/tắt ký lô một lần từ thông báo push |
| **Ngôn ngữ** | Tiếng Việt / Tiếng Anh |

### 12.4. Khác

| Mục | Chức năng |
|-----|-----------|
| **Trung tâm hỗ trợ** | Hỗ trợ & đánh giá ứng dụng |
| **Thông tin sản phẩm** | Phiên bản app, giấy phép BTTTT |
| **Đăng xuất** | Thoát tài khoản (có xác nhận) |

---

## 13. Thông báo

**Đường dẫn:** Biểu tượng chuông trên Trang chủ → **Thông báo**

### 13.1. Hai tab

| Tab | Loại thông báo |
|-----|----------------|
| **Hệ thống** | OTP, cấp CTS thành công, cảnh báo hạn CTS… |
| **Lịch sử** | Yêu cầu ký, ký thành công, tài liệu hoàn tất… |

### 13.2. Hành vi thông báo push

| Loại | Hành vi khi bấm |
|------|-----------------|
| Yêu cầu ký (key=2) | Hộp thoại **Ký ngay** hoặc ký lô (tùy cài đặt) |
| Mã OTP (key=0) | Popup hiển thị **Mã OTP** — có thể sao chép |
| Thông báo khác | Chuyển về Trang chủ với thông tin liên quan |

> Cần **bật quyền thông báo** cho app trong cài đặt điện thoại để nhận yêu cầu ký kịp thời.

---

## 14. Mở app từ link bên ngoài

App hỗ trợ mở trực tiếp từ link (Universal Link / Deep Link):

```
https://applink.nacencomm.vn/...
apprs://...
```

**Ví dụ thường dùng:**

| Link | Mở màn hình |
|------|-------------|
| `.../app/home` | Trang chủ |
| `.../login` | Đăng nhập |
| `.../sign/{MÃ_TÀI_LIỆU}` | Ký tài liệu |
| `.../sign-batch` | Ký lô |
| `.../documents` | Quản lý tài liệu |
| `.../notifications` | Thông báo |

> Chi tiết đầy đủ xem tài liệu **[UNIVERSAL_LINK.md](./UNIVERSAL_LINK.md)**.

---

## 15. Xử lý sự cố thường gặp

### Đăng nhập & PIN

| Vấn đề | Cách xử lý |
|--------|------------|
| Nhập sai PIN nhiều lần | App cảnh báo số lần thử còn lại; quá giới hạn → tài khoản bị khóa tạm thời |
| Quên PIN | Bấm **Quên mã PIN** → liên hệ **support@cavn.vn** |
| Face ID / vân tay không hoạt động | Kiểm tra cài đặt sinh trắc trên điện thoại; bật lại trong Tài khoản → Bảo mật sinh trắc |

### Đăng ký & eKYC

| Vấn đề | Cách xử lý |
|--------|------------|
| Quét MRZ không được | Đặt CCCD phẳng, đủ ánh sáng; vùng MRZ (3 dòng cuối thẻ) nằm trong khung |
| Đọc chip NFC thất bại | Bật NFC; giữ CCCD sát vùng NFC điện thoại; thử lại từ từ |
| Xác thực khuôn mặt thất bại | Chụp ở nơi đủ sáng, không đeo kính râm/mũ che mặt |
| MRZ không hiện sau eKYC | Cập nhật app lên bản mới nhất; thực hiện lại quét MRZ |
| Đăng ký báo lỗi khi nhập mã nhân viên | Kiểm tra mã nhân viên hợp lệ với tổ chức; để trống nếu không có |

### Ký tài liệu

| Vấn đề | Cách xử lý |
|--------|------------|
| Không thấy tài liệu chờ ký | Kéo refresh Trang chủ; kiểm tra internet; đảm bảo đã đăng nhập đúng tài khoản |
| Ký báo lỗi PIN | Kiểm tra lại PIN; đảm bảo CTS còn hiệu lực |
| CTS hết hạn | Gọi **1900 5454 07** (cấp bù) hoặc **Mua thêm** gói dịch vụ |
| Không nhận push thông báo | Bật quyền thông báo; tắt chế độ tiết kiệm pin cho app |

### Kết nối & hệ thống

| Vấn đề | Cách xử lý |
|--------|------------|
| Không có internet | App hiện *"Không có kết nối internet"* — kiểm tra Wi‑Fi/4G |
| Phiên hết hạn | Đăng nhập lại bằng PIN |
| Link không mở app | Cài app từ nguồn chính thức; kiểm tra Universal Link đã verify (Android App Links) |

---

## 16. Liên hệ hỗ trợ

| Kênh | Thông tin |
|------|-----------|
| Hotline | **1900 5454 07** |
| Email | **support@cavn.vn** |
| Trong app | Tài khoản → **Trung tâm hỗ trợ** |

Khi liên hệ, hãy cung cấp:
- Họ tên, email đăng ký
- Số CCCD / mã tài khoản
- Mô tả lỗi và ảnh chụp màn hình (nếu có)
- Phiên bản app (Tài khoản → Thông tin sản phẩm)

---

## Phụ lục: Sơ đồ luồng tổng quát

```
[Lần đầu mở app]
       │
       ▼
  Giới thiệu (3 slide)
       │
       ▼
  Đăng nhập / Đăng ký
       │
       ├─── Đăng ký mới ──► 3 bước (Gói DV → Xác thực → Chụp CCCD) ──► Chờ thẩm định
       │
       └─── Đã có tài khoản
                 │
                 ▼
           Kích hoạt thiết bị (Mã TK)
                 │
                 ▼
           Xác thực OTP
                 │
                 ▼
           Thiết lập PIN
                 │
                 ▼
           Đăng nhập (PIN / Sinh trắc)
                 │
                 ▼
           ┌──── TRANG CHỦ ────┐
           │  Cần xử lý → Ký   │
           │  (+) → Tải HĐ      │
           │  Tài khoản → Cài đặt│
           └───────────────────┘
```

---

*Tài liệu này mô tả theo phiên bản app CA2 Remote Signing v1.3.5. Giao diện có thể thay đổi nhẹ giữa các bản cập nhật.*
