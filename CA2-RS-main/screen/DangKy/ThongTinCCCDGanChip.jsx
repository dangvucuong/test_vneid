// ThongTinCCCDGanChip.tsx

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  TextInput,
  Button,
  SafeAreaView,
  KeyboardAvoidingView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Settings,
  Platform
} from "react-native";
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Đa ngôn ngữ context
import DeviceInfo from "react-native-device-info"; // Import react-native-device-info
import DefaultPreference from "react-native-default-preference";
import AsyncStorage from "@react-native-async-storage/async-storage";

const REGISTRATION_CONTACT_KEY = "@registration_contact";

const ThongTinCCCDGanChip = ({ navigation, route }) => {
  const { onComplete } = route.params;
  const { i18n } = useLanguage();

  const [deviceInfo, setDeviceInfo] = useState({
    tenMay: "",
    deviceType: "",
    os: "",
    version: "",
    uuid: "",
  });

  const [contactInfo, setContactInfo] = useState({
    DienThoai: "",
    email: "",
    makd: "", // Mã nhân viên (không bắt buộc)
  });
  const handleSubmit = async () => {
    if (!validateFields()) return;
    const normalizedContact = {
      DienThoai: contactInfo.DienThoai.trim(),
      email: contactInfo.email.trim(),
      makd: contactInfo.makd.trim(),
      TKKinhdoanh: contactInfo.makd.trim(),
    };
    await AsyncStorage.setItem(
      REGISTRATION_CONTACT_KEY,
      JSON.stringify(normalizedContact)
    );
    const finalData = {
      personalInfo,
      deviceInfo,
      contactInfo: normalizedContact,
      type: "EKYC",
    };
    onComplete(finalData);
  };
  // Hàm kiểm tra các trường bắt buộc
  const validateFields = () => {
    // Kiểm tra các trường trong `personalInfo` và `contactInfo`
    const requiredFields = [
      {
        value: contactInfo.DienThoai,
        label: i18n.t("orc_data.contact_info.DienThoai"),
      },
      {
        value: contactInfo.email,
        label: i18n.t("orc_data.contact_info.email"),
      },
    ];

    // Tìm trường bị thiếu
    const missingFields = requiredFields.filter((field) => !field.value.trim());

    if (missingFields.length > 0) {
      // Hiển thị thông báo lỗi nếu có trường thiếu
      Alert.alert(
        i18n.t("orc_data.validation_error_title"),
        `${i18n.t("orc_data.validation_error_message")}: \n${missingFields
          .map((field) => `- ${field.label}`)
          .join("\n")}`
      );
      return false;
    }

    return true;
  };
  function parseBool(val) {
    return val === true || val === "true";
  }

  const formatMrzForDisplay = (mrzRaw) => {
    if (!mrzRaw) return "";
    try {
      const parsed = JSON.parse(mrzRaw);
      const parts = [
        parsed.documentNumber,
        parsed.dateOfBirth,
        parsed.dateOfExpiry,
      ].filter(Boolean);
      return parts.length > 0 ? parts.join(" | ") : mrzRaw;
    } catch {
      return mrzRaw;
    }
  };

  // State để lưu trữ thông tin CCCD gắn chip
  const [personalInfo, setPersonalInfo] = useState({
    hoVaTen: "",
    ngaySinh: "",
    gioiTinh: "",
    quocTich: "",
    maSoCaNhan: "",
    soDienThoai: "",
    email: "",
    mrz: "",
    diaChi: "",
    ngayCap: "",
    tinhTP: "",
    req_id: "",
    isValidIdCard: false,
    faceMatching: false,
    verifyID: false,
  });
  // Lấy thông tin thiết bị
  useEffect(() => {
    const fetchDeviceInfo = async () => {
      setDeviceInfo({
        deviceName: await DeviceInfo.getModel(), // Lấy tên thiết bị
        deviceType: (await DeviceInfo.getBrand()) || "",
        os: await DeviceInfo.getSystemName(),
        version: await DeviceInfo.getSystemVersion(),
        uuid: await DeviceInfo.getUniqueId(),
      });
    };

    fetchDeviceInfo();
  }, []);
  useEffect(() => {
    async function getData () {
    // Lấy các giá trị từ Settings và cập nhật state
    let card_info, MRZ, NFC_read, isValidIdCard, faceMatching, verifyID;

    if (Platform.OS === "ios") {
      MRZ = Settings.get("mrz_key");
      // iOS sử dụng Settings
      card_info = Settings.get("card_info");
      NFC_read = Settings.get("NFC_read");
      isValidIdCard = Settings.get("isValidIdCard");
      faceMatching = Settings.get("faceMatching");
      verifyID = Settings.get("verifyID");
    } else {
      // Android sử dụng DefaultPreference (Promise-based)
      card_info = await DefaultPreference.get("card_info");
      MRZ = await DefaultPreference.get("mrz_key");
      NFC_read = await DefaultPreference.get("NFC_read");
      isValidIdCard = await DefaultPreference.get("isValidIdCard");
      faceMatching = await DefaultPreference.get("faceMatching");
      verifyID = await DefaultPreference.get("verifyID");
    }
    global.mrz = MRZ;
    setPersonalInfo((prevState) => ({
      ...prevState,
      mrz: MRZ,
    }));
    //const card_info = Settings.get("card_info");
    const parsedCardInfo = JSON.parse(card_info);
    setPersonalInfo((prevState) => ({
      ...prevState,
      hoVaTen: parsedCardInfo.fullName,
      diaChi: parsedCardInfo.placeOfResidence,
      maSoCaNhan: parsedCardInfo.eidNumber,
      ngayCap: parsedCardInfo.dateOfIssue,
      noiCap: parsedCardInfo.placeOfOrigin,
      ngaySinh: parsedCardInfo.dateOfBirth,
      gioiTinh: parsedCardInfo.gender,
      quocTich: parsedCardInfo.nationality,
    }));
    global.card_info = card_info;

    const parsedNFCRead = JSON.parse(NFC_read);
    setPersonalInfo((prevState) => ({
      ...prevState,
      tinhTP: parsedNFCRead.province,
      req_id: parsedNFCRead.request_id,
    }));
    global.nfc_read = NFC_read;

    const parsedIsValidIdCard = parseBool(isValidIdCard);
    setPersonalInfo((prevState) => ({
      ...prevState,
      isValidIdCard: parsedIsValidIdCard,
    }));
    global.isValidIdCard = parsedIsValidIdCard;

    const parsedFaceMatching = parseBool(faceMatching);
    setPersonalInfo((prevState) => ({
      ...prevState,
      faceMatching: parsedFaceMatching,
    }));
    global.faceMatching = parsedFaceMatching;

    const parsedVerifyID = parseBool(verifyID);
    setPersonalInfo((prevState) => ({
      ...prevState,
      verifyID: parsedVerifyID,
    }));
    global.verifyID = parsedVerifyID;
  };
  getData();
  }, []);
  return (
    <SafeAreaView style={styles.container}>
      {/* Bọc toàn bộ giao diện với KeyboardAvoidingView */}
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.header}>
            <TouchableOpacity
              onPress={() => navigation.navigate("DangKyHuongDan")}
            >
              <Image
                source={require("../../img/back.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>
              {i18n.t("cccd_gan_chip.thong_tin_cccd_gan_chip")}
            </Text>
          </View>
          <View style={styles.headerGap} />
          {/* Hình ảnh trên CCCD */}
          {/* <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.hinh_anh_tren_cccd")}
            </Text>
            <Image
              source={{ uri: "https://example.com/user-avatar.jpg" }}
              style={styles.avatar}
            />
          </View> */}

          {/* Tình trạng hiệu lực */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.tinh_trang_hieu_luc")}
            </Text>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ket_qua_xac_minh")}:</Text>
              <Text>{i18n.t("cccd_gan_chip.da_xac_thuc")}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Thông tin cá nhân */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.thong_tin_ca_nhan")}
            </Text>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ho_va_ten")}:</Text>
              <Text>{personalInfo.hoVaTen}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ngay_sinh")}:</Text>
              <Text>{personalInfo.ngaySinh}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.gioi_tinh")}:</Text>
              <Text>{personalInfo.gioiTinh}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.quoc_tich")}:</Text>
              <Text>{personalInfo.quocTich}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.dia_chi")}:</Text>
              <Text>{personalInfo.diaChi}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ma_so_ca_nhan")}:</Text>
              <Text>{personalInfo.maSoCaNhan}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Thông tin đăng ký thiết bị di động thuê bao */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t(
                "cccd_gan_chip.thong_tin_dang_ky_thiet_bi_di_dong_thue_bao"
              )}
            </Text>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ten_may")}:</Text>
              <Text>{deviceInfo.deviceName}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.loai_may")}:</Text>
              <Text>{deviceInfo.deviceType}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.he_dieu_hanh")}:</Text>
              <Text>{deviceInfo.os}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.phien_ban")}:</Text>
              <Text>{deviceInfo.version}</Text>
            </View>
            <View style={styles.row}>
              <Text>{i18n.t("cccd_gan_chip.ma_uuid")}:</Text>
              <Text>{deviceInfo.uuid}</Text>
            </View>
          </View>
          <View style={styles.divider} />

          {/* Thông tin liên hệ */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.thong_tin_lien_he")}
            </Text>
            <View style={styles.section}>
              <Text>
                {i18n.t("cccd_gan_chip.so_dien_thoai")}
                <Text style={styles.required}>{" *"}</Text>
              </Text>
              <TextInput
                value={contactInfo.DienThoai}
                keyboardType="phone-pad"
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, DienThoai: text })
                }
                style={styles.input}
              />
            </View>

            <View style={styles.section}>
              <Text>
                {i18n.t("cccd_gan_chip.email")}
                <Text style={styles.required}>{" *"}</Text>
              </Text>
              <TextInput
                style={styles.input}
                value={contactInfo.email}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={(text) =>
                  setContactInfo({ ...contactInfo, email: text })
                }
              />
            </View>
          </View>

          {/* MRZ trên CCCD */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.mrz_tren_cccd")}
            </Text>
            <View style={styles.row}>
              <Text>MRZ:</Text>
              <Text>{formatMrzForDisplay(personalInfo.mrz)}</Text>
            </View>
          </View>

          {/* Mã nhân viên */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("cccd_gan_chip.ma_nhan_vien")}
            </Text>
            <TextInput
              placeholder={i18n.t("cccd_gan_chip.nhap_ma_nhan_vien")}
              style={styles.input}
              value={contactInfo.makd}
              keyboardType="number-pad"
              autoCapitalize="none"
              autoCorrect={false}
              onChangeText={(text) =>
                setContactInfo({ ...contactInfo, makd: text })
              }
            />
          </View>
          {/* Nút Tiếp tục */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
            <Text style={styles.submitButtonText}>
              {i18n.t("cccd_gan_chip.tiep_tuc")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  headerGap: {
    height: 16,
    backgroundColor: "#f0f0f0", // Màu xám nhạt hơn
    marginBottom: 8,
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
  keyboardAvoidingView: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
  },
  section: {
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFFFFF", // Đặt màu nền trắng
  },
  submitButton: {
    backgroundColor: "#0056D2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  required: {
    color: "red", // Dấu * màu đỏ
  },
  divider: {
    height: 1,
    backgroundColor: "#ccc",
    marginVertical: 8,
  },
});

export default ThongTinCCCDGanChip;
