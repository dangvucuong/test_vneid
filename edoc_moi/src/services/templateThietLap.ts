import axios from "axios";
import { isArray } from "lodash-es";
import { Storage } from "@/utils/Storage";
import { convertXmlToJson } from "@/utils/common";

const API_URL =
  import.meta.env.VITE_APP_BASE_URL_API_THIETLAP_TEMPLATE ||
  "https://apiedoc.nacencomm.vn/apiThietlaptemplate.asmx";

export interface TrinhTuKyItem {
  STT: string | number;
  TKKy: string;
  Trangky: string | number;
  VTCKy: string;
}

export interface TemplateThietLap {
  idTemplate?: number;
  taikhoantao: string;
  stt: number;
  /** Tên template thiết lập */
  tenTLap?: string;
  template: string;
  ngaytao?: string;
  ngaycapnhat?: string;
  /** Parsed rows for UI table */
  items?: TrinhTuKyItem[];
}

/** Build XML template từ danh sách vùng ký (Step3 listVungKy.info) */
export function buildThietLapCKyXml(
  taikhoan: string,
  listVungKy: Array<{
    TaikhoanDB: string;
    Trinhtuky: number | string;
    info?: string;
    Trangky?: number | string;
  }>
): string {
  const rows = listVungKy
    .filter((item) => item.info)
    .map((item) => {
      const vtcKy = String(item.info).trim();
      const parts = vtcKy.split(/\s+/);
      const trangKy = item.Trangky ?? parts[parts.length - 1] ?? "1";
      return `            <TrinhTuKy>
                <STT>${item.Trinhtuky}</STT>
		   <TKKy>${item.TaikhoanDB}</TKKy>
                <Trangky>${trangKy}</Trangky>
                <VTCKy>${vtcKy}</VTCKy>
            </TrinhTuKy>`;
    })
    .join("\n");

  return `<ThietlapCKy>   
      <DSTTKy TK="${taikhoan}">       
        
${rows}
        
    </DSTTKy>
</ThietlapCKy>`;
}

/** Parse XML template → bảng Trình tự ký */
export function parseThietLapCKyXml(templateXml: string): TrinhTuKyItem[] {
  try {
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(templateXml, "text/xml");
    const nodes = xmlDoc.getElementsByTagName("TrinhTuKy");
    const items: TrinhTuKyItem[] = [];
    for (let i = 0; i < nodes.length; i++) {
      const node = nodes[i];
      const getText = (tag: string) =>
        node.getElementsByTagName(tag)[0]?.textContent?.trim() || "";
      items.push({
        STT: getText("STT"),
        TKKy: getText("TKKy"),
        Trangky: getText("Trangky"),
        VTCKy: getText("VTCKy"),
      });
    }
    return items;
  } catch (e) {
    console.error("parseThietLapCKyXml error", e);
    return [];
  }
}

function soapPost(methodBody: string) {
  const soapEnvelope = `
    <soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
      <soap12:Body>
        ${methodBody}
      </soap12:Body>
    </soap12:Envelope>
  `;
  return axios.post(API_URL, soapEnvelope, {
    headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
  });
}

function getSoapBody(dataJson: any): any {
  return (
    dataJson?.["soap:Envelope"]?.["soap:Body"] ||
    dataJson?.["soap12:Envelope"]?.["soap12:Body"] ||
    null
  );
}

function parseIntResult(xmlData: string, resultTag: string): number {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlData, "text/xml");
  const resultNode = xmlDoc.getElementsByTagName(resultTag)[0];
  if (!resultNode) return -1;
  return Number(resultNode.textContent || resultNode.innerHTML || -1);
}

function xmlField(row: any, keys: string[]): any {
  for (const key of keys) {
    const val = row?.[key];
    if (val === undefined || val === null || val === "") continue;
    if (typeof val === "object") {
      const text = val["#text"] ?? val["_text"];
      if (text !== undefined && text !== null && text !== "") return text;
    }
    return val;
  }
  return undefined;
}

