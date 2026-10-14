import axios, { AxiosResponse } from "axios";
import { Storage } from "@/utils/Storage";
import { ACCESS_TOKEN_KEY } from "@/enums/cacheEnum";
import { message } from "ant-design-vue";
// 创建 axios 实例
const service = axios.create({
  baseURL: import.meta.env.VITE_APP_BASE_API,
  // baseURL: "http://35.77.26.72:8001/api",
  timeout: 50000,
  headers: { "Content-Type": "application/json;charset=utf-8" },
});

service.interceptors.request.use(
  (config) => {
    const token = Storage.get(ACCESS_TOKEN_KEY);
    if (token && config.headers) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  }
);
// 响应拦截器
service.interceptors.response.use(
  (response: AxiosResponse) => {
    return response.data;
    // const { code, msg } = response.data;
    // if (code === '00000') {
    //   return response.data;
    // }
    // // 响应数据为二进制流处理(Excel导出)
    // if (response.data instanceof ArrayBuffer) {
    //   return response;
    // }

    // return Promise.reject(new Error(msg || 'Error'));
  },
  (error: any) => {
    if (error.response.data) {
      const code = error.response.status;
      const mgs = error.response.data.error;
      const errorLogin = error.response.data.errorLogin;
      if (code === 401 && !errorLogin) {
        Storage.clear();
        window.location.href = "/login";
      } else {
        return Promise.reject(mgs)
      }
    }
  }
);
export default service;
