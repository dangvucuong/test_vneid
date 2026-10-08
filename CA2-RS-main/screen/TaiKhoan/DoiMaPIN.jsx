import {
  Alert,
  Image,
  Keyboard,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  KeyboardAvoidingView,
  Platform
} from "react-native";
import React, { useEffect, useState } from "react";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";
import { Formik } from "formik";
import * as yup from "yup";

import AppStyle from "../../styles/AppStyle";
import { en, vi } from "../../localize";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";

const i18n = new I18n();

const SetKey = async (keyName, value) => {
  await AsyncStorage.setItem(keyName, value);
};

export default function DoiMaPIN({ navigation }) {
  const [locale, setLocale] = useState("vi");
  const [showOldPin, setShowOldPin] = useState(false);
  const [showNewPin, setShowNewPin] = useState(false);
  const [showConfirmPin, setShowConfirmPin] = useState(false);
  const [showInputNewPin, setShowInputNewPin] = useState(false);

  i18n.translations = { en, vi };
  i18n.locale = locale;

  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setLocale(value);
      }
    });
  }, []);

  const toggleShowOldPin = () => {
    setShowOldPin(!showOldPin);
  };

  const toggleShowNewPin = () => {
    setShowNewPin(!showNewPin);
  };

  const toggleShowConfirmPin = () => {
    setShowConfirmPin(!showConfirmPin);
  };

  const validationSchema = yup.object().shape({
    oldPin: yup
      .string()
      .required(i18n.t("doi_ma_pin_Nhap_ma_pin_hien_tai_error")),
    newPin: yup.string().when("oldPin", {
      is: (val) => val && val.length > 0 && showInputNewPin,
      then: () =>
        yup.string().required(i18n.t("doi_ma_pin_Nhap_ma_pin_moi_error")),
    }),
    confirmPin: yup.string().when("oldPin", {
      is: (val) => val && val.length > 0 && showInputNewPin,
      then: () =>
        yup
          .string()
          .oneOf(
            [yup.ref("newPin"), null],
            i18n.t("doi_ma_pin_Xac_nhan_ma_pin_error")
          )
          .required(i18n.t("doi_ma_pin_Xac_nhan_ma_pin_moi_error")),
    }),
  });

  const changePIN = (oldPin, newPin) => {
    NetInfo.fetch().then((state) => {
      if (state.isConnected === true) {
        const dev_id = global.UUID;
        const token = global.RegID;
        const idcts = global.idcts;
        const url =
          "https://apisign.nacencomm.vn/api/APISigncore/Doimapin?pincode_new=" +
          newPin +
          "&pincode_old=" +
          oldPin +
          "&devid=" +
          dev_id +
          "&idcts=" +
          idcts;

        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson === 1) {
              Alert.alert(
                "CA2 REMOTE SIGNING",
                i18n.t("doi_ma_pin_Doi_ma_pin_thanh_cong"),
                [
                  {
                    text: "OK",
                    onPress: () =>
                      navigation.navigate("HomeWrapper", {
                        screen: "TaiKhoan",
                      }),
                  },
                ]
              );
            } else if (responseJson === -3) {
              createAlertCustom(
                i18n.t("doi_ma_pin_Nhap_ma_pin_hien_tai_khong_dung")
              );
            } else {
              createAlertCustom(i18n.t("doimktext6"));
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        createNo_internet();
      }
    });
  };

  const createAlert = () =>
    Alert.alert("CA2 REMOTE SIGNING", "Vui lòng nhập mã kích hoạt", [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createAlertCustom = (val) =>
    Alert.alert("CA2 REMOTE SIGNING", val, [
      { text: "OK", onPress: () => console.log("OK Pressed") },
    ]);

  const createNo_internet = () =>
    Alert.alert(
      "CA2 REMOTE SIGNING",
      "Không có kết nối internet. Vui lòng thử lại sau",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );

  const validateCurrentPin = (oldPin, setErrors) => {
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected) {
        const dev_id = global.UUID;
        const url =
          "https://apisign.nacencomm.vn/api/APISigncore/Kiemtrathietbi?device_id=" +
          dev_id;
        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then(async (responseJson) => {
            if (responseJson > 0) {
              const id = responseJson;
              global.idcts = id;
              const loginUrl =
                "https://apisign.nacencomm.vn/api/APISigncore/Dangnhap?idcts=" +
                id +
                "&device_id=" +
                dev_id +
                "&pincode=" +
                oldPin;
              fetch(loginUrl, {
                method: "POST",
                headers: {
                  Accept: "application/json",
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({}),
              })
                .then((response) => response.json())
                .then(async (responseJson) => {
                  if (responseJson > 1) {
                    setShowInputNewPin(true);
                  } else if (responseJson === -2) {
                    setErrors({
                      oldPin: i18n.t(
                        "doi_ma_pin_Nhap_ma_pin_hien_tai_khong_dung"
                      ),
                    });
                  } else {
                    setErrors({ oldPin: i18n.t("doi_ma_pin_Loi_khac") });
                  }
                })
                .catch((error) => {
                  console.error(error);
                });
            }
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        createNo_internet();
      }
    });
  };

  const handleSubmitPin = (values, { setErrors }) => {
    if (!showInputNewPin) {
      validateCurrentPin(values.oldPin, setErrors);
    } else {
      changePIN(values.oldPin, values.newPin);
    }
  };

  const InputNewPin = ({
    errors,
    touched,
    values,
    handleChange,
    handleBlur,
  }) => {
    return (
      <View>
        <View>
          <View style={styles.groupInput}>
            <TextInput
              style={[
                styles.input,
                errors.newPin && touched.newPin && styles.errorInput,
              ]}
              keyboardType="number-pad"
              secureTextEntry={!showNewPin}
              placeholder={i18n.t("doi_ma_pin_Nhap_ma_pin_moi")}
              onChangeText={handleChange("newPin")}
              onBlur={handleBlur("newPin")}
              value={values.newPin}
            />
            <TouchableOpacity style={styles.icon} onPress={toggleShowNewPin}>
              <Image
                source={
                  showNewPin
                    ? require("../../img/Eye.png")
                    : require("../../img/EyeClosed.png")
                }
                style={{ width: 16, height: 16 }}
              />
            </TouchableOpacity>
          </View>
          {errors.newPin && touched.newPin && (
            <Text style={styles.errorText}>{errors.newPin}</Text>
          )}
        </View>
        <View>
          <View style={styles.groupInput}>
            <TextInput
              style={[
                styles.input,
                errors.confirmPin && touched.confirmPin && styles.errorInput,
              ]}
              keyboardType="number-pad"
              secureTextEntry={!showConfirmPin}
              placeholder={i18n.t("doi_ma_pin_Nhap_lai_pin_moi")}
              onChangeText={handleChange("confirmPin")}
              onBlur={handleBlur("confirmPin")}
              value={values.confirmPin}
            />
            <TouchableOpacity
              style={styles.icon}
              onPress={toggleShowConfirmPin}
            >
              <Image
                source={
                  showConfirmPin
                    ? require("../../img/Eye.png")
                    : require("../../img/EyeClosed.png")
                }
                style={{ width: 16, height: 16 }}
              />
            </TouchableOpacity>
          </View>
          {errors.confirmPin && touched.confirmPin && (
            <Text style={styles.errorText}>{errors.confirmPin}</Text>
          )}
        </View>
      </View>
    );
  };

  return (
    <PageContainer>
      <KeyboardAvoidingView
        style={styles.containeKeyBoard}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
      >
        <PageHeader
          onBack={() => navigation.goBack()}
          title={i18n.t("tai_khoan_Doi_ma_pin")}
          rightComponent={() => {
            return (
              <TouchableOpacity
                onPress={() =>
                  Alert.alert("CA2 REMOTE SIGNING", "Chức năng sẽ cập nhật sau")
                }
              >
                <Image
                  source={require("../../img/PhoneCall.png")}
                  style={{ width: 24, height: 24 }}
                />
              </TouchableOpacity>
            );
          }}
        />
        <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
          <View style={styles.body}>
            <View>
              <Text
                style={[
                  AppStyle.headerMainText,
                  {
                    fontSize: 16,
                    fontWeight: "bold",
                  },
                ]}
              >
                {i18n.t(
                  `doi_ma_pin_Nhap_ma_pin_${
                    showInputNewPin ? "moi" : "hien_tai"
                  }`
                )}
              </Text>
              <Text style={[AppStyle.headerSmallText, { fontWeight: "bold" }]}>
                {i18n.t(
                  `doi_ma_pin_Nhap_ma_pin_${
                    showInputNewPin ? "moi" : "hien_tai"
                  }_sub_text`
                )}
              </Text>
            </View>
            <Formik
              initialValues={{ oldPin: "", newPin: "", confirmPin: "" }}
              validationSchema={validationSchema}
              onSubmit={handleSubmitPin}
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
              }) => (
                <View style={{ flex: 1, justifyContent: "space-between" }}>
                  {!showInputNewPin ? (
                    <View>
                      <View style={styles.groupInput}>
                        <TextInput
                          style={[
                            styles.input,
                            errors.oldPin &&
                              touched.oldPin &&
                              styles.errorInput,
                          ]}
                          keyboardType="number-pad"
                          secureTextEntry={!showOldPin}
                          placeholder={i18n.t("doi_ma_pin_Nhap_ma_pin")}
                          onChangeText={handleChange("oldPin")}
                          onBlur={handleBlur("oldPin")}
                          value={values.oldPin}
                        />
                        <TouchableOpacity
                          style={styles.icon}
                          onPress={toggleShowOldPin}
                        >
                          <Image
                            source={
                              showOldPin
                                ? require("../../img/Eye.png")
                                : require("../../img/EyeClosed.png")
                            }
                            style={{ width: 16, height: 16 }}
                          />
                        </TouchableOpacity>
                      </View>
                      {errors.oldPin && touched.oldPin && (
                        <Text style={styles.errorText}>{errors.oldPin}</Text>
                      )}
                    </View>
                  ) : (
                    <InputNewPin
                      errors={errors}
                      touched={touched}
                      values={values}
                      handleChange={handleChange}
                      handleBlur={handleBlur}
                    />
                  )}
                  <TouchableOpacity
                    style={[
                      styles.button,
                      (!values.oldPin ||
                        (showInputNewPin &&
                          (!values.newPin || !values.confirmPin))) &&
                        styles.disabledButton,
                    ]}
                    disabled={
                      !values.oldPin ||
                      (showInputNewPin &&
                        (!values.newPin || !values.confirmPin))
                    }
                    onPress={handleSubmit}
                  >
                    <Text
                      style={[
                        styles.buttonText,
                        (!values.oldPin ||
                          (showInputNewPin &&
                            (!values.newPin || !values.confirmPin))) &&
                          styles.disabledText,
                      ]}
                    >
                      {i18n.t("doi_ma_pin_Xac_nhan")}
                    </Text>
                  </TouchableOpacity>
                </View>
              )}
            </Formik>
          </View>
        </TouchableWithoutFeedback>
      </KeyboardAvoidingView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  containeKeyBoard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
  },
  root: {
    flex: 1,
    backgroundColor: "#F7F8F9",
  },
  dFlex: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "bold",
  },
  body: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    width: "100%",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#1858EA",
  },
  disabledButton: {
    backgroundColor: "#F3F4F6",
  },
  buttonText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
    color: "#FFFFFF",
  },
  disabledText: {
    color: "#9CA3AF",
  },
  groupInput: {
    position: "relative",
    width: "100%",
    alignItems: "flex-end",
    justifyContent: "center",
    marginTop: 24,
  },
  input: {
    width: "100%",
    paddingVertical: 12,
    paddingLeft: 16,
    paddingRight: 48,
    backgroundColor: "#F3F4F6",
    borderRadius: 6,
  },
  errorInput: {
    borderWidth: 1,
    borderColor: "#FACED6",
  },
  errorText: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#EB3A5A",
    marginTop: 8,
  },
  icon: {
    position: "absolute",
    right: 16,
  },
});
