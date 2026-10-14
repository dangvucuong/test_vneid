import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import type { App } from "vue";
import { createRouterGuards } from "./router-guards";
import { LOGIN_NAME, whiteNameList } from "./constant";
const routes: Array<RouteRecordRaw> = [
  { path: "/", redirect: "/dang-nhap" },
  {
    path: "/dang-nhap",
    name: "DangNhap",
    component: () => import("@/views/DangNhap.vue"),
  },
  {
    path: "/quen-mat-khau",
    name: "QuenMatKhau",
    component: () => import("@/views/QuenMatKhau.vue"),
  },
  {
    path: "/dang-ky",
    name: "DangKy",
    component: () => import("@/views/DangKy.vue"),
  },
  {    
    path: "/dang-ky-passkey",
    name: "DangKyPasskey", 
    component: () => import("@/views/DangKyPasskey.vue"),
  },
  {    
    path: "/xoa-passkey",
    name: "XoaPasskey", 
    component: () => import("@/views/XoaPasskey.vue"),
  },
  {
    path: "/thiet-lap-mat-khau",
    name: "ThietLapMatKhau",
    component: () => import("@/views/ThietlapMatKhau.vue"),
  },
  {
    path: "/xac-nhan-email/:email",
    name: "XacNhanEmail",
    component: () => import("@/views/XacNhanEmail.vue"),
  },
  {
    path: "/ma-code-email/:email",
    name: "GuiMaEmail",
    component: () => import("@/views/GuiMaEmail.vue"),
  },
  {
    path: "/dang-ky-mat-khau/:email",
    name: "DangKyMatKhau",
    component: () => import("@/views/DangKyMatKhau.vue"),
  },
  {
    path: "/dang-ky-mat-khau-thanh-cong",
    name: "DangKyMatKhauThanhCong",
    component: () => import("@/views/DangKyMatKhauThanhCong.vue"),
  },
  {
    path: "/doi-mat-khau-thanh-cong",
    name: "DoiMatKhauThanhCong",
    component: () => import("@/views/DoiMatKhauThanhCong.vue"),
  },
  {
    path: "/huong-dan-xoa-passkey",
    name: "DeletePasskeyGuide",
    component: () => import("@/views/DeletePasskeyGuide.vue"),
  },
  {
    path: "/quan-ly",
    name: "QuanLy",
    redirect: { path: "/quan-ly/tai-lieu" },
    component: () => import("@/views/QuanLy/Layout.vue"),
    children: [
      {
        name: "TaiLieu",
        path: "tai-lieu",
        component: () => import("@/views/QuanLy/TaiLieu/TaiLieu.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["0", "1"],
        },
      },
      {
        name: "TaiLieuChiTiet",
        path: "tai-lieu-chi-tiet",
        component: () => import("@/views/QuanLy/TaiLieuChiTiet.vue"),
      },
      {
        name: "DanhMuc",
        path: "danh-muc",
        component: () => import("@/views/QuanLy/DanhMuc.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["1"],
        },
      },
      {
        name: "TaoMoiTaiLieu",
        path: "tao-moi-tai-lieu",
        component: () => import("@/views/QuanLy/TaoMoiTaiLieu.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["1"],
        },
      },
      {
        name: "TaoMoiTaiLieu2026",
        path: "tao-moi-tai-lieu-2026",
        component: () => import("@/views/QuanLy/TaoMoiTaiLieu2026.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["1"],
        },
      },
      {
        name: "DayLoTaiLieu2026",
        path: "day-lo-tai-lieu-2026",
        component: () => import("@/views/QuanLy/DayLoTaiLieu2026.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["1"],
        },
      },
      // {
      //   name: "TaoMauTaiLieu",
      //   path: "tao-mau-tai-lieu",
      //   component: () => import("@/views/QuanLy/TaoMoiTaiLieu.vue"),
      // },
      {
        name: "DanhBa",
        path: "danh-ba",
        component: () => import("@/views/QuanLy/DanhBa.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["1"],
        },
      },
      {
        name: "CaiDat",
        path: "cai-dat",
        component: () => import("@/views/QuanLy/CaiDat.vue"),
        meta: {
          requiresAuth: true,
          requiredPermissions: ["0", "1"],
        },
      },
      {
        name: "Dangxuat",
        path: "dang-xuat",
        component: () => import("@/views/DangXuat.vue"),
      },
    ],
  },
];
const router = createRouter({
  history: createWebHistory(),
  routes,
});
export function resetRouter() {
  router.replace({ path: "/dang-nhap" });
}
export async function setupRouter(app: App) {
  createRouterGuards(router, whiteNameList);
  app.use(router);
  await router.isReady();
}
export default router;
