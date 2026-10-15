import React, { useCallback, useRef, useState } from "react";
import { Alert, Text, View } from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import files from "../../utils/edoc/files";
import draft from "../../utils/edoc/draft";
import templates from "../../utils/edoc/templates";
import session from "../../utils/edoc/session";
import { Button, Field, FormScroll, Loading, Screen, colors } from "./ui";

const emptySigner = () => ({
  email: "",
  hoten: "",
  hinhThuc: 1,
  info: "",
  page: "1",
});

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
    const ready = signers.filter((item) => item.email && item.info);
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

  return (
    <Screen title="Tạo một tài liệu" onBack={() => navigation.goBack()}>
      <FormScroll>
        <Button label={file ? file.name : "Chọn file PDF"} onPress={pickFile} />
        <Text style={{ marginTop: 16, fontWeight: "700", color: colors.text }}>Thư mục</Text>
        <View style={{ gap: 8, marginVertical: 8 }}>
          {folders.map((item) => (
            <Button key={item} label={item} tone={folder === item ? undefined : "ghost"} onPress={() => setFolder(item)} />
          ))}
          {folders.length === 0 ? <Text style={{ color: colors.muted }}>Chưa có thư mục.</Text> : null}
        </View>
        <Text style={{ fontWeight: "700", color: colors.text }}>Danh mục</Text>
        <View style={{ gap: 8, marginVertical: 8 }}>
          {groups.map((item) => (
            <Button
              key={String(item.MaDM)}
              label={item.TenDM}
              tone={String(category) === String(item.MaDM) ? undefined : "ghost"}
              onPress={() => setCategory(String(item.MaDM))}
            />
          ))}
          {groups.length === 0 ? (
            <Text style={{ color: colors.muted }}>Chưa có danh mục. Hãy tạo ở mục Danh mục.</Text>
          ) : null}
        </View>
        {samples.length ? (
          <View style={{ gap: 8, marginBottom: 12 }}>
            <Text style={{ fontWeight: "700", color: colors.text }}>Áp mẫu vùng ký</Text>
            {samples.map((item) => (
              <Button key={String(item.idTemplate || item.ten)} label={item.ten} tone="ghost" onPress={() => applyTemplate(item)} />
            ))}
          </View>
        ) : null}
        <Text style={{ fontWeight: "700", color: colors.text }}>Người ký</Text>
        {signers.map((signer, index) => (
          <View key={String(index)} style={{ backgroundColor: "#fff", borderRadius: 10, padding: 12, marginTop: 10 }}>
            <Text style={{ color: colors.muted, marginBottom: 8 }}>Thứ tự {index + 1}</Text>
            {book.map((contact) => (
              <Button
                key={String(contact.idDanhba || contact.TaikhoanDB)}
                label={contact.HotenTKDB ? `${contact.HotenTKDB} · ${contact.TaikhoanDB}` : contact.TaikhoanDB}
                tone={signer.email === contact.TaikhoanDB ? undefined : "ghost"}
                onPress={() => updateSigner(index, { email: contact.TaikhoanDB, hoten: contact.HotenTKDB || "" })}
              />
            ))}
            <Field label="Hoặc nhập email" value={signer.email} onChangeText={(email) => updateSigner(index, { email })} />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <Button
                  label="Mobilesign"
                  tone={Number(signer.hinhThuc) === 1 ? undefined : "ghost"}
                  onPress={() => updateSigner(index, { hinhThuc: 1 })}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Button
                  label="USB token"
                  tone={Number(signer.hinhThuc) === 2 ? undefined : "ghost"}
                  onPress={() => updateSigner(index, { hinhThuc: 2 })}
                />
              </View>
            </View>
            <Text style={{ color: colors.muted, marginVertical: 8 }}>
              {signer.info ? `Vùng ký: ${signer.info}` : "Chưa khoanh vùng ký."}
            </Text>
            <Button label="Khoanh vùng trên PDF" tone="ghost" onPress={() => pickRegion(index)} />
          </View>
        ))}
        <View style={{ height: 10 }} />
        <Button label="Thêm người ký" tone="ghost" onPress={() => setSigners((current) => [...current, emptySigner()])} />
        <View style={{ height: 16 }} />
        {busy ? <Loading /> : <Button label="Tải lên và gửi" onPress={send} disabled={busy} />}
        <Text style={{ color: colors.muted, marginTop: 8 }}>
          USB token chỉ ký trên web. Người ký chọn token vẫn được ghi nhận, còn máy này ký edoc bằng mobilesign.
        </Text>
      </FormScroll>
    </Screen>
  );
}
