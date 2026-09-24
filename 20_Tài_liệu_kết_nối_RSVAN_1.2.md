




Tài liệu kết nối vào dịch vụ
## “CỔNG KÝ SỐ TẬP TRUNG TRÊN NỀN TẢNG
## ỨNG DỤNG ĐỊNH DANH VÀ XÁC THỰC ĐIỆN TỬ
## VNEID”

## ***

Dành cho “Đơn vị khai thác qua trung gian kết nối”




Phiên bản : 1.2

Tên tài liệu

Tiêu đề:  Tài liệu kết nối dịch vụ Cổng ký số tập trung
Dành cho đơn vị khai thác qua trung gian kết nối
Tên file tài liệu



























Các phiên bản
Phiên bản Ngày phát
hành
Các sửa đổi Mục sửa đổi
1.0 2026/04/07 1/ Tạo mới
1.1 2026/05/21 1/ Cập nhật : Thêm API
refresh token
Mục III.2
1.2 2026/06/01 1/Cập nhật nội dung Header
của các API Webhook nhận
thông tin
Mục IV: 1.1, 2.1
Mục VI: 1.1, 2.1






















































Mục lục
I. MÔ HÌNH TỔNG QUAN KẾT NỐI ...................................................................... 2
- Mô hình ................................................................................................................... 2
- Giải thích chức năng nhiệm vụ ............................................................................... 2
2.1 Application (Đơn vị khai thác: Ngân hàng, Bệnh viện, Doanh nghiệp...) ....... 2
2.2 Đơn vị trung gian kết nối (GateWay) ............................................................... 2
2.3 RAR RS HUB .................................................................................................. 3
2.4 RS-CA .............................................................................................................. 3
II. QUY TRÌNH THỰC HIỆN .................................................................................... 3
- Quy trình đăng ký chứng thư số .............................................................................. 3
- Quy trình đăng ký chữ ký số ................................................................................... 5
III. CÁC ĐẦU HÀM KẾT NỐI. ................................................................................... 7
- Quy định về xác thực và bảo mật ............................................................................ 7
1.1 Tổng quan ........................................................................................................ 7
1.2 API Specs ......................................................................................................... 7
1.3 Request Body ................................................................................................... 8
1.4 Response body ................................................................................................. 8
- API refresh token .................................................................................................. 10
2.1 API Specs ....................................................................................................... 10
2.2 Request body .................................................................................................. 10
2.3 Response body ............................................................................................... 11
- Đầu hàm kết nối lấy danh sách nhà cung cấp kèm gói dịch vụ ............................. 12
3.1 API Specs ....................................................................................................... 12
3.2 Response body ............................................................................................... 12
- API kết nối nghiệp vụ đăng ký chứng thư chữ ký số ............................................ 15
4.1 API Specs ....................................................................................................... 15
4.2 Request body .................................................................................................. 16
4.3 Response body ............................................................................................... 18
- API kết nối tra cứu kết quả của yêu cầu ................................................................ 19
5.1 API Specs ....................................................................................................... 19
5.2 Request body .................................................................................................. 19
5.3 Response body ............................................................................................... 20
## IV. DANH SÁCH CÁC ĐẦU HÀM ĐƠN VỊ KẾT NỐI CẦN XÂY DỰNG CHO
NGHIỆP VỤ ĐĂNG KÝ CHỨNG THƯ CHỮ KÝ SỐ ................................................. 22
- Webhook nhận thông tin mã giao dịch đăng ký (txnId) ......................................... 22
1.1 API Specs ....................................................................................................... 22
1.2 Request body .................................................................................................. 23
1.3 Response body ............................................................................................... 23
- Webhook nhận thông tin chứng thư và kết quả đăng ký ........................................ 24
2.1 API Specs ....................................................................................................... 24
2.2 Request body .................................................................................................. 26
2.3 Response body ............................................................................................... 27
- Hướng dẫn chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng của
đơn vị kết nối (áp dụng nghiệp vụ Đăng ký chứng thư chữ ký số) .............................. 27
3.1 Đối với chiều chuyển hướng app-to-app từ app của đơn vị kết nối sang app
VneID ....................................................................................................................... 27

3.2 Đối với chiều chuyển hướng app-to-app từ app VNeID sang app của đơn vị
kết nối ....................................................................................................................... 27
3.3 Trường hợp người dùng thoát ra giữa chừng, mà app của đơn vị kết nối muốn
gọi lại vào đúng màn hình chứng thư chữ ký số cần kích hoạt ................................ 28
## V. DANH SÁCH CÁC ĐẦU HÀM KẾT NỐI NGHIỆP VỤ KÝ ............................ 29
- API lấy danh sách chứng thư chữ ký số ................................................................ 29
1.1 API Specs ....................................................................................................... 29
1.2 Request body .................................................................................................. 30
1.3 Response body ............................................................................................... 30
- API kết nối nghiệp vụ ký số theo dữ liệu băm ...................................................... 32
2.1 API Specs ....................................................................................................... 32
2.2 Request body .................................................................................................. 33
2.3 Response body ............................................................................................... 34
- API kết nối tra cứu kết quả của yêu cầu................................................................ 34
3.1 API Specs ....................................................................................................... 34
3.2 Request body .................................................................................................. 35
3.3 Response body ............................................................................................... 36
## VI. DANH SÁCH CÁC ĐẦU HÀM ĐƠN VỊ KẾT NỐI CẦN XÂY DỰNG CHO
NGHIỆP VỤ KÝ ............................................................................................................. 37
- Webhook nhận thông tin mã giao dịch ký (txnId) .................................................. 37
1.1 API Specs ....................................................................................................... 37
1.2 Request body .................................................................................................. 38
1.3 Response body ............................................................................................... 39
- Webhook nhận kết quả ký ..................................................................................... 40
2.1 API Specs ....................................................................................................... 40
2.2 Request body .................................................................................................. 41
2.3 Response body ............................................................................................... 42
- Hướng dẫn chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng của
đơn vị kết nối (áp dụng nghiệp vụ Đăng ký chứng thư chữ ký số) .............................. 43
3.1 Đối với chiều chuyển hướng app-to-app từ app của đơn vị kết nối sang app
VneID ....................................................................................................................... 43
3.2 Đối với chiều chuyển hướng app-to-app từ app VNeID sang app của đơn vị
kết nối ....................................................................................................................... 43
3.3 Trường hợp người dùng thoát ra giữa chừng, mà app của đơn vị kết nối muốn
gọi lại vào đúng màn hình chứng thư chữ ký số cần kích hoạt ................................ 43
VII. BẢNG MÃ LỖI STATUS ..................................................................................... 44











## 2

## I. MÔ HÌNH TỔNG QUAN KẾT NỐI
Quy trình nghiệp vụ cấp phát chứng thư số cho người dân khi hoàn thành, các
Đơn vị khai thác (đơn vị ứng dụng) cần thực hiện tích hợp hệ thống để triển khai ký số
vào các bài toán nghiệp vụ thực tế. Trong mô hình này, quá trình tương tác và trao đổi
dữ liệu sẽ được thực hiện thông qua Đơn vị trung gian kết nối.
Đơn vị trung gian đóng vai trò là cổng chuyển tiếp (Gateway), tiếp nhận yêu
cầu từ Đơn vị khai thác để điều phối vào hệ thống RAR RS HUB, từ đó kết nối tới các
phân hệ ký số của đơn vị RS-CA. Để đảm bảo tính thống nhất và bảo mật, Đơn vị khai
thác cần thực hiện xây dựng cấu hình kết nối tuân thủ các tiêu chuẩn dữ liệu, giao thức
xác thực và quy trình nghiệp vụ được quy định chi tiết trong tài liệu này.
- Mô hình
(Mô hình này có thể thay đổi đôi chút khi vào ứng dụng thực tế, sẽ được
hướng dẫn theo từng đầu hàm )



