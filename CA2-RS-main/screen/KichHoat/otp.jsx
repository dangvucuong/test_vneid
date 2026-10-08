import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  ScrollView,
  Image,
  Platform
} from "react-native";
import React, { useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "../../utils/i18n";
import { AppStyle, KichHoatStyle, StartStyle } from "../../styles";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";

const CELL_COUNT = 4;
export default function OTP({ navigation, route }) {
  const { i18n } = useI18n();

  const [value, setValue] = useState("");
  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("errNointernet"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  //const navigation = props.useNavigation();
  const [isLoading, setLoading] = useState(false);

  const CheckOTP = () => {
    setLoading(true);
    if (value == "") {
      createAlertCustom(i18n.t("otpErr1"));
      setLoading(false);
    } else {
      NetInfo.fetch().then((state) => {
        if (state.isConnected == true) {
          var enter_otp = value;
          if (enter_otp != global.otp) {
            createAlertCustom(i18n.t("otpErr2"));
            setTimeout(() => {
              setLoading(false);
            }, 2000);
          } else {
            var dev_id = global.UUID;
            var token = global.RegID;
            var idcts = global.idcts;

            var url =
              "https://apisign.nacencomm.vn/api/APISigncore/Kichhoatthietbi?idcts=" +
              idcts +
              "&regid=" +
              token +
              "&devid=" +
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
              .then((responseJson) => {
                var res = JSON.stringify(responseJson);
                //  console.log(responseJson);
                if (responseJson == "1") {
                  //valid
                  navigation.navigate("OTP_Done");
                } else if (responseJson == "0") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr1"), setError);
                  // createAlertCustom("Kết nối thiết bị không thành công");
                } else if (responseJson == "-1") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr2"), setError);
                  //    createAlertCustom("Có lỗi khi kiểm tra thiết bị tồn tại");
                } else if (responseJson == "-2") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr3"), setError);
                  //  createAlertCustom("Thiết bị đã tồn tại trong hệ thống");
                } else if (responseJson == "-3") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr4"), setError);
                  //  createAlertCustom("Có lỗi khi kiểm tra mã kết nối");
                } else if (responseJson == "-4") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr5"), setError);
                  // createAlertCustom("Mã kết nối đã tồn tại");
                } else if (responseJson == "-5") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr6"), setError);
                  //  createAlertCustom("Mã kết nối không hợp lệ");
                } else if (responseJson == "-6") {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr7"), setError);
                  //  createAlertCustom("Mã kích hoạt chưa được thẩm định");
                } else {
                  setLoading(false);
                  updateError(i18n.t("kichhoaterr8"), setError);
                  // createAlertCustom("Có lỗi xảy ra. Vui lòng thử lại");
                }
              })
              .catch((error) => {
                console.error("Lỗi lúc kích hoạt", error);
              });
            setTimeout(() => {
              setLoading(false);
            }, 2000);
          }
        } else {
          createNo_internet();
        }
      });
    }
  };

  const ResendOTP = async () => {
    const regid = await AsyncStorage.getItem("@regid");
    if (regid != null) {
      var url =
        "https://apisign.nacencomm.vn/api/APISigncore/ResendOTP?regid=" + regid;
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
          console.log(responseJson);
        })
        .catch((error) => {
          console.error(error);
        });
    }
  };
  return (
    <PageContainer hideSafe>
      <PageHeader onBack={() => navigation.goBack()} beforeLogin />
      <ScrollView
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: "#ffffff",
        }}
        contentContainerStyle={KichHoatStyle.scrollContent}
      >
        <View style={{ width: "100%", alignItems: "center", gap: 24 }}>
          <Image
            source={require("../../img/headerlogo.png")}
            style={StartStyle.startLogo}
          />
          <Text style={KichHoatStyle.title}>
            <Text style={KichHoatStyle.headerMainText}>
              {i18n.t("otpText1")}
              {"\n"}
            </Text>
            <Text style={KichHoatStyle.headerSmallText}>
              {i18n.t("otpText2")}
            </Text>
          </Text>
        </View>

        <View style={{ flex: 1, marginTop: 60, width: "100%" }}>
          <CodeField
            ref={ref}
            {...props}
            value={value}
            onChangeText={setValue}
            cellCount={CELL_COUNT}
            rootStyle={styles.codeFieldRoot}
            keyboardType="number-pad"
            textContentType={Platform.OS === 'ios' ? 'none' : 'oneTimeCode'} 
            renderCell={({ index, symbol, isFocused }) => (
              <View
                // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
                onLayout={getCellOnLayoutHandler(index)}
                key={index}
                style={[styles.cellRoot, isFocused && styles.focusCell]}
              >
                {isLoading ? (
                  <ActivityIndicator size="large" color="#1A1B27" />
                ) : (
                  <Text style={styles.cellText}>
                    {symbol || (isFocused ? <Cursor /> : null)}
                  </Text>
                )}
              </View>
            )}
          />
          <TouchableOpacity style={styles.resendOTP} onPress={ResendOTP}>
            <Text style={styles.resendOTPText}>{i18n.t("otpText4")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={CheckOTP}>
            <Text style={AppStyle.buttonText}>{i18n.t("buttonNext")}</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.myloader}>
            <Text style={{ padding: 10 }}>{i18n.t("otpText3")}</Text>
            <ActivityIndicator size="large" color="#0000ff" />
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  codeFieldRoot: {
    gap: 12,
    maxWidth: 196,
    alignSelf: "center",
  },
  cellRoot: {
    width: 40,
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
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    marginTop: 30,
  },
  myloader: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: "#ffffff",
    opacity: 0.9,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
  sectionContainer: {
    width: "100%",
    paddingHorizontal: 16,
  },
  actionBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
    fontSize: 14,
    fontWeight: "500",
  },
  resendOTP: {
    alignSelf: "center",
    marginTop: 56,
  },
  resendOTPText: {
    color: "#1858EA",
    fontWeight: "600",
    fontSize: 14,
    lineHeight: 20,
  },
});
