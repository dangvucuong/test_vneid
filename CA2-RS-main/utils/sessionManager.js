import AsyncStorage from "@react-native-async-storage/async-storage";
import DefaultPreference from "react-native-default-preference";
import * as RootNavigation from "../screen/RootNavigation";
import { invalidateCacheByPrefix } from "./apiCache";

export const SESSION_TIMEOUT_MS = 5 * 60 * 1000;
export const LOGGED_IN_KEY = "@logged_in";

export async function markLoggedIn() {
  await AsyncStorage.setItem(LOGGED_IN_KEY, "1");
  await DefaultPreference.set("checksession", "0");
}

export async function performLogout() {
  await AsyncStorage.setItem(LOGGED_IN_KEY, "0");
  await DefaultPreference.set("checksession", "0");
}

export async function onAppBackground() {
  const loggedIn = await AsyncStorage.getItem(LOGGED_IN_KEY);
  if (loggedIn === "1") {
    await DefaultPreference.set("date1", new Date().toISOString());
    await DefaultPreference.set("checksession", "1");
  }
}

export async function checkSessionOnForeground() {
  const loggedIn = await AsyncStorage.getItem(LOGGED_IN_KEY);
  if (loggedIn !== "1") return false;

  const checksession = await DefaultPreference.get("checksession");
  if (checksession !== "1") return false;

  const dt1 = await DefaultPreference.get("date1");
  if (!dt1) return false;

  const elapsed = Date.now() - Date.parse(dt1);
  if (elapsed >= SESSION_TIMEOUT_MS) {
    await performLogout();
    await invalidateCacheByPrefix("pending_");
    await invalidateCacheByPrefix("signed_");
    if (RootNavigation.navigationRef.isReady()) {
      RootNavigation.navigationRef.reset({
        index: 0,
        routes: [{ name: "Login" }],
      });
    }
    return true;
  }
  return false;
}
