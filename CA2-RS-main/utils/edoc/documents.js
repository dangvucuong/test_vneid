const soap = require("./soap");
const files = require("./files");
const session = require("./session");

const TABS = [
  { key: "1", title: "Chờ ký", action: "LayDSVB_Choky", row: "DSVBchoky" },
  { key: "2", title: "Đã nhận", action: "LayDSVBNhan", row: "DSVBnhan" },
  { key: "3", title: "Đã tạo", action: "LayDSVBDatao", row: "DSVBdatao" },
  { key: "4", title: "Đã từ chối", action: "LayDSVB", row: "VB", tieuchi: "4" },
  { key: "6", title: "Thùng rác", action: "LayDSVB", row: "VB", tieuchi: "6" },
  { key: "0", title: "Tất cả", action: "LayDSVB", row: "VB", tieuchi: "0" },
];

function accountEmail() {
  const value = session.email();
  if (!value) throw new Error("Chưa có email đăng nhập CA2.");
  return value;
}

function groupByFile(rows) {
  const map = new Map();
  rows.forEach((row) => {
    const id = String(row.idFile || "");
    if (!id) return;
    if (!map.has(id)) map.set(id, { ...row, signers: [row] });
    else map.get(id).signers.push(row);
  });
  return Array.from(map.values());
}

async function listDocuments(tabKey) {
  const email = accountEmail();
  const tab = TABS.find((item) => item.key === tabKey) || TABS[0];
  const fields = { Email: email };
  if (tab.tieuchi != null) fields.tieuchi = tab.tieuchi;
  const xml = await soap.call(tab.action, fields);
  return groupByFile(soap.rows(xml, tab.action, tab.row));
}

async function categories() {
  const account = await session.load();
  if (!account.idTaikhoan) return [];
  const xml = await soap.call("GetDMTailieu", { idtaikhoan: account.idTaikhoan });
  return soap.rows(xml, "GetDMTailieu", "dsDanhmuc");
}

async function documentDetail(idFile) {
  const xml = await soap.call("LayTTVB", { idFile });
  const rows = soap.rows(xml, "LayTTVB", "VB").map((row) => {
    const original = String(row.Vitriluu || "");
    return {
      ...row,
      VitriluuBandau: original,
      Vitriluu: files.extractFileSourcePath(original),
    };
  });
  return rows;
}

async function logs(idFile) {
  const xml = await soap.call("LaylogVB", { idFile });
  return soap.rows(xml, "LaylogVB", "LogVB");
}

async function removeDocument(row) {
  const xml = await soap.call("XoaVB", {
    idFile: row.idFile,
    Taikhoantao: row.Taikhoantao || "",
    Taikhoanky: row.Taikhoanky || "",
    Taikhoanxoa: accountEmail(),
  });
  return soap.resultNumber(xml, "XoaVB");
}

async function restoreDocument(row) {
  const xml = await soap.call("UndoXoaVB", {
    idFile: row.idFile,
    Taikhoantao: row.Taikhoantao || "",
    Taikhoanky: row.Taikhoanky || "",
    Taikhoanxoa: accountEmail(),
  });
  return soap.resultNumber(xml, "UndoXoaVB");
}

async function assignCategory(maDM, idFile) {
  const xml = await soap.call("GanDMTailieu", {
    Taikhoantao: accountEmail(),
    MaDM: maDM,
    idFile,
  });
  return soap.resultNumber(xml, "GanDMTailieu");
}

async function sendMail(emailNhan, tenVB) {
  const xml = await soap.call(
    "SendMail",
    {
      emailnhan: emailNhan,
      Subject: `Bạn đang được chia sẻ tài liệu ${tenVB || ""}`,
      body: `Bạn được chia sẻ tài liệu ${tenVB || ""}.`,
      CCMail: "",
      tieude: "CA2.SignPlatform",
    },
    { cdata: ["body"] }
  );
  return soap.resultNumber(xml, "SendMail");
}

async function verify(vitriluu) {
  return files.verifySignature(vitriluu);
}

async function rejectDocument(idFile, reason) {
  const xml = await soap.call("TuchoiVB", {
    idFile,
    Nguoithuchien: accountEmail(),
    Lydotuchoi: reason,
  });
  return soap.resultNumber(xml, "TuchoiVB");
}

function signCode(body) {
  if (body && typeof body === "object") {
    return String(body.code || body.Code || "").trim();
  }
  const text = String(body ?? "").trim();
  if (text.startsWith("{")) {
    try {
      const json = JSON.parse(text);
      return String(json.code || json.Code || "").trim();
    } catch (error) {
      return text.replace(/^"|"$/g, "");
    }
  }
  return text.replace(/^"|"$/g, "");
}

