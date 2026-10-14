import { PDFDocument } from "pdf-lib";

/** Tách 1 trang (1-based) từ PDF master → bytes PDF 1 trang */
export async function extractPdfPage(
  masterBytes: ArrayBuffer | Uint8Array,
  pageIndex1Based: number
): Promise<Uint8Array> {
  const src = await PDFDocument.load(masterBytes, { ignoreEncryption: true });
  const total = src.getPageCount();
  if (pageIndex1Based < 1 || pageIndex1Based > total) {
    throw new Error(`Trang ${pageIndex1Based} không tồn tại (tổng ${total} trang)`);
  }
  const out = await PDFDocument.create();
  const [copied] = await out.copyPages(src, [pageIndex1Based - 1]);
  out.addPage(copied);
  return out.save();
}

/** Chuẩn hóa VTCKy về trang 1 (file đã tách 1 trang) */
export function normalizeVTCKyToPage1(vtcKy: string): string {
  const parts = String(vtcKy).trim().split(/\s+/);
  if (parts.length >= 5) {
    parts[4] = "1";
    return parts.join(" ");
  }
  return "0 0 0 0 1";
}
