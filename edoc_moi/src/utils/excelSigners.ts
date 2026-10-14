import * as XLSX from "xlsx";

export interface ExcelSignerRow {
  /** STT trang trong file dữ liệu tổng */
  pageStt: number;
  /** Danh sách email/tài khoản ký theo cột B, C, D... */
  signers: string[];
}

export interface ParseExcelResult {
  rows: ExcelSignerRow[];
  /** Số cột người ký (max trên các dòng) */
  signerColCount: number;
}

/**
 * Đọc file Excel: cột A = STT trang, B.. = người ký.
 * Bỏ qua dòng header nếu ô A không phải số.
 */
export async function parseSignerExcel(file: File): Promise<ParseExcelResult> {
  const buf = await file.arrayBuffer();
  const wb = XLSX.read(buf, { type: "array" });
  const sheetName = wb.SheetNames[0];
  if (!sheetName) {
    throw new Error("File Excel không có sheet dữ liệu");
  }
  const sheet = wb.Sheets[sheetName];
  const raw: any[][] = XLSX.utils.sheet_to_json(sheet, {
    header: 1,
    defval: "",
    raw: false,
  });

  const rows: ExcelSignerRow[] = [];
  let signerColCount = 0;

  for (const row of raw) {
    if (!row || !row.length) continue;
    const first = String(row[0] ?? "").trim();
    if (!first) continue;
    // Header
    if (!/^\d+$/.test(first)) continue;

    const pageStt = Number(first);
    const signers = row
      .slice(1)
      .map((c) => String(c ?? "").trim())
      .filter((c) => !!c);
    if (!signers.length) continue;
    signerColCount = Math.max(signerColCount, signers.length);
    rows.push({ pageStt, signers });
  }

  if (!rows.length) {
    throw new Error(
      "Không đọc được dòng dữ liệu hợp lệ (cột A phải là STT trang dạng số)"
    );
  }

  return { rows, signerColCount };
}
