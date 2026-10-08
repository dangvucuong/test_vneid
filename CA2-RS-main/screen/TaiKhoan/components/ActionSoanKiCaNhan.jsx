import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Pressable,
  Alert,
  InteractionManager,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import { Camera, CameraView } from "expo-camera";
import * as WebBrowser from "expo-web-browser";
import DeviceInfo from "react-native-device-info";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RootNavigation from "../../RootNavigation";
import vneidClient from "../../../utils/vneidClient";

const commonName = (subject) => {
  const match = /CN=([^,]+)/i.exec(String(subject || ""));
  return match ? match[1].trim() : subject || "Chứng thư VNeID";
};

export default function ActionSoanKiCaNhan({
  navigation,
  visible = false,
  onClose = () => {},
}) {
  const [hasPermission, setHasPermission] = useState(null);
  const [scanned, setScanned] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [step, setStep] = useState("choose");
  const [cccd, setCccd] = useState("");
  const [certs, setCerts] = useState([]);
  const [selectedId, setSelectedId] = useState("");
  const [certLoading, setCertLoading] = useState(false);
  const [certError, setCertError] = useState("");

  useEffect(() => {
    if (!visible) {
      setStep("choose");
      return;
    }
    AsyncStorage.getItem("@vneidCccd").then((saved) => {
      if (saved) setCccd(saved);
    });
  }, [visible]);

  // Hàm yêu cầu quyền truy cập camera
  const requestCameraPermission = async () => {
    const { status } = await Camera.requestCameraPermissionsAsync();
    setHasPermission(status === "granted");
  };

  // Biến trạng thái để kiểm soát việc mở trình duyệt
  let isBrowserOpening = false;

  // Hàm xử lý khi quét được mã QR
  const handleBarCodeScanned = async ({ data }) => {
    // Kiểm tra xem trình duyệt đã đang mở hay chưa
    if (isBrowserOpening) {
      console.warn("Trình duyệt đang mở. Vui lòng đợi...");
      return;
    }

    try {
      // Đánh dấu rằng trình duyệt đang được mở
      isBrowserOpening = true;

      // Cập nhật trạng thái quét và đóng modal
      setScanned(true);
      // Chờ cho đến khi các tương tác hoàn tất
      await new Promise((resolve) =>
        InteractionManager.runAfterInteractions(resolve)
      );
      // Parse dữ liệu từ QR code
      const qrData = JSON.parse(data);
      const { username, token, hostname, type } = qrData;
      const deviceName = await DeviceInfo.getDeviceName();
      const deviceId = DeviceInfo.getModel();
      // Tạo URL để mở
      let url = `${hostname}/dang-ky-passkey?mabutky=${global.idcts}&token=${token}&username=${username}&deviceName=${deviceName}`;
      if (type === "email") {
        url += `&email=${global.Email}`;
        if (username !== global.Email) {
          Alert.alert(
            "Thông báo",
            `Email Không trùng khớp. 
            Tài khoản ở appRs đang là ${global.Email}. Tài khoản ở web đang là ${username}`
          );
          return;
        }
      } else if (type === "masothue") {
        url += `&email=${global.Masothue}`;
      }
      // Mở URL trong trình duyệt
      await WebBrowser.openBrowserAsync(url);
    } catch (error) {
      console.error("Lỗi khi xử lý QR code:", error);
    } finally {
      // Đảm bảo rằng biến trạng thái được reset sau khi hoàn thành
      isBrowserOpening = false;
    }
  };

  // Hàm mở modal quét mã QR
  const openQRScanner = async () => {
    if (hasPermission === null) {
      await requestCameraPermission();
    }
    if (hasPermission === false) {
      Alert.alert(
        "Không có quyền truy cập camera",
        "Vui lòng cấp quyền truy cập camera để sử dụng tính năng này."
      );
    } else {
      setScanned(false); // Reset trạng thái đã quét
      setIsModalVisible(true); // Mở modal
    }
  };
  const loadCertificates = async () => {
    const citizenPid = cccd.trim();
    if (!/^\d{12}$/.test(citizenPid)) {
      setCertError("Nhập đủ 12 số CCCD.");
      return;
    }
    setCertLoading(true);
    setCertError("");
    try {
      await AsyncStorage.setItem("@vneidCccd", citizenPid);
      const list = await vneidClient.listCertificates(
        vneidClient.DEFAULT_GATEWAY,
        citizenPid
      );
      setCerts(list);
      setSelectedId(list.length === 1 ? String(list[0].credentialID || "") : "");
      if (!list.length) setCertError("Không có chứng thư VNeID cho số CCCD này.");
    } catch (error) {
      setCerts([]);
      setCertError(error?.message || "Không kết nối được gateway.");
    } finally {
      setCertLoading(false);
    }
  };

  const continueWithVneid = async () => {
    const cert = certs.find((item) => item.credentialID === selectedId);
    const certificates = cert?.cert?.certificates || [];
    if (!cert?.credentialID || !certificates[0]) {
      Alert.alert("Chứng thư", "Hãy chọn chứng thư có dữ liệu chứng thư số.");
      return;
    }
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      const fileInfo = await FileSystem.getInfoAsync(asset.uri);
      const fileSize =
        fileInfo && fileInfo.exists && typeof fileInfo.size === "number"
          ? fileInfo.size
          : 0;
      if (fileSize > 20 * 1024 * 1024) {
        Alert.alert("File quá lớn", "Vui lòng chọn file PDF nhỏ hơn 20MB.");
        return;
      }
      onClose();
      RootNavigation.navigate("PDFViewer", {
        pdfUri: asset.uri,
        signMode: "vneid",
        fileName: asset.name || "tai-lieu.pdf",
        vneidCert: {
          credentialID: cert.credentialID,
          subjectDN: cert.cert?.subjectDN || "",
          serialNumber: cert.cert?.serialNumber || cert.credentialID,
          validFrom: cert.cert?.validFrom || "",
          validTo: cert.cert?.validTo || "",
          certificates,
        },
      });
    } catch (error) {
      Alert.alert("Lỗi", error?.message || "Không chọn được file PDF.");
    }
  };

  const pickFile = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (res.canceled) {
        console.log("User cancelled the file picker.");
        return;
      }

      const uri = res.assets[0].uri;
      const fileInfo = await FileSystem.getInfoAsync(uri);
      const fileSize =
        fileInfo && fileInfo.exists && typeof fileInfo.size === "number"
          ? fileInfo.size
          : 0;

      if (fileSize > 20 * 1024 * 1024) {
        Alert.alert(
          "File quá lớn",
          "Kích thước file vượt quá giới hạn cho phép. Vui lòng chọn file có kích thước < 20MB."
        );
        return;
      }

      onClose();
      navigation.navigate("PDFViewer", { pdfUri: uri });
    } catch (err) {
      console.error("Error picking file:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn tài liệu.");
    }
  };
  const pickImage = async () => {
    try {
      // Mở thư viện ảnh
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        //allowsEditing: true,
        //aspect: [5, 7],
        quality: 1,
      });

      if (!result.canceled) {
        const uri = result.assets[0].uri;

        // Lấy thông tin file
        const fileInfo = await FileSystem.getInfoAsync(uri);

        if (fileInfo.size > 20 * 1024 * 1024) {
          // Hiển thị thông báo nếu file lớn hơn 20MB
          Alert.alert(
            "File quá lớn",
            "Kích thước file vượt quá giới hạn cho phép. Vui lòng chọn ảnh có kích thước < 20MB."
          );
          return;
        }

        // Tiếp tục nếu file hợp lệ
        onClose();
        console.log("pickImage", uri);
        navigation.navigate("PDFViewer", { imageUri: uri });
      }
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

  const pickImageFromCamera = async () => {
    try {
      // Yêu cầu quyền truy cập camera
      const resultPermission =
        await ImagePicker.requestCameraPermissionsAsync();
      if (!resultPermission.granted) {
        alert("Bạn cần cấp quyền sử dụng camera để chụp ảnh.");
        return;
      }

      // Mở camera
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [5, 7], // Tỷ lệ khung hình mong muốn
        quality: 1, // Chất lượng ảnh
      });

      if (!result.canceled) {
        const { uri } = result.assets[0]; // Đường dẫn ảnh

        // Chuẩn hóa đường dẫn
        const normalizedUri = uri.startsWith("file://") ? uri : `file://${uri}`;

        // Lấy thông tin file
        const fileInfo = await FileSystem.getInfoAsync(normalizedUri);

        if (fileInfo.size > 20 * 1024 * 1024) {
          // Hiển thị thông báo nếu file lớn hơn 20MB
          Alert.alert(
            "File quá lớn",
            "Kích thước file vượt quá giới hạn cho phép. Vui lòng cài đặt chụp ảnh có kích thước < 20MB."
          );
          return;
        }

        // Nếu file hợp lệ, điều hướng sang PDFViewer
        onClose();
        console.log("pickImageFromCamera ", normalizedUri);
        navigation.navigate("PDFViewer", { imageUri: normalizedUri });
      }
    } catch (error) {
      console.error("Error capturing image from camera:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi sử dụng camera.");
    }
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            {step !== "choose" ? (
              <TouchableOpacity onPress={() => setStep("choose")} style={styles.backButton}>
                <Text style={styles.backText}>Quay lại</Text>
              </TouchableOpacity>
            ) : (
              <View style={styles.backButton} />
            )}
            <Text style={styles.title}>
              {step === "vneid"
                ? "Chọn chứng thư VNeID"
                : step === "old"
                ? "Ký theo luồng cũ"
                : "Chọn cách ký"}
            </Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Image
                source={require("../../../img/close.png")}
                style={styles.closeIcon}
              />
            </TouchableOpacity>
          </View>

          {step === "choose" && (
            <View style={styles.choiceWrap}>
              <TouchableOpacity style={styles.choiceCard} onPress={() => setStep("vneid")}>
                <Text style={styles.choiceTitleLight}>Ký bằng VNeID</Text>
                <Text style={styles.choiceTextLight}>
                  Chọn chứng thư số, khoanh vùng ký trên file, rồi ký ngay trên điện thoại.
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.choiceCardMuted} onPress={() => setStep("old")}>
                <Text style={styles.choiceTitle}>Ký theo luồng cũ</Text>
                <Text style={styles.choiceText}>
                  Tải tài liệu, ảnh hoặc quét QR và ký như hiện tại.
                </Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "vneid" && (
            <View style={styles.certSheet}>
              <Text style={styles.fieldLabel}>Số CCCD</Text>
              <TextInput
                value={cccd}
                onChangeText={setCccd}
                keyboardType="number-pad"
                maxLength={12}
                placeholder="12 số CCCD"
                placeholderTextColor="#94A3B8"
                style={styles.field}
              />
              <TouchableOpacity
                style={styles.loadButton}
                onPress={loadCertificates}
                disabled={certLoading}
              >
                {certLoading ? (
                  <ActivityIndicator color="#1858EA" />
                ) : (
                  <Text style={styles.loadButtonText}>Lấy chứng thư từ gateway</Text>
                )}
              </TouchableOpacity>
              {!!certError && <Text style={styles.errorText}>{certError}</Text>}
              <ScrollView style={styles.certList} contentContainerStyle={{ gap: 10, paddingBottom: 8 }}>
                {certs.map((item) => {
                  const id = String(item.credentialID || "");
                  const active = id === selectedId;
                  return (
                    <TouchableOpacity
                      key={id}
                      style={[styles.certCard, active && styles.certCardActive]}
                      onPress={() => setSelectedId(id)}
                    >
                      <View style={[styles.radio, active && styles.radioActive]} />
                      <View style={{ flex: 1 }}>
                        <Text style={styles.certName} numberOfLines={2}>
                          {commonName(item.cert?.subjectDN)}
                        </Text>
                        <Text style={styles.certMeta} numberOfLines={1}>
                          Serial: {item.cert?.serialNumber || id}
                        </Text>
                        <Text style={styles.certMeta}>
                          {item.cert?.validFrom || "?"} - {item.cert?.validTo || "?"}
                        </Text>
                      </View>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
              <TouchableOpacity
                style={[styles.continueButton, !selectedId && styles.continueDisabled]}
                onPress={continueWithVneid}
                disabled={!selectedId || certLoading}
              >
                <Text style={styles.continueText}>Chọn file PDF</Text>
              </TouchableOpacity>
            </View>
          )}

          {step === "old" && (
          <>
          <TouchableOpacity style={styles.option} onPress={pickFile}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/upload2.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Tải lên tài liệu</Text>
              <Text style={styles.subText}>Tối đa 20MB</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={pickImage}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/photo2.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Tải lên ảnh</Text>
              <Text style={styles.subText}>Tối đa 20MB</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={pickImageFromCamera}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/camera1.png")}
                style={styles.icon}
              />
            </View>
            <Text style={styles.optionText}>Chụp ảnh</Text>
          </TouchableOpacity>
          <View style={styles.divider} />

          <View style={styles.sectionTitle}>
            <Text style={styles.sectionText}>Kết nối</Text>
          </View>

          {/* Nút để mở chức năng quét QR */}
          <TouchableOpacity
            style={[styles.option, styles.lastOption]}
            onPress={openQRScanner}
          >
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/qrcode.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Quét QR</Text>
              <Text style={styles.subText}>Ký nhanh, kết nối Passkey</Text>
            </View>
          </TouchableOpacity>
          </>
          )}

          {/* Modal chứa màn hình quét mã QR */}
          <Modal
            visible={isModalVisible}
            animationType="slide"
            transparent={false}
          >
            <View style={styles.modalContainer}>
              <CameraView
                onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
                barcodeScannerSettings={{
                  barcodeTypes: ["qr"],
                }}
                style={StyleSheet.absoluteFillObject}
              />
              <TouchableOpacity
                style={styles.closeButtonModal}
                onPress={() => setIsModalVisible(false)}
              >
                <Text style={styles.closeButtonModalText}>Đóng</Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <View style={styles.divider} />

          <View style={styles.bottomIndicator} />
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "flex-end",
  },
  modalContent: {
    backgroundColor: "white",
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    paddingTop: 16,
    paddingHorizontal: 16,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    flex: 1,
    fontSize: 16,
    fontWeight: "700",
    color: "#0F172A",
    textAlign: "center",
  },
  backButton: {
    width: 72,
    paddingVertical: 8,
  },
  backText: {
    color: "#1858EA",
    fontWeight: "600",
  },
  choiceWrap: {
    gap: 12,
    paddingBottom: 20,
  },
  choiceCard: {
    backgroundColor: "#1858EA",
    borderRadius: 16,
    padding: 18,
  },
  choiceCardMuted: {
    backgroundColor: "#F8FAFC",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 16,
    padding: 18,
  },
  choiceTitle: {
    color: "#0F172A",
    fontSize: 17,
    fontWeight: "700",
  },
  choiceTitleLight: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
  },
  choiceText: {
    color: "#475569",
    marginTop: 6,
    lineHeight: 20,
  },
  choiceTextLight: {
    color: "#DBEAFE",
    marginTop: 6,
    lineHeight: 20,
  },
  certSheet: {
    maxHeight: 520,
    paddingBottom: 12,
  },
  fieldLabel: {
    color: "#0F172A",
    fontWeight: "600",
    marginBottom: 6,
  },
  field: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: "#0F172A",
    backgroundColor: "#F8FAFC",
  },
  loadButton: {
    marginTop: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#1858EA",
    minHeight: 44,
    alignItems: "center",
    justifyContent: "center",
  },
  loadButtonText: {
    color: "#1858EA",
    fontWeight: "700",
  },
  errorText: {
    color: "#B91C1C",
    marginTop: 8,
  },
  certList: {
    marginTop: 12,
    maxHeight: 280,
  },
  certCard: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 14,
    padding: 12,
    backgroundColor: "#FFFFFF",
  },
  certCardActive: {
    borderColor: "#1858EA",
    backgroundColor: "#EFF6FF",
  },
  radio: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2,
    borderColor: "#CBD5E1",
  },
  radioActive: {
    borderColor: "#1858EA",
    backgroundColor: "#1858EA",
  },
  certName: {
    color: "#0F172A",
    fontWeight: "700",
  },
  certMeta: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 3,
  },
  continueButton: {
    marginTop: 12,
    backgroundColor: "#1858EA",
    borderRadius: 14,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  continueDisabled: {
    backgroundColor: "#93C5FD",
  },
  continueText: {
    color: "#FFFFFF",
    fontWeight: "700",
    fontSize: 16,
  },
  closeButton: {
    padding: 8,
  },
  closeIcon: {
    width: 24,
    height: 24,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 12,
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  icon: {
    width: 40,
    height: 40,
  },
  plusIcon: {
    position: "absolute",
    right: -4,
    bottom: -4,
    width: 16,
    height: 16,
    backgroundColor: "#2196F3",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
  },
  plusText: {
    color: "white",
    fontSize: 12,
    fontWeight: "bold",
  },
  textContainer: {
    flex: 1,
  },
  optionText: {
    fontSize: 16,
    color: "#000000",
  },
  subText: {
    fontSize: 12,
    color: "#666666",
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: "#E0E0E0",
    marginVertical: 8,
  },
  sectionTitle: {
    paddingVertical: 8,
  },
  sectionText: {
    fontSize: 14,
    color: "#666666",
  },
  lastOption: {
    marginBottom: 30,
  },
  bottomIndicator: {
    width: 134,
    height: 5,
    backgroundColor: "#000000",
    opacity: 0.2,
    borderRadius: 2.5,
    alignSelf: "center",
    marginBottom: 8,
  },
  modalContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  closeButtonModal: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 5,
  },
  closeButtonModalText: {
    color: "#fff",
    fontWeight: "bold",
  },
});
