# Ghi chú: link email điền sẵn mã kích hoạt

Ghi ngày 27/10/2026. Làm tiếp trên máy công ty.

Tài liệu deep link hiện có: `docs/UNIVERSAL_LINK.md`. Route `/activate` đã map tới màn `Kichhoat`. Phần dưới là việc còn phải làm.

## Mục tiêu

Khi cấp mã kích hoạt, email gửi một link.

- Đã cài app: bấm link mở app, ô mã kích hoạt được điền sẵn.
- Chưa cài app: bấm link mở store. Android sau khi cài, lần mở app đầu (kể cả từ icon) đã có mã. iPhone sau khi cài, khách bấm nút «Mở ứng dụng» trên trang link thì app mở và ô đã có mã.
- Cài tay từ store, không qua link: ô để trống, nhập bình thường.
- Không khóa ô. Chỉ điền mã. Khách vẫn sửa được.

## Link trong email

```
https://applink.nacencomm.vn/activate?c=<mã kích hoạt>
```

Gắn thẳng mã kích hoạt vào `c`. Không làm token, không thêm API đổi token.

Token (không làm) chỉ là mã vé ngẫu nhiên thay cho mã trên link: app gửi vé lên server, server trả mã thật, để link không chứa mã. Email đã gửi đúng khách nên không cần.

Nếu muốn URL không hiện mã thô: hệ thống gửi mail mã hóa chuỗi rồi gắn vào `c`. App giải mã cùng thuật toán và điền mã đã giải. Khóa giải nằm trong app thì người cố ý vẫn lấy được. Chưa chốt thuật toán thì gắn mã thô cho nhanh.

Mã trên query phải URL-encode.

## Ba tình huống

### 1. Đã có app (iOS và Android)

Universal Link / App Link mở thẳng app vào màn kích hoạt.

- Domain: `https://applink.nacencomm.vn`
- iOS: `applinks:applink.nacencomm.vn`, bundle `com.ca2.remotesigning`, team `K4TYT9SR2P`
- Android: package `com.rs.ca2`, intent-filter `autoVerify` đã có trong `android/app/src/main/AndroidManifest.xml`
- Route: `Kichhoat: "activate"` trong `utils/deepLinkHandler.js`
- React Navigation đưa `c` vào `route.params`

Việc app: `screen/KichHoat/kichhoat.jsx` đọc `route.params.c`, điền vào `TextInput`. Ô vẫn `editable`.

### 2. Chưa có app — Android

Trang web chuyển CH Play kèm referrer:

```
https://play.google.com/store/apps/details?id=com.rs.ca2&referrer=c%3D<mã đã encode>
```

Lần đầu mở app sau khi cài, app đọc Play Install Referrer, lấy `c`, lưu lại và điền khi vào màn kích hoạt. Xóa mã đã lưu sau khi kích hoạt thành công (đã sang màn OTP).

Cài organic, không qua link này: referrer không có `c`, ô để trống.

Chỉ đúng với bản cài từ CH Play. Cài APK ngoài store thì không có referrer; lúc đó khách bấm lại link sau khi đã cài.

### 3. Chưa có app — iPhone

App Store không đưa query của link vào lần mở app đầu tiên từ icon. Không dùng SDK đoán thiết bị (Branch, AppsFlyer, fingerprint IP): nhiều máy chung mạng có thể gán nhầm mã kích hoạt của khách khác.

Trang web:

- Nút tải: App Store.
- Nút «Mở ứng dụng»: `apprs://activate?c=<mã>`

Cài xong, tab trang vẫn còn. Khách bấm «Mở ứng dụng». Scheme `apprs` mở app và điền mã. Dùng scheme này vì bấm Universal Link ngay trên trang cùng domain thường không thoát Safari.

## Trang web `applink.nacencomm.vn`

Cần có trên server (không nằm trong repo app):

1. `https://applink.nacencomm.vn/.well-known/apple-app-site-association`
2. `https://applink.nacencomm.vn/.well-known/assetlinks.json` — SHA-256 của keystore ký bản store
3. Trang `/activate` đọc query `c`

Hành vi trang `/activate`:

- Android: intent mở app nếu đã cài, không thì fallback CH Play kèm `referrer`.
- iPhone: nút App Store và nút «Mở ứng dụng» (`apprs://activate?c=`).
- Hai file well-known trả `application/json`, HTTPS, không redirect.

Gợi ý intent Android:

```
intent://activate?c=<mã>#Intent;scheme=apprs;package=com.rs.ca2;S.browser_fallback_url=<url Play kèm referrer>;end
```

## Sửa trong app

Bản trên store chưa đọc `c`. Phải build và phát hành bản mới thì mới tự điền.

1. `screen/KichHoat/kichhoat.jsx`
   - Nếu có `route.params.c` thì điền vào state `text`.
   - Nếu không có param, đọc mã pending từ AsyncStorage (nguồn Install Referrer).
   - Không đặt `editable={false}`.
   - Sau khi API trả `"1"` và đã `navigate("OTP")`, xóa mã pending.

2. Android Install Referrer, đọc một lần lúc mở app
   - Lấy referrer, parse `c`.
   - Lưu AsyncStorage (ví dụ `@pending_activation_code`) nếu màn kích hoạt chưa mở.
   - Thư viện gợi ý: `react-native-play-install-referrer`. Project có sẵn thư mục `android/` (Expo prebuild), thêm dependency native rồi build lại.

3. Không sửa luồng API `Ketnoithietbi_mobilesign`. Vẫn gửi mã thật trong `idcts`.

4. Không khóa ô. Không thêm màn đăng nhập. Không đụng ký VNeID / edoc.

## Kiểm tra

- Đã cài: bấm link email → vào màn kích hoạt, ô có mã, vẫn sửa và xóa được.
- Android chưa cài: bấm link → CH Play → cài → mở từ icon → vào màn kích hoạt, ô có mã.
- Android cài tay từ store, không qua link: ô trống.
- iPhone chưa cài: bấm link → App Store. Cài xong quay lại trang, bấm «Mở ứng dụng» → ô có mã.
- iPhone mở từ icon ngay sau khi cài, không bấm lại trang: ô trống. Đây là giới hạn đã chốt, không xử lý bằng SDK.
- Mã có ký tự đặc biệt vẫn sống sót qua URL và referrer (encode).
