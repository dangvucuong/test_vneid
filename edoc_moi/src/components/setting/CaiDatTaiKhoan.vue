<template>
  <a-spin :spinning="isPending">
    <div class="p-4">
      <div class="flex items-center justify-between">
        <!-- Avatar, Tên, Mã Nhân Viên -->
        <div class="flex items-center">
          <!-- Avatar -->
          <div class="mr-4">
            <a-avatar :size="80">
              <template #icon>
                <UserOutlined />
              </template>
            </a-avatar>
          </div>
          <!-- Tên và Mã nhân viên -->
          <div>
            <div class="font-nunito text-[24px] leading-8 font-bold">
              {{ formState.Hoten }}
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold"></div>
          </div>
        </div>

        <!-- Thông tin "Đã xác minh" -->
        <div class="flex gap-1 items-center pr-5">
          <CheckIcon></CheckIcon>
          <div class="text-[#0055E6] text-[13px] font-nunito">Đã xác minh</div>
        </div>
      </div>
      <div>
        <div class="flex items-center justify-between text-[#343436] py-6">
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Thông tin cơ bản
          </div>
          <a-button
            class="w-[197px] h-[36px] border rounded-md bg-white"
            @click="changeInformation"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>
                <ModeIcon />
              </span>
              <span>Thay đổi thông tin</span>
            </div>
          </a-button>
        </div>
        <div
          class="grid grid-cols-2 gap-[24px]"
          v-if="!showChangeInformationForm"
        >
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Họ và tên
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.Hoten }}
            </div>
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              CCCD
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.CCCDan || "—" }}
            </div>
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Mã số thuế
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.Masothue }}
            </div>
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Công ty
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.Tentochuc }}
            </div>
          </div>
        </div>
        <div
          class="grid grid-cols-2 gap-[24px]"
          v-if="showChangeInformationForm"
        >
          <BaseInputForm
            :label="'Họ và tên'"
            :type="'text'"
            :placeholder="'Nhập họ và tên'"
            v-model="user.Hoten"
            class="m-4"
            :style="'w-full'"
          ></BaseInputForm>
          <BaseInputForm
            :label="'CCCD'"
            :type="'text'"
            :placeholder="'Nhập CCCD'"
            v-model="user.CCCDan"
            class="m-4"
            :style="'w-full'"
          ></BaseInputForm>
          <!-- <BaseInputForm :label="'Mã nhân viên'" :type="'text'" :placeholder="'Nhập mã nhân viên'"
            v-model="user.idTaikhoan" class="m-4" :style="'w-full'"></BaseInputForm> -->
          <BaseInputForm
            :label="'Mã số thuế'"
            :type="'text'"
            :placeholder="'Nhập mã số thuế'"
            v-model="user.Masothue"
            class="m-4"
            :style="'w-full'"
          ></BaseInputForm>
          <BaseInputForm
            :label="'Công ty'"
            :type="'text'"
            :placeholder="'Nhập công ty'"
            v-model="user.Tentochuc"
            class="m-4"
            :style="'w-full'"
          ></BaseInputForm>
          <!-- <div class="col-span-2 flex justify-end gap-4 bg-white pt-8">
            <a-button
              key="back"
              @click="showChangeInformationForm = !showChangeInformationForm"
              class="w-[140px] h-[36px] text-[#1E1E1E]"
              >Hủy</a-button
            >
            <a-button
              key="submit"
              type="primary"
              @click=""
              class="w-[140px] h-[36px] bg-[#0055E6] text-white"
              >Lưu</a-button
            >
          </div> -->
        </div>
      </div>
      <a-divider />
      <div>
        <div class="flex items-center justify-between text-[#343436] py-6">
          <div class="font-nunito text-[20px] leading-6 font-medium">
            Thông tin tài khoản
          </div>
          <!-- <a-button
            class="w-[197px] h-[36px] border rounded-md bg-white"
            @click="changePhone"
          >
            <div class="flex items-center justify-center space-x-2">
              <span>
                <ModeIcon />
              </span>
              <span>Thay đổi thông tin</span>
            </div>
          </a-button> -->
        </div>
        <div
          class="grid grid-cols-2 gap-[24px]"
          v-if="!showChangeInformationForm"
        >
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Tên tài khoản
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.Email }}
            </div>
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Email
            </div>
            <div
              class="font-nunito text-[18px] leading-6 font-semibold flex items-center"
            >
              {{ user.Email }}&nbsp;
              <CheckCircleOutlineIcon />
            </div>
          </div>
          <div>
            <div class="font-nunito text-[16px] leading-6 text-[#7C7C7E]">
              Số điện thoại
            </div>
            <div class="font-nunito text-[18px] leading-6 font-semibold">
              {{ user.Sodienthoai }}
            </div>
          </div>
        </div>
        <div
          class="grid grid-cols-2 gap-[24px]"
          v-if="showChangeInformationForm"
        >
          <BaseInputForm
            :label="'Tên tài khoản'"
            :type="'text'"
            :placeholder="''"
            v-model="user.Email"
            class="m-4"
            :style="'w-full bg-[#D4D4D6]'"
            :readonly="'readonly'"
          ></BaseInputForm>
          <BaseInputForm
            :label="'Email'"
            :type="'text'"
            :placeholder="''"
            v-model="user.Email"
            class="m-4"
            :style="'w-full bg-[#D4D4D6]'"
            :readonly="'readonly'"
            :has-icon="'true'"
            :iconUrl="CheckCircleOutlineIconUrl"
          >
          </BaseInputForm>
          <BaseInputForm
            :label="'Số điện thoại'"
            :type="'text'"
            :placeholder="'Nhập số điện thoại'"
            v-model="user.Sodienthoai"
            class="m-4"
            :style="'w-full'"
          ></BaseInputForm>
          <div class="col-span-2 flex justify-end gap-4 bg-white pt-8">
            <a-button
              key="back"
              @click="handleCancelUpdate"
              class="w-[140px] h-[36px] text-[#1E1E1E]"
              >Hủy</a-button
            >
            <a-button
              key="submit"
              type="primary"
              @click="() => handleSubmitMutaion()"
              class="w-[140px] h-[36px] bg-[#0055E6] text-white"
              >Lưu</a-button
            >
          </div>
        </div>
      </div>
    </div>
  </a-spin>
