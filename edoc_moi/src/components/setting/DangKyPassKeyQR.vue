<template>
  <div class="container">
    <a-spin :spinning="loading">
      <div>
        <h2>Cấu hình xác thực không cần mật khẩu</h2>
        <p>
          Passkey có thể được sử dụng để đăng nhập như một giải pháp thay thế
          đơn giản và an toàn cho mật khẩu và thông tin xác thực hai yếu tố của
          bạn.
        </p>
        <p>
          Ấn button "Thêm passkey" để tạo mã QR, sau đó quét mã QR trong app CA2
          RS.
        </p>
        <p class="font-[400] text-lg mt-8">Danh sách passkeys</p>
        <div class="flex justify-end">
          <a-button
            class="text-white bg-[#0055E6] w-[120px] h-[36px] border rounded-md mb-2"
            @click="openPopup"
            >Thêm passkey</a-button
          >
        </div>
        <a-table
          :columns="columns"
          :data-source="passkeys"
          :pagination="false"
          bordered
        >
          <template #bodyCell="{ column, record }">
            <template v-if="column.key === 'action'">
              <a-button
                type="primary"
                danger
                size="small"
                @click="deletePasskey(record.key)"
              >
                Xóa
              </a-button>
            </template>
          </template>
        </a-table>
      </div>
      <!-- Bảng hiển thị danh sách passkeys -->
    </a-spin>
    <!-- Popup hiển thị mã QR -->
    <div v-if="showQRPopup" class="popup-overlay">
      <div class="popup">
        <p class="instruction">Quét mã bằng App CA2 RS</p>
        <canvas ref="qrCanvas" class="qr-code"></canvas>
        <button class="close-button" @click="closePopup">Đóng</button>
      </div>
    </div>
    <a-modal
      v-model:visible="visible"
      :closable="false"
      :footer="null"
      width="500px"
      :body-style="{ padding: '24px' }"
    >
      <template #title>
        <div class="ant-modal-title-centered">Thông báo</div>
      </template>
      <div class="text-center">
        <p class="text-gray-700 mb-4">
          Tài khoản "{{ email }}" đã tạo passkey trên thiết bị {{ device }}.
        </p>
        <p class="text-gray-700 mb-4">
          Quý khách vui lòng thực hiện xoá tài khoản passkey hiện có trước khi
          thực hiện thêm mới passkey.
        </p>
      </div>

      <div class="mt-4">
        <a-button
          block
          class="bg-[#0055E6] text-white hover:bg-blue-600 h-[36px]"
          @click="handleConfirm"
        >
          Đã hiểu
        </a-button>
      </div>
    </a-modal>
    <a-modal
      v-model:visible="visibleDangKySuccess"
      :closable="false"
      :footer="null"
      width="500px"
      :body-style="{ padding: '24px' }"
    >
      <template #title>
        <div class="ant-modal-title-centered">Thông báo</div>
      </template>
      <div class="text-center">
        <p class="text-gray-700 mb-4">
          Hệ thống đã tạo mới passkey thành công cho tài khoản
           "{{ email }}" trên thiết bị {{ device }}.
        </p>
      </div>

      <div class="mt-4">
        <a-button
          block
          class="bg-[#0055E6] text-white hover:bg-blue-600 h-[36px]"
          @click="visibleDangKySuccess = false"
        >
          Đóng
        </a-button>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, nextTick } from "vue";
import QRCode from "qrcode";
import { Storage } from "@/utils/Storage";
import axios from "axios";
import { message, Modal } from "ant-design-vue";
import { useRouter } from "vue-router";

const loading = ref(false);
const visibleDangKySuccess = ref(false);
// Trạng thái hiển thị popup
const showQRPopup = ref(false);
const router = useRouter();
// Khởi tạo passkeys với giá trị rỗng
const passkeys: any = ref([]);
const errorText = ref("");
const successMessage = ref("");
// Định nghĩa cột cho bảng
const columns = [
  {
    title: "Tên",
    dataIndex: "username",
    key: "username",
  },
  {
    title: "Thiết bị",
    dataIndex: "device",
    key: "device",
  },
  {
    title: "Hành động",
    key: "action",
  },
];
// Định nghĩa biến và hàm
const visible = ref(false);

const handleConfirm = () => {
  visible.value = false;
  // Thêm logic xử lý khi nhấn "Đã hiểu" ở đây
};
// Hàm lấy dữ liệu từ API
const fetchPasskeys = async () => {
  try {
    loading.value = true;
    const url = new URL(window.location.href);
    const domainName = url.hostname.replace(/^(?:https?:\/\/)?/i, "");
    const username = Storage.get("Email");
    const response = await axios.get(
      `https://ca2rs.nacencomm.vn/user/user-from-username-and-domain?username=${username}&domainName=${domainName}`
    ); // Thay bằng URL API thực tế
    const apiData = response.data;
    if(!apiData) {
      return;
    }
    // Chuyển đổi dữ liệu từ API thành định dạng phù hợp
    passkeys.value = [
      {
        key: apiData.id.toString(), // ID của người dùng làm key
        username: apiData.username, // Username từ API
        device: apiData.passkey.device_name, // Tên thiết bị từ passkey
        mabutky: apiData.mabutky, // Mã bút ký từ API
      },
    ];
  } catch (error) {
    console.error("Lỗi khi lấy dữ liệu từ API:", error);
  } finally {
    loading.value = false;
  }
};
const XoaPasskey = async (
  mabutky: string,
  username: string,
  domainName: string
) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
     <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
            <XoaPasskey xmlns="http://tempuri.org/">
            <mabutky>${mabutky}</mabutky>
            <username>${username}</username>
            <domain_name>${domainName}</domain_name>
            </XoaPasskey>
        </soap12:Body>
    </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("XoaPasskeyResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === -3 || Number(resultValue) === -1) {
      errorText.value = "Lỗi hệ thống";
      return -1;
    } else if (Number(resultValue) === -2) {
      errorText.value =
        "Không tìm thấy tài khoản hoặc tài khoản đã bị xoá trước đó";
      return -2;
    } else if (Number(resultValue) === 1) {
      successMessage.value = "Xoá thành công passkey";
      return 1;
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
    return -3;
  }
};

