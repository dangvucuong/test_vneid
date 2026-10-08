import React, {
  useState,
  useEffect,
  useCallback,
  useMemo,
  useRef,
} from "react";
import {
  View,
  TextInput,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from "react-native";
import { KichHoatStyle, StartStyle } from "../../styles";
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Sử dụng context i18n
import DeviceInfo from "react-native-device-info"; // Import react-native-device-info
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, Input, Button } from "@rneui/themed";
import { useForm, Controller } from "react-hook-form";
const OCRData: React.FC = ({ navigation, route }: any) => {
  const { i18n } = useLanguage(); // Lấy i18n từ context
  const { qrData, onComplete } = route.params || {};

  // Hàm parse dữ liệu từ qrData
  const parseQRData = (qrData: string) => {
    try {
      const arr = qrData.split("|");
      const datecap = arr[6]; // 25022021
      const temp =
        datecap.substring(0, 2) +
        "/" +
        datecap.substring(2, 4) +
        "/" +
        datecap.substring(4);
      return {
        cccd: arr[0],
        madinhdanh: arr[1],
        fullName: arr[2],
        dateOfBirth: arr[3],
        gender: arr[4],
        address: arr[5],
        issueDate: temp,
        city: arr[5].split(",")[arr[5].split(",").length - 1].trim(),
      };
    } catch (error) {
      console.error("Error parsing QR data:", error);
      return null;
    }
  };

  // Dữ liệu từ qrData nếu có
  const qrInfo = qrData ? parseQRData(qrData) : null;

  const deviceFields = [
    {
      name: "deviceName",
      defaultValue: "",
      label: i18n.t(`orc_data.device_info.deviceName`),
      disabled: true,
    },
    {
      name: "deviceType",
      defaultValue: "",
      label: i18n.t(`orc_data.device_info.deviceType`),
      disabled: true,
    },
    {
      name: "os",
      defaultValue: "",
      label: i18n.t(`orc_data.device_info.os`),
      disabled: true,
    },
    {
      name: "version",
      defaultValue: "",
      label: i18n.t(`orc_data.device_info.version`),
      disabled: true,
    },
    {
      name: "uuid",
      defaultValue: "",
      label: i18n.t(`orc_data.device_info.uuid`),
      disabled: true,
    },
  ];
  const contactFields = [
    {
      name: "DienThoai",
      defaultValue: "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.contact_info.DienThoai"),
      required: true,
    },
    {
      name: "email",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.contact_info.email"),
      defaultValue: "",
      required: true,
    },
    {
      name: "TKKinhdoanh",
      label: i18n.t("orc_data.contact_info.TKKinhdoanh"),
      defaultValue: "",
    },
  ];
  const personalFields = [
    {
      name: "hoVaTen",
      defaultValue: qrInfo?.fullName || "",
      rules: { required: i18n.t("required") },
      required: true,
      label: i18n.t("orc_data.personal_info.hoVaTen"),
    },
    {
      name: "maSoCaNhan",
      defaultValue: qrInfo?.cccd || "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.personal_info.maSoCaNhan"),
      required: true,
    },
    {
      name: "diaChi",
      defaultValue: qrInfo?.address || "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.personal_info.diaChi"),
      required: true,
    },
    {
      name: "ngayCap",
      defaultValue: qrInfo?.issueDate || "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.personal_info.ngayCap"),
      required: true,
    },
    {
      name: "tinhTP",
      defaultValue: qrInfo?.city || "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.personal_info.tinhTP"),
      required: true,
    },
    {
      name: "noiCap",
      defaultValue: "",
      rules: { required: i18n.t("required") },
      label: i18n.t("orc_data.personal_info.noiCap"),
      required: true,
    },
  ];
  // Lấy thông tin thiết bị
  useEffect(() => {
    const fetchDeviceInfo = async () => {

        const deviceName = await DeviceInfo.getModel();// Lấy tên thiết bị
        setValue("deviceName", deviceName);
        const deviceType =await DeviceInfo.getBrand();
        setValue("deviceType", deviceType);
        const os = await DeviceInfo.getSystemName();
        setValue("os", os);
        const version = await DeviceInfo.getSystemVersion();
        setValue("version", version);
        const uuid = await DeviceInfo.getUniqueId();
        setValue("uuid", uuid);
  
    };

    fetchDeviceInfo();
  }, []);

  // Hàm xử lý khi submit
  const onSubmit = async (data) => {
    console.log("Data:", data);
    const personalInfo = {
      hoVaTen: data.hoVaTen,
      maSoCaNhan: data.maSoCaNhan,
      diaChi: data.diaChi,
      ngayCap: data.ngayCap,
      tinhTP: data.tinhTP,
      noiCap: data.noiCap,
    };
    const deviceInfo = {
      deviceName: data.deviceName,
      deviceType: data.deviceType,
      os: data.os,
      version: data.version,
      uuid: data.uuid,
    };
    const contactInfo = {
      DienThoai: (data.DienThoai || "").trim(),
      email: (data.email || "").trim(),
      makd: (data.TKKinhdoanh || "").trim(),
      TKKinhdoanh: (data.TKKinhdoanh || "").trim(),
    };
    await AsyncStorage.setItem(
      "@registration_contact",
      JSON.stringify(contactInfo)
    );
    const finalData = {
      personalInfo,
      deviceInfo,
      contactInfo,
      type: "OKR",
    };
    onComplete(finalData); // Trả dữ liệu về màn trước
  };
  const {
    control,
    handleSubmit,
    watch,
    setValue,
    formState: { errors },
  } = useForm<{
    deviceName: string;
    deviceType: string;
    os: string;
    version: string;
    uuid: string;
    DienThoai: string;
    email: string;
    TKKinhdoanh: string;
    hoVaTen: string;
    maSoCaNhan: string;
    diaChi: string;
    ngayCap: string;
    tinhTP: string;
    noiCap: string;
  }>({
    defaultValues: [
      ...contactFields,
      ...personalFields,
      ...deviceFields,
    ].reduce((acc, field) => {
      acc[field.name] = field.defaultValue;
      return acc;
    }, {}),
  });
  console.log(watch());
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 50}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContainer}
          keyboardShouldPersistTaps="handled"
        >
          <Text style={styles.header}>{i18n.t("orc_data.title")}</Text>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("orc_data.personal_info.title")}
            </Text>
            {personalFields.map(({ name, label, rules, required }) => (
              <View key={name} style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {label}
                  <Text style={styles.requiredColor}>
                    {required ? " *" : ""}
                  </Text>
                </Text>
                <Controller
                  control={control}
                  name={name}
                  rules={rules}
                  render={({ field: { onChange, value } }) => (
                    <>
                      {errors[name] && (
                        <Text style={styles.errorText}>
                          {errors[name]?.message}
                        </Text>
                      )}
                      <Input
                        value={value}
                        onChangeText={onChange}
                        containerStyle={styles.inputWrapper}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                      />
                    </>
                  )}
                />
              </View>
            ))}
          </View>
          {/* Thông tin thiết bị */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("orc_data.device_info.title")}
            </Text>
            {deviceFields.map(({ name, label, rules, disabled }) => (
              <View key={name} style={styles.fieldContainer}>
                <Text style={styles.label}>{label}</Text>
                <Controller
                  control={control}
                  name={name}
                  rules={rules}
                  render={({ field: { onChange, value } }) => (
                    <Input
                      value={value}
                      onChangeText={onChange}
                      disabled={disabled}
                      editable={false}
                      containerStyle={styles.inputWrapper}
                      inputContainerStyle={styles.inputContainer}
                      inputStyle={styles.inputText}
                      style={styles.readOnlyInput}
                    />
                  )}
                />
              </View>
            ))}
          </View>
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              {i18n.t("orc_data.contact_info.title")}
            </Text>
            {contactFields.map(({ name, label, rules, required }) => (
              <View key={name} style={styles.fieldContainer}>
                <Text style={styles.label}>
                  {label}
                  <Text style={styles.requiredColor}>
                    {required ? " *" : ""}
                  </Text>
                </Text>
                <Controller
                  control={control}
                  name={name}
                  rules={rules}
                  render={({ field: { onChange, value } }) => (
                    <>
                      {errors[name] && (
                        <Text style={styles.errorText}>
                          {errors[name]?.message}
                        </Text>
                      )}
                      <Input
                        value={value}
                        onChangeText={onChange}
                        containerStyle={styles.inputWrapper}
                        inputContainerStyle={styles.inputContainer}
                        inputStyle={styles.inputText}
                      />
                    </>
                  )}
                />
              </View>
            ))}
          </View>
          <TouchableOpacity
            style={styles.submitButton}
            onPress={handleSubmit(onSubmit)}
          >
            <Text style={styles.submitButtonText}>
              {i18n.t("orc_data.submit_button")}
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
  // return (
  //   <SafeAreaView style={styles.container}>
  //     {/* Bọc toàn bộ giao diện với KeyboardAvoidingView */}
  //     <KeyboardAvoidingView
  //       style={{ flex: 1 }}
  //       behavior={Platform.OS === "ios" ? "padding" : "position"}
  //       keyboardVerticalOffset={Platform.OS === "android" ? 50 : 0} // Điều chỉnh khoảng cách trên Android
  //     >
  //       <ScrollView
  //         contentContainerStyle={styles.scrollContainer}
  //         keyboardShouldPersistTaps="handled"
  //       >
  //         <Text style={styles.header}>{i18n.t("orc_data.title")}</Text>

  //         {/* Thông tin cá nhân */}
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>
  //             {i18n.t("orc_data.personal_info.title")}
  //           </Text>
  //           {Object.keys(personalInfo).map((key) => (
  //             <View key={key} style={styles.inputGroup}>
  //               <Text style={styles.label}>
  //                 {i18n.t(`orc_data.personal_info.${key}`)}
  //                 <Text style={styles.required}>{" *"}</Text>
  //               </Text>
  //               <TextInput
  //                 style={styles.input}
  //                 value={personalInfo[key as keyof typeof personalInfo]}
  //                 onChangeText={(text) =>
  //                   setPersonalInfo({ ...personalInfo, [key]: text })
  //                 }
  //               />
  //             </View>
  //           ))}
  //         </View>
  //         {/* Thông tin thiết bị */}
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>
  //             {i18n.t("orc_data.device_info.title")}
  //           </Text>
  //           {Object.keys(deviceInfo).map((key) => (
  //             <View key={key} style={styles.inputGroup}>
  //               <Text style={styles.label}>
  //                 {i18n.t(`orc_data.device_info.${key}`)}
  //               </Text>
  //               <TextInput
  //                 style={[styles.input, styles.readOnlyInput]}
  //                 value={deviceInfo[key as keyof typeof deviceInfo]}
  //                 editable={false} // Không cho chỉnh sửa thông tin thiết bị
  //               />
  //             </View>
  //           ))}
  //         </View>
  //         {/* Thông tin liên hệ */}
  //         <View style={styles.section}>
  //           <Text style={styles.sectionTitle}>
  //             {i18n.t("orc_data.contact_info.title")}
  //           </Text>
  //           {Object.keys(contactInfo).map((key) => (
  //             <View key={key} style={styles.inputGroup}>
  //               <Text style={styles.label}>
  //                 {i18n.t(`orc_data.contact_info.${key}`)}
  //                 <Text style={styles.required}>{key !== "TKKinhdoanh" && " *"}</Text>
  //               </Text>
  //               <TextInput
  //                 style={styles.input}
  //                 value={contactInfo[key as keyof typeof contactInfo]}
  //                 onChangeText={(text) =>
  //                   setContactInfo({ ...contactInfo, [key]: text })
  //                 }
  //               />
  //             </View>
  //           ))}
  //         </View>

  //         {/* Nút Tiếp tục */}
  //         <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
  //           <Text style={styles.submitButtonText}>
  //             {i18n.t("orc_data.submit_button")}
  //           </Text>
  //         </TouchableOpacity>
  //       </ScrollView>
  //     </KeyboardAvoidingView>
  //   </SafeAreaView>
  // );
};

export default OCRData;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  scrollContainer: {
    padding: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
  },
  section: {
    marginBottom: 30,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  inputGroup: {
    marginBottom: 10,
  },
  required: {
    color: "red", // Dấu * màu đỏ
  },
  input: {
    borderWidth: 1,
    borderColor: "#CCC",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
    color: "#333",
    backgroundColor: "#FFFFFF", // Đặt màu nền trắng
  },
  readOnlyInput: {
    backgroundColor: "#F0F0F0", // Màu xám nhạt cho ô chỉ đọc
  },
  submitButton: {
    backgroundColor: "#0056D2",
    borderRadius: 8,
    paddingVertical: 15,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "bold",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
    marginTop: 20,
  },
  label: {
    fontSize: 14,
    marginTop: 10,
    marginBottom: 5,
  },
  inputContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  inputText: {
    fontSize: 16,
  },
  fieldContainer: {
    flexDirection: "column",
    alignItems: "stretch",
  },
  inputWrapper: {
    width: "100%",
  },
  requiredColor: {
    color: "red",
  },
  errorText: {
    color: "red",
    fontSize: 12,
    marginTop: 2,
  },
});
