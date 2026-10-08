import React from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaApp } from "./SafeAreaApp";
import { hitSlop } from "../../utils/constant";
export default function PageHeader({
  onBack,
  title,
  onDetail,
  customAction,
  rightComponent,
  beforeLogin,
  onCustomAction,
}) {
  const isShowRight = rightComponent || customAction;
  return (
    <SafeAreaApp
      style={[styles.container, { paddingTop: beforeLogin ? 32 : 16 }]}
    >
      <TouchableOpacity
        hitSlop={hitSlop}
        style={[styles.backButton, { left: 16 }]}
        onPress={() => onBack && onBack()}
      >
        <Image
          source={require("../../img/CaretLeft.png")}
          style={{ width: 24, height: 24 }}
        />
      </TouchableOpacity>
      {!!title && (
        <Text numberOfLines={1} style={styles.title}>
          {title}
        </Text>
      )}
      {onDetail && (
        <TouchableOpacity
          hitSlop={hitSlop}
          style={[styles.backButton, { right: 16 }]}
          onPress={() => onDetail()}
        >
          <Image
            source={require("../../img/DotsThree.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
      )}
      {isShowRight && (
        <View
          style={[
            styles.backButton,
            {
              width: 100,
              alignItems: "flex-end",
              justifyContent: "center",
              right: 16,
            },
          ]}
        >
          {rightComponent ? (
            rightComponent()
          ) : (
            <TouchableOpacity hitSlop={hitSlop} onPress={() => onCustomAction()}>
              <Text style={{ color: "#1858EA" }}>{customAction}</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaApp>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#FFFFFF",
    padding: 16,
  },
  backButton: {
    position: "absolute",
    width: 24,
    height: 24,
    bottom: 12,
    zIndex: 99,
  },
  title: {
    width: "100%",
    paddingHorizontal: 48,
    textAlign: "center",
    fontSize: 16,
    fontWeight: "700",
    color: "#1E293B",
  },
});
