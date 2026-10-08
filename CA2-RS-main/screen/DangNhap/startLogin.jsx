import {
  ActivityIndicator,
  Image,
  Alert,
  Button,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import DefaultPreference from "react-native-default-preference";
import { i18n } from "../../utils/i18n";
import { AppStyle } from "../../styles";

const renderCustomPopup = ({
  appIconSource,
  appTitle,
  timeText,
  title,
  body,
}) => (
  <View>
    <Text>{title}</Text>
    <Text>{body}</Text>
    <Button
      title="My button"
      onPress={() => console.log("Popup button onPress!")}
    />
  </View>
);

export default function StartLogin({ navigation, route }) {
  const [loadingVisible, setloadingVisible] = useState(false);
  const [regvisible, setregvisible] = useState(false);

  const [locale, setlocale] = useState("vi");
  i18n.locale = locale;

  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
    DefaultPreference.set("EKYC_done", "0").then(function () {
      console.log("done");
    });
  }, []);

  let devid;

  useEffect(() => {
    const getData = async () => {
      try {
        const devid = await AsyncStorage.getItem("@devid");
        if (devid !== null) {
          NetInfo.fetch().then(async (state) => {
            if (state.isConnected == true) {
              var dev_id = await AsyncStorage.getItem("@devid");
              var url =
                "https://apisign.nacencomm.vn/api/APISigncore/LaythongtinCTS_DeviceID_HSDT?device_id=" +
                devid;
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
                  global.cn = responseJson.CN;
                  global.diachi = responseJson.Diachi;
                  global.Email = responseJson.Email;
                  global.GoiDK = responseJson.GoiDK;
                  global.HanGCN = responseJson.HanGCN;
                  global.Masothue = responseJson.Masothue;
                  global.NgayBD = responseJson.NgayBD;
                  global.NgayKT = responseJson.NgayKT;

                  global.O_Cert = responseJson.O;
                  global.NgayKT = responseJson.NgayKT;
                  global.Serial = responseJson.Serial;
                  global.Sothang = responseJson.Sothang;
                  global.id = responseJson.idcts;
                  global.idcts = responseJson.idcts;
                })
                .catch((error) => {
                  console.error(error);
                });
            } else {
              console.log("No internet");
            }
          });
        }
      } catch (e) {}
    };
    getData();
  }, []);
  const createNo_internet = () =>
    Alert.alert(
      "CA2 REMOTE SIGNING",
      "Không có kết nối internet. Vui lòng thử lại sau",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );

  const check = () => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected == true) {
        let checkreg = false;
        const checkreg_token = await AsyncStorage.getItem("@regid");
        if (checkreg_token == null) {
          // while (checkreg == false)
          // {
          //   setloadingVisible(true);
          //    var reg_token = await AsyncStorage.getItem('@regid');
          //   if (reg_token != null) {
          //     checkreg = true;
          //     setloadingVisible(false);
          //   }
          //   else {
          //     messaging()
          //       .getToken()
          //       .then(async (token) => {
          //         await AsyncStorage.setItem(
          //           '@regid',
          //           token,
          //         );
          //         checkreg = true;
          //         setloadingVisible(false);
          //         global.RegID = token;
          //       })
          //       .catch((error) => console.log(error));
          //   }
          // }
        }

        var id = await AsyncStorage.getItem("@devid");
        let headers = new Headers();
        headers.append(
          "Access-Control-Allow-Origin",
          "https://apisign.nacencomm.vn"
        );
        headers.append("Access-Control-Allow-Credentials", "true");

        fetch(
          "https://apisign.nacencomm.vn/api/APISigncore/Kiemtrathietbi?device_id=" +
            id,
          {
            method: "POST",
            headers: {
              Accept: "application/json",
              "Content-Type": "application/json",
            },
            body: JSON.stringify({}),
          }
        )
          .then((response) => response.json())
          .then((responseJson) => {
            var res = JSON.stringify(responseJson);
            // alert(res);
            // console.log(responseJson)
            if (res > 0) {
              global.idcts = res;

              fetch(
                "https://apisign.nacencomm.vn/api/APISigncore/Kiemtramapin?DeviceID=" +
                  id +
                  "&idcts=" +
                  res,
                {
                  method: "POST",
                  headers: {
                    Accept: "application/json",
                    "Content-Type": "application/json",
                  },
                  body: JSON.stringify({}),
                }
              )
                .then((response) => response.json())
                .then((responseJson) => {
                  var res1 = JSON.stringify(responseJson);
                  console.log(res1);
                  if (res1 === "1") {
                    navigation.navigate("Login");
                  } else {
                    navigation.navigate("SetupPin");
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            } else {
              navigation.navigate("Kichhoat");
              //alert('Chua co id');
            }
          })
          .catch((error) => {
            //  console.error(error);
          });
      } else {
        createNo_internet();
      }
    });
  };

  return (
    <View style={[AppStyle.container, style.root]}>
      <Modal
        animationType="slide"
        transparent={true}
        visible={loadingVisible}
        onRequestClose={() => {
          setModalVisible(!loadingVisible);
        }}
      >
        <View style={style.container}>
          <View
            style={{
              position: "absolute",
              width: 327,
              height: 160,
              top: 239,
              backgroundColor: "transparent",
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
                color: "#fff",
                fontWeight: "bold",
              }}
            >
              CA2 REMOTE SIGNING
            </Text>
            <Text
              style={{
                position: "absolute",
                width: 297,
                height: 60,
                left: 12,
                top: 58,
                fontSize: 16,
                lineHeight: 24,
                textAlign: "center",
                color: "#fff",
              }}
            >
              Đang kiểm tra thiết bị{"\n"}Vui lòng đợi trong giây lát
            </Text>
            <ActivityIndicator size="large" style={{ top: 110 }} />
          </View>
        </View>
      </Modal>

      <Modal
        animationType="slide"
        transparent={true}
        visible={regvisible}
        onRequestClose={() => {
          setregvisible(!regvisible);
        }}
      >
        <View style={style.container}>
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              position: "absolute",
              bottom: 330,
              right: 40,
            }}
            onPress={() => {
              setregvisible(false);
            }}
          >
            <Image
              source={require("../../img/closeCircle.png")}
              style={{ position: "absolute", width: 48, height: 48 }}
            />
          </TouchableOpacity>

          <View
            style={{
              position: "absolute",
              width: "90%",
              height: 300,
              bottom: 20,
              backgroundColor: "white",
              borderRadius: 20,
            }}
          >
            <View
              style={{
                position: "absolute",
                width: "100%",
                height: 0,
                left: 0,
                top: 0,
                background: "#FFFFFF",
              }}
            >
              <Image
                source={require("../../img/ekyc.png")}
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  left: 20,
                  top: 70,
                }}
              />

              <TouchableOpacity
                style={{
                  position: "absolute",
                  width: "90%",
                  height: 60,
                  left: 80,
                  top: 65,
                  justifyContent: "center",
                }}
                onPress={() => {
                  setregvisible(false);
                  navigation.navigate("ScanMRZ");
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 20,
                    fontWeight: 500,
                    color: "#0F172A",
                  }}
                >
                  Đăng ký xác thực eKYC
                </Text>
              </TouchableOpacity>
            </View>

            {/* ======================================== */}

            <View
              style={{
                position: "absolute",
                width: "100%",
                height: 60,
                left: 0,
                top: 90,
                background: "#FFFFFF",
              }}
            >
              <Image
                source={require("../../img/photo1.png")}
                style={{
                  position: "absolute",
                  width: 40,
                  height: 40,
                  left: 20,
                  top: 52,
                }}
              />

              <TouchableOpacity
                style={{
                  position: "absolute",
                  width: "90%",
                  height: 60,
                  left: 80,
                  top: 45,
                  justifyContent: "center",
                }}
                onPress={() => {
                  setregvisible(false);
                  navigation.navigate("DangKy");
                }}
              >
                <Text
                  style={{
                    fontSize: 18,
                    lineHeight: 20,
                    fontWeight: 500,
                    color: "#0F172A",
                  }}
                >
                  Đăng ký xác thực chuẩn NCM
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      <ScrollView
        style={{
          flex: 1,
          backgroundColor: "#fff",
          width: "100%",
        }}
        contentContainerStyle={{
          alignItems: "center",
          height: "100%",
        }}
      >
        <View style={style.startLoginContainer}>
          <Image source={require("../../img/logo.png")} style={style.logoImg} />
          <Image
            source={require("../../img/startlogin.png")}
            style={style.startLoginImg}
          />
          <Text style={style.startLoginText}>
            {i18n.t("kich_hoat_splash.dang_nhap_slogan")}
          </Text>
        </View>
        <View style={style.btnContainer}>
          <TouchableOpacity style={style.startLoginBtn} onPress={check}>
            <Text style={AppStyle.buttonText}>
              {i18n.t("kich_hoat_splash.button")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={style.registerSection}
            onPress={() => {
              navigation.navigate("DangKy");
            }}
          >
            <View style={style.registerText}>
              <Text style={[style.text, { color: "#6B7280" }]}>
                {i18n.t("kich_hoat_splash.text_1")}
              </Text>
              <Text style={[style.text, { color: "#336DD1" }]}>
                {i18n.t("kich_hoat_splash.text_2")}
              </Text>
            </View>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}

const style = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    height: "100%",
  },
  root: {
    justifyContent: "space-between",
    paddingTop: 80,
    paddingBottom: 64,
    flex: 1,
  },
  startLoginContainer: {
    alignItems: "center",
    flex: 1,
  },
  logoImg: {
    width: 150,
    height: 30,
    marginBottom: 20,
  },
  startLoginImg: {
    width: 366,
    height: 338,
    resizeMode: "contain",
    marginBottom: 20,
  },
  startLoginText: {
    width: 343,
    height: 56,
    lineHeight: 28,
    fontSize: 20,
    textAlign: "center",
    color: "#0F172A",
    fontWeight: "500",
  },
  btnContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  startLoginBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
    fontSize: 14,
    fontWeight: "500",
    marginTop: 40,
  },
  registerSection: {
    marginTop: 25,
    width: "100%",
    height: 30,
    alignItems: "center",
  },
  registerText: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 4,
    width: "100%",
    height: 20,
  },
  text: {
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: 20,
    fontWeight: "500",
  },
});
