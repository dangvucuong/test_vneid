const soap = require("./soap");

let current = null;

function email() {
  return String(global.Email || "").trim();
}

function get() {
  return current;
}

async function load(force) {
  const accountEmail = email();
  if (!accountEmail) {
    current = { email: "", exists: false, reason: "no-email" };
    return current;
  }
  if (!force && current && current.email === accountEmail && current.exists) {
    return current;
  }
  const xml = await soap.call("Laythongtintaikhoan", { Email: accountEmail });
  const idTaikhoan = soap.scalar(xml, "idTaikhoan") || soap.scalar(xml, "IdTaikhoan");
  if (!idTaikhoan) {
    current = { email: accountEmail, exists: false, reason: "no-account" };
    return current;
  }
  let methodXml = "";
  try {
    methodXml = await soap.call("Laythietlapphuongthuckysomacdinh", {
      Email: accountEmail,
    });
  } catch (error) {
    methodXml = "";
  }
  current = {
    email: accountEmail,
    exists: true,
    idTaikhoan,
    hoten: soap.scalar(xml, "Hoten"),
    phanloaiTK: soap.scalar(xml, "PhanloaiTK") || "0",
    masothue: soap.scalar(xml, "Masothue"),
    tentochuc: soap.scalar(xml, "Tentochuc"),
    sodienthoai: soap.scalar(xml, "Sodienthoai"),
    cccd: soap.scalar(xml, "CCCDan"),
    phuongThucKy: methodXml ? soap.scalar(methodXml, "Phuongthucky") : "",
    serialNo: methodXml ? soap.scalar(methodXml, "Serialno") : "",
    idcts: methodXml ? soap.scalar(methodXml, "IDCTS") : "",
  };
  return current;
}

function canManage() {
  return String(current?.phanloaiTK) === "1";
}

function usesToken() {
  return String(current?.phuongThucKy) === "2";
}

module.exports = { email, get, load, canManage, usesToken };
