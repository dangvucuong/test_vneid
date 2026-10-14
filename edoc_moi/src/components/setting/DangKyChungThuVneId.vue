<template>
  <a-spin :spinning="loadingAccount || loadingProviders">
    <div class="p-4 font-nunito text-[#1E1E1E]">
      <div class="font-nunito text-[20px] leading-6 font-medium text-[#343436] mb-2">
        Đăng ký chứng thư số VNeID
      </div>
      <p class="text-[13px] leading-5 font-normal text-[#7C7C7E] mb-6">
        Thông tin họ tên, email, số điện thoại và CCCD lấy từ tài khoản. Sau khi gửi, hãy mở ứng dụng VNeID để xác nhận cấp chứng thư.
      </p>

      <div
        v-if="errorText"
        class="rounded-lg border border-[#F5C2C2] bg-[#FFF5F5] px-4 py-3 text-[13px] font-normal leading-5 text-[#C62828] mb-4"
      >
        {{ errorText }}
      </div>
      <div
        v-if="resultText"
        class="rounded-lg border border-[#B7E4C7] bg-[#F3FBF6] px-4 py-3 text-[13px] font-normal leading-5 text-[#1B7F3A] mb-4"
      >
        {{ resultText }}
      </div>

      <div class="grid grid-cols-2 gap-x-6 gap-y-2">
        <BaseInputForm
          label="Họ và tên"
          type="text"
          placeholder="Nhập họ và tên"
          v-model="form.fullName"
          :is-required="true"
          style="w-full"
        />
        <BaseInputForm
          label="CCCD"
          type="text"
          placeholder="Nhập CCCD"
          v-model="form.citizenPid"
          :is-required="true"
          style="w-full"
        />
        <BaseInputForm
          label="Ngày sinh"
          type="text"
          placeholder="DD/MM/YYYY"
          v-model="form.birthDate"
          :is-required="true"
          style="w-full"
        />
        <div class="h-[60px]">
          <div class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold">
            Giới tính
          </div>
          <a-select v-model:value="form.gender" class="w-full" placeholder="Chọn giới tính">
            <a-select-option value="Nam">Nam</a-select-option>
            <a-select-option value="Nữ">Nữ</a-select-option>
          </a-select>
        </div>
        <BaseInputForm
          label="Số điện thoại"
          type="text"
          placeholder="Nhập số điện thoại"
          v-model="form.phone"
          style="w-full"
        />
        <BaseInputForm
          label="Email"
          type="text"
          placeholder="Nhập email"
          v-model="form.email"
          style="w-full"
        />
        <BaseInputForm
          label="Nơi cấp CCCD"
          type="text"
          placeholder="Nhập nơi cấp"
          v-model="form.issuingAuthority"
          style="w-full"
        />
        <BaseInputForm
          label="Ngày cấp"
          type="text"
          placeholder="DD/MM/YYYY"
          v-model="form.dateOfIssue"
          style="w-full"
        />
        <BaseInputForm
          label="Ngày hết hạn CCCD"
          type="text"
          placeholder="DD/MM/YYYY"
          v-model="form.idCardExpireDate"
          style="w-full"
        />
        <BaseInputForm
          label="Quốc tịch"
          type="text"
          placeholder="VN"
          v-model="form.nationalityCode"
          style="w-full"
        />
        <BaseInputForm
          label="Địa chỉ thường trú"
          type="text"
          placeholder="Số nhà, đường"
          v-model="form.permanentAddress"
          style="w-full"
        />
        <BaseInputForm
          label="Phường/xã thường trú"
          type="text"
          placeholder="Phường, xã"
          v-model="form.permanentVillageText"
          style="w-full"
        />
        <BaseInputForm
          label="Tỉnh/thành thường trú"
          type="text"
          placeholder="Tỉnh, thành phố"
          v-model="form.permanentCityText"
          style="w-full"
        />
        <BaseInputForm
          label="Địa chỉ nơi ở"
          type="text"
          placeholder="Số nhà, đường"
          v-model="form.livingPlaceAddress"
          style="w-full"
        />
        <BaseInputForm
          label="Phường/xã nơi ở"
          type="text"
          placeholder="Phường, xã"
          v-model="form.livingPlaceVillageText"
          style="w-full"
        />
        <BaseInputForm
          label="Tỉnh/thành nơi ở"
          type="text"
          placeholder="Tỉnh, thành phố"
          v-model="form.livingPlaceCityText"
          style="w-full"
        />
        <div class="h-[60px]">
          <div class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold">
            Nhà cung cấp <span class="text-red-500 font-normal">*</span>
          </div>
          <a-select
            v-model:value="form.provider"
            class="w-full"
            placeholder="Chọn nhà cung cấp"
            @change="onProviderChange"
          >
            <a-select-option v-for="item in providers" :key="item.provider" :value="item.provider">
              {{ item.providerName || item.provider }}
            </a-select-option>
          </a-select>
        </div>
        <div class="h-[60px]">
          <div class="font-nunito text-[13px] leading-[20px] mb-1 font-semibold">
            Gói dịch vụ <span class="text-red-500 font-normal">*</span>
          </div>
          <a-select
            v-model:value="form.servicePackCode"
            class="w-full"
            placeholder="Chọn gói"
            :disabled="!form.provider"
          >
            <a-select-option
              v-for="pack in servicePacks"
              :key="pack.servicePackCode"
              :value="pack.servicePackCode"
            >
              {{ pack.servicePackName || pack.servicePackCode }}
            </a-select-option>
          </a-select>
        </div>
      </div>

      <div class="mt-6 flex items-center gap-3">
        <a-button
          type="primary"
          class="h-[36px] bg-[#0055E6] text-white"
          :loading="submitting || polling"
          :disabled="polling"
          @click="dangKy"
        >
          {{ polling ? "Đang chờ xác nhận trên VNeID" : "Đăng ký" }}
        </a-button>
        <span v-if="transactionCode" class="text-[13px] text-[#7C7C7E]">
          Mã giao dịch: {{ transactionCode }}
        </span>
      </div>
    </div>
  </a-spin>
