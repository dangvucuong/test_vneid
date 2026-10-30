import forge from "node-forge";

// AES-256 key, 32 bytes. Backend dùng đúng chuỗi hex này khi tạo link.
export const ACTIVATION_KEY_HEX =
  "d3a9ebbcec5ae7c2c1e9c3d22a40c392dc98787b02fd716a8331d731098dc1e6";

const IV_BYTES = 12;
const TAG_BYTES = 16;

function keyBytes() {
  return forge.util.hexToBytes(ACTIVATION_KEY_HEX);
}

function toBase64Url(binary) {
  return forge.util
    .encode64(binary)
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(text) {
  let base64 = String(text).trim().replace(/-/g, "+").replace(/_/g, "/");
  const pad = base64.length % 4;
  if (pad) base64 += "=".repeat(4 - pad);
  return forge.util.decode64(base64);
}

export function encryptActivationCode(plain) {
  const iv = forge.random.getBytesSync(IV_BYTES);
  const cipher = forge.cipher.createCipher("AES-GCM", keyBytes());
  cipher.start({ iv, tagLength: TAG_BYTES * 8 });
  cipher.update(forge.util.createBuffer(forge.util.encodeUtf8(String(plain))));
  if (!cipher.finish()) return "";
  return toBase64Url(iv + cipher.output.getBytes() + cipher.mode.tag.getBytes());
}

export function decryptActivationCode(token) {
  if (!token) return "";
  try {
    const raw = fromBase64Url(token);
    if (raw.length <= IV_BYTES + TAG_BYTES) return "";
    const iv = raw.slice(0, IV_BYTES);
    const tag = raw.slice(raw.length - TAG_BYTES);
    const data = raw.slice(IV_BYTES, raw.length - TAG_BYTES);
    const decipher = forge.cipher.createDecipher("AES-GCM", keyBytes());
    decipher.start({
      iv,
      tag: forge.util.createBuffer(tag),
      tagLength: TAG_BYTES * 8,
    });
    decipher.update(forge.util.createBuffer(data));
    if (!decipher.finish()) return "";
    return forge.util.decodeUtf8(decipher.output.getBytes());
  } catch (error) {
    return "";
  }
}

export function resolveActivationCode(value) {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (/^\d+$/.test(text)) return text;
  const plain = decryptActivationCode(text);
  return /^\d+$/.test(plain) ? plain : "";
}