function mapTemplateRows(list: any[], email: string): TemplateThietLap[] {
  return list.map((row: any, index: number) => {
    const template = String(
      xmlField(row, [
        "template",
        "Template",
        "NoidungTemplate",
        "noidung",
        "Noidung",
      ]) || ""
    );
    const tenTLap = xmlField(row, [
      "TenTLap",
      "tenTLap",
      "Tentlap",
      "tenTemplate",
    ]);
    const idRaw = xmlField(row, ["idTemplate", "IdTemplate", "IDTemplate"]);
    const ngaytao = xmlField(row, ["ngaytao", "Ngaytao"]);
    const ngaycapnhat = xmlField(row, ["ngaycapnhat", "Ngaycapnhat"]);
    return {
      idTemplate: Number(idRaw) || undefined,
      taikhoantao: String(
        xmlField(row, ["taikhoantao", "Taikhoantao", "taikhoan"]) || email
      ),
      stt: Number(xmlField(row, ["stt", "STT"]) ?? index + 1),
      tenTLap: tenTLap ? String(tenTLap) : undefined,
      template,
      ngaytao: ngaytao ? String(ngaytao) : undefined,
      ngaycapnhat: ngaycapnhat ? String(ngaycapnhat) : undefined,
      items: parseThietLapCKyXml(template),
    } as TemplateThietLap;
  });
}

/**
 * Lưu thiết lập người ký / vùng ký làm template.
 * Gọi SOAP Luuthietlap_template trên apiThietlaptemplate.asmx.
 * >0: idTemplate; -1 lỗi; -2 đủ 5 template; -3 thiếu taikhoan; -4 không tìm thấy.
 */
export async function Luuthietlap_template(
  taikhoan: string,
  template: string,
  tenTLap?: string
): Promise<number> {
  try {
    const ten = (tenTLap || "").trim();
    const response = await soapPost(`
        <Luuthietlap_template xmlns="http://tempuri.org/">
          <taikhoan>${taikhoan}</taikhoan>
          <template><![CDATA[${template}]]></template>
          <TenTLap>${ten}</TenTLap>
        </Luuthietlap_template>
    `);
    return parseIntResult(response.data, "Luuthietlap_templateResult");
  } catch (error) {
    console.error("Luuthietlap_template error", error);
    return -1;
  }
}

/**
 * Cập nhật template theo idTemplate.
 */
export async function Capnhatthietlap_template(
  taikhoan: string,
  template: string,
  idTemplate: number,
  tenTLap?: string
): Promise<number> {
  try {
    const ten = (tenTLap || "").trim();
    const response = await soapPost(`
        <Capnhatthietlap_template xmlns="http://tempuri.org/">
          <taikhoan>${taikhoan}</taikhoan>
          <template><![CDATA[${template}]]></template>
          <idTemplate>${idTemplate}</idTemplate>
          <TenTLap>${ten}</TenTLap>
        </Capnhatthietlap_template>
    `);
    return parseIntResult(response.data, "Capnhatthietlap_templateResult");
  } catch (error) {
    console.error("Capnhatthietlap_template error", error);
    return -1;
  }
}

/**
 * Xóa template theo idTemplate.
 */
export async function Xoathietlap_template(
  taikhoan: string,
  idTemplate: number
): Promise<number> {
  try {
    const response = await soapPost(`
        <Xoathietlap_template xmlns="http://tempuri.org/">
          <taikhoan>${taikhoan}</taikhoan>
          <idTemplate>${idTemplate}</idTemplate>
        </Xoathietlap_template>
    `);
    return parseIntResult(response.data, "Xoathietlap_templateResult");
  } catch (error) {
    console.error("Xoathietlap_template error", error);
    return -1;
  }
}

/**
 * Lấy danh sách template thiết lập ký từ dstemplate_thietlap (DataTable).
 */
export async function dstemplate_thietlap(
  taikhoantao?: string
): Promise<TemplateThietLap[]> {
  const email = taikhoantao || Storage.get("email");

  const response = await soapPost(`
        <dstemplate_thietlap xmlns="http://tempuri.org/">
          <taikhoantao>${email}</taikhoantao>
        </dstemplate_thietlap>
    `);

  const dataJson = convertXmlToJson(response.data);
  const body = getSoapBody(dataJson);
  const result =
    body?.dstemplate_thietlapResponse?.dstemplate_thietlapResult;
  const documentElement =
    result?.["diffgr:diffgram"]?.DocumentElement ||
    result?.["diffgr:diffgram"]?.["DocumentElement"];

  if (!documentElement) return [];

  let arrayData =
    documentElement.dsTemplate ||
    documentElement.Table ||
    documentElement.dsThietlap ||
    null;

  if (!arrayData) return [];
  if (!isArray(arrayData)) arrayData = [arrayData];
  return mapTemplateRows(arrayData, email);
}
