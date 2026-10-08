import React from "react";
import NavBarTop, { NVTProps } from "./NavBar_Top";
import { View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
interface MainLayoutProps extends React.PropsWithChildren {
  disableNavbar: boolean;
  NavBarTopProps: NVTProps;
  isWhite: boolean;
  stackProps: any;
  wrapperStyle?: any;
}
MainLayout.defaultProps = {
  disableNavbar: false,
  isWhite: true,
  stackProps: undefined,
  NavBarTopProps: {
    left: undefined,
    right: undefined,
    center: undefined,
    leftProps: undefined,
    centerProps: undefined,
    rightProps: undefined,
    stackProps: undefined,
    backgroundColor: undefined,
    centerTextProps: undefined,
  },
};

export default function MainLayout({
  disableNavbar,
  NavBarTopProps,
  isWhite,
  stackProps,
  children,
  wrapperStyle,
}: MainLayoutProps) {
  const insets = useSafeAreaInsets();

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "white",
        paddingTop: insets.top,
        paddingBottom: insets.bottom,
        paddingLeft: insets.left,
        paddingRight: insets.right,
      }}
      {...stackProps}
    >
      {!disableNavbar && <NavBarTop {...NavBarTopProps} />}
      <View
        style={{
          flex: 1,
          position: "relative",
          height: "100%",
          backgroundColor: "white",
          alignItems: "center",
          ...wrapperStyle,
        }}
      >
        {children}
      </View>
    </View>
  );
}
