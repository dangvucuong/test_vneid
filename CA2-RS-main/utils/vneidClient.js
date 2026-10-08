const ORIGINATOR_CODE = "CA2_MobileSign";
const DEFAULT_GATEWAY = "https://gatewayvneid.nacencomm.vn";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

const gatewayBase = (gatewayUrl) =>
  String(gatewayUrl || DEFAULT_GATEWAY).trim().replace(/\/+$/, "");

async function readJson(response) {
  const text = await response.text();
  try {
    return text ? JSON.parse(text) : {};
  } catch {
    return {};
  }
}

function certificateItems(body) {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  return data?.credentialInfos || data?.CredentialInfos || data?.credentialInfo || [];
}

function signatureValue(value) {
  if (typeof value === "string") return value.replace(/\s+/g, "");
  if (value && typeof value === "object") {
    return String(value.signature || value.signedValue || value.value || "").replace(/\s+/g, "");
  }
  return "";
}

async function listCertificates(gatewayUrl, citizenPid) {
  const response = await fetch(
    `${gatewayBase(gatewayUrl)}/api/vneid/certificates/list/${encodeURIComponent(citizenPid)}`
  );
  const body = await readJson(response);
  const status = String(body?.status ?? "");
  if (!response.ok || (status !== "01" && status !== "1")) {
    throw new Error(body?.description || "Không lấy được danh sách chứng thư.");
  }
  return certificateItems(body);
}

async function signHash(gatewayUrl, request, onStatus) {
  const base = gatewayBase(gatewayUrl);
  const signResponse = await fetch(`${base}/api/vneid/signings/hash`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      credentialID: request.credentialID,
      originatorCode: ORIGINATOR_CODE,
      documents: [
        {
          documentName: request.documentName || "tai-lieu.pdf",
          digestValue: request.digestValue,
        },
      ],
    }),
  });
  const signBody = await readJson(signResponse);
  const handle = signBody?.data?.handle;
  if (signBody?.status !== "01" || !handle) {
    throw new Error(signBody?.description || "Gateway không nhận yêu cầu ký.");
  }

  const requestId = String(signBody.requestId || "");
  const expiresIn = Number(signBody.data.expiresIn || 300);
  const started = Date.now();
  onStatus?.(`Mở VNeID và xác nhận ký.\nHandle: ${handle}`);

  while ((Date.now() - started) / 1000 < expiresIn) {
    if (request.shouldStop?.()) {
      throw new Error("Đã dừng yêu cầu ký.");
    }
    await sleep(3000);
    const poll = await fetch(
      `${base}/api/vneid/signings/polling/${encodeURIComponent(handle)}`,
      { headers: requestId ? { "X-Request-Id": requestId } : undefined }
    );
    const pollBody = await readJson(poll);
    const pollStatus = String(pollBody?.status ?? "");
    if (pollStatus !== "01" && pollStatus !== "1") {
      throw new Error(pollBody?.description || "Không lấy được kết quả ký.");
    }
    const statusCode = Number(pollBody?.data?.statusCode);
    if (statusCode === 0) {
      const signature = signatureValue(pollBody?.data?.signatures?.[0]);
      if (!signature) throw new Error("VNeID không trả chữ ký.");
      return { signature, handle };
    }
    if (statusCode === 1) throw new Error("Ký VNeID thất bại.");
    if (statusCode === 3) throw new Error("Bạn đã từ chối ký trên VNeID.");
    onStatus?.(`Đang chờ xác nhận trên VNeID.\nHandle: ${handle}`);
  }
  throw new Error("Hết thời gian chờ xác nhận trên VNeID.");
}

module.exports = {
  ORIGINATOR_CODE,
  DEFAULT_GATEWAY,
  listCertificates,
  signHash,
};
module.exports.default = module.exports;
