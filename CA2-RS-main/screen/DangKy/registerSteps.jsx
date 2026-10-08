import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  SafeAreaView,
  Modal,
  ActivityIndicator,
  Alert,
  Settings,
} from "react-native";
import AppStyle from "../../styles/AppStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KichHoatStyle, StartStyle } from "../../styles";
import { i18n } from "../../utils/i18n";
import a from "@ant-design/react-native/lib/modal/alert";
import DefaultPreference from "react-native-default-preference";

const lang = ["vi", "en"];
const REGISTRATION_CONTACT_KEY = "@registration_contact";

export default function DangKyHuongDan({ navigation, route }) {
  const [loadingVisible, setloadingVisible] = useState(false);
  const [locale, setlocale] = useState("vi");

  const [stepList, setStepList] = useState([
    { id: "1", label: "register.steps.choose_package", status: "not_done" },
    { id: "2", label: "register.steps.validate_info", status: "not_done" },
    { id: "3", label: "register.steps.passport_scan", status: "not_done" },
  ]);

  const [collectedData, setCollectedData] = useState({}); // Store data for API call later

  const mergeContactInfo = (storedContact = {}, incomingContact = {}) => {
    const merged = { ...storedContact };
    Object.entries(incomingContact || {}).forEach(([key, value]) => {
      if (value != null && String(value).trim() !== "") {
        merged[key] = String(value).trim();
      }
    });
    return merged;
  };

  const getRegistrationContact = async (contactInfo = {}) => {
    const storedContactRaw = await AsyncStorage.getItem(REGISTRATION_CONTACT_KEY);
    const storedContact = storedContactRaw ? JSON.parse(storedContactRaw) : {};
    const mergedContact = mergeContactInfo(storedContact, contactInfo);

    const email = (mergedContact.email || mergedContact.Email || "").trim();
    const phone = (mergedContact.DienThoai || "").trim();
    const businessCode = (
      mergedContact.makd ||
      mergedContact.TKKinhdoanh ||
      ""
    ).trim();

    return { email, phone, businessCode, mergedContact };
  };

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "Đóng", onPress: () => console.log("OK Pressed") },
    ]);
  function parseBool(val) {
    return val === true || val === "true";
  }
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);

  useEffect(() => {
    const mergeRegistrationContact = async () => {
      const contactFromRoute = route.params?.registrationContact;
      const storedContactRaw = await AsyncStorage.getItem(REGISTRATION_CONTACT_KEY);
      const storedContact = storedContactRaw ? JSON.parse(storedContactRaw) : {};
      const contactInfo = mergeContactInfo(
        storedContact,
        contactFromRoute || {}
      );

      if (!contactInfo.DienThoai && !contactInfo.email && !contactInfo.makd) {
        return;
      }

      await AsyncStorage.setItem(
        REGISTRATION_CONTACT_KEY,
        JSON.stringify(contactInfo)
      );

      setCollectedData((prevData) => ({
        ...prevData,
        xacthucthongtin: {
          ...prevData.xacthucthongtin,
          finalData: {
            ...(prevData.xacthucthongtin?.finalData || {}),
            contactInfo: {
              ...(prevData.xacthucthongtin?.finalData?.contactInfo || {}),
              ...contactInfo,
            },
          },
        },
      }));

      if (route.params?.registrationStep === "2") {
        setStepList((steps) =>
          steps.map((step) =>
            step.id === "2" ? { ...step, status: "done" } : step
          )
        );
      }

      if (contactFromRoute) {
        navigation.setParams({
          registrationContact: undefined,
          registrationStep: undefined,
        });
      }
    };

    mergeRegistrationContact();
  }, [route.params?.registrationContact, route.params?.registrationStep]);

  const ChangeNgonngu = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [i18n.t("cancel_text"), "Tiếng Việt", "English"],
          cancelButtonIndex: 0,
          userInterfaceStyle: "light",
        },
        async (buttonIndex) => {
          if (buttonIndex === 1) {
            setlocale("vi");
            i18n.locale = "vi";
            await AsyncStorage.setItem("@language", "vi");
          } else if (buttonIndex === 2) {
            setlocale("en");
            i18n.locale = "en";
            await AsyncStorage.setItem("@language", "en");
          }
        }
      );
    } else {
      const nextLng = lang.find((item) => item !== locale);
      setlocale(nextLng);
      i18n.locale = nextLng;
      await AsyncStorage.setItem("@language", nextLng);
    }
  };

  const handleRegisterStep = (stepId) => {
    switch (stepId) {
      case "1":
        navigation.navigate("GoiDichVu", {
          onComplete: (updatedStep, data) => {
            const updatedSteps = stepList.map((step) =>
              step.id === updatedStep.id ? { ...step, status: "done" } : step
            );
            setStepList(updatedSteps);
            setCollectedData((prevData) => ({ ...prevData, ...data }));
          },
        });
        break;
      case "2":
        navigation.navigate("XacThucThongTin", {
          onComplete: (updatedStep, data) => {
            const updatedSteps = stepList.map((step) =>
              step.id === updatedStep.id ? { ...step, status: "done" } : step
            );
            setStepList(updatedSteps);
            setCollectedData((prevData) => ({ ...prevData, ...data }));
          },
        });
        break;
      case "3":
        navigation.navigate("ChupAnhCCCD", {
          onComplete: async (updatedStep, data) => {
            const updatedSteps = stepList.map((step) =>
              step.id === updatedStep.id ? { ...step, status: "done" } : step
            );
            setStepList(updatedSteps);

            const storedContactRaw = await AsyncStorage.getItem(
              REGISTRATION_CONTACT_KEY
            );
            const storedContact = storedContactRaw
              ? JSON.parse(storedContactRaw)
              : {};

            setCollectedData((prevData) => ({
              ...prevData,
              ...data,
              xacthucthongtin: {
                ...prevData.xacthucthongtin,
                finalData: {
                  ...(prevData.xacthucthongtin?.finalData || {}),
                  contactInfo: mergeContactInfo(
                    storedContact,
                    prevData.xacthucthongtin?.finalData?.contactInfo || {}
                  ),
                },
              },
            }));
          },
        });
        break;
      default:
        break;
    }
  };
  const isAllStepsCompleted = stepList.every((step) => step.status === "done");

  const getDKMobilesignErrorMessage = (errorCode) => {
    switch (errorCode) {
      case -1000:
        return "Mã nhân viên không hợp lệ hoặc không tồn tại. Vui lòng kiểm tra lại.";
      case -1001:
        return "Số CCCD đã được đăng ký trên thiết bị khác.";
      case -1002:
        return "Email hoặc số điện thoại đã được sử dụng.";
      default:
        return "Lỗi do đăng ký DKMobilesign";
    }
  };

  const buildDKMobilesignBaseBody = (collectedData, contact) => {
    const {
      xacthucthongtin: { finalData },
      selectedPackage,
    } = collectedData;
    const { personalInfo, deviceInfo } = finalData;
    const { email, phone, businessCode } = contact;
    const employeeCode = (businessCode || "").trim();

    return {
      HoTen: personalInfo.hoVaTen,
      DiaChi: personalInfo.diaChi,
      ThanhPho: personalInfo.tinhTP,
      DienThoai: phone,
      Email: email,
      CCCD: personalInfo.maSoCaNhan,
      Noicap: personalInfo.noiCap,
      Ngaycap: personalInfo.ngayCap,
      tenmay: deviceInfo.deviceName,
      loaimay: deviceInfo.deviceType,
      hedieuhanh: deviceInfo.os,
      phienban: deviceInfo.version,
      soseri: deviceInfo.uuid,
      TKKinhdoanh: employeeCode,
      makd: "",
      MaGoiDV: selectedPackage.packageCode,
      contractNo: "",
    };
  };

  const buildDKMobilesignBodies = (collectedData, contact) => {
    const baseBody = buildDKMobilesignBaseBody(collectedData, contact);

    return [
      {
        label: "official_TKKinhdoanh",
        body: baseBody,
      },
    ];
  };

  const postDKMobilesign = async (requestBody, label = "default") => {
    const url = "https://apidkmobilesign.nacencomm.vn/api/data/DKMobilesign";
    console.log(`DKMobilesign request body (${label}):`, requestBody);
    const response = await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const responseText = await response.text();
    return responseText.replace(/^"|"$/g, "");
  };

  const DKMobilesign = async (collectedData, contact) => {
    try {
      const [{ label, body }] = buildDKMobilesignBodies(collectedData, contact);
      const registerResponse = await postDKMobilesign(body, label);
      console.log(`DKMobilesign result (${label}):`, registerResponse);
      return registerResponse;
    } catch (error) {
      console.error("Error in registerApi:", error);
      throw error;
    }
  };
  const DKEKYC_Object = async (IDCTS, collectedData) => {
    const {
      xacthucthongtin: { finalData },
      selectedPackage,
    } = collectedData;
    const { personalInfo, deviceInfo, contactInfo, type, ekycData } = finalData;
    // global.mrz = MRZ;

    // const card_info = Settings.get("card_info");
    // Card_info = card_info;
    // global.card_info = card_info;

    // NFC_read = Settings.get("NFC_read");
    // global.nfc_read = NFC_read;

    // isValidIdCard = Settings.get("isValidIdCard");
    // isValidIdCard = parseBool(isValidIdCard);

    // faceMatching = Settings.get("faceMatching");
    // faceMatching = parseBool(faceMatching);

    // verifyID = Settings.get("verifyID");
    // verifyID = parseBool(verifyID);
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
    global.card_info = card_info;
    global.nfc_read = NFC_read;
    isValidIdCard = parseBool(isValidIdCard);
    faceMatching = parseBool(faceMatching);
    verifyID = parseBool(verifyID);
    var ekycinfo = {
      IDCTS: IDCTS,
      DeviceID: deviceInfo.uuid,
      MRZ: JSON.stringify(global.mrz),
      Card_info: JSON.stringify(global.card_info),
      NFC_read: JSON.stringify(global.nfc_read),
      request_id: JSON.parse(NFC_read).request_id,
      isValidIdCard: isValidIdCard,
      faceMatching: faceMatching,
      verifyID: global.verifyID,
    };
   
    var url = "https://apidkmobilesign.nacencomm.vn/api/data/EKYC_Object";
    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(ekycinfo),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json(); // Trả về phản hồi dạng JSON
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  };
  const uploadImage = async (cmnd, idcts, imageUri, fileName) => {
    const url =
      "https://apidkmobilesign.nacencomm.vn/api/data/upload?mst=" +
      cmnd +
      "&idcts=" +
      idcts +
      "&filename=" +
      fileName;

    let body = new FormData();
    body.append("photo", {
      uri: imageUri,
      name: fileName,
      type: "image/png",
    });

    body.append("Content-Type", "image/png");

    try {
      const response = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "multipart/form-data",
        },
        body: body,
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json(); // Trả về phản hồi dạng JSON
    } catch (error) {
      console.error("Error in uploadImage:", error);
      throw error;
    }
  };
  const handleCompleteRegistration = async () => {
    try {
      setloadingVisible(true);

      const finalData = collectedData?.xacthucthongtin?.finalData;
      const contact = await getRegistrationContact(finalData?.contactInfo);
      console.log("Form contact gửi DKMobilesign:", contact);

      if (!contact.email || !contact.phone) {
        setloadingVisible(false);
        createAlertCustom(
          "Thiếu email hoặc số điện thoại từ form. Vui lòng quay lại bước 2 để nhập lại."
        );
        return;
      }

      const registerResponse = await DKMobilesign(collectedData, contact);
      const check = registerResponse.split("|");
      const IDCTS = parseInt(check[0]);
      if (IDCTS > 0) {
        global.linkfiledangky = encodeURI(check[1]);
        global.emailDangKy = contact.email;

        if (finalData.type === "EKYC") {
          const ekycResponse = await DKEKYC_Object(IDCTS, collectedData);
          if (ekycResponse !== 1) {
            setloadingVisible(false);
            createAlertCustom("Lỗi do đăng ký Đăng ký EKYC");
            return;
          }
        }

        const cccd = finalData.personalInfo.maSoCaNhan;
        const frontImageResponse = await uploadImage(
          cccd,
          IDCTS,
          collectedData.selectedImage.frontImage,
          "capture1.png"
        );
        console.log("Front image upload response:", frontImageResponse);

        // Bước 3: Gọi API upload backImage
        const backImageResponse = await uploadImage(
          cccd,
          IDCTS,
          collectedData.selectedImage.backImage,
          "capture2.png"
        );
        console.log("Back image upload response:", backImageResponse);

        setloadingVisible(false);
        navigation.navigate("HoanTatDangKy");
      } else {
        console.log("Error in dangKy api:", registerResponse);
        setloadingVisible(false);
        createAlertCustom(getDKMobilesignErrorMessage(IDCTS));
      }
    } catch (error) {
      // Xử lý lỗi nếu xảy ra trong bất kỳ bước nào
      console.error("Error in dangKy:", error);
      setloadingVisible(false);
      createAlertCustom("Lỗi do hệ thống " + error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={KichHoatStyle.scrollContainer}
        contentContainerStyle={KichHoatStyle.scrollContent}
      >
        <TouchableOpacity
          style={[StartStyle.languageIcon, { left: "auto", right: 16 }]}
          onPress={ChangeNgonngu}
        >
          {locale === "vi" ? (
            <Image
              source={require("../../img/Vietnam.png")}
              style={StartStyle.icon}
            />
          ) : (
            <Image
              source={require("../../img/UK.png")}
              style={StartStyle.icon}
            />
          )}
        </TouchableOpacity>
        <TouchableOpacity
          style={AppStyle.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../img/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>

        <View
          style={{
            flex: 1,
            gap: 16,
            width: "100%",
            paddingHorizontal: 16,
            marginTop: 40,
          }}
        >
          <Text style={styles.headerMainText}>
            {i18n.t("register.steps.title")}
          </Text>

          <View style={{ gap: 12 }}>
            {stepList.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.item,
                  item.status === "done"
                    ? { backgroundColor: "#F5FFF8" }
                    : item.status === "in_progress"
                    ? { backgroundColor: "#FEF3C7" }
                    : { backgroundColor: "#F3F4F6" },
                ]}
                onPress={() => handleRegisterStep(item.id)}
              >
                <View style={styles.stepContainer}>
                  <Text style={styles.stepLabel}>
                    {i18n.t("register.steps.step")} {index + 1}
                  </Text>
                  <View style={styles.stepContentRow}>
                    <Text style={styles.step}>{i18n.t(item.label)}</Text>
                    <Text
                      style={[
                        styles.badge,
                        item.status === "done"
                          ? styles.badgeDone
                          : item.status === "in_progress"
                          ? styles.badgeInProgress
                          : styles.badgeNotDone,
                      ]}
                    >
                      {item.status === "done"
                        ? i18n.t("register.steps.done")
                        : item.status === "in_progress"
                        ? i18n.t("register.steps.in_progress")
                        : i18n.t("register.steps.not_done")}
                    </Text>
                  </View>
                  {item.id === "1" &&
                  item.status === "done" &&
                  collectedData.selectedPackage ? (
                    <Text style={styles.packageDescription}>
                      {collectedData.selectedPackage.packageDescription}
                    </Text>
                  ) : null}
                  {item.id === "3" &&
                  item.status === "done" &&
                  collectedData.selectedImage ? (
                    <View style={styles.imagePreviewContainer}>
                      <Image
                        source={{ uri: collectedData.selectedImage.frontImage }}
                        style={styles.previewImage}
                      />
                      <Image
                        source={{ uri: collectedData.selectedImage.backImage }}
                        style={styles.previewImage}
                      />
                    </View>
                  ) : null}
                </View>
                <Image
                  source={require("../../img/CaretRight.png")}
                  style={{ width: 16, height: 16 }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <View
            style={{
              marginTop: 24,
              alignItems: "center",
              paddingHorizontal: 16,
            }}
          >
            <Text
              style={{ fontSize: 14, textAlign: "center", color: "#6B7280" }}
            >
              Bằng việc chọn Hoàn tất đăng ký, tôi đồng ý với các{" "}
              <Text
                style={{ color: "#2563EB", textDecorationLine: "underline" }}
                onPress={() => navigation.navigate("Terms")}
              >
                Điều khoản
              </Text>{" "}
              về xử lý dữ liệu cá nhân của Nacencomm.
            </Text>

            <TouchableOpacity
              style={{
                marginTop: 16,
                backgroundColor: isAllStepsCompleted ? "#2563EB" : "#F3F4F6", // Xanh dương khi thành công
                borderRadius: 8,
                paddingVertical: 12,
                paddingHorizontal: 24,
                alignItems: "center",
                width: "100%",
              }}
              onPress={handleCompleteRegistration}
              disabled={!isAllStepsCompleted} // Disable nếu chưa hoàn thành tất cả bước
            >
              <Text
                style={{
                  fontSize: 16,
                  color: isAllStepsCompleted ? "#FFFFFF" : "#9CA3AF",
                }}
              >
                Hoàn tất đăng ký
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
      <Modal
        animationType="slide"
        transparent={true}
        visible={loadingVisible}
        onRequestClose={() => {
          //  Alert.alert("Modal has been closed.");ß
          setModalVisible(!loadingVisible);
        }}
      >
        <View style={styles.containerModal}>
          <View
            style={{
              position: "absolute",
              width: 327,
              height: 160,
              top: 239,
              backgroundColor: "#FFFFFF",
              borderRadius: 8,
            }}
          >
            <Text
              style={{
                position: "absolute",
                width: 297,
                height: 48,
                left: 12,
                top: 24,
                fontSize: 20,
                lineHeight: 24,
                textAlign: "center",
                color: "#111827",
                fontWeight: "bold",
              }}
            >
              CA2 REMOTE SIGNING
            </Text>

            <Text
              style={{
                position: "absolute",
                width: 297,
                height: 48,
                left: 12,
                top: 58,
                fontSize: 16,
                lineHeight: 24,
                textAlign: "center",
                color: "#111827",
              }}
            >
              {i18n.t("capturetext10")}
              {"\n"}
              {i18n.t("capturetext11")}
            </Text>

            <ActivityIndicator
              size="large"
              style={{ top: 110, color: "red" }}
            />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerMainText: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "700",
  },
  item: {
    flexDirection: "row",
    padding: 16,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
    borderRadius: 6,
  },
  stepContainer: {
    flex: 1,
    gap: 8,
  },
  stepLabel: {
    lineHeight: 16,
    fontSize: 12,
    color: "#6B7280",
  },
  stepContentRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  step: {
    lineHeight: 24,
    fontSize: 16,
    fontWeight: "700",
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    fontSize: 12,
    fontWeight: "600",
    borderRadius: 12,
  },
  badgeDone: {
    backgroundColor: "#DBF5E5",
    color: "#21C75E",
  },
  badgeInProgress: {
    backgroundColor: "#FEF3C7",
    color: "#92400E",
  },
  badgeNotDone: {
    backgroundColor: "#E5E7EB",
    color: "#6B7280",
  },
  packageDescription: {
    fontSize: 14,
    fontWeight: "400",
    color: "#4B5563",
    marginTop: 4,
  },
  imagePreviewContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 8,
  },
  previewImage: {
    width: 100, // Kích thước nhỏ hơn
    height: 100,
    borderRadius: 8,
    resizeMode: "contain",
  },
  containerModal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    // marginTop: 30,
  },
});
