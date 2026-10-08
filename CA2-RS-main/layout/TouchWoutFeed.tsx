import React, { PropsWithChildren } from "react";
import { Keyboard, TouchableWithoutFeedback } from "react-native";

function TouchWouFeed({ children }: PropsWithChildren) {
  return (
    <TouchableWithoutFeedback
      onPressIn={() => Keyboard.isVisible() && Keyboard.dismiss()}
      accessible={true}
    >
      {children}
    </TouchableWithoutFeedback>
  );
}

export default TouchWouFeed;
