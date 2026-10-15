const API_BASE = "https://apiuploadedoc.nacencomm.vn";
const FILE_SERVER = "https://ca2sp.nacencomm.vn";

function extractFileSourcePath(vitriluu) {
  if (!vitriluu) return "";
  let raw = String(vitriluu).trim();
  try {
    if (/^https?:\/\//i.test(raw)) {
      raw = decodeURIComponent(new URL(raw).pathname);
    }
  } catch (error) {
    raw = String(vitriluu).trim();
  }
  const normalized = raw.replace(/\//g, "\\");
  const index = normalized.toUpperCase().indexOf("\\FILELUU");
  if (index >= 0) return normalized.slice(index);
  return normalized.startsWith("\\") ? normalized : `\\${normalized}`;
}

function publicFileUrl(vitriluu) {
  const path = extractFileSourcePath(vitriluu).replace(/\\/g, "/").replace(/^\/+/, "");
  return `${FILE_SERVER}/${path}`;
}

function getFileUrl(vitriluu) {
  const sourcefile = extractFileSourcePath(vitriluu);
  return `${API_BASE}/api/data/GetFile?sourcefile=${encodeURIComponent(sourcefile)}`;
}

async function readBody(response) {
  const text = await response.text();
  try {
    return JSON.parse(text);
  } catch (error) {
    return text;
  }
}

async function postQuery(path, timeout) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout || 120000);
  try {
    const response = await fetch(`${API_BASE}${path}`, {
      method: "POST",
      signal: controller.signal,
    });
    const body = await readBody(response);
    if (!response.ok) {
      throw new Error(typeof body === "string" ? body : `HTTP ${response.status}`);
    }
    return body;
  } catch (error) {
    if (error?.name === "AbortError") throw new Error("Hết thời gian chờ máy chủ file");
    throw error;
  } finally {
    clearTimeout(timer);
  }
}

async function getFolders(email) {
  const data = await postQuery(`/api/data/GetFolder?taikhoan=${encodeURIComponent(email)}`);
  return Array.isArray(data) ? data.map((item) => String(item)) : [];
}

async function upload(email, folder, file) {
  const url = `${API_BASE}/api/data/Upload?taikhoan=${encodeURIComponent(email)}&thumucluu=${encodeURIComponent(folder)}`;
  const body = new FormData();
  body.append("file", {
    uri: file.uri,
    name: file.name || "tai-lieu.pdf",
    type: file.type || "application/pdf",
  });
  const response = await fetch(url, { method: "POST", body });
  const data = await readBody(response);
  if (!response.ok) throw new Error("Không tải được file lên");
  const result = Array.isArray(data) ? data[0] : data;
  if (!result || Number(result.kq) !== 1) {
    throw new Error("Máy chủ không nhận file");
  }
  return {
    sourcefile: result.sourcefile || "",
    linkFile: result.Linkfile || result.LinkFile || "",
    vitriluu: extractFileSourcePath(result.sourcefile || result.Linkfile || ""),
  };
}

async function verifySignature(vitriluu) {
  return postQuery(
    `/api/data/VerifySignature?sourcefile=${encodeURIComponent(extractFileSourcePath(vitriluu))}`
  );
}

async function hashPdf(params) {
  const query = new URLSearchParams({
    idfile: String(params.idFile),
    taikhoanky: String(params.email || ""),
    serial: String(params.serial || ""),
    sourcepath: String(params.sourcePath || ""),
    pagesign: String(params.page),
    itext_x1: String(params.x1),
    itext_y1: String(params.y1),
    itext_x2: String(params.x2),
    itext_y2: String(params.y2),
    signaturefield: String(params.signatureField || ""),
  });
  const data = await postQuery(`/api/data/HashPDFFile?${query.toString()}`);
  const parsed = typeof data === "string" ? JSON.parse(data) : data;
  if (!parsed?.strhash || !parsed?.tempfile) {
    throw new Error("Không băm được file PDF");
  }
  return parsed;
}

async function mergeSignature(params) {
  const query = new URLSearchParams({
    rescode: String(params.rescode || ""),
    tempfile: String(params.tempfile || ""),
    serial: String(params.serial || ""),
    sourefile: String(params.sourcePath || ""),
    signaturefield: String(params.signatureField || ""),
  });
  return postQuery(`/api/data/GhepCKY?${query.toString()}`, 180000);
}

async function approveImage(params, file) {
  const query = new URLSearchParams({
    sourcefilepdf: extractFileSourcePath(params.pdfPath),
    matailieu: String(params.idFile),
    taikhoanky: String(params.email || ""),
    toado: String(params.toado || ""),
  });
  const body = new FormData();
  body.append("file", {
    uri: file.uri,
    name: file.name || "chuky.jpg",
    type: file.type || "image/jpeg",
  });
  const response = await fetch(
    `${API_BASE}/api/data/Pheduyet_Kydientu?${query.toString()}`,
    { method: "POST", body }
  );
  const data = await readBody(response);
  if (!response.ok) throw new Error("Không phê duyệt được bằng ảnh");
  return data;
}

async function requestMobileSign(payload) {
  const response = await fetch(
    "https://apisign.nacencomm.vn/api/APISigncore/Guiyeucauky_Mobilesign",
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    }
  );
  const data = await readBody(response);
  if (!response.ok) throw new Error("Không gửi được yêu cầu ký mobilesign");
  return data;
}

module.exports = {
  API_BASE,
  FILE_SERVER,
  extractFileSourcePath,
  publicFileUrl,
  getFileUrl,
  getFolders,
  upload,
  verifySignature,
  hashPdf,
  mergeSignature,
  approveImage,
  requestMobileSign,
};
