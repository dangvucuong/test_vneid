<template>
  <div
    class="px-[24px] h-full text-[#343436] flex items-center justify-between"
  >
    <div class="font-nunito text-[16px] leading-[20px] flex font-semibold">
      <div>
        <div class="mr-4">Xin chào, {{ email }}</div>
        <div
          v-if="Number(thongtinchukyso.Phuongthucky) === 1"
          class="text-[13px]"
        >
          Phương thức ký : Remote Sign || Mã bút ký :
          {{ thongtinchukyso.IDCTS }}
        </div>
        <div
          v-else-if="Number(thongtinchukyso.Phuongthucky) === 2"
          class="text-[13px]"
        >
          Phương thức ký : USB Token || Serial :
          {{ thongtinchukyso.Serialno }}
        </div>
      </div>

      <div @click="">
        <img
          src="@/assets/img/content-copy.svg?url"
          alt="logo"
          class="w-[16px]"
        />
      </div>
    </div>
    <div class="flex items-center space-x-4">
      <!-- <a href="">
        <img src="@/assets/img/question.png" alt="logo" class="w-[32px]" />
      </a>
      <a href="">
        <img src="@/assets/img/Avatar.png" alt="logo" class="w-[44px]" />
      </a> -->
    </div>
  </div>
</template>
<script setup lang="ts">
import { useSigningTypeStoreHook } from "@/store/modules/signingType";
import Storage from "@/utils/Storage";
import { getDataFromXml } from "@/utils/common";
import axios from "axios";
import { UnwrapRef } from "vue";
import { useQuery } from "@tanstack/vue-query";
import { getDefaultSigningMethod } from "@/api/account";

const email = ref();
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

const Laythietlapphuongthuckysomacdinh = async () => {
  try {
    email.value = Storage.get("Email");

    // Thực hiện request SOAP sử dụng axios
    const response: any = await getDefaultSigningMethod(email.value);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    thongtinchukyso.email = getDataFromXml(xmlDoc, "Email");
    thongtinchukyso.IDCTS = getDataFromXml(xmlDoc, "IDCTS");
    thongtinchukyso.Serialno = getDataFromXml(xmlDoc, "Serialno");
    thongtinchukyso.Phuongthucky = getDataFromXml(xmlDoc, "Phuongthucky");

    return response;
    // Cập nhật giá trị kết quả
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};

const { data } = useQuery({
  queryKey: ["defaultSigningMethod"],
  queryFn: Laythietlapphuongthuckysomacdinh,
});
</script>