function signerRow(rows) {
  const email = accountEmail().toLowerCase();
  return (
    rows.find((row) => String(row.Taikhoanky || "").toLowerCase() === email) ||
    rows[0]
  );
}

async function markSigned(idFile, trinhTuKy, phuongThucKy) {
  const xml = await soap.call("KyVB", {
    idFile,
    Taikhoanky: accountEmail(),
    Phuongthucky: phuongThucKy,
    trinhtuky: trinhTuKy,
  });
  return soap.resultNumber(xml, "KyVB");
}

async function signMobilesign(idFile) {
  const serial = String(global.Serial || "").trim();
  if (!serial) throw new Error("Chưa có serial chứng thư trên máy. Hãy đăng nhập lại CA2.");
  const rows = await documentDetail(idFile);
  const row = signerRow(rows);
  if (!row) throw new Error("Không thấy tài liệu.");
  const setupXml = await soap.call("Laythongtinthietlapky_hash", {
    idFile,
    Taikhoanky: accountEmail(),
    trinhtuky: row.trinhtuky || row.Trinhtuky || "",
  });
  const info = soap.scalar(setupXml, "Info");
  const parts = String(info || "").trim().split(/\s+/).map(Number);
  if (parts.length < 5 || parts.some((item) => Number.isNaN(item))) {
    throw new Error("Tài liệu chưa có vùng ký.");
  }
  const signatureField = soap.scalar(setupXml, "Singnaturefield");
  const keyHeThong = soap.scalar(setupXml, "Keyhethong");
  const sourcePath = row.VitriluuBandau || row.Vitriluu;
  // Tham số taikhoanky là email người ký. Web đang ghép thêm một dấu $ do template.
  const hashed = await files.hashPdf({
    idFile,
    email: accountEmail(),
    serial,
    sourcePath,
    page: parts[4],
    x1: parts[0],
    y1: parts[1],
    x2: parts[2],
    y2: parts[3],
    signatureField,
  });
  const codeBody = await files.requestMobileSign({
    Serial: serial,
    Cleartext: hashed.strhash,
    Linkfile_goc: files.publicFileUrl(row.Vitriluu || sourcePath),
    Email: soap.scalar(setupXml, "Email") || accountEmail(),
    Masothue: "1",
    Mahethong: "1",
    Type: "PDF",
    Keyhethong: keyHeThong,
  });
  const rescode = signCode(codeBody);
  if (!rescode || rescode === "0" || rescode === "-1") {
    throw new Error("Máy chủ không nhận yêu cầu ký.");
  }
  const merged = await files.mergeSignature({
    rescode,
    tempfile: hashed.tempfile,
    serial,
    sourcePath,
    signatureField,
  });
  if (merged === 0 || merged === "0" || merged === -1 || merged === "-1") {
    throw new Error("Không ghép được chữ ký vào file.");
  }
  const marked = await markSigned(idFile, row.trinhtuky || row.Trinhtuky, 1);
  if (!(marked > 0)) {
    throw new Error("Đã ghép chữ ký nhưng chưa cập nhật được trạng thái văn bản.");
  }
  return marked;
}

async function approveWithImage(idFile, image) {
  const rows = await documentDetail(idFile);
  const row = signerRow(rows);
  if (!row) throw new Error("Không thấy tài liệu.");
  const setupXml = await soap.call("Laythongtinthietlapky_hash", {
    idFile,
    Taikhoanky: accountEmail(),
    trinhtuky: row.trinhtuky || row.Trinhtuky || "",
  });
  const info = soap.scalar(setupXml, "Info");
  if (!String(info || "").trim()) throw new Error("Tài liệu chưa có vùng ký.");
  const result = await files.approveImage(
    {
      pdfPath: row.Vitriluu || row.VitriluuBandau,
      idFile,
      email: accountEmail(),
      toado: info,
    },
    image
  );
  if (Number(result) !== 1) throw new Error("Không phê duyệt được bằng ảnh.");
  const marked = await markSigned(idFile, row.trinhtuky || row.Trinhtuky, 0);
  if (!(marked > 0)) throw new Error("Đã gắn ảnh nhưng chưa cập nhật được trạng thái văn bản.");
  return marked;
}

async function contacts() {
  const xml = await soap.call("LayDSDanhba", { Email: accountEmail() });
  return soap.rows(xml, "LayDSDanhba", "DB");
}

async function saveContact(form) {
  const action = form.idDanhba ? "Suadanhba" : "Themmoidanhba";
  const fields = form.idDanhba
    ? {
        idDanhba: form.idDanhba,
        TaikhoanDB: form.email,
        HotenTKDB: form.hoten,
        MasothueTKDB: form.masothue || "",
        SodienthoaiTKDB: form.sodienthoai || "",
        TentochucTKDB: form.tentochuc || "",
      }
    : {
        Taikhoantao: accountEmail(),
        TaikhoanDB: form.email,
        HotenTKDB: form.hoten,
        MasothueTKDB: form.masothue || "",
        SodienthoaiTKDB: form.sodienthoai || "",
        TentochucTKDB: form.tentochuc || "",
      };
  const xml = await soap.call(action, fields);
  return soap.resultNumber(xml, action);
}

