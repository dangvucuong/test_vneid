<template>
  <a-spin :spinning="isLoading">
    <div class="">
      <div>
        <div class="flex items-center justify-between text-[#343436] py-4">
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Thông tin chữ ký số
          </div>
        </div>
        <div class="grid grid-cols-2 gap-[24px]">
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Email
            </div>
            <a-input
              v-model:value="thongtinchukyso.email"
              placeholder=""
              :class="'w-full'"
              readonly
            />
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Mã đăng ký
            </div>
            <a-input
              v-model:value="thongtinchukyso.IDCTS"
              placeholder=""
              :class="'w-full'"
              readonly
            />
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Ngày hết hạn CTS
            </div>
            <a-input
              v-model:value="thongtinchukyso.NgayHetHanChungThuSo"
              placeholder=""
              :class="'w-full'"
              readonly
            />
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Serial number
            </div>
            <a-input
              v-model:value="thongtinchukyso.Serialno"
              placeholder=""
              :class="'w-full'"
              readonly
            />
          </div>
          <div class="col-span-2">
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Thông tin chứng thư số
            </div>
            <a-textarea
              v-model:value="thongtinchukyso.cert"
              placeholder=""
              :class="'w-full'"
              readonly
            />
          </div>
        </div>
      </div>
      <a-divider />
      <div>
        <div class="flex items-center justify-between text-[#343436] pb-4">
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Cài đặt phương thức
          </div>
        </div>
        <div class="grid grid-cols-1 gap-3">
          <div>
            <a-radio-group
              v-model:value="formData.signingType"
              name="signingTypeGroup"
            >
              <a-radio value="2">Ký bằng USB Token</a-radio>
              <a-radio value="1">Ký bằng Remote Siging</a-radio>
            </a-radio-group>
          </div>
          <div class="flex gap-3 items-center">
            <template v-if="formData.signingType === '2'">
              <a-input
                class="rounded-lg border h-[36px] font-normal text-[14px] w-[784px] px-3"
                placeholder="Serial number"
                v-model:value="formData.serial"
              />
            </template>
            <template v-else>
              <a-input
                class="rounded-lg border h-[36px] font-normal text-[14px] w-[784px] px-3"
                placeholder="Serial number"
                v-model:value="formData.idcts"
              />
            </template>
            <a-button
              class="text-white bg-[#0055E6] w-[120px] h-[36px] border rounded-md"
              @click="() => ThietlapphuongthuckyMutation()"
              >Cập nhật</a-button
            >
          </div>
        </div>
      </div>
      <a-divider />
      <div>
        <div class="flex items-center justify-between text-[#343436] pb-4">
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Cài đặt hiển thị
          </div>
        </div>
        <div class="flex">
          <div>
            <a-radio-group v-model:value="displayType" name="radioGroup1">
              <a-radio :style="radioStyle" value="1"
                >Hiển thị chữ ký số</a-radio
              >
              <a-radio :style="radioStyle" value="2">Hiển thị ảnh</a-radio>
              <a-radio :style="radioStyle" value="3"
                >Hiển thị ảnh và chữ ký số</a-radio
              >
            </a-radio-group>
          </div>
          <div class="flex items-center w-[491px] pl-[24px]">
            <!-- <img src="@/assets/img/signal.png" alt="logo" class="w-full" /> -->
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import { UnwrapRef, nextTick } from "vue";
import { Storage } from "@/utils/Storage";
import { getDataFromXml } from "@/utils/common";
import axios from "axios";
import * as x509 from "@peculiar/x509";
import dayjs from "dayjs";
import { message } from "ant-design-vue";
import { useRoute, useRouter } from "vue-router";
import { cloneDeep, isEmpty } from "lodash-es";
import { useSigningTypeStoreHook } from "@/store/modules/signingType";
import { useMutation, useQueryClient } from "@tanstack/vue-query";
const router = useRouter();
const typeSigningStore = useSigningTypeStoreHook();
const displayType = ref("1");
const radioStyle = reactive({
  display: "flex",
  height: "30px",
  lineHeight: "30px",
});
const isLoading = ref(false);
const formData = reactive({
  phuongthuc: "",
  idcts: "",
  serial: "",
  signingType: "2",
});
const user = reactive<any>({});
type FormState = {
  email: string;
  IDCTS: string;
  Serialno: string;
  NgayHetHanChungThuSo: string;
  cert: string;
  Phuongthucky: string;
};
const thongtinchukyso: UnwrapRef<FormState> = reactive({
  email: "",
  IDCTS: "",
  Serialno: "",
  NgayHetHanChungThuSo: "",
  cert: "",
  Phuongthucky: "",
});
const email = ref();
const queryClient = useQueryClient();

