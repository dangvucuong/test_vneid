import { createApp } from "vue";
import Antd, { message } from "ant-design-vue";
import "./style.css";
import { setupRouter } from "./router";
import App from "@/App.vue";
import VueKonva from "vue-konva";
import { setupStore } from "@/store";
import vue3GoogleLogin from "vue3-google-login";
import { CLIENT_ID } from "./utils/constants";
import { VueQueryPlugin } from "@tanstack/vue-query";

/** Polyfill cho trình duyệt cũ / một số máy test (pdfjs 4.x cần Promise.withResolvers) */
if (typeof (Promise as any).withResolvers !== "function") {
  (Promise as any).withResolvers = function <T>() {
    let resolve!: (value: T | PromiseLike<T>) => void;
    let reject!: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
      resolve = res;
      reject = rej;
    });
    return { promise, resolve, reject };
  };
}

/** Tăng thời gian hiển thị toast để người dùng kịp đọc */
message.config({
  duration: 6,
  maxCount: 3,
});

const app = createApp(App);
setupStore(app);
app.use(Antd);
app.use(VueKonva);
app.use(vue3GoogleLogin, {
  clientId: CLIENT_ID,
});
app.use(VueQueryPlugin);

setupRouter(app).then(() => {
  app.mount("#app");
});