// Gọi hàm fetchPasskeys khi component được mount
onMounted(() => {
  fetchPasskeys();
  // Xóa interval khi component bị hủy
});
onUnmounted(() => {
  if (intervalId.value) {
    clearInterval(intervalId.value);
  }
});

// Thông tin cần mã hóa vào QR
const username = Storage.get("Email"); // Thay thế bằng giá trị thực tế
const token = ""; // Thay thế bằng giá trị thực tế
const hostname = window.location.origin; // Thay thế bằng giá trị thực tế
const type = "email";

// Dữ liệu JSON để mã hóa vào QR
const qrData = JSON.stringify({ username, token, hostname, type });

// Ref cho thẻ canvas
const qrCanvas = ref<HTMLCanvasElement | null>(null);

// Hàm tạo mã QR
const generateQRCode = async () => {
  if (qrCanvas.value) {
    try {
      await QRCode.toCanvas(qrCanvas.value, qrData, {
        width: 200, // Kích thước mã QR
        margin: 2, // Khoảng cách viền
      });
    } catch (error) {
      console.error("Lỗi khi tạo mã QR:", error);
    }
  }
};
// Lấy email và device từ passkeys
const email = computed(() => passkeys.value[0]?.username || "");
const device = computed(() => passkeys.value[0]?.device || "");
const intervalId = ref<ReturnType<typeof setInterval> | null>(null);

// Hàm mở popup và tạo mã QR
const openPopup = async () => {
  if (passkeys.value.length > 0) {
    visible.value = true;
    //message.error("Bạn đã đăng ký passkey rồi");
    return;
  }
  showQRPopup.value = true;
  // Đợi DOM được cập nhật trước khi tạo mã QR
  await nextTick();
  await generateQRCode();
  // Bắt đầu interval để gọi fetchPasskeys sau mỗi 30 giây
  intervalId.value = setInterval(async () => {
    await fetchPasskeys();
    if (passkeys.value.length > 0) {
      clearInterval(intervalId.value as ReturnType<typeof setInterval>);
        showQRPopup.value = false;
        visibleDangKySuccess.value = true;
    }
  }, 3000);
};

// Hàm đóng popup
const closePopup = () => {
  showQRPopup.value = false;
};

// Hàm xóa passkey
const deletePasskey = async (key: string) => {
  try {
    const index = passkeys.value.findIndex((item) => item.key === key);
    if (index !== -1) {
      const url = new URL(window.location.href);
      const domainName = url.hostname.replace(/^(?:https?:\/\/)?/i, "");
      const username = passkeys.value[index].username;
      const mabutky = passkeys.value[index].mabutky;
      const result = await XoaPasskey(mabutky, username, domainName);

      if (result === 1) {
        successMessage.value = "Xoá thành công passkey";
        passkeys.value.splice(index, 1); // Xóa passkey theo key
        // Hiển thị modal bằng Ant Design Vue
        Modal.success({
          title: "Thành công",
          content:
            successMessage.value + ". Bạn cần xoá passkey trên thiết bị.",
          okText: "Đi tới hướng dẫn",
          onOk: () => {
            // Điều hướng đến trang hướng dẫn khi người dùng nhấn OK
            router.push("/huong-dan-xoa-passkey");
          },
        });
      } else {
        Modal.error({
          title: "Lỗi",
          content: "Xoá passkey thất bại. Vui lòng thử lại.",
        });
      }
    }
  } catch (error) {
    message.error("Lỗi hệ thống");
  }
};
</script>

<style scoped>
/* Container */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
}

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

/* Content Box */
.content-box {
  width: 288px; /* Chiều rộng cố định */
  margin-top: 20px;
  padding: 20px;
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
  text-align: center;
}

.title {
  font-size: 20px;
  font-weight: bold;
  margin-bottom: 15px;
}

.description,
.instruction {
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
}

.add-button {
  padding: 10px 15px;
  font-size: 14px;
  color: white;
  background-color: #007bff;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.add-button:hover {
  background-color: #0056b3;
}

/* Popup */
.popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.popup {
  background-color: white;
  padding: 20px;
  border-radius: 10px;
  text-align: center;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.qr-code {
  margin: 20px auto;
  border: 1px solid #ccc;
  padding: 10px;
  background-color: white;
}

.note {
  font-size: 14px;
  color: #333;
  margin-bottom: 15px;
}

.close-button {
  padding: 10px 15px;
  font-size: 14px;
  color: white;
  background-color: #dc3545;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}

.close-button:hover {
  background-color: #a71d2a;
}
/* Container */
.container {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-height: 100vh;
  background-color: #f9f9f9;
}

/* Header */
.header {
  width: 100%;
  padding: 15px;
  color: black;
  font-size: 18px;
  font-weight: bold;
  text-align: center;
}

.add-button {
  float: right;
  background-color: #007bff;
  color: white;
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
}
/* Đảm bảo tiêu đề modal được căn giữa */
.ant-modal-title-centered {
  text-align: center;
}
</style>
