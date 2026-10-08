import React from "react";
import { SafeAreaView } from "react-native-safe-area-context";

export const SafeAreaApp = (props) => (
  <SafeAreaView {...props} edges={["top", "left", "right"]}>
    {props.children}
  </SafeAreaView>
);
