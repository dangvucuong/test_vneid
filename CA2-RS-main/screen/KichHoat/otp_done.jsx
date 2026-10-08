import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import AppStyle from "../../styles/AppStyle";
import { useI18n } from "../../utils/i18n";
import { hitSlop } from "../../utils/constant";

export default function OTP_Done({ navigation, route }) {
  const { i18n } = useI18n();

  return (
    <View
      style={[
        AppStyle.container,
        { padding: 16, justifyContent: "space-between" },
      ]}
    >
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        hitSlop={hitSlop}
        style={{
          position: "absolute",

          left: 16,
          top: 60,
        }}
      >
        <Image
          source={require("../../img/X.png")}
          style={{
            width: 24,
            height: 24,
          }}
        />
      </TouchableOpacity>
      <View style={{ flex: 1, justifyContent: "center", gap: 70 }}>
        <Image
          source={require("../../img/Illustration4.png")}
          style={styles.image}
        />
        <Text style={styles.text}>{i18n.t("otpdoneText1")}!</Text>
      </View>
      <TouchableOpacity
        style={styles.actionBtn}
        onPress={() => {
          navigation.navigate("SetupPin");
        }}
      >
        <Text style={AppStyle.buttonText}>{i18n.t("buttonNext")}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  image: {
    width: 343,
    height: 160,
  },
  text: {
    alignSelf: "center",
    lineHeight: 26,
    fontSize: 18,
    fontWeight: "600",
  },
  actionBtn: {
    width: "100%",
    height: 44,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
    fontSize: 14,
    fontWeight: "500",
    marginBottom: 48,
  },
});
