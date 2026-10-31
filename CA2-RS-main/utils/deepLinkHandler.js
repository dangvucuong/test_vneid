import * as Linking from "expo-linking";
import * as RootNavigation from "../screen/RootNavigation";
import {
  captureInstallReferrerOnce,
  codeFromActivateUrl,
  isDeviceActivated,
  lockActivationRoute,
  readPendingActivationCode,
  setSessionActivationCode,
} from "./activationCode";

export function isActivateUrl(url) {
  if (!url) return false;
  try {
    return normalizeDeepLinkPath(url) === "/activate";
  } catch (error) {
    return false;
  }
}

export const LINKING_CONFIG = {
  prefixes: ["apprs://", "https://applink.nacencomm.vn"],
  filter: (url) => !isActivateUrl(url),
  config: {
    screens: {
      Start2: "",
      Login: "login",
      HomeWrapper: {
        path: "app",
        screens: {
          Home: "home",
          TaiKhoan: "account",
        },
      },
      KyTaiLieu: "sign/:code",
      KyLoTaiLieu: "sign-batch",
      QuanLyTaiLieuList: "documents",
      ListNotify: "notifications",
    },
  },
};

function normalizeDeepLinkPath(url) {
  const normalized = url.replace(/^apprs:\/\//, "https://applink.nacencomm.vn/");
  const urlObj = new URL(normalized);
  return urlObj.pathname.replace(/\/$/, "") || "/";
}

/** Paths handled by React Navigation linking — skip manual handler to avoid double navigation. */
export function isLinkingHandledPath(path) {
  return (
    path === "/" ||
    path === "/login" ||
    path === "/app/home" ||
    path === "/app/account" ||
    path === "/sign-batch" ||
    path === "/documents" ||
    path === "/notifications" ||
    path.startsWith("/sign/")
  );
}

export function shouldHandleDeepLinkManually(url) {
  if (!url) return false;

  try {
    const path = normalizeDeepLinkPath(url);
    if (isLinkingHandledPath(path)) return false;
    return path === "/callback" || path.startsWith("/callback/") || path === "/home";
  } catch (error) {
    return false;
  }
}

export function handleDeepLink(url) {
  if (!url || !RootNavigation.navigationRef.isReady()) return;

  try {
    const normalized = url.replace(/^apprs:\/\//, "https://applink.nacencomm.vn/");
    const urlObj = new URL(normalized);
    const path = urlObj.pathname.replace(/\/$/, "") || "/";

    if (isLinkingHandledPath(path) || path === "/activate") return;

    if (path === "/callback") {
      const token = urlObj.searchParams.get("token");
      const action = urlObj.searchParams.get("action");
      const code = urlObj.searchParams.get("code");

      if (action === "sign" && (code || token)) {
        global.code = code || token;
        RootNavigation.navigate("KyTaiLieu", { code: global.code });
        return;
      }

      if (token) {
        RootNavigation.navigate("HomeWrapper", {
          screen: "Home",
          params: { deepLinkToken: token },
        });
        return;
      }
    }

    if (path === "/home") {
      RootNavigation.navigate("HomeWrapper", { screen: "Home" });
    }
  } catch (error) {
    console.error("Deep link processing error:", error);
  }
}

let queuedUrl = null;
let readyTimer = null;
let activateRequest = 0;

function ensureFlush() {
  if (RootNavigation.navigationRef.isReady()) {
    flushQueuedDeepLink();
    return;
  }
  if (readyTimer) return;
  const started = Date.now();
  readyTimer = setInterval(() => {
    if (RootNavigation.navigationRef.isReady() || Date.now() - started > 5000) {
      clearInterval(readyTimer);
      readyTimer = null;
      flushQueuedDeepLink();
    }
  }, 50);
}

export function flushQueuedDeepLink() {
  if (!queuedUrl || !RootNavigation.navigationRef.isReady()) return;
  const url = queuedUrl;
  queuedUrl = null;
  dispatchUrl(url);
}

function dispatchUrl(url) {
  if (!url) return;
  if (!RootNavigation.navigationRef.isReady()) {
    queuedUrl = url;
    ensureFlush();
    return;
  }
  if (isActivateUrl(url)) {
    openActivationFromUrl(url);
    return;
  }
  if (shouldHandleDeepLinkManually(url)) {
    handleDeepLink(url);
  }
}

async function openActivationFromUrl(url) {
  const requestId = ++activateRequest;
  const code = codeFromActivateUrl(url);
  const activated = await isDeviceActivated();
  if (requestId !== activateRequest) return;
  if (!RootNavigation.navigationRef.isReady()) {
    queuedUrl = url;
    ensureFlush();
    return;
  }
  if (activated) return;
  if (code) setSessionActivationCode(code);
  lockActivationRoute();
  RootNavigation.navigationRef.navigate(
    "Kichhoat",
    code ? { c: code } : undefined
  );
}

let pendingActivationOpened = false;
let pendingActivationTask = null;

export function openPendingActivationIfNeeded() {
  if (pendingActivationOpened || isActivationRouteLocked()) return Promise.resolve();
  if (!pendingActivationTask) {
    pendingActivationTask = runOpenPendingActivation().finally(() => {
      if (!pendingActivationOpened) pendingActivationTask = null;
    });
  }
  return pendingActivationTask;
}

async function runOpenPendingActivation() {
  if (pendingActivationOpened || isActivationRouteLocked()) return;
  let initialUrl = "";
  try {
    initialUrl = await Linking.getInitialURL();
  } catch (error) {
    initialUrl = "";
  }
  if (isActivateUrl(initialUrl)) return;
  await captureInstallReferrerOnce();
  if (pendingActivationOpened || isActivationRouteLocked()) return;
  if (await isDeviceActivated()) return;
  const code = await readPendingActivationCode();
  if (!code || !RootNavigation.navigationRef.isReady()) return;
  pendingActivationOpened = true;
  setSessionActivationCode(code);
  lockActivationRoute();
  RootNavigation.navigationRef.navigate("Kichhoat", { c: code });
}

export function setupDeepLinkListeners() {
  const processUrl = (url) => {
    if (!url) return;
    if (isActivateUrl(url) || shouldHandleDeepLinkManually(url)) {
      dispatchUrl(url);
    }
  };

  const subscription = Linking.addEventListener("url", ({ url }) => {
    processUrl(url);
  });

  Linking.getInitialURL().then((url) => {
    processUrl(url);
  });

  return () => {
    subscription.remove();
    if (readyTimer) {
      clearInterval(readyTimer);
      readyTimer = null;
    }
  };
}
