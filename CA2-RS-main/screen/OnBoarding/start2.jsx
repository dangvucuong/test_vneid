import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import Carousel from "react-native-reanimated-carousel";
import { IMAGE_GROUP } from "../../utils/constant";
import { useI18n } from "../../utils/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import NetInfo from "@react-native-community/netinfo";

const SlideItem = ({ item }) => {
  return (
    <View style={{ width: "100%", alignItems: "center" }}>
      <Image source={item?.illustration} style={styles.startImg} />
      <Text style={styles.startTextContent}>
        <Text style={styles.start2Text}>{item?.title}</Text>
        {"\n"}
        <Text style={styles.start2TextSmall}>
          {item?.subtitle1}
          {"\n"}
          {item?.subtitle2}
        </Text>
      </Text>
    </View>
  );
};

const Pagination = ({ data, activeIndex }) => {
  return (
    <View
      style={{
        flexDirection: "row",
        justifyContent: "center",
        alignItems: "center",
        marginTop: 24,
        gap: 8,
      }}
    >
      {data.map((_, index) => (
        <View
          key={index}
          style={{
            width: activeIndex === index ? 20 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: activeIndex === index ? "#1858EA" : "#D8D8D8",
          }}
        />
      ))}
    </View>
  );
};

export default function Start2({ navigation }) {
  const { i18n, ChangeNgonngu, locale } = useI18n();
  const [activeIndex, setActiveIndex] = useState(0);
  useEffect(() => {
    AsyncStorage.getItem("@startscreen").then((value) => {
      if (value == "0") {
        navigation.navigate("StartLogin");
      }
    });
  }, []);
  useEffect(() => {
    const checkAndRedirect = async () => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected == true) {
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
                    }
                  })
                  .catch((error) => {
                    console.error(error);
                  });
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

    checkAndRedirect();
  }, []);
  const skipClick = async () => {
    try {
      await AsyncStorage.setItem("@startscreen", "0");
      navigation.navigate("StartLogin");
    } catch (error) {
      console.log(error);
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
        <TouchableOpacity style={styles.languageIcon} onPress={ChangeNgonngu}>
          {locale === "vi" ? (
            <Image
              source={require("../../img/Vietnam.png")}
              style={styles.icon}
            />
          ) : (
            <Image source={require("../../img/UK.png")} style={styles.icon} />
          )}
        </TouchableOpacity>
        {/* <TouchableOpacity style={styles.skipContainer} onPress={skipClick}>
          <Text style={styles.skipText}>{i18n.t("skipText")}</Text>
        </TouchableOpacity> */}
      </View>
      <View style={styles.content}>
        <View style={{ alignItems: "center", height: 486 }}>
          <Image
            source={require("../../img/headerlogo.png")}
            style={styles.startLogo}
          />
          <Carousel
            width={Dimensions.get("window").width}
            height={364}
            autoPlay={true}
            autoPlayInterval={2000}
            data={[
              {
                illustration: IMAGE_GROUP.onBoarding.Illustration1,
                title: i18n.t("start1Slogan"),
                subtitle1: i18n.t("start1Text"),
                subtitle2: i18n.t("start1Text1"),
              },
              {
                illustration: IMAGE_GROUP.onBoarding.Illustration2,
                title: i18n.t("start2Slogan"),
                subtitle1: i18n.t("start2Text"),
                subtitle2: i18n.t("start2Text1"),
              },
              {
                illustration: IMAGE_GROUP.onBoarding.Illustration3,
                title: i18n.t("start3Slogan"),
                subtitle1: i18n.t("start3Text"),
                subtitle2: i18n.t("start3Text1"),
              },
            ]}
            snapEnabled
            pagingEnabled={true}
            onSnapToItem={setActiveIndex}
            renderItem={SlideItem}
          />
          <Pagination data={[0, 1, 2]} activeIndex={activeIndex} />
        </View>
      </View>
      <TouchableOpacity
        style={styles.buttonContainer}
        onPress={() => navigation.navigate("StartLogin")}
      >
        <Text style={styles.buttonText}>{i18n.t("buttonNext")}</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
  },
  languageIcon: {},
  icon: {
    width: 24,
    height: 24,
  },
  skipContainer: {},
  skipText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    color: "#9CA3AF",
  },
  startLogo: {
    width: 34,
    height: 34,
    marginBottom: 56,
  },
  startImg: {
    width: 343,
    height: 260,
    marginBottom: 56,
  },
  startTextContent: {
    display: "flex",
    flexDirection: "column",
    textAlign: "center",
    padding: 0,
    gap: 8,
    width: "100%",
    maxWidth: 343,
  },
  start2Text: {
    height: 28,
    fontSize: 20,
    lineHeight: 28,
    fontWeight: "700",
    color: "#0F172A",
  },
  start2TextSmall: {
    height: 40,
    fontSize: 14,
    lineHeight: 20,
    color: "#6B7280",
    marginTop: 8,
    marginRight: 16,
    marginBottom: 0,
    marginLeft: 16,
  },
  dotsStyle: {
    width: 52,
    height: 8,
    marginTop: 24,
  },
  buttonContainer: {
    width: 343,
    height: 44,
    marginBottom: 64,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  buttonText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#FFFFFF",
  },
});
