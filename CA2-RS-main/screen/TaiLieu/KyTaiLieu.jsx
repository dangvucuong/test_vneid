import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import messaging from "@react-native-firebase/messaging";
import ReactNativeBiometrics from "react-native-biometrics";
import { useI18n } from "../../utils/i18n";
import ModalPinCode from "../component/ModalPinCode";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import Divider from "../component/Divider";
import RNFS from "react-native-fs";
import DialogLoi from "../TaiKhoan/components/DiaLogLoi";
import moment from "moment";

const CELL_COUNT = 6;
const rnBiometrics = new ReactNativeBiometrics();

export default function KyTaiLieu({ navigation, route }) {
  const { i18n } = useI18n();
  const { item } = route.params || {};

  useEffect(() => {
    if (!item) {
      Alert.alert("CA2 REMOTE SIGNING", "Không tìm thấy tài liệu cần ký.");
      navigation.goBack();
    }
  }, [item, navigation]);

  if (!item) {
    return null;
  }
  const [signed, setSigned] = useState(false);
  const [loading, setLoading] = useState(false);

  const [showPopPin, setShowPopPin] = useState(false);
  const [typePin, setTypePin] = useState("0");
  const [value, setValue] = useState("");
  const [remainingTime, setRemainingTime] = useState(120); // 120 seconds = 2 minutes
  const [timerActive, setTimerActive] = useState(true); // To control the timer
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
  const [isModalHetHanVisible, setIsModalHetHanVisible] = useState(false);
  const handleMuaThemCKS = () => {
    setIsModalHetHanVisible(false);
    navigation.navigate("DangKy");
  };
  const handleSign = async () => {
    // Stop the timer when the user presses the button
    // setTimerActive(false);
    if (
      global.NgayTK &&
      moment(global.NgayKT, "YYYY-MM-DD").isBefore(moment(), "day")
    ) {
      console.log("het han");
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
            setTypePin("0");
            setShowPopPin(!showPopPin);
            setValue("");
          } else {
          }
        })
        .catch((error) => {
          console.log("biometrics failed: " + error);
        });
    } else {
      setTypePin("0");
      setShowPopPin(!showPopPin);
      setValue("");
    }
  };

  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("errNointernet"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "Đóng", onPress: () => console.log("OK Pressed") },
    ]);

  // const downloadFile = async () => {
  //   console.log(item.Linkfile_goc);

  //   Linking.openURL(item.Linkfile_goc)
  //     .then(() => console.log('URL opened:', item.Linkfile_goc))
  //     .catch((err) => console.error('Failed to open URL:', err));
  // };
  const downloadFile = async () => {
    // try {
    //   const fileUrl = item.Linkfile_goc;
    //   const fileName = item.TenVB;
    //   // Đường dẫn lưu file
    //   const filePath =
    //     Platform.OS === 'ios'
    //       ? `${RNFS.DocumentDirectoryPath}/${fileName}`
    //       : `${RNFS.DownloadDirectoryPath}/${fileName}`;

    //   // Tải file
    //   const download = RNFS.downloadFile({
    //     fromUrl: fileUrl,
    //     toFile: filePath,
    //   });

    //   const result = await download.promise;

    //   if (result.statusCode === 200) {
    //     console.log('File downloaded to:', filePath);

    //     if (Platform.OS === 'ios') {
    //       // Chia sẻ file trên iOS
    //       await Share.share({
    //         url: filePath,
    //         message: filePath,
    //       });
    //     } else {
    //       // Thông báo tải xong trên Android
    //       Alert.alert('Thành công', `File đã tải xuống: ${filePath}`);
    //     }
    //   } else {
    //     throw new Error('Lỗi khi tải file, mã trạng thái: ' + result.statusCode);
    //   }
    // } catch (error) {
    //   console.error('Lỗi khi tải file:', error);
    //   Alert.alert('Lỗi', 'Không thể tải file. Vui lòng thử lại.');
    // }
    Linking.openURL(item.Linkfile_goc)
      .then(() => console.log("URL opened:", item.Linkfile_goc))
      .catch((err) => console.error("Failed to open URL:", err));
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: item.Linkfile_goc,
      });
      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };

  const confirmPIN = async () => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        const pin = value;
        if (typePin === "0") {
          const url =
            "https://apisign.nacencomm.vn/api/APISigncore/Ky_Mobilesign?Code=" +
            item.Code +
            "&device_id=" +
            global.UUID +
            "&IDCTS=" +
            global.id +
            "&pincode=" +
            pin;
          fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          })
            .then((response) => response.json())
            .then((responseJson) => {
              if (responseJson == 1) {
                setSigned(true);
              } else if (responseJson == 0) {
                createAlertCustom(i18n.t("signfileErr2"));
              } else if (responseJson == -1) {
                createAlertCustom(i18n.t("signfileErr3"));
              } else if (responseJson == -2) {
                createAlertCustom(i18n.t("signfileErr7"));
              } else if (responseJson == -3) {
                createAlertCustom(i18n.t("signfileErr4"));
              } else if (responseJson == -4) {
                createAlertCustom(i18n.t("signfileErr5"));
              } else {
                createAlertCustom(i18n.t("signfileErr6"));
              }
            })
            .catch((error) => {
              console.log("err:", error);
              // Alert.alert("CA2 Remote Signing", "Lỗi hệ thống. Vui lòng thử lại sau");
            });
          setShowPopPin(!showPopPin);
        } else {
          const url =
            "https://apisign.nacencomm.vn/api/APISigncore/Tuchoiky_mobilesign?Code=" +
            item.Code +
            "&device_id=" +
            global.UUID +
            "&IDCTS=" +
            global.id +
            "&pincode=" +
            pin;
          fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          })
            .then((response) => response.json())
            .then((responseJson) => {
              if (responseJson == 1) {
                Alert.alert("CA2 REMOTE SIGNING", i18n.t("signfileText9"));
                navigation.navigate("HomeWrapper", { screen: "Home" });
              } else {
                createAlertCustom(i18n.t("signfileErr8"));
              }
            })
            .catch((error) => {
              console.log("err:", error);
              Alert.alert("CA2 Remote Signing", i18n.t("signfileErr6"));
            });
          setShowPopPin(!showPopPin);
        }
        setTypePin("0");
      } else {
        createNo_internet();
      }
    });
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
            setTypePin("1");
            setShowPopPin(!showPopPin);
            setValue("");
          } else {
          }
        })
        .catch((error) => {
          console.log("biometrics failed: " + error);
        });
    } else {
      setTypePin("1");
      setShowPopPin(!showPopPin);
      setValue("");
    }
  };
  // Format time in MM:SS format
  const formatTime = (seconds) => {
    const minutes = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${minutes}:${secs < 10 ? "0" : ""}${secs}`;
  };
  useEffect(() => {
    if (value?.length === CELL_COUNT) confirmPIN();
  }, [value]);

  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     var value = JSON.stringify(remoteMessage);
  //     console.log("Remote message kytailieu", remoteMessage);
  //     //LocalPush(value);
  //     var value1 = JSON.parse(value);

  //     var key = JSON.parse(JSON.stringify(value1.data)).key;
  //     var code = JSON.parse(JSON.stringify(value1.data)).code;
  //     //console.log("code:", code);
  //     var notification = value1.notification;

  //     if (key == "3") {
  //       // setloadingVisible(false);
  //       // navigation.navigate("SignDone", {
  //       //   val: val,
  //       //   code: code,
  //       // });
  //     }
  //   });
  //   return unsubscribe;
  // }, []);
  // const DocumentContent = () => (
  //   <View
  //     style={{
  //       backgroundColor: "#ffffff",
  //       padding: 16,
  //       borderRadius: 8,
  //       width: "100%",
  //       alignItems: "center",
  //       gap: 16,
  //     }}
  //   >
  //     <View>
  //       <Image
  //         source={require("../../img/SignDoc.png")}
  //         style={{ width: 48, height: 48 }}
  //       />
  //       {signed && (
  //         <Image
  //           source={require("../../img/DocStatusApproved.png")}
  //           style={styles.status}
  //         />
  //       )}
  //     </View>
  //     <Text style={{ fontSize: 14, lineHeight: 20 }}>
  //       {i18n.t(
  //         loading
  //           ? "document.sign_loading"
  //           : signed
  //           ? "document.sign_success"
  //           : "document.ky_tai_lieu_slog"
  //       )}
  //     </Text>
  //     <View style={{ gap: 4 }}>
  //       <Text style={[styles.bigLink, { textAlign: "center" }]}>
  //         {item.TenVB}
  //       </Text>
  //       <TouchableOpacity
  //         style={styles.linkSingle}
  //         onPress={() => navigation.navigate("PreviewPDF", { item })}
  //       >
  //         <Text style={styles.link}>{i18n.t("document.xem_tai_lieu")}</Text>
  //       </TouchableOpacity>
  //     </View>
  //     <Divider dashed={true} />
  //     <DocumentDetails />
  //   </View>
  // );

  // const LoadingState = () => (
  //   <View
  //     style={{
  //       backgroundColor: "#ffffff",
  //       padding: 16,
  //       borderRadius: 8,
  //       width: "100%",
  //       alignItems: "center",
  //       gap: 16,
  //     }}
  //   >
  //     <ActivityIndicator size="large" color="#1858EA" />
  //     <Text>{i18n.t("document.sign_loading")}</Text>
  //   </View>
  // );

  // const SignedState = () => (
  //   <View
  //     style={{
  //       backgroundColor: "#ffffff",
  //       padding: 16,
  //       borderRadius: 8,
  //       width: "100%",
  //       alignItems: "center",
  //       gap: 16,
  //     }}
  //   >
  //     <DocumentContent />
  //     <View
  //       style={{
  //         width: "100%",
  //         flexDirection: "row",
  //         justifyContent: "space-around",
  //       }}
  //     >
  //       <TouchableOpacity style={styles.successAction} onPress={downloadFile}>
  //         <View style={styles.circleBtn}>
  //           <Image
  //             source={require("../../img/DownloadSimple.png")}
  //             style={{ width: 24, height: 24 }}
  //           />
  //         </View>
  //         <Text style={[styles.btnText, { color: "#0F172A" }]}>
  //           {i18n.t("document.download_short")}
  //         </Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.successAction} onPress={onShare}>
  //         <View style={styles.circleBtn}>
  //           <Image
  //             source={require("../../img/share.png")}
  //             style={{ width: 24, height: 24 }}
  //           />
  //         </View>
  //         <Text style={[styles.btnText, { color: "#0F172A" }]}>
  //           {i18n.t("document.share_short")}
  //         </Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  // const UnsignedState = () => (
  //   <View
  //     style={{
  //       backgroundColor: "#ffffff",
  //       padding: 16,
  //       borderRadius: 8,
  //       width: "100%",
  //       alignItems: "center",
  //       gap: 16,
  //     }}
  //   >
  //     <DocumentContent />
  //     <View
  //       style={{
  //         width: "100%",
  //         flexDirection: "row",
  //         justifyContent: "space-around",
  //       }}
  //     >
  //       <TouchableOpacity
  //         style={[styles.btn, { backgroundColor: "#1858EA" }]}
  //         onPress={handleSign}
  //       >
  //         <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
  //           {i18n.t("document.sign_doc")} ({formatTime(remainingTime)})
  //         </Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.btn} onPress={handleReject}>
  //         <Text style={styles.btnText}>{i18n.t("document.reject")}</Text>
  //       </TouchableOpacity>
  //     </View>
  //   </View>
  // );

  // const DocumentDetails = () => (
  //   <View style={{ gap: 12, width: "100%", marginBottom: 16 }}>
  //     <View style={styles.detail}>
  //       <Text style={styles.detailText}>{i18n.t("document.request_code")}</Text>
  //       <Text style={[styles.detailText, styles.detailRight]}>{item.Code}</Text>
  //     </View>
  //     <View style={styles.detail}>
  //       <Text style={styles.detailText}>{i18n.t("document.domain")}</Text>
  //       <Text style={[styles.detailText, styles.detailRight]}>
  //         Ca2.SignPlatform
  //       </Text>
  //     </View>
  //     <View style={styles.detail}>
  //       <Text style={styles.detailText}>{i18n.t("document.cts")}</Text>
  //       <Text style={[styles.detailText, styles.detailRight]}>{global.cn}</Text>
  //     </View>
  //   </View>
  // );

  // return (
  //   <PageContainer>
  //     <PageHeader
  //       onBack={() => navigation.goBack()}
  //       title={i18n.t("document.ky_tai_lieu")}
  //     />
  //     <View style={styles.container}>
  //       {loading ? (
  //         <LoadingState />
  //       ) : signed ? (
  //         <SignedState />
  //       ) : (
  //         <UnsignedState />
  //       )}
  //     </View>
  //     <ModalPinCode
  //       value={value}
  //       setValue={setValue}
  //       showPopPin={showPopPin}
  //       setShowPopPin={setShowPopPin}
  //     />
  //   </PageContainer>
  // );

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.navigate("Home")}
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
          <View>
            <Image
              source={require("../../img/SignDoc.png")}
              style={{ width: 48, height: 48 }}
            />
            {signed && (
              <Image
                source={require("../../img/DocStatusApproved.png")}
                style={styles.status}
              />
            )}
          </View>
          <Text style={{ fontSize: 14, lineHeight: 20 }}>
            {i18n.t(
              loading
                ? "document.sign_loading"
                : signed
                ? "document.sign_success"
                : "document.ky_tai_lieu_slog"
            )}
          </Text>
          <View style={{ gap: 4 }}>
            <Text style={[styles.bigLink, { textAlign: "center" }]}>
              {item.TenVB}
            </Text>
            <TouchableOpacity
              style={styles.linkSingle}
              onPress={() => navigation.navigate("PreviewPDF", { item })}
            >
              <Text style={styles.link}>{i18n.t("document.xem_tai_lieu")}</Text>
            </TouchableOpacity>
          </View>
          <Divider dashed={true} />

          <View style={{ gap: 12, width: "100%", marginBottom: 16 }}>
            <View style={styles.detail}>
              <Text style={styles.detailText}>
                {i18n.t("document.request_code")}
              </Text>
              <Text style={[styles.detailText, styles.detailRight]}>
                {item.Code}
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
          {!loading && (
            <>
              {signed ? (
                <View style={{ width: "100%", flexDirection: "row" }}>
                  <TouchableOpacity
                    style={styles.successAction}
                    onPress={downloadFile}
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
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.successAction}
                    onPress={onShare}
                  >
                    <View style={styles.circleBtn}>
                      <Image
                        source={require("../../img/share.png")}
                        style={{ width: 24, height: 24 }}
                      />
                    </View>
                    <Text style={[styles.btnText, { color: "#0F172A" }]}>
                      {i18n.t("document.share_short")}
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={{ gap: 8, width: "100%" }}>
                  <TouchableOpacity
                    style={[styles.btn, { backgroundColor: "#1858EA" }]}
                    onPress={handleSign}
                  >
                    <Text style={[styles.btnText, { color: "#FFFFFF" }]}>
                      {i18n.t("document.sign_doc")} ({formatTime(remainingTime)}
                      )
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.btn} onPress={handleReject}>
                    <Text style={styles.btnText}>
                      {i18n.t("document.reject")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </>
          )}
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

  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  modalHeader: {
    height: 20,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#0F172A",
    fontWeight: "400",
  },
  backButton: {
    position: "absolute",
    width: 24,
    height: 24,
    top: 16,
    zIndex: 99,
  },
  codeFieldRoot: {
    gap: 12,
    maxWidth: 232,
    alignSelf: "center",
  },
  cellRoot: {
    width: 32,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#DDE3EB",
    borderBottomWidth: 2,
  },
  cellText: {
    color: "#334155",
    fontSize: 28,
    lineHeight: 38,
    textAlign: "center",
  },
  focusCell: {
    borderBottomColor: "#4679EE",
  },
});
