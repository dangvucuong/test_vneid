import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { hitSlopSmall } from "../../utils/constant";

export default function ModalXuLy({ i18n, value, onOK, onCancel }) {
  return (
    <>
      {!!value && (
        <View style={styles.container}>
          <View style={styles.content}>
            <View
              style={{ flexDirection: "row", gap: 4, alignItems: "center" }}
            >
              <Image
                source={require("../../img/CheckCircle.png")}
                style={{ width: 24, height: 24 }}
              />
              <Text style={[styles.text, { fontSize: 14 }]}>
                {i18n.t("home.da_chon_can_xu_ly", { num: value })}
              </Text>
            </View>
            <View
              style={{
                flexDirection: "row",
                gap: 16,
                justifyContent: "flex-end",
              }}
            >
              <TouchableOpacity onPress={onOK} hitSlop={hitSlopSmall}>
                <Text style={[styles.text, { fontSize: 13 }]}>
                  {i18n.t("common.tiep_tuc")}
                </Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={onCancel}>
                <Text style={[styles.text, { fontSize: 13 }]}>
                  {i18n.t("common.huy_bo")}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      )}
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    position: "absolute",
    bottom: 62,
    width: "100%",
    paddingHorizontal: 16,
  },
  content: {
    padding: 16,
    backgroundColor: "#0F172A",
    gap: 16,
    borderRadius: 8,
  },
  text: {
    fontWeight: "700",
    color: "#ffffff",
  },
});
