<template>
  <div class="w-screen h-screen flex items-center justify-center bg-[#70A0F1]">
    <BackgroundCircle21></BackgroundCircle21>
    <div
      class="w-[450px] h-[710px] gap-[4px] bg-white border border-gray-200 rounded-lg shadow sm:p-6 md:p-8 dark:bg-gray-800 dark:border-gray-700 z-50"
    >
      <a-spin :spinning="isLoading">
        <form class="space-y-6" action="#">
          <div class="logo">
            <img
              src="@/assets/img/logo.png"
              alt="logo"
              class="mx-auto w-[145px]"
            />
          </div>
          <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
            Đăng ký tài khoản
          </h3>
          <a-form
            ref="formRef"
            :layout="'vertical'"
            :model="formState"
            :rules="rules"
          >
            <a-form-item label="Họ và tên" name="hoten">
              <a-input
                v-model:value="formState.hoten"
                placeholder="Nhập họ và tên"
                :class="'w-full'"
              />
            </a-form-item>
            <a-form-item label="Email đăng ký" name="email">
              <a-input
                v-model:value="formState.email"
                placeholder="Nhập email"
                :class="'w-full'"
              />
            </a-form-item>
            <a-form-item label="Số điện thoại" name="sodienthoai">
              <a-input
                v-model:value="formState.sodienthoai"
                placeholder="Nhập số điện thoại"
                :class="'w-full'"
              />
            </a-form-item>
            <a-form-item label="Tên tổ chức" name="tentochuc">
              <a-input
                v-model:value="formState.tentochuc"
                placeholder="Nhập tên tổ chức"
                :class="'w-full'"
              />
            </a-form-item>
            <a-form-item label="Mã số thuế" name="masothue">
              <a-input
                v-model:value="formState.masothue"
                placeholder="Nhập mã số thuế của bạn"
                :class="'w-full'"
              />
            </a-form-item>
          </a-form>
          <a-button
            class="w-[386px] h-[36px] border rounded-md"
            :class="
              isEnableButton
                ? 'bg-[#0055E6] text-white'
                : 'bg-[#E6E6E8] text-[#9B9B9E]'
            "
            :disabled="!isEnableButton"
            @click="register"
            >Gửi yêu cầu đăng ký</a-button
          >
          <div class="flex justify-center gap-2 mt-4 text-slate-400">
            <div>Bạn đã có tài khoản ?</div>
            <a href="/dang-nhap" class="text-[#1966E8]">Đăng nhập</a>
          </div>
        </form>
      </a-spin>
    </div>
  </div>
</template>
<script setup lang="ts">
import { Rule } from "ant-design-vue/es/form";
import { isEmpty } from "lodash-es";
import { UnwrapRef } from "vue";
import { useRouter } from "vue-router";
import axios from "axios";
import { message } from "ant-design-vue";
const isLoading = ref(false);
const router = useRouter();
interface FormState {
  email: string;
  hoten: string;
  sodienthoai: string;
  masothue: string;
  tentochuc: string;
}
const formState: UnwrapRef<FormState> = reactive({
  email: "",
  hoten: "",
  sodienthoai: "",
  masothue: "",
  tentochuc: "",
});
const isEnableButton = computed(() => {
  return (
    !isEmpty(formState.email) &&
    !isEmpty(formState.hoten) &&
    !isEmpty(formState.sodienthoai)
  );
});
const register = async () => {
  isLoading.value = true;
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
       <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
         <soap12:Body>
           <Dangky xmlns="http://tempuri.org/">
               <TTDangky>
                 <Email>${formState.email}</Email>
                 <Hoten>${formState.hoten}</Hoten>
                 <Sodienthoai>${formState.sodienthoai}</Sodienthoai>
                 <Masothue>${formState.masothue}</Masothue>
                 <Tentochuc>${formState.tentochuc}</Tentochuc>
               </TTDangky>
             </Dangky>
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
    const resultNode: any = xmlDoc.getElementsByTagName("DangkyResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === -3) {
      message.error("Email đã tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi đăng ký");
    } else if (Number(resultValue) === 1) {
      await kichHoatTaiKhoan();
    }
    isLoading.value = false;
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  } finally {
    isLoading.value = false;
  }
};
const kichHoatTaiKhoan = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Kichhoattaikhoan xmlns="http://tempuri.org/">
            <Email>${formState.email}</Email>
          </Kichhoattaikhoan>
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
    const resultNode: any = xmlDoc.getElementsByTagName(
      "KichhoattaikhoanResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === 1) {
      await sendEmail();
      router.push("/xac-nhan-email/" + formState.email);
    } else if (Number(resultValue) === 0) {
      message.error("Tài khoản không tồn tại");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản truyền vào giá trị rỗng");
    } else if (Number(resultValue) === -3) {
      message.error("Tài khoản đã bị khóa");
    } else if (Number(resultValue) === -4) {
      message.error("Tài khoản đã được kích hoạt");
    }
    // router.push("/xac-nhan-email");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const sendEmail = async () => {
  try {
    const htmlData = await fetch("/template/SendEmail.html");
    const htmlContent = await htmlData.text();
    const replacedHtmlContent = htmlContent.replace(
      "{Url}",
      `https://ca2sp.nacencomm.vn/thiet-lap-mat-khau?email=${formState.email}`
    );

    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${formState.email}</emailnhan>
          <Subject>Kích hoạt tài khoản</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>Kích hoạt tài khoản</tieude>
        </SendMail>
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
    const resultNode: any = xmlDoc.getElementsByTagName("SendMailResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === 1) {
      // Todo kichhoattaikhoan
    } else {
      message.error("Lỗi hệ thống");
    }
    // router.push("/xac-nhan-email");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const rules: Record<string, Rule[]> = {
  email: [
    { required: true, message: "Hãy nhập email", trigger: "change" },
    {
      type: "email",
      message: "Hãy nhập đúng định dạng email",
    },
  ],
  hoten: [{ required: true, message: "Hãy nhập họ và tên", trigger: "change" }],
  sodienthoai: [
    { required: true, message: "Hãy nhập số điện thoại", trigger: "change" },
  ],
};
</script>
