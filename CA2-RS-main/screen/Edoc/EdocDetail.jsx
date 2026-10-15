import React, { useCallback, useState } from "react";
import { Alert, ScrollView, Text, TextInput, View } from "react-native";
import * as ImagePicker from "expo-image-picker";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import files from "../../utils/edoc/files";
import session from "../../utils/edoc/session";
import PdfViewer from "../../PDFViewer/components/Pdf";
import { Button, Loading, Screen, colors } from "./ui";

function rejectMessage(code) {
  if (code === 1) return "";
  if (code === -3) return "Không từ chối được tài liệu này.";
  if (code === -2) return "Không có quyền hoặc không thấy tài liệu.";
  if (code === -1) return "Lỗi hệ thống khi từ chối.";
  return "Không từ chối được tài liệu.";
}

export default function EdocDetail({ navigation, route }) {
  const idFile = route.params?.idFile;
  const [rows, setRows] = useState([]);
  const [logRows, setLogRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [reason, setReason] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [detail, logs] = await Promise.all([
        documents.documentDetail(idFile),
        documents.logs(idFile),
      ]);
      setRows(detail);
      setLogRows(logs);
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không mở được tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [idFile]);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const file = rows[0] || {};
  const mine = rows.find(
    (row) => String(row.Taikhoanky || "").toLowerCase() === session.email().toLowerCase()
  );
  const pdfUrl = file.Vitriluu ? files.getFileUrl(file.Vitriluu) : "";

  const sign = async () => {
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
    try {
      await documents.signMobilesign(idFile);
      Alert.alert("Đã ký", "Chữ ký đã được ghép vào tài liệu.");
      load();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không ký được tài liệu.");
    } finally {
      setBusy(false);
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
    try {
      await documents.approveWithImage(idFile, {
        uri: asset.uri,
        name: "chuky.jpg",
        type: asset.mimeType || "image/jpeg",
      });
      Alert.alert("Đã phê duyệt", "Ảnh chữ ký đã được gắn vào tài liệu.");
      load();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không phê duyệt được bằng ảnh.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <Screen title={file.TenVBGoc || "Tài liệu"} onBack={() => navigation.goBack()}>
      {loading ? <Loading /> : (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }}>
          {pdfUrl ? (
            <View style={{ height: 420, backgroundColor: "#fff", borderRadius: 8, overflow: "hidden" }}>
              <PdfViewer
                pdfUri={pdfUrl}
                handleLoadCompelete={() => {}}
                handlePageChanged={() => {}}
              />
            </View>
          ) : null}
          <Text style={{ color: colors.muted }}>
            Người tạo: {file.Taikhoantao || "—"}
            {mine ? ` · Lượt ký của bạn: ${mine.trinhtuky || mine.Trinhtuky || "—"}` : ""}
          </Text>
          {busy ? <Loading /> : null}
          <Button label="Ký mobilesign" onPress={sign} disabled={busy} />
          <Text style={{ color: colors.muted, fontSize: 12 }}>
            Sau khi gửi, hãy xác nhận PIN trên hộp thư ký. Màn này chờ ghép file xong.
          </Text>
          <Button label="Phê duyệt bằng ảnh" tone="ghost" onPress={approve} disabled={busy} />
          <TextInput
            value={reason}
            onChangeText={setReason}
            placeholder="Lý do từ chối"
            style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12 }}
          />
          <Button label="Từ chối" tone="danger" onPress={reject} disabled={busy} />
          <Text style={{ fontWeight: "700", color: colors.text, marginTop: 8 }}>Nhật ký</Text>
          {logRows.length === 0 ? <Text style={{ color: colors.muted }}>Chưa có nhật ký.</Text> : null}
          {logRows.map((row, index) => (
            <View key={String(index)} style={{ backgroundColor: "#fff", borderRadius: 8, padding: 12 }}>
              {Object.entries(row)
                .filter(([, value]) => value != null && typeof value !== "object")
                .map(([key, value]) => (
                  <Text key={key} style={{ color: colors.text }}>
                    {key}: {String(value)}
                  </Text>
                ))}
            </View>
          ))}
        </ScrollView>
      )}
    </Screen>
  );
}
