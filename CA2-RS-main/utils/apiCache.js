import AsyncStorage from "@react-native-async-storage/async-storage";

const CACHE_PREFIX = "@api_cache_";

export async function getCached(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    const { data, expiry } = JSON.parse(raw);
    if (Date.now() > expiry) {
      await AsyncStorage.removeItem(CACHE_PREFIX + key);
      return null;
    }
    return data;
  } catch {
    return null;
  }
}

export async function getStaleCached(key) {
  try {
    const raw = await AsyncStorage.getItem(CACHE_PREFIX + key);
    if (!raw) return null;
    return JSON.parse(raw).data;
  } catch {
    return null;
  }
}

export async function setCache(key, data, ttlMs) {
  try {
    await AsyncStorage.setItem(
      CACHE_PREFIX + key,
      JSON.stringify({ data, expiry: Date.now() + ttlMs })
    );
  } catch (e) {
    console.warn("Cache write failed:", e);
  }
}

export async function invalidateCache(key) {
  try {
    await AsyncStorage.removeItem(CACHE_PREFIX + key);
  } catch (e) {
    console.warn("Cache invalidate failed:", e);
  }
}

export async function invalidateCacheByPrefix(prefix) {
  try {
    const keys = await AsyncStorage.getAllKeys();
    const toRemove = keys.filter((k) => k.startsWith(CACHE_PREFIX + prefix));
    if (toRemove.length > 0) {
      await AsyncStorage.multiRemove(toRemove);
    }
  } catch (e) {
    console.warn("Cache prefix invalidate failed:", e);
  }
}
