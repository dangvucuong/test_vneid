# Tài liệu Universal Link & Deep Link — CA2 Remote Signing

> Phiên bản app tham chiếu: **1.3.5** (Android `com.rs.ca2`, iOS `com.ca2.remotesigning`)  
> Cập nhật: 30/06/2026

---

## 1. Tổng quan

App CA2 RS hỗ trợ mở trực tiếp từ link bên ngoài (email, SMS, web, QR code…) thông qua:

| Loại | Giá trị | Mục đích |
|------|---------|----------|
| **Universal Link (HTTPS)** | `https://applink.nacencomm.vn/...` | Link chuẩn, mở app nếu đã cài; fallback web nếu chưa cài |
| **Custom URL Scheme** | `apprs://...` | Deep link nội bộ; được chuẩn hóa sang domain HTTPS khi xử lý |

Hai cơ chế xử lý song song:

1. **React Navigation Linking** (`LINKING_CONFIG` trong `utils/deepLinkHandler.js`) — ánh xạ path → màn hình tự động.
2. **Handler thủ công** (`handleDeepLink`) — xử lý các URL đặc biệt (callback ký, token, v.v.).

Listener được đăng ký trong `App.js` qua `setupDeepLinkListeners()`.

---

## 2. Cấu hình hệ thống

### 2.1. Domain & Scheme

| Thành phần | Giá trị |
|------------|---------|
| Domain Universal Link | `applink.nacencomm.vn` |
| URL scheme | `apprs` |
| Prefix được chấp nhận | `apprs://`, `https://applink.nacencomm.vn` |

**File cấu hình:**

- `app.json` — `scheme: "apprs"`, iOS `associatedDomains`
- `android/app/src/main/AndroidManifest.xml` — intent-filter HTTPS + scheme
- `utils/deepLinkHandler.js` — logic routing

### 2.2. Android

```xml
<!-- Custom scheme -->
<data android:scheme="apprs" />
<data android:scheme="exp+apprs" />

<!-- Universal Link (App Links) -->
<intent-filter android:autoVerify="true">
  <data android:scheme="https"
        android:host="applink.nacencomm.vn"
        android:pathPrefix="/" />
</intent-filter>
```

| Thuộc tính | Giá trị |
|------------|---------|
| Package name | `com.rs.ca2` |
| Launch mode | `singleTask` (một instance, nhận link mới qua intent) |
| Xác minh domain | `android:autoVerify="true"` |

**File xác minh server:**  
`https://applink.nacencomm.vn/.well-known/assetlinks.json`  
(phải khai báo SHA-256 fingerprint của keystore ký app)

### 2.3. iOS

| Thuộc tính | Giá trị |
|------------|---------|
| Bundle ID | `com.ca2.remotesigning` |
| Apple Team ID | `K4TYT9SR2P` |
| Associated Domains | `applinks:applink.nacencomm.vn` |

**File xác minh server:**  
`https://applink.nacencomm.vn/.well-known/apple-app-site-association`

```json
{
  "applinks": {
    "details": [{
      "appID": "K4TYT9SR2P.com.ca2.remotesigning",
      "paths": ["*", "/path/*"]
    }]
  }
}
```

> **Lưu ý:** Package/bundle Android và iOS khác nhau — cần cấu hình riêng trên server cho từng nền tảng.

---

## 3. Danh sách chức năng theo URL

### 3.1. Bảng tổng hợp

| # | Chức năng | URL mẫu | Màn hình đích | Trạng thái |
|---|-----------|---------|---------------|------------|
| 1 | Màn hình khởi động | `https://applink.nacencomm.vn/` | `Start2` | ✅ Linking tự động |
| 2 | Đăng nhập | `https://applink.nacencomm.vn/login` | `Login` | ✅ |
| 3 | Kích hoạt chứng thư | `https://applink.nacencomm.vn/activate` | `Kichhoat` | ✅ Linking tự động |
| 4 | Trang chủ | `https://applink.nacencomm.vn/home` hoặc `/app/home` | `HomeWrapper` → tab Home | ✅ |
| 5 | Tài khoản | `https://applink.nacencomm.vn/account` hoặc `/app/account` | `HomeWrapper` → tab TaiKhoan | ✅ |
| 6 | Ký tài liệu (theo mã) | `https://applink.nacencomm.vn/sign/{code}` | `KyTaiLieu` | ⚠️ Xem mục 4.2 |
| 7 | Ký lô tài liệu | `https://applink.nacencomm.vn/sign-batch` | `KyLoTaiLieu` | ✅ |
| 8 | Quản lý tài liệu | `https://applink.nacencomm.vn/documents` | `QuanLyTaiLieuList` | ✅ Linking tự động |
| 9 | Thông báo | `https://applink.nacencomm.vn/notifications` | `ListNotify` | ✅ Linking tự động |
| 10 | Callback ký (server) | `https://applink.nacencomm.vn/callback?action=sign&code=...` | `KyTaiLieu` | ⚠️ Xem mục 4.2 |
| 11 | Callback token | `https://applink.nacencomm.vn/callback?token=...` | `Home` (+ `deepLinkToken`) | ⚠️ Chưa xử lý token |
| 12 | Callback VNeID (đăng ký) | `https://applink.nacencomm.vn/callback/vneid/{data}` | `VneidForm` (khi đang mở) | ✅ Trong luồng VNeID |