onMounted(async () => {
  try {
    isLoading.value = true;
    email.value = Storage.get("Email");
    await Laythietlapphuongthuckysomacdinh();
  } catch (error) {
  } finally {
    isLoading.value = false;
  }
});

const Thietlapphuongthucky = async () => {
  isLoading.value = true;
  try {
    if (formData.signingType === "2") {
      if (isEmpty(formData.serial?.trim())) {
        isLoading.value = false;
        return;
      }
      const res = await Laycert_Serial(formData.serial);
      if (res) {
        await Thietlapphuongthuckymobilesign_Serial({
          email: thongtinchukyso.email,
          serialNumber: res.serialNumber,
        });
      }
      console.log(thongtinchukyso);
    } else if (formData.signingType === "1") {
      if (isEmpty(formData.idcts?.trim())) {
        isLoading.value = false;
        return;
      }
      Thietlapphuongthuckymobilesign_IDCTS();
      await Laythietlapphuongthuckysomacdinh();
    }
    await Laythietlapphuongthuckysomacdinh();
    isLoading.value = false;
  } catch (error) {
    console.error("Error calling SOAP service:", error);
    isLoading.value = false;
  }
};

const { mutate: ThietlapphuongthuckyMutation } = useMutation({
  mutationFn: () => Thietlapphuongthucky(),
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ["defaultSigningMethod"] });
  },
});