- Giải thích chức năng nhiệm vụ
2.1 Application (Đơn vị khai thác: Ngân hàng, Bệnh viện, Doanh nghiệp...)
Là các ứng dụng nghiệp vụ cần triển khai giải pháp ký số cho người dùng cuối.
Trong mô hình này, Application không kết nối trực tiếp tới RAR RS HUB mà thực
hiện tương tác thông qua Đơn vị trung gian kết nối.
2.2 Đơn vị trung gian kết nối (GateWay)
Gateway đóng vai trò là điểm tập trung xử lý toàn bộ giao tiếp giữa ứng dụng
đích ký và RS-HUB, đồng thời là nơi quản lý thông tin đối tác, ứng dụng, gói dịch vụ
và các giao dịch phát sinh trong quá trình cung cấp dịch vụ ký số.
- Cung cấp API trung gian để tích hợp và điều phối các nghiệp vụ ký số


## 3

giữa ứng dụng đích ký và RS-HUB.
- Quản lý đối tác, ứng dụng tích hợp và các gói dịch vụ ký số.
- Tiếp nhận, xác thực và phân phối webhook từ RS-HUB, đảm bảo đồng
bộ trạng thái giao dịch.
- Quản lý, lưu trữ và đối soát giao dịch ký số.
- Cung cấp portal quản trị và portal đối soát phục vụ công tác vận hành và
khách hàng.
## 2.3 RAR RS HUB
Là thành phần trung gian cho quá trình ký số giữa các thành phần bao gồm:
- Nhận yêu cầu ký số từ phần mềm nghiệp vụ
- Trao đổi để xác nhận nhu cầu ký số với ứng dụng mobile VNeID
- Tương tác, truyền dữ liệu ký số và xác nhận ký số qua RS-CA và nhận
dữ liệu chữ ký về để trả về cho các ứng dụng kết nối
## 2.4 RS-CA
Là thành phần gốc xử lý nghiệp vụ ký bằng cách
- Kiểm tra người dùng và thiết bị đã đăng ký
- Kết nối HSM để ký số dữ liệu và trả về chữ ký tương ứng
## II. QUY TRÌNH THỰC HIỆN
- Quy trình đăng ký chứng thư số
Mô tả quy trình chi tiết:
Bước 1: Người dùng đăng nhập vào ứng dụng của Đơn vị khai thác và chọn
chức năng "Đăng ký chữ ký số VNeID".
Bước 2: Đơn vị khai thác thu thập thông tin định danh cơ bản và yêu cầu
người dùng xác nhận điều khoản sử dụng dịch vụ.
Bước 3: Đơn vị khai thác gọi API đăng ký tới Đơn vị trung gian.
API tương tác: /api/certificates/register
Bước 4: Gửi thông tin đăng ký cho RS HUB theo tiêu chuẩn kết nối của
## RAR RS HUB
Bước 5: RS HUB sẽ trả lại cho đại lý 1 transactionCode
Bước 6: RAR RS HUB gửi thông báo (Push Notification) "Yêu cầu đăng ký
cấp phát chứng thư số" tới ứng dụng VNeID trên thiết bị của người dân.
Bước 7: Người dân thực hiện các thao tác xác thực trên ứng dụng VNeID:
Mở thông báo và kiểm tra thông tin đơn vị yêu cầu cấp phát.
Xác nhận đồng ý các cam kết và điều khoản cấp phát chứng thư số.
Người dân nhập passcode
Người dân sinh trắc học sinh khóa kích hoạt
Bước 8: VNeID gửi kết quả xác thực thành công về RAR RS HUB.
Bước 9: RAR RS HUB lệnh cho hệ thống RS-CA thực hiện tạo chứng thư số
và lưu trữ khóa bí mật an toàn trong HSM.
Bước 10: RAR RS HUB nhận kết quả chứng thư số đã cấp và trả thông tin về


## 4

cho Đơn vị trung gian.
Bước 11: Đơn vị trung gian gửi thông báo kết quả đăng ký thành công tới
Webhook của Đơn vị khai thác.
Bước 12: Đơn vị khai thác cập nhật trạng thái "Đã có chữ ký số" cho tài khoản
người dùng trên ứng dụng và sẵn sàng cho các giao dịch ký số tiếp theo

Mô hình







## 5

- Quy trình đăng ký chữ ký số
Quy trình mà người dùng sẽ đăng nhập vào ứng dụng của đơn vị phát triển và
thực hiện việc ký số lên tài liệu mong muốn
Mô tả quy trình chi tiết:
Bước 1: Người dùng tải tài liệu cần ký lên ứng dụng của đơn vị tích hợp ký số
Bước 2: Người dùng chọn chứng thư số để thực hiện ký.
API: /api/credentials/list
Bước 3: Đơn vị tích hợp ký số hash file.
Chú ý: Đơn vị khai thác cần triển khai Service Docker Hash file riêng theo cấu
hình được Đơn vị trung gian hướng dẫn (Image do RSHUB cung cấp qua Đơn vị trung
gian).
Bước 4: Đơn vị khai thác tạo yêu cầu ký số và gửi tới Đơn vị trung gian.
API tương tác: /api/ signings/hash
Bước 5: Đơn vị trung gian tiếp nhận, xác thực và chuyển tiếp yêu cầu ký số tới
## RAR RS HUB.
Bước 6: RAR RS HUB điều phối gửi yêu cầu sinh SAD tới nhà cung cấp CA và
gửi yêu cầu ký số tới ứng dụng VNeID.
Lưu ý: Trường hợp thành công, nếu đơn vị tích hợp ký số có webhook nhận mã giao
dịch ký, RAR RS HUB sẽ gửi mã giao dịch ký vào webhook do đơn vị xây dựng
Bước 7: Người dân nhận được thông báo trên app VNeID: “Xác nhận yêu cầu
ký số”
Người dân bấm vào xem thông báo “Xác nhận yêu cầu ký số”
Người dân tích chọn đồng ý quyền và nghĩa vụ của chủ thể dữ liệu
Người dân chọn “Xác nhận chia sẻ”
Người dân nhập passcode
Người dân sinh trắc học sinh khóa kích hoạt
VNeID hiển thị màn hình “Xác nhận chia sẻ thành công”
VNeID gửi thông tin tới RAR RS HUB về đồng ý chia sẻ thông tin người dân
Bước 8: RAR RS HUB gửi lệnh ký chính thức tới đơn vị RS-CA.
Bước 9: RAR RS HUB cập nhật kết quả ký thành công tới ứng dụng VNeID.
Bước 10: RAR RS HUB trả kết quả chữ ký số về cho Đơn vị trung gian. Sau
đó, Đơn vị trung gian gửi trả kết quả này tới Webhook của Đơn vị khai thác.
Bước 11: Đơn vị khai thác tiếp nhận chữ ký và thực hiện ghép chữ ký vào file
gốc.
Bước 12: Đơn vị khai thác trả file đã ký hoàn tất cho người dùng và kết thúc
quy trình.














## 6

Mô hình








## 7

## III. CÁC ĐẦU HÀM KẾT NỐI.
Các phương thức dưới đây được thiết kế để Đơn vị khai thác (Application)
tương tác với hệ thống của Đơn vị trung gian. Thông qua đó, yêu cầu sẽ được xác thực
và chuyển tiếp tới hệ thống RS HUB để kết nối với ứng dụng VNeID của người dân.
- Quy định về xác thực và bảo mật
1.1 Tổng quan
Để đảm bảo tính bảo mật và toàn vẹn dữ liệu trong quá trình kết nối đến hệ thống
ký số, mọi yêu cầu (Request) từ Đơn vị khai thác gửi đến hệ thống của Đại lý
trung gian đều phải qua bước xác thực quyền truy cập.
Hệ thống sử dụng cơ chế xác thực dựa trên Token (Access Token). Cụ thể:
- Cấp phát tài khoản: Đại lý sẽ cung cấp cho mỗi Đơn vị khai thác một bộ định
danh duy nhất bao gồm: Username và Password.
- Cơ chế hoạt động: Đơn vị khai thác sử dụng tài khoản được cấp để gọi API
Login. Nếu thông tin chính xác, hệ thống sẽ trả về một mã Access Token và
## Refresh Token.
- Ủy quyền giao dịch: Đối với tất cả các API nghiệp vụ (lấy danh sách chứng
thư, đăng ký chứ ng thứ số , ký số...), Đơn vị khai thác phải đính kèm Access
Token này vào phần Header của yêu cầu. Token có thời hạn sử dụng nhất định
để đảm bảo an toàn.
1.2 API Specs

