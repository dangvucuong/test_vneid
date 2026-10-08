import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  SafeAreaView,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export default function DangKyCaNhanThuocToChuc({ navigation, route }) {
  const [formData, setFormData] = useState({
    companyName: "",
    taxCode: "",
    customerName: "",
    phoneNumber: "",
    employeeCode: "",
  });

  const [isFormValid, setIsFormValid] = useState(false);

  useEffect(() => {
    const { companyName, taxCode, customerName, phoneNumber } = formData;
    setIsFormValid(companyName && taxCode && customerName && phoneNumber);
  }, [formData]);

  const handleInputChange = (field, value) => {
    setFormData((prevData) => ({ ...prevData, [field]: value }));
  };

  const handleSubmit = () => {
    if (isFormValid) {
      console.log("Form submitted:", formData);
      // Add your submission logic here
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => {
            navigation.goBack();
          }}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Cá nhân thuộc tổ chức</Text>
        <TouchableOpacity style={styles.infoButton}>
          <Ionicons name="information-circle-outline" size={24} color="black" />
        </TouchableOpacity>
      </View>

      {/* Form */}
      <ScrollView style={styles.formContainer}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin doanh nghiệp</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tên công ty<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập Text"
              placeholderTextColor="#A0A0A0"
              value={formData.companyName}
              onChangeText={(text) => handleInputChange("companyName", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Mã số thuế<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập Text"
              placeholderTextColor="#A0A0A0"
              value={formData.taxCode}
              onChangeText={(text) => handleInputChange("taxCode", text)}
            />
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Thông tin liên hệ</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Tên khách hàng<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập Text"
              placeholderTextColor="#A0A0A0"
              value={formData.customerName}
              onChangeText={(text) => handleInputChange("customerName", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              Số điện thoại<Text style={styles.asterisk}>*</Text>
            </Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập Text"
              placeholderTextColor="#A0A0A0"
              keyboardType="phone-pad"
              value={formData.phoneNumber}
              onChangeText={(text) => handleInputChange("phoneNumber", text)}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Mã nhân viên ghi chú</Text>
            <TextInput
              style={styles.input}
              placeholder="Nhập mã nhân viên"
              placeholderTextColor="#A0A0A0"
              value={formData.employeeCode}
              onChangeText={(text) => handleInputChange("employeeCode", text)}
            />
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormValid && styles.submitButtonEnabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormValid}
        >
          <Text
            style={[
              styles.submitButtonText,
              isFormValid && styles.submitButtonTextEnabled,
            ]}
          >
            Gửi thông tin
          </Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#E5E5E5",
  },
  backButton: {
    padding: 4,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
  },
  infoButton: {
    padding: 4,
  },
  formContainer: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#000",
    marginBottom: 16,
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    color: "#000",
    marginBottom: 8,
  },
  asterisk: {
    color: "red",
  },
  input: {
    height: 44,
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 14,
    color: "#000",
  },
  submitButton: {
    backgroundColor: "#fff",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 24,
    marginBottom: 32,
    borderWidth: 1,
    borderColor: "#E5E5E5",
  },
  submitButtonEnabled: {
    backgroundColor: "#1858EA", // Green color when enabled
    borderColor: "#1858EA",
  },
  submitButtonText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
  submitButtonTextEnabled: {
    color: "#fff",
  },
});
