const forge = require("node-forge");
const { PDFDocument, StandardFonts, rgb } = require("pdf-lib");

const SIGNATURE_BYTES = 16384;
const BYTE_RANGE_PLACEHOLDER = "/ByteRange [0 /********** /********** /**********]";
const SHA256_OID = "2.16.840.1.101.3.4.2.1";
const RSA_OID = "1.2.840.113549.1.1.1";
const DATA_OID = "1.2.840.113549.1.7.1";
const SIGNED_DATA_OID = "1.2.840.113549.1.7.2";
const CONTENT_TYPE_OID = "1.2.840.113549.1.9.3";
const MESSAGE_DIGEST_OID = "1.2.840.113549.1.9.4";
const SIGNING_TIME_OID = "1.2.840.113549.1.9.5";

function latin1FromBytes(bytes) {
  let text = "";
  const chunk = 0x2000;
  for (let index = 0; index < bytes.length; index += chunk) {
    text += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
  }
  return text;
}

function bytesFromLatin1(text) {
  const bytes = new Uint8Array(text.length);
  for (let index = 0; index < text.length; index += 1) {
    bytes[index] = text.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function objectNumber(reference) {
  const match = /^(\d+)\s+\d+\s+R$/.exec(String(reference || "").trim());
  if (!match) {
    throw new Error("Không đọc được số đối tượng PDF.");
  }
  return Number(match[1]);
}

function readTrailer(pdf) {
  const trailerAt = pdf.lastIndexOf("trailer");
  const startxrefAt = pdf.lastIndexOf("startxref");
  const eofAt = pdf.lastIndexOf("%%EOF");
  if (trailerAt < 0 || startxrefAt < 0 || eofAt < 0) {
    throw new Error("PDF không có trailer hợp lệ.");
  }
  const trailer = pdf.slice(trailerAt, startxrefAt);
  const root = /\/Root\s+(\d+\s+\d+\s+R)/.exec(trailer);
  const info = /\/Info\s+(\d+\s+\d+\s+R)/.exec(trailer);
  const size = /\/Size\s+(\d+)/.exec(trailer);
  const xrefPos = parseInt(pdf.slice(startxrefAt + "startxref".length, eofAt).trim(), 10);
  if (!root || !size || Number.isNaN(xrefPos)) {
    throw new Error("Không đọc được catalog của PDF.");
  }
  return {
    root: root[1],
    info: info ? info[1] : "",
    size: Number(size[1]),
    xrefPos,
  };
}

function readXref(pdf, xrefPos) {
  let cursor = xrefPos;
  while (pdf[cursor] === "\n" || pdf[cursor] === "\r" || pdf[cursor] === " ") cursor += 1;
  if (pdf.slice(cursor, cursor + 4) !== "xref") {
    throw new Error("PDF dùng xref nén. Hãy chọn file PDF thường.");
  }
  cursor += 4;
  const offsets = new Map();
  while (cursor < pdf.length) {
    while (pdf[cursor] === "\n" || pdf[cursor] === "\r" || pdf[cursor] === " ") cursor += 1;
    if (pdf.startsWith("trailer", cursor)) break;
    const header = /^(\d+)\s+(\d+)/.exec(pdf.slice(cursor, cursor + 40));
    if (!header) {
      throw new Error("Không đọc được bảng xref.");
    }
    const start = Number(header[1]);
    const count = Number(header[2]);
    cursor += header[0].length;
    if (pdf[cursor] === "\r") cursor += 1;
    if (pdf[cursor] === "\n") cursor += 1;
    for (let index = 0; index < count; index += 1) {
      const entry = pdf.slice(cursor, cursor + 20);
      if (entry.length < 18) {
        throw new Error("Dòng xref không đủ dữ liệu.");
      }
      if (entry[17] === "n") {
        offsets.set(start + index, parseInt(entry.slice(0, 10), 10));
      }
      cursor += 20;
    }
  }
  return offsets;
}

function objectBody(pdf, offset) {
  const slice = pdf.slice(offset);
  const end = slice.indexOf("endobj");
  if (end < 0) {
    throw new Error("Không tìm thấy endobj.");
  }
  const source = slice.slice(0, end);
  const open = source.indexOf("<<");
  const close = source.lastIndexOf(">>");
  if (open < 0 || close < 0) {
    throw new Error("Đối tượng PDF không phải dictionary.");
  }
  return source.slice(open + 2, close);
}

function pageReferences(body) {
  const kids = /\/Kids\s*\[([^\]]+)\]/.exec(body);
  if (!kids) return [];
  const refs = [];
  const pattern = /(\d+)\s+(\d+)\s+R/g;
  let match = pattern.exec(kids[1]);
  while (match) {
    refs.push(`${match[1]} ${match[2]} R`);
    match = pattern.exec(kids[1]);
  }
  return refs;
}

function pageReferenceAt(pdf, offsets, rootRef, pageNumber) {
  const root = objectBody(pdf, offsets.get(objectNumber(rootRef)));
  const pagesMatch = /\/Pages\s+(\d+\s+\d+\s+R)/.exec(root);
  if (!pagesMatch) {
    throw new Error("PDF không có trang.");
  }
  const pages = objectBody(pdf, offsets.get(objectNumber(pagesMatch[1])));
  const refs = pageReferences(pages);
  const chosen = refs[(pageNumber || 1) - 1];
  if (!chosen) {
    throw new Error("Không tìm thấy trang đã khoanh vùng.");
  }
  const body = objectBody(pdf, offsets.get(objectNumber(chosen)));
  if (/\/Type\s*\/Pages\b/.test(body)) {
    const nested = pageReferences(body)[0];
    if (!nested) throw new Error("Không đọc được trang PDF.");
    return nested;
  }
  return chosen;
}

function pdfNumber(value) {
  const number = Number(value);
  if (!Number.isFinite(number)) return "0";
  return number.toFixed(2);
}

function normalizeRect(rect, pageWidth, pageHeight) {
  const width = Math.min(Math.max(Number(rect?.width) || 184, 36), pageWidth);
  const height = Math.min(Math.max(Number(rect?.height) || 54, 20), pageHeight);
  let x = Number(rect?.x);
  let y = Number(rect?.y);
  if (!Number.isFinite(x)) x = 36;
  if (!Number.isFinite(y)) y = 36;
  x = Math.min(Math.max(x, 0), Math.max(pageWidth - width, 0));
  y = Math.min(Math.max(y, 0), Math.max(pageHeight - height, 0));
  return { x, y, width, height };
}

function pdfDate(date) {
  const pad = (value) => String(value).padStart(2, "0");
  const offset = -date.getTimezoneOffset();
  const sign = offset >= 0 ? "+" : "-";
  const absolute = Math.abs(offset);
  return (
    `D:${date.getFullYear()}${pad(date.getMonth() + 1)}${pad(date.getDate())}` +
    `${pad(date.getHours())}${pad(date.getMinutes())}${pad(date.getSeconds())}` +
    `${sign}${pad(Math.floor(absolute / 60))}'${pad(absolute % 60)}'`
  );
}

function addSignaturePlaceholder(pdfBytes, placement = {}) {
  let pdf = latin1FromBytes(pdfBytes);
  if (!pdf.endsWith("\n")) pdf += "\n";

  const trailer = readTrailer(pdf);
  const offsets = readXref(pdf, trailer.xrefPos);
  const rect = placement.rect || { x: 36, y: 36, width: 184, height: 54 };
  const pageRef = pageReferenceAt(pdf, offsets, trailer.root, placement.pageNumber || 1);
  const pageIndex = objectNumber(pageRef);
  const rootIndex = objectNumber(trailer.root);
  const signatureIndex = trailer.size;
  const widgetIndex = trailer.size + 1;
  const formIndex = trailer.size + 2;
  const contents = "0".repeat(SIGNATURE_BYTES * 2);

  const signatureObject =
    `${signatureIndex} 0 obj\n<<\n` +
    `/Type /Sig\n` +
    `/Filter /Adobe.PPKLite\n` +
    `/SubFilter /adbe.pkcs7.detached\n` +
    `${BYTE_RANGE_PLACEHOLDER}\n` +
    `/Contents <${contents}>\n` +
    `/Reason (Ky VNeID tren mobile)\n` +
    `/M (${pdfDate(new Date())})\n` +
    `/Name (VNeID)\n` +
    `>>\nendobj\n`;

  const widgetObject =
    `${widgetIndex} 0 obj\n<<\n` +
    `/Type /Annot\n` +
    `/Subtype /Widget\n` +
    `/FT /Sig\n` +
    `/Rect [${pdfNumber(rect.x)} ${pdfNumber(rect.y)} ${pdfNumber(rect.x + rect.width)} ${pdfNumber(rect.y + rect.height)}]\n` +
    `/V ${signatureIndex} 0 R\n` +
    `/T (Signature1)\n` +
    `/F 4\n` +
    `/P ${pageIndex} 0 R\n` +
    `>>\nendobj\n`;

  const formObject =
    `${formIndex} 0 obj\n<<\n` +
    `/Type /AcroForm\n` +
    `/SigFlags 3\n` +
    `/Fields [${widgetIndex} 0 R]\n` +
    `>>\nendobj\n`;

  const rootBody = objectBody(pdf, offsets.get(rootIndex)).replace(
    /\/AcroForm\s+\d+\s+\d+\s+R/g,
    ""
  );
  const rootObject =
    `${rootIndex} 0 obj\n<<\n${rootBody}\n/AcroForm ${formIndex} 0 R\n>>\nendobj\n`;

  const pageBody = objectBody(pdf, offsets.get(pageIndex));
  const pageWithAnnot = /\/Annots\s*\[/.test(pageBody)
    ? pageBody.replace(/\/Annots\s*\[/, `/Annots [${widgetIndex} 0 R `)
    : `${pageBody}\n/Annots [${widgetIndex} 0 R]`;
  const pageObject = `${pageIndex} 0 obj\n<<\n${pageWithAnnot}\n>>\nendobj\n`;

  const pieces = [pdf];
  let cursor = pdf.length;
  const added = [];
  const pushObject = (index, text) => {
    added.push({ index, offset: cursor });
    pieces.push(text);
    cursor += text.length;
  };
  pushObject(signatureIndex, signatureObject);
  pushObject(widgetIndex, widgetObject);
  pushObject(formIndex, formObject);
  pushObject(rootIndex, rootObject);
  pushObject(pageIndex, pageObject);

  const xrefStart = cursor;
  let xref = "xref\n0 1\n0000000000 65535 f \n";
  added.forEach((item) => {
    xref += `${item.index} 1\n${String(item.offset).padStart(10, "0")} 00000 n \n`;
  });
  xref += "trailer\n<<\n";
  xref += `/Size ${trailer.size + 3}\n`;
  xref += `/Root ${trailer.root}\n`;
  if (trailer.info) xref += `/Info ${trailer.info}\n`;
  xref += `/Prev ${trailer.xrefPos}\n`;
  xref += ">>\n";
  xref += `startxref\n${xrefStart}\n%%EOF\n`;
  pieces.push(xref);
  pdf = pieces.join("");

  const rangeAt = pdf.indexOf(BYTE_RANGE_PLACEHOLDER);
  const contentsAt = pdf.indexOf("/Contents <", rangeAt);
  const placeholderAt = pdf.indexOf("<", contentsAt);
  const placeholderEnd = pdf.indexOf(">", placeholderAt);
  if (rangeAt < 0 || placeholderAt < 0 || placeholderEnd < 0) {
    throw new Error("Không tạo được vùng chữ ký trong PDF.");
  }
  const byteRange = [0, placeholderAt, placeholderEnd + 1, pdf.length - (placeholderEnd + 1)];
  let actualRange = `/ByteRange [${byteRange.join(" ")}]`;
  if (actualRange.length > BYTE_RANGE_PLACEHOLDER.length) {
    throw new Error("File PDF lớn hơn vùng ByteRange dành sẵn.");
  }
  actualRange += " ".repeat(BYTE_RANGE_PLACEHOLDER.length - actualRange.length);
  pdf = pdf.slice(0, rangeAt) + actualRange + pdf.slice(rangeAt + BYTE_RANGE_PLACEHOLDER.length);

  return { pdf, byteRange, placeholderAt, placeholderEnd };
}

async function prepareSignedPdf(pdfBytes, options = {}) {
  const document = await PDFDocument.load(pdfBytes);
  const pageNumber = Math.max(1, Number(options.pageNumber) || 1);
  const page = document.getPages()[pageNumber - 1];
  if (!page) {
    throw new Error("Không tìm thấy trang đã khoanh vùng.");
  }
  const rect = normalizeRect(options.rect, page.getWidth(), page.getHeight());
  const font = await document.embedFont(StandardFonts.Helvetica);
  page.drawRectangle({
    x: rect.x,
    y: rect.y,
    width: rect.width,
    height: rect.height,
    borderWidth: 1.2,
    borderColor: rgb(0.09, 0.35, 0.92),
  });
  if (rect.width > 48 && rect.height > 18) {
    page.drawText("VNeID", {
      x: rect.x + 8,
      y: rect.y + Math.max(6, (rect.height - 12) / 2),
      size: 12,
      font,
      color: rgb(0.09, 0.35, 0.92),
    });
  }
  const saved = await document.save({ useObjectStreams: false });
  return addSignaturePlaceholder(saved, { pageNumber, rect });
}

function hashByteRange(pdf, byteRange) {
  const digest = forge.md.sha256.create();
  digest.update(pdf.slice(byteRange[0], byteRange[1]), "raw");
  digest.update(pdf.slice(byteRange[2], byteRange[2] + byteRange[3]), "raw");
  return digest.digest().getBytes();
}

function cleanCertificate(value) {
  return String(value || "")
    .replace(/-----BEGIN CERTIFICATE-----/g, "")
    .replace(/-----END CERTIFICATE-----/g, "")
    .replace(/\s+/g, "");
}

function loadCertificates(certificateList) {
  return certificateList.filter(Boolean).map((value) => {
    const asn1 = forge.asn1.fromDer(forge.util.decode64(cleanCertificate(value)));
    return {
      asn1,
      cert: forge.pki.certificateFromAsn1(asn1),
    };
  });
}

function derOid(oid) {
  return forge.asn1.create(
    forge.asn1.Class.UNIVERSAL,
    forge.asn1.Type.OID,
    false,
    forge.asn1.oidToDer(oid).getBytes()
  );
}

function algorithmIdentifier(oid) {
  return forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    derOid(oid),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.NULL, false, ""),
  ]);
}

