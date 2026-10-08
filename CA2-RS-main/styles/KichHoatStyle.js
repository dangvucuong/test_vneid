import { StyleSheet } from "react-native";

export default StyleSheet.create({
  scrollContainer: {
    flex: 1,
    backgroundColor: "#fff",
  },
  scrollContent: {
    height: "100%",
    justifyContent: "space-between",
    paddingTop: 16,
    paddingBottom: 54,
  },
  title: {
    width: "100%",
    textAlign: "center",
  },
  headerMainText: {
    fontSize: 20,
    fontWeight: "700",
    lineHeight: 28,
  },
  headerSmallText: {
    fontSize: 14,
    fontWeight: "500",
    lineHeight: 20,
  },
});
