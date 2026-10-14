<template>
  <div class="w-screen h-screen flex justify-center relative bg-[#70A0F1]">
    <BackgroundCircle21></BackgroundCircle21>
    <div class="z-50 grid grid-cols-12 gap-6 w-full">
      <!--START Nội dung và logo google  apple -->
      <div class="lg:col-span-6 col-span-12 hidden lg:block relative">
        <div class="fram-16114 flex h-screen justify-center text-white">
          <div class="w-[505px] grid grid-cols-1 gap-4 content-center z-40">
            <div class="text-[36px] leading-[48px] font-nunito z-40">
              Trải nghiệm ký số trên di động với Ca2 Remote Signing
            </div>
            <div class="text-[14px] leading-[22px] font-inter mb-[24px]">
              Ký ngay trên thiết bị di động, không cần USB Token.Giúp bạn làm
              việc từ xa tại một nơi duy nhất
            </div>
            <div class="logo gap-[12px] flex row">
              <a
                href="https://apps.apple.com/vn/app/ca2-remote-signing/id6445924092?l=vi"
              >
                <img
                  src="@/assets/img/apple_store.svg?url"
                  alt="logo"
                  width="211px"
                  class="block dark:hidden"
                />
              </a>
              <a
                href="https://play.google.com/store/apps/details?id=com.rs.ca2&pli=1"
              >
                <img
                  src="@/assets/img/google_play.svg?url"
                  alt="logo"
                  width="211px"
                  class="mx-auto block dark:hidden"
                />
              </a>
            </div>
          </div>
        </div>
      </div>
      <!-- END -->
      <div class="lg:col-span-6 col-span-12 relative bg-white">
        <div class="flex h-screen justify-center text-black">
          <div class="w-[386px] grid grid-cols-1 gap-4 content-center z-40 m-4">
            <div class="logo">
              <img
                src="@/assets/img/logo.png?url"
                alt="logo"
                class="mx-auto w-[145px]"
              />
            </div>
            <a-spin :spinning="loading">
            <div class="form w-[386px]">
              <h3
                class="font-nunito text-[24px] leading-8 font-bold text-center"
              >
                Đăng nhập
              </h3>
              <a-form
                ref="formRef"
                :layout="'vertical'"
                :model="formState"
                :class="'m-4'"
                :rules="rules"
                autocomplete="off"
              >
                <a-form-item label="Tài khoản (Email)" name="email">
                  <a-input
                    v-model:value="formState.email"
                    placeholder="nguyenvanan@acb.vn"
                    :class="'w-full'"
                    @keydown.enter="login"
                  />
                </a-form-item>
                <a-form-item label="Mật khẩu" name="password">
                  <a-input-password
                    v-model:value="formState.password"
                    placeholder="•••••••"
                    autocomplete="on"
                    @keydown.enter="login"
                  />
                </a-form-item>
              </a-form>
              <div class="m-4">
                <div class="flex gap-2">
                  <a-button
                    html-type="submit"
                    class="text-white bg-[#0055E6] w-full h-[36px] border rounded-md flex-[6]"
                    @click="login"
                  >
                    Đăng nhập
                  </a-button>

                  <a-button
                    class="text-[#0055E6] bg-white w-full h-[36px] border border-[#0055E6] rounded-md flex-[4] flex items-center justify-between gap-1"
                    @click="handRsLogin"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      version="1.1"
                      xmlns:xlink="http://www.w3.org/1999/xlink"
                      width="20"
                      height="20"
                      x="0"
                      y="0"
                      viewBox="0 0 24 24"
                      style="enable-background: new 0 0 20 20"
                      xml:space="preserve"
                      class=""
                    >
                      <g>
                        <path
                          d="M6.009 6.5a4 4 0 1 1 4 4 4 4 0 0 1-4-4zm10.048 7.68a.4.4 0 0 0-.127-.24A5.356 5.356 0 0 0 12 12.5H8c-4.06 0-5.5 2.97-5.5 5.52 0 2.28 1.21 3.48 3.5 3.48h5.2a.272.272 0 0 0 .21-.09.324.324 0 0 0 .09-.215V19.5a1.5 1.5 0 0 1 .44-1.06l4.03-4.05a.309.309 0 0 0 .087-.21zM13 19.5V22h2.5l4.539-4.519-2.519-2.519zm8.708-5.089-1.12-1.12a1 1 0 0 0-1.41 0l-.959.97 2.519 2.519.97-.959a1 1 0 0 0 0-1.409z"
                          fill="#0055e6"
                          opacity="1"
                          data-original="#000000"
                          class=""
                        ></path>
                      </g>
                    </svg>

                    Digital Signature
                  </a-button>
                </div>
                <a-button
                  class="mt-2 text-[#0055E6] bg-white w-full h-[36px] border border-[#0055E6] rounded-md flex items-center justify-center gap-2"
                  @click="loginByPasskey"
                >
                  <div class="flex items-center justify-center space-x-2">
                    <span class="flex-shrink-0">
                      <PasskeyIcon />
                    </span>
                    <span>Đăng nhập bằng passkey</span>
                  </div>
                </a-button>

                <a-button
                  class="text-[#1966E8] bg-white w-full h-[28px] mt-[8px] border-none border-white shadow-none"
                  @click="forgotPassword"
                  >Quên mật khẩu?</a-button
                >
                <a-divider class="font-nunito text-[14px] leading-5 my-[16px]"
                  >Hoặc</a-divider
                >
                <a-button
                  class="text-black text-[13px] leading-5 bg-white w-full h-[36px] mt-[8px] items-center flex justify-center flex-wrap"
                  @click="handleGoogleLogin"
                >
                  <img
                    src="@/assets/img/google_logo.svg?url"
                    alt="logo"
                    class="w-[16px] mr-1"
                  />
                  <span class="flex-1 inline text-sm"
                    >Đăng nhập bằng google</span
                  >
                </a-button>
                <a-button
                  class="text-black text-[13px] leading-5 bg-white w-full h-[36px] mt-[8px] items-center flex justify-center flex-wrap"
                  @click="handleVneidLogin"
                >
                  <img
                    src="@/assets/img/logo_bca.png"
                    alt="logo"
                    class="w-[16px] mr-1"
                  />
                  <span class="flex-1 inline text-sm"
                    >Đăng nhập bằng vneid</span
                  >
                </a-button>

                <!-- <GoogleLogin
                  :callback="callback"
                  class="text-black text-[13px] leading-5 bg-white w-full h-[36px] mt-[8px] items-center inline-flex justify-center flex-wrap"
                >
                </GoogleLogin> -->
                <div
                  class="register text[14px] text-black leading-5 my-6 flex justify-center w-full font-nunito"
                >
                  <span class="mr-2">Bạn chưa có tài khoản? </span
                  ><a href="/dang-ky" class="text-[#1966E8]">Đăng ký</a>
                </div>
                <div
                  class="tool text[14px] text-black leading-5 my-6 flex justify-between w-full font-nunito"
                >
                  <a
                    class="flex row"
                    href="/tool/CA2_Sign_Platform_Tool_16.0.exe"
                    download
                  >
                    <img
                      src="@/assets/img/cloud_download.svg?url"
                      alt="logo"
                      class="w-[16px] mr-1"
                    />
                    <span>Tool ký USB Token</span>
                  </a>
                  <a
                    class="flex row"
                    href="https://ca2sp.nacencomm.vn/download/H%C6%B0%E1%BB%9Bng%20d%E1%BA%ABn%20s%E1%BB%AD%20d%E1%BB%A5ng.docx"
                  >
                    <img
                      src="@/assets/img/text_sniper.svg?url"
                      alt="logo"
                      class="w-[16px] mr-1"
                    />
                    <span>Hướng dẫn sử dụng</span>
                  </a>
                </div>
              </div>
            </div>
            </a-spin>
          </div>
        </div>
      </div>

      <a-modal
        v-model:visible="openDigitalSignature"
        title="Đăng nhập bằng Remote Signing"
        @ok="handleOk"
        width="400px"
        footer=""
        class="z-[400000000000000]"
      >
        <!-- <a-spin :spinning="loading"> -->
        <!-- <a-form
          ref="digitalFormRef"
          :layout="'vertical'"
          :model="digitalFormState"
          :rules="rsRules"
          :class="'mt-4'"
          autocomplete="off"
        >
          <a-form-item label="Mã bút ký" name="idcts">
            <a-input
              v-model:value="digitalFormState.idcts"
              placeholder="123456"
              :class="'w-full'"
            />
          </a-form-item>

          <div class="flex gap-2 justify-center mt-8">
            <a-button
              html-type="submit"
              class="text-white bg-[#0055E6] w-6/12 h-[36px] border rounded-md"
              @click="rsLogin"
            >
              Đăng nhập
            </a-button>
          </div>
        </a-form> -->

        <div>
          <p>
            Yêu cầu đăng nhập với mã bút ký
            <b>{{ digitalFormState.idcts }}</b> đã được gửi về thiết bị di động.
          </p>
        </div>

        <!-- </a-spin> -->
      </a-modal>
    </div>
  </div>
