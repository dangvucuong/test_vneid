<template>
  <div class="register-container">
    <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
      Xoá passkey
    </h3>
    <div v-if="successMessage">
      <p>{{ successMessage }}</p>
    </div>
    <div v-else>
      <p v-if="errorText" class="error-text">{{ errorText }}</p>
      <a-form
        ref="formRef"
        :layout="'vertical'"
        :model="formState"
        :class="'m-4'"
        autocomplete="off"
      >
        <a-form-item label="Tài khoản (Email)" name="email">
          <a-input
            v-model:value="formState.email"
            :class="'w-full'"
            readonly
            disabled
          />
        </a-form-item>
        <a-form-item label="Mật khẩu" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="•••••••"
            autocomplete="on"
          />
        </a-form-item>
      </a-form>
      <div class="m-4">
        <div class="flex gap-2">
          <a-button
            class="mt-2 text-[#0055E6] bg-white w-full h-[36px] border border-[#0055E6] rounded-md flex items-center justify-center gap-2"
            @click="handleSubmit"
            :disabled="!formState.password"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>Xoá</span>
            </div>
          </a-button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { startRegistration } from "@simplewebauthn/browser";
import { userLogin } from "@/api/auth";
import { Modal } from "ant-design-vue";

const route = useRoute();
const router = useRouter();
// Form state
const formState = reactive({
  email: "",
  password: "",
});

const successMessage = ref("");
const errorText = ref("");
onMounted(() => {
  formState.email = (route.query.email as string) || "";
});

const checkLogin = async (email: string, password: string) => {
  let resultValue = "";
  let textValue = "";
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await userLogin(formState.email, formState.password);
    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("DangnhapResult")[0];
    resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === -5) {
      textValue = "Sai thông tin đăng nhập";
    } else if (Number(resultValue) === -4) {
      textValue = "Nhập sai thông tin đăng nhập quá 5 lần";
    } else if (Number(resultValue) === -3) {
      textValue = "Tài khoản đã bị khóa";
    } else if (Number(resultValue) === -2) {
      textValue = "Tài khoản chưa được kích hoạt";
    } else if (Number(resultValue) === -1) {
      textValue = "Lỗi hệ thống";
    } else if (Number(resultValue) === 0 || Number(resultValue) === -100) {
      textValue = "Tài khoản không tồn tại";
    } else if (Number(resultValue) === 1) {
      textValue = "Thành công";
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
  return { resultValue: Number(resultValue), textValue };
};

const deletePasskey = async () => {
  try {
    const loginResult = await checkLogin(formState.email, formState.password);
    if (loginResult.resultValue !== 1) {
      errorText.value = loginResult.textValue;
      return;
    }

    const mabutky: any = route.query.mabutky;
    const url = new URL(window.location.href);
    // Loại bỏ http:// hoặc https://
    const domainName = url.hostname.replace(/^(?:https?:\/\/)?/i, "");
    const result = await XoaPasskey(mabutky, formState.email, domainName);
    if (result === 1) {
      successMessage.value = "Xoá thành công passkey";

      // Hiển thị modal bằng Ant Design Vue
      Modal.success({
        title: "Thành công",
        content: successMessage.value + ". Bạn cần xoá passkey trên thiết bị.",
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
  } catch (error: any) {
    if (error.response?.status === 409) {
      errorText.value = "Email đã được đăng ký";
    } else {
      errorText.value = error.response?.data?.message || "Lỗi hệ thống";
    }
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
const handleSubmit = () => {
  if (formState.password) {
    deletePasskey();
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

h1 {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.error-text {
  color: red;
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
