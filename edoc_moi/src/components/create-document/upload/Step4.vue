<template>
  <a-spin :spinning="isLoading">
    <div class="w-[1040px] mx-auto gap-4 bg-white p-2">
      <div class="flex divide-x">
        <div class="flex-none w-[680px] flex-col gap-4 p-4">
          <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
            Email gửi người nhận
          </h3>
          <a-form
            ref="formRef"
            :layout="'vertical'"
            :model="formData"
            :class="'m-4'"
          >
            <a-form-item
              label="Tiêu đề Email"
              name="subject"
              :rules="[
                {
                  required: true,
                  message: 'Hãy nhập tiêu đề Email',
                  trigger: 'blur',
                },
              ]"
            >
              <a-input
                v-model:value="formData.subject"
                placeholder="Nhập tiêu đề email"
                :class="'w-full'"
              />
            </a-form-item>
            <a-form-item label="Nội dung Email" name="body">
              <a-textarea
                v-model:value="formData.body"
                placeholder="Nhập nội dung Email"
                :auto-size="{ minRows: 5, maxRows: 20 }"
              />
            </a-form-item>
          </a-form>
          <!-- <BaseInputForm
          :label="'Tiêu đề Email'"
          :type="'text'"
          :placeholder="'Nhập tiêu đề email'"
          v-model="formData.title"
          :style="'w-full'"
          :is-required="'true'"
        ></BaseInputForm>
        <BaseInputArea
          v-model="formData.content"
          :placeholder="'Nhập nội dung Email'"
          :style="'w-full h-[145px]'"
          :label="'Nội dung Email'"
          :rows="'4'"
        >
        </BaseInputArea> -->
          <!-- <div class="font-nunito text-[16px] leading-6 flex">
          Thiết lập bổ sung
        </div>
        <div>
          <div
            class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold text-[#1E1E1E]"
          >
            Thêm vào thư mục
          </div>
          <a-select
            ref="select"
            v-model:value="formData.type"
            :options="listType"
            :placeholder="'Chọn danh mục tài liệu'"
            class="custom-select w-full"
          >
          </a-select>
        </div> -->
        </div>
        <div class="flex-none w-[360px] p-4">
          <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
            Thông tin chung
          </h3>
          <div class="pt-2">
            <div
              class="font-nunito text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
            >
              Người gửi
            </div>
            <div class="flex gap-2 items-center">
              <img src="@/assets/img/Avatar.png" alt="logo" class="w-[24px]" />
              {{ Hoten }}
            </div>
            <div class="pt-2">
              <div
                class="font-nunito text-[13px] leading-[20px] mb-1 font-normal text-[#7C7C7E]"
              >
                Tài liệu
              </div>
              <div class="flex gap-1 items-center">
                <div
                  class="border bg-[#D4D4D6] w-[24px] h-[24px] flex items-center justify-center"
                >
                  <TextSniperIcon
                    class="fill-[#1E1E1E] text-white w-[16px] h-[16px]"
                  ></TextSniperIcon>
                </div>
                <div>{{ fileStore.tenFile }}</div>
              </div>
            </div>
          </div>
          <a-divider></a-divider>
          <h3 class="font-nunito text-[24px] leading-8 flex font-bold">
            Người nhận
          </h3>
          <div
            class="flex gap-2 items-center justify-center p-2"
            v-for="(user, index) in users"
            :key="user.TaikhoanDB"
          >
            <div
              class="w-[32px] h-[32px] bg-[#E6E6E8] border flex items-center justify-center"
            >
              {{ index + 1 }}
            </div>
            <div
              class="w-[288px] border border-[#EF9A9B] rounded-lg h-[68px] flex flex-col font-nunito leading-5 text-[14px] justify-center p-2"
            >
              <div class="font-semibold">
                {{ user.HotenTKDB }}
              </div>
              <div>{{ user.TaikhoanDB }}</div>
              <div><span>Trình tự kí: </span>{{ index + 1 }}</div>
            </div>
          </div>
        </div>
      </div>
      <div class="flex justify-end gap-4 bg-white pt-8">
        <a-button
          class="w-[140px] h-[36px] border rounded-md bg-white text-[#1E1E1E]"
          @click="backStep"
          >Quay lại</a-button
        >
        <a-button
          class="w-[140px] h-[36px] border rounded-md bg-[#0055E6] text-white"
          @click="sendData"
          >Xác nhận và gửi</a-button
        >
      </div>
    </div>
  </a-spin>

  <a-modal
    v-model:open="modalSaveTemplate"
    title="Lưu template thiết lập ký"
    centered
    :maskClosable="false"
    ok-text="Lưu"
    cancel-text="Không lưu"
    @ok="confirmSaveTemplate"
    @cancel="cancelSaveTemplate"
  >
    <p class="mb-3">
      Bạn có muốn lưu thiết lập người ký và vị trí ký của văn bản này làm
      template để sử dụng lại cho những lần sau không?
    </p>
    <div class="font-semibold mb-1">Tên template</div>
    <a-input
      v-model:value="templateNameInput"
      placeholder="Nhập tên template"
      :maxlength="250"
      allow-clear
      @pressEnter="confirmSaveTemplate"
    />
  </a-modal>
</template>
<script setup lang="ts">
import BaseInputForm from "@/components/BaseInputForm.vue";
import BaseInputArea from "@/components/BaseInputArea.vue";
import TextSniperIcon from "@/assets/img/text_sniper.svg?component";
import { useFileStoreHook } from "@/store/modules/file";
import { Storage } from "@/utils/Storage";
import { message } from "ant-design-vue";
import axios from "axios";
import router from "@/router";
import { filter } from "lodash-es";
import {
  buildThietLapCKyXml,
  Luuthietlap_template,
} from "@/services/templateThietLap";

const props = defineProps({
  file: { type: Object, default: undefined },
  /** Bật popup lưu template (trang Tạo mới tài liệu 2026) */
  enableSaveTemplate: { type: Boolean, default: false },
});

const fileStore = useFileStoreHook();
const Email = Storage.get("email");
const Hoten = Storage.get("Hoten");
const isLoading = ref(false);
const formData = reactive({
  subject: fileStore.tenFile,
  body: "",
});
const users = filter(fileStore.ListTaiKhoanKy, (obj) => {
  return obj.Hinhthucky !== 2;
});
const emit = defineEmits(["changeStep"]);

const modalSaveTemplate = ref(false);
const templateNameInput = ref("");
const resolveSaveTemplate = ref<((value: string | null) => void) | null>(null);

const askSaveTemplate = (): Promise<string | null> => {
  templateNameInput.value = "";
  modalSaveTemplate.value = true;
  return new Promise((resolve) => {
    resolveSaveTemplate.value = resolve;
  });
};

const confirmSaveTemplate = () => {
  const ten = templateNameInput.value.trim();
  if (!ten) {
    message.warning("Hãy nhập tên template");
    return Promise.reject();
  }
  modalSaveTemplate.value = false;
  resolveSaveTemplate.value?.(ten);
  resolveSaveTemplate.value = null;
};

const cancelSaveTemplate = () => {
  modalSaveTemplate.value = false;
  resolveSaveTemplate.value?.(null);
  resolveSaveTemplate.value = null;
};

const saveTemplateThietLap = async (tenTLap: string) => {
  const listVungKy = fileStore.ListVungKy || [];
  if (!listVungKy.length) {
    message.warning("Không có dữ liệu vùng ký để lưu template");
    return;
  }
  const templateXml = buildThietLapCKyXml(Email, listVungKy);
  const result = await Luuthietlap_template(Email, templateXml, tenTLap);
  if (result >= 1) {
    message.success("Đã lưu template thiết lập ký thành công");
  } else if (result === -2) {
    message.error("Mỗi tài khoản chỉ được lưu tối đa 5 template");
  } else if (result === -3) {
    message.error("Thiếu thông tin tài khoản, không lưu được template");
  } else {
    message.error("Lưu template thất bại");
  }
};

const sendData = async () => {
  try {
    if (props.enableSaveTemplate) {
      const tenTLap = await askSaveTemplate();
      if (tenTLap) {
        await saveTemplateThietLap(tenTLap);
      }
    }
    isLoading.value = true;
    await sendEmail();
    await Capnhattieudeguimail();
    await GuiVB();
    router.push({ path: "tai-lieu" });
  } catch (error) {
    message.error("Lỗi Hệ thống");
    console.log(error);
  } finally {
    isLoading.value = false;
  }
};
const backStep = () => {
  emit("changeStep", 2);
};
const sendEmail = async () => {
  try {
    const htmlData = await fetch("/template/NotificationSign.html");
    const htmlContent = await htmlData.text();
    const replacedHtmlContent = htmlContent
      .replace("{url}", `https://ca2sp.nacencomm.vn`)
      .replace("{nameSend}", Hoten)
      .replace("{nameFile}", fileStore.tenFile)
      .replace("{noidung}", formData.body);
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <SendMail xmlns="http://tempuri.org/">
          <emailnhan>${users[0].TaikhoanDB}</emailnhan>
          <Subject>${formData.subject}</Subject>
          <body><![CDATA[${replacedHtmlContent}]]></body>
          <CCMail></CCMail>
          <tieude>CA2.SignPlatform</tieude>
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
    const resultNode = xmlDoc.getElementsByTagName("SendMailResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === 1) {
    } else {
      message.error("Lỗi hệ thống");
    }
    // router.push("/xac-nhan-email");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Capnhattieudeguimail = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <Capnhattieudeguimail xmlns="http://tempuri.org/">
            <idFile>${fileStore.idFile}</idFile>
            <tieude>CA2.SignPlatform</tieude>
            <subject>${formData.subject}</subject>
          </Capnhattieudeguimail>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const GuiVB = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <GuiVB xmlns="http://tempuri.org/">
            <idFile>${fileStore.idFile}</idFile>
            <taikhoanthuchien>${Email}</taikhoanthuchien>
          </GuiVB>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
</script>
