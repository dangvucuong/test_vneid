"use strict";

import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  Modal,
  Dimensions,
} from "react-native";
import { Camera, CameraType } from "expo-camera";
import AsyncStorage from "@react-native-async-storage/async-storage";
import MainLayout from "../../layout";
import GoBackButton from "../../component/Buttons/GoBackBtn";
import { IMAGE_GROUP } from "../../utils/constant";
import DialogLanguage from "../../component/Dialog/DialogLanguage";
import { I18n } from "i18n-js";
import { en, vi } from "../../localize";

const Scan = ({ navigation }) => {
  const [locale, setLocale] = useState("vi");
  const [defaultLang, setDefaultLang] = useState(false);
  const [openLanguageModal, setOpenLanguageModal] = useState(false);
  const [type, setType] = useState(CameraType.back);
  const [permission, requestPermission] = Camera.useCameraPermissions();
  const [showPopPin, setShowPopPin] = useState(false);

  const i18n = new I18n({ en, vi });
  i18n.locale = locale;
  i18n.fallback = true;

  const windowWidth = Dimensions.get("window").width;

  useEffect(() => {
    const fetchLanguage = async () => {
      const storedLang = await AsyncStorage.getItem("@language");
      if (storedLang) {
        setLocale(storedLang);
        setDefaultLang(storedLang !== "vi");
      }
    };
    fetchLanguage();
  }, []);

  const toggleCameraType = () => {
    setType((prevType) => (prevType === CameraType.back ? CameraType.front : CameraType.back));
  };

  const handleLanguageChange = async (lang) => {
    setLocale(lang);
    i18n.locale = lang;
    await AsyncStorage.setItem("@language", lang);
    setDefaultLang(lang !== "vi");
    setOpenLanguageModal(false);
  };

  const renderButton = () => (
    <TouchableOpacity onPress={() => setOpenLanguageModal(true)}>
      <Image source={defaultLang ? IMAGE_GROUP.language.en : IMAGE_GROUP.language.vi} />
    </TouchableOpacity>
  );

  const scanBarcode = ({ data }) => {
    if (data) {
      global.qrinfo = data;
      console.log("dataQR",data);
      navigation.navigate("RegInfo", global.qrinfo);
    }
  };

  if (!permission) return <View />;

  if (!permission.granted) {
    return (
      <View style={styles.overlay}>
        <View style={styles.permissionBox}>
          <Text style={styles.permissionTitle}>CA2 REMOTE SIGNING</Text>
          <Text style={styles.permissionDescription}>{i18n.t("qrcodetext4")}</Text>
          <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
            <Text style={styles.permissionButtonText}>{i18n.t("qrcodetext5")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <MainLayout
        NavBarTopProps={{
            left: <GoBackButton navigation={navigation} />,
            right: renderButton(), // Gọi trực tiếp hàm renderButton()
            center: i18n.t("ScanQr"),
        }}
        >
      <View style={styles.container}>
        <View style={styles.cameraContainer}>
          <Camera
            style={styles.camera}
            type={type}
            onBarCodeScanned={scanBarcode}
            barCodeScannerSettings={{
              barCodeTypes: ['qr'],
            }}
          />
          <Text style={styles.scanText}>{i18n.t("Please_Scan_QR_code")}</Text>
        </View>

        <Modal
          animationType="slide"
          transparent
          visible={showPopPin}
          onRequestClose={() => setShowPopPin(false)}
        >
          <View style={styles.overlay}>
            <View style={styles.modalBox}>
              <Text style={styles.modalTitle}>CA2 REMOTE SIGNING</Text>
              <Text style={styles.modalDescription}>Bạn cần cấp quyền cho Camera để quét mã QR</Text>
              <TouchableOpacity style={styles.modalButton} onPress={requestPermission}>
                <Text style={styles.modalButtonText}>Cấp quyền</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => navigation.navigate("RegInfo")}
        >
          <Text style={styles.skipButtonText}>{i18n.t("skipText")}</Text>
        </TouchableOpacity>

        <DialogLanguage
          i18n={i18n}
          visible={openLanguageModal}
          navigation={navigation}
          onClose={() => setOpenLanguageModal(false)}
          data={[
            { key: "vi", title: "Tiếng Việt", onPress: () => handleLanguageChange("vi") },
            { key: "en", title: "English", onPress: () => handleLanguageChange("en") },
          ]}
        />
      </View>
    </MainLayout>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  permissionBox: {
    width: Dimensions.get("window").width - 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 13,
    padding: 20,
    alignItems: "center",
  },
  permissionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#111827",
    textAlign: "center",
  },
  permissionDescription: {
    fontSize: 16,
    color: "#111827",
    textAlign: "center",
    marginVertical: 10,
  },
  permissionButton: {
    backgroundColor: "#1959DC",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 20,
    alignItems: "center",
  },
  permissionButtonText: {
    color: "#FFFFFF",
    fontSize: 14,
  },
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    alignItems: "center",
  },
  cameraContainer: {
    width: "90%",
    alignItems: "center",
    justifyContent: "center",
  },
  camera: {
    width: 420,
    height: 240,
  },
  scanText: {
    marginTop: 30,
    fontSize: 14,
    fontWeight: "500",
    textAlign: "center",
    color: "#0F172A",
  },
  skipButton: {
    position: "absolute",
    bottom: 16,
    width: "90%",
    height: 44,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});

export default Scan;