</template>

<script setup lang="ts">
import axios from "axios";
import { message } from "ant-design-vue";
import { Storage } from "@/utils/Storage";
import { getDataFromXml } from "@/utils/common";
import { getAccountInfor } from "@/api/account";

const gateway = String(import.meta.env.VITE_APP_VNEID_GATEWAY_URL || "http://localhost:5244").replace(
  /\/$/,
  ""
);
const originatorCode = String(import.meta.env.VITE_APP_VNEID_ORIGINATOR_CODE || "CA2_SignPlatform");

const loadingAccount = ref(false);
const loadingProviders = ref(false);
const submitting = ref(false);
const polling = ref(false);
const errorText = ref("");
const resultText = ref("");
const transactionCode = ref("");
const providers = ref<any[]>([]);
let stopPoll = false;

const form = reactive({
  fullName: "",
  birthDate: "",
  citizenPid: "",
  issuingAuthority: "",
  dateOfIssue: "",
  gender: undefined as string | undefined,
  phone: "",
  email: "",
  nationalityCode: "VN",
  permanentAddress: "",
  permanentVillageText: "",
  permanentCityText: "",
  livingPlaceAddress: "",
  livingPlaceVillageText: "",
  livingPlaceCityText: "",
  idCardExpireDate: "",
  provider: undefined as string | undefined,
  servicePackCode: undefined as string | undefined,
});

const servicePacks = computed(() => {
  const current = providers.value.find((item) => item.provider === form.provider);
  return current?.servicePackList || [];
});

const onProviderChange = () => {
  form.servicePackCode = undefined;
};

const loadAccount = async () => {
  loadingAccount.value = true;
  try {
    const email = Storage.get("Email") || Storage.get("email");
    const data: any = await getAccountInfor(email);
    const xml = new DOMParser().parseFromString(data, "text/xml");
    form.fullName = String(getDataFromXml(xml, "Hoten") || "");
    form.email = String(getDataFromXml(xml, "Email") || email || "");
    form.phone = String(getDataFromXml(xml, "Sodienthoai") || "");
    form.citizenPid = String(getDataFromXml(xml, "CCCDan") || "");
  } catch (error) {
    errorText.value = "Không tải được thông tin tài khoản.";
  } finally {
    loadingAccount.value = false;
  }
};

const loadProviders = async () => {
  loadingProviders.value = true;
  try {
    const response = await axios.get(`${gateway}/api/vneid/providers`, { timeout: 60000 });
    const body = response.data;
    const status = String(body?.status ?? "");
    if (status !== "01" && status !== "1") {
      errorText.value = body?.description || "Không lấy được danh sách nhà cung cấp.";
      return;
    }
    const list = Array.isArray(body?.data) ? body.data : [];
    providers.value = list.filter((item: any) => Number(item.status) === 1);
  } catch (error: any) {
    errorText.value =
      error?.response?.data?.description || error?.message || "Không kết nối được gateway VNeID.";
  } finally {
    loadingProviders.value = false;
  }
};

const delay = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));

