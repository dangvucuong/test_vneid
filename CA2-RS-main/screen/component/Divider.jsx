import React from "react";
import { View, StyleSheet } from "react-native";

const Divider = ({
  direction = "horizontal", // "horizontal" hoặc "vertical"
  thickness = 1,           // Độ dày của đường gạch
  color = "#9CA3AF",        // Màu sắc
  dashed = false,           // Nét đứt hay không
  length = "100%",          // Độ dài của divider (ví dụ: 100px, 50%, auto)
}) => {
  const isHorizontal = direction === "horizontal";

  return (
    <View
      style={[
        styles.divider,
        {
          backgroundColor: dashed ? "transparent" : color,
          borderColor: dashed ? color : "transparent",
          borderStyle: dashed ? "dashed" : "solid",
          height: isHorizontal ? thickness : length,
          width: isHorizontal ? length : thickness,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    borderWidth: 1,
  },
});

export default Divider;
