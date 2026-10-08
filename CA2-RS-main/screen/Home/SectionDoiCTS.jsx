import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";

const SectionDoiCTS = () => {
  return (
    <View style={styles.container}>
      {/* Icon */}
      <Image
        source={require("../../img/DongHoCat.png")}
        style={styles.icon}
      />

      {/* Message */}
      <Text style={styles.message}>
        Chứng thư số đang trong quá trình cấp!
        {"\n"}
        Vui lòng chờ 8-10 phút, thông tin Chứng thư số được cấp sẽ gửi về mail {global.Email}, quý khách theo dõi và thực hiện nhấn link để công
        bố.
        {"\n"}
        Chứng thư số sẽ được cập nhật vào app sau 1-2 phút sau khi khách nhấn
        công bố.
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    alignItems: "center",
  },
  icon: {
    width: 100,
    height: 100,
    marginBottom: 16,
  },
  message: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
    lineHeight: 20, // Khoảng cách giữa các dòng text
  },
});

export default SectionDoiCTS;