</template>
<script setup lang="ts">
import { message } from "ant-design-vue";
import { Rule } from "ant-design-vue/es/form";
import axios from "axios";
import { Storage } from "@/utils/Storage";
import { UnwrapRef } from "vue";
import { useRoute, useRouter } from "vue-router";
import { decodeCredential, googleSdkLoaded } from "vue3-google-login";
import { CLIENT_ID, CLIENT_SECRET } from "@/utils/constants";
import {
  getTokenGoogle,
  getUserInfoGoogle,
  createSessionAccount,
  userLogin,
  GetSerialRS_idcts,
  Guiyeucauky_Mobilesign,
  Capnhattrangthaihoantat_Code,
} from "@/api/auth";
import { useUserStoreHook } from "@/store/modules/user";
import { getAccountInfor, getDefaultSigningMethod } from "@/api/account";
import { isEmpty, isNumber } from "lodash-es";
import { getDataFromXml } from "@/utils/common";
import PasskeyIcon from "@/assets/img/passkey_white.svg?component";
import {
  startAuthentication,
} from "@simplewebauthn/browser";
interface VerificationData {
  token: string;
  username: string;
}
const router = useRouter();
interface FormState {
  email: string;
  password: string;
}

interface DigitalFormState {
  idcts: string;
}

const formState: UnwrapRef<FormState> = reactive({
  email: "",
  password: "",
});