function attribute(oid, value) {
  return forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    derOid(oid),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [value]),
  ]);
}

function utcTime(date) {
  const pad = (value) => String(value).padStart(2, "0");
  return (
    `${String(date.getUTCFullYear()).slice(-2)}${pad(date.getUTCMonth() + 1)}` +
    `${pad(date.getUTCDate())}${pad(date.getUTCHours())}${pad(date.getUTCMinutes())}` +
    `${pad(date.getUTCSeconds())}Z`
  );
}

function compareBinary(left, right) {
  const length = Math.min(left.length, right.length);
  for (let index = 0; index < length; index += 1) {
    const delta = left.charCodeAt(index) - right.charCodeAt(index);
    if (delta !== 0) return delta;
  }
  return left.length - right.length;
}

function signerIdentity(certificate) {
  const tbs = certificate.asn1.value[0].value;
  let index = 0;
  if (tbs[0].tagClass === forge.asn1.Class.CONTEXT_SPECIFIC) index = 1;
  return {
    serial: tbs[index],
    issuer: tbs[index + 2],
  };
}

function authenticatedAttributes(messageDigest, signingTime) {
  const attributes = [
    attribute(
      CONTENT_TYPE_OID,
      derOid(DATA_OID)
    ),
    attribute(
      SIGNING_TIME_OID,
      forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.UTCTIME, false, utcTime(signingTime))
    ),
    attribute(
      MESSAGE_DIGEST_OID,
      forge.asn1.create(
        forge.asn1.Class.UNIVERSAL,
        forge.asn1.Type.OCTETSTRING,
        false,
        messageDigest
      )
    ),
  ].sort((left, right) =>
    compareBinary(forge.asn1.toDer(left).getBytes(), forge.asn1.toDer(right).getBytes())
  );

  const set = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, attributes);
  const der = forge.asn1.toDer(set).getBytes();
  const digest = forge.md.sha256.create();
  digest.update(der, "raw");
  return {
    attributes,
    digestBase64: forge.util.encode64(digest.digest().getBytes()),
  };
}

