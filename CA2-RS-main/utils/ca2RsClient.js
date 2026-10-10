const SP_ID = "0103930279CA2";
const SP_PASSWORD = "2026CA2RSd7c2d416cb7c451f86fc220551502acb";
const BASE = "https://rmsca2.nacencomm.vn";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

function normalizeSerial(value) {
  return String(value || "").replace(/[^0-9a-f]/gi, "").toUpperCase();
}

function newTransactionId() {
  return `CA2${Date.now()}${Math.floor(Math.random() * 1e6)
    .toString()
    .padStart(6, "0")}`;
}

async function postJson(path, body) {
  const response = await fetch(`${BASE}${path}`, {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  let json = {};
  try {
    json = text ? JSON.parse(text) : {};
  } catch {
    json = {};
  }
  if (!response.ok && json.status_code == null) {
    throw new Error(`Máy chủ ký trả HTTP ${response.status}`);
  }
  return json;
}

function digitsOnly(value) {
  return String(value || "").replace(/\D/g, "");
}

async function getCertificate(userId, serialNumber, fallbackUserId) {
  const serial = normalizeSerial(serialNumber);
  if (!serial) {
    throw new Error("Tài khoản chưa có serial chứng thư đã kích hoạt.");
  }
  const userIds = [...new Set([digitsOnly(userId), digitsOnly(fallbackUserId)].filter(Boolean))];
  if (!userIds.length) {
    throw new Error("Nhập CCCD hoặc mã số thuế đã đăng ký trên CA2 RS.");
  }
  let lastMessage = "Không có dữ liệu trong hệ thống";
  for (const currentUserId of userIds) {
    const body = await postJson("/rssp/v2/neac/get_certificate", {
      sp_id: SP_ID,
      sp_password: SP_PASSWORD,
      user_id: currentUserId,
      serial_number: serial,
      transaction_id: "",
    });
    const list = body?.data?.user_certificates || [];
    const cert =
      list.find((item) => normalizeSerial(item.serial_number) === serial) ||
      (list.length === 1 ? list[0] : null);
    if (Number(body.status_code) === 200 && cert?.cert_data && normalizeSerial(cert.serial_number) === serial) {
      return certificateFrom(cert, serial);
    }
    if (body?.message) lastMessage = body.message;
  }
  throw new Error(
    `${lastMessage}. Số đã gửi không có chứng thư serial ${serial} trên CA2 RS.`
  );
}

function certificateFrom(cert, serial) {
  const seen = new Set();
  const certificates = [cert.cert_data, cert.chain_data?.ca_cert, cert.chain_data?.root_cert]
    .filter(Boolean)
    .filter((item) => {
      const key = String(item).replace(/\s+/g, "");
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  return {
    serialNumber: serial,
    certId: cert.cert_id || "",
    certificates,
  };
}

function signatureFrom(body) {
  const data = body?.data || {};
  const list = data.signatures || data.sign_files || data.signed_files || [];
  const first = Array.isArray(list) ? list[0] : list;
  return String(first?.signature_value || first?.signature || data.signature_value || "").replace(
    /\s+/g,
    ""
  );
}

function isPending(body) {
  const code = Number(body?.status_code);
  if (!code || code === 200 || code === 102 || code === 1001 || code === 1002) return true;
  return /chờ|pending|processing|đang xử lý/i.test(String(body?.message || ""));
}

function failureMessage(body) {
  const message = String(body?.message || "");
  if (/từ chối|tu choi|reject|hết hạn|het han|expir|không hợp lệ|khong hop le|thất bại|that bai/i.test(message)) {
    return message;
  }
  const code = Number(body?.status_code);
  if ([400, 401, 403, 404, 500].includes(code)) return message || "Ký CA2 RS thất bại.";
  return "";
}

async function signAndWait(request, onStatus) {
  const transactionId = newTransactionId();
  const signBody = await postJson("/api/data/sign", {
    sp_id: SP_ID,
    sp_password: SP_PASSWORD,
    user_id: request.userId,
    sign_files: [
      {
        data_to_be_signed: request.digestValue,
        doc_id: `DOC_${transactionId.slice(-12)}`,
        file_type: "pdf",
        sign_type: "hash",
      },
    ],
    transaction_id: transactionId,
    serial_number: normalizeSerial(request.serialNumber),
    time_stamp: "",
    urlWebhook: "",
  });
  const immediate = signatureFrom(signBody);
  if (immediate) return { signature: immediate, transactionId };
  if (!isPending(signBody)) {
    throw new Error(failureMessage(signBody) || signBody.message || "CA2 RS không nhận yêu cầu ký.");
  }

  onStatus?.(
    `Đang chờ xác thực PIN.\nMã giao dịch: ${transactionId}`
  );
  const started = Date.now();
  while (Date.now() - started < 180000) {
    if (request.shouldStop?.()) throw new Error("Đã dừng yêu cầu ký.");
    await sleep(3000);
    const statusBody = await postJson("/api/data/status", {
      sp_id: SP_ID,
      sp_password: SP_PASSWORD,
      user_id: request.userId,
      transaction_id: transactionId,
    });
    const signature = signatureFrom(statusBody);
    if (signature) return { signature, transactionId };
    if (!isPending(statusBody)) {
      throw new Error(failureMessage(statusBody) || statusBody.message || "Ký CA2 RS thất bại.");
    }
    onStatus?.(
      `${request.pinVerified?.() ? "Đã xác thực PIN. Đang chờ chữ ký." : "Đang chờ xác thực PIN."}\nMã giao dịch: ${transactionId}`
    );
  }
  throw new Error("Hết thời gian chờ xác nhận ký.");
}

module.exports = {
  getCertificate,
  signAndWait,
  normalizeSerial,
};
module.exports.default = module.exports;
