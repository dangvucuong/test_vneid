import React, { useCallback, useState } from "react";
import { Alert, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import { Button, Card, Empty, Field, FormScroll, Loading, Screen, colors } from "./ui";

const empty = { maDM: "", ten: "", ghichu: "" };

export default function EdocDanhMuc({ navigation }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await documents.categories());
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tải được danh mục.");
    } finally {
      setLoading(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      load();
    }, [load])
  );

  const save = async () => {
    if (!form.ten.trim()) return Alert.alert("Thiếu tên", "Nhập tên danh mục.");
    try {
      const code = await documents.saveCategory(form);
      if (code < 0) return Alert.alert("Lỗi", "Không lưu được danh mục.");
      setForm(empty);
      load();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không lưu được danh mục.");
    }
  };

  const remove = (row) => {
    Alert.alert("Xóa danh mục", row.TenDM, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            const code = await documents.deleteCategory(row.MaDM);
            if (code < 0) return Alert.alert("Lỗi", "Không xóa được danh mục.");
            load();
          } catch (error) {
            Alert.alert("Lỗi", error?.message || "Không xóa được danh mục.");
          }
        },
      },
    ]);
  };

  return (
    <Screen title="Danh mục" onBack={() => navigation.goBack()}>
      {loading ? <Loading /> : (
        <FormScroll>
          {rows.length === 0 ? <Empty text="Chưa có danh mục." /> : null}
          {rows.map((row) => (
            <Card key={String(row.MaDM)}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{row.TenDM}</Text>
              <Text style={{ color: colors.muted }}>{row.Ghichu || ""}</Text>
              <Button label="Sửa" tone="ghost" onPress={() => setForm({ maDM: row.MaDM, ten: row.TenDM || "", ghichu: row.Ghichu || "" })} />
              <Button label="Xóa" tone="danger" onPress={() => remove(row)} />
            </Card>
          ))}
          <Field label="Tên danh mục" value={form.ten} onChangeText={(ten) => setForm({ ...form, ten })} />
          <Field label="Ghi chú" value={form.ghichu} onChangeText={(ghichu) => setForm({ ...form, ghichu })} />
          <Button label={form.maDM ? "Cập nhật" : "Thêm danh mục"} onPress={save} />
        </FormScroll>
      )}
    </Screen>
  );
}
