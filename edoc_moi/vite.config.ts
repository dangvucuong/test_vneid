import { UserConfig, ConfigEnv, loadEnv, defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { AntDesignVueResolver } from "unplugin-vue-components/resolvers";
import AutoImport from "unplugin-auto-import/vite";
import Components from "unplugin-vue-components/vite";
import svgLoader from "vite-svg-loader";
import path from "path";

const pathSrc = path.resolve(__dirname, "src");
console.log("Source path:", pathSrc);

export default defineConfig(({ mode }: ConfigEnv): UserConfig => {
  const env = loadEnv(mode, process.cwd());
  
  return {
    build: {
      target: "esnext",
    },
    resolve: {
      alias: {
        "@": pathSrc,
      },
    },
    css: {
      preprocessorOptions: {
        // Define global scss variable
        scss: {
          javascriptEnabled: true,
          additionalData: `
            @use "@/styles/variables.scss" as *;
          `,
        },
      },
    },
    server: {
      host: "0.0.0.0",
      port: Number(env.VITE_APP_PORT) || 4000,
      open: true,
      proxy: {
        // Cấu hình Proxy động dựa trên biến môi trường (.env)
        [env.VITE_APP_BASE_API]: {
          target: env.VITE_APP_BASE_URL_API, // Sẽ tự nhận https://apiuploadedoc.nacencomm.vn từ file .env của bạn
          secure: false,
          ws: true,
          changeOrigin: true, // Đổi từ false thành true để sửa triệt để lỗi CORS Preflight
          rewrite: (path) =>
            path.replace(
              new RegExp("^" + env.VITE_APP_BASE_API),
              env.VITE_APP_BASE_API
            ),
        },
      },
    },
    plugins: [
      vue(),
      svgLoader(),
      AutoImport({
        imports: ["vue", "@vueuse/core"],
        eslintrc: {
          enabled: false,
          filepath: "./.eslintrc-auto-import.json",
          globalsPropValue: true,
        },
        vueTemplate: true,
        dts: path.resolve(pathSrc, "types", "auto-imports.d.ts"),
      }),
      Components({
        resolvers: [
          AntDesignVueResolver({
            importStyle: false, // css in js
          }),
        ],
        dts: path.resolve(pathSrc, "types", "components.d.ts"),
      }),
    ],
    optimizeDeps: {
      esbuildOptions: {
        target: "esnext",
      },
      include: ["vue", "vue-router", "pinia", "axios", "@vueuse/core"],
    },
  };
});