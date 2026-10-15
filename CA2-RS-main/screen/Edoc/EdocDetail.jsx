import React, { useCallback, useEffect, useRef, useState } from "react";
import { Alert, Dimensions, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import files from "../../utils/edoc/files";
import session from "../../utils/edoc/session";
import { getPendingSignList } from "../../utils/apiService";
import PdfViewer from "../../PDFViewer/components/Pdf";
import ModalPinCode from "../component/ModalPinCode";
import { Button, Loading, Screen, StatusBanner, colors } from "./ui";

function rejectMessage(code) {
  if (code === 1) return "";
  if (code === -3) return "Không từ chối được tài liệu này.";
  if (code === -2) return "Không có quyền hoặc không thấy tài liệu.";
  if (code === -1) return "Lỗi hệ thống khi từ chối.";
  return "Không từ chối được tài liệu.";
}

async function accountForSign() {
  const deviceId = global.UUID || (await AsyncStorage.getItem("@devid"));
  const idcts = global.id || global.idcts || (await AsyncStorage.getItem("@idcts"));
  return { deviceId: String(deviceId || ""), idcts: String(idcts || "") };
}

async function resolveSignCode(notifyCode) {
  const { deviceId, idcts } = await accountForSign();
  if (!deviceId || !idcts) return notifyCode && notifyCode !== "1" ? notifyCode : "";
  const load = async () => {
    const list = await getPendingSignList(deviceId, idcts, true);
    if (!Array.isArray(list) || !list.length) return "";
    if (notifyCode && notifyCode !== "1") {
      const found = list.find((item) => String(item?.Code) === notifyCode);
      if (found?.Code) return String(found.Code);
    }
    return String(list[0]?.Code || "");
  };
  try {
    const first = await load();
    if (first) return first;
    await new Promise((resolve) => setTimeout(resolve, 1200));
    return (await load()) || (notifyCode !== "1" ? notifyCode : "");
  } catch (error) {
    return notifyCode && notifyCode !== "1" ? notifyCode : "";
  }
}

export default function EdocDetail({ navigation, route }) {
  const idFile = route.params?.idFile;
  const [rows, setRows] = useState([]);
  const [logRows, setLogRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [status, setStatus] = useState("");
  const [reason, setReason] = useState("");
  const [pdfUri, setPdfUri] = useState("");
  const [pdfError, setPdfError] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [pin, setPin] = useState("");
  const [justSigned, setJustSigned] = useState(false);
  const notifyCode = useRef("");
  const pinWait = useRef(null);
  const pinBusy = useRef(false);
  const pageWidth = Dimensions.get("window").width - 32;

  const loadPdf = useCallback(async (source) => {
    if (!source) {
      setPdfUri("");
      setPdfError("Tài liệu chưa có file PDF.");
      return;
    }
    setPdfError("");
    try {
      setPdfUri(await files.downloadPdf(source));
    } catch (error) {
      setPdfUri("");
      setPdfError(error?.message || "Không tải được file PDF.");
    }
  }, []);

  const load = useCallback(async (options) => {
    if (!options?.quiet) setLoading(true);
    try {
      const [detail, logs] = await Promise.all([
        documents.documentDetail(idFile),
        documents.logs(idFile),
      ]);
      setRows(detail);
      setLogRows(logs);
      const source = detail[0]?.Vitriluu || route.params?.vitriluu || "";
      await loadPdf(source);
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không mở được tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [idFile, loadPdf, route.params?.vitriluu]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const file = rows[0] || {};
  const mine = rows.find(
    (row) => String(row.Taikhoanky || row.taikhoanky || "").trim().toLowerCase() === session.email().trim().toLowerCase()
  );
  const signed = justSigned || String(mine?.Trangthaiky ?? mine?.trangthaiky) === "1";

  const submitPin = useCallback(async (value) => {
    const { deviceId, idcts } = await accountForSign();
    const code = await resolveSignCode(notifyCode.current);
    if (!code || !idcts || !deviceId) {
      setPin("");
      Alert.alert("PIN", "Chưa nhận được mã yêu cầu ký. Hãy đợi một chút rồi nhập lại.");
      return;
    }
    const response = await fetch(
      "https://apisign.nacencomm.vn/api/APISigncore/Ky_Mobilesign?Code=" +
        code +
        "&device_id=" +
        deviceId +
        "&IDCTS=" +
        idcts +
        "&pincode=" +
        value,
      {
        method: "POST",
        headers: { Accept: "application/json", "Content-Type": "application/json" },
        body: JSON.stringify({}),
      }
    );
    const raw = await response.text();
    let parsed = raw;
    try { parsed = JSON.parse(raw); } catch (error) { parsed = raw; }
    const result = Number(parsed);
    if (result === 1) {
      setShowPin(false);
      setPin("");
      pinWait.current?.resolve();
      pinWait.current = null;
      setStatus("Đã xác thực PIN. Đang ghép chữ ký vào tài liệu...");
      return;
    }
    setPin("");
    Alert.alert(
      "PIN",
      result === -3
        ? "Mã PIN không đúng."
        : result === -2
          ? "Mã yêu cầu ký không hợp lệ."
          : result === -4
            ? "Yêu cầu ký đã bị hủy."
            : "Xác thực PIN không thành công."
    );
  }, []);

  useEffect(() => {
    return () => {
      const pending = pinWait.current;
      pinWait.current = null;
      pending?.reject(new Error("Đã rời màn tài liệu."));
    };
  }, []);

  useEffect(() => {
    if (pin.length !== 6 || pinBusy.current || !showPin) return;
    pinBusy.current = true;
    submitPin(pin).finally(() => {
      pinBusy.current = false;
    });
  }, [pin, showPin, submitPin]);

  const sign = async () => {
    if (signed) {
      Alert.alert("Đã ký", "Bạn đã ký tài liệu này.");
      return;
    }
    if (session.usesToken()) {
      const accepted = await new Promise((resolve) => {
        Alert.alert(
          "Ký bằng mobilesign",
          "Ký USB token chỉ thực hiện trên web. Tài liệu này sẽ ký bằng mobilesign với chứng thư đang đăng nhập.",
          [
            { text: "Hủy", style: "cancel", onPress: () => resolve(false) },
            { text: "Ký mobilesign", onPress: () => resolve(true) },
          ]
        );
      });
      if (!accepted) return;
    }
    setBusy(true);
    setStatus("Đang chuẩn bị ký...");
    const pinReady = new Promise((resolve, reject) => {
      pinWait.current = { resolve, reject };
    });
    try {
      await documents.signMobilesign(idFile, {
        onStatus: setStatus,
        onNotifyCode: (code) => {
          if (code) notifyCode.current = String(code);
        },
        onPinRequired: () => setShowPin(true),
        waitForPin: () => {
          setShowPin(true);
          return pinReady;
        },
      });
      setJustSigned(true);
      setStatus("Đang mở tài liệu đã ký...");
      await load({ quiet: true });
      setStatus("");
    } catch (error) {
      setStatus("");
      Alert.alert("Lỗi", error?.message || "Không ký được tài liệu.");
    } finally {
      setBusy(false);
      setShowPin(false);
    }
  };

  const reject = async () => {
    if (!reason.trim()) {
      Alert.alert("Thiếu lý do", "Nhập lý do từ chối.");
      return;
    }
    setBusy(true);
    try {
      const code = await documents.rejectDocument(idFile, reason.trim());
      const message = rejectMessage(code);
      if (message) {
        Alert.alert("Lỗi", message);
        return;
      }
      Alert.alert("Đã từ chối", "Tài liệu đã được từ chối.");
      load();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không từ chối được.");
    } finally {
      setBusy(false);
    }
  };

  const approve = async () => {
    const picked = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 0.8,
    });
    if (picked.canceled) return;
    const asset = picked.assets[0];
    setBusy(true);
    setStatus("Đang gắn ảnh chữ ký...");
    try {
      await documents.approveWithImage(idFile, {
        uri: asset.uri,
        name: "chuky.jpg",
        type: asset.mimeType || "image/jpeg",
      });
      setStatus("");
      Alert.alert("Đã phê duyệt", "Ảnh chữ ký đã được gắn vào tài liệu.");
      load();
    } catch (error) {
      setStatus("");
      Alert.alert("Lỗi", error?.message || "Không phê duyệt được bằng ảnh.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen
      title={file.TenVBGoc || route.params?.title || "Tài liệu"}
      subtitle={file.Taikhoantao ? `Người tạo: ${file.Taikhoantao}` : ""}
      onBack={() => navigation.goBack()}
    >
      {loading ? <Loading label="Đang mở tài liệu" /> : (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }}>
          <View style={{ height: signed ? 560 : 420, backgroundColor: "#fff", borderRadius: 16, overflow: "hidden", borderWidth: 1, borderColor: "#EEF2F6" }}>
            {pdfUri ? (
              <PdfViewer
                key={pdfUri}
                pdfUri={pdfUri}
                containerWidth={pageWidth}
                containerHeight={signed ? 560 : 420}
                handleLoadCompelete={() => setPdfError("")}
                handlePageChanged={() => {}}
                onError={() => setPdfError("Không hiển thị được file PDF.")}
              />
            ) : (
              <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
                <Text style={{ color: colors.muted, textAlign: "center" }}>{pdfError || "Chưa có file để xem."}</Text>
                <View style={{ height: 12 }} />
                <Button label="Tải lại" icon="refresh" compact onPress={() => loadPdf(file.Vitriluu || route.params?.vitriluu)} />
              </View>
            )}
          </View>
          {pdfError && pdfUri ? <Text style={{ color: colors.danger, marginTop: 8 }}>{pdfError}</Text> : null}
          {signed ? (
            <View style={{ flexDirection: "row", alignItems: "center", backgroundColor: "#ECFDF3", borderRadius: 12, padding: 12, marginTop: 12 }}>
              <Text style={{ color: colors.ok, fontWeight: "700" }}>Đã ký</Text>
              <Text style={{ color: colors.ok, marginLeft: 8, flex: 1 }}>Tài liệu bên trên là bản đã ghép chữ ký.</Text>
            </View>
          ) : (
            <Text style={{ color: colors.muted, marginVertical: 12 }}>
              {mine ? `Lượt ký của bạn: ${mine.trinhtuky || mine.Trinhtuky || "—"}` : "Bạn không phải người ký của tài liệu này."}
            </Text>
          )}
          {status ? (
            <View style={{ marginTop: 12 }}>
              <StatusBanner text={status} busy={busy} />
            </View>
          ) : null}
          {signed ? null : (
            <View style={{ marginTop: 12 }}>
              <Button label="Ký mobilesign" icon="create-outline" onPress={sign} disabled={busy} />
              <Button label="Phê duyệt bằng ảnh" icon="image-outline" tone="ghost" onPress={approve} disabled={busy} />
              <TextInput
                value={reason}
                onChangeText={setReason}
                placeholder="Lý do từ chối"
                placeholderTextColor="#98A2B3"
                style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, borderWidth: 1, borderColor: "#E6EAF0", marginBottom: 8 }}
              />
              <Button label="Từ chối" icon="close-circle-outline" tone="danger-ghost" onPress={reject} disabled={busy} />
            </View>
          )}
          <Text style={{ fontWeight: "700", color: colors.text, marginTop: 8, marginBottom: 8 }}>Nhật ký</Text>
          {logRows.length === 0 ? <Text style={{ color: colors.muted }}>Chưa có nhật ký.</Text> : null}
          {logRows.map((row, index) => (
            <View key={String(index)} style={{ backgroundColor: "#fff", borderRadius: 12, padding: 12, marginBottom: 8 }}>
              {Object.entries(row)
                .filter(([, value]) => value != null && typeof value !== "object")
                .slice(0, 4)
                .map(([key, value]) => (
                  <Text key={key} style={{ color: colors.text, marginBottom: 2 }}>
                    {key}: {String(value)}
                  </Text>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
      <ModalPinCode
        value={pin}
        setValue={setPin}
        showPopPin={showPin}
        setShowPopPin={(next) => {
          const visible = typeof next === "boolean" ? next : !showPin;
          setShowPin(visible);
          if (!visible && pinWait.current) {
            const pending = pinWait.current;
            pinWait.current = null;
            setPin("");
            pending.reject(new Error("Đã hủy xác thực PIN."));
          }
        }}
      />
    </Screen>
  );
}
