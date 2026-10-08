import React, { useState } from "react";
import {
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

// Dummy data
const fakeData = [
  {
    id: 1,
    icon: require("../../../img/Transfer.png"),
    name: "Chuyển khoản",
    status: true,
  },
  {
    id: 2,
    icon: require("../../../img/Bank.png"),
    name: "Thẻ ATM nội địa",
    status: false,
  },
  {
    id: 3,
    icon: require("../../../img/card.png"),
    name: "Thẻ tín dụng/Ghi nợ",
    items: [],
    status: false,
  },
  {
    id: 4,
    icon: require("../../../img/Momo.png"),
    name: "Momo",
    status: false,
  },
];

const PhuongThucThanhToan = ({ visible, onCancel, onSubmit }) => {
  const [paymentType, setPaymentType] = useState(1);

  const handleSelect = (data) => {
    setPaymentType(data.id);
    onSubmit(data.name);
  };

  return (
    <Modal
      transparent={false}
      visible={visible}
      animationType="fade"
      onRequestClose={onCancel} // Android back button close
    >
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={onCancel}>
              <Image
                source={require("../../../img/CaretLeft.png")}
                width={24}
                height={24}
              />
            </TouchableOpacity>
            <Text style={styles.headerText}>Phương thức thanh toán</Text>
            <View width={24} />
          </View>
          <ScrollView style={{ paddingHorizontal: 16, marginTop: 10 }}>
            {fakeData.map((data, index) => (
              <View key={index}>
                <View
                  style={[
                    styles.dFlex,
                    {
                      paddingVertical: 16,
                      // borderBottomWidth: fakeData.length > 0 && index < fakeData.length - 1 ? 1 : 0,
                      // borderBottomColor: fakeData.length > 0 && index < fakeData.length - 1 ? '#EDF1F5' : '',
                      justifyContent: "space-between",
                      opacity: data.status ? 1 : 0.4,
                    },
                  ]}
                >
                  <View style={styles.dFlex}>
                    <Image
                      source={data.icon}
                      width={20}
                      height={20}
                      style={{ marginRight: 8 }}
                    />
                    <TouchableOpacity
                      disabled={!data.status}
                      onPress={() => handleSelect(data)}
                    >
                      <Text
                        style={{
                          fontWeight: data.status ? "600" : "400",
                          color: "#0F172A",
                        }}
                      >
                        {data.name}
                      </Text>
                    </TouchableOpacity>
                  </View>
                  {paymentType === data.id && (
                    <Image
                      source={require("../../../img/CheckGreen.png")}
                      width={20}
                      height={20}
                    />
                  )}
                  {data.items && (
                    <Image
                      source={require("../../../img/CaretDown.png")}
                      width={20}
                      height={20}
                    />
                  )}
                </View>
                {fakeData.length > 0 && index < fakeData.length - 1 && (
                  <View style={styles.line} />
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </SafeAreaView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  dFlex: {
    flexDirection: "row",
    alignItems: "center",
  },
  textInput: {
    flex: 1,
    paddingVertical: 6,
    paddingHorizontal: 12,
    backgroundColor: "#F8F8F8",
    borderRadius: 4,
    marginRight: 4,
    fontWeight: "600",
  },
  button: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 4,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1858EA",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  safeArea: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  modalContainer: {
    backgroundColor: "#FFFFFF",
    paddingBottom: 60,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#EDF1F5",
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  line: {
    borderWidth: 1,
    borderColor: "#EDF1F5",
  },
});

export default PhuongThucThanhToan;
