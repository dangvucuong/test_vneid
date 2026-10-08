import { DeviceEventEmitter } from "react-native";

export const SIGN_LIST_REFRESH = "SIGN_LIST_REFRESH";

const RETRY_DELAYS_MS = [2000, 5000, 10000];

let directRefreshHandler = null;
let pendingRefreshPayload = null;
let retryTimerIds = [];

function clearRetryTimers() {
  retryTimerIds.forEach(clearTimeout);
  retryTimerIds = [];
}

export function registerSignListRefreshHandler(handler) {
  directRefreshHandler = handler;
  if (directRefreshHandler && pendingRefreshPayload) {
    const payload = pendingRefreshPayload;
    pendingRefreshPayload = null;
    directRefreshHandler(payload);
  }
}

export function notifySignListRefresh(payload = {}) {
  if (directRefreshHandler) {
    directRefreshHandler(payload);
  } else {
    pendingRefreshPayload = payload;
  }
  DeviceEventEmitter.emit(SIGN_LIST_REFRESH, payload);
}

export function scheduleSignListRefreshRetries(payload = {}) {
  clearRetryTimers();
  RETRY_DELAYS_MS.forEach((delayMs) => {
    const timerId = setTimeout(() => {
      notifySignListRefresh({ ...payload, retryOnly: true });
    }, delayMs);
    retryTimerIds.push(timerId);
  });
}