async function deleteContact(idDanhba) {
  const xml = await soap.call("Xoadanhba", { idDanhba });
  return soap.resultNumber(xml, "Xoadanhba");
}

async function saveCategory(form) {
  const action = form.maDM ? "SuaDMTailieu" : "ThemmoiDMTailieu";
  const fields = form.maDM
    ? { MaDM: form.maDM, TenDM: form.ten, Ghichu: form.ghichu || "" }
    : {
        idtaikhoan: (await session.load()).idTaikhoan,
        TenDM: form.ten,
        Ghichu: form.ghichu || "",
      };
  const xml = await soap.call(action, fields);
  return soap.resultNumber(xml, action);
}

async function deleteCategory(maDM) {
  const xml = await soap.call("XoaDMTailieu", { MaDM: maDM });
  return soap.resultNumber(xml, "XoaDMTailieu");
}

async function updateProfile(form) {
  const xml = await soap.call("Capnhatthongtintaikhoan", {
    Email: accountEmail(),
    Hoten: form.hoten || "",
    Sodienthoai: form.sodienthoai || "",
    Masothue: form.masothue || "",
    Tentochuc: form.tentochuc || "",
    CCCDan: form.cccd || "",
  });
  const code = soap.resultNumber(xml, "Capnhatthongtintaikhoan");
  if (code === 1) await session.load(true);
  return code;
}

async function setMobileSignDefault() {
  const idcts = String(global.idcts || "").trim();
  if (!idcts) throw new Error("Chưa có idcts của chứng thư đang đăng nhập.");
  const xml = await soap.call("Thietlapphuongthuckymobilesign_IDCTS", {
    taikhoan: accountEmail(),
    idcts,
    macdinh: 1,
  });
  const code = soap.resultNumber(xml, "Thietlapphuongthuckymobilesign_IDCTS");
  if (code === 1) await session.load(true);
  return code;
}

async function createDocument({ file, folder, category, signers }) {
  const email = accountEmail();
  const uploaded = await files.upload(email, folder, file);
  const createdXml = await soap.call("TaoVB", {
    TenVBGoc: file.name || "tai-lieu.pdf",
    Vitriluu: uploaded.vitriluu,
    Taikhoantao: email,
    phanloaivb: category,
    folderthang: folder,
  });
  const idFile = soap.resultNumber(createdXml, "TaoVB");
  if (!(idFile >= 1)) throw new Error("Không tạo được tài liệu.");
  for (let index = 0; index < signers.length; index += 1) {
    const signer = signers[index];
    const setupXml = await soap.call("Thietlaptaikhoanky", {
      idFile,
      Taikhoanky: signer.email,
      Trinhtuky: index + 1,
      Hinhthucky: signer.hinhThuc || 1,
      Taikhoantao: email,
    });
    const setupCode = soap.resultNumber(setupXml, "Thietlaptaikhoanky");
    if (setupCode < 0) {
      throw new Error(
        setupCode === -2
          ? `${signer.email} đã có trình tự ký khác.`
          : "Không gán được người ký."
      );
    }
    const regionXml = await soap.call("Thietlapvungky", {
      idFile,
      Taikhoanky: signer.email,
      Trinhtuky: index + 1,
      Hinhthucky: signer.hinhThuc || 1,
      Trangky: signer.page || String(signer.info || "").trim().split(/\s+/).pop() || "1",
      info: signer.info,
      Toadocuoi: "",
      Mamauvungky: "",
      Taikhoantao: email,
    });
    const regionCode = soap.resultNumber(regionXml, "Thietlapvungky");
    if (!(regionCode >= 0)) throw new Error(`Không lưu được vùng ký của ${signer.email}.`);
  }
  const sentXml = await soap.call("GuiVB", {
    idFile,
    taikhoanthuchien: email,
  });
  const sent = soap.resultNumber(sentXml, "GuiVB");
  if (sent < 0) throw new Error("Đã tạo tài liệu nhưng chưa gửi được.");
  return idFile;
}

module.exports = {
  TABS,
  listDocuments,
  categories,
  documentDetail,
  logs,
  removeDocument,
  restoreDocument,
  assignCategory,
  sendMail,
  verify,
  rejectDocument,
  signMobilesign,
  approveWithImage,
  contacts,
  saveContact,
  deleteContact,
  saveCategory,
  deleteCategory,
  updateProfile,
  setMobileSignDefault,
  createDocument,
};