Tương đương custom scheme:

```
apprs://login
apprs://sign/ABC123
apprs://callback?action=sign&code=ABC123
```

---

## 4. Chi tiết từng luồng

### 4.1. Điều hướng màn hình thông thường

**Cách dùng:** Gửi link cho người dùng, họ bấm vào → app mở đúng màn hình (nếu đã cài và đã đăng nhập khi cần).

| Mục đích | Link |
|----------|------|
| Về màn onboarding | `https://applink.nacencomm.vn/` |
| Mở form đăng nhập | `https://applink.nacencomm.vn/login` |
| Kích hoạt CTS | `https://applink.nacencomm.vn/activate` |
| Trang chủ | `https://applink.nacencomm.vn/app/home` |
| Tab tài khoản | `https://applink.nacencomm.vn/app/account` |
| Danh sách tài liệu | `https://applink.nacencomm.vn/documents` |
| Danh sách thông báo | `https://applink.nacencomm.vn/notifications` |
| Ký lô | `https://applink.nacencomm.vn/sign-batch` |

**Ví dụ QR / email:**

```
Bấm để mở app CA2 RS:
https://applink.nacencomm.vn/app/home
```

---

### 4.2. Ký tài liệu qua link

Luồng phổ biến khi hệ thống backend gửi yêu cầu ký từ xa.

#### Cách 1 — Path trực tiếp

```
https://applink.nacencomm.vn/sign/{CODE}
```

- `{CODE}`: mã tài liệu chờ ký (trùng field `Code` trong API danh sách chờ ký).
- Handler lưu `global.code = CODE` và điều hướng tới `KyTaiLieu`.

#### Cách 2 — Callback query string

```
https://applink.nacencomm.vn/callback?action=sign&code={CODE}
```

hoặc dùng `token` thay `code`:

```
https://applink.nacencomm.vn/callback?action=sign&token={CODE}
```

**Luồng xử lý (`handleDeepLink`):**

1. Parse URL → path `/callback`
2. Nếu `action=sign` và có `code` hoặc `token` → gán `global.code`
3. Navigate `KyTaiLieu` với param `{ code }`

**Điều kiện để ký thành công:**

- User đã đăng nhập, có PIN/biometric (tùy cấu hình).
- Tài liệu `{CODE}` tồn tại trong danh sách chờ ký của thiết bị (`getPendingSignList`).
- Chứng thư số còn hiệu lực.

> ⚠️ **Hạn chế hiện tại:** Màn `KyTaiLieu` yêu cầu param `item` (object đầy đủ từ API), trong khi deep link chỉ truyền `code`. Luồng ký qua link **cần user đã login** và tài liệu phải có trong DS chờ ký; nếu không, màn hình có thể báo *"Không tìm thấy tài liệu cần ký"*. Luồng ký đầy đủ hơn hiện có qua **push notification** (App.js → `Kyngay()` → load item từ API rồi mới navigate).

---

### 4.3. Callback token (SSO / xác thực)

```
https://applink.nacencomm.vn/callback?token={TOKEN}
```

**Hành vi hiện tại:**

- Navigate tới `HomeWrapper` → `Home` với param `deepLinkToken: token`.
- **Chưa có code xử lý `deepLinkToken` trên màn Home** — token chưa được dùng để auto-login hay gọi API.

> Dùng cho tích hợp tương lai (SSO, magic link đăng nhập). Backend cần phối hợp thêm phía client.

---

### 4.4. Luồng VNeID (đăng ký eKYC qua VNeID)

**Không phải universal link chính của app**, nhưng dùng cùng domain callback.

#### Bước 1 — User nhập CCCD trên `VneidForm`

App gọi API init:

```
POST https://loginvneid.nacencomm.vn/biometric-share-info/init
Body: { "cccd": "..." }
```

#### Bước 2 — Mở app VNeID (link ngoài)

```
https://webvneid2.teca.vn/share/{txnId}
```

#### Bước 3 — VNeID redirect về app

```
https://applink.nacencomm.vn/callback/vneid/{encodedData}
```

- `{encodedData}`: chuỗi URL-encoded, phần transaction nằm trước dấu `|`.
- **Chỉ xử lý khi màn `VneidForm` đang mở** (listener riêng trong `VneidForm.tsx`).

#### Bước 4 — App lấy dữ liệu giao dịch

```
POST https://loginvneid.nacencomm.vn/biometric-share-info/get-transaction
Body: { "tnx": "..." }
```

→ Trả dữ liệu cá nhân → màn `VneidData` → tiếp tục đăng ký.

---

## 5. Sơ đồ luồng tổng quát

