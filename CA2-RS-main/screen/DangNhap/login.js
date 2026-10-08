import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import { I18n } from "i18n-js";
import React, { useEffect, useRef, useState, useCallback } from "react";
import {
  Alert,
  Animated,
  Dimensions,
  Image,
  KeyboardAvoidingView,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import GoBackButton from "../../component/Buttons/GoBackBtn";
import FaceID from "../../component/icon/FaceID";
import MainLayout from "../../layout";
import { en, vi } from "../../localize";
import AppStyle from "../../styles/AppStyle";
import { IMAGE_GROUP } from "../../utils/constant";
import { markLoggedIn } from "../../utils/sessionManager";
const rnBiometrics = new ReactNativeBiometrics();
const i18n = new I18n();
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
const defaultAvatar = require("../../img/UserAvatar.png");
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect } from "@react-navigation/native";

export default function Login({ navigation, route, props }) {
  const [locale, setlocale] = useState("vi");
  i18n.translations = { en, vi };
  i18n.locale = locale;
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);
  const [pic, setPic] = useState(defaultAvatar);

  const [bio, setbio] = useState(false);
  const [face, setface] = useState(false);
  const [touch, settouch] = useState(false);

  const [text, setText] = useState("");
  const [lockModal, setlockModal] = useState(false);
  const [error, setError] = useState("");
  const updateError = (error, stateUpdater) => {
    stateUpdater(error);
    setTimeout(() => {
      stateUpdater("");
    }, 3500);
  };
  useFocusEffect(
    useCallback(() => {
      setText(""); // Reset text khi màn hình được focus
    }, [])
  );
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const fadeIn = () => {
    // Will change fadeAnim value to 1 in 5 seconds
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 2000,
      useNativeDriver: true,
    }).start();
  };

  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("errNointernet"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [modal1Visible, setModal1Visible] = useState(false);

  const UpdateRegid = (devid, regid) => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        var dev_id = global.UUID;
        var token = global.RegID;
        var idcts = global.idcts;

        var pin = text;
        //  console.log(idcts);
        var url =
          "https://apisign.nacencomm.vn/api/APISigncore/CapnhatRegID?device_id=" +
          devid +
          "&regid=" +
          regid;

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
            var res = JSON.stringify(responseJson);
            console.log("Update regid", responseJson);
          })
          .catch((error) => {
            //  console.error(error);
          });
      } else {
        createNo_internet();
      }
    });
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("@idcts");
        global.idcts = value ? value : "";
        const cn = await AsyncStorage.getItem("@cn");
        global.cn = cn ? cn : "";
      } catch (e) {}
    };
    getData();
  }, []);

  useEffect(() => {
    rnBiometrics.isSensorAvailable().then((resultObject) => {
      const { available, biometryType } = resultObject;
      //  console.log("Biometric Support: ", available);
      if (available == false) {
        setbio(false); // ko support
      } else {
        setbio(true);
        console.log(biometryType);
        if (available && biometryType === BiometryTypes.TouchID) {
          console.log(biometryType);
          settouch(true);
        } else if (available && biometryType === BiometryTypes.FaceID) {
          setface(true);
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          //android
          //     console.log('touch');
          setbio(true);
        } else {
          console.log("Biometrics not supported");
        }
      }
    });
  }, []);

  const Login = () => {
    if (text == "") {
      updateError(i18n.t("pinErr4"), setError);
      // createAlertCustom("Vui lòng nhập mã PIN");
    } else {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected == true) {
          var dev_id = global.UUID;
          var token = await AsyncStorage.getItem("@regid");
          var url =
            "https://apisign.nacencomm.vn/api/APISigncore/Kiemtrathietbi?device_id=" +
            dev_id;
          fetch(url, {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          })
            .then((response) => response.json())
            .then(async (responseJson) => {
              if (responseJson > 0) {
                var id = responseJson;
                global.idcts = id;
                await AsyncStorage.setItem("@idcts", id.toString());
                var pin = text;
                var url1 =
                  "https://apisign.nacencomm.vn/api/APISigncore/Dangnhap?idcts=" +
                  id +
                  "&device_id=" +
                  dev_id +
                  "&pincode=" +
                  pin;
                fetch(url1, {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                })
                  .then((response) => response.json())
                  .then(async (responseJson) => {
                    var res = JSON.stringify(responseJson);
                    //   console.log(responseJson);

                    if (responseJson > 1) {
                      UpdateRegid(global.UUID, global.RegID);
                      await AsyncStorage.setItem("@countPin", "5");
                      await markLoggedIn();
                      navigation.navigate("HomeWrapper", { screen: "Home" });
                    } else if (responseJson == 0) {
                      updateError(i18n.t("loginErr1"), setError);
                      //createAlertCustom("Đăng nhập không thành công");
                    } else if (responseJson == -1) {
                      updateError(i18n.t("loginErr2"), setError);
                      // createAlertCustom("Có lỗi khi đăng nhập");
                    } else if (responseJson == -2) {
                      let count = await AsyncStorage.getItem("@countPin");
                      var left = parseInt(count) - 1;
                      await AsyncStorage.setItem("@countPin", left.toString());
                      //alert(count);
                      updateError(
                        i18n.t("loginErr3") +
                          "." +
                          i18n.t("loginErr8") +
                          " " +
                          left.toString() +
                          " " +
                          i18n.t("loginErr9"),
                        setError
                      );

                      // createAlertCustom("Mã PIN không chính xác");
                    } else if (responseJson == -3) {
                      updateError(i18n.t("loginErr4"), setError);
                      //  createAlertCustom("Tài khoản không tồn tại");
                    } else if (responseJson == -4) {
                      setlockModal(true);
                      //   updateError(i18n.t('loginErr5'), setError);
                      // createAlertCustom("Tài khoản không hợp lệ hăojc không còn hoạt động");
                    } else if (responseJson == -5) {
                      setlockModal(true);
                      //   updateError(i18n.t('loginErr6'), setError);
                      //  createAlertCustom("Mã kết nối không hợp lệ");
                    } else if (responseJson == -6) {
                      //setlockModal(true);
                      updateError(i18n.t("loginErr6"), setError);
                      // createAlertCustom("Mã kết nối không hợp lệ");
                    } else {
                      updateError(i18n.t("loginErr7"), setError);
                      //createAlertCustom("Có lỗi xảy ra. Vui lòng thử lại");
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          createNo_internet();
        }
      });
    }
  };

  const BiometricAuthen = async () => {
    const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
    const getcount = await AsyncStorage.getItem("@countPin");
    if (getcount == "0") {
      setlockModal(true);
    } else {
      if (factor == "1") {
        rnBiometrics
          .simplePrompt({
            promptMessage: "Confirm biometric",
            cancelButtonText: "Cancel",
          })
          .then(async (resultObject) => {
            const { success } = resultObject;

            if (success) {
              UpdateRegid(global.UUID, global.RegID);
              await AsyncStorage.setItem("@countPin", "5");
              await markLoggedIn();
              navigation.navigate("HomeWrapper", { screen: "Home" });
            } else {
            }
          })
          .catch((error) => {
            console.log("biometrics failed: " + error);
          });
      } else {
        Alert.alert("CA2 Remote Signing", "Chưa kích hoạt sinh trắc học")
        //setModalVisible(true);
      }
    }
  };

renderButton = () => {
  if (touch === true) {
    return (
      <View style={{ width: "100%", alignItems: "center", marginTop: 10 }}>
        <TouchableOpacity
          style={{
            marginTop: 20, // Giảm từ 50 xuống 20 để khoảng cách hợp lý
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center" // Thêm để căn giữa theo chiều ngang
          }}
          onPress={BiometricAuthen}
        >
          <Image source={require("../../img/fingerprint.png")} style={{}} />
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              fontWeight: "600",
              marginLeft: 10,
            }}
          >
            {i18n.t("loginText3")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  } else if (bio === true) {
    return (
      <View style={{ width: "100%", alignItems: "center"}}>
        <TouchableOpacity
          style={{
            marginTop: 20, // Giảm từ 50 xuống 20 để khoảng cách hợp lý
            alignItems: "center",
            flexDirection: "row",
            justifyContent: "center" // Thêm để căn giữa theo chiều ngang
          }}
          onPress={BiometricAuthen}
        >
          <Image source={require("../../img/FaceID.png")} style={{}} />
          <Text
            style={{
              fontSize: 14,
              lineHeight: 20,
              fontWeight: "600",
              marginLeft: 10,
            }}
          >
            {i18n.t("loginText4")}
          </Text>
        </TouchableOpacity>
      </View>
    );
  }
};

  //const navigation = props.useNavigation();
  return (
    <MainLayout
      NavBarTopProps={{
        left: <GoBackButton navigation={navigation} />,
      }}
    >
      <KeyboardAvoidingView
        style={styles.containeKeyBoard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={120} // Điều chỉnh offset nếu cần
      >
        <ScrollView
          style={{
            flex: 1,
            backgroundColor: "#fff",
            width: "100%",
          }}
          contentContainerStyle={{
            alignItems: "center",
            flexGrow: 1,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <View>
            <Image
              source={IMAGE_GROUP.welcome.remoteSigning}
              width={182}
              height={40.2}
            />
          </View>
          <View
            style={{
              display: "flex",
              width: "90%",
              height: 72,
              borderRadius: 6,
              marginTop: 20,
            }}
          >
            <Text style={styles.title}>Ký số cùng CA2 Remote Signing</Text>
            <Text style={styles.subtitle}>
              Vui lòng nhập mã PIN để đăng nhập vào tài khoản
            </Text>
            <View style={styles.userInfoContainer}>
              <Image style={styles.avatar} source={pic} />
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ color: "#0F172A", fontWeight: "600" }}>
                  {global.cn}
                </Text>
                <Text style={{ color: "#475569", fontSize: 12 }}>
                  ID: {global.idcts}
                </Text>
              </View>
            </View>
            <View
              style={{
                width: "100%",
                flexDirection: "column",
                position: "relative",
                paddingBottom: 10,
              }}
            >
              <TextInput
                style={{
                  display: "flex",
                  flexDirection: "column",
                  justifyContent: "center",
                  alignItems: "flex-start",
                  paddingRight: 16,
                  paddingLeft: 16,
                  gap: 8,
                  width: "100%",
                  height: 44,
                  backgroundColor: "#F3F4F6",
                  borderRadius: 6,
                  alignSelf: "stretch",
                  flexGrow: 0,
                  borderColor: error ? "red" : "transparent",
                  borderWidth: 1,
                }}
                onChangeText={(newText) => setText(newText)}
                keyboardType="number-pad"
                secureTextEntry={true}
                value={text}
                placeholder={"Nhập mã PIN để đăng nhập"}
                placeholderTextColor="#999"
              ></TextInput>
              {error ? (
                <Text
                  style={{
                    color: "red",
                    fontSize: 14,
                    padding: 4,
                    position: "absolute",
                    top: 44,
                    fontWeight: 200,
                  }}
                >
                  {error}
                </Text>
              ) : null}
            </View>
            {/* Move Fingerprint button outside TextInput container */}
            {!!bio && (
              <View style={{ width: "100%", marginTop: 10 }}>
                {renderButton()}
              </View>
            )}
            {/* Ensure Login button maintains original width and balance */}
            <TouchableOpacity
              style={{
                width: "100%", // Explicitly set to 90% to maintain balance
                height: 44,
                backgroundColor: "#1858EA",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                marginTop: 20,
              }}
              onPress={Login}
            >
              <Text style={AppStyle.buttonText}>{i18n.t("buttonNext")}</Text>
            </TouchableOpacity>
            {/* New Section like the image */}
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                width: "100%",
                marginTop: 20,
                marginBottom: 20,
              }}
            >
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#D1D5DB",
                }}
              />
              <Text
                style={{
                  marginHorizontal: 10,
                  color: "#9CA3AF",
                  fontSize: 14,
                }}
              >
                Hoặc
              </Text>
              <View
                style={{
                  flex: 1,
                  height: 1,
                  backgroundColor: "#D1D5DB",
                }}
              />
            </View>
            <TouchableOpacity
              style={{
                width: "100%",
                height: 44,
                backgroundColor: "#F3F4F6",
                alignItems: "center",
                justifyContent: "center",
                borderRadius: 10,
                borderWidth: 1,
                borderColor: "#D1D5DB",
              }}
              onPress={() => navigation.navigate("Kichhoat")} // Navigate to startLogin screen
            >
              <Text
                style={{
                  color: "#374151",
                  fontSize: 16,
                }}
              >
                Sử dụng tài khoản khác
              </Text>
            </TouchableOpacity>
          </View>

          {/* Keep the modals as they are */}
          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              setModalVisible(!modalVisible);
            }}
          >
            {/* Modal content remains unchanged */}
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={modal1Visible}
            onRequestClose={() => {
              setModal1Visible(!modal1Visible);
            }}
          >
            {/* Modal content remains unchanged */}
          </Modal>
          <Modal
            animationType="slide"
            transparent={true}
            visible={lockModal}
            onRequestClose={() => {
              setlockModal(!lockModal);
            }}
          >
            {/* Modal content remains unchanged */}
          </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </MainLayout>
  );
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    // marginTop: 30,
  },
  containeKeyBoard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },

  codeFieldRoot: {
    marginTop: 20,
    top: 50,
    position: "absolute",
    width: windowWidth - 60,
    marginLeft: "auto",
    marginRight: "auto",
  },
  cellRoot: {
    width: (windowWidth - 100) / 6,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    margin: 2,
  },
  cellText: {
    color: "#000",
    fontSize: 36,
    textAlign: "center",
  },
  focusCell: {
    borderBottomColor: "#007AFF",
    borderBottomWidth: 2,
  },
  //================= OTP FIELD
  codeFieldRootOTP: {
    marginTop: 20,
    top: 50,
    position: "absolute",
    width: 300,
    marginLeft: "auto",
    marginRight: "auto",
  },
  cellRootOTP: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    margin: 2,
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1858EA",
  },
  userInfoContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f0f0f0",
    padding: 15,
    borderRadius: 5,
    marginBottom: 20,
    gap: 8,
  },
  userIcon: {
    marginRight: 10,
  },
  userName: {
    fontSize: 16,
    fontWeight: "bold",
  },
  userId: {
    fontSize: 14,
    color: "#666",
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    color: "black",
    marginTop: 20,
    textAlign: "center",
  },
  subtitle: {
    fontSize: 16,
    color: "black",
    marginTop: 10,
    textAlign: "center",
    marginBottom: 20,
  },
  avatar: {
    width: 32,
    height: 32,
  },
});
