import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@xacthucKyLoMotLan";

export async function loadBatchSignOnceSetting() {
  const value = await AsyncStorage.getItem(STORAGE_KEY);
  const enabled = value === "1";
  global.xacthucKyLoMotLan = enabled;
  return enabled;
}

export async function isBatchSignOnceEnabled() {
  if (global.xacthucKyLoMotLan === true) {
    return true;
  }
  return loadBatchSignOnceSetting();
}

export async function setBatchSignOnceEnabled(enabled) {
  global.xacthucKyLoMotLan = enabled;
  await AsyncStorage.setItem(STORAGE_KEY, enabled ? "1" : "0");
}
