import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import session from "../../utils/edoc/session";
import { Button, Loading, MenuRow, Screen, colors } from "./ui";

export default function EdocGate({ navigation }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");

  const open = useCallback(async () => {
    setError("");
    setAccount(null);
    try {
      setAccount(await session.load(true));
    } catch (err) {
      setError(err?.message || "Không kiểm tra được tài khoản edoc.");
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      open();
    }, [open])
  );

  const manage = String(account?.phanloaiTK) === "1";

  return (
    <Screen title="Tài liệu edoc" subtitle="Ký và theo dõi văn bản bằng email đang đăng nhập" onBack={() => navigation.goBack()}>
      {!account && !error ? <Loading label="Đang kiểm tra tài khoản edoc" /> : null}
      {error ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.text, marginBottom: 12 }}>{error}</Text>
          <Button label="Thử lại" icon="refresh" onPress={open} />
        </View>
      ) : null}
      {account && !account.exists ? (
        <View style={{ padding: 16 }}>
          <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
            {account.reason === "no-email"
              ? "Hãy đăng nhập CA2 trước khi mở tài liệu edoc."
              : `Email ${account.email} chưa có tài khoản edoc. Ứng dụng không tự đăng ký. Hãy tạo tài khoản trên web edoc rồi mở lại.`}
          </Text>
        </View>
      ) : null}
      {account?.exists ? (
        <ScrollView contentContainerStyle={{ padding: 16 }}>
          <View style={{ backgroundColor: "#fff", borderRadius: 16, padding: 16, marginBottom: 14, borderWidth: 1, borderColor: "#EEF2F6" }}>
            <Text style={{ color: colors.muted, fontSize: 12 }}>Đang dùng</Text>
            <Text style={{ color: colors.text, fontWeight: "700", fontSize: 18, marginTop: 4 }}>{account.hoten || account.email}</Text>
            <Text style={{ color: colors.muted, marginTop: 4 }}>{account.email}</Text>
            <Text style={{ color: colors.blue, marginTop: 8, fontWeight: "600" }}>
              {manage ? "Được tạo và ký tài liệu" : "Được xem và ký tài liệu được giao"}
            </Text>
            {String(account.phuongThucKy) === "2" ? (
              <Text style={{ color: colors.text, marginTop: 8, lineHeight: 20 }}>
                Phương thức mặc định đang là USB token. Ký token chỉ làm trên web. Trên máy này tài liệu edoc được ký bằng mobilesign.
              </Text>
            ) : null}
          </View>
          <MenuRow icon="documents-outline" title="Danh sách tài liệu" caption="Chờ ký, đã nhận, đã tạo" onPress={() => navigation.navigate("EdocList")} />
          {manage ? (
            <MenuRow icon="add-circle-outline" title="Tạo một tài liệu" caption="Chọn PDF, người ký và vùng ký" onPress={() => navigation.navigate("EdocCreate")} />
          ) : null}
          {manage ? (
            <MenuRow icon="folder-outline" title="Danh mục" caption="Nhóm tài liệu" onPress={() => navigation.navigate("EdocDanhMuc")} />
          ) : null}
          {manage ? (
            <MenuRow icon="people-outline" title="Danh bạ" caption="Người nhận và người ký" onPress={() => navigation.navigate("EdocDanhBa")} />
          ) : null}
          <MenuRow icon="settings-outline" title="Cài đặt" caption="Hồ sơ, mobilesign, chứng thư VNeID" onPress={() => navigation.navigate("EdocSettings")} />
        </ScrollView>
      ) : null}
    </Screen>
  );
}
