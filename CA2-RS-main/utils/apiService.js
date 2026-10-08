import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { getCached, getStaleCached, setCache, invalidateCache, invalidateCacheByPrefix } from "./apiCache";
import { notifySignListRefresh, scheduleSignListRefreshRetries } from "./signListEvents";

const API_BASE = "https://apisign.nacencomm.vn/api/APISigncore/";
const LIST_TTL_MS = 60 * 1000;
const CERT_TTL_MS = 5 * 60 * 1000;

async function fetchJson(url, options = {}) {
  const response = await fetch(url, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({}),
    ...options,
  });
  const responseJson = await response.json();
  return typeof responseJson === "string"
    ? JSON.parse(responseJson)
    : responseJson;
}

export async function fetchWithCache(url, cacheKey, ttlMs, forceRefresh = false) {
  if (!forceRefresh && cacheKey) {
    const cached = await getCached(cacheKey);
    if (cached !== null) return cached;
  }

  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    if (cacheKey) {
      const stale = await getStaleCached(cacheKey);
      if (stale !== null) return stale;
    }
    throw new Error("NO_INTERNET");
  }

  const data = await fetchJson(url);
  if (cacheKey) {
    await setCache(cacheKey, data, ttlMs);
  }
  return data;
}

export async function getPendingSignList(deviceId, idcts, forceRefresh = false) {
  const cacheKey = `pending_${deviceId}_${idcts}`;
  const url = `${API_BASE}Laydanhsachyeucauky_Mobilesign?deviceid=${deviceId}&idcts=${idcts}`;
  return fetchWithCache(url, cacheKey, LIST_TTL_MS, forceRefresh);
}

export async function getSignedList(deviceId, idcts, forceRefresh = false) {
  const cacheKey = `signed_${deviceId}_${idcts}`;
  const url = `${API_BASE}Laydanhsachyeucaudaky_Mobilesign?deviceid=${deviceId}&idcts=${idcts}`;
  return fetchWithCache(url, cacheKey, LIST_TTL_MS, forceRefresh);
}

export async function getCertInfo(deviceId, forceRefresh = false) {
  const cacheKey = `cert_${deviceId}`;
  const url = `${API_BASE}LaythongtinCTS_DeviceID_HSDT2025?device_id=${deviceId}`;
  return fetchWithCache(url, cacheKey, CERT_TTL_MS, forceRefresh);
}

export async function invalidateSignLists(deviceId, idcts) {
  if (deviceId && idcts) {
    await invalidateCache(`pending_${deviceId}_${idcts}`);
    await invalidateCache(`signed_${deviceId}_${idcts}`);
  }
  if (deviceId) {
    await invalidateCacheByPrefix(`pending_${deviceId}_`);
    await invalidateCacheByPrefix(`signed_${deviceId}_`);
  }
}

async function resolveSignContext() {
  const dev_id = global.UUID || (await AsyncStorage.getItem("@devid"));
  const idcts =
    (await AsyncStorage.getItem("@idcts")) ||
    global.id ||
    global.idcts;
  return { dev_id, idcts };
}

export async function batchSignDocuments(pin) {
  const { dev_id, idcts } = await resolveSignContext();
  if (!dev_id || !idcts) {
    return { successCount: 0, failCount: 0, signedCodes: [] };
  }

  const arr = await getPendingSignList(dev_id, idcts, true);

  if (!arr || arr.length === 0) {
    return { successCount: 0, failCount: 0, signedCodes: [] };
  }

  const dataKyLo = arr.map((item) => ({
    Code: item.Code,
    device_id: dev_id,
    IDCTS: idcts,
    pincode: pin,
  }));

  const url = `${API_BASE}Kyarr_Mobilesign_Object`;
  const responseJson = await fetchJson(url, {
    body: JSON.stringify(dataKyLo),
  });
  let res = responseJson;
  while (typeof res === "string") {
    try {
      res = JSON.parse(res);
    } catch {
      break;
    }
  }

  let successCount = 0;
  let failCount = 0;
  const signedCodes = [];

  if (Array.isArray(res)) {
    res.forEach((item, index) => {
      if (String(item.Trangthaiky) === "1") {
        successCount++;
        const code = item.Code || arr[index]?.Code;
        if (code) signedCodes.push(code);
      } else {
        failCount++;
      }
    });
  }

  await invalidateSignLists(dev_id, idcts);

  const batchCodes = arr.map((item) => item.Code);
  const result = { signedCodes, batchCodes, successCount, failCount };

  if (successCount > 0 && Array.isArray(global.dschoky)) {
    const remove = new Set(
      signedCodes.length > 0 ? signedCodes : batchCodes
    );
    global.dschoky = global.dschoky.filter((item) => !remove.has(item.Code));
  }

  if (arr.length > 0) {
    notifySignListRefresh(result);
    if (successCount > 0) {
      scheduleSignListRefreshRetries(result);
    }
  }

  return result;
}
