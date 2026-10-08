import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../../utils/i18n";

export default function FilterView({ text, setText, handleFilter }) {
  const { i18n } = useI18n();
  return (
    <View
      style={{
        padding: 16,
        backgroundColor: "white",
      }}
    >
      <TextInput
        style={styles.filterInput}
        placeholder={i18n.t("document.filterText")}
        onChangeText={(t) => setText(t)}
        value={text}
        placeholderTextColor={"#9CA3AF"}
      />
      <View style={{ position: "absolute", top: 24, left: 24 }}>
        <Image
          source={require("../../img/MagnifyingGlassSmall.png")}
          style={{ width: 16, height: 16, tintColor: "#111827" }}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  filterInput: {
    borderRadius: 4,
    backgroundColor: "#F8F8F8",
    height: 32,
    color: "#111827",
    paddingLeft: 36,
    paddingRight: 12,
  },
});
