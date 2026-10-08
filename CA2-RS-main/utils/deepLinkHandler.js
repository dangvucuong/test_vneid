import * as Linking from "expo-linking";
import * as RootNavigation from "../screen/RootNavigation";

export const LINKING_CONFIG = {
  prefixes: ["apprs://", "https://applink.nacencomm.vn"],
  config: {
    screens: {
      Start2: "",
      Login: "login",
      Kichhoat: "activate",
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
    path === "/activate" ||
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
  } catch {
    return false;
  }
}

export function handleDeepLink(url) {
  if (!url || !RootNavigation.navigationRef.isReady()) return;

  try {
    const normalized = url.replace(/^apprs:\/\//, "https://applink.nacencomm.vn/");
    const urlObj = new URL(normalized);
    const path = urlObj.pathname.replace(/\/$/, "") || "/";

    if (isLinkingHandledPath(path)) return;

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

export function setupDeepLinkListeners() {
  const processUrl = (url) => {
    if (shouldHandleDeepLinkManually(url)) {
      handleDeepLink(url);
    }
  };

  const subscription = Linking.addEventListener("url", ({ url }) => {
    processUrl(url);
  });

  Linking.getInitialURL().then((url) => {
    processUrl(url);
  });

  return () => subscription.remove();
}
