import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import ReactNativeBiometrics from "react-native-biometrics";

export default function BaoMat({ navigation, route }) {
  const { i18n } = useI18n();
  const GetKey = async (key) => {
    let value = null;
    try {
      value = await AsyncStorage.getItem(key);
      return value;
    } catch (e) {
      return value;
    } finally {
      return value;
    }
  };
  const [disableFaceIdSwitch, setDisableFaceIdSwitch] = useState(false);

  const Setkey = async (keyname, value) => {
    await AsyncStorage.setItem(keyname, value);
  };

  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("@xacthuc2yeuto");
        const checkSupport = await GetKey("@biometric");
        if (checkSupport === "1") {
          //support biometric
          if (value !== null) {
            if (value === "1") {
              setIsEnabled1(true);
            } else {
              setIsEnabled1(false);
            }
          } else {
            try {
              await AsyncStorage.setItem("@xacthuc2yeuto", "0");
            } catch (error) {
              console.log(error);
            }
          }
        } else {
          //khong support biometric
          try {
            await AsyncStorage.setItem("@xacthuc2yeuto", "0");
            setDisableFaceIdSwitch(false);
          } catch (error) {
            console.log(error);
          }
        }
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, []);

  const [isEnabled, setIsEnabled] = useState(true);
  const [isEnabled1, setIsEnabled1] = useState(false);
  const toggleSwitch = () => setIsEnabled((previousState) => !previousState);

  const toggleSwitch1 = async () => {
    const rnBiometrics = new ReactNativeBiometrics();
  
    if (!isEnabled1) {
      // Nếu FaceID/TouchID đang tắt và cần bật
      const { available, biometryType } = await rnBiometrics.isSensorAvailable();
  
      if (!available) {
        Alert.alert(
          "Thông báo",
          "Thiết bị của bạn không hỗ trợ hoặc chưa bật FaceID/TouchID"
        );
        return;
      }
  
      try {
        const authResult = await rnBiometrics.simplePrompt({
          promptMessage: "Xác thực FaceID/TouchID để bật tính năng",
          cancelButtonText: "Hủy",
        });
  
        if (authResult.success) {
          // Xác thực thành công
          setIsEnabled1(true);
          await AsyncStorage.setItem("@xacthuc2yeuto", "1");
        } else {
          Alert.alert("Thông báo", "Xác thực không thành công");
        }
      } catch (error) {
        Alert.alert("Thông báo", "Xác thực không thành công hoặc đã bị hủy");
      }
    } else {
      // Nếu FaceID/TouchID đang bật và cần tắt
      setIsEnabled1(false);
      await AsyncStorage.setItem("@xacthuc2yeuto", "0");
      Alert.alert("Thông báo", "FaceID/TouchID đã được tắt");
    }
  };

  const [locale, setlocale] = useState("vi");
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("bao_mat")}
      />

      <View style={styles.body}>
        <View
          style={[
            styles.dFlex,
            { alignItems: "center", justifyContent: "space-between" },
          ]}
        >
          <View style={styles.dFlex}>
            <Image
              source={require("../../img/FaceID.png")}
              style={styles.buttonIcon}
            />
            <Text style={styles.buttonLabel}>{i18n.t("bao_mat_Face_id")}</Text>
          </View>
          <Switch
            trackColor={{ true: "#336DD1", false: "#DDE3EB" }}
            thumbColor="#FFF"
            ios_backgroundColor="white"
            onChange={toggleSwitch1}
            value={isEnabled1}
            disabled={disableFaceIdSwitch}
          />
        </View>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  body: {
    flex: 1,
    justifyContent: "space-between",
    marginTop: 12,
    paddingVertical: 20,
    paddingHorizontal: 16,
    backgroundColor: "#FFFFFF",
    width: "100%",
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
  buttonIcon: {
    width: 20,
    height: 20,
    marginRight: 12,
  },
  buttonLabel: {
    fontSize: 14,
    color: "#0F172A",
  },
  button: {
    paddingVertical: 12,
    borderRadius: 8,
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
});