const moTaTrangThai = (data: any) => {
  const code = Number(data?.statusCode);
  if (code === 0) {
    return `Đăng ký thành công. Số serial: ${data?.serialNumber || "—"}.`;
  }
  if (code === 3) {
    return "Chứng thư đã được tạo nhưng chưa kích hoạt trên VNeID.";
  }
  if (code === 1) {
    return data?.resultCode || data?.errorCode || "Đăng ký chứng thư thất bại.";
  }
  return "";
};

const theoDoiTrangThai = async (code: string, requestId: string) => {
  polling.value = true;
  stopPoll = false;
  const started = Date.now();
  try {
    while (!stopPoll && Date.now() - started < 300000) {
      const response = await axios.get(
        `${gateway}/api/vneid/certificates/status/${encodeURIComponent(code)}`,
        {
          timeout: 60000,
          headers: requestId ? { "X-Request-Id": requestId } : undefined,
        }
      );
      const body = response.data;
      const status = String(body?.status ?? "");
      if (status !== "01" && status !== "1") {
        errorText.value = body?.description || "Không tra cứu được trạng thái đăng ký.";
        return;
      }
      const data = body?.data;
      const statusCode = Number(data?.statusCode);
      if (statusCode === 2 || Number.isNaN(statusCode)) {
        await delay(3000);
        continue;
      }
      const text = moTaTrangThai(data);
      if (statusCode === 0 || statusCode === 3) {
        resultText.value = text;
        message.success(statusCode === 0 ? "Đăng ký chứng thư thành công." : text);
      } else {
        errorText.value = text;
        message.error(text);
      }
      return;
    }
    errorText.value = "Hết thời gian chờ xác nhận trên VNeID. Hãy thử tra cứu lại bằng mã giao dịch.";
  } catch (error: any) {
    errorText.value =
      error?.response?.data?.description || error?.message || "Không tra cứu được trạng thái đăng ký.";
  } finally {
    polling.value = false;
  }
};

const dangKy = async () => {
  errorText.value = "";
  resultText.value = "";
  if (!form.fullName.trim() || !form.birthDate.trim() || !form.citizenPid.trim()) {
    errorText.value = "Nhập họ tên, ngày sinh và CCCD.";
    return;
  }
  if (!form.provider || !form.servicePackCode) {
    errorText.value = "Chọn nhà cung cấp và gói dịch vụ.";
    return;
  }
  if (form.birthDate && !/^\d{2}\/\d{2}\/\d{4}$/.test(form.birthDate.trim())) {
    errorText.value = "Ngày sinh phải theo dạng DD/MM/YYYY.";
    return;
  }

  submitting.value = true;
  try {
    const response = await axios.post(
      `${gateway}/api/vneid/certificates/register`,
      {
        userInfo: {
          fullName: form.fullName.trim(),
          birthDate: form.birthDate.trim(),
          citizenPid: form.citizenPid.trim(),
          issuingAuthority: form.issuingAuthority.trim(),
          dateOfIssue: form.dateOfIssue.trim(),
          gender: form.gender || "",
          phone: form.phone.trim(),
          email: form.email.trim(),
          nationalityCode: form.nationalityCode.trim() || "VN",
          permanentAddress: form.permanentAddress.trim(),
          permanentVillageText: form.permanentVillageText.trim(),
          permanentCityText: form.permanentCityText.trim(),
          livingPlaceAddress: form.livingPlaceAddress.trim(),
          livingPlaceVillageText: form.livingPlaceVillageText.trim(),
          livingPlaceCityText: form.livingPlaceCityText.trim(),
          idCardExpireDate: form.idCardExpireDate.trim(),
        },
        provider: form.provider,
        servicePackCode: form.servicePackCode,
        originatorCode,
      },
      { timeout: 120000 }
    );
    const body = response.data;
    const status = String(body?.status ?? "");
    if (status !== "01" && status !== "1") {
      errorText.value = body?.description || "Gateway không nhận yêu cầu đăng ký.";
      return;
    }
    const code = String(body?.data?.transactionCode || "");
    if (!code) {
      errorText.value = "RSVAN không trả mã giao dịch.";
      return;
    }
    transactionCode.value = code;
    const requestId = String(body?.requestId || "");
    message.info("Hãy mở ứng dụng VNeID và xác nhận yêu cầu cấp chứng thư.");
    await theoDoiTrangThai(code, requestId);
  } catch (error: any) {
    errorText.value =
      error?.response?.data?.description ||
      error?.response?.data?.errorDescription ||
      error?.message ||
      "Không kết nối được gateway VNeID.";
  } finally {
    submitting.value = false;
  }
};

onMounted(() => {
  loadAccount();
  loadProviders();
});

onUnmounted(() => {
  stopPoll = true;
});
</script>
