<template>
  <div class="flex h-screen">
    <!-- Sider -->
    <div class="w-[256px] h-full bg-[#0A0A0B] gap-6 flex flex-col pt-6">
      <div class="logo px-4">
        <img src="@/assets/img/logo.svg?url" alt="logo" class="" />
      </div>
      <Menu class=""></Menu>
    </div>

    <!-- Phần còn lại (Header và Content) -->
    <div class="flex-1 flex flex-col bg-[#EFF0F2] h-full overflow-auto">
      <!-- Header -->
      <div class="h-[52px] bg-white text-black">
        <Header></Header>
      </div>

      <!-- Content -->
      <div class="flex-1 bg-[#EFF0F2] rounded-xl p-2">
        <router-view></router-view>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import type { CSSProperties } from "vue";
const headerStyle: CSSProperties = {
  textAlign: "center",
  color: "#fff",
  height: 68,
  backgroundColor: "#fff",
};
const menuStyle: CSSProperties = {
  width: 256,
};
const contentStyle: CSSProperties = {
  backgroundColor: "#fff",
};
</script>
