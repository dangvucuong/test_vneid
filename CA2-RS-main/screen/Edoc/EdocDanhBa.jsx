import React, { useCallback, useState } from "react";
import { Alert, Text } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import documents from "../../utils/edoc/documents";
import { Button, Card, Empty, Field, FormScroll, Loading, Screen, colors } from "./ui";

const empty = { idDanhba: "", email: "", hoten: "", masothue: "", sodienthoai: "", tentochuc: "" };

function contactMessage(code) {
  if (code === 1 || code >= 0) return "";
  if (code === -2) return "Thông tin danh bạ đã tồn tại.";
  return "Không lưu được danh bạ.";
}

export default function EdocDanhBa({ navigation }) {
  const [rows, setRows] = useState([]);
  const [form, setForm] = useState(empty);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setRows(await documents.contacts());
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không tải được danh bạ.");
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
    if (!form.email.trim() || !form.hoten.trim()) {
      Alert.alert("Thiếu thông tin", "Nhập email và họ tên.");
      return;
    }
    try {
      const code = await documents.saveContact(form);
      const message = contactMessage(code);
      if (message) return Alert.alert("Lỗi", message);
      setForm(empty);
      load();
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không lưu được danh bạ.");
    }
  };

  const remove = (row) => {
    Alert.alert("Xóa danh bạ", row.TaikhoanDB, [
      { text: "Hủy", style: "cancel" },
      {
        text: "Xóa",
        style: "destructive",
        onPress: async () => {
          try {
            await documents.deleteContact(row.idDanhba);
            load();
          } catch (error) {
            Alert.alert("Lỗi", error?.message || "Không xóa được danh bạ.");
          }
        },
      },
    ]);
  };

  return (
    <Screen title="Danh bạ" onBack={() => navigation.goBack()}>
      {loading ? <Loading /> : (
        <FormScroll>
          {rows.length === 0 ? <Empty text="Chưa có người trong danh bạ." /> : null}
          {rows.map((row) => (
            <Card key={String(row.idDanhba)}>
              <Text style={{ fontWeight: "700", color: colors.text }}>{row.HotenTKDB}</Text>
              <Text style={{ color: colors.muted }}>{row.TaikhoanDB}</Text>
              <Button
                label="Sửa"
                tone="ghost"
                onPress={() =>
                  setForm({
                    idDanhba: row.idDanhba,
                    email: row.TaikhoanDB || "",
                    hoten: row.HotenTKDB || "",
                    masothue: row.MasothueTKDB || "",
                    sodienthoai: row.SodienthoaiTKDB || "",
                    tentochuc: row.TentochucTKDB || "",
                  })
                }
              />
              <Button label="Xóa" tone="danger" onPress={() => remove(row)} />
            </Card>
          ))}
          <Field label="Email" value={form.email} onChangeText={(email) => setForm({ ...form, email })} />
          <Field label="Họ tên" value={form.hoten} onChangeText={(hoten) => setForm({ ...form, hoten })} />
          <Field label="Mã số thuế" value={form.masothue} onChangeText={(masothue) => setForm({ ...form, masothue })} />
          <Field label="Số điện thoại" value={form.sodienthoai} onChangeText={(sodienthoai) => setForm({ ...form, sodienthoai })} />
          <Field label="Tổ chức" value={form.tentochuc} onChangeText={(tentochuc) => setForm({ ...form, tentochuc })} />
          <Button label={form.idDanhba ? "Cập nhật" : "Thêm danh bạ"} onPress={save} />
        </FormScroll>
      )}
    </Screen>
  );
}