function digestForVneId(prepared, certificateList) {
  const certificates = loadCertificates(certificateList);
  if (!certificates.length) {
    throw new Error("Chứng thư không có dữ liệu X.509.");
  }
  const signingTime = new Date();
  const attributes = authenticatedAttributes(hashByteRange(prepared.pdf, prepared.byteRange), signingTime);
  return {
    certificates,
    signingTime,
    attributes: attributes.attributes,
    digestValue: attributes.digestBase64,
  };
}

function buildCms(material, signatureBase64) {
  const signature = forge.util.decode64(cleanCertificate(signatureBase64));
  const identity = signerIdentity(material.certificates[0]);
  const signerInfo = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER, false, "\u0001"),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
      identity.issuer,
      identity.serial,
    ]),
    algorithmIdentifier(SHA256_OID),
    forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 0, true, material.attributes),
    algorithmIdentifier(RSA_OID),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.OCTETSTRING, false, signature),
  ]);

  const signedData = forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.INTEGER, false, "\u0001"),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [
      algorithmIdentifier(SHA256_OID),
    ]),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [derOid(DATA_OID)]),
    forge.asn1.create(
      forge.asn1.Class.CONTEXT_SPECIFIC,
      0,
      true,
      material.certificates.map((item) => item.asn1)
    ),
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SET, true, [signerInfo]),
  ]);

  return forge.asn1.toDer(
    forge.asn1.create(forge.asn1.Class.UNIVERSAL, forge.asn1.Type.SEQUENCE, true, [
      derOid(SIGNED_DATA_OID),
      forge.asn1.create(forge.asn1.Class.CONTEXT_SPECIFIC, 0, true, [signedData]),
    ])
  ).getBytes();
}

function embedVneIdSignature(prepared, material, signatureBase64) {
  const cms = forge.util.bytesToHex(buildCms(material, signatureBase64));
  const capacity = prepared.placeholderEnd - prepared.placeholderAt - 1;
  if (cms.length > capacity) {
    throw new Error("Chữ ký dài hơn vùng dành sẵn trong PDF.");
  }
  const padded = cms + "0".repeat(capacity - cms.length);
  const pdf =
    prepared.pdf.slice(0, prepared.placeholderAt + 1) +
    padded +
    prepared.pdf.slice(prepared.placeholderEnd);
  return bytesFromLatin1(pdf);
}

module.exports = {
  prepareSignedPdf,
  digestForVneId,
  embedVneIdSignature,
};
module.exports.default = module.exports;
