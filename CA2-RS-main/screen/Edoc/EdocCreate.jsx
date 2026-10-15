import React, { useCallback, useRef, useState } from "react";
import { ActivityIndicator, Alert, Text, TouchableOpacity, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import files from "../../utils/edoc/files";
import draft from "../../utils/edoc/draft";
import templates from "../../utils/edoc/templates";
import session from "../../utils/edoc/session";
import { Field, FormScroll, Screen, colors } from "./ui";

const emptySigner = () => ({
  email: "",
  hoten: "",
  hinhThuc: 1,
  info: "",
  page: "1",
});

function Section({ step, title, children }) {
  return (
    <View style={{ marginBottom: 18 }}>
      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
        <View style={{ width: 26, height: 26, borderRadius: 13, backgroundColor: colors.navy, alignItems: "center", justifyContent: "center", marginRight: 8 }}>
          <Text style={{ color: "#fff", fontWeight: "700", fontSize: 13 }}>{step}</Text>
        </View>
        <Text style={{ color: colors.text, fontWeight: "700", fontSize: 16 }}>{title}</Text>
      </View>
      {children}
    </View>
  );
}

function Chip({ label, selected, onPress }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{
        backgroundColor: selected ? colors.navy : "#fff",
        borderColor: selected ? colors.navy : "#D6E2F5",
        borderWidth: 1,
        borderRadius: 999,
        paddingHorizontal: 14,
        paddingVertical: 8,
        marginRight: 8,
        marginBottom: 8,
      }}
    >
      <Text style={{ color: selected ? "#fff" : colors.navy, fontWeight: "600" }} numberOfLines={1}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export default function EdocCreate({ navigation }) {
  const [file, setFile] = useState(null);
  const [folders, setFolders] = useState([]);
  const [folder, setFolder] = useState("");
  const [groups, setGroups] = useState([]);
  const [category, setCategory] = useState("");
  const [book, setBook] = useState([]);
  const [signers, setSigners] = useState([emptySigner()]);
  const [samples, setSamples] = useState([]);
  const [busy, setBusy] = useState(false);
  const signerIndex = useRef(0);

  const load = useCallback(async () => {
    try {
      const email = session.email();
      const [folderList, categoryList, contactList, templateList] = await Promise.all([
        files.getFolders(email),
        documents.categories(),
        documents.contacts(),
        templates.listTemplates().catch(() => []),
      ]);
      setFolders(folderList);
      setGroups(categoryList);
      setBook(contactList);
      setSamples(templateList);
      setFolder((current) => current || String(folderList[0] || ""));
      setCategory((current) => current || String(categoryList[0]?.MaDM || ""));
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tải được thư mục hoặc danh bạ.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      const region = draft.takeRegion();
      if (region?.info) {
        setSigners((current) =>
          current.map((item, index) =>
            index === signerIndex.current ? { ...item, info: region.info, page: String(region.page || item.page) } : item
          )
        );
      }
      load();
    }, [load])
  );

  const pickFile = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
      multiple: false,
    });
    if (result.canceled) return;
    const asset = result.assets[0];
    setFile({ uri: asset.uri, name: asset.name, type: asset.mimeType || "application/pdf" });
  };

  const updateSigner = (index, patch) => {
    setSigners((current) => current.map((item, itemIndex) => (itemIndex === index ? { ...item, ...patch } : item)));
  };

  const pickRegion = async (index) => {
    if (!file?.uri) {
      Alert.alert("Chưa có file", "Hãy chọn PDF trước khi khoanh vùng.");
      return;
    }
    signerIndex.current = index;
    navigation.navigate("PDFViewer", { pdfUri: file.uri, pickEdocRegion: true });
  };

  const applyTemplate = (sample) => {
    const next = (sample.items || []).filter((item) => item.email).map((item) => ({
      email: item.email,
      hoten: "",
      hinhThuc: 1,
      info: item.info,
      page: item.page || "1",
    }));
    if (next.length) setSigners(next);
  };

  const send = async () => {
    if (!file) return Alert.alert("Thiếu file", "Chọn một file PDF.");
    if (!folder) return Alert.alert("Thiếu thư mục", "Chọn thư mục lưu.");
    if (!category) return Alert.alert("Thiếu danh mục", "Hãy tạo danh mục trước khi tạo tài liệu.");
    const ready = signers
      .map((item) => ({ ...item, email: String(item.email || "").trim() }))
      .filter((item) => item.email && item.info);
    if (!ready.length) return Alert.alert("Thiếu người ký", "Chọn người ký và khoanh vùng ký.");
    setBusy(true);
    try {
      const idFile = await documents.createDocument({
        file,
        folder,
        category,
        signers: ready,
      });
      Alert.alert("Đã gửi", `Tài liệu ${idFile} đã được gửi.`);
      navigation.goBack();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tạo được tài liệu.");
    } finally {
      setBusy(false);
    }
  };

  const readyCount = signers.filter((item) => item.email && item.info).length;

  return (
    <Screen
      title="Tạo tài liệu"
      subtitle="Một file PDF, người ký và vùng ký"
      onBack={() => navigation.goBack()}
      footer={(
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 16, backgroundColor: "#fff", borderTopWidth: 1, borderTopColor: "#EEF2F6" }}>
          <TouchableOpacity
            onPress={send}
            disabled={busy}
            style={{
              backgroundColor: colors.blue,
              borderRadius: 14,
              paddingVertical: 14,
              alignItems: "center",
              justifyContent: "center",
              flexDirection: "row",
              opacity: busy ? 0.6 : 1,
            }}
          >
            {busy ? <ActivityIndicator color="#fff" style={{ marginRight: 8 }} /> : (
              <Ionicons name="send" size={16} color="#fff" style={{ marginRight: 8 }} />
            )}
            <Text style={{ color: "#fff", fontWeight: "700", fontSize: 16 }}>
              {busy ? "Đang gửi..." : "Gửi tài liệu"}
            </Text>
          </TouchableOpacity>
          <Text style={{ color: colors.muted, textAlign: "center", marginTop: 8, fontSize: 12 }}>
            {readyCount ? `${readyCount} người ký đã đủ thông tin` : "Cần file, danh mục, email và vùng ký"}
          </Text>
        </View>
      )}
    >
      <FormScroll>
        <Section step="1" title="Tệp PDF">
          <TouchableOpacity
            onPress={pickFile}
            style={{
              backgroundColor: "#fff",
              borderRadius: 16,
              borderWidth: 1,
              borderColor: file ? "#B7E4C7" : "#D6E2F5",
              borderStyle: file ? "solid" : "dashed",
              padding: 16,
              flexDirection: "row",
              alignItems: "center",
            }}
          >
            <View style={{ width: 44, height: 44, borderRadius: 12, backgroundColor: file ? "#ECFDF3" : colors.blueSoft, alignItems: "center", justifyContent: "center", marginRight: 12 }}>
              <Ionicons name={file ? "checkmark-circle" : "document-attach-outline"} size={22} color={file ? colors.ok : colors.blue} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: colors.text, fontWeight: "700" }} numberOfLines={2}>
                {file ? file.name : "Chọn file PDF"}
              </Text>
              <Text style={{ color: colors.muted, marginTop: 2 }}>
                {file ? "Bấm để chọn file khác" : "Chỉ một file, định dạng PDF"}
              </Text>
            </View>
          </TouchableOpacity>
        </Section>

        <Section step="2" title="Nơi lưu">
          <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Thư mục</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {folders.map((item) => (
              <Chip key={item} label={item} selected={folder === item} onPress={() => setFolder(item)} />
            ))}
          </View>
          {folders.length === 0 ? <Text style={{ color: colors.muted }}>Chưa có thư mục.</Text> : null}
          <Text style={{ color: colors.muted, marginTop: 8, marginBottom: 8, fontWeight: "600" }}>Danh mục</Text>
          <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
            {groups.map((item) => (
              <Chip
                key={String(item.MaDM)}
                label={item.TenDM}
                selected={String(category) === String(item.MaDM)}
                onPress={() => setCategory(String(item.MaDM))}
              />
            ))}
          </View>
          {groups.length === 0 ? (
            <Text style={{ color: colors.muted }}>Chưa có danh mục. Hãy tạo ở mục Danh mục.</Text>
          ) : null}
          {samples.length ? (
            <View style={{ marginTop: 8 }}>
              <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Mẫu vùng ký</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                {samples.map((item) => (
                  <Chip key={String(item.idTemplate || item.ten)} label={item.ten} onPress={() => applyTemplate(item)} />
                ))}
              </View>
            </View>
          ) : null}
        </Section>

        <Section step="3" title="Người ký">
          {signers.map((signer, index) => (
            <View key={String(index)} style={{ backgroundColor: "#fff", borderRadius: 16, padding: 14, marginBottom: 12, borderWidth: 1, borderColor: "#EEF2F6" }}>
              <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 10 }}>
                <Text style={{ flex: 1, color: colors.text, fontWeight: "700" }}>Thứ tự {index + 1}</Text>
                {signers.length > 1 ? (
                  <TouchableOpacity onPress={() => setSigners((current) => current.filter((_, itemIndex) => itemIndex !== index))}>
                    <Text style={{ color: colors.danger, fontWeight: "600" }}>Bỏ</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              {book.length ? (
                <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                  {book.map((contact) => (
                    <Chip
                      key={String(contact.idDanhba || contact.TaikhoanDB)}
                      label={contact.HotenTKDB || contact.TaikhoanDB}
                      selected={signer.email === contact.TaikhoanDB}
                      onPress={() => updateSigner(index, { email: contact.TaikhoanDB, hoten: contact.HotenTKDB || "" })}
                    />
                  ))}
                </View>
              ) : null}
              <Field
                label="Email người ký"
                value={signer.email}
                onChangeText={(email) => updateSigner(index, { email })}
                placeholder="ten@email.com"
              />
              <Text style={{ color: colors.muted, marginBottom: 8, fontWeight: "600" }}>Cách ký</Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap" }}>
                <Chip label="Mobilesign" selected={Number(signer.hinhThuc) === 1} onPress={() => updateSigner(index, { hinhThuc: 1 })} />
                <Chip label="USB token" selected={Number(signer.hinhThuc) === 2} onPress={() => updateSigner(index, { hinhThuc: 2 })} />
              </View>
              <Text style={{ color: colors.muted, fontSize: 12, marginBottom: 10 }}>
                USB token chỉ ký trên web. Trên máy này tài liệu được ký bằng mobilesign.
              </Text>
              <View style={{ backgroundColor: signer.info ? "#ECFDF3" : "#F8FAFC", borderRadius: 12, padding: 12 }}>
                <Text style={{ color: signer.info ? colors.ok : colors.muted, fontWeight: "600" }}>
                  {signer.info ? `Đã khoanh vùng · trang ${signer.page || "1"}` : "Chưa khoanh vùng ký"}
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => pickRegion(index)}
                style={{ marginTop: 10, borderRadius: 12, borderWidth: 1, borderColor: "#D6E2F5", paddingVertical: 12, alignItems: "center", flexDirection: "row", justifyContent: "center" }}
              >
                <Ionicons name="crop-outline" size={16} color={colors.blue} style={{ marginRight: 6 }} />
                <Text style={{ color: colors.blue, fontWeight: "700" }}>Khoanh vùng trên PDF</Text>
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            onPress={() => setSigners((current) => [...current, emptySigner()])}
            style={{ borderRadius: 12, borderWidth: 1, borderColor: "#D6E2F5", backgroundColor: "#fff", paddingVertical: 12, alignItems: "center" }}
          >
            <Text style={{ color: colors.blue, fontWeight: "700" }}>Thêm người ký</Text>
          </TouchableOpacity>
        </Section>
      </FormScroll>
    </Screen>
  );
}
