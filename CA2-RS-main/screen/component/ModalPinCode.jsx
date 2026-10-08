import React, { useEffect, useState } from "react";
import {
  Dimensions,
  Image,
  Keyboard,
  KeyboardAvoidingView,
  Modal,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

import {
  CodeField,
  Cursor,
  isLastFilledCell,
  MaskSymbol,
  useBlurOnFulfill,
  useClearByFocusCell,
} from "react-native-confirmation-code-field";
import { useI18n } from "../../utils/i18n";

const CELL_COUNT = 6;
const height = Dimensions.get("window").height;
const MODAL_HEIGHT = (height * 2) / 3;
export default function ModalPinCode({
  value,
  setValue,
  showPopPin,
  setShowPopPin,
}) {
  const [keyboardShow, setKeyboardStatus] = useState(false);

  useEffect(() => {
    const showSubscription = Keyboard.addListener("keyboardDidShow", () => {
      setKeyboardStatus(true);
    });
    const hideSubscription = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardStatus(false);
    });

    return () => {
      showSubscription.remove();
      hideSubscription.remove();
    };
  }, []);

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const { i18n } = useI18n();
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });
  const renderCell = ({ index, symbol, isFocused }) => {
    return (
      <View
        onLayout={getCellOnLayoutHandler(index)}
        key={index}
        style={[styles.cellRoot, isFocused && styles.focusCell]}
      >
        <Text style={styles.cellText}>
          {symbol ? (
            <MaskSymbol
              maskSymbol="*"
              isLastFilledCell={isLastFilledCell({ index, value })}
            >
              {symbol}
            </MaskSymbol>
          ) : isFocused ? (
            <Cursor />
          ) : null}
        </Text>
      </View>
    );
  };
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={showPopPin}
      onRequestClose={() => setShowPopPin(!showPopPin)}
    >
      <View style={styles.modalContainer}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={{
            width: "100%",
            height: MODAL_HEIGHT,
            backgroundColor: "#ffffff",
            borderRadius: 13,
          }}
        >
          <View
            style={{
              height: 64,
              justifyContent: "center",
              borderBottomColor: "#EDF1F5",
              borderBottomWidth: 1,
            }}
          >
            <TouchableOpacity
              style={[styles.backButton, { left: 16 }]}
              onPress={() => setShowPopPin(!showPopPin)}
            >
              <Image
                source={require("../../img/X.png")}
                style={{ width: 24, height: 24 }}
              />
            </TouchableOpacity>
            <Text style={styles.modalHeader}>{i18n.t("appText4")}</Text>
          </View>
          <View
            style={{
              flex: 1,
              justifyContent: "center",
              marginBottom: MODAL_HEIGHT - 200,
              marginTop: 20,
            }}
          >
            <CodeField
              ref={ref}
              {...props}
              value={value}
              onChangeText={setValue}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRoot}
              keyboardType="number-pad"
              textContentType={Platform.OS === 'ios' ? 'none' : 'oneTimeCode'} 
              renderCell={renderCell}
            />
          </View>
        </KeyboardAvoidingView>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  modalHeader: {
    height: 20,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#0F172A",
    fontWeight: "400",
  },
  backButton: {
    position: "absolute",
    width: 24,
    height: 24,
    top: 16,
    zIndex: 99,
  },
  codeFieldRoot: {
    gap: 12,
    maxWidth: 232,
    alignSelf: "center",
  },
  cellRoot: {
    width: 32,
    height: 40,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#DDE3EB",
    borderBottomWidth: 2,
  },
  cellText: {
    color: "#334155",
    fontSize: 28,
    lineHeight: 38,
    textAlign: "center",
  },
  focusCell: {
    borderBottomColor: "#4679EE",
  },
});
