<script setup lang="ts"></script>

<template>
  <a-config-provider>
    <div class="min-h-screen overflow-hidden"><router-view></router-view></div>
  </a-config-provider>
</template>

<style>
@font-face {
  font-family: "Madinah Authentic";
  src: url("/fonts/Fz-MadinahAuthentic.ttf");
}
@font-face {
  font-family: "MrDakota";
  src: url("/fonts/Fz-MrDakota.ttf");
}
@font-face {
  font-family: "Yustine Signature";
  src: url("/fonts/Fz-Yustine-Signature.ttf");
}
@font-face {
  font-family: "Perfect Signature";
  src: url("/fonts/Perfect-Signature.otf");
}
</style>

<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";
import { Storage } from "@/utils/Storage";
import { checkExpiresLogin } from "@/utils/common";
import { onMounted, onBeforeUnmount } from 'vue'

import { useRoute, useRouter } from "vue-router";

const route = useRoute();
const router = useRouter();

const checkLogin = () => {
  if (checkExpiresLogin(JSON.parse(localStorage.getItem("IDTAIKHOAN")))) {
    Storage.clear();
    setTimeout(() =>
      router.replace((route.query.redirect as string) ?? "/dang-nhap")
    );
  }
};

const { data } = useQuery({
  queryKey: ["checkLogin"],
  queryFn: async () => {
    checkLogin();
    return expire;
  },
  refetchOnWindowFocus: true,
  refetchInterval: 5 * 1000,
});
let intervalId

// const detectDevTools = () => {
//   const threshold = 160
//   const widthExceeds = window.outerWidth - window.innerWidth > threshold
//   const heightExceeds = window.outerHeight - window.innerHeight > threshold
//   return widthExceeds || heightExceeds
// }

// const keydownHandler = (e) => {
//   if (
//     e.key === 'F12' ||
//     (e.ctrlKey && e.shiftKey && ['I', 'J', 'C'].includes(e.key)) ||
//     (e.ctrlKey && e.key === 'U')
//   ) {
//     e.preventDefault()
//     alert('Access denied!')
//   }
// }

// const contextMenuHandler = (e) => {
//   e.preventDefault()
// }

// onMounted(() => {
//   // Chặn chuột phải và phím tắt
//   document.addEventListener('keydown', keydownHandler)
//   document.addEventListener('contextmenu', contextMenuHandler)

//   // Kiểm tra liên tục nếu DevTools mở
//   intervalId = setInterval(() => {
//     if (detectDevTools()) {
//       document.body.innerHTML = '<h1 style="text-align:center; margin-top:40vh;">DevTools detected. Access blocked.</h1>'
//     }
//   }, 1000)
// })

// onBeforeUnmount(() => {
//   document.removeEventListener('keydown', keydownHandler)
//   document.removeEventListener('contextmenu', contextMenuHandler)
//   clearInterval(intervalId)
// })]
onMounted(() => {
  const blockDevtools = () => {
    const devtoolsCheck = () => {
      const start = new Date()
      
      const end = new Date()
      if (end - start > 100) {
        document.body.innerHTML = '<h1 style="color:red;text-align:center;margin-top:40vh">Access Blocked</h1>'
      }
    }
    setInterval(devtoolsCheck, 1000)
  }

  blockDevtools()
})
</script>