const digitalFormState: UnwrapRef<DigitalFormState> = reactive({
  idcts: "",
});

const formRef = ref();
const digitalFormRef = ref();
const useUserStore = useUserStoreHook();
const openDigitalSignature = ref<boolean>(false);

const loading = ref<boolean>(false);

const handleOpenDigitalSignature = async () => {
  openDigitalSignature.value = true;
};

const handleOk = (e: MouseEvent) => {
  openDigitalSignature.value = false;
};

const login = async () => {
  try {
    await formRef.value.validate();
    await DangNhap();
  } catch (error) {}
  // router.push("/quan-ly/tai-lieu");
};
const loginByPasskey = async () => {
  try {
    loading.value = true;
    // Lấy tọa độ của người dùng
    const getCoordinates = () => {
      return new Promise((resolve, reject) => {
        if (!navigator.geolocation) {
          reject(new Error("Trình duyệt không hỗ trợ Geolocation"));
        } else {
          navigator.geolocation.getCurrentPosition(
            (position) => {
              resolve({
                latitude: position.coords.latitude,
                longitude: position.coords.longitude,
              });
            },
            (error) => reject(error)
          );
        }
      });
    };

    // Gọi validate form
    // await formRef.value.validate();

    // Gọi API lấy tùy chọn xác thực
    const resp: any = await axios.get(
      "https://ca2rs.nacencomm.vn/webauthn/authenticate/generate-options",
      {
        withCredentials: true,
      }
    );

    const opts = resp.data;
    const sessionId = opts.sessionId;
    // Bắt đầu xác thực bằng FIDO
    const asseResp = await startAuthentication(opts);

    // Lấy tọa độ hiện tại
    const coordinates: any = await getCoordinates();

    // Gọi API verify với thêm thông tin tọa độ
    const verificationResp = await axios.post(
      "https://ca2rs.nacencomm.vn/webauthn/authenticate/verify",
      { ...asseResp, ...coordinates, sessionId }, // Gộp thông tin xác thực và tọa độ
      {
        headers: {
          "Content-Type": "application/json",
        },
        withCredentials: true,
      }
    );

    const verificationJSON:VerificationData  = verificationResp.data;

    // Lấy thông tin tài khoản
    await DangNhapPasskey(verificationJSON);
  } catch (error) {
    console.error(error);
    message.error("Lỗi đăng nhập bằng passkey");
  } finally {
    loading.value = false;
  }
  // router.push("/quan-ly/tai-lieu");
};
const DangNhapPasskey = async (verificationJSON: VerificationData) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
     <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
        <soap12:Body>
          <DangnhapPasskey xmlns="http://tempuri.org/">
            <Token>${verificationJSON.token}</Token>
          </DangnhapPasskey>
        </soap12:Body>
      </soap12:Envelope>
     `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml;charset=UTF-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("DangnhapPasskeyResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerText;
    // Cập nhật giá trị kết quả
    console.log(resultValue);
    if (Number(resultValue) === -5) {
      message.error("Sai thông tin đăng nhập");
    } else if (Number(resultValue) === -4) {
      message.error("Nhập sai thông tin đăng nhập quá 5 lần");
    } else if (Number(resultValue) === -3) {
      message.error("Tài khoản đã bị khóa");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 0) {
      message.error("Tài khoản không tồn tại");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await Laythongtintaikhoan(verificationJSON.username);
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};

const LayKetquaky = (response: string) => {
  return axios.post(
    "https://apisign.nacencomm.vn/api/APISigncore/Layketquaky?Code=" + response,
    {
      headers: {
        "Content-Type": "application/json",
      },
    }
  );
};

const delay = async (ms: number) => {
  // Hàm chờ giữa các lần thử nghiệm
  return new Promise((resolve) => setTimeout(resolve, ms));
};

const Thietlapphuongthuckymobilesign_IDCTS = async ({
  email,
  idcts,
}: {
  email: string;
  idcts: string;
}) => {
  try {
    // URL của API server SOAP
    const apiUrl = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
    // Envelope của SOAP request
    const soapEnvelope = `
      <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        <Thietlapphuongthuckymobilesign_IDCTS xmlns="http://tempuri.org/">
          <taikhoan>${email}</taikhoan>
          <idcts>${idcts}</idcts>
          <macdinh>1</macdinh>
        </Thietlapphuongthuckymobilesign_IDCTS>
      </soap12:Body>
    </soap12:Envelope>
    `;

    // Thực hiện request SOAP sử dụng axios
    const response = await axios.post(apiUrl, soapEnvelope, {
      headers: {
        "Content-Type": "application/soap+xml; charset=utf-8",
      },
    });

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response.data, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName(
      "Thietlapphuongthuckymobilesign_IDCTSResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === 1) {
      message.success("Thành công");
    } else if (Number(resultValue) === 0) {
      message.error("Thiết lập không thành công");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -3) {
      message.error("Mã đăng ký không tồn tại hoặc không hợp lệ ");
    } else if (Number(resultValue) === -4) {
      message.error("Tài khoản không hợp lệ");
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};

const LayKetquakyWithRetry = async (res: string) => {
  const startTime = new Date().getTime(); // Lấy thời gian bắt đầu
  const maxTimeInSeconds = 300;

  while (true) {
    try {
      const response = await LayKetquaky(res);

      // Kiểm tra response có data không rỗng
      if (response.data && response.data.length > 0) {
        // Xử lý dữ liệu ở đây nếu cần
        const result = await Capnhattrangthaihoantat_Code({
          code: res,
        });

        if (result?.data == 1) {
          await Thietlapphuongthuckymobilesign_IDCTS({
            email: formState.email,
            idcts: digitalFormState.idcts,
          });
          await Laythongtintaikhoan(formState.email);
          openDigitalSignature.value = false;
          message.success("Đăng nhập thành công");
        } else {
          message.error("Đăng nhập không thành công");
        }

        break; // Kết thúc vòng lặp khi có dữ liệu
      } else {
        // Nếu không có dữ liệu, kiểm tra thời gian đã trôi qua
        const currentTime = new Date().getTime();
        const elapsedTimeInSeconds = (currentTime - startTime) / 1000;

        if (elapsedTimeInSeconds > maxTimeInSeconds) {
          // Nếu quá thời gian tối đa, báo lỗi và kết thúc vòng lặp

          message.error("Quá thời gian lấy kết quả ký!");
          throw new Error("Quá thời gian lấy kết quả ký!");
        }

        // Nếu chưa quá thời gian tối đa, chờ 1 giây và tiếp tục vòng lặp
        await delay(1000);
      }
    } catch (error) {
      // Xử lý lỗi (nếu cần)
      throw new Error("Lỗi ở hàm LayKetquakyWithRetry!");
    }
  }
};

const handRsLogin = async () => {
  try {
    loading.value = true;
    await formRef.value.validate(["email"]);

    const checkEmailAndIdcts: any = await getDefaultSigningMethod(
      formState.email
    );

    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(checkEmailAndIdcts, "text/xml");

    const newData = {
      email: getDataFromXml(xmlDoc, "Email"),
      idcts: getDataFromXml(xmlDoc, "IDCTS"),
      phuongThucky: getDataFromXml(xmlDoc, "Phuongthucky"),
    };

    if (newData?.phuongThucky == 2) {
      message.error(
        "Tài khoản chưa được thiết lập mã bút ký. Vui lòng đăng nhập bằng tài khoản và mật khẩu để vào thiết lập phương thức ký bằng Remote Signing tại phần Cài đặt"
      );
      loading.value = false;
      return;
    }

    digitalFormState.idcts = newData?.idcts;
    handleOpenDigitalSignature();

    const serial = await getSerial(newData.idcts);

    if (serial) {
      const response: any = await Guiyeucauky_Mobilesign({
        Email: formState.email,
        Serial: serial,
      });

      await LayKetquakyWithRetry(response?.data);
    } else {
      message.error("Mã bút ký không hợp lệ");
    }

    loading.value = false;
  } catch (error) {
    loading.value = false;
  }
};

const rsLogin = async () => {
  try {
    loading.value = true;

    await digitalFormRef.value.validate();

    // await DangNhap();
  } catch (error) {}
};

const forgotPassword = () => {
  router.push("/quen-mat-khau");
};

const checkEmail = async (_rule: Rule, value: string) => {
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
  if (!value) {
    return Promise.reject("Hãy nhập email");
  } else if (!emailRegex.test(value)) {
    return Promise.reject("Email không hợp lệ");
  }
};
const checkPassword = async (_rule: Rule, value: number) => {
  if (!value) {
    return Promise.reject("Hãy nhập mật khẩu");
  }
};

const checkIdcts = async (_rule: Rule, value: string) => {
  const regex = /^\d{1,10}$/;

  if (!value) {
    return Promise.reject("Hãy nhập mã bút ký");
  }

  if (!regex.test(value)) {
    return Promise.reject("Mã bút ký không hợp lệ");
  }
};

const rules: Record<string, Rule[]> = {
  email: [{ validator: checkEmail, trigger: "change" }],
  password: [{ validator: checkPassword, trigger: "change" }],
};

const rsRules: Record<string, Rule[]> = {
  idcts: [{ validator: checkIdcts, trigger: "change" }],
};

const DangNhap = async () => {
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await userLogin(formState.email, formState.password);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("DangnhapResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === -5) {
      message.error("Sai thông tin đăng nhập");
    } else if (Number(resultValue) === -4) {
      message.error("Nhập sai thông tin đăng nhập quá 5 lần");
    } else if (Number(resultValue) === -3) {
      message.error("Tài khoản đã bị khóa");
    } else if (Number(resultValue) === -2) {
      message.error("Tài khoản chưa được kích hoạt");
    } else if (Number(resultValue) === -1) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) === 0 || Number(resultValue) === -100) {
      message.error("Tài khoản không tồn tại");
    } else if (Number(resultValue) === 1) {
      message.success("Thành công");
      await Laythongtintaikhoan(formState.email);
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const TaoTKphien = async (email: string, Hoten: string) => {
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await createSessionAccount(email, Hoten);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName("TaoTKphienResult")[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;
    // Cập nhật giá trị kết quả
    if (Number(resultValue) === -1) {
      message.error("Tạo tài khoản không thành công");
    } else if (Number(resultValue) === -2) {
      message.error("Không có tài khoản email");
    } else if (Number(resultValue) < 0) {
      message.error("Lỗi hệ thống");
    } else if (Number(resultValue) >= 0) {
      message.success("Thành công");
      await Laythongtintaikhoan(email);
    }
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
const Laythongtintaikhoan = async (email: string) => {
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await getAccountInfor(email);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    let data: any = {};
    data.idTaikhoan = xmlDoc.getElementsByTagName("idTaikhoan")[0].textContent;
    data.email = xmlDoc.getElementsByTagName("Email")[0].textContent;
    data.Hoten = xmlDoc.getElementsByTagName("Hoten")[0].textContent;
    data.PhanloaiTK = xmlDoc.getElementsByTagName("PhanloaiTK")[0].textContent;

    // Cập nhật giá trị kết quả
    useUserStore.login(data);

    router.push("/quan-ly/tai-lieu");
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};

const callback = async (response: any) => {
  // This callback will be triggered when the user selects or login to
  // his Google account from the popup
  try {
    if (response.credential) {
      const userData: any = decodeCredential(response.credential);

      await TaoTKphien(userData.email, userData.name);
    } else {
      // TODO
    }
  } catch (error) {
    console.log(error);
  }
};

const handleGoogleLogin = () => {
  googleSdkLoaded((google) => {
    google.accounts.oauth2
      .initCodeClient({
        client_id: CLIENT_ID,
        scope: "email profile openid",
        callback: (response) => {
          sendCodeToBackend(response.code);
        },
      })
      .requestCode();
  });
};
const handleVneidLogin = () => {
  const redirectUri = "https://ca2sp.nacencomm.vn/callback/vneid";
  const encodeRedirectUri = encodeURIComponent(redirectUri);
  const clientId = "sso-ca2-web";
  const openId = "openid";
  const responseType = "code";
  const finalUrl = `https://ssovneid.teca.vn/auth?response_type=${responseType}&scope=${openId}&client_id=${clientId}&redirect_uri=${encodeRedirectUri}`;
  window.location.href = finalUrl;
};

