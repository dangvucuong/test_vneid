const { XMLParser } = require("fast-xml-parser");

const SOAP_URL = "https://apiedoc.nacencomm.vn/apiEdoc.asmx";
const TEMPLATE_URL = "https://apiedoc.nacencomm.vn/apiThietlaptemplate.asmx";

const parser = new XMLParser({
  ignoreAttributes: false,
  removeNSPrefix: true,
  trimValues: true,
});

function escapeXml(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function envelope(action, fields, cdataKeys) {
  const cdata = new Set(cdataKeys || []);
  const inner = Object.entries(fields || {})
    .map(([key, value]) => {
      if (cdata.has(key)) {
        const safe = String(value ?? "").replace(/]]>/g, "]]]]><![CDATA[>");
        return `<${key}><![CDATA[${safe}]]></${key}>`;
      }
      return `<${key}>${escapeXml(value)}</${key}>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="utf-8"?>
<soap12:Envelope xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance" xmlns:xsd="http://www.w3.org/2001/XMLSchema" xmlns:soap12="http://www.w3.org/2003/05/soap-envelope">
  <soap12:Body>
    <${action} xmlns="http://tempuri.org/">${inner}</${action}>
  </soap12:Body>
</soap12:Envelope>`;
}

function parse(xml) {
  return parser.parse(String(xml || ""));
}

function soapBody(parsed) {
  const env = parsed?.Envelope || {};
  return env.Body || {};
}

function findTag(node, tag) {
  if (!node || typeof node !== "object") return undefined;
  if (Object.prototype.hasOwnProperty.call(node, tag)) return node[tag];
  for (const value of Object.values(node)) {
    if (value && typeof value === "object") {
      const found = findTag(value, tag);
      if (found !== undefined) return found;
    }
  }
  return undefined;
}

function textOf(value) {
  if (value == null) return "";
  if (typeof value === "object") {
    if (value["#text"] != null) return String(value["#text"]);
    return "";
  }
  return String(value);
}

function flatten(value) {
  if (Array.isArray(value)) return value.map(flatten);
  if (value && typeof value === "object") {
    const keys = Object.keys(value);
    if (
      value["#text"] != null &&
      keys.every((key) => key === "#text" || key.startsWith("@_"))
    ) {
      return String(value["#text"]);
    }
    const out = {};
    keys.forEach((key) => {
      if (key.startsWith("@_")) return;
      out[key] = flatten(value[key]);
    });
    return out;
  }
  return value;
}

function scalar(xml, tag) {
  const parsed = typeof xml === "string" ? parse(xml) : xml;
  return textOf(findTag(parsed, tag));
}

function rows(xml, action, rowName) {
  const parsed = typeof xml === "string" ? parse(xml) : xml;
  const body = soapBody(parsed);
  const fault = body.Fault;
  if (fault) {
    throw new Error(textOf(fault.Reason?.Text || fault.faultstring) || `SOAP ${action} lỗi`);
  }
  const result = body[`${action}Response`]?.[`${action}Result`];
  if (result == null || typeof result !== "object") return [];
  const diff = result.diffgram || {};
  const doc = diff.DocumentElement || diff.NewDataSet || {};
  let data = rowName ? doc[rowName] : null;
  if (!data) {
    const keys = Object.keys(doc).filter((key) => !key.startsWith("@_"));
    if (keys.length === 1) data = doc[keys[0]];
  }
  if (!data) return [];
  const list = Array.isArray(data) ? data : [data];
  return list.map((row) => flatten(row));
}

async function call(action, fields, options = {}) {
  const url = options.url || SOAP_URL;
  const xml = envelope(action, fields, options.cdata);
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), options.timeout || 60000);
  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/soap+xml;charset=UTF-8" },
      body: xml,
      signal: controller.signal,
    });
    const text = await response.text();
    if (!response.ok && text.indexOf("Envelope") < 0) {
      throw new Error(`SOAP ${action} HTTP ${response.status}`);
    }
    const parsed = parse(text);
    const fault = soapBody(parsed).Fault;
    if (fault) {
      throw new Error(
        textOf(fault.Reason?.Text || fault.faultstring) || `SOAP ${action} lỗi`
      );
    }
    return text;
  } catch (error) {
    if (error?.name === "AbortError") {
      throw new Error(`SOAP ${action} quá thời gian chờ`);
    }
    throw error;
  } finally {
    clearTimeout(timeout);
  }
}

function resultNumber(xml, action) {
  const value = Number(scalar(xml, `${action}Result`));
  return Number.isFinite(value) ? value : NaN;
}

module.exports = {
  SOAP_URL,
  TEMPLATE_URL,
  call,
  parse,
  scalar,
  rows,
  resultNumber,
};
