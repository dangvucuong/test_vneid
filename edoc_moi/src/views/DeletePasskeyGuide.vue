<template>
  <div>
    <div @click="goBack" class="header">
        <img
          src="@/assets/img/logo.png"
          alt="logo"
          class="w-[160px]"
        />
      </div>
  </div>
  <div class="passkey-guide">
    <h1>Hướng dẫn xóa Passkey trên thiết bị</h1>
    <div class="section">
      <h2>Trên iOS (iPhone/iPad)</h2>
      <ol>
        <li>
          Mở ứng dụng <strong>Settings</strong> (Cài đặt) trên iPhone hoặc iPad
          của bạn.
        </li>
        <li>
          Cuộn xuống và nhấn vào <strong>Passwords</strong> (Mật khẩu). Trên các
          phiên bản iOS cũ hơn, bạn có thể thấy
          <strong>Passwords & Accounts</strong> (Mật khẩu & Tài khoản).
        </li>
        <li>
          Xác thực bằng <strong>Face ID</strong>, <strong>Touch ID</strong> hoặc
          nhập <strong>mã passcode</strong> của thiết bị để tiếp tục.
        </li>
        <li>Tìm và chọn tài khoản có passkey mà bạn muốn xóa.</li>
        <li>Nhấn vào <strong>Delete Passkey</strong> (Xóa Passkey).</li>
        <li>
          Xác nhận việc xóa bằng cách nhấn <strong>Delete</strong> (Xóa) trong
          hộp thoại hiện ra.
        </li>
      </ol>
      <p>
        <strong>Lưu ý:</strong> Nếu bạn xóa passkey trên một thiết bị Apple, nó
        cũng sẽ bị xóa trên các thiết bị Apple khác sử dụng cùng tài khoản
        iCloud.
      </p>
    </div>
    <div class="section">
      <h2>Trên Android</h2>
      <p>
        Trên Android, passkey có thể được lưu trữ ở nhiều nơi khác nhau tùy
        thuộc vào ứng dụng hoặc dịch vụ bạn đang sử dụng. Dưới đây là hướng dẫn
        cho hai trường hợp phổ biến: passkey được lưu trong
        <strong>Google Password Manager</strong> và passkey được lưu trong một
        ứng dụng khác (ví dụ: Microsoft Authenticator).
      </p>
      <h3>Trường hợp 1: Passkey được lưu trong Google Password Manager</h3>
      <ol>
        <li>
          Mở ứng dụng <strong>Google</strong> trên thiết bị Android của bạn hoặc
          truy cập vào <strong>passwords.google.com</strong> qua trình duyệt.
        </li>
        <li>Đăng nhập vào tài khoản Google của bạn nếu được yêu cầu.</li>
        <li>
          Nhấn vào ảnh hồ sơ của bạn ở góc trên bên phải và chọn
          <strong>Manage your Google Account</strong> (Quản lý Tài khoản Google
          của bạn).
        </li>
        <li>Chuyển đến tab <strong>Security</strong> (Bảo mật).</li>
        <li>
          Trong phần <strong>How you sign in to Google</strong> (Cách bạn đăng
          nhập vào Google), nhấn vào <strong>Passkeys</strong>.
        </li>
        <li>
          Xác thực nếu được yêu cầu (ví dụ: bằng cách nhập mật khẩu hoặc sử dụng
          sinh trắc học).
        </li>
        <li>
          Tìm passkey bạn muốn xóa và nhấn vào biểu tượng
          <strong>X</strong> hoặc nút <strong>Delete</strong> (Xóa) bên cạnh nó.
        </li>
        <li>Xác nhận việc xóa.</li>
      </ol>
      <h3>
        Trường hợp 2: Passkey được lưu trong ứng dụng khác (ví dụ: Microsoft
        Authenticator)
      </h3>
      <ol>
        <li>Mở ứng dụng lưu trữ passkey (ví dụ: Microsoft Authenticator).</li>
        <li>Chọn tài khoản có passkey mà bạn muốn xóa.</li>
        <li>
          Nhấn vào <strong>Settings</strong> (Cài đặt) hoặc biểu tượng bánh
          răng.
        </li>
        <li>
          Tìm tùy chọn để xóa passkey (có thể là
          <strong>Delete Passkey</strong> hoặc tương tự).
        </li>
        <li>Làm theo hướng dẫn để xác nhận và xóa passkey.</li>
      </ol>
      <p>
        <strong>Lưu ý:</strong> Nếu bạn xóa passkey từ một thiết bị Android, nó
        có thể ảnh hưởng đến các thiết bị khác nếu chúng được đồng bộ hóa qua
        cùng một tài khoản (ví dụ: tài khoản Google). Một số dịch vụ có thể yêu
        cầu bạn xóa passkey từ trang web hoặc ứng dụng của họ, nhưng trong hướng
        dẫn này, chúng ta tập trung vào việc xóa từ thiết bị.
      </p>
    </div>
    <div class="section">
      <h2>Trên 1Password</h2>
      <h3>Trên máy tính (Windows, macOS)</h3>
      <ol>
        <li>Mở ứng dụng 1Password trên máy tính.</li>
        <li>Đăng nhập và mở khóa ứng dụng bằng mật khẩu chính của bạn.</li>
        <li>
          Tìm mục (item) chứa passkey cần xóa (dùng thanh tìm kiếm nếu cần).
        </li>
        <li>
          Mở mục đó, nhấn nút <strong>Edit</strong> (Chỉnh sửa) ở góc trên bên
          phải.
        </li>
        <li>
          Tìm phần <strong>Passkey</strong> hoặc <strong>WebAuthn</strong>, nhấn
          vào biểu tượng thùng rác hoặc nút <strong>Delete</strong> (Xóa).
        </li>
        <li>Xác nhận xóa và nhấn <strong>Save</strong> (Lưu) để cập nhật.</li>
      </ol>
      <h3>Trên thiết bị di động (iOS, Android)</h3>
      <ol>
        <li>Mở ứng dụng 1Password trên điện thoại hoặc máy tính bảng.</li>
        <li>Đăng nhập và mở khóa ứng dụng.</li>
        <li>Tìm mục chứa passkey cần xóa.</li>
        <li>Nhấn <strong>Edit</strong> (Chỉnh sửa).</li>
        <li>
          Cuộn xuống phần <strong>Passkey</strong>, nhấn vào biểu tượng thùng
          rác hoặc <strong>Delete</strong> (Xóa).
        </li>
        <li>Xác nhận và nhấn <strong>Save</strong> (Lưu).</li>
      </ol>
      <p>
        <strong>Lưu ý:</strong> Hiện tại, phiên bản web của 1Password
        (1Password.com) chưa hỗ trợ xóa passkey trực tiếp. Bạn cần dùng ứng dụng
        desktop hoặc di động. Đảm bảo ứng dụng 1Password của bạn đã được cập
        nhật lên phiên bản mới nhất.
      </p>
    </div>
    <div class="section">
      <h2>Lưu ý quan trọng khi xóa passkey</h2>
      <ul>
        <li>
          <strong>Không thể khôi phục:</strong> Sau khi xóa passkey, bạn không
          thể lấy lại được. Hãy kiểm tra xem bạn có phương thức đăng nhập thay
          thế (như mật khẩu) trước khi xóa.
        </li>
        <li>
          <strong>Đồng bộ hóa:</strong> Nếu bạn dùng tính năng đồng bộ (Google
          Account, 1Password, v.v.), việc xóa passkey trên một thiết bị sẽ ảnh
          hưởng đến các thiết bị khác.
        </li>
        <li>
          <strong>Kiểm tra lại:</strong> Sau khi xóa, hãy thử đăng nhập vào dịch
          vụ liên quan để đảm bảo bạn vẫn truy cập được bằng cách khác.
        </li>
      </ul>
    </div>
    <button @click="goBack" class="back-button">Quay lại</button>

  </div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import { useRouter } from 'vue-router';

