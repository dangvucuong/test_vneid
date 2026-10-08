import React, { useEffect, useState } from "react";
import {
  ActionSheetIOS,
  Image,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import DefaultPreference from "react-native-default-preference";
import AppStyle from "../../styles/AppStyle";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { KichHoatStyle, StartStyle } from "../../styles";
import { i18n } from "../../utils/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import { hitSlop } from "../../utils/constant";

const lang = ["vi", "en"];

export default function DangKy({ navigation, route }) {
  // useEffect(() => {
  //   const interval = setInterval(() => {
  //     DefaultPreference.get("EKYC_done").then(function (EKYC_done) {
  //       if (EKYC_done == "1") {
  //         clearInterval(interval);
  //         navigation.navigate("RegEKYC");
  //       }
  //     });
  //   }, 1000);
  // }, []);

  const [locale, setlocale] = useState("vi");
  const [text, setText] = useState("");

  i18n.locale = locale;
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);

  const ChangeNgonngu = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [i18n.t("cancel_text"), "Tiếng Việt", "English"],
          // destructiveButtonIndex: 2,
          cancelButtonIndex: 0,
          userInterfaceStyle: "light",
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
            // cancel action
          } else if (buttonIndex === 1) {
            setlocale("vi");
            i18n.fallback = true;
            i18n.locale = "vi";
            await AsyncStorage.setItem("@language", "vi");
          } else if (buttonIndex === 2) {
            setlocale("en");
            i18n.fallback = true;
            i18n.locale = "en";
            await AsyncStorage.setItem("@language", "en");
          }
        }
      );
    }
    if (Platform.OS === "android") {
      const nextLng = lang.find((item) => item !== locale);
      setlocale(nextLng);
      i18n.fallback = true;
      i18n.locale = nextLng;
      await AsyncStorage.setItem("@language", nextLng);
    }
  };

  const registerRoute = [
    {
      id: "1",
      label: "register.ca_nhan",
      icon: require("../../img/CaNhan.png"),
    },
    {
      id: "2",
      label: "register.ca_nhan_to_chuc",
      icon: require("../../img/CaNhanToChuc.png"),
    },
    {
      id: "3",
      label: "register.to_chuc",
      icon: require("../../img/ToChuc.png"),
    },
  ];

  const handleChooseRegisterMethod = async (method) => {

    if(method === "1") {
      await AsyncStorage.setItem("@regMethod", method);
      navigation.navigate("DangKyHuongDan");
    } else if(method === "2") {
      // await AsyncStorage.setItem("@isCompany", "1");
      navigation.navigate("DangKyCaNhanThuocToChuc");
    } else if(method === "3") {
      // await AsyncStorage.setItem("@isCompany", "2");
      navigation.navigate("ToChuc");
      //navigation.navigate("HoanTatDangKy");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          alignItems: "center",
          paddingHorizontal: 16,
          width: "100%",
          marginTop: 16,
        }}
      >
        <TouchableOpacity
          hitSlop={hitSlop}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Image
            source={require("../../img/CaretLeft.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={ChangeNgonngu}>
          {locale === "vi" ? (
            <Image
              source={require("../../img/Vietnam.png")}
              style={StartStyle.icon}
            />
          ) : (
            <Image
              source={require("../../img/UK.png")}
              style={StartStyle.icon}
            />
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        style={KichHoatStyle.scrollContainer}
        contentContainerStyle={[
          KichHoatStyle.scrollContent,
          { marginHorizontal: 16 },
        ]}
      >
        <View style={{ flex: 1, gap: 16, width: "100%" }}>
          <Text style={styles.headerMainText}>{i18n.t("register.title")}</Text>
          <View style={{ gap: 8 }}>
            <Text style={[KichHoatStyle.headerSmallText, { paddingRight: 32 }]}>
              {i18n.t("register.offline_code_label")}
            </Text>
            <TextInput
              style={styles.input}
              placeholder={i18n.t("register.offline_code_label")}
              onChangeText={(newText) => setText(newText)}
              keyboardType="number-pad"
              value={text}
            />
            <TouchableOpacity style={styles.actionBtn} onPress={() => {}}>
              <Text style={AppStyle.buttonText}>{i18n.t("buttonNext")}</Text>
            </TouchableOpacity>
          </View>
          <View style={styles.sectionSpliter}>
            <View style={styles.line} />
            <Text style={styles.spliterText}>{i18n.t("orText")}</Text>
            <View style={styles.line} />
          </View>
          <View style={{ gap: 8 }}>
            <Text
              style={[
                KichHoatStyle.headerSmallText,
                { fontWeight: "400", color: "#6B7280" },
              ]}
            >
              {i18n.t("register.choose")}
              <Text style={{ fontWeight: "700", color: "#0F172A" }}>
                {i18n.t("register.one_of_3")}
              </Text>
              {i18n.t("register.to_continue")}
            </Text>
            {registerRoute.map((item, index) => (
              <TouchableOpacity
                key={item.id}
                onPress={() => handleChooseRegisterMethod(item.id)}
                style={[
                  styles.item,
                  ...(index === 0 ? [{ borderTopColor: "transparent" }] : []),
                ]}
              >
                <Image source={item.icon} style={{ width: 28, height: 28 }} />
                <Text style={{ flex: 1 }}>{i18n.t(item.label)}</Text>
                <Image
                  source={require("../../img/CaretRight.png")}
                  style={{ width: 16, height: 16 }}
                />
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  headerMainText: {
    fontSize: 24,
    lineHeight: 34,
    fontWeight: "700",
  },
  input: {
    paddingRight: 16,
    paddingLeft: 16,
    height: 44,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
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
  sectionSpliter: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  line: {
    flex: 1,
    height: 1,
    backgroundColor: "#DDE3EB",
  },
  item: {
    flexDirection: "row",
    height: 52,
    alignItems: "center",
    justifyContent: "space-between",
    gap: 8,
    borderTopWidth: 1,
    borderTopColor: "#EDF1F5",
  },
});
