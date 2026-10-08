import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
} from "react-native";
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Đa ngôn ngữ context
import { Camera, CameraView } from "expo-camera";

const ScanOCR: React.FC = ({ navigation, route }: any) => {
  const { i18n } = useLanguage(); // Lấy ngôn ngữ từ context
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [scanned, setScanned] = useState(false);
  const { onComplete } = route.params;
  useEffect(() => {
    (async () => {
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");
    })();
  }, []);

  const handleBarCodeScanned = ({ type, data }: any) => {
    setScanned(true);
    onComplete(data);
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <Text>{i18n.t("scan_orc.requesting_permission")}</Text>
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <Text>{i18n.t("scan_orc.permission_denied")}</Text>
        <TouchableOpacity
          style={styles.button}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.buttonText}>
            {i18n.t("scan_orc.button_back")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

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
          {i18n.t("scan_orc.ocr_verification_title")}
        </Text>
      </View>
      <View style={styles.scannerContainer}>
        {!scanned ? (
          <CameraView
            onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
            barcodeScannerSettings={{
              barcodeTypes: ["qr", "pdf417"],
            }}
            style={StyleSheet.absoluteFillObject}
          />
        ) : (
          <View style={styles.placeholder} />
        )}
      </View>
      <Text style={styles.instructions}>
        {i18n.t("scan_orc.ocr_verification_instructions")}
      </Text>
      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => onComplete(null)}
      >
        <Text style={styles.skipButtonText}>
          {i18n.t("scan_orc.button_skip")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default ScanOCR;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    // justifyContent: "center",
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
  scannerContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D9D9D9",
  },
  instructions: {
    marginVertical: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#7D7D7D",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#0056D2",
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
    backgroundColor: "#0056D2",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
});
