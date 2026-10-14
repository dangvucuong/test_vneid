<template>
  <div class="max-w-[1136px]">
    <div>
      <div class="row items-center justify-between text-[#343436] p-8">
        <div>
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Thay đổi mật khẩu
          </div>
          <div
            class="font-nunito text-[16px] leading-6 font-medium text-[#9B9B9E]"
          >
            Mật khẩu yêu cầu có tối thiểu 6 ký tự bao gồm số, chữ cái thường,chữ cái in hoa,
            ký tự đặc biệt.
          </div>
        </div>
        <div>
          <a-form
            ref="formRef"
            :layout="'vertical'"
            :model="formState"
            :class="'m-4 w-[354px]'"
            :rules="rules"
          >
            <a-form-item label="Mật khẩu cũ" name="Matkhaucu">
              <a-input-password
                class=""
                v-model:value="formState.Matkhaucu"
                placeholder="Nhập mật khẩu cũ"
              />
            </a-form-item>
            <a-form-item label="Mật khẩu mới" name="Matkhaumoi">
              <a-input-password
                class=""
                v-model:value="formState.Matkhaumoi"
                placeholder="Nhập mật khẩu mới"
              />
            </a-form-item>
            <a-form-item label="Xác nhận mật khẩu mới" name="Matkhaumoixacnhan">
              <a-input-password
                v-model:value="formState.Matkhaumoixacnhan"
                placeholder="Nhập lại mật khẩu mới"
              />
            </a-form-item>
          </a-form>
        </div>
        <div class="p-4 gap-4 flex justify-end">
          <a-button
            key="back"
            @click=""
            class="w-[140px] h-[36px] text-[#1E1E1E]"
            >Hủy</a-button
          >
          <a-button
            key="submit"
            type="primary"
            @click="Doimatkhau"
            class="w-[140px] h-[36px] bg-[#0055E6] text-white"
            >Xác nhận</a-button
          >
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Rule } from "ant-design-vue/es/form";
import { UnwrapRef } from "vue";
import Storage from '@/utils/Storage';
import axios from "axios";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
const router = useRouter();
const email = Storage.get("email");
const formState: UnwrapRef<any> = reactive({
  Matkhaucu: "",
  Matkhaumoi: "",
  Matkhaumoixacnhan: "",
});
const checkConfirmPassword = async (_rule: Rule, value: string) => {
  if (!value || formState.Matkhaumoi === value) {
    return Promise.resolve();
  }
  return Promise.reject(new Error("Xác nhận mật khẩu không đúng!"));
};
const checkPassword = async (_rule: Rule, value: string) => {
  const passwordRegex = /^(?=.*[A-Z])(?=.*[\W_]).{6,}$/;
  if (!passwordRegex.test(value)) {
    return Promise.reject("Hãy nhập mật khẩu thỏa mãn các điều kiện trên");
  }
};
const rules: Record<string, Rule[]> = {
  Matkhaucu: [
    {
      required: true,
      message: "Hãy nhập mật khẩu cũ",
      trigger: "change",
    },
  ],
  Matkhaumoixacnhan: [{
      required: true,
      message: "Hãy nhập mật khẩu mới",
      trigger: "change",
    },{ validator: checkConfirmPassword, trigger: "change" }],
  Matkhaumoi: [{
      required: true,
      message: "Hãy nhập xác nhận mật khẩu mới",
      trigger: "change",
    },{ validator: checkPassword, trigger: "change" }],
};
const formRef= ref();
const Doimatkhau = async () => {
  try {
    await formRef.value.validate();
    try {
      // URL của API server SOAP
      const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
      // Envelope của SOAP request
      const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Doimatkhau xmlns="http://tempuri.org/">
            <Email>${email}</Email>
            <Matkhaucu>${formState.Matkhaucu}</Matkhaucu>
            <Matkhaumoi>${formState.Matkhaumoi}</Matkhaumoi>
          </Doimatkhau>
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
        "DoimatkhauResult"
      )[0];
      const resultValue = resultNode.textContent || resultNode.innerText;
      // Cập nhật giá trị kết quả
      console.log(resultValue);
      if (Number(resultValue) === 1) {
        message.success("Đổi mật khẩu thành công");
      } else if (Number(resultValue) === 0) {
        message.error("Tài khoản không tồn tại");
      } else if (Number(resultValue) === -1) {
        message.error("Lỗi hệ thống");
      } else if (Number(resultValue) === -2) {
        message.error("Tài khoản chưa được kích hoạt");
      } else if (Number(resultValue) === -3) {
        message.error("Tài khoản đã bị khóa");
      } else if (Number(resultValue) === -4) {
        message.error("Mật khẩu cũ không đúng");
      }else if (Number(resultValue) === -5) {
        message.error("Tài khoản chưa thiết lập mật khẩu");
      }
    } catch (error) {
      console.error("Error calling SOAP service:", error);
    }
  } catch (error) {}
};
</script>
