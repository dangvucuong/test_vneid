import React from "react";
import { Button, StyleSheet, Text } from "react-native";
import { TouchableOpacity } from "react-native-gesture-handler";
import AppStyle from "../../styles/AppStyle";
import { View } from "@ant-design/react-native";
CustomBtn.defaultProps = {
  disabled: false,
  BtnProps: null,
  title: "",
};
function CustomBtn({
  title,
  disabled,
  onPress,
  styleBtn,
  BtnProps,
}: {
  title: string;
  disabled: boolean;
  onPress: any;
  styleBtn: any;
  BtnProps: any;
}) {
  return (
    <View style={{ width: "100%", display: "flex" }}>
      <TouchableOpacity
        onPress={onPress}
        style={{
          width: "100%",
          height: 44,
          backgroundColor: "#1858EA",
          borderRadius: 8,
          alignItems: "center",
        }}
      >
        <Text style={style.buttonText}>{title}</Text>
      </TouchableOpacity>
    </View>
  );
}

export default CustomBtn;

const style = StyleSheet.create({
  buttonText: {
    position: "absolute",
    top: "27.27%",
    bottom: "27.27%",
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },
});
