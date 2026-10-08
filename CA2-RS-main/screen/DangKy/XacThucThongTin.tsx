import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Image,
  Linking,
} from "react-native";
import { useLanguage } from "../../utils/i18n/LanguageContext";
import { StackNavigationProp } from "@react-navigation/stack";

type Props = {
  navigation: StackNavigationProp<any>; // Định nghĩa kiểu cho navigation
};
export default function XacThucThongTin({ navigation, route }: any) {
  const { i18n } = useLanguage(); // Lấy i18n từ context
  const { onComplete } = route.params;

  const completeStep2 = (finalData: any) => {
    onComplete({ id: "2" }, { xacthucthongtin: { finalData } });
    navigation.navigate({
      name: "DangKyHuongDan",
      params: {
        registrationContact: finalData.contactInfo,
        registrationStep: "2",
      },
      merge: true,
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../img/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>
          {i18n.t("xac_thuc_thong_tin.title")}
        </Text>
      </View>

      {/* Content */}
      <ScrollView contentContainerStyle={styles.content}>
        {/* Title */}
        <Text style={styles.title}>
          {i18n.t("xac_thuc_thong_tin.hinh_thuc_xac_thuc")}
        </Text>
        <Text style={styles.subtitle}>
          {i18n.t("xac_thuc_thong_tin.chon_hinh_thuc")}
        </Text>

        {/* Options */}
        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            navigation.navigate("CCCDScanScreen", {
              onComplete: () =>
                navigation.navigate("ThongTinCCCDGanChip", {
                  onComplete: (finalData: any) => {
                    console.log(finalData);
                    completeStep2(finalData);
                  },
                }),
            })
          } 
        >
          <Image
            source={require("../../img/card.png")}
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              {i18n.t("xac_thuc_thong_tin.cccd_gan_chip")}
            </Text>
            <Text style={styles.optionSubtitle}>
              {i18n.t("xac_thuc_thong_tin.xac_thuc_ekyc_okr")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          onPress={() =>
            navigation.navigate("ScanOCR", {
              onComplete: (qrData: any) =>
                navigation.navigate("OCRData", {
                  qrData,
                  onComplete: (finalData: any) => {
                    console.log(finalData);
                    completeStep2(finalData);
                  },
                }),
            })
          }
        >
          <Image
            source={require("../../img/IdentificationCardBlue.png")}
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              {i18n.t("xac_thuc_thong_tin.cccd_thuong")}
            </Text>
            <Text style={styles.optionSubtitle}>
              {i18n.t("xac_thuc_thong_tin.xac_thuc_okr")}
            </Text>
          </View>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.option}
          //onPress={openUniversalLink}
          onPress={() =>
            navigation.navigate("VneidForm", {
              onComplete: (vneidData) =>
                navigation.navigate("VneidData", {
                  vneidData,
                  onComplete: (finalData: any) => {
                    console.log(finalData);
                    completeStep2(finalData);
                  },
                }),
            })
          } 
        >
          <Image
            source={require("../../img/IdentificationCardBlue.png")}
            style={styles.optionIcon}
          />
          <View style={styles.optionTextContainer}>
            <Text style={styles.optionTitle}>
              {i18n.t("xac_thuc_thong_tin.su_dung_vneid")}
            </Text>
            <Text style={styles.optionSubtitle}>
              {i18n.t("xac_thuc_thong_tin.tai_khoan_dinh_danh")}
            </Text>
          </View>
        </TouchableOpacity>

        {/* Notes */}
        <View style={styles.note}>
          {/* Note Title */}
          <View style={styles.noteTitleContainer}>
            <Image
              source={require("../../img/WarningIcon.png")} // Ảnh cho tiêu đề "Lưu ý"
              style={styles.noteTitleIcon}
            />
            <Text style={styles.noteTitle}>
              {i18n.t("xac_thuc_thong_tin.luu_y")}
            </Text>
          </View>

          <View style={styles.noteItem}>
            <Image
              source={require("../../img/CheckCircleNoneBg.png")} // Thay icon bằng ảnh
              style={styles.noteIcon}
            />
            <Text style={styles.noteText}>
              {i18n.t("xac_thuc_thong_tin.cho_phep_xu_ly_du_lieu")}
            </Text>
          </View>

          <View style={styles.noteItem}>
            <Image
              source={require("../../img/CheckCircleNoneBg.png")} // Thay icon bằng ảnh
              style={styles.noteIcon}
            />
            <Text style={styles.noteText}>
              {i18n.t("xac_thuc_thong_tin.cho_phep_chia_se")}
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  backText: {
    fontSize: 16,
    color: "#007bff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Căn giữa theo chiều ngang
    flex: 1, // Cho phép chiếm toàn bộ không gian còn lại
  },
  content: {
    padding: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#555",
    marginBottom: 16,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    marginBottom: 12,
    backgroundColor: "#f0f0f0",
    borderRadius: 8,
  },
  optionIcon: {
    width: 40,
    height: 40,
    marginRight: 12,
  },
  optionTextContainer: {
    flex: 1,
  },
  optionTitle: {
    fontSize: 16,
    fontWeight: "bold",
  },
  optionSubtitle: {
    fontSize: 14,
    color: "#555",
  },
  note: {
    marginTop: 16,
    padding: 16,
    backgroundColor: "#f9f9f9",
    borderRadius: 8,
  },
  noteTitleContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
  },
  noteTitleIcon: {
    width: 24,
    height: 24,
    marginRight: 8,
  },
  noteTitle: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#333",
  },
  noteItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  noteIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  noteText: {
    fontSize: 14,
    color: "#555",
    flexWrap: "wrap",
    maxWidth: "90%", // Điều chỉnh để phù hợp với bố cục
    lineHeight: 20, // Tăng khoảng cách giữa các dòng để dễ đọc
  },
});
