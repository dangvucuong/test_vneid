import {
  StyleSheet,
  Text,
  View,
  Image,
  TouchableOpacity,
  TextInput,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import React, { useState, useEffect } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { i18n } from "../../utils/i18n";
import { AppStyle, KichHoatStyle, StartStyle } from "../../styles";
import PageHeader from "../component/PageHeader";
import PageContainer from "../component/PageContainer";

export default function Kichhoat({ navigation, route }) {
  const [locale, setlocale] = useState("vi");
  i18n.locale = locale;
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);

  const [error, setError] = useState("");
  const [isLoading, setLoading] = useState(false);
  const [text, setText] = useState("");

  const updateError = (error, stateUpdater) => {
    stateUpdater(error);
    setTimeout(() => {
      stateUpdater("");
    }, 3500);
  };

  const CheckMaKichhoat = () => {
    setLoading(true);
    if (text == "") {
      createAlert();
      setLoading(false);
    } else {
      NetInfo.fetch().then((state) => {
        if (state.isConnected == true) {
          var dev_id = global.UUID;
          var token = global.RegID;

          var url =
            "https://apisign.nacencomm.vn/api/APISigncore/Ketnoithietbi_mobilesign?idcts=" +
            text +
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
            .then(async (responseJson) => {
              //  console.log(responseJson);
              if (responseJson == "1") {
                global.idcts = text;
                // Setkey('@idcts',idcts);
                await AsyncStorage.setItem("@idcts", text);
                setLoading(false);
                navigation.navigate("OTP");
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
              } else if (responseJson == "-7") {
                setLoading(false);
                updateError(i18n.t("kichhoaterr8"), setError);
                //  createAlertCustom("Mã kích hoạt chưa được thẩm định");
              } else {
                setLoading(false);
                updateError(i18n.t("kichhoaterr8"), setError);
                // createAlertCustom("Có lỗi xảy ra. Vui lòng thử lại");
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

  const createAlert = () =>
    Alert.alert("CA2 REMOTE SIGNING", "Vui lòng nhập mã kích hoạt", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);
  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("kichhoaterr0"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  //const navigation = props.useNavigation();
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
              {i18n.t("kich_hoat.heading")}
              {"\n"}
            </Text>
            <Text style={[KichHoatStyle.headerSmallText, { color: "#6B7280" }]}>
              {i18n.t("kich_hoat.sub_heading")}
            </Text>
          </Text>
          <View style={style.sectionContainer}>
            <Text style={[KichHoatStyle.headerSmallText, style.inputLabel]}>
              {i18n.t("kich_hoat.ma_tai_khoan")}
            </Text>
            <TextInput
              style={style.input}
              keyboardType="number-pad"
              onChangeText={(newText) => setText(newText)}
              placeholder={i18n.t("kich_hoat.placeholder")}
            />
            {error ? (
              <Text
                style={[
                  KichHoatStyle.headerSmallText,
                  { color: "red", marginTop: 4 },
                ]}
              >
                {error}
              </Text>
            ) : null}
          </View>
        </View>
        <View style={style.sectionContainer}>
          <TouchableOpacity style={style.actionBtn} onPress={CheckMaKichhoat}>
            <Text style={AppStyle.buttonText}>{i18n.t("buttonNext")}</Text>
          </TouchableOpacity>
        </View>

        {isLoading === true && (
          <View style={style.myloader}>
            <ActivityIndicator size="large" color="#0000ff" />
            <Text style={[KichHoatStyle.headerSmallText, { color: "#0F172A" }]}>
              {i18n.t("kich_hoat.dang_kiem_tra")}
            </Text>
          </View>
        )}
      </ScrollView>
    </PageContainer>
  );
}

const style = StyleSheet.create({
  myloader: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    zIndex: 10,
    backgroundColor: "#ffffff",
    opacity: 0.9,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
  },
  inputLabel: {
    color: "#374151",
    flexGrow: 0,
    marginBottom: 8,
  },
  input: {
    paddingRight: 16,
    paddingLeft: 16,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
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
});
