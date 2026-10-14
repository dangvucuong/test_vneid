<template>
  <div class="register-container">
    <h3 class="font-nunito text-[24px] leading-8 font-bold text-center">
      Đăng ký passkey
    </h3>
    <!-- <div v-if="successMessage">
      <p>{{ successMessage }}</p>
    </div>
    <div v-else>
      <p v-if="errorText" class="error-text">{{ errorText }}</p>
      <a-form
        ref="formRef"
        :layout="'vertical'"
        :model="formState"
        :class="'m-4'"
        autocomplete="off"
      >
        <a-form-item label="Tài khoản (Email)" name="email">
          <a-input v-model:value="formState.email" :class="'w-full'" readonly disabled />
        </a-form-item>
        <a-form-item label="Mật khẩu" name="password">
          <a-input-password
            v-model:value="formState.password"
            placeholder="•••••••"
            autocomplete="on"
          />
        </a-form-item>
      </a-form>
      <div class="m-4">
        <div class="flex gap-2">
          <a-button
            class="mt-2 text-[#0055E6] bg-white w-full h-[36px] border border-[#0055E6] rounded-md flex items-center justify-center gap-2"
            @click="handleSubmit" 
            :disabled="!formState.password"
          >
            <div class="flex items-center justify-center space-x-2">
              <span class="flex-shrink-0">
                <PasskeyIcon />
              </span>
              <span>Đăng ký</span>
            </div>
          </a-button>
        </div>
      </div>
    </div> -->
  </div>
</template>

<script setup lang="ts">
import { ref, reactive, onMounted } from "vue";
import { useRoute, useRouter } from "vue-router";
import axios from "axios";
import { startRegistration } from "@simplewebauthn/browser";
import { userLogin } from "@/api/auth";
import { message } from "ant-design-vue";

const route = useRoute();
const router = useRouter();
const successMessage = ref("");
const errorText = ref("");
onMounted(async () => {
  await registerByPasskey();
});

const registerByPasskey = async () => {
  try {
    const mabutky = route.query.mabutky;
    const email = route.query.email;
    const token = route.query.token;
    const deviceName = route.query.deviceName;
    const username =  route.query.username;
    const resp = await axios.post(
      "https://ca2rs.nacencomm.vn/webauthn/register/generate-options",
      {
        username: email,
        mabutky,
      },
      { withCredentials: true }
    );
    const opts = resp.data;
    const sessionId = opts.sessionId;
    const asseResp = await startRegistration(opts);

    await axios.post(
      "https://ca2rs.nacencomm.vn/webauthn/register/verify",
      {
        ...asseResp,
        mabutky,
        deviceName: deviceName,
        sessionId,
        username: email,
      },
      {
        headers: { "Content-Type": "application/json" },
        withCredentials: true,
      }
    );
    message.success("Đăng ký passkey thành công cho ca2sp.nacencomm.vn!");
    router.push("/dang-nhap");
    // Đóng trình duyệt sau 3 giây
    // setTimeout(() => {
    //   window.close();
    // }, 3000);
    // successMessage.value =
    //   "Đã đăng ký passkey thành công cho ca2sp.nacencomm.vn!";
  } catch (error: any) {
    if (error.response?.status === 409) {
      message.error("Email đã được đăng ký");
      errorText.value = "Email đã được đăng ký";
    } else {
      message.error(error.response?.data?.message || "Lỗi hệ thống");
      errorText.value = error.response?.data?.message || "Lỗi hệ thống";
    }
  }
};
</script>

<style scoped>
.register-container {
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 20px;
  border-radius: 8px;
}

h1 {
  margin-bottom: 20px;
}

.form-item {
  margin-bottom: 15px;
  text-align: left;
}

label {
  display: block;
  margin-bottom: 5px;
  font-weight: bold;
}

input {
  width: 100%;
  padding: 8px;
  border: 1px solid #ccc;
  border-radius: 4px;
}

button {
  width: 100%;
  padding: 10px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 16px;
}

button:disabled {
  background-color: #ddd;
  cursor: not-allowed;
}

.error-text {
  color: red;
  margin-bottom: 10px;
  font-weight: bold;
}
</style>
