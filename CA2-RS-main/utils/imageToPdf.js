const { PDFDocument } = require("pdf-lib");
const { decode, encode } = require("base-64");

function bytesFromBase64(value) {
  const binary = decode(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index) & 0xff;
  }
  return bytes;
}

function base64FromBytes(bytes) {
  let binary = "";
  const chunk = 0x8000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
  }
  return encode(binary);
}

async function imageUriToPdf(uri, mimeType, fileSystem) {
  const base64 = await fileSystem.readAsStringAsync(uri, {
    encoding: fileSystem.EncodingType.Base64,
  });
  const bytes = bytesFromBase64(base64);
  const pdf = await PDFDocument.create();
  const kind = String(mimeType || uri).toLowerCase();
  let image;
  if (kind.includes("png")) {
    image = await pdf.embedPng(bytes);
  } else {
    try {
      image = await pdf.embedJpg(bytes);
    } catch (error) {
      image = await pdf.embedPng(bytes);
    }
  }
  const maxWidth = 595;
  const scale = image.width > maxWidth ? maxWidth / image.width : 1;
  const width = image.width * scale;
  const height = image.height * scale;
  const page = pdf.addPage([width, height]);
  page.drawImage(image, { x: 0, y: 0, width, height });
  const saved = await pdf.save();
  const output = `${fileSystem.cacheDirectory}ca2-${Date.now()}.pdf`;
  await fileSystem.writeAsStringAsync(output, base64FromBytes(saved), {
    encoding: fileSystem.EncodingType.Base64,
  });
  return output;
}

module.exports = { imageUriToPdf };
module.exports.default = module.exports;
