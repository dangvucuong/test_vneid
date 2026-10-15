const soap = require("./soap");
const session = require("./session");

function buildTemplateXml(ownerEmail, rows) {
  const body = (rows || [])
    .filter((row) => row.info)
    .map((row) => {
      const info = String(row.info).trim();
      const parts = info.split(/\s+/);
      const page = row.page || parts[parts.length - 1] || "1";
      return `            <TrinhTuKy>
                <STT>${row.stt}</STT>
                <TKKy>${row.email}</TKKy>
                <Trangky>${page}</Trangky>
                <VTCKy>${info}</VTCKy>
            </TrinhTuKy>`;
    })
    .join("\n");
  return `<ThietlapCKy>
      <DSTTKy TK="${ownerEmail}">
${body}
      </DSTTKy>
</ThietlapCKy>`;
}

function parseTemplateXml(templateXml) {
  const parsed = soap.parse(`<root>${templateXml || ""}</root>`);
  const nodes = [];
  const walk = (node) => {
    if (!node || typeof node !== "object") return;
    if (node.TrinhTuKy) {
      const list = Array.isArray(node.TrinhTuKy) ? node.TrinhTuKy : [node.TrinhTuKy];
      list.forEach((item) => nodes.push(item));
    }
    Object.values(node).forEach((value) => {
      if (value && typeof value === "object") walk(value);
    });
  };
  walk(parsed);
  return nodes.map((node) => ({
    stt: String(node.STT ?? ""),
    email: String(node.TKKy ?? ""),
    page: String(node.Trangky ?? ""),
    info: String(node.VTCKy ?? ""),
  }));
}

function mapRow(row, email, index) {
  const template = String(
    row.template || row.Template || row.NoidungTemplate || row.noidung || ""
  );
  return {
    idTemplate: Number(row.idTemplate || row.IdTemplate || row.IDTemplate) || undefined,
    ten: String(row.TenTLap || row.tenTLap || row.Tentlap || `Mẫu ${index + 1}`),
    template,
    items: parseTemplateXml(template),
    email: String(row.taikhoantao || row.Taikhoantao || email),
  };
}

async function listTemplates() {
  const email = session.email();
  const xml = await soap.call(
    "dstemplate_thietlap",
    { taikhoantao: email },
    { url: soap.TEMPLATE_URL }
  );
  return soap.rows(xml, "dstemplate_thietlap").map((row, index) => mapRow(row, email, index));
}

async function saveTemplate({ idTemplate, ten, rows }) {
  const email = session.email();
  const template = buildTemplateXml(email, rows);
  if (idTemplate) {
    const xml = await soap.call(
      "Capnhatthietlap_template",
      {
        taikhoan: email,
        template,
        idTemplate,
        TenTLap: ten || "",
      },
      { url: soap.TEMPLATE_URL, cdata: ["template"] }
    );
    return soap.resultNumber(xml, "Capnhatthietlap_template");
  }
  const xml = await soap.call(
    "Luuthietlap_template",
    { taikhoan: email, template, TenTLap: ten || "" },
    { url: soap.TEMPLATE_URL, cdata: ["template"] }
  );
  return soap.resultNumber(xml, "Luuthietlap_template");
}

async function deleteTemplate(idTemplate) {
  const xml = await soap.call(
    "Xoathietlap_template",
    { taikhoan: session.email(), idTemplate },
    { url: soap.TEMPLATE_URL }
  );
  return soap.resultNumber(xml, "Xoathietlap_template");
}

module.exports = {
  buildTemplateXml,
  parseTemplateXml,
  listTemplates,
  saveTemplate,
  deleteTemplate,
};
