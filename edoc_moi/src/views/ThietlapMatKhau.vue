<template>
  <a-spin :spinning="isLoading">
    <div
      class="w-screen h-screen flex justify-center relative items-center bg-[#70A0F1]"
    >
      <BackgroundCircle21></BackgroundCircle21>
      <div
        class="w-[450px] p-[36px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-50"
      >
        <form class="space-y-6" action="#">
          <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
            Tạo mật khẩu mới
          </h3>
          <div class="grid justify-center">
            <!-- Form Group -->
            <a-form
              ref="formRef"
              :layout="'vertical'"
              :model="formState"
              :class="'m-4 w-[354px]'"
              :rules="rules"
            >
              <a-form-item label="Tài khoản(Email):" name="email">
                <a-input
                  class=""
                  :value="String(route.query.email)"
                  :readonly="true"
                  disabled
                />
              </a-form-item>
              <a-form-item label="Mật khẩu đăng nhập" name="password">
                <a-input-password
                  class=""
                  v-model:value="formState.password"
                  placeholder="Nhập mật khẩu mới"
                />
              </a-form-item>
              <a-form-item label="Xác nhận mật khẩu" name="passwordConfirm">
                <a-input-password
                  v-model:value="formState.passwordConfirm"
                  placeholder="Nhập lại mật khẩu mới"
                />
              </a-form-item>
            </a-form>
          </div>
          <div class="flex justify-center">
            <a-button
              class="w-[354px] h-[36px] border rounded-md"
              @click="registerPassword"
              :class="
                isEnableButton
                  ? 'bg-[#0055E6] text-white'
                  : 'bg-[#E6E6E8] text-[#9B9B9E]'
              "
              :disabled="!isEnableButton"
              >Tiếp tục</a-button
            >
          </div>
          <div
            class="font-nunito text-[13px] leading-[20px] text-left mb-[24px] px-[11px]"
          >
            Mật khẩu yêu cầu:
            <ul class="list-disc list-inside">
              <li>Tối thiểu 6 ký tự</li>
              <li>Ít nhất một chữ cái viết hoa</li>
              <li>Ít nhất một ký tự đặc biệt</li>
            </ul>
          </div>
        </form>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { Rule } from "ant-design-vue/es/form";
import axios from "axios";
import { isEmpty } from "lodash-es";
import { UnwrapRef } from "vue";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const isLoading = ref(false);
const isEnableButton = computed(() => {
  return (
    !isEmpty(formState.password) &&
    !isEmpty(formState.passwordConfirm) &&
    formState.password === formState.passwordConfirm
  );
});
const resendCode = () => {
  console.log("Gửi lại mã");
};
interface FormState {
  password: string;
  passwordConfirm: string;
}
const formState: UnwrapRef<FormState> = reactive({
  password: "",
  passwordConfirm: "",
});
const formRef = ref();

const registerPassword = async () => {
  try {
    isLoading.value = true;
    await formRef.value.validate();
    try {
      // URL của API server SOAP
      const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
      // Envelope của SOAP request
      const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Thietlapmatkhau xmlns="http://tempuri.org/">
            <Email>${route.query.email}</Email>
            <Matkhau>${formState.password}</Matkhau>
          </Thietlapmatkhau>
        </soap12:Body>
      </soap12:Envelope>
      `;

      // Thực hiện request SOAP sử dụng axios
      const response = await axios.post(apiUrl, soapEnvelope, {
        headers: {
          "Content-Type": "application/soap+xml; charset=utf-8",
        },
      });

      // Lấy dữ liệu từ phản hồi SOAP
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(response.data, "text/xml");
      const resultNode = xmlDoc.getElementsByTagName(
        "ThietlapmatkhauResult"
      )[0];
      const resultValue = resultNode.textContent || resultNode.innerHTML;
      // Cập nhật giá trị kết quả
      console.log(resultValue);
      if (Number(resultValue) === 1) {
        router.push("/dang-ky-mat-khau-thanh-cong");
      } else if (Number(resultValue) === 0) {
        message.error("Tài khoản không tồn tại");
      } else if (Number(resultValue) === -1) {
        message.error("Lỗi hệ thống");
      } else if (Number(resultValue) === -2) {
        message.error("Tài khoản chưa được kích hoạt");
      } else if (Number(resultValue) === -3) {
        message.error("Tài khoản đã bị khóa");
      } else if (Number(resultValue) === -4) {
        message.error("Tài khoản đã được thiết lập mật khẩu");
      }
    } catch (error) {
      console.error("Error calling SOAP service:", error);
    }
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};
const checkConfirmPassword = async (_rule: Rule, value: string) => {
  if (!value || formState.password === value) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Mật khẩu mới bạn nhập không khớp!"));
};
const checkPassword = async (_rule: Rule, value: string) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
  if (!value) {
    return Promise.reject("Hãy nhập mật khẩu");
  } else if (!passwordRegex.test(value)) {
    return Promise.reject("Hãy nhập mật khẩu thỏa mãn các điều kiện bên dưới");
  }
};
const rules: Record<string, Rule[]> = {
  passwordConfirm: [
    { validator: checkConfirmPassword, trigger: "change" },
    {
      required: true,
      message: "Hãy nhập lại mật khẩu mới",
      trigger: "blur",
    },
  ],
  password: [
    { validator: checkPassword, trigger: "change" },
    {
      required: true,
      message: "Hãy nhập mật khẩu mới",
      trigger: "blur",
    },
  ],
};
</script>
