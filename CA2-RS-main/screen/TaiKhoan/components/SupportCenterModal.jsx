import React from "react";
import {
  Image,
  Linking,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

const SupportCenterModal = ({ visible, onCancel }) => {
  return (
    <Modal
      transparent={true}
      statusBarTranslucent={true}
      visible={visible}
      animationType="slide"
      onRequestClose={onCancel}
    >
      <TouchableWithoutFeedback>
        <View style={styles.overlay}>
          {visible && (
            <TouchableOpacity style={styles.closeButton} onPress={onCancel}>
              <Image
                source={require("../../../img/X.png")}
                width={24}
                height={24}
              />
            </TouchableOpacity>
          )}
          <View style={styles.actionSheet}>
            <TouchableOpacity
              style={styles.option}
              onPress={() => Linking.openURL("mailto:support@cavn.vn")}
            >
              <Image
                source={require("../../../img/Email.png")}
                width={40}
                height={40}
              />
              <Text style={styles.optionText}>Support@cavn.vn</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.option}
              onPress={() => Linking.openURL("tel:1900 5454 07")}
            >
              <Image
                source={require("../../../img/Phone.png")}
                width={40}
                height={40}
              />
              <Text style={styles.optionText}>1900 5454 07</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionSheet: {
    backgroundColor: "#fff",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
    paddingBottom: 60,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
  },
  optionText: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  closeButton: {
    backgroundColor: "#FFFFFF",
    padding: 12,
    borderRadius: 24,
    marginBottom: 10,
    alignSelf: "flex-end",
  },
});

export default SupportCenterModal;
