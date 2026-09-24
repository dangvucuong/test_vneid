# VNeID Remote Signing Gateway - Backend .NET 7

Dự án Backend ASP.NET Core (.NET 7) tích hợp **Cổng Ký Số Tập Trung Trên Nền Tảng Ứng Dụng Định Danh & Xác Thực Điện Tử VNeID** thông qua Đơn vị trung gian kết nối (RSVAN Gateway).

---

## 1. Cấu trúc Project

```
VNeIDSignGateway/
├── Common/
│   └── VNeIDConstants.cs             # Hằng số: Webhook types, mã lỗi status codes, cert/signing status
├── Configurations/
│   └── VNeIDGatewayOptions.cs        # Cấu hình kết nối (BaseUrl, Username, Password, Secret Key...)
├── Models/
│   ├── Common/
│   │   ├── ApiResponse.cs            # Envelope response chuẩn của Gateway (status, description, data)
│   │   └── ErrorResponse.cs          # Model lỗi
│   ├── Auth/
│   │   └── AuthModels.cs             # TokenRequest, TokenResponse, RefreshTokenRequest, RefreshTokenResponse
│   ├── Provider/
│   │   └── ProviderModels.cs         # ProviderItem, ServicePackItem
│   ├── Certificate/
│   │   └── CertificateModels.cs      # UserInfo, RegisterCertificateRequest/Response, CertificateStatus
│   ├── Signing/
│   │   └── SigningModels.cs          # CertificateList, SignHashRequest/Response, SignHashPolling
│   └── Webhook/
│       └── WebhookModels.cs          # WebhookPayload<T>, TranscodeData, ResultData, WebhookCallbackResponse
├── Services/
│   ├── IVNeIDAuthService.cs          # Quản lý token, tự động refresh, caching in-memory thread-safe
│   ├── VNeIDAuthService.cs
│   ├── IVNeIDGatewayClient.cs        # Client gọi 6 API nghiệp vụ của Gateway (Bearer, X-Request-Id, HMAC)
│   ├── VNeIDGatewayClient.cs
│   ├── IWebhookValidator.cs          # Xác thực chữ ký số HMAC-SHA256 trên raw body của Webhook
│   ├── WebhookValidator.cs
│   ├── IUniversalLinkBuilder.cs      # Khởi tạo link App-to-App sang VNeID (share/[$txnId], active)
│   └── UniversalLinkBuilder.cs
├── Controllers/
│   ├── VNeIDSignController.cs        # REST API cho ứng dụng nghiệp vụ gọi (Cấp CCTS, Ký Hash, Tra cứu)
│   └── VNeIDWebhookController.cs     # Endpoints tiếp nhận 4 Webhook callback từ RSVAN Gateway
├── appsettings.json                  # File cấu hình môi trường DEV/UAT
└── Program.cs                        # Cấu hình DI, Typed HttpClient, Swagger UI
```

---

## 2. Danh sách Endpoints Triển khai

### 2.1. Endpoints Nghiệp vụ (Dành cho App Doanh Nghiệp)
* `GET /api/vneid/auth/token-status`: Kiểm tra trạng thái và thời hạn token hiện tại.
* `POST /api/vneid/auth/login`: Chủ động đăng nhập lấy Token mới.
* `POST /api/vneid/auth/refresh`: Làm mới token.
* `GET /api/vneid/providers`: Lấy danh sách nhà cung cấp CA và các gói dịch vụ (API 03).
* `POST /api/vneid/certificates/register`: Gửi thông tin định danh đăng ký CCTS qua VNeID (API 04).
* `GET /api/vneid/certificates/status/{transactionCode}`: Tra cứu trạng thái đăng ký CCTS (API 05).
* `GET /api/vneid/certificates/list/{citizenPid}`: Lấy danh sách CCTS hợp lệ theo CCCD (API 06).
* `POST /api/vneid/signings/hash`: Gửi dữ liệu băm để kích hoạt yêu cầu ký trên VNeID (API 07).
* `GET /api/vneid/signings/polling/{handle}`: Tra cứu kết quả ký và nhận chuỗi chữ ký số (API 08).
* `GET /api/vneid/universal-links/{txnId}`: Sinh đường dẫn Universal Link chuyển hướng App-to-App sang VNeID.
* `POST /api/vneid/signings/calculate-digest`: Tiện ích tính hash SHA-256 Base64 của dữ liệu để test ký.

### 2.2. Endpoints Webhook (Gateway gọi về)
* `POST /api/webhook/vneid/txn-id`: Nhận `txnId` cho luồng Đăng ký CCTS (`CERT_REGISTER_WEBHOOK_TRANSCODE`).
* `POST /api/webhook/vneid/cert-result`: Nhận kết quả cấp CCTS kèm certData Base64 (`CERT_REGISTER_WEBHOOK_RESULT`).
* `POST /api/webhook/vneid/sign-transcode`: Nhận `txnId` cho luồng Ký số (`SIGNHASH_WEBHOOK_TRANSCODE`).
* `POST /api/webhook/vneid/sign-result`: Nhận kết quả mảng chữ ký số Base64 (`SIGNHASH_WEBHOOK_RESULT`).
* `POST /api/webhook/vneid/unified`: Endpoint gom chung tự động phân luồng theo `type`.

---

## 3. Cấu hình & Chạy ứng dụng

### 3.1. Cấu hình `appsettings.json`
Các thông số DEV/Test đã được cấu hình sẵn:
```json
{
  "VNeIDGateway": {
    "BaseUrl": "https://uat-rsvan-gw.vmgmedia.vn",
    "Username": "CA2",
    "Password": "",
    "OriginatorCode": "CA2_SignPlatform",
    "WebhookSecretKey": "",
    "UniversalLinkShareBaseUrl": "https://universal.dancuquocgia.com/share",
    "UniversalLinkActiveBaseUrl": "http://universal.dancuquocgia.com/screen/SmartCAActive/id="
  }
}
```

### 3.2. Lệnh chạy dự án
```bash
# Di chuyển vào thư mục dự án
cd VNeIDSignGateway

# Build & Run
dotnet run
```
Sau khi chạy, mở trình duyệt truy cập:
👉 **`http://localhost:5000`** hoặc **`https://localhost:5001`** để xem giao diện **Swagger UI** trực quan.