</template>
<script setup lang="ts">
import ModeIcon from "@/assets/img/mode.svg?component";
import CheckIcon from "@/assets/img/check.svg?component";
import CheckCircleOutlineIcon from "@/assets/img/check_circle_outline.svg?component";
import CheckCircleOutlineIconUrl from "@/assets/img/check_circle_outline.svg?url";
import { Storage } from "@/utils/Storage";

import { UserOutlined } from "@ant-design/icons-vue";
import { getDataFromXml } from "@/utils/common";
import { UnwrapRef } from "vue";
import { message } from "ant-design-vue";
import { useMutation, useQuery, useQueryClient } from "@tanstack/vue-query";
import { getAccountInfor, updateAccountInfor } from "@/api/account";

const queryClient = useQueryClient();

const user = reactive<any>({
  IdTaikhoan: "",
  Email: "",
  Masothue: "",
  Tentochuc: "",
  Hoten: "",
  Sodienthoai: "",
  CCCDan: "",
});
interface FormState {
  IdTaikhoan: string;
  Email: string;
  Masothue: string;
  Tentochuc: string;
  Hoten: string;
  Sodienthoai: string;
  CCCDan: string;
  [key: string]: string;
}
const formState: UnwrapRef<FormState> = reactive({
  IdTaikhoan: "",
  Email: "",
  Masothue: "",
  Tentochuc: "",
  Hoten: "",
  Sodienthoai: "",
  CCCDan: "",
});

const email = ref();

const Laythongtintaikhoan = async () => {
  try {
    email.value = Storage.get("Email");
    const data: any = await getAccountInfor(email.value);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(data, "text/xml");

    for (const u in user) {
      user[u] = getDataFromXml(xmlDoc, u);
      formState[u] = getDataFromXml(xmlDoc, u);
    }

    return xmlDoc;

    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};

const { data, isPending } = useQuery({
  queryKey: ["accountInfomation"],
  queryFn: Laythongtintaikhoan,
});

const showChangeInformationForm = ref(false);

const changeInformation = () => {
  showChangeInformationForm.value = true;
};

const handleSubmit = async () => {
  try {
    // Thực hiện request SOAP sử dụng axios
    email.value = Storage.get("Email");
    user.CCCDan = String(user.CCCDan ?? "").trim();
    const response: any = await updateAccountInfor(email.value, user);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");

    const resultNode = xmlDoc.getElementsByTagName(
      "CapnhatthongtintaikhoanResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      message.success("Cập nhật thành công");
      showChangeInformationForm.value = false;
    } else if (Number(resultValue) === 0) {
      message.error("Tài khoản không tồn tại");
    } else if (Number(resultValue) === -100) {
      message.error("Email không đúng định dạng");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -3) {
      message.error("Tài khoản đã bị khóa");
    } else if (Number(resultValue) === -4) {
      message.error("CCCD đã gắn với tài khoản khác");
    } else if (Number(resultValue) === -5) {
      message.error("CCCD phải gồm 12 chữ số");
    } else {
      message.error("Lỗi không xác định");
    }

    // Cập nhật giá trị kết quả
  } catch (error) {
    message.error("Lỗi không xác định");
  }
};

const { mutate: handleSubmitMutaion } = useMutation({
  mutationFn: handleSubmit,
  onSuccess: () => {
    // Invalidate and refetch
    queryClient.invalidateQueries({ queryKey: ["accountInfomation"] });
  },
});

const handleCancelUpdate = () => {
  showChangeInformationForm.value = false;
  for (const u in user) {
    user[u] = formState[u];
  }
};
</script>
