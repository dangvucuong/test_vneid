const forge = require("node-forge");
const pdfVneId = require("../utils/pdfVneId");

const TIME_STAMP_TOKEN_OID = "1.2.840.113549.1.9.16.2.14";

function fail(message) {
  throw new Error(message);
}

function certificatePem() {
  const keys = forge.pki.rsa.generateKeyPair(1024);
  const cert = forge.pki.createCertificate();
  cert.publicKey = keys.publicKey;
  cert.serialNumber = "01";
  cert.validity.notBefore = new Date();
  cert.validity.notAfter = new Date();
  cert.validity.notAfter.setFullYear(cert.validity.notBefore.getFullYear() + 1);
  const subject = [{ name: "commonName", value: "CA2 TSA test" }];
  cert.setSubject(subject);
  cert.setIssuer(subject);
  cert.sign(keys.privateKey, forge.md.sha256.create());
  return forge.pki.certificateToPem(cert);
}

function preparedPdf() {
  const contents = "0".repeat(16384 * 2);
  const pdf = `%PDF-1.4\n<${contents}>\n%%EOF\n`;
  const placeholderAt = pdf.indexOf("<");
  const placeholderEnd = pdf.indexOf(">");
  return {
    pdf,
    placeholderAt,
    placeholderEnd,
    byteRange: [0, placeholderAt, placeholderEnd + 1, pdf.length - (placeholderEnd + 1)],
  };
}

function pdfText(bytes) {
  let text = "";
  const chunk = 0x2000;
  for (let index = 0; index < bytes.length; index += chunk) {
    text += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
  }
  return text;
}

function derSize(bytes) {
  const marker = bytes.charCodeAt(1);
  if (marker < 0x80) return 2 + marker;
  const count = marker & 0x7f;
  let length = 0;
  for (let index = 0; index < count; index += 1) {
    length = length * 256 + bytes.charCodeAt(2 + index);
  }
  return 2 + count + length;
}

function cmsFromSignedPdf(bytes, prepared) {
  const hex = pdfText(bytes).slice(prepared.placeholderAt + 1, prepared.placeholderEnd);
  const raw = forge.util.hexToBytes(hex);
  return forge.asn1.fromDer(raw.slice(0, derSize(raw)));
}

function signerInfoOf(cms) {
  const signedData = cms.value[1].value[0];
  return signedData.value[signedData.value.length - 1].value[0];
}

function oidOf(node) {
  return forge.asn1.derToOid(node.value);
}

async function main() {
  const prepared = preparedPdf();
  const material = pdfVneId.digestForVneId(prepared, [certificatePem()]);
  const signature = forge.util.encode64(forge.random.getBytesSync(256));
  const plain = pdfVneId.embedVneIdSignature(prepared, material, signature);
  const plainInfo = signerInfoOf(cmsFromSignedPdf(plain, prepared));
  if (plainInfo.value.length !== 6) fail(`CMS không có TSA phải có 6 trường, đang có ${plainInfo.value.length}.`);

  const token = await pdfVneId.requestTimeStampToken(signature);
  const stamped = pdfVneId.embedVneIdSignature(prepared, material, signature, token);
  const stampedHex = pdfText(stamped).slice(prepared.placeholderAt + 1, prepared.placeholderEnd);
  const cmsBytes = derSize(forge.util.hexToBytes(stampedHex));
  if (cmsBytes > 16384) fail(`CMS ${cmsBytes} byte vượt vùng 16384.`);

  const info = signerInfoOf(cmsFromSignedPdf(stamped, prepared));
  if (info.value.length !== 7) fail(`CMS có TSA phải có 7 trường, đang có ${info.value.length}.`);
  const signedAttrs = forge.asn1.toDer(plainInfo.value[3]).getBytes();
  const stampedAttrs = forge.asn1.toDer(info.value[3]).getBytes();
  if (signedAttrs !== stampedAttrs) fail("Thuộc tính đã ký bị đổi sau khi gắn TSA.");
  const embeddedSignature = info.value[5].value;
  if (embeddedSignature !== forge.util.decode64(signature)) fail("Byte chữ ký trong CMS không giữ nguyên.");

  const unsigned = info.value[6];
  if (unsigned.tagClass !== forge.asn1.Class.CONTEXT_SPECIFIC || unsigned.type !== 1) {
    fail("Thiếu unsignedAttrs [1].");
  }
  const attribute = unsigned.value[0];
  if (oidOf(attribute.value[0]) !== TIME_STAMP_TOKEN_OID) fail("OID dấu thời gian sai.");
  const embeddedToken = attribute.value[1].value[0];
  const hashed = forge.md.sha256.create();
  hashed.update(embeddedSignature, "raw");
  const signedData = embeddedToken.value[1].value[0];
  const content = signedData.value[2].value[1].value[0];
  const tst = forge.asn1.fromDer(content.value);
  if (tst.value[2].value[1].value !== hashed.digest().getBytes()) {
    fail("Message imprint không khớp SHA-256 của chữ ký.");
  }
  console.log(`TSA ok, CMS ${cmsBytes} byte, còn ${16384 - cmsBytes} byte trong vùng chữ ký.`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
