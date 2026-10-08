import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Share,
  PermissionsAndroid,
  Platform
} from "react-native";
import * as FileSystem from "expo-file-system";
import Toast from "react-native-toast-message";
import { zip } from "react-native-zip-archive";
import * as Sharing from "expo-sharing";
import RNFS from "react-native-fs";
import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import messaging from "@react-native-firebase/messaging";
import ReactNativeBiometrics from "react-native-biometrics";
import { useI18n } from "../../utils/i18n";
import ModalPinCode from "../component/ModalPinCode";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import Divider from "../component/Divider";
import DialogLoi from "../TaiKhoan/components/DiaLogLoi";
import moment from "moment";

const CELL_COUNT = 6;
const rnBiometrics = new ReactNativeBiometrics();

export default function KyLoTaiLieu({ navigation, route }) {
  const { i18n } = useI18n();
  const { items } = route.params;
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successCount, setSuccessCount] = useState(0);
  const [failCount, setFailCount] = useState(0);
  const [showPopPin, setShowPopPin] = useState(false);
  const [value, setValue] = useState("");
  const [remainingTime, setRemainingTime] = useState(120); // 120 seconds = 2 minutes
  const [timerActive, setTimerActive] = useState(true); // To control the timer
  // Biến trạng thái
  const [signStatus, setSignStatus] = React.useState("notSigned"); // Giá trị ban đầu là chưa ký
  // New state to track action type (sign or reject)
  const [actionType, setActionType] = React.useState(null); // null, 'sign', or 'reject'
  // New state to track if we're processing a reject action
  const [isRejecting, setIsRejecting] = React.useState(false);
  // Start countdown when component mounts
  useEffect(() => {
    if (timerActive && remainingTime > 0) {
      const timer = setInterval(() => {
        setRemainingTime((prevTime) => prevTime - 1);
      }, 1000); // Decrease every second

      return () => clearInterval(timer); // Clean up the timer when the component unmounts
    }

    // If time is up, go back to the previous screen
    if (remainingTime === 0) {
      navigation.navigate("Home");
    }
  }, [remainingTime, timerActive, navigation]);

  const handleSign = async () => {
    // Stop the timer when the user presses the button
    // setTimerActive(false);
    if (
      global.NgayTK &&
      moment(global.NgayKT, "YYYY-MM-DD").isBefore(moment(), "day")
    ) {
      setIsModalHetHanVisible(true);
      return;
    }
    const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
    if (factor == "1") {
      rnBiometrics
        .simplePrompt({
          promptMessage: "Confirm biometric",
          cancelButtonText: "Cancel",
        })
        .then((resultObject) => {
          const { success } = resultObject;

          if (success) {
            // Set action type to 'sign' before showing PIN modal
            setActionType("sign");
            setIsRejecting(false);
            setShowPopPin(!showPopPin);
            setValue("");
          } else {
            // Handle biometric failure
          }
        })
        .catch((error) => {
          console.log("biometrics failed: " + error);
        });
    } else {
      // Set action type to 'sign' before showing PIN modal
      setActionType("sign");
      setIsRejecting(false);
      setShowPopPin(!showPopPin);
      setValue("");
    }
  };

  const handleReject = async () => {
    const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
    if (factor == "1") {
      rnBiometrics
        .simplePrompt({
          promptMessage: "Confirm biometric",
          cancelButtonText: "Cancel",
        })
        .then((resultObject) => {
          const { success } = resultObject;

          if (success) {
            // Set action type to 'reject' before showing PIN modal
            setActionType("reject");
            setIsRejecting(true);
            setShowPopPin(!showPopPin);
            setValue("");
          } else {
            // Handle biometric failure
          }
        })
        .catch((error) => {
          console.log("biometrics failed: " + error);
        });
    } else {
      // Set action type to 'reject' before showing PIN modal
      setActionType("reject");
      setIsRejecting(true);
      setShowPopPin(!showPopPin);
      setValue("");
    }
  };
    const [isModalHetHanVisible, setIsModalHetHanVisible] = useState(false);
    const handleMuaThemCKS = () => {
      setDialogHetHanCTSVisible(false);
      navigation.navigate("DangKy");
    };
  const handeDownloadAndZip = async () => {
    try {
      // Yêu cầu quyền truy cập bộ nhớ trên Android
      if (Platform.OS === "android") {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: "Quyền lưu trữ",
            message: "Ứng dụng cần quyền để lưu file vào bộ nhớ.",
            buttonPositive: "Đồng ý",
            buttonNegative: "Hủy",
          }
        );

        if (granted !== PermissionsAndroid.RESULTS.GRANTED) {
          Toast.show({ type: "error", text1: "Quyền truy cập bị từ chối!" });
          return;
        }
      }

      // Thư mục Download của hệ thống
      const downloadDir =
        Platform.OS === "android"
          ? RNFS.DownloadDirectoryPath // Android
          : RNFS.LibraryDirectoryPath; // iOS
      const tempDir = `${RNFS.CachesDirectoryPath}/tempFiles`; // Thư mục tạm

      // Tạo thư mục tạm
      if (!(await RNFS.exists(tempDir))) {
        await RNFS.mkdir(tempDir);
      }

      // Tải file song song
      const downloadPromises = items.map(async (file) => {
        if (file.KetQuaKy !== "1") return; // Bỏ qua file chưa ký
        const filePath = `${tempDir}/${file.TenVB}`;
        const result = await RNFS.downloadFile({
          fromUrl: file.Linkfile_goc,
          toFile: filePath,
        }).promise;

        if (result.statusCode === 200) {
          console.log(`Tải thành công: ${filePath}`);
          return filePath;
        } else {
          console.warn(`Lỗi tải file: ${file.Linkfile_goc}`);
          throw new Error(`Không thể tải file: ${file.Linkfile_goc}`);
        }
      });

      const downloadedFiles = await Promise.all(downloadPromises);
      console.log("Tất cả file đã tải xong:", downloadedFiles);

      // Lấy số lượng file tải được
      const numberOfFiles = downloadedFiles.filter(Boolean).length;

      // Lấy thời gian hiện tại để làm tên file
      const now = new Date();
      const formattedTime = `${now.getFullYear()}${String(
        now.getMonth() + 1
      ).padStart(2, "0")}${String(now.getDate()).padStart(2, "0")}_${String(
        now.getHours()
      ).padStart(2, "0")}${String(now.getMinutes()).padStart(2, "0")}${String(
        now.getSeconds()
      ).padStart(2, "0")}`;

      // Tên file ZIP theo yêu cầu
      const zipFileName = `${numberOfFiles}_van_ban_${formattedTime}.zip`;
      const zipPath = `${downloadDir}/${zipFileName}`;

      // Tạo file ZIP
      await zip(tempDir, zipPath);
      console.log("File ZIP đã được tạo:", zipPath);

      // Xóa thư mục tạm
      await RNFS.unlink(tempDir);

      return zipPath;
    } catch (error) {
      console.error("Lỗi khi tải và nén file:", error);
      Toast.show({ type: "error", text1: "Lỗi", text2: error.message });
    }
  };
  const handleShare = async () => {
    try {
      const zipPath = await handeDownloadAndZip();
      await shareZipFile(zipPath);
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  // Hàm chia sẻ file ZIP
  const shareZipFile = async (zipPath) => {
    try {
      // Thêm tiền tố 'file://' vào đường dẫn nếu chưa có
      const fileUri = zipPath?.startsWith("file://")
        ? zipPath
        : `file://${zipPath}`;

      // Kiểm tra xem file có tồn tại hay không
      const fileInfo = await FileSystem.getInfoAsync(fileUri);
      if (!fileInfo.exists) {
        Alert.alert("Lỗi", "File không tồn tại tại đường dẫn đã chỉ định.");
        return;
      }

      // Kiểm tra xem tính năng chia sẻ có được hỗ trợ không
      if (!(await Sharing.isAvailableAsync())) {
        Alert.alert("Lỗi", "Chia sẻ file không được hỗ trợ trên thiết bị này.");
        return;
      }

      // Thực hiện chia sẻ file
      await Sharing.shareAsync(fileUri);
      console.log("File đã được chia sẻ:", fileUri);
    } catch (error) {
      console.error("Lỗi khi chia sẻ file:", error);
      Alert.alert("Lỗi", "Không thể chia sẻ file.");
    }
  };

  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      var value = JSON.stringify(remoteMessage);
      var value1 = JSON.parse(value);
      var key = JSON.parse(JSON.stringify(value1.data)).key;
      var code = JSON.parse(JSON.stringify(value1.data)).code;
      var notification = value1.notification;

      if (key == "0") {
        var otp = notification.body;
        createAlertCustom(i18n.t("kyloText1") + otp);
        global.otp = otp;
      }

      if (key == "1") {
        console.log("ky lo 2")
        setTitle(i18n.t("kyloText2"));
        global.code = code;
        setModalVisible(!modalVisible);
      }
      if (key == "2") {
        LocalPush(notification.body);
      }
      if (key == "3") {
        LocalPush(i18n.t("kyloText3"));
      }
    });
    return unsubscribe;
  }, []);

  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("errNointernet"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "Đóng", onPress: () => console.log("OK Pressed") },
    ]);

  const confirmPIN = () => {
    // Check action type and handle accordingly
    if (actionType === "sign") {
      // Handle sign action
      NetInfo.fetch().then((state) => {
        if (state.isConnected == true) {
          const dev_id = global.UUID;
          const idcts = global.id;
          const pin = value;
          const Datakylo = [];
          for (let i = 0; i < items.length; i++) {
            const item = {
              Code: items[i].Code,
              device_id: dev_id,
              IDCTS: idcts,
              pincode: pin,
            };
            Datakylo.push(item);
          }
          console.log("Datakylo", Datakylo);
          setSignStatus("signing"); // Đang chờ ký
          setLoading(true);
          setShowPopPin(!showPopPin);
          const url =
            "https://apisign.nacencomm.vn/api/APISigncore/Kyarr_Mobilesign_Object";
          fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify(Datakylo),
          })
            .then((response) => response.json())
            .then((responseJson) => {
              const res = JSON.parse(responseJson);

              let successCount = 0;
              let failCount = 0;

              res.forEach((item, index) => {
                if (item.Trangthaiky === "1") {
                  successCount++;
                  items[index].KetQuaKy = item.Trangthaiky;
                } else {
                  failCount++;
                }
              });

              setSuccessCount(successCount);
              setFailCount(failCount);

              if (successCount > 0) {
                setSignStatus("signed");
              } else {
                setSignStatus("signed"); // Still set to "signed" to show the failed state in UI
              }

              setLoading(false);
            })
            .catch((error) => {
              console.error(error);
              setLoading(false);
              setSuccessCount(0);
              setFailCount(items.length);
              setSignStatus("signed"); // Show failed state in UI
            });
        } else {
          createNo_internet();
        }
      });
    } else if (actionType === "reject") {
      // Handle reject action with single API call for all items
      console.log("Reject action triggered");
      setShowPopPin(!showPopPin);
      
      // Set status to signing while processing
      setSignStatus("signing");
      setLoading(true);
      
      // Prepare data for reject API call
      const dev_id = global.UUID;
      const idcts = global.id;
      const pin = value;
      const rejectData = items.map(item => ({
        Code: item.Code,
        device_id: dev_id,
        IDCTS: idcts,
        pincode: pin
      }));
      
      // Use the batch reject API
      const url = "https://apisign.nacencomm.vn/api/APISigncore/Tuchoikylo";
      fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify(rejectData),
      })
        .then((response) => response.json())
        .then((responseJson) => {
          const res = JSON.parse(responseJson);
          console.log("Reject response:", res);
          let successCount = 0;
          let failCount = 0;
          
          res.forEach((item, index) => {
            // Check Trangthaituchoi field for success (1 = success)
            if (item.Trangthaituchoi === 1) {
              successCount++;
            } else {
              failCount++;
            }
          });
          
          setSuccessCount(successCount);
          setFailCount(failCount);
          
          if (successCount > 0) {
            setSignStatus("signed");
          } else {
            setSignStatus("signed"); // Still set to "signed" to show the failed state in UI
          }
          
          setLoading(false);
        })
        .catch((error) => {
          console.error(error);
          setLoading(false);
          setSuccessCount(0);
          setFailCount(items.length);
          setSignStatus("signed"); // Show failed state in UI
        });
    }
    
    // Reset action type after handling
    setActionType(null);
  };

  useEffect(() => {
    if (value?.length === CELL_COUNT) confirmPIN();
  }, [value]);
  // Hiển thị thông tin
  const renderContentInfo = () => {
    return (
      <>
        <View style={{ gap: 12, width: "100%", marginBottom: 16 }}>
          <View style={styles.detail}>
            <Text style={styles.detailText}>
              {i18n.t("document.request_code")}
            </Text>
            <Text style={[styles.detailText, styles.detailRight]}>
              {items[0].Code}
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailText}>{i18n.t("document.domain")}</Text>
            <Text style={[styles.detailText, styles.detailRight]}>
              Ca2.SignPlatform
            </Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailText}>{i18n.t("document.cts")}</Text>
            <Text style={[styles.detailText, styles.detailRight]}>
              {global.cn}
            </Text>
          </View>
        </View>
      </>
    );
  };
  // Xử lý từng trạng thái
  const renderContentByStatus = () => {
    switch (signStatus) {
      case "notSigned":
        return (
          <>
            <Image
              source={require("../../img/SignDoc.png")}
              style={{ width: 48, height: 48 }}
            />
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {isRejecting ? i18n.t("document.reject_tai_lieu_slog") : i18n.t("document.ky_tai_lieu_slog")}
            </Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("KyTaiLieuList", { items })}
              >
                <Text style={[styles.link, styles.bigLink]}>
                  {i18n.t("document.num_doc", { num: items.length })}
                </Text>
              </TouchableOpacity>
            </View>
            <Divider dashed={true} length="100%" />
            {renderContentInfo()}
            <View style={{ gap: 8, width: "100%" }}>
              <TouchableOpacity
                style={[styles.btn, { backgroundColor: "#1858EA" }]}
                onPress={handleSign}
              >
                <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                  {i18n.t("document.sign_doc")} ({formatTime(remainingTime)})
                </Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.btn} onPress={handleReject}>
                <Text style={styles.btnText}>{i18n.t("document.reject")}</Text>
              </TouchableOpacity>
            </View>
          </>
        );

      case "signing":
        return (
          <>
            <View>
              <Image
                source={require("../../img/SignDoc.png")}
                style={{ width: 48, height: 48 }}
              />
              <Image
                source={require("../../img/StatusLoadingKy.png")}
                style={styles.status}
              />
            </View>
            <Text style={{ fontSize: 14, lineHeight: 20 }}>
              {isRejecting ? i18n.t("document.reject_loading") : i18n.t("document.sign_loading")}
            </Text>
            <View style={{ flexDirection: "row", gap: 4 }}>
              <TouchableOpacity
                onPress={() => navigation.navigate("KyTaiLieuList", { items })}
              >
                <Text style={[styles.link, styles.bigLink]}>
                  {i18n.t("document.num_doc", { num: items.length })}
                </Text>
              </TouchableOpacity>
            </View>
            <Divider dashed={true} length="100%" />
            {renderContentInfo()}
            <ActivityIndicator size="large" color="#1A1B27" />
          </>
        );

      case "signed":
        const totalCount = items.length; // Tổng số file cần ký

        if (successCount === totalCount) {
          // Trường hợp toàn bộ ký/thừ chối thành công
          return (
            <>
              <View>
                <Image
                  source={require("../../img/SignDoc.png")}
                  style={{ width: 48, height: 48 }}
                />
                <Image
                  source={require("../../img/DocStatusApproved.png")}
                  style={styles.status}
                />
              </View>
              <Text style={styles.signed}>
                {isRejecting ? i18n.t("document.reject_success_all") : i18n.t("document.sign_success_all")}
              </Text>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("KyTaiLieuList", { items })
                  }
                >
                  <Text style={[styles.link, styles.bigLink]}>
                    {i18n.t("document.num_doc", { num: items.length })}
                  </Text>
                </TouchableOpacity>
              </View>
              <Divider dashed={true} length="100%" />
              {renderContentInfo()}
              <View style={{ width: "100%", flexDirection: "row" }}>
                {/* <TouchableOpacity
                  style={styles.successAction}
                  onPress={handleShare}
                >
                  <View style={styles.circleBtn}>
                    <Image
                      source={require("../../img/DownloadSimple.png")}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text style={[styles.btnText, { color: "#0F172A" }]}>
                    {i18n.t("document.download_short")}
                  </Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.successAction}
                  onPress={handleShare}
                >
                  <View style={styles.circleBtn}>
                    <Image
                      source={require("../../img/share.png")}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text style={[styles.btnText, { color: "#0F172A" }]}>
                    {i18n.t("document.download_share_short_ios")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          );
        } else if (successCount > 0) {
          // Trường hợp ký/từ chối thành công một phần
          return (
            <>
              <View>
                <Image
                  source={require("../../img/SignDoc.png")}
                  style={{ width: 48, height: 48 }}
                />
              </View>
              <Text style={styles.signed}>
                {isRejecting ? i18n.t("document.reject_partial") : i18n.t("document.sign_partial")}
              </Text>
              <Text>
                {isRejecting ? 
                  i18n.t("document.num_reject_partial", {
                    successCount,
                    failCount,
                  }) : 
                  i18n.t("document.num_sign_partial", {
                    successCount,
                    failCount,
                  })
                }
              </Text>
              <View style={{ flexDirection: "row", gap: 4 }}>
                <TouchableOpacity
                  onPress={() =>
                    navigation.navigate("KyTaiLieuList", { items })
                  }
                >
                  <Text style={[styles.link, styles.bigLink]}>
                    {i18n.t("document.view_list_file")}
                  </Text>
                </TouchableOpacity>
              </View>
              <Divider dashed={true} length="100%" />
              {renderContentInfo()}
              <View style={{ width: "100%", flexDirection: "row" }}>
                {/* <TouchableOpacity
                  style={styles.successAction}
                  onPress={handleShare}
                >
                  <View style={styles.circleBtn}>
                    <Image
                      source={require("../../img/DownloadSimple.png")}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text style={[styles.btnText, { color: "#0F172A" }]}>
                    {i18n.t("document.download_short")}
                  </Text>
                </TouchableOpacity> */}
                <TouchableOpacity
                  style={styles.successAction}
                  onPress={handleShare}
                >
                  <View style={styles.circleBtn}>
                    <Image
                      source={require("../../img/share.png")}
                      style={{ width: 24, height: 24 }}
                    />
                  </View>
                  <Text style={[styles.btnText, { color: "#0F172A" }]}>
                    {i18n.t("document.download_share_short_ios")}
                  </Text>
                </TouchableOpacity>
              </View>
            </>
          );
        } else {
          // Trường hợp thất bại toàn bộ
          return (
            <>
              <View>
                <Image
                  source={require("../../img/SignDoc.png")}
                  style={{ width: 48, height: 48 }}
                />
                <Image
                  source={require("../../img/DocStatusRejected.png")} // Biểu tượng ký/thừ chối thất bại toàn bộ
                  style={styles.status}
                />
              </View>
              <Divider dashed={true} length="100%" />
              {renderContentInfo()}
              <Text style={styles.signFailed}>
                {isRejecting ? i18n.t("document.reject_failed") : i18n.t("document.sign_failed")}
              </Text>
              <Text style={{ fontSize: 14, lineHeight: 20 }}>
                {isRejecting ? i18n.t("document.please_resend_request_reject") : i18n.t("document.please_resend_request")}
              </Text>
            </>
          );
        }

      default:
        return null;
    }
  };
  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("document.ky_tai_lieu")}
      />
      <View style={styles.container}>
        <View
          style={{
            backgroundColor: "#ffffff",
            padding: 16,
            borderRadius: 8,
            width: "100%",
            alignItems: "center",
            gap: 16,
          }}
        >
          {renderContentByStatus()}
        </View>
      </View>
      <DialogLoi
        title="Yêu cầu của bạn không thực hiện được"
        message=" Chứng thư số của bạn đã hết lượt ký hoặc hết hiệu lực"
        buttonText="Mua thêm"
        visible={isModalHetHanVisible}
        onClose={() => setIsModalHetHanVisible(false)}
        onClickButton={handleMuaThemCKS}
        iconName="kiHetHan"
      />
      <ModalPinCode
        value={value}
        setValue={setValue}
        showPopPin={showPopPin}
        setShowPopPin={setShowPopPin}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    paddingHorizontal: 16,
    width: "100%",
  },
  status: {
    width: 16,
    height: 16,
    position: "absolute",
    bottom: 0,
    right: 0,
  },

  linkSingle: {
    padding: 6,
    justifyContent: "center",
    alignItems: "center",
  },
  link: {
    color: "#1858EA",
    fontSize: 14,
    lineHeight: 20,
    textDecorationLine: "underline",
  },
  bigLink: {
    fontSize: 18,
    lineHeight: 26,
    fontWeight: "700",
  },
  signed: {
    color: "#21C75E",
    fontSize: 14,
    lineHeight: 20,
    color: "#21C75E",
    fontWeight: "600",
  },
  signFailed: {
    fontSize: 14,
    lineHeight: 20,
    color: "#FF0000",
    fontWeight: "600",
  },
  detail: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  detailText: {
    maxWidth: "50%",
    fontSize: 13,
    lineHeight: 18,
    fontWeight: "500",
    color: "#6B7280",
  },
  detailRight: {
    color: "#0F172A",
    textAlign: "right",
  },
  btn: {
    padding: 12,
    alignItems: "center",
    borderRadius: 8,
  },
  btnText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
    color: "#6B7280",
  },
  successAction: {
    flex: 1,
    alignItems: "center",
    gap: 8,
  },
  successActionText: {},
  circleBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#E6F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
});