export const LOGIN_NAME = "DangNhap";

export const REDIRECT_NAME = "Redirect";

export const PARENT_LAYOUT_NAME = "ParentLayout";

export const PAGE_NOT_FOUND_NAME = "PageNotFound";

// 路由白名单
export const whiteNameList = [
  "DangNhap",
  "QuenMatKhau",
  "DangKy",
  "ThietLapMatKhau",
  "XacNhanEmail",
  "GuiMaEmail",
  "DangKyMatKhau",
  "DangKyMatKhauThanhCong",
  "DoiMatKhauThanhCong",
  "error",
  "error-404",
  "DangKyPasskey",
  "XoaPasskey",
  "DeletePasskeyGuide",
] as const; // no redirect whitelist

export type WhiteNameList = typeof whiteNameList;

export type WhiteName = (typeof whiteNameList)[number];