```
                    ┌─────────────────────────┐
                    │  Link bên ngoài         │
                    │  (HTTPS / apprs://)     │
                    └───────────┬─────────────┘
                                │
              ┌─────────────────┴─────────────────┐
              │                                   │
    React Navigation Linking              handleDeepLink()
    (path → screen mapping)              (logic đặc biệt)
              │                                   │
              ▼                                   ▼
    Start2, Login, Kichhoat,            /callback?action=sign
    Home, Account, Documents,           /sign/:code
    Notifications, KyLoTaiLieu          /callback?token
              │                                   │
              └─────────────────┬─────────────────┘
                                ▼
                         Màn hình đích
```

---

## 6. Cách test

### 6.1. Android (ADB)

```bash
# Universal Link
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://applink.nacencomm.vn/app/home" com.rs.ca2

# Custom scheme
adb shell am start -W -a android.intent.action.VIEW \
  -d "apprs://sign/MA_TAI_LIEU" com.rs.ca2

# Callback ký
adb shell am start -W -a android.intent.action.VIEW \
  -d "https://applink.nacencomm.vn/callback?action=sign&code=MA_TAI_LIEU" com.rs.ca2
```

### 6.2. iOS (Simulator / thiết bị)

```bash
xcrun simctl openurl booted "https://applink.nacencomm.vn/login"
xcrun simctl openurl booted "apprs://app/home"
```

### 6.3. Kiểm tra App Links (Android)

```bash
adb shell pm get-app-links com.rs.ca2
```

Trạng thái mong đợi: `applink.nacencomm.vn` → **verified**.

### 6.4. Checklist QA

- [ ] Link mở app khi app đang chạy nền (foreground/background)
- [ ] Link mở app khi app đã tắt (cold start)
- [ ] Link ký mở đúng tài liệu khi user đã login + có tài liệu chờ ký
- [ ] Link `/login`, `/app/home` hoạt động trên cả Android & iOS
- [ ] VNeID: callback `/callback/vneid/...` khi đang ở màn VNeID

---

## 7. Tích hợp phía Backend / Marketing

### Gửi link ký tài liệu

```html
<a href="https://applink.nacencomm.vn/callback?action=sign&code={{DOCUMENT_CODE}}">
  Ký tài liệu trên CA2 RS
</a>
```

### Gửi link về trang chủ sau xác thực web

```
https://applink.nacencomm.vn/app/home
```

### QR Code

Encode URL HTTPS (không dùng `apprs://` trong QR công khai — HTTPS universal link ưu tiên hơn).

---

## 8. File mã nguồn liên quan

| File | Vai trò |
|------|---------|
| `utils/deepLinkHandler.js` | Cấu hình prefix, mapping path, handler thủ công |
| `App.js` | `linking={LINKING_CONFIG}`, `setupDeepLinkListeners()` |
| `screen/RootNavigation.js` | `navigationRef` cho navigate từ handler |
| `android/app/src/main/AndroidManifest.xml` | Intent filter Android App Links |
| `app.json` | Scheme `apprs`, iOS associated domains |
| `screen/DangKy/VneidForm.tsx` | Callback VNeID riêng cho luồng đăng ký |

---

## 9. Hạn chế & việc cần làm thêm

| # | Vấn đề | Mô tả | Đề xuất |
|---|--------|-------|---------|
| 1 | `deepLinkToken` chưa dùng | Home nhận param nhưng không xử lý | Implement auto-login / refresh session từ token |
| 2 | Deep link ký thiếu `item` | `KyTaiLieu` cần object từ API | Trong handler: gọi `getPendingSignList`, tìm theo `code`, rồi navigate với `{ item }` |
| 3 | Package khác nhau | Android `com.rs.ca2` vs iOS `com.ca2.remotesigning` | Duy trì 2 entry trong assetlinks.json và AASA |
| 4 | VNeID callback | Chỉ hoạt động khi `VneidForm` active | Cân nhắc chuyển handler vào `deepLinkHandler.js` global |
| 5 | `/documents`, `/notifications` | Chỉ qua Linking tự động, không có trong `handleDeepLink` | Đủ cho use case hiện tại; bổ sung handler nếu cần query params |

---

## 10. Tham chiếu nhanh URL

```
# Điều hướng
https://applink.nacencomm.vn/
https://applink.nacencomm.vn/login
https://applink.nacencomm.vn/activate
https://applink.nacencomm.vn/app/home
https://applink.nacencomm.vn/app/account
https://applink.nacencomm.vn/documents
https://applink.nacencomm.vn/notifications

# Ký
https://applink.nacencomm.vn/sign/{CODE}
https://applink.nacencomm.vn/sign-batch
https://applink.nacencomm.vn/callback?action=sign&code={CODE}

# Token (chưa implement đầy đủ)
https://applink.nacencomm.vn/callback?token={TOKEN}

# VNeID (luồng đăng ký)
https://applink.nacencomm.vn/callback/vneid/{ENCODED_DATA}

# Custom scheme (tương đương)
apprs://login
apprs://sign/{CODE}
apprs://callback?action=sign&code={CODE}
```
