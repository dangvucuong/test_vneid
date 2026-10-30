import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { Platform } from "react-native";
import DeviceInfo from "react-native-device-info";
import { resolveActivationCode } from "./activationCipher";

export { resolveActivationCode };

export const PENDING_ACTIVATION_CODE_KEY = "@pending_activation_code";
const INSTALL_REFERRER_READ_KEY = "@install_referrer_read";
const CHECK_DEVICE_URL =
  "https://apisign.nacencomm.vn/api/APISigncore/Kiemtrathietbi?device_id=";

let sessionActivationCode = "";
let activationRouteLocked = false;
let activationPrefillEnabled = true;
let referrerCapture = null;

export function numericActivationCode(value) {
  if (value == null) return "";
  const text = String(value).trim();
  return /^\d+$/.test(text) ? text : "";
}

export function setSessionActivationCode(code) {
  const numeric = numericActivationCode(code);
  if (!numeric) return;
  activationPrefillEnabled = true;
  sessionActivationCode = numeric;
}

export function isActivationPrefillEnabled() {
  return activationPrefillEnabled;
}

export function getSessionActivationCode() {
  return sessionActivationCode;
}

export function clearSessionActivationCode() {
  sessionActivationCode = "";
}

export function lockActivationRoute() {
  activationRouteLocked = true;
}

export function isActivationRouteLocked() {
  return activationRouteLocked;
}

export async function readPendingActivationCode() {
  const stored = await AsyncStorage.getItem(PENDING_ACTIVATION_CODE_KEY);
  return numericActivationCode(stored);
}

export async function clearStoredActivationCode() {
  clearSessionActivationCode();
  activationPrefillEnabled = false;
  await AsyncStorage.removeItem(PENDING_ACTIVATION_CODE_KEY);
}

function codeFromQuery(query) {
  const params = new URLSearchParams(String(query).replace(/^\?/, ""));
  return resolveActivationCode(params.get("c"));
}

export function codeFromReferrer(referrer) {
  if (!referrer) return "";
  const direct = codeFromQuery(referrer);
  if (direct) return direct;
  try {
    return codeFromQuery(decodeURIComponent(String(referrer)));
  } catch (error) {
    return "";
  }
}

export function codeFromActivateUrl(url) {
  if (!url) return "";
  try {
    const normalized = url.replace(
      /^apprs:\/\//,
      "https://applink.nacencomm.vn/"
    );
    return resolveActivationCode(new URL(normalized).searchParams.get("c"));
  } catch (error) {
    return "";
  }
}

function hasActivationId(value) {
  if (value == null) return false;
  const text = String(value).trim();
  return text !== "" && text !== "0" && text !== "null" && text !== "undefined";
}

export async function isDeviceActivated() {
  const stored = await AsyncStorage.getItem("@idcts");
  if (hasActivationId(stored)) return true;
  if (hasActivationId(global.idcts)) return true;

  let deviceId = global.UUID || (await AsyncStorage.getItem("@devid"));
  if (!deviceId) {
    try {
      deviceId = await DeviceInfo.getUniqueId();
    } catch (error) {
      deviceId = "";
    }
  }
  if (!deviceId) return false;

  try {
    const state = await NetInfo.fetch();
    if (state.isConnected !== true) return false;
  } catch (error) {
    return false;
  }

  try {
    const response = await fetch(CHECK_DEVICE_URL + encodeURIComponent(deviceId), {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    });
    const responseJson = await response.json();
    // Cùng điều kiện Start2: API trả mã thiết bị thì JSON.stringify(id) > 0.
    return JSON.stringify(responseJson) > 0;
  } catch (error) {
    return false;
  }
}

function readPlayReferrer() {
  return new Promise((resolve) => {
    let PlayInstallReferrer;
    try {
      ({ PlayInstallReferrer } = require("react-native-play-install-referrer"));
    } catch (error) {
      resolve({ missing: true });
      return;
    }
    if (
      !PlayInstallReferrer ||
      typeof PlayInstallReferrer.getInstallReferrerInfo !== "function"
    ) {
      resolve({ missing: true });
      return;
    }
    try {
      PlayInstallReferrer.getInstallReferrerInfo((info, error) => {
        if (error) {
          resolve({ error });
          return;
        }
        resolve({ referrer: info && info.installReferrer });
      });
    } catch (error) {
      resolve({ missing: true });
    }
  });
}

export function captureInstallReferrerOnce() {
  if (!referrerCapture) {
    referrerCapture = runCaptureInstallReferrer();
  }
  return referrerCapture;
}

async function runCaptureInstallReferrer() {
  if (Platform.OS !== "android") return;
  try {
    const alreadyRead = await AsyncStorage.getItem(INSTALL_REFERRER_READ_KEY);
    if (alreadyRead === "1") return;
    if (await isDeviceActivated()) {
      await AsyncStorage.setItem(INSTALL_REFERRER_READ_KEY, "1");
      return;
    }

    const result = await readPlayReferrer();
    if (result.missing) return;
    if (result.error) {
      if (result.error.responseCode === 2) {
        await AsyncStorage.setItem(INSTALL_REFERRER_READ_KEY, "1");
      }
      return;
    }

    const code = codeFromReferrer(result.referrer);
    if (code && !(await isDeviceActivated())) {
      await AsyncStorage.setItem(PENDING_ACTIVATION_CODE_KEY, code);
    }
    await AsyncStorage.setItem(INSTALL_REFERRER_READ_KEY, "1");
  } catch (error) {
    console.log("Install referrer read failed", error);
  }
}
