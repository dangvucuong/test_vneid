let active = false;
let handler = null;
let captured = false;
let capturedCode = "";
const handledCodes = new Map();

function begin(onPinRequired) {
  active = true;
  captured = false;
  capturedCode = "";
  handler = typeof onPinRequired === "function" ? onPinRequired : null;
}

function end() {
  if (capturedCode) {
    handledCodes.set(capturedCode, Date.now() + 30000);
  }
  active = false;
  captured = false;
  handler = null;
}

function takeNotification(code) {
  const key = String(code || "");
  const seenUntil = handledCodes.get(key);
  if (key && seenUntil && seenUntil > Date.now()) {
    return true;
  }
  if (!active || captured) {
    return false;
  }
  captured = true;
  capturedCode = key;
  if (handler) handler(key);
  return true;
}

module.exports = {
  begin,
  end,
  takeNotification,
};
module.exports.default = module.exports;
