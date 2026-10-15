import React, { useCallback, useState } from "react";
import { ScrollView, Text, View } from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import session from "../../utils/edoc/session";
import { Button, Loading, Screen, colors } from "./ui";

export default function EdocGate({ navigation }) {
  const [account, setAccount] = useState(null);
  const [error, setError] = useState("");

  const open = useCallback(async () => {
    setError("");
    setAccount(null);
    try {
      const loaded = await session.load(true);
      setAccount(loaded);
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
    <Screen title="Tài liệu edoc" onBack={() => navigation.goBack()}>
      {!account && !error ? <Loading /> : null}
      {error ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: colors.text }}>{error}</Text>
          <Button label="Thử lại" onPress={open} />
        </View>
      ) : null}
      {account && !account.exists ? (
        <View style={{ padding: 16, gap: 12 }}>
          <Text style={{ color: colors.text, fontSize: 16, lineHeight: 24 }}>
            {account.reason === "no-email"
              ? "Hãy đăng nhập CA2 trước khi mở tài liệu edoc."
              : `Email ${account.email} chưa có tài khoản edoc. Ứng dụng không tự đăng ký. Hãy tạo tài khoản trên web edoc rồi mở lại.`}
          </Text>
        </View>
      ) : null}
      {account?.exists ? (
        <ScrollView contentContainerStyle={{ padding: 16, gap: 10 }}>
          <Text style={{ color: colors.muted, marginBottom: 6 }}>
            {account.hoten || account.email} ·{" "}
            {manage ? "Tài khoản tạo và ký" : "Tài khoản được giao ký"}
          </Text>
          {String(account.phuongThucKy) === "2" ? (
            <Text style={{ color: colors.text, marginBottom: 8 }}>
              Phương thức mặc định đang là USB token. Ký token chỉ làm trên web. Trên máy này tài liệu edoc được ký bằng mobilesign.
            </Text>
          ) : null}
          <Button label="Danh sách tài liệu" onPress={() => navigation.navigate("EdocList")} />
          {manage ? (
            <Button label="Tạo một tài liệu" onPress={() => navigation.navigate("EdocCreate")} />
          ) : null}
          {manage ? (
            <Button label="Danh mục" onPress={() => navigation.navigate("EdocDanhMuc")} tone="ghost" />
          ) : null}
          {manage ? (
            <Button label="Danh bạ" onPress={() => navigation.navigate("EdocDanhBa")} tone="ghost" />
          ) : null}
          <Button label="Cài đặt edoc" onPress={() => navigation.navigate("EdocSettings")} tone="ghost" />
        </ScrollView>
      ) : null}
    </Screen>
  );
}
