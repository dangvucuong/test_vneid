import React, { useCallback, useState } from "react";
import {
  Alert,
  FlatList,
  Modal,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import documents from "../../utils/edoc/documents";
import { Button, Card, Empty, Loading, Screen, colors } from "./ui";

export default function EdocList({ navigation }) {
  const [tab, setTab] = useState("1");
  const [rows, setRows] = useState([]);
  const [categories, setCategories] = useState([]);
  const [category, setCategory] = useState("");
  const [keyword, setKeyword] = useState("");
  const [loading, setLoading] = useState(true);
  const [assigning, setAssigning] = useState(null);
  const [mailFor, setMailFor] = useState(null);
  const [mail, setMail] = useState("");

  const load = useCallback(async (nextTab) => {
    setLoading(true);
    try {
      const [list, groups] = await Promise.all([
        documents.listDocuments(nextTab || tab),
        documents.categories().catch(() => []),
      ]);
      setRows(list);
      setCategories(groups);
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tải được danh sách tài liệu.");
    } finally {
      setLoading(false);
    }
  }, [tab]);

  React.useEffect(() => {
    load(tab);
  }, [tab]);

  const filtered = rows.filter((row) => {
    const text = `${row.TenVBGoc || ""} ${row.Taikhoantao || ""}`.toLowerCase();
    const matchText = text.includes(keyword.trim().toLowerCase());
    const matchCategory = !category || String(row.MaDM) === String(category);
    return matchText && matchCategory;
  });

  const confirmRemove = (row) => {
    Alert.alert("Xóa tài liệu", row.TenVBGoc || "Tài liệu này", [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const code = await documents.removeDocument(row);
            if (!(code > 0) && code !== 1) {
              Alert.alert("Lỗi", "Không xóa được tài liệu.");
              return;
            }
            load(tab);
          } catch (error) {
            Alert.alert("Lỗi", error?.message || "Không xóa được tài liệu.");
          }
        },
      },
    ]);
  };

  const restore = async (row) => {
    try {
      const code = await documents.restoreDocument(row);
      if (!(code > 0) && code !== 1) {
        Alert.alert("Lỗi", "Không hoàn tác được.");
        return;
      }
      load(tab);
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không hoàn tác được.");
    }
  };

  const assign = async (maDM) => {
    try {
      const code = await documents.assignCategory(maDM, assigning.idFile);
      setAssigning(null);
      if (!(code >= 0)) {
        Alert.alert("Lỗi", "Không gán được danh mục.");
        return;
      }
      load(tab);
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không gán được danh mục.");
    }
  };

  const submitMail = async () => {
    if (!mail.trim()) return;
    try {
      const code = await documents.sendMail(mail.trim(), mailFor?.TenVBGoc);
      setMailFor(null);
      setMail("");
      Alert.alert(code === 1 ? "Đã gửi" : "Lỗi", code === 1 ? "Đã gửi email." : "Không gửi được email.");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không gửi được email.");
    }
  };

  const verify = async (row) => {
    try {
      const result = await documents.verify(row.Vitriluu);
      const text = typeof result === "string" ? result : JSON.stringify(result);
      Alert.alert("Xác thực chữ ký", text.slice(0, 500) || "Không có kết quả.");
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không xác thực được chữ ký.");
    }
  };

  return (
    <Screen title="Danh sách tài liệu" onBack={() => navigation.goBack()}>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 52 }}>
        <View style={{ flexDirection: "row", padding: 10, gap: 8 }}>
          {documents.TABS.map((item) => (
            <TouchableOpacity
              key={item.key}
              onPress={() => setTab(item.key)}
              style={{
                backgroundColor: tab === item.key ? colors.blue : "#fff",
                borderRadius: 16,
                paddingHorizontal: 12,
                paddingVertical: 8,
              }}
            >
              <Text style={{ color: tab === item.key ? "#fff" : colors.text }}>{item.title}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      <View style={{ paddingHorizontal: 16, paddingBottom: 8 }}>
        <TextInput
          value={keyword}
          onChangeText={setKeyword}
          placeholder="Tìm theo tên hoặc email"
          style={{ backgroundColor: "#fff", borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10 }}
        />
      </View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ maxHeight: 44 }}>
        <View style={{ flexDirection: "row", paddingHorizontal: 16, gap: 8 }}>
          <TouchableOpacity onPress={() => setCategory("")}>
            <Text style={{ color: category ? colors.muted : colors.blue }}>Tất cả danh mục</Text>
          </TouchableOpacity>
          {categories.map((item) => (
            <TouchableOpacity key={String(item.MaDM)} onPress={() => setCategory(String(item.MaDM))}>
              <Text style={{ color: String(category) === String(item.MaDM) ? colors.blue : colors.muted }}>
                {item.TenDM}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
      {loading ? (
        <Loading />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => String(item.IDThietlap || item.idFile)}
          style={{ flex: 1 }}
          contentContainerStyle={{ padding: 16 }}
          ListEmptyComponent={<Empty text="Không có tài liệu trong mục này." />}
          refreshing={loading}
          onRefresh={() => load(tab)}
          renderItem={({ item }) => (
            <Card onPress={() => navigation.navigate("EdocDetail", { idFile: item.idFile })}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{item.TenVBGoc || "Tài liệu"}</Text>
              <Text style={{ color: colors.muted, marginTop: 4 }}>
                Tạo: {item.Taikhoantao || "—"} · Ký: {item.Taikhoanky || "—"}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginTop: 10 }}>
                <Button label="Xem" onPress={() => navigation.navigate("EdocDetail", { idFile: item.idFile })} />
                {tab === "6" ? (
                  <Button label="Hoàn tác" tone="ghost" onPress={() => restore(item)} />
                ) : (
                  <Button label="Xóa" tone="danger" onPress={() => confirmRemove(item)} />
                )}
                <Button label="Danh mục" tone="ghost" onPress={() => setAssigning(item)} />
                <Button label="Gửi mail" tone="ghost" onPress={() => { setMailFor(item); setMail(""); }} />
                <Button label="Xác thực" tone="ghost" onPress={() => verify(item)} />
              </View>
            </Card>
          )}
        />
      )}
      <Modal visible={!!assigning} transparent animationType="fade" onRequestClose={() => setAssigning(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}>
          <View style={{ backgroundColor: "#fff", padding: 16, borderTopLeftRadius: 16, borderTopRightRadius: 16, gap: 8 }}>
            <Text style={{ fontWeight: "700", marginBottom: 8 }}>Gán danh mục</Text>
            {categories.map((item) => (
              <Button key={String(item.MaDM)} label={item.TenDM} tone="ghost" onPress={() => assign(item.MaDM)} />
            ))}
            <Button label="Đóng" onPress={() => setAssigning(null)} />
          </View>
        </View>
      </Modal>
      <Modal visible={!!mailFor} transparent animationType="fade" onRequestClose={() => setMailFor(null)}>
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "center", padding: 24 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 12, padding: 16, gap: 10 }}>
            <Text style={{ fontWeight: "700" }}>Gửi email chia sẻ</Text>
            <TextInput
              value={mail}
              onChangeText={setMail}
              placeholder="Email người nhận"
              autoCapitalize="none"
              style={{ borderWidth: 1, borderColor: colors.line, borderRadius: 8, padding: 10 }}
            />
            <Button label="Gửi" onPress={submitMail} />
            <Button label="Đóng" tone="ghost" onPress={() => setMailFor(null)} />
          </View>
        </View>
      </Modal>
    </Screen>
  );
}
