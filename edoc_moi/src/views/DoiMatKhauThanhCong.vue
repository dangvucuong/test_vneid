<template>
  <div
    class="w-screen h-screen flex justify-center relative items-center bg-[#70A0F1]"
  >
    <BackgroundCircle21></BackgroundCircle21>
    <div
      class="w-[540px] h-[236px] p-[36px] bg-white border border-gray-200 rounded-lg shadow dark:bg-gray-800 dark:border-gray-700 z-50"
    >
      <form class="space-y-6" action="#">
        <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
          Tạo mật khẩu mới
        </h3>
        <div
          class="font-nunito text-[13px] leading-[20px] font-semibold text-center px-10"
        >
          Mật khẩu của bạn đã được thay đổi thành công
        </div>

        <div class="flex justify-center">
          <a-button
            class="w-[444px] h-[36px] border rounded-md bg-[#0055E6] text-white"
            @click="login"
            >Đăng nhập</a-button
          >
        </div>
      </form>
    </div>
  </div>
</template>
<script setup lang="ts">
import { isEmpty } from "lodash-es";
import { UnwrapRef } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
interface FormState {
  password: string;
  passwordConfirm: string;
}
const formState: UnwrapRef<FormState> = reactive({
  password: "",
  passwordConfirm: "",
});
const login = () => {
  router.push("/dang-nhap");
};
</script>
