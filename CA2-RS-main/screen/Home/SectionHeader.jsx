import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { hitSlopSmall } from "../../utils/constant";

export default function SectionHeader({ title, onPressAction, actionLabel }) {
  return (
    <View style={styles.container}>
      <Text style={[styles.textTitle, { fontWeight: "700" }]}>{title}</Text>
      <TouchableOpacity onPress={onPressAction} hitSlop={hitSlopSmall}>
        <Text style={[styles.textTitle, { color: "#1959DC" }]}>
          {actionLabel}
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    paddingHorizontal: 16,
    gap: 16,
  },
  textTitle: {
    flex: 1,
    color: "#334155",
    fontSize: 14,
    lineHeight: 20,
  },
});