const Laythietlapphuongthuckysomacdinh = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Laythietlapphuongthuckysomacdinh xmlns="http://tempuri.org/">
          <Email>${email.value}</Email>
        </Laythietlapphuongthuckysomacdinh>
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
    thongtinchukyso.email = getDataFromXml(xmlDoc, "Email");
    thongtinchukyso.Serialno = getDataFromXml(xmlDoc, "Serialno");
    thongtinchukyso.Phuongthucky = getDataFromXml(xmlDoc, "Phuongthucky");
    thongtinchukyso.IDCTS = getDataFromXml(xmlDoc, "IDCTS");

    await Laycert_Serial(thongtinchukyso.Serialno);
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
watch(
  () => thongtinchukyso.Phuongthucky,
  (Phuongthucky) => {
    if (Phuongthucky === "2") {
      formData.signingType = "2";
    } else {
      formData.signingType = "1";
      formData.idcts = cloneDeep(thongtinchukyso.IDCTS);
    }
  }
);
const Laycert_Serial = async (Serialno: any) => {
  try {
    // URL của API server SOAP
    const apiUrl =
      "https://apisign.nacencomm.vn/api/APISigncore/Laycert_Serial?serial=" +
      Serialno;
    // Thực hiện request SOAP sử dụng axios
    const response: any = await axios.post(apiUrl, {
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!isEmpty(response.data)) {
      // let response =
      //   "MIIFijCCBHKgAwIBAgIQVAK8XKzOZpwgIwAAAAAF6jANBgkqhkiG9w0BAQsFADA2MQswCQYDVQQGEwJWTjEWMBQGA1UECgwNTkFDRU5DT01NIFNDVDEPMA0GA1UEAwwGQ0EyIFJTMB4XDTIzMDkzMDA5MDgzOFoXDTI0MTAwNTA5MDgzOFowggEoMQswCQYDVQQGEwJWTjEfMB0GA1UECAwWVGjDoG5oIHBo4buRIEjDoCBO4buZaTEyMDAGA1UEBwwpU+G7kSAyNSBMw6ogVsSDbiBUaGnDqm0gLSBUaGFuaCBYdcOibiAtSE4xIjAgBgoJkiaJk/IsZAEBDBJNU1Q6MDEwMzkzMDI3OS05OTkxPzA9BgNVBAoMNkPDtG5nIHR5IGPhu5UgcGjhuqduIGPDtG5nIG5naOG7hyB0aOG6uyBOYWNlbmNvbW0gVGVzdDEeMBwGCSqGSIb3DQEJARYPaGFuZ2R0dEBjYXZuLnZuMT8wPQYDVQQDDDZDw7RuZyB0eSBj4buVIHBo4bqnbiBjw7RuZyBuZ2jhu4cgdGjhursgTmFjZW5jb21tIFRlc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDgLFZ46l5I6WMfqFI2zHL1+W19pGu7Hr/dohV7z47OZYJzDcaUJ+8wnMX2TNe/MIpg8udIiKJ888XBUxfmZknWlP4GFqlsvhPyWsWBnEw3NCClz2VB9R3TYJj8qh9QY4F6Xxdilgpgza9QZ91+Dz2OkQdtxH38xpX9huCsida2bCaUNAZRBcTS8bqPbcWaqozi5rkYAWWQ6tr7n5yJdYELiHwwxj56du9i0C3ddY7S+YXoN3HvAymORgzIEYzs9vtufFHvov3Yt584m7xdqXkd5UOH2DG95FVY5mkDAjERtzzsAmHX2XNaHO0a8Jp5h5sU7OlQculeFJhtSVviKDpzAgMBAAGjggGeMIIBmjAiBgNVHSUBAf8EGDAWBggrBgEFBQcDBAYKKwYBBAGCNwoDDDAdBgNVHQ4EFgQUH+ncq7mHcC56MdYA3Fz8R6sBUmgwDgYDVR0PAQH/BAQDAgXgMB8GA1UdIwQYMBaAFJNOP2ZqbMcl+srb2aniRDudU3dZMDQGA1UdHwQtMCswKaAnoCWGI2h0dHA6Ly9jYTJjcmwuY2F2bi52bi9uZXdycy9jYTIuY3JsMDsGCCsGAQUFBwEBBC8wLTArBggrBgEFBQcwAYYfaHR0cDovL29jc3Bycy5jYXZuLnZuL29jc3Avb2NzcDA9BgkrBgEEAYI3FQcEMDAuBiYrBgEEAYI3FQiBtKEjhZyKJoPpjzCE9LAsq6hagXyGyek4h4arVQIBZAIBBDAsBgkrBgEEAYI3FQoBAf8EHDAaMAoGCCsGAQUFBwMEMAwGCisGAQQBgjcKAwwwRAYJKoZIhvcNAQkPBDcwNTAOBggqhkiG9w0DAgICAIAwDgYIKoZIhvcNAwQCAgCAMAcGBSsOAwIHMAoGCCqGSIb3DQMHMA0GCSqGSIb3DQEBCwUAA4IBAQC6S3F4+LZU2d1bPm8GdzzYS2msf3JhXXQrC+qIZ3MggAI4XInkgumX7Hl3PmPXBtfI0mi+AsGoOShTJ1QgHNdyi6FNY57x/UXRKe9VyWfWdEpH7XKMlkYZgFbbcfIcMFWHQXeA7+2ALM680pFWpZMQHDt+K00iljhgPm4ODrFW6KU22xtb9dAYQrVQje1JgnLMunkVeuCNxovdGNP5x6Y/nF32LJ8wnkRNtQRIZIlCKHWacJHlHa2XoFIavGSqjW8M1q5CwEerY1SwWe4yNi8s5ulkcmNJoqpPh2ZWWO/ckCpEYHd09tyx6Lt6Euzk+/NglKdhzYB6GWfifL4Lfft+";
      // Bước 1: Chuyển đổi chuỗi base64 thành mảng byte
      const cert = new x509.X509Certificate(response.data);
      thongtinchukyso.cert = cert.subject;
      thongtinchukyso.NgayHetHanChungThuSo = dayjs(cert.notAfter).format(
        "DD-MM-YYYY HH:mm:ss"
      );

      return cert;

      // Bước 2: Chuyển đổi mảng byte thành chuỗi UTF-8

      // Giờ bạn có thể sử dụng giá trị giải mã (decodedString) theo ý muốn

      // Cập nhật giá trị kết quả
    } else {
      message.error("Không có thông tin chứng thư số");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Thietlapphuongthuckymobilesign_IDCTS = async () => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlapphuongthuckymobilesign_IDCTS xmlns="http://tempuri.org/">
          <taikhoan>${thongtinchukyso.email}</taikhoan>
          <idcts>${formData.idcts?.trim() || undefined}</idcts>
          <macdinh>1</macdinh>
        </Thietlapphuongthuckymobilesign_IDCTS>
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
      "Thietlapphuongthuckymobilesign_IDCTSResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      message.success("Thành công");
    } else if (Number(resultValue) === 0) {
      message.error("Thiết lập không thành công");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -3) {
      message.error("Mã đăng ký không tồn tại hoặc không hợp lệ ");
    } else if (Number(resultValue) === -4) {
      message.error("Tài khoản không hợp lệ");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Thietlapphuongthuckymobilesign_Serial = async ({
  email,
  serialNumber,
}: {
  email: string;
  serialNumber: string;
}) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlapphuongthuckytoken xmlns="http://tempuri.org/">
          <taikhoan>${email}</taikhoan>
          <serial>${serialNumber}</serial>
          <macdinh>1</macdinh>
        </Thietlapphuongthuckytoken>
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
      "ThietlapphuongthuckytokenResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      message.success("Thành công");
    } else if (Number(resultValue) === 0) {
      message.error("Thiết lập không thành công");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -3) {
      message.error("Serial number không tồn tại");
    } else if (Number(resultValue) === -4) {
      message.error("Tài khoản không hợp lệ");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
</script>
