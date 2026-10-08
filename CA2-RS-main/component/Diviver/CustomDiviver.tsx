import { StyleSheet, View } from "react-native";

const CustomDiviver = ({ style }: { style?: any }) => {
  return <View style={{ ...styles.container, ...style }} />;
};

const styles = StyleSheet.create({
  container: {
    height: 1,
    backgroundColor: "#F3F4F6",
    marginHorizontal: 24,
  },
});

export default CustomDiviver;
