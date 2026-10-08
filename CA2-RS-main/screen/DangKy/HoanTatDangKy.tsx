import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Đa ngôn ngữ context

const HoanTatDangKy = () => {
  const navigation = useNavigation();
  const { i18n } = useLanguage(); // Lấy ngôn ngữ từ context

  // Lấy chiều rộng màn hình
  const screenWidth = Dimensions.get("window").width;

  return (
    <SafeAreaView style={styles.container}>
      {/* Hình ảnh minh họa */}
      <View style={styles.imageContainer}>
        <Image
          source={require("../../img/HoanTatDangKy.png")} //
          style={[styles.image, { width: screenWidth }]} // Đặt chiều rộng gần bằng 80% màn hình
        />
        {/* Nội dung */}
        <Text style={styles.title}>{i18n.t("hoan_tat_dang_ky.title")}</Text>
        <Text style={styles.description}>
          {i18n.t("hoan_tat_dang_ky.description.part1")}
          {global.emailDangKy}
          {i18n.t("hoan_tat_dang_ky.description.part2")}
        </Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <TouchableOpacity
          style={styles.linkButton}
          onPress={() =>
            navigation.navigate("ViewFilePdf", {
              headerTitle: "Đơn đăng ký sử dụng",
              fileUrl: global.linkfiledangky,
            })
          }
        >
          <Text style={styles.linkButtonText}>
            {i18n.t("hoan_tat_dang_ky.view_registration")}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.mainButton}
          onPress={() => navigation.navigate("StartLogin")}
        >
          <Text style={styles.mainButtonText}>
            {i18n.t("hoan_tat_dang_ky.back_to_login")}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    justifyContent: "space-between", // Đẩy các thành phần sang trên/dưới
  },
  imageContainer: {
    alignItems: "center",
    marginTop: 30, // Đẩy ảnh lên phía trên
  },
  image: {
    height: 200, // Đặt chiều cao cố định
    resizeMode: "contain", // Đảm bảo hình ảnh không bị méo
  },
  title: {
    fontSize: 20,
    color: "#000000",
    textAlign: "center",
    fontWeight: "700",
    lineHeight: 28,
    letterSpacing: -0.5,
    marginTop: 40, // Đẩy xuống một ít từ hình ảnh
    marginBottom: 2, // Giảm khoảng cách với description
  },
  description: {
    fontSize: 14,
    color: "#555555",
    textAlign: "center",
    lineHeight: 20,
    marginLeft: 40,
    marginRight: 40,
    marginTop: 10, // Đặt một khoảng cách nhỏ từ title (nếu cần)
    fontWeight: "600",
    letterSpacing: -0.5,
  },
  email: {
    fontWeight: "bold",
    color: "#007AFF",
  },
  footer: {
    marginBottom: 30, // Đẩy footer xuống phía dưới
  },
  linkButton: {
    alignSelf: "center",
    marginBottom: 16,
  },
  linkButtonText: {
    fontSize: 14,
    color: "#007AFF",
    fontWeight: "bold", // Xóa gạch chân bằng cách tăng độ đậm
  },
  mainButton: {
    backgroundColor: "#1858EA",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: "center",
    alignSelf: "center",
    width: "95%",
    height: 44,
  },
  mainButtonText: {
    fontSize: 16,
    color: "#FFFFFF",
    fontWeight: "bold",
  },
});

export default HoanTatDangKy;
