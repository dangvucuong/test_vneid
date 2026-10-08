import React from "react";
import { Text, View } from "react-native";

export interface NVTProps {
  left: any;
  right: any;
  center: any;
  leftProps: any;
  centerProps: any;
  rightProps: any;
  stackProps: any;
  backgroundColor: any;
  centerTextProps: any;
}
NavBarTop.defaultProps = {
  left: undefined,
  right: undefined,
  center: undefined,
  leftProps: undefined,
  centerProps: undefined,
  rightProps: undefined,
  stackProps: undefined,
  backgroundColor: undefined,
  centerTextProps: undefined,
};
export default function NavBarTop({
  left,
  right,
  center,
  leftProps,
  centerProps,
  rightProps,
  stackProps,
  backgroundColor,
  centerTextProps,
}: NVTProps) {
  return (
    <View
      style={{
        flexDirection: "row",
        backgroundColor: backgroundColor,
        justifyContent: "space-between",
        alignItems: "center",
        padding: 24,
      }}
    >
      <View style={{ width: 24, height: 24 }} {...leftProps}>
        {left}
      </View>
      <View style={{ flex: 1 }} {...centerProps}>
        <Text
          style={{
            textAlign: "center",
            fontSize: 16,
            fontWeight: "bold",
          }}
          {...centerTextProps}
        >
          {center}
        </Text>
      </View>

      <View style={{ width: 24, height: 24 }} {...rightProps}>
        {right}
      </View>
    </View>
  );
}
