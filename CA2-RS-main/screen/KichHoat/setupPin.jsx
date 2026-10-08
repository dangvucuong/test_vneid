import NetInfo from "@react-native-community/netinfo";
import React, { useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { AppStyle, KichHoatStyle } from "../../styles";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";

export default function SetupPin({ navigation, route }) {
  const { i18n } = useI18n();

  const [value, setValue] = useState("");
  const [showNewPin, setShowNewPin] = useState(false);
  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createNo_internet = () =>
    Alert.alert("CA2 REMOTE SIGNING", i18n.t("errNointernet"), [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const SetupPin = ({}) => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        var PinNumber = value;
        if (value != null && value.length >= 6) {
          var dev_id = global.UUID;
          var token = global.RegID;
          var idcts = global.idcts;

          var url =
            "https://apisign.nacencomm.vn/api/APISigncore/thietlapmapin?idcts=" +
            idcts +
            "&device_id=" +
            dev_id +
            "&pincode=" +
            PinNumber;

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
              //alert(res);
              // console.log("SET PIN: ",responseJson);
              if (responseJson == "1") {
                //valid
                navigation.navigate("Login");
              } else if (responseJson == "0") {
                createAlertCustom(i18n.t("pinErr1"));
              } else if (responseJson == "-1") {
                createAlertCustom(i18n.t("pinErr2"));
              } else {
                createAlertCustom(i18n.t("pinErr3"));
              }
            })
            .catch((error) => {
              console.error(error);
            });
        } else {
          createAlertCustom(i18n.t("pinErr4"));
        }
      } else {
        createNo_internet();
      }
    });
  };

  const toggleShowNewPin = () => {
    setShowNewPin(!showNewPin);
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
        contentContainerStyle={[KichHoatStyle.scrollContent]}
      >
        <View
          style={{ flex: 1, gap: 40, width: "100%", paddingHorizontal: 16 }}
        >
          <View style={{ gap: 8, width: "100%" }}>
            <Text style={KichHoatStyle.headerMainText}>
              {i18n.t("pinText1")}
            </Text>
            <Text style={[KichHoatStyle.headerSmallText, { paddingRight: 32 }]}>
              {i18n.t("pinText2")}
            </Text>
          </View>
          <View style={{ gap: 8 }}>
            <Text style={[KichHoatStyle.headerSmallText, { color: "#374151" }]}>
              {i18n.t(`pinText3`)}
            </Text>
            <View style={styles.groupInput}>
              <TextInput
                style={styles.input}
                keyboardType="number-pad"
                secureTextEntry={!showNewPin}
                placeholder={i18n.t("pinText4")}
                onChangeText={(text) => setValue(text)}
                value={value}
              />
              <TouchableOpacity style={styles.icon} onPress={toggleShowNewPin}>
                <Image
                  source={
                    showNewPin
                      ? require("../../img/Eye.png")
                      : require("../../img/EyeClosed.png")
                  }
                  style={{ width: 16, height: 16 }}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>

        <View style={styles.sectionContainer}>
          <TouchableOpacity style={styles.actionBtn} onPress={SetupPin}>
            <Text style={AppStyle.buttonText}>{i18n.t("buttonConfirm")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  groupInput: {
    position: "relative",
    width: "100%",
    justifyContent: "center",
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 40,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  icon: {
    position: "absolute",
    right: 16,
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