export default defineComponent({
  name: 'DeletePasskeyGuide',
  setup() {
    const router = useRouter();

    const goBack = () => {
      router.go(-1); // Quay lại trang trước đó
    };

    return {
      goBack,
    };
  },
});
</script>

<style scoped>
.header{
    padding: 20px;
}
.passkey-guide {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  font-family: Arial, sans-serif;
}

h1 {
  text-align: center;
  color: #333;
}

.section {
  margin-bottom: 30px;
}

h2 {
  color: #007bff;
}

h3 {
  color: #28a745;
}

ol {
  padding-left: 20px;
}

li {
  margin-bottom: 10px;
}

p {
  margin-top: 10px;
  font-style: italic;
}
/* Đảm bảo các thẻ tiêu đề có kích thước phù hợp */
h1 {
  font-size: 2rem; /* Kích thước lớn nhất cho tiêu đề chính */
  margin-bottom: 20px;
  text-align: center;
  color: #333;
}

h2 {
  font-size: 1.75rem; /* Kích thước nhỏ hơn h1 */
  margin-top: 30px;
  margin-bottom: 15px;
  color: #444;
}

h3 {
  font-size: 1.5rem; /* Kích thước nhỏ hơn h2 */
  margin-top: 25px;
  margin-bottom: 10px;
  color: #555;
}

/* Đảm bảo không có kiểu nào ghi đè lên các thẻ tiêu đề */
h1,
h2,
h3 {
  font-weight: bold;
  line-height: 1.2;
}
.back-button {
  display: block;
  margin: 20px auto;
  padding: 10px 20px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.back-button:hover {
  background-color: #0056b3;
}
</style>