const sendCodeToBackend = async (code: string) => {
  try {
    const response = await getTokenGoogle({
      client_id: CLIENT_ID,
      client_secret: CLIENT_SECRET,
      code,
      //production
      redirect_uri: "https://ca2sp.nacencomm.vn",

      //development
      // redirect_uri: "http://localhost:3001",
      grant_type: "authorization_code",
    });

    const accessToken = response.data.access_token;

    // Fetch user details using the access token
    const userResponse = await getUserInfoGoogle(accessToken);

    if (userResponse && userResponse.data && userResponse.data.email_verified) {
      await TaoTKphien(userResponse.data.email, userResponse.data.name);
    } else {
      // Handle the case where userResponse or userResponse.data is undefined
      console.error("Failed to fetch user details.");
    }
  } catch (error: any) {
    console.error("Token exchange failed:", error.response.data);
  }
};

const getSerial = async (idcts: string) => {
  try {
    // Thực hiện request SOAP sử dụng axios
    const response: any = await GetSerialRS_idcts(idcts);

    // Lấy dữ liệu từ phản hồi SOAP
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(response, "text/xml");
    const resultNode = xmlDoc.getElementsByTagName(
      "GetSerialRS_idctsResult"
    )[0];
    const resultValue = resultNode.textContent || resultNode.innerHTML;

    return resultValue;
  } catch (error) {
    console.error("Error calling SOAP service:", error);
  }
};
</script>

<style scoped></style>
