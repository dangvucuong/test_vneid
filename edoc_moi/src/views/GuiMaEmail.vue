<template>
  <div
    class="w-screen h-screen flex justify-center relative items-center bg-[#70A0F1]"
  >
    <BackgroundCircle21></BackgroundCircle21>
    <div
      class="w-[450px] h-[431px] p-[48px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-50"
    >
      <form class="space-y-6" action="#">
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Vui lòng kiểm tra email
        </h3>
        <div class="font-nunito text-[13px] leading-[20px]">
          Chúng tôi đã gửi mã đến
          <span class="text-[#4C88ED]">{{ route.params.email }}</span>
          .Vui lòng kiểm tra email và nhập mã chúng tôi đã gửi cho bạn.
        </div>
        <div class="grid grid-cols-6 mx-auto">
          <!-- Form Group -->
          <input
            v-for="i in 6"
            :key="i"
            type="text"
            class="text-center mx-[6px] w-[40px] h-[47px] border rounded-lg text-[24px] leading-8 focus:border-primary focus:ring-primary"
            required="true"
            maxlength="1"
            v-model="emailCode[i - 1]"
            @input="onInput(i - 1)"
          />
        </div>
        <div class="flex justify-center">
          <a-button
            class="w-[444px] h-[36px] border rounded-md bg-[#0055E6] text-white"
            @click="confirmCodeEmail"
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
          class="font-nunito text-[13px] leading-[20px] text-center mb-[24px]"
        >
          Bạn chưa nhận được mã? Kiểm tra mục spam hoặc
          <a href="#" class="text-[#4C88ED]" @click="resendCode">Gửi lại mã</a>
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import axios from "axios";
import { isEmpty, some } from "lodash-es";
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
const emailCode = ref(["", "", "", "", "", ""]);
const disabled = ref(true);
const onInput = (index: number) => {
  if (index < emailCode.value.length - 1 && emailCode.value[index] !== "") {
    const nextIndex = index + 1;
    if (nextIndex < emailCode.value.length) {
      const nextInput = document.querySelector(
        `input[type="text"]:nth-child(${nextIndex + 1})`
      ) as HTMLInputElement;
      if (nextInput) {
        nextInput.focus();
      }
    }
  }
};
const isEnableButton = computed(() => {
  return !some(emailCode.value, (code: any) => isEmpty(code));
});
const confirmCodeEmail = async () => {
  await Xacnhanchuoixacnhan();
};
const Xacnhanchuoixacnhan = async () => {
  try {
    const maxacnhan = Number(emailCode.value.join(""));
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
     <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Xacnhanchuoixacnhan xmlns="http://tempuri.org/">
          <Maxacnhan>${maxacnhan}</Maxacnhan>
          <TaikhoanSD>${route.params.email}</TaikhoanSD>
          <MucdichSD>1</MucdichSD>
        </Xacnhanchuoixacnhan>
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
      "XacnhanchuoixacnhanResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) !== 1) {
      message.error("Yêu cầu xác nhận của bạn đã hết hiệu lực");
    } else if (Number(resultValue) === 1) {
      router.push("/dang-ky-mat-khau/" + route.params.email);
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
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
          <TaikhoanSD>${route.params.email}</TaikhoanSD>
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
    const resultNode: any = xmlDoc.getElementsByTagName(
      "LaymaxacminhTKResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
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
          <emailnhan>${route.params.email}</emailnhan>
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
    const resultNode: any = xmlDoc.getElementsByTagName("SendMailResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === 1) {
      message.success("Gửi lại mã thành công");
      // Todo kichhoattaikhoan
    } else {
      message.error("Lỗi hệ thống");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const resendCode = async () => {
  await LaymaxacminhTK();
};
</script>
