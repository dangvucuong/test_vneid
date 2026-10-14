<template>
  <div
    class="w-screen h-screen flex justify-center relative items-center bg-[#70A0F1]"
  >
    <BackgroundCircle21></BackgroundCircle21>
    <div
      class="w-[450px] h-[428px] p-[36px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-50"
    >
      <a-spin :spinning="isLoading">
        <form class="space-y-6" action="#">
          <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
            Quên mật khẩu
          </h3>
          <div class="font-nunito text-[13px] leading-[20px] text-center">
            Vui lòng nhập địa chỉ email bạn đã đăng ký và chúng tôi sẽ gửi cho
            bạn mã để đặt lại mật khẩu.
          </div>
          <div class="grid justify-center gap-6">
            <!-- Form Group -->
            <a-form
              ref="formRef"
              name="dynamic_form_nest_item"
              @finish="sendCodeEmail"
              :layout="'vertical'"
            >
              <a-form-item label="Email" name="Matkhaucu">
                <a-input
                  class=""
                  v-model:value="formState.email"
                  placeholder="Nhập email"
                />
              </a-form-item>
              <a-button
                class="w-[354px] h-[36px] border rounded-md"
                @click="sendCodeEmail"
                :class="
                  isEnableButton
                    ? 'bg-[#0055E6] text-white'
                    : 'bg-[#E6E6E8] text-[#9B9B9E]'
                "
                :disabled="!isEnableButton"
                >Tiếp tục</a-button
              >
              <a href="/dang-nhap">
                <div class="flex justify-center gap-2 mt-4 text-slate-400">
                  <ChevronLeftIcon></ChevronLeftIcon>
                  <div>Quay lại đăng nhập</div>
                </div>
              </a>
            </a-form>
          </div>
        </form>
      </a-spin>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isEmpty } from "lodash-es";
import { UnwrapRef } from "vue";
import { useRouter } from "vue-router";
import ChevronLeftIcon from "@/assets/img/chevron_left.svg?component";
import axios from "axios";
import { message } from "ant-design-vue";
const isLoading = ref(false);
const router = useRouter();
const isEnableButton = computed(() => {
  return !isEmpty(formState.email);
});
interface FormState {
  email: string;
}
const formState: UnwrapRef<FormState> = reactive({
  email: "",
});
const sendCodeEmail = async () => {
  isLoading.value = true;
  try {
    await LaymaxacminhTK();
    router.push("/ma-code-email/" + formState.email);
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
};
const LaymaxacminhTK = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    const MucdichSD = 1;
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <LaymaxacminhTK xmlns="http://tempuri.org/">
          <TaikhoanSD>${formState.email}</TaikhoanSD>
          <MucdichSD>${MucdichSD}</MucdichSD>
        </LaymaxacminhTK>
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
    const resultNode = xmlDoc.getElementsByTagName("LaymaxacminhTKResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (resultValue) {
      await sendEmailReset(resultValue);
      // Todo kichhoattaikhoan
    } else {
      message.error("Lỗi hệ thống");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const sendEmailReset = async (maxacminh: any) => {
  try {
    const htmlData = await fetch("/template/SendmailReset.html");
    const htmlContent = await htmlData.text();
    const replacedHtmlContent = htmlContent.replace(
      "{Maxacminh}",
      `${maxacminh}`
    );

    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${formState.email}</emailnhan>
          <Subject>Xác minh tài khoản hệ thống CA2 SIGNFLATFORM</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>CA2 SIGNFLATFORM</tieude>
        </SendMail>
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
    const resultNode = xmlDoc.getElementsByTagName("SendMailResult")[0];
    const resultValue = resultNode.textContent;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      // Todo kichhoattaikhoan
    } else {
      message.error("Lỗi hệ thống");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
</script>
