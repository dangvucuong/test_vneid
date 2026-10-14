<template>
  <div
    class="w-screen h-screen flex justify-center relative items-center bg-[#70A0F1]"
  >
    <BackgroundCircle21></BackgroundCircle21>
    <div
      class="w-[540px] h-[324px] p-[48px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-50"
    >
      <form class="space-y-6" action="#">
        <div class="logo">
          <img
            src="@/assets/img/logo.png"
            alt="logo"
            class="mx-auto w-[145px]"
          />
        </div>
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Gửi yêu cầu đăng ký thành công
        </h3>
        <div class="font-nunito text-[13px] leading-[20px] font-semibold">
          Xác nhận yêu cầu đăng ký đã được gửi về Email
          <span class="text-[#4C88ED]">{{ route.params.email }}</span>
          Kiểm tra hòm thư và ấn vào Kích hoạt để hoàn tất quá trình đăng ký.
        </div>
        <div class="flex justify-center">
          <a-button
            @click="router.push('/dang-nhap')"
            class="w-[444px] h-[36px] border rounded-md bg-[#0055E6] text-white"
            >Đã hiểu</a-button
          >
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter, useRoute } from "vue-router";
const router = useRouter();
const route = useRoute();
</script>
