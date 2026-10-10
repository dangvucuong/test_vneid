import React, { useState, useEffect, useRef } from "react";
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
} from "react-native";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import * as DocumentPicker from "expo-document-picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as RootNavigation from "../../RootNavigation";
import vneidClient from "../../../utils/vneidClient";
import imageToPdf from "../../../utils/imageToPdf";

const commonName = (subject) => {
  const match = /CN=([^,]+)/i.exec(String(subject || ""));
  return match ? match[1].trim() : subject || "Chứng thư VNeID";
};

export default function ActionSoanKiCaNhan({
  navigation,
  visible = false,
  onClose = () => {},
}) {
  const [step, setStep] = useState("choose");
  const [converting, setConverting] = useState(false);
  const [cccd, setCccd] = useState("");
  const [ca2UserId, setCa2UserId] = useState("");
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
    setCa2UserId(String(global.Masothue || "").replace(/\D/g, ""));
  }, [visible]);

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

  const withinSize = async (uri) => {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    const fileSize =
      fileInfo && fileInfo.exists && typeof fileInfo.size === "number" ? fileInfo.size : 0;
    if (fileSize > 20 * 1024 * 1024) {
      Alert.alert("File quá lớn", "Vui lòng chọn file nhỏ hơn 20MB.");
      return false;
    }
    return true;
  };

  const activatedAccount = () => {
    const serial = String(global.Serial || "").replace(/[^0-9a-f]/gi, "").toUpperCase();
    const citizenPid = ca2UserId.trim();
    const taxId = String(global.Masothue || "").replace(/\D/g, "");
    if (!serial) {
      Alert.alert("Chứng thư", "Tài khoản chưa có serial chứng thư đã kích hoạt.");
      return null;
    }
    if (!/^\d{10,13}$/.test(citizenPid)) {
      Alert.alert("CCCD", "Nhập CCCD 12 số hoặc mã số thuế trên tài khoản.");
      return null;
    }
    return { serial, citizenPid, taxId };
  };

  const openCa2Pdf = (pdfUri, fileName) => {
    const account = activatedAccount();
    if (!account) return;
    const { serial, citizenPid, taxId } = account;
    onClose();
    RootNavigation.navigate("PDFViewer", {
      pdfUri,
      signMode: "ca2rs",
      fileName: fileName || "tai-lieu.pdf",
      ca2Account: {
        userId: citizenPid,
        fallbackUserId: taxId,
        serialNumber: serial,
      },
    });
  };

  const openImageAsPdf = async (uri, mimeType) => {
    if (!activatedAccount()) return;
    if (!(await withinSize(uri))) return;
    setConverting(true);
    try {
      const pdfUri = await imageToPdf.imageUriToPdf(uri, mimeType, FileSystem);
      openCa2Pdf(pdfUri, "anh-ky.pdf");
    } catch (error) {
      Alert.alert("Ảnh", error?.message || "Không chuyển được ảnh sang PDF. Hãy chọn ảnh JPG hoặc PNG.");
    } finally {
      setConverting(false);
    }
  };

  const pickFile = async () => {
    if (!activatedAccount()) return;
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ["application/pdf"],
        copyToCacheDirectory: true,
        multiple: false,
      });
      if (res.canceled || !res.assets?.[0]) return;
      const asset = res.assets[0];
      if (!(await withinSize(asset.uri))) return;
      openCa2Pdf(asset.uri, asset.name || "tai-lieu.pdf");
    } catch (err) {
      console.error("Error picking file:", err);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn tài liệu.");
    }
  };

  const pickImage = async () => {
    if (!activatedAccount()) return;
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      await openImageAsPdf(asset.uri, asset.mimeType);
    } catch (error) {
      console.error("Error picking image:", error);
      Alert.alert("Lỗi", "Đã xảy ra lỗi khi chọn ảnh.");
    }
  };

  const pickImageFromCamera = async () => {
    if (!activatedAccount()) return;
    try {
      const resultPermission = await ImagePicker.requestCameraPermissionsAsync();
      if (!resultPermission.granted) {
        Alert.alert("Camera", "Bạn cần cấp quyền sử dụng camera để chụp ảnh.");
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        quality: 1,
      });
      if (result.canceled || !result.assets?.[0]) return;
      const asset = result.assets[0];
      const uri = asset.uri.startsWith("file://") ? asset.uri : `file://${asset.uri}`;
      await openImageAsPdf(uri, asset.mimeType || "image/jpeg");
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
                ? "Ký bằng CA2 RS"
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
                <Text style={styles.choiceTitle}>Ký bằng CA2 RS</Text>
                <Text style={styles.choiceText}>
                  Chọn PDF hoặc ảnh, khoanh vùng ký, rồi ký bằng chứng thư đang kích hoạt.
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
          <ScrollView style={styles.ca2Sheet} keyboardShouldPersistTaps="handled">
          <Text style={styles.fieldLabel}>CCCD hoặc mã số thuế</Text>
          <TextInput
            value={ca2UserId}
            onChangeText={setCa2UserId}
            keyboardType="number-pad"
            maxLength={13}
            placeholder="Mã trên tài khoản đang kích hoạt"
            placeholderTextColor="#94A3B8"
            style={styles.field}
          />
          <Text style={styles.certMeta}>
            Serial đang kích hoạt: {global.Serial || "chưa có"}
          </Text>
          <TouchableOpacity style={styles.option} onPress={pickFile} disabled={converting}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/upload2.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Chọn file PDF</Text>
              <Text style={styles.subText}>Tối đa 20MB</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={pickImage} disabled={converting}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/photo2.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Chọn ảnh</Text>
              <Text style={styles.subText}>JPG hoặc PNG, chuyển thành PDF trên máy</Text>
            </View>
          </TouchableOpacity>

          <View style={styles.divider} />

          <TouchableOpacity style={styles.option} onPress={pickImageFromCamera} disabled={converting}>
            <View style={styles.iconWrapper}>
              <Image
                source={require("../../../img/camera1.png")}
                style={styles.icon}
              />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.optionText}>Chụp ảnh</Text>
              <Text style={styles.subText}>
                {converting ? "Đang chuyển ảnh sang PDF..." : "Chuyển thành PDF trên máy"}
              </Text>
            </View>
          </TouchableOpacity>
          </ScrollView>
          )}
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
  ca2Sheet: {
    maxHeight: 460,
    marginBottom: 8,
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
