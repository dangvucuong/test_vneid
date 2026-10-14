import { type RouteRecordRaw } from "vue-router";
import { defineStore } from "pinia";
import { store } from "@/store";
import { ACCESS_TOKEN_KEY } from "@/enums/cacheEnum";
import { Storage } from "@/utils/Storage";
import { resetRouter } from "@/router";
import { EXPRIRES_LOGIN } from "@/utils/constants";

type UserInfoType = {
  PhanloaiTK: string;
  email: string;
  idTaikhoan: string;
  Hoten: string;
};

export const useUserStore = defineStore("user", () => {
  // state
  const userId = ref();
  const fcId = ref();
  const typeAdmin = ref();

  const token = useStorage(ACCESS_TOKEN_KEY, "");

  const userInfo = ref<UserInfoType>({
    PhanloaiTK: "",
    email: "",
    idTaikhoan: "",
    Hoten: "",
  });
  /**
   * 登录调用
   *
   * @param {}
   * @returns
   */
  function login(data: any) {
    setToken(data);
    setUserInfo(data);
  }

  const setToken = (data: any) => {
    const ex = EXPRIRES_LOGIN;
    Storage.set("idTaikhoan", data.idTaikhoan, ex);
    Storage.set("Email", data.email, ex);
    Storage.set("HoTen", data.Hoten, ex);
    Storage.set("Expries", data.Hoten, ex);
    Storage.set("PhanloaiTK", data.PhanloaiTK, ex);
  };

  const setUserInfo = (data: any) => {
    userInfo.value = data;
  };

  async function logout() {
    // await logout();
    resetToken();
    resetRouter();
  }

  function resetToken() {
    token.value = "";
    userInfo.value = {
      PhanloaiTK: "",
      email: "",
      idTaikhoan: "",
      Hoten: "",
    };
    Storage.clear();
  }

  return {
    setToken,
    userInfo,
    fcId,
    typeAdmin,
    login,
    logout,
    resetToken,
    userId,
  };
});

// Use outside the component setup function
export function useUserStoreHook() {
  return useUserStore(store);
}
