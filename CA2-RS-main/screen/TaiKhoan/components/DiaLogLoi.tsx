import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  Image,
} from "react-native";

interface DialogProps {
  visible: boolean;
  onClose: () => void;
  onClickButton: () => void;
  title: string;
  message: string;
  buttonText: string;
  laterButtonText?: string;
  iconName: string;
}
const icons = {
  hetHan: require('../../../img/hetHan.png'),
  sapHetHan: require('../../../img/sapHetHan.png'),
  kiHetHan: require('../../../img/kiHetHanCTS.png'),
  capBu: require('../../../img/capBu.png'),
};
const DialogLoi = ({
  visible,
  onClose,
  onClickButton,
  title,
  message,
  buttonText,
  laterButtonText = "Để sau",
  iconName,
}: DialogProps) => {
  return (
    <Modal
      transparent={true}
      visible={visible}
      animationType="fade"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <View style={styles.dialogContainer}>
          <View style={styles.iconWrapper}>
            <Image
              source={icons[iconName] || icons['hetHan']}
              style={styles.icon}
            />
          </View>

          <Text style={styles.title}>{title}</Text>

          <Text style={styles.message}>{message}</Text>

          <TouchableOpacity
            style={styles.supportButton}
            onPress={onClickButton}
          >
            <Text style={styles.supportButtonText}>{buttonText}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.laterButton} onPress={onClose}>
            <Text style={styles.laterButtonText}>{laterButtonText}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  dialogContainer: {
    width: "100%",
    maxWidth: 340,
    backgroundColor: "white",
    borderRadius: 12,
    padding: 24,
    alignItems: "center",
  },
  iconWrapper: {
    width: 40,
    height: 40,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
    marginBottom: 12
  },
  icon: {
    width: 40,
    height: 40,
  },
  title: {
    fontSize: 14,
    color: "#DC2626",
    textAlign: "center",
    lineHeight: 20,
    marginBottom: 24,
  },
  message: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 12,
    textAlign: "center",
  },
  supportButton: {
    backgroundColor: "#2962FF",
    borderRadius: 8,
    paddingVertical: 12,
    width: "100%",
    alignItems: "center",
    marginBottom: 12,
  },
  supportButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "600",
  },
  laterButton: {
    paddingVertical: 12,
  },
  laterButtonText: {
    color: "#666",
    fontSize: 14,
  },
});

export default DialogLoi;