Thông tin Mô tả


Mục đích
API sử dụng để thực hiện xác thực người dùng dựa trên username
và password, từ đó sinh ra access token và refresh token phục vụ
cho việc gọi các API khác trong hệ thống
URL https://<domain>/api/v1/auth/token
Method POST
## Header
● Content-Type: application/json; charset=utf-8
Request body
## {
## "username": "string",
## "password": "string"
## }


## 8

Response body
## 200-OK
## {
"accessToken": "string",
"refreshToken": "string",
"expireInSeconds": 0,
"refreshTokenExpireInSeconds": 0,
"message": null
## }

Trường hợp không thành công: 400/500
## {
"accessToken": null,
"refreshToken": null,
"expireInSeconds": null,
"refreshTokenExpireInSeconds": null,
## "message": "string"
## }
## 1.3 Request Body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
## "username": "taikhoan1",
## "password": "abc123456"
## }

## 1

username

string

x
Tài khoản user của đích ký


## 2


password


string


x
Mật khẩu user của đích ký
1.4 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp thành công
## {
"accessToken":
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJxdWFuMTEzIiwiaWF0IjoxNzc2Njc3NDM5LCJleHAiOjE3Nz
Y2NzkyMzl9.FHpe55ExCV7T2mzYT81wZg_L9PaP0MqnJpR_grDhJgI",
"refreshToken": "63c731a5f81c484ca773b9b6d37b6d9cnR0icDjRQcXKSenox4WBskjj59GlSkQQ",
"expireInSeconds": 1800,
"refreshTokenExpireInSeconds": 604800,
"message": null
## }





## 9


Trường hợp thất bại

## {
"accessToken": null,
"refreshToken": null,
"expireInSeconds": null,
"refreshTokenExpireInSeconds": null,
"message": “Sai thông tin đăng nhập"
## }


1 accessToken string x
Là token truy cập do hệ thống cấp
sau khi xác thực thành công.
Được sử dụng để gắn vào header
Authorization khi gọi các API tiếp
theo.
2 refreshToken string

Là token được hệ thống cấp sau khi
xác thực thành công
Được sử dụng để yêu cầu hệ thống
sinh access token mới khi access
token đã hết hạn, không cần xác
thực lại username và password.
3 expireInSeconds string

Là thời gian hiệu lực của
accessToken, tính bằng giây.
- expireInSeconds string

Là thời gian hiệu lực của
refreshToken, tính bằng giây.
5 message string

Nội dung thông báo lỗi






















## 10

- API refresh token
2.1 API Specs
Thông tin Mô tả


Mục đích
API dùng để xác thực refresh token còn hiệu lực và sinh ra access
token mới, nhằm duy trì phiên làm việc của người dùng khi access
token đã hết hạn mà không cần thực hiện lại quá trình đăng nhập.
URL https://<domain>/api/v1/auth/refresh
Method POST
## Header
● Content-Type: application/json; charset=utf-8
Request body
## {
"refreshToken": "string"
## }
Response body
## 200-OK
## {
"accessToken": "string",
"refreshToken": "string",
"expireInSeconds": 0,
"refreshTokenExpireInSeconds": 0
## }

Trường hợp không thành công: 400/500
## {
## "status": "string",
## "description": "string",
"data": null
## }

2.2  Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
"refreshToken": "3d099bd639e64b1aa896c0ede905f4355N8PFTHRfbTGr6tVw7VNH4b4nG2dStui"
## }

## 1

refreshToken

string

x
refreshToken được cấp khi
gọi lấy token ở api
## /api/auth/token



## 11

2.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp thành công
## {
"accessToken":
"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiJxdWFuMTEzIiwiaWF0IjoxNzc2Njc3NDM5LCJleHAiOjE3Nz
Y2NzkyMzl9.FHpe55ExCV7T2mzYT81wZg_L9PaP0MqnJpR_grDhJgI",
"refreshToken": "63c731a5f81c484ca773b9b6d37b6d9cnR0icDjRQcXKSenox4WBskjj59GlSkQQ",
"expireInSeconds": 1800,
"refreshTokenExpireInSeconds": 604800,
"message": null
## }
Trường hợp thất bại
## {
## "status": “02”,
"description": “Refresh token đã hết hạn hoặc bị thu hồi”,
"data": null
## }
1 accessToken string x
Là token truy cập do hệ thống cấp
sau khi xác thực thành công.
Được sử dụng để gắn vào header
Authorization khi gọi các API tiếp
theo.
2 refreshToken string

Là token được hệ thống cấp sau khi
xác thực thành công
Được sử dụng để yêu cầu hệ thống
sinh access token mới khi access
token đã hết hạn, không cần xác
thực lại username và password.
3 expireInSeconds string

Là thời gian hiệu lực của
accessToken, tính bằng giây.
## 4.
refreshTokenEx
pireInSeconds
string

Là thời gian hiệu lực của
refreshToken, tính bằng giây.
5 description string

Mô tả lỗi











## 12

- Đầu hàm kết nối lấy danh sách nhà cung cấp kèm gói dịch vụ
3.1 API Specs

Thông tin
Mô tả

Mục đích
API được sử dụng để lấy danh sách các nhà cung cấp CA trong hệ
thống, đồng thời trả về thông tin chi tiết các gói dịch vụ tương ứng
của từng nhà cung cấp.
URL https://<domain>/api/v1/providers
Method GET
## Header
● Content-Type: application/json; charset=utf-8
● X-Request-Id:
- Mã giao dịch có giá trị duy nhất do đối tác tự sinh
(không bắt buộc nhập)
- Trường hợp không có thì sẽ được phía đại lý tạo
- Giá trị sẽ được trả về ở response header

Request body

