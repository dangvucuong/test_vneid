import React, { useEffect, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import session from "../../utils/edoc/session";
import documents from "../../utils/edoc/documents";
import templates from "../../utils/edoc/templates";
import { Button, Field, FormScroll, Loading, Screen, colors } from "./ui";

const GATEWAY = "https://gatewayvneid.nacencomm.vn";
const ORIGINATOR = "CA2_SignPlatform";

const profileMessage = (code) => {
  if (code === 1) return "";
  if (code === 0) return "Không thấy tài khoản edoc.";
  if (code === -100) return "Email không hợp lệ.";
  if (code === -2) return "Tài khoản chưa kích hoạt.";
  if (code === -3) return "Tài khoản đang bị khóa.";
  return "Không cập nhật được hồ sơ.";
};

function packCode(pack) {
  return pack.servicePackCode || pack.code || pack.ServicePackCode || "";
}

function packName(pack) {
  return pack.servicePackName || pack.name || pack.tenGoi || packCode(pack);
}

export default function EdocSettings({ navigation }) {
  const [section, setSection] = useState("menu");
  const [account, setAccount] = useState(session.get());
  const [profile, setProfile] = useState({
    hoten: "",
    sodienthoai: "",
    masothue: "",
    tentochuc: "",
    cccd: "",
  });
  const [templateRows, setTemplateRows] = useState([]);
  const [templateForm, setTemplateForm] = useState({ idTemplate: "", ten: "", email: "", info: "" });
  const [providers, setProviders] = useState([]);
  const [provider, setProvider] = useState("");
  const [pack, setPack] = useState("");
  const [vneid, setVneid] = useState({
    fullName: "",
    birthDate: "",
    citizenPid: "",
    phone: "",
    email: "",
  });
  const [statusText, setStatusText] = useState("");
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  useEffect(() => {
    const current = session.get();
    if (!current) return;
    setAccount(current);
    setProfile({
      hoten: current.hoten || "",
      sodienthoai: current.sodienthoai || "",
      masothue: current.masothue || "",
      tentochuc: current.tentochuc || "",
      cccd: current.cccd || "",
    });
    setVneid((form) => ({
      ...form,
      fullName: current.hoten || "",
      citizenPid: current.cccd || "",
      phone: current.sodienthoai || "",
      email: current.email || "",
    }));
  }, []);

  const saveProfile = async () => {
    setBusy(true);
    try {
      const code = await documents.updateProfile(profile);
      const message = profileMessage(code);
      if (message) return Alert.alert("Lỗi", message);
      setAccount(session.get());
      Alert.alert("Đã lưu", "Hồ sơ edoc đã được cập nhật.");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không cập nhật được hồ sơ.");
    } finally {
      setBusy(false);
    }
  };

  const setDefault = async () => {
    setBusy(true);
    try {
      const code = await documents.setMobileSignDefault();
      if (code !== 1) {
        const message =
          code === -2
            ? "Tài khoản chưa được kích hoạt."
            : code === -3
              ? "Mã chứng thư không hợp lệ."
              : code === -4
                ? "Tài khoản không hợp lệ."
                : "Không đặt được mobilesign làm mặc định.";
        return Alert.alert("Lỗi", message);
      }
      setAccount(session.get());
      Alert.alert("Đã đặt", "Mobilesign là phương thức ký mặc định.");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không đặt được phương thức ký.");
    } finally {
      setBusy(false);
    }
  };

  const loadTemplates = async () => {
    setBusy(true);
    try {
      setTemplateRows(await templates.listTemplates());
      setSection("templates");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tải được mẫu vùng ký.");
    } finally {
      setBusy(false);
    }
  };

  const saveTemplate = async () => {
    if (!templateForm.ten.trim() || !templateForm.email.trim() || !templateForm.info.trim()) {
      Alert.alert("Thiếu thông tin", "Nhập tên mẫu, email người ký và vùng ký.");
      return;
    }
    setBusy(true);
    try {
      const code = await templates.saveTemplate({
        idTemplate: templateForm.idTemplate,
        ten: templateForm.ten.trim(),
        rows: [{ stt: 1, email: templateForm.email.trim(), info: templateForm.info.trim() }],
      });
      if (code === -2) return Alert.alert("Đủ mẫu", "Mỗi tài khoản lưu tối đa 5 mẫu.");
      if (code < 0) return Alert.alert("Lỗi", "Không lưu được mẫu.");
      setTemplateForm({ idTemplate: "", ten: "", email: "", info: "" });
      setTemplateRows(await templates.listTemplates());
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không lưu được mẫu.");
    } finally {
      setBusy(false);
    }
  };

  const removeTemplate = async (item) => {
    try {
      const code = await templates.deleteTemplate(item.idTemplate);
      if (code < 0) return Alert.alert("Lỗi", "Không xóa được mẫu.");
      setTemplateRows(await templates.listTemplates());
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không xóa được mẫu.");
    }
  };

  const loadProviders = async () => {
    setBusy(true);
    setStatusText("");
    try {
      const response = await fetch(`${GATEWAY}/api/vneid/providers`);
      const body = await response.json();
      if (String(body?.status) !== "01" && String(body?.status) !== "1") {
        throw new Error(body?.description || "Không lấy được nhà cung cấp.");
      }
      const list = (Array.isArray(body?.data) ? body.data : []).filter((item) => Number(item.status) === 1);
      setProviders(list);
      setSection("vneid");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không kết nối được gateway VNeID.");
    } finally {
      setBusy(false);
    }
  };

  const registerCert = async () => {
    if (!vneid.fullName.trim() || !vneid.birthDate.trim() || !vneid.citizenPid.trim()) {
      Alert.alert("Thiếu thông tin", "Nhập họ tên, ngày sinh DD/MM/YYYY và CCCD.");
      return;
    }
    if (!/^\d{2}\/\d{2}\/\d{4}$/.test(vneid.birthDate.trim())) {
      Alert.alert("Ngày sinh", "Ngày sinh phải theo dạng DD/MM/YYYY.");
      return;
    }
    if (!provider || !pack) {
      Alert.alert("Thiếu gói", "Chọn nhà cung cấp và gói dịch vụ.");
      return;
    }
    setBusy(true);
    setStatusText("");
    try {
      const response = await fetch(`${GATEWAY}/api/vneid/certificates/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userInfo: {
            fullName: vneid.fullName.trim(),
            birthDate: vneid.birthDate.trim(),
            citizenPid: vneid.citizenPid.trim(),
            issuingAuthority: "",
            dateOfIssue: "",
            gender: "",
            phone: vneid.phone.trim(),
            email: vneid.email.trim(),
            nationalityCode: "VN",
            permanentAddress: "",
            permanentVillageText: "",
            permanentCityText: "",
            livingPlaceAddress: "",
            livingPlaceVillageText: "",
            livingPlaceCityText: "",
            idCardExpireDate: "",
          },
          provider,
          servicePackCode: pack,
          originatorCode: ORIGINATOR,
        }),
      });
      const body = await response.json();
      if (String(body?.status) !== "01" && String(body?.status) !== "1") {
        throw new Error(body?.description || "Gateway không nhận yêu cầu đăng ký.");
      }
      const code = String(body?.data?.transactionCode || "");
      const requestId = String(body?.requestId || "");
      if (!code) throw new Error("RSVAN không trả mã giao dịch.");
      setStatusText("Hãy mở VNeID và xác nhận yêu cầu cấp chứng thư.");
      const started = Date.now();
      while (alive.current && Date.now() - started < 120000) {
        await new Promise((resolve) => setTimeout(resolve, 3000));
        if (!alive.current) return;
        const statusResponse = await fetch(
          `${GATEWAY}/api/vneid/certificates/status/${encodeURIComponent(code)}`,
          { headers: requestId ? { "X-Request-Id": requestId } : {} }
        );
        const statusBody = await statusResponse.json();
        const statusCode = Number(statusBody?.data?.statusCode);
        if (statusCode === 2 || Number.isNaN(statusCode)) continue;
        if (statusCode === 0) {
          if (alive.current) {
            setStatusText(`Đăng ký thành công. Số serial: ${statusBody?.data?.serialNumber || "—"}.`);
          }
          return;
        }
        if (statusCode === 3) {
          if (alive.current) {
            setStatusText("Chứng thư đã được tạo nhưng chưa kích hoạt trên VNeID.");
          }
          return;
        }
        throw new Error(statusBody?.data?.resultCode || "Đăng ký chứng thư thất bại.");
      }
      if (alive.current) setStatusText("Hết thời gian chờ xác nhận trên VNeID.");
    } catch (error) {
      if (alive.current) Alert.alert("Lỗi", error?.message || "Không đăng ký được chứng thư.");
    } finally {
      if (alive.current) setBusy(false);
    }
  };

  const selected = providers.find((item) => item.provider === provider);
  const packs = selected?.servicePackList || [];
  const methodText =
    String(account?.phuongThucKy) === "2"
      ? "USB token. Ký token chỉ làm trên web."
      : String(account?.phuongThucKy) === "1"
        ? "Mobilesign"
        : "Chưa thiết lập";

  return (
    <Screen
      title="Cài đặt edoc"
      onBack={() => (section === "menu" ? navigation.goBack() : setSection("menu"))}
    >
      <FormScroll>
        {section === "menu" ? (
          <View style={{ gap: 10 }}>
            <Button label="Hồ sơ" onPress={() => setSection("profile")} />
            <Button label="Phương thức ký" onPress={() => setSection("method")} />
            {String(account?.phanloaiTK) === "1" ? (
              <Button label="Mẫu vùng ký" onPress={loadTemplates} />
            ) : null}
            <Button label="Đăng ký chứng thư VNeID" tone="ghost" onPress={loadProviders} />
          </View>
        ) : null}
        {section === "profile" ? (
          <View>
            <Field label="Họ tên" value={profile.hoten} onChangeText={(hoten) => setProfile({ ...profile, hoten })} />
            <Field label="Số điện thoại" value={profile.sodienthoai} onChangeText={(sodienthoai) => setProfile({ ...profile, sodienthoai })} />
            <Field label="Mã số thuế" value={profile.masothue} onChangeText={(masothue) => setProfile({ ...profile, masothue })} />
            <Field label="Tổ chức" value={profile.tentochuc} onChangeText={(tentochuc) => setProfile({ ...profile, tentochuc })} />
            <Field label="CCCD" value={profile.cccd} onChangeText={(cccd) => setProfile({ ...profile, cccd })} />
            <Button label="Lưu hồ sơ" onPress={saveProfile} disabled={busy} />
          </View>
        ) : null}
        {section === "method" ? (
          <View style={{ gap: 10 }}>
            <Text style={{ color: colors.text }}>Phương thức mặc định: {methodText}</Text>
            <Text style={{ color: colors.muted }}>
              Máy này đặt mobilesign theo chứng thư đang đăng nhập. Không thiết lập USB token trên app.
            </Text>
            <Button label="Đặt mobilesign làm mặc định" onPress={setDefault} disabled={busy} />
          </View>
        ) : null}
        {section === "templates" ? (
          <View style={{ gap: 10 }}>
            {templateRows.map((item) => (
              <View key={String(item.idTemplate || item.ten)} style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12 }}>
                <Text style={{ fontWeight: "700" }}>{item.ten}</Text>
                <Text style={{ color: colors.muted }}>{item.items.map((row) => row.email).join(", ")}</Text>
                <Button
                  label="Sửa"
                  tone="ghost"
                  onPress={() =>
                    setTemplateForm({
                      idTemplate: item.idTemplate,
                      ten: item.ten,
                      email: item.items[0]?.email || "",
                      info: item.items[0]?.info || "",
                    })
                  }
                />
                <Button label="Xóa" tone="danger" onPress={() => removeTemplate(item)} />
              </View>
            ))}
            <Field label="Tên mẫu" value={templateForm.ten} onChangeText={(ten) => setTemplateForm({ ...templateForm, ten })} />
            <Field label="Email người ký" value={templateForm.email} onChangeText={(email) => setTemplateForm({ ...templateForm, email })} />
            <Field
              label="Vùng ký (x1 y1 x2 y2 trang)"
              value={templateForm.info}
              onChangeText={(info) => setTemplateForm({ ...templateForm, info })}
            />
            <Button label={templateForm.idTemplate ? "Cập nhật mẫu" : "Lưu mẫu"} onPress={saveTemplate} disabled={busy} />
          </View>
        ) : null}
        {section === "vneid" ? (
          <View style={{ gap: 8 }}>
            <Field label="Họ tên" value={vneid.fullName} onChangeText={(fullName) => setVneid({ ...vneid, fullName })} />
            <Field label="Ngày sinh DD/MM/YYYY" value={vneid.birthDate} onChangeText={(birthDate) => setVneid({ ...vneid, birthDate })} />
            <Field label="CCCD" value={vneid.citizenPid} onChangeText={(citizenPid) => setVneid({ ...vneid, citizenPid })} />
            <Field label="Số điện thoại" value={vneid.phone} onChangeText={(phone) => setVneid({ ...vneid, phone })} />
            <Field label="Email" value={vneid.email} onChangeText={(email) => setVneid({ ...vneid, email })} />
            <Text style={{ fontWeight: "700", color: colors.text }}>Nhà cung cấp</Text>
            {providers.map((item) => (
              <Button
                key={String(item.provider)}
                label={item.providerName || item.name || item.provider}
                tone={provider === item.provider ? undefined : "ghost"}
                onPress={() => {
                  setProvider(item.provider);
                  setPack("");
                }}
              />
            ))}
            <Text style={{ fontWeight: "700", color: colors.text }}>Gói dịch vụ</Text>
            {packs.map((item) => (
              <Button
                key={packCode(item)}
                label={packName(item)}
                tone={pack === packCode(item) ? undefined : "ghost"}
                onPress={() => setPack(packCode(item))}
              />
            ))}
            <Button label="Gửi đăng ký" onPress={registerCert} disabled={busy} />
            {statusText ? <Text style={{ color: colors.text }}>{statusText}</Text> : null}
          </View>
        ) : null}
        {busy ? <Loading /> : null}
      </FormScroll>
    </Screen>
  );
}
