const FILE_SERVER =
  import.meta.env.VITE_APP_FILE_SERVER_URL || "https://ca2sp.nacencomm.vn";
const API_BASE =
  import.meta.env.VITE_APP_BASE_URL_API ||
  "https://apiuploadedoc.nacencomm.vn";

/** Lấy phần đường dẫn \\FILELUU\\... từ Vitriluu / sourcefile / Linkfile */
export function extractFileSourcePath(vitriluu: string): string {
  if (!vitriluu) return "";
  let raw = String(vitriluu).trim();

  // Linkfile dạng https://ca2sp.../FILELUU/...
  try {
    if (/^https?:\/\//i.test(raw)) {
      const u = new URL(raw);
      raw = decodeURIComponent(u.pathname);
    }
  } catch {
    /* keep raw */
  }

  const normalized = raw.replace(/\//g, "\\");
  const idx = normalized.toUpperCase().indexOf("\\FILELUU");
  if (idx >= 0) return normalized.slice(idx);
  return normalized.startsWith("\\") ? normalized : `\\${normalized}`;
}

/** URL trực tiếp trên ca2sp (dùng cho email, API ký số bên thứ 3) */
export function getPublicFileUrl(vitriluu: string): string {
  const path = extractFileSourcePath(vitriluu)
    .replace(/\\/g, "/")
    .replace(/^\/+/, "");
  const base = FILE_SERVER.replace(/\/+$/, "");
  return `${base}/${path}`;
}

/** Dùng proxy API khi frontend chạy trên domain khác ca2sp */
export function shouldUseFileProxy(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return new URL(FILE_SERVER).host !== window.location.host;
  } catch {
    return true;
  }
}

/** URL để xem/tải file trong trình duyệt (tự chọn direct hoặc proxy) */
export function getFileUrl(vitriluu: string): string {
  if (!shouldUseFileProxy()) {
    return getPublicFileUrl(vitriluu);
  }
  const sourcefile = extractFileSourcePath(vitriluu);
  const apiBase = API_BASE.replace(/\/+$/, "");
  return `${apiBase}/api/data/GetFile?sourcefile=${encodeURIComponent(sourcefile)}`;
}

export async function fetchFileBlob(vitriluu: string): Promise<Blob> {
  const url = getFileUrl(vitriluu);
  const response = await fetch(url, { mode: "cors", credentials: "omit" });
  if (!response.ok) {
    throw new Error(`Không tải được file (${response.status}): ${url}`);
  }
  return response.blob();
}

/**
 * Resolve nguồn file từ kết quả Upload (Linkfile / sourcefile / Vitriluu)
 * rồi tải blob (qua GetFile khi FE khác domain ca2sp — tránh CORS).
 */
export async function fetchUploadResultBlob(params: {
  LinkFile?: string;
  sourcefile?: string;
  Vitriluu?: string;
}): Promise<{ blob: Blob; viewUrl: string; sourcePath: string }> {
  // Ưu tiên Linkfile (public URL đã xác nhận mở được), rồi sourcefile / Vitriluu
  const sourcePath = extractFileSourcePath(
    params.LinkFile || params.sourcefile || params.Vitriluu || ""
  );
  if (!sourcePath || sourcePath === "\\") {
    throw new Error("Thiếu Linkfile/sourcefile từ API Upload");
  }

  const viewUrl = getFileUrl(sourcePath);
  const blob = await fetchFileBlob(sourcePath);
  return { blob, viewUrl, sourcePath };
}