Response body
## 200-OK
## {
## "status": "01",
## "description": "string",
## "data": [
## {
"providerName": "string",
## "provider": "string",
## "status": 0,
"servicePackList": [
## {
"servicePackCode": "string",
"servicePackName": "string",
"servicePackMonth": 0,
"unitPrice": 0,
## "free": 0
## }
## ]
## }
## ]
## }


3.2 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Thành công",
## "data": [
## {
"providerName": "TRUNG TÂM RAR TEST",


## 13

"provider": "HUD-RARTEST",
## "status": 1,
"servicePackList": [
## {
"servicePackCode": "VNEID-FREE-12M",
"servicePackName": "Gói chứng thư chữ ký số miễn phí khi đăng
ký từ VNeID",
"servicePackMonth": 12,
"unitPrice": 0,
## "free": 0
## }
## ]
## },
## {
"providerName": "TẬP ĐOÀN CÔNG NGHIỆP - VIỄN THÔNG QUÂN ĐỘI",
"provider": "HUD-VT-CA",
## "status": 1,
"servicePackList": [
## {
"servicePackCode": "VNEID-FREE-12M",
"servicePackName": "Gói chứng thư chữ ký số miễn phí khi đăng
ký từ VNeID",
"servicePackMonth": 12,
"unitPrice": 0,
## "free": 0
## }
## ]
## }
## ]
## }
## 1
status
string  Mô tả trong phụ lục I, bảng mã
status
2 description string  Mô tả
3  Mô tả array data  Danh sách nhà cung cấp
4 providerName string  Tên nhà cung cấp
5 provider string  Mã nhà cung cấp
6 status number  Trạng thái
1: Hoạt động
0: Không hoạt động
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú
7 Mô tả array servicePackList  Danh sách gói dịch vụ của nhà
cung cấp
8 servicePackCode string  Mã gói dịch vụ
9 servicePackName string  Tên gói dịch vụ


## 14

10 servicePackMonth number  Số tháng của gói dịch vụ
11 unitPrice number  Đơn giá của gói dịch vụ
12 free number  Gói dịch vụ là gói miễn phí hay
không
1: Gói miễn phí
0: Gói không miễn phí
(Dùng để check mỗi người dân 1
chứng thư chữ ký số miễn phí của
gói dịch vụ này)


## 15

- API kết nối nghiệp vụ đăng ký chứng thư chữ ký số
4.1 API Specs
Thông tin Mô tả


Mục đích
API này được sử dụng để đại lý bán hàng gửi thông tin đăng ký chứng
thư chữ ký số của người dùng tới hệ thống ký số tập trung. Thông tin
đăng ký bao gồm các dữ liệu định danh, thông tin gói dịch vụ và các
tham số liên quan theo quy định. Hệ thống tiếp nhận, kiểm tra tính
hợp lệ của dữ liệu và xử lý đăng ký chứng thư chữ ký số theo quy
trình nghiệp vụ tương ứng.
URL https://<domain>/api/v1/certificates/register
Method POST
## Header
● Content-Type: application/json; charset=utf-8
● X-Request-Id:
- Mã giao dịch có giá trị duy nhất do đối tác tự sinh
(không bắt buộc nhập)
- Trường hợp không có thì sẽ được phía đại lý tạo
- Giá trị sẽ được trả về ở response header
Đối với đối tác có ký request
● X-Partner-Code: Mã đối tác (bắt buộc truyền)
● X-Timestamp: Unix epoch seconds (bắt buộc truyền)
● X-Nonce: Giá trị ngẫu nhiên duy nhất (bắt buộc truyền)
● X-Signature: Chữ ký HMAC-SHA256 (bắt buộc truyền)

## Authorization
● Bearer token
● Token truyền bằng accessToken nhận ở api get Token
Request body
## {
"userInfo": {
"fullName": "string",
"birthDate": "string",
"citizenPid": "string",
"issuingAuthority": "string",
"dateOfIssue": "string",
## "gender": "string",
## "phone": "string",
## "email": "string",
"nationalityCode": "string",
"permanentAddress": "string",
"permanentVillageText": "string",
"permanentCityText": "string",
"livingPlaceAddress": "string",
"livingPlaceVillageText": "string",
"livingPlaceCityText": "string",
"idCardExpireDate": "string"
## },
## "provider": "string",
"servicePackCode": "string",
"originatorCode": "string"
## }


## 16

Response body
## 200-OK
## {
## "status": "string",
## "description": "string",
## "data": {
"transactionCode": "string"
## }
## }

4.2 Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
"userInfo": {
"fullName": "Đặng Mỹ Ngọc",
"birthDate": "18/10/2001",
"citizenPid": "001122555522",
"issuingAuthority": "Cục Cảnh sát đăng ký quản lý cư trú và dữ liệu quốc gia về dân cư",
"dateOfIssue": "01/01/2025",
"gender": "Nữ",
## "phone": "0936543210",
## "email": "abc@gmail.net",
"nationalityCode": "VN",
"permanentAddress": "888 Trần Hưng Đạo",
"permanentVillageText": "phường Cửa Nam",
"permanentCityText": "Thành phố Hà Nội",
"livingPlaceAddress": "888 Trần Hưng Đạo",
"livingPlaceVillageText": " phường Cửa Nam ",
"livingPlaceCityText": " Thành phố Hà Nội ",
"idCardExpireDate": " 01/01/2035 "
## },
"provider": "HUD-VNPT-SMARTCA",
"servicePackCode": "VNEID-FREE-6M",
"originatorCode": "HEALTHCARE_PORTAL"
## }

## 1

provider

string

x
Mã nhà cung cấp dịch vụ
chứng  thư  chữ  ký số
(Tham  khảo  giá  trị
lấy  từ  api
/api/ v1/providers


## 2


servicePackCode


string


x
Mã gói dịch vụ chứng
thư chữ ký số
(Lấy dữ liệu tại
api
/api/ v1/providers


## 17


## 3

originatorCode

string

x
Mã ứng dụng gửi yêu cầu
đăng ký chứng thư chữ ký
số

## 4

Mô tả Object userInfo
Thông tin cá nhân người
dân cần tạo chứng thư chữ
ký số
5 fullName string

Họ tên người dân
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả
6 birthDate string  Ngày tháng năm sinh
người dân
## 7
citizenPid string x Số định danh cá nhân
## 8
issuingAuthority string

Nơi cấp CCCD
9 dateOfIssue string

Ngày cấp CCCD
10 gender string

Giới tính
11 phone string

Số điện thoại
12 email string

## Email
13 nationalityCode string

Mã Quốc tịch
14 permanentAddress string

Nơi thường trú
15 permanentVillageText string

Tên phường xã (nơi
thường trú)
16 permanentCityText string

Tên tỉnh thành (nơi thường
trú)
17 livingPlaceAddress string

Địa chỉ tạm trú
18 livingPlaceVillageText string

Tên phường xã (nơi tạm
trú)
19 livingPlaceCityText string

Tên tỉnh thành (nơi tạm
trú)
20 idCardExpireDate string

Ngày hết hạn CCCD








## 18

4.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Thành công",
## "data": {
"transactionCode": "string"
## }
## }
1 status string x
Mô tả trong phụ lục I, bảng mã status
2 description string

Mô tả
3   Mô tả object data

Thông tin chứng thư sau khi đăng ký
thành công.
4 transactionCode string

Mã giao dịch có giá trị duy nhất, do
hệ thống RSHUB tự sinh tại thời
điểm tiếp nhận yêu cầu thành công,
được sử dụng để định danh, tra cứu
và đối soát quá trình xử lý giao dịch.






















## 19

- API kết nối tra cứu kết quả của yêu cầu
5.1 API Specs
Thông tin Mô tả


Mục đích
Tra cứu chứng thư và kết quả
- Dùng để tra cứu kết quả đăng ký chứng thư, kết quả thay đổi ứng
dụng của chứng thư. Trường hợp yêu cầu tạo chứng thư số thành
công và người dân đã kích hoạt, RAR RS HUB gửi kèm cả thông tin
chứng thư tương ứng với mã giao dịch
URL https://<domain>/api/v1/certificates/get-status
Method POST
## Header
● Content-Type: application/json; charset=utf-8
● X-Request-Id: Mã giao dịch nhận được tại response header
của API https://<domain>/api/v1/certificates/register hoặc API
https://<domain>/api/v1/certificates/change-application
Đối với đối tác có ký request
● X-Partner-Code: Mã đối tác (không bắt buộc truyền)
● X-Timestamp: Unix epoch seconds (bắt buộc truyền)
● X-Nonce: Giá trị ngẫu nhiên duy nhất (bắt buộc truyền)
● X-Signature: Chữ ký HMAC-SHA256 (bắt buộc truyền)
## Authorization
● Bearer token
Token truyền bằng accessToken nhận ở api get Token
Request body
## {
"transactionCode": "string"
## }
Response body
## 200-OK
## {
## "status": "string",
## "description": "string",
## "data": {
"transactionCode": "string",
"statusCode": 0,
"requestType": 0,
"citizenPid": "string",
"serialNumber": "string",
"certificateId": "string",
"certificateData": "string",
"errorCode": "string",
"resultCode": "string"
## }
## }


5.2 Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả


## 20


## Sample:
## {
"transactionCode": "184401d0-20f5-40fe-a0be-c6093ce8dd97"
## }

## 1

transactionCode

string

x
Mã giao dịch nhận được từ
api  Đăng  ký/Gửi  thông  tin
thay đổi ứng dụng

5.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Thành công",
## "data": {
"transactionCode": "184401d0-20f5-40fe-a0be-c6093ce8dd97",
"statusCode": 0,
"requestType": 1,
"citizenPid": "001300031500",
"serialNumber": "54011DAEC50A574F472B0C07C[...]",
"certificateId": "54011DAEC50A574F472B0C07C[...]",
"certificateData": "[...]",
"errorCode": null,
"resultCode": null
## }
## }
## 1
status string x
Mô  tả  trong  phụ  lục  I,  bảng  mã
status
## 2
description string x
Mô tả

STT Tên trường Kiểu dữ liệu Bắt buộc
Ghi chú
## 3
Mô tả object data

## 4
transactionCode string x
Mã giao dịch gửi trong request
body
## 5
statusCode number x Trạng thái giao dịch
0: Thành công
1: Thất bại
2: Đang xử lý
3: Đã sinh chứng thư chữ ký số
(chứng thư chữ ký số chưa kích
hoạt)

Loại yêu cầu
- Thêm mới


## 21

6 requestType number x
- Gia hạn
- Thay đổi thiết bị
- Thay đổi ứng dụng
7 citizenPid string x
Số định danh cá nhân/Căn cước
công dân
8 serialNumber string
Số serialNumber của chứng thư chữ
ký số (trường hợp trả về chứng thư
chữ ký số)
9 certificateId string
Mã chứng thư nội bộ CA (trường
hợp trả về chứng thư chữ ký số)
10 certificateData string
Chứng thư số base64 (trường hợp
trả về chứng thư chữ ký số)
11 errorCode string
Mã lỗi
12 resultCode string
Mô tả lỗi của giao dịch
























## 22

## IV. DANH SÁCH CÁC ĐẦU HÀM ĐƠN VỊ KẾT NỐI CẦN XÂY DỰNG
## CHO NGHIỆP VỤ ĐĂNG KÝ CHỨNG THƯ CHỮ KÝ SỐ
- Webhook nhận thông tin mã giao dịch đăng ký (txnId)
1.1 API Specs
Thông tin Mô tả

Mục đích
Nhận thông tin mã giao dịch của yêu cầu đăng ký. Mã này do Nền
tảng (VNeID) trả về và được dùng để ghép vào universal link, phục
vụ việc chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng
của đơn vị kết nối.





Lưu ý
● Đại lý sẽ gửi dữ liệu webhook đến endpoint mà đơn vị cung cấp.
● Đơn vị phải đảm bảo endpoint tiếp nhận toàn bộ body JSON mà
đại lý gửi.
● Đơn vị có thể lựa chọn chỉ xử lý các trường cần thiết, tuy nhiên
không được giới hạn, cắt bỏ hoặc giả định cố định cấu trúc body.
Lý do: Trong tương lai, hệ thống có thể mở rộng và bổ sung thêm
các trường dữ liệu mới, nếu đơn vị chỉ parse một phần hoặc bỏ
qua các trường không mong đợi, sẽ gây lỗi khi webhook thay đổi
cấu trúc.
URL URI webhook nhận thông tin do đối tác tự định nghĩa
Method POST
## Header
● X-Webhook-Signature: sha256= Hash
Dùng thuật toán HMACSHA256 truyền key vào để mã
hóa dữ liệu được mà hóa là body truyền đi (hash)
sau đó truyền lên header với tham số là X-Webhook-Signature
có giá trị là sha256 = hash
● X-Request-Id: Mã giao dịch có giá trị duy nhất do đối tác đã
truyền ở bước đăng ký/gửi thông tin thay đổi ứng dụng

Request body
## {
## "id": "string",
## "type": "string",
## "attempt": "number",
## "data": {
"transactionCode": "string",
"txnId": "string",
## "status": "string",
## "description": "string"
## }
## }



## 23

Response body
Trường hợp thành công: 200 – OK

Trường hợp không thành công: 400/500
## {
## "error": "string",
"errorDescription": "string"
## }

1.2 Request body

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
## "id": "264205314407010305",
"type": "CERT_REGISTER_WEBHOOK_TRANSCODE",
## "attempt": 1,
## "data": {
"transactionCode": "65393c44-c81f-435a-83fa-5b46046354f0",
## "status": 0,
"description": "Thành công",
"txnId": "e0c790db-283e-4006-ab6b-8e0bd2b4b1b8"
## }
## }
1 id string x
Id quản lý bản ghi của RAR HUB
của sự kiện gọi webhook
2 attempt number x Số lần gọi webhook
3 type string x
Loại callback từ đối tác có thể
được ghi nhận
4 Mô tả object data

5 transactionCode string x
Mã giao dịch yêu cầu đăng ký
nhận được từ api Đăng ký
6 status number x
Trạng thái giao
dịch 0: Thành
công
1: Thất bại
7 description string

Mô tả lỗi
8 txnId number

Mã giao dịch của Nền tảng
(VNeID) cho yêu cầu đăng ký
1.3 Response body



## 24

STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp nhận webhook thành công: http_status code 200 – OK

Trường hợp nhận webhook không thành công: 400/500
## {
## "error": "01",
"errorDescription": "Thât bại"
## }
1 error string

Mã lỗi, do đối tác tự định nghĩa
2 errorDescription string

Mô tả, do đối tác tự định nghĩa

- Webhook nhận thông tin chứng thư và kết quả đăng ký
2.1 API Specs

Thông tin Mô tả





Mục đích
API tra cứu kết quả yêu cầu được xây dựng nhằm tiếp nhận và xử lý
kết quả phản hồi của quá trình đăng ký chứng thư số/thay đổi ứng
dụng/các nghiệp vụ khác liên quan đến vòng đời chứng thư chữ ký
số.
Thông qua API này, hệ thống có thể:
● Nhận thông tin kết quả đăng ký chứng thư (thành công hoặc
không thành công)
● Nhận thông tin chứng thư (trường hợp đăng ký thành công)
● Nhận thông tin kết quả yêu cầu thay đổi ứng dụng





Lưu ý
● Đại lý sẽ gửi dữ liệu webhook đến endpoint mà đơn vị cung cấp.
● Đơn vị phải đảm bảo endpoint tiếp nhận toàn bộ body JSON mà
đại lý gửi.
● Đơn vị có thể lựa chọn chỉ xử lý các trường cần thiết, tuy nhiên
không được giới hạn, cắt bỏ hoặc giả định cố định cấu trúc body.
Lý do: Trong tương lai, hệ thống có thể mở rộng và bổ sung thêm
các trường dữ liệu mới, nếu đơn vị chỉ parse một phần hoặc bỏ
qua các trường không mong đợi, sẽ gây lỗi khi webhook thay đổi
cấu trúc.
URL URI webhook nhận thông tin do đối tác tự định nghĩa
Method POST


## 25

## Header
● X-Webhook-Signature: sha256= Hash
Dùng thuật toán HMACSHA256 truyền key vào để mã
hóa dữ liệu được mà hóa là body truyền đi (hash)
sau đó truyền lên header với tham số là X-Webhook-
Signature có giá trị là sha256 = hash
● X-Request-Id: Mã giao dịch có giá trị duy nhất do đối tác đã
truyền ở bước đăng ký/gửi thông tin thay đổi ứng dụng
Request body
## {
## "id": "string",
## "type": "string",
## "attempt": "number",
## "data": {
"transactionCode": "string",
"serialNumber": "string",
"certificateId": "string",
"certificateData": "string",
## "status": "number",
## "description": "string",
## },
## }

Response body
Trường hợp thành công: 200 – OK

Trường hợp không thành công: 400/500
## {
## "error": "string",
"errorDescription": "string"
## }



















## 26

2.2 Request body

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:

## {
## "id": "263868404304187392",
"type": " CERT_REGISTER_WEBHOOK_RESULT",
## "attempt": 0,
## "data": {
"transactionCode": "65393c44-c81f-435a-83fa-5b46046354f0",
"serialNumber": "1655DD2076CC342F322933A0AA1...",
"certificateId": "251229101836971JyoICkZChx...",
"certificateData":
"MIIFZDCCBEygAwIBAgIQFlXdIHbMNC8yKTOgqhsTVDANBgkqhkiG9w0BAQsFADB/[...]",
## "status": 0,
"description": "Thành công"
## },
## }

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả
1 id string x
Id quản lý bản ghi của RAR HUB
của sự kiện gọi webhook
2 attempt number x Số lần gọi webhook
3 type string x
Loại callback từ đối tác có thể
được ghi nhận
4 Mô tả object data

5  transactionCode string x
Mã giao dịch yêu cầu đăng ký
nhận được từ api Đăng ký

## 6

status

number

x
Trạng thái giao
dịch 0: Thành
công
1: Thất bại
7  serialNumber
string

Số serialNumber của chứng thư
chữ ký số (trường hợp trả về
chứng thư
chữ ký số)
8  certificateId
string

Mã chứng thư nội bộ CA (trường
hợp trả về chứng thư chữ ký số)
9  certificateData
string

Chứng thư số base64 (trường hợp
trả về chứng thư chữ ký số)


## 27

10  description string

Mô tả lỗi


2.3 Response body

STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp nhận webhook thành công: http_status code 200 – OK

Trường hợp nhận webhook không thành công: 400/500
## {
## "error": "01",
"errorDescription": "Thât bại"
## }
1 error string

Mã lỗi, do đối tác tự định nghĩa
2 errorDescription string

Mô tả, do đối tác tự định nghĩa
- Hướng dẫn chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng của đơn vị
kết nối (áp dụng nghiệp vụ Đăng ký chứng thư chữ ký số)
3.1  Đối với chiều chuyển hướng app-to-app từ app của đơn vị kết nối sang app VneID
Bước 1: Nhận txnId từ webhook Nhận mã giao dịch đăng ký (Phần V mục I trong tài liệu
này)
Bước 2: Gọi vào universal link của VNeID
Cấu trúc Universal Link ứng dụng VNeID
- Cấu trúc: UniversalLink/share/[$txnId]
Trong đó, UniversalLink Môi trường tích hợp:
https://universal.dancuquocgia.com/share/[$txnId]
UniversalLink môi trường chính: N/A
Trong đó txnId là txnId nhận được từ webhook ở phần V mục I trong tài liệu này
3.2  Đối với chiều chuyển hướng app-to-app từ app VNeID sang app của đơn vị kết nối
Đơn vị kết nối cung cấp cho RAR-RS-HUB Universal Link của ứng dụng để cấu hình.
Khi người dân nhấn chọn kích hoạt chứng thư số, app VNeID sẽ switch về app của
đơn vị RA
- Cấu trúc: URL_TCDN/[$txnId]
Mô tả:
STT Code Mô tả
## 1
URL_TCDN Tổ chức sử dụng dịch vụ cung cấp
## 2
[$txnId] Mã giao dịch xin consent (txnId)



## 28

3.3 Trường hợp người dùng thoát ra giữa chừng, mà app của đơn vị kết nối muốn gọi lại vào
đúng màn hình chứng thư chữ ký số cần kích hoạt
Cấu trúc Universal Link ứng dụng VNeID, màn hình kích hoạt
UniversalLink Môi trường tích hợp:
http://universal.dancuquocgia.com/screen/SmartCAActive/id=[$txnId]
Trong đó txnId là txnId nhận được từ webhook ở Phần V mục I trong tài liệu này)



## 29

## V. DANH SÁCH CÁC ĐẦU HÀM KẾT NỐI NGHIỆP VỤ KÝ
- API lấy danh sách chứng thư chữ ký số
1.1 API Specs
Thông tin Mô tả

Mục đích
Lấy thông tin danh sách chứng thư chữ ký số. Các chứng thư được
trả về trong API này là những chứng thư đã kích hoạt, còn hiệu lực
và đang ở trạng thái hoạt động.
URL https://<domain>/api/v1/certificates/list
Method POST
## Header
● Bearer token
● Token truyền bằng accessToken nhận ở api get Token
Request body
## {
"citizenPid": "string"
## }
Response body
Trường hợp thành công: 200-OK
## {
## "status": "string",
## "description": "string",
## "data": {
"credentialIDs":
## [ "string"
## ],
"credentialInfos": [
## {
"credentialID": "string",
## "cert": {
## "status": 0,
## "certificates": [
## "string"
## ],
"issuerDN": "string",
"serialNumber": "string",
"subjectDN": "string",
"validFrom": "string",
"validTo": "string",
## "provider": "string",
## "flow": "number"
## },
## "key": {
## "status": "string",
## "algo": [
## "string"
## ],
## "len": 0,
## "curve": "string"
## }
## }
## ]
## }
## }



## 30

1.2 Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
"citizenPid": "357000000[...]"
## }
1 citizenPid string x
Số định danh cá nhân/CCCD người
dân

1.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Tiếp nhận thành công",
## "data": {
"credentialIDs":
## [ "6485ABC1886677DB64661B334D79B[...]
## "
## ],
"credentialInfos": [
## {
"credentialID": "6485ABC1886677DB64661B334D79BD2C[...]",
## "cert": {
## "status": 1,
## "certificates": [
"MIIFEzCCA/ugAwIBAgIUZIWrwYhmd9tkZhszTXm[...]"
## ],
"issuerDN": "C=VN, O=TRUNG TÂM RAR DEMO SUB, CN=RAR-SUBCA",
"serialNumber": "6485ABC1886677DB64661B334D79BD2C[...]",
"subjectDN": "TEST",
"validFrom": "23/08/2025 10:24:00",
"validTo": "23/08/2026 10:24:00",
"provider": "HUD-RARTEST",
## "flow": 1
## },
## "key": {
## "status": "enabled",
## "algo": [
## "1.2.840.113549.1.1.11"
## ],
## "len": 2048,
"curve": null
## }
## }
## ]
## }
## }

## 1

status
string

x
Thành công: 01
Thất bại: Trả ra các lỗi: 0, 02, 03, 04,
4030, 4031 (Mô tả cụ thể ở bảng mã
lỗi Phụ lục I, mục II, tiểu mục II.1
trong tài liệu này)


## 31

2 description
string
x
Mô tả lỗi
3 Mô tả object data

STT Tên trường
Kiểu dữ liệu Bắt buộc
Ghi chú
4 Mô tả array credentialIDs
Trả ra danh sách chứng thư chữ ký
số hợp lệ
5 Mô tả array credentialInfos Thông tin chứng thư chữ ký số
6 credentialID
string

7 Mô tả object cert

8 status string

Trạng thái chứng thư
1: Hoạt động



## 9



Mô tả array certificates

Chuỗi chứng chỉ đầy đủ dạng
base64, theo thứ tự:
Base64-encoded_X.509_end_entity
## _certificate,
## Base64-
encoded_X.509_intermedia
te_CA_certificate,
Base64-encoded_X.509_root_CA_
certificate
10 issuerDN string

DN của nhà cung cấp CA
11 serialNumber string

Serial number của chứng thư chữ
ký số
12 subjectDN string

Subject CN của chứng thư chữ ký
số
13 validFrom string

Thời gian bắt đầu hiệu lực của
chứng thư chữ ký số
14 validTo string

Thời gian kết thúc hiệu lực của
chứng thư chữ ký số
15 provider string

Mã nhà cung cấp CA

## 16

flow

number

Hình thức xác thực của CCCD
- Xác thực qua VNeID
- Xác thực qua CCCD và
khuôn mặt
17 Mô tả object key

18 status string

Trạng thái của key tạo ra chứng thư


## 32



## 19


algo


number

Danh sách OID của các thuật toán
khóa được hỗ trợ.
Ví dụ: 1.2.840.113549.1.1.1 = Mã
hóa RSA, 1.2.840.10045.4.3.2 =
ECDSA với SHA256.
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú
20 len string

Độ dài của khóa mật mã tính bằng
bit.
21 curve string


- API kết nối nghiệp vụ ký số theo dữ liệu băm
2.1 API Specs
Thông tin Mô tả
Mục đích API sử dụng để đại lý bán hàng gửi yêu cầu ký số theo dữ liệu băm
URL https://<domain>/api/v1/signings/hash
Method POST
## Header
● Content-Type: application/json; charset=utf-8
● X-Request-Id:
- Mã giao dịch có giá trị duy nhất do đối tác tự sinh
(không bắt buộc nhập)
- Trường hợp không có thì sẽ được phía đại lý tạo
- Giá trị sẽ được trả về ở response header
Đối với đối tác có ký request
● X-Partner-Code: Mã đối tác (bắt buộc truyền)
● X-Timestamp: Unix epoch seconds (bắt buộc truyền)
● X-Nonce: Giá trị ngẫu nhiên duy nhất (bắt buộc truyền)
● X-Signature: Chữ ký HMAC-SHA256 (bắt buộc truyền)

## Authorization
● Bearer token
Token truyền bằng accessToken nhận ở api get Token


## 33

Request body
## {
"credentialID": "string",
"originatorCode": "string",
## "documents": [
## {
"documentName": "string",
"digestValue": "string"
## }
## ]
## }

Response body
## 200-OK
## {
## "status": "string",
## "description": "string",
## "data": {
## "handle": "string",
"expiresIn": "number",
## "provider": "string"
## }
## }


2.2 Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## {
"credentialID": "5402BC5CACCE669C20230000000035B2",
"originatorCode": "HEALTHCARE_PORTAL",
## "documents": [
## {
"documentName": "123",
"digestValue": "nI4qOi6TelUoI2VfjrB3zoo3/FWHFBsgdBLKDFLP1mw="
## }
## ]
## }

## 1

credentialID

string

x
SerialNumber chứng thư chữ ký
số, lấy giá trị bằng serialNumber
từ api /api/v2/credentials/list
2 originatorCode string x Mã ứng dụng gửi yêu cầu ký
3 Mô tả array documents

4 documentName string x Tên tài liệu

## 5

digestValue

string

x
Là giá trị băm (hash) của nội dung
tài liệu, dùng để định danh và
kiểm tra tính toàn vẹn của tài liệu
đó.



## 34

2.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Thành công",
## "data": {
## "handle": "289309456804614145",
"expiresIn": 300,
"provider": "HUD-VT-CA"
## }
## }

## 1

status

string

x
Mô tả trong phụ lục I, bảng mã status

## 2
description                string

Mô tả
3 Mô tả object data

4 handle string

Mã giao dịch yêu cầu ký do RSHUB tự
sinh
5 expiresIn number

Thời gian hiệu lực của giao dịch (đơn
vị: giây), mặc định là 300 (giây)
6 provider string

Mã nhà cung cấp CA của credentialID
truyền trong request

- API kết nối tra cứu kết quả của yêu cầu
3.1 API Specs
Thông tin Mô tả


Mục đích
API tra cứu kết quả ký được xây dựng nhằm cung cấp cơ chế kiểm tra,
theo dõi trạng thái ký số của tài liệu sau khi yêu cầu ký đã được gửi
đến hệ thống ký số. Thông qua API này, hệ thống tích hợp có thể chủ
động truy vấn và nhận về kết quả xử lý ký tương ứng với từng yêu cầu
URL https://<domain>/api/v1/signings/polling
Method POST
## Header
● Content-Type: application/json; charset=utf-8
● X-Request-Id: Mã giao dịch nhận được tại response header
của API https://<domain>/api/v1/signings/hash
Đối với đối tác có ký request
● X-Partner-Code: Mã đối tác (bắt buộc truyền)
● X-Timestamp: Unix epoch seconds (bắt buộc truyền)
● X-Nonce: Giá trị ngẫu nhiên duy nhất (bắt buộc truyền)


## 35

● X-Signature: Chữ ký HMAC-SHA256 (bắt buộc truyền)

## Authorization
● Bearer token
Token truyền bằng accessToken nhận ở api get Token
Request body
## {
## "handle": "string"
## }
Response body
## 200-OK
## {
## "status": "string",
## "description": "string",
## "data": {
## "handle": "string",
"statusCode": 0,
"resultCode": "string",
"errorCode": "string",
## "signatures": [
## "string"
## ]
## }
## }

3.2 Request body
STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
## "handle": " 289309456804614145"
## }
1 handle string x
Mã yêu cầu ký nhận được khi
gọi hàm signhash












## 36

3.3 Response body
STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
## {
## "status": "01",
"description": "Thành công",
## "data": {
## "handle": "289309456804614145",
"statusCode": 1,
"resultCode": "Hết hạn chia sẻ thông tin",
"errorCode": "errorcode4005",
## "signatures": []
## }
## }

1 status string x
Mô tả trong phụ lục I, bảng mã status
2 description string x
Mô tả

3 Mô tả object data

4 handle string

Mã nhận được khi gọi hàm signhash


## 5


statusCode


number

Trạng thái giao
dịch 0: Thành
công
1: Thất bại
2: Đang xử lý
3: Người dân từ chối ký
6 resultCode string

Mô tả lỗi
7 errorCode string

Mô tả lỗi

## 8

signatures
Array of
string

Chữ  ký  số  được  mã  hóa  ở  dạng
Base64, mỗi chữ ký tương ứng với
một  digestValue  và  được  sắp  xếp
tuần  tự  theo  thứ  tự  của  danh  sách
digestValue.



## 37

## VI. DANH SÁCH CÁC ĐẦU HÀM ĐƠN VỊ KẾT NỐI CẦN XÂY DỰNG
## CHO NGHIỆP VỤ KÝ
- Webhook nhận thông tin mã giao dịch ký (txnId)
1.1 API Specs

Thông tin Mô tả

Mục đích
Nhận thông tin mã giao dịch của yêu cầu ký. Mã này do Nền tảng
(VNeID) trả về và được dùng để ghép vào universal link, phục vụ
việc chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng
của đơn vị kết nối.





Lưu ý
● Đại lý sẽ gửi dữ liệu webhook đến endpoint mà đơn vị cung cấp.
● Đơn vị phải đảm bảo endpoint tiếp nhận toàn bộ body JSON mà
đại lý gửi.
● Đơn vị có thể lựa chọn chỉ xử lý các trường cần thiết, tuy nhiên
không được giới hạn, cắt bỏ hoặc giả định cố định cấu trúc body.
Lý do: Trong tương lai, hệ thống có thể mở rộng và bổ sung thêm
các trường dữ liệu mới, nếu đơn vị chỉ parse một phần hoặc bỏ
qua các trường không mong đợi, sẽ gây lỗi khi webhook thay đổi
cấu trúc.
URL URI webhook nhận thông tin do đối tác tự định nghĩa
Method POST
## Header
● X-Webhook-Signature: sha256= Hash
Dùng thuật toán HMACSHA256 truyền key vào để mã
hóa dữ liệu được mà hóa là body truyền đi (hash)
sau đó truyền lên header với tham số là X-Webhook-
Signature  có giá trị là sha256 = hash
● X-Request-Id: Mã giao dịch có giá trị duy nhất do đối tác đã
truyền ở bước gửi yêu cầu ký số


## 38

Request body
## {
## "id": "string",
## "type": "string",
## "attempt": "number",
## "data": {
"txnId": "string",
## "status": "number",
## "description": "string",
## "handle": "string"
## },
## }

Response body
Trường hợp thành công: 200 – OK

Trường hợp không thành công: 400/500
## {
## "error": "string",
"errorDescription": "string"
## }

1.2 Request body

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
## "id": "265321438603382784",
"type": "SIGNHASH_WEBHOOK_TRANSCODE",
## "attempt": 1,
## "data": {
"txnId": "bb458e69-9e73-4002-a2a5-d2ebc29...",
## "status": 0,
"description": "Thành công",
## "handle": "265309143932342273"
## },
## }
1 id string x
Id quản lý bản ghi của RAR HUB
của sự kiện gọi webhook
2 attempt number x Số lần gọi webhook

## 3

type

string

x
Loại  callback  từ  đối  tác  có  thể
được ghi nhận
4 Mô tả object Data



## 39


## 5

txnId

string

x
Mã giao dịch của Nền tảng
(VNeID) cho yêu cầu ký
(Nền tảng gửi mã giao dịch này
về cho RAR HUB)
6 status number x
Trạng thái xử lý giao dịch
0: Thành công
1: Thất bại

## 7

description

string

Mã kết quả xử lý giao dịch, phản
ánh trạng thái chi tiết của giao
dịch (bao gồm cả trường hợp
thành công và thất bại).
8 handle string

Mã handle nhận được khi gọi vào
api /api/signatures/signHash

1.3 Response body

STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp nhận webhook thành công: http_status code 200 – OK

Trường hợp nhận webhook không thành công: 400/500
## {
## "error": "01",
"errorDescription": "Thât bại"
## }
1 error string

Mã lỗi, do đối tác tự định nghĩa
2 errorDescription string

Mô tả, do đối tác tự định nghĩa











## 40

- Webhook nhận kết quả ký
2.1 API Specs

Thông tin Mô tả

Mục đích
Webhook tra cứu kết quả ký được xây dựng nhằm giúp hệ thống tích
hợp chủ động nhận kết quả xử lý ký





Lưu ý
● Đại lý sẽ gửi dữ liệu webhook đến endpoint mà đơn vị cung cấp.
● Đơn vị phải đảm bảo endpoint tiếp nhận toàn bộ body JSON mà
đại lý gửi.
● Đơn vị có thể lựa chọn chỉ xử lý các trường cần thiết, tuy nhiên
không được giới hạn, cắt bỏ hoặc giả định cố định cấu trúc body.
Lý do: Trong tương lai, hệ thống có thể mở rộng và bổ sung thêm
các trường dữ liệu mới, nếu đơn vị chỉ parse một phần hoặc bỏ
qua các trường không mong đợi, sẽ gây lỗi khi webhook thay đổi
cấu trúc.
URL URI webhook nhận thông tin do đối tác tự định nghĩa
Method POST
## Header
● X-Webhook-Signature: sha256= Hash
Dùng thuật toán HMACSHA256 truyền key vào để mã
hóa dữ liệu được mà hóa là body truyền đi (hash)
sau đó truyền lên header với tham số là X-Webhook-
Signature có  giá trị là sha256 = hash
● X-Request-Id: Mã giao dịch có giá trị duy nhất do đối tác đã
truyền ở bước gửi yêu cầu ký số
Request body
## {
## "id": "string",
## "type": "string",
## "attempt": "number",
## "data": {
## "signatures": "array",
## "status": "number",
## "description": "string",
## "handle": "string"
## },
## }

Response body
Trường hợp thành công: 200 – OK

Trường hợp không thành công: 400/500
## {
## "error": "string",


## 41

"errorDescription": "string"
## }

2.2 Request body

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả

## Sample:
## {
## "id": "265321438603382784",
"type": "SIGNHASH_WEBHOOK_RESULT",
## "attempt": 1,
## "data": {
## "signatures": [
"ROYD3cTbk9EB9cPCfJyao[...]"
## ],
## "status": 0,
"description": "Thành công",
## "handle": "265309143932342273"
## }
## }



## 42

STT Tên trường Kiểu dữ liệu Bắt buộc Mô tả
1 Id string x
Id quản lý bản ghi của RAR
HUB của sự kiện gọi webhook
2 attempt number x Số lần gọi webhook

## 3

type

string

x
Loại  callback  từ  đối  tác  có  thể
được ghi nhận
4 Mô tả object Data


## 5

status

number

x
Trạng thái giao dịch
0: Thành công
1: Thất bại
3: Người dân từ chối ký
6 description
string

Mô tả lỗi
7 handle
string

Mã handle nhận được khi gọi vào
api /api/signatures/signHash

## 8

signatures

array

Danh sách chữ ký,  mỗi phần tử
tương  ứng  với  một  digestValue,
thứ tự phần tử được giữ nguyên
theo thứ tự của digestValue.

2.3 Response body

STT Tên trường Kiểu dữ liệu Bắt buộc Ghi chú

## Sample:
Trường hợp nhận webhook thành công: http_status code 200 – OK

Trường hợp nhận webhook không thành công: 400/500
## {
## "error": "01",
"errorDescription": "Thât bại"
## }
1 error string

Mã lỗi, do đối tác tự định nghĩa
2 errorDescription string

Mô tả, do đối tác tự định nghĩa


## 43

- Hướng dẫn chuyển hướng app-to-app giữa ứng dụng VNeID và ứng dụng của đơn vị
kết nối (áp dụng nghiệp vụ Đăng ký chứng thư chữ ký số)
3.1 Đối với chiều chuyển hướng app-to-app từ app của đơn vị kết nối sang app VneID
Bước 1: Nhận txnId từ webhook Nhận mã giao dịch đăng ký (Phần VII mục I trong tài
liệu này)
Bước 2: Gọi vào universal link của VNeID
Cấu trúc Universal Link ứng dụng VNeID
- Cấu trúc: UniversalLink/share/[$txnId]
Trong đó, UniversalLink Môi trường tích hợp:
https://universal.dancuquocgia.com/share/[$txnId]
UniversalLink môi trường chính: N/A
Trong đó txnId là txnId nhận được từ webhook ở phần VII mục I trong tài liệu này

3.2 Đối với chiều chuyển hướng app-to-app từ app VNeID sang app của đơn vị kết nối
Đơn vị kết nối cung cấp cho RAR-RS-HUB Universal Link của ứng dụng để cấu hình.
Khi người dân nhấn chọn kích hoạt chứng thư số, app VNeID sẽ switch về app của
đơn vị RA
- Cấu trúc: URL_TCDN/[$txnId]
Mô tả :
STT Code Mô tả
1 URL_TCDN Tổ chức sử dụng dịch vụ cung cấp
2 [$txnId] Mã giao dịch xin consent (txnId)

3.3 Trường hợp người dùng thoát ra giữa chừng, mà app của đơn vị kết nối muốn gọi lại vào
đúng màn hình chứng thư chữ ký số cần kích hoạt
Cấu trúc Universal Link ứng dụng VNeID, màn hình kích hoạt
UniversalLink Môi trường tích hợp:
http://universal.dancuquocgia.com/screen/SmartCAActive/id=[$txnId]
Trong đó txnId là txnId nhận được từ webhook ở Phần VII mục I trong tài liệu này)


## 44

## VII.  BẢNG MÃ LỖI STATUS

STT status description Ghi chú
1  00 Thiếu token , token hết hạn hoặc token
không hợp lệ

2  01 Thành công

3  02 Xác thực dữ liệu thất bại

4  03 Không tìm thấy tài nguyên
End point không tồn tại, ...
5  20 Thiếu header xác thực HMAC

6  21 Vượt quá giới hạn số lần gọi HMAC
(rate limit)

7  22 Timestamp HMAC không hợp lệ

8  23 Timestamp HMAC đã hết hạn

9  24 Nonce HMAC bị trùng lặp (đã được sử
dụng trước đó)

10  25 Không xác định được đối tác (partner)

11  26 Chữ ký HMAC không hợp lệ

12  27 Lỗi nội bộ trong quá trình xử lý
## HMAC

13  99 Lỗi hệ thống nội bộ






