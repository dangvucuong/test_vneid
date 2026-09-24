# Quy trình các phase — console kiểm thử VNeID

Console React (`vneid-sign-console`) gọi backend `VNeIDSignGateway`. Gateway giữ token RSVAN, HMAC và chữ ký webhook. Frontend không gọi thẳng `https://uat-rsvan-gw.vmgmedia.vn`.

Cổng local:

- Gateway: `http://localhost:5244`
- Console: `http://localhost:5173`

Envelope nghiệp vụ: `status = 01` là thành công. Mã `00` là token hết hạn, `02` là dữ liệu không hợp lệ, `26` là HMAC webhook sai.

## Phase 0 — Mở gateway cho console

Đã xong.

- CORS cho `http://localhost:5173` và `http://127.0.0.1:5173`.
- Kho webhook trong bộ nhớ, tối đa 300 bản ghi, chỉ lưu sau khi chữ ký `X-Webhook-Signature` hợp lệ.
- `GET /api/vneid/events?since=&limit=` để console đọc `txnId`, `transactionCode`, `handle`.
- Service đăng nhập là một instance dùng chung, để Login và Refresh giữ được token.

## Phase 1 — Khung console và trang Kết nối

Đã xong.

- App Vite + React + TypeScript, React Router, TanStack Query.
- `src/api/client.ts` gắn `X-Request-Id` và đọc lỗi.
- `src/api/types.ts` và `src/api/vneid.ts` bọc các API gateway.
- Trang Kết nối: trạng thái token, đếm ngược hạn token, nút Login, Refresh, Kiểm tra lại.
- Tài khoản RSVAN nằm trong `appsettings.json` trên máy chạy gateway, không nhập trên console.

## Phase 2 — Nhà cung cấp và đăng ký CCTS

Đã xong.

1. `GET /api/vneid/providers`. Bảng nhà cung cấp, trạng thái, gói, số tháng, đơn giá, miễn phí hay trả phí.
2. Nút **Chọn gói** lưu `provider` và `servicePackCode` vào phiên trình duyệt.
3. Form đăng ký điền định danh. `originatorCode` mặc định `CA2_SignPlatform`.
4. CCCD không được trống. Ngày phải đúng `DD/MM/YYYY`.
5. `POST /api/vneid/certificates/register`. Console hiện `status`, `description` và lưu `transactionCode`.

## Phase 3 — Kích hoạt chứng thư trên VNeID

Chưa làm.

Sau khi có `transactionCode`:

1. Poll `GET /api/vneid/certificates/status/{transactionCode}` mỗi 3–5 giây. `statusCode`: `0` thành công, `1` thất bại, `2` đang xử lý, `3` đã tạo chứng thư nhưng chưa kích hoạt.
2. Đọc `GET /api/vneid/events`, lọc `CERT_REGISTER_WEBHOOK_TRANSCODE` cùng `transactionCode`.
3. Khi có `txnId`, gọi `GET /api/vneid/universal-links/{txnId}` và hiện QR `shareConsentUrl`. Link kích hoạt lại là `reactivateUrl`.
4. Khi có `CERT_REGISTER_WEBHOOK_RESULT` hoặc `statusCode = 0`, hiện `serialNumber`, `certificateId`, `certificateData`.

Người dân xác nhận trên app VNeID. Máy dev cần URL public trỏ về `POST /api/webhook/vneid/unified` nếu muốn nhận webhook. Không có webhook thì vẫn tra được bằng API status.

## Phase 4 — Danh sách chứng thư và ký hash

Danh sách chứng thư đã xong. Ký hash chưa làm.

Đã có trang Danh sách CCTS:

1. Nhập CCCD, hoặc lấy CCCD đã lưu từ form đăng ký.
2. `GET /api/vneid/certificates/list/{citizenPid}`.
3. Mỗi chứng thư hiện serial, chủ thể, nhà phát hành, hiệu lực, nhà cung cấp, trạng thái, luồng xác thực, trạng thái khóa, độ dài khóa và OID thuật toán.
4. **Dùng chứng thư này** lưu `credentialID` vào phiên. Tài liệu RSVAN lấy giá trị này từ `serialNumber`.

Chưa có trang Ký hash. Khi làm tiếp:

1. `POST /api/vneid/signings/calculate-digest` để lấy SHA-256 Base64 phục vụ smoke test. Digest PDF thật không phải SHA-256 của cả file.
2. `POST /api/vneid/signings/hash` với `credentialID`, `originatorCode` và mảng `documents`. Lưu `handle`, `expiresIn` (mặc định 300 giây).
3. Poll `GET /api/vneid/signings/polling/{handle}`. `statusCode`: `0` thành công, `1` thất bại, `2` đang xử lý, `3` người dân từ chối.
4. Event `SIGNHASH_WEBHOOK_TRANSCODE` đưa `txnId` để mở universal link. Event `SIGNHASH_WEBHOOK_RESULT` đưa mảng `signatures` cùng thứ tự với `documents`.

Ghép chữ ký vào PDF cần image băm do RS HUB cung cấp. Console dừng ở chuỗi chữ ký Base64.

## Phase 5 — Nhật ký webhook

API đã có. Trang console chưa làm.

`GET /api/vneid/events` trả timeline. Trang sẽ lọc theo `type`, hiện JSON và có nút gắn `txnId`, `handle`, `transactionCode` vào phiên. Toast map mã `00`, `01`, `02`, `03`, `20`–`27`, `99`, kèm `X-Request-Id`.

## Thứ tự còn lại

Làm phase 3, phần ký hash của phase 4, rồi phase 5. Phase 3 và ký hash cần điện thoại có app VNeID và CCCD đã được UAT chấp nhận.
