import NProgress from "nprogress"; // progress bar
import { type WhiteNameList, LOGIN_NAME } from "./constant";
import type { Router } from "vue-router";
import { Storage } from "@/utils/Storage";
import { to as _to } from "@/utils/awaitTo";
import { isEmpty } from "lodash-es";

NProgress.configure({ showSpinner: false }); // NProgress Configuration

const defaultRoutePath = "/quan-ly/tai-lieu";

export function createRouterGuards(
  router: Router,
  whiteNameList: WhiteNameList
) {
  router.beforeEach(async (to, from, next) => {
    NProgress.start(); // start progress bar
    const coTaiKhoan = Storage.get("idTaikhoan");
    const accountType = Storage.get("PHANLOAITK");

    if (coTaiKhoan) {
      if (to.path === "/dang-nhap") {
        // 如果已登录，跳转首页
        next({ path: defaultRoutePath });
        NProgress.done();
      } else {
        if (!isEmpty(to.meta)) {
          if (
            (to.meta.requiredPermissions as string[])?.includes(accountType)
          ) {
            return next();
          } else {
            return next({ path: defaultRoutePath });
          }
        }
        next();
      }
    } else {
      // not login
      if (whiteNameList.some((n) => n === to.name)) {
        // In the no-login list, enter directly
        next();
      } else {
        next({
          name: LOGIN_NAME,
          query: { redirect: to.fullPath },
        });
        NProgress.done(); // if current page is login will not trigger afterEach hook, so manually handle it
      }
    }
  });

  router.afterEach((to, from, failure) => {
    NProgress.done();
  });

  router.onError((error) => {
    console.log(error, "Lỗi hệ thống");
  });
}
