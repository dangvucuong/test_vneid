<template>
  <div class="py-[16px] gap-1 px-3 bg-white h-full">
    <div class="page-header flex items-center justify-between text-[#343436]">
      <h3 class="font-nunito text-[24px] leading-8 flex font-bold">Cài đặt</h3>
    </div>
    <div class="flex w-full text-[#1E1E1E]">
      <a-tabs v-model:activeKey="activeKey" class="w-full">
        <a-tab-pane key="1" tab="Cài đặt tài khoản">
          <CaiDatTaiKhoan />
        </a-tab-pane>
        <a-tab-pane key="2" tab="Phương thức ký">
          <PhuongThucKy />
        </a-tab-pane>
        <a-tab-pane key="3" tab="Đổi mật khẩu">
          <DoiMatKhau />
        </a-tab-pane>
        <a-tab-pane key="4" tab="Đăng ký Passkey">
          <DangKyPassKeyQR />
        </a-tab-pane>
        <a-tab-pane key="5" tab="Thiết lập template ký số">
          <ThietLapTemplateKySo />
        </a-tab-pane>
        <a-tab-pane key="6" tab="Đăng ký chứng thư VNeID">
          <DangKyChungThuVneId />
        </a-tab-pane>
      </a-tabs>
    </div>
  </div>
</template>
<script setup lang="ts">
const user = reactive<any>({});
const activeKey = ref("1");
</script>
<style scoped>
.custom-select .ant-select-selector {
  height: 36px !important;
}
</style>
