import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import ReactNativeBiometrics from "react-native-biometrics";
import { useI18n } from "../../utils/i18n";
import { performLogout } from "../../utils/sessionManager";
import { setBatchSignOnceEnabled } from "../../utils/batchSignSettings";
import PageContainer from "../component/PageContainer";
import ActionSheet from "./components/ActionSheet";
import RatingApp from "./components/RatingApp";
import SupportCenterModal from "./components/SupportCenterModal";
import { SafeAreaView } from "react-native-safe-area-context";
import { SafeAreaApp } from "../component/SafeAreaApp";
import HeaderInfo from "../component/HeaderInfo";
import { hitSlop } from "../../utils/constant";

export default function TaiKhoan({ navigation, props }) {
  const isFocused = useIsFocused();
  const { i18n, locale, setLocale } = useI18n();

  const defaultAvatar = require("../../img/UserAvatar.png");
  const [pic, setPic] = useState(defaultAvatar);
  const [modalVisible, setModalVisible] = useState(false);
  const [isVisibleChangeLanguage, setIsVisibleChangeLanguage] = useState(false);
  const [isVisibleSupportCenter, setIsVisibleSupportCenter] = useState(false);
  const [kyLoMotLanEnabled, setKyLoMotLanEnabled] = useState(false);

  const rnBiometrics = new ReactNativeBiometrics();

  const languages = [
    {
      key: "vi",
      value: "Tiếng Việt",
    },
    {
      key: "en",
      value: "Tiếng Anh",
    },
  ];

  const RefreshAll = () => {
    AsyncStorage.getItem("@avatar").then((value) => {
      if (value != null) {
        setPic({ uri: value });
      } else {
        setPic(defaultAvatar);
      }
    });
  };

  useEffect(() => {
    // Call only when screen open or when back on screen
    if (isFocused) {
      RefreshAll();
    }
  }, [props, isFocused]);

  useEffect(() => {
    AsyncStorage.getItem("@avatar").then((value) => {
      if (value != null) {
        // console.log(value);
        setPic({ uri: value });
      } else {
        setPic(defaultAvatar);
      }
    });
    AsyncStorage.getItem("@xacthucKyLoMotLan").then((value) => {
      setKyLoMotLanEnabled(value === "1");
    });
  }, []);

  const toggleKyLoMotLan = async () => {
    if (!kyLoMotLanEnabled) {
      const { available } = await rnBiometrics.isSensorAvailable();
      const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
      if (factor !== "1" && available) {
        const authResult = await rnBiometrics.simplePrompt({
          promptMessage: i18n.t("tai_khoan_Ky_lo_mot_lan"),
          cancelButtonText: i18n.t("cancel_text"),
        });
        if (!authResult.success) return;
      }
      setKyLoMotLanEnabled(true);
      await setBatchSignOnceEnabled(true);
    } else {
      setKyLoMotLanEnabled(false);
      await setBatchSignOnceEnabled(false);
    }
  };

  const handleChangeLanguage = async (key) => {
    setLocale(key);
    await AsyncStorage.setItem("@language", key);
  };

  return (
    <PageContainer>
      <SafeAreaApp style={styles.header}>
        <Text style={styles.headerTitle}>{i18n.t("tai_khoan")}</Text>
      </SafeAreaApp>
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <HeaderInfo onClickRefresh={() => {}} />

        <View style={[styles.commonLayout, styles.functionGroup]}>
          <Text style={styles.textTitle}>{i18n.t("tai_khoan_Ung_dung")}</Text>
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => navigation.navigate("QuanLyTaiLieuList")}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/FileText.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Quan_ly_tai_lieu")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.commonLayout, styles.functionGroup]}>
          <Text style={styles.textTitle}>
            {i18n.t("tai_khoan_Quan_ly_dich_vu")}
          </Text>
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => navigation.navigate("ThongTinCTS")}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/IdentificationCard.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Thong_tin_chung_thu_so")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => navigation.navigate("ThongTinGoiButKy")}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/ShoppingBasket.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Thong_tin_goi_dich_vu")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
        </View>

        <View style={[styles.commonLayout, styles.functionGroup]}>
          <Text style={styles.textTitle}>{i18n.t("tai_khoan_Thiet_lap")}</Text>
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => navigation.navigate("DoiMaPIN")}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/LockKey.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Doi_ma_pin")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
          <View style={styles.line} />
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => navigation.navigate("BaoMat")}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/FingerprintSimple.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Bao_mat_sinh_trac")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
          <View style={styles.line} />
          <View style={[styles.dFlex, styles.functionItem, { justifyContent: "space-between" }]}>
            <View style={{ flex: 1, paddingRight: 12 }}>
              <View style={styles.dFlex}>
                <Image
                  source={require("../../img/PencilCircle.png")}
                  style={styles.leftIcon}
                />
                <Text>{i18n.t("tai_khoan_Ky_lo_mot_lan")}</Text>
              </View>
              <Text style={styles.settingDesc}>
                {i18n.t("tai_khoan_Ky_lo_mot_lan_desc")}
              </Text>
            </View>
            <Switch
              trackColor={{ true: "#336DD1", false: "#DDE3EB" }}
              thumbColor="#FFF"
              ios_backgroundColor="white"
              onValueChange={toggleKyLoMotLan}
              value={kyLoMotLanEnabled}
            />
          </View>
          <View style={styles.line} />
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => setIsVisibleChangeLanguage(true)}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/GlobeSimple.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Ngon_ngu")}</Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={{ color: "#9CA3AF", fontSize: 13 }}>
                {i18n.t(`language_${locale}`)}
              </Text>
              <Image
                source={require("../../img/CaretRight.png")}
                style={styles.rightIcon}
              />
            </View>
          </TouchableOpacity>
        </View>

        <View
          style={[
            styles.commonLayout,
            styles.functionGroup,
            { paddingBottom: 16 },
          ]}
        >
          <Text style={styles.textTitle}>{i18n.t("tai_khoan_Khac")}</Text>
          <TouchableOpacity
            style={[styles.dFlex, styles.functionItem]}
            onPress={() => setIsVisibleSupportCenter(true)}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../img/Headphones.png")}
                style={styles.leftIcon}
              />
              <Text>{i18n.t("tai_khoan_Trung_tam_ho_tro")}</Text>
            </View>
            <Image
              source={require("../../img/CaretRight.png")}
              style={styles.rightIcon}
            />
          </TouchableOpacity>
          <RatingApp />
          <Text style={styles.productInfo}>
            {i18n.t("tai_khoan_Thong_tin_san_pham")}
          </Text>
        </View>

        <TouchableOpacity
          style={styles.logoutButton}
          onPress={() => {
            setModalVisible(true);
          }}
          hitSlop={hitSlop}
        >
          <Text style={{ fontSize: 14, color: "#DC2626" }}>
            {i18n.t("tai_khoan_Dang_xuat")}
          </Text>
        </TouchableOpacity>

        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(!modalVisible)}
        >
          <View style={styles.container}>
            <View style={styles.modalConfirm}>
              <Text
                style={[
                  styles.modalText,
                  { marginHorizontal: 3, color: "#475569" },
                ]}
              >
                {i18n.t("tai_khoan_Xac_nhan_dang_xuat")}
              </Text>
              <View style={[styles.dFlex, { marginTop: 32 }]}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "#DDE3EB", marginRight: 13 },
                  ]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={[styles.modalText, { color: "#0F172A" }]}>
                    {i18n.t("cancel_text")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#1858EA" }]}
                  onPress={async () => {
                    setModalVisible(!modalVisible);
                    await performLogout();
                    navigation.navigate("Login");
                  }}
                >
                  <Text style={[styles.modalText, { color: "#FFFFFF" }]}>
                    {i18n.t("tai_khoan_Dang_xuat")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <ActionSheet
        visible={isVisibleChangeLanguage}
        options={languages}
        onCancel={() => setIsVisibleChangeLanguage(false)}
        onSelect={handleChangeLanguage}
        selectedValue={locale}
      />

      <SupportCenterModal
        visible={isVisibleSupportCenter}
        onCancel={() => setIsVisibleSupportCenter(false)}
      />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    width: "100%",
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "bold",
  },
  dFlex: {
    flexDirection: "row",
    alignItems: "center",
  },
  commonLayout: {
    padding: 16,
    paddingBottom: 0,
    width: "100%",
    backgroundColor: "#FFFFFF",
  },
  functionGroup: {
    marginTop: 8,
  },
  textTitle: {
    color: "#6B7280",
    fontSize: 14,
    marginBottom: 8,
  },
  settingDesc: {
    color: "#9CA3AF",
    fontSize: 12,
    marginTop: 4,
    marginLeft: 28,
    lineHeight: 16,
  },
  functionItem: {
    paddingVertical: 16,
    justifyContent: "space-between",
  },
  leftIcon: {
    width: 20,
    height: 20,
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
    width: 16,
    height: 16,
  },
  line: {
    borderWidth: 1,
    borderColor: "#EDF1F5",
  },
  ratingBanner: {
    paddingVertical: 8,
    paddingLeft: 16,
    backgroundColor: "#E8F2FF",
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
    justifyContent: "space-between",
    flexDirection: "row",
  },
  ratingView: {
    marginHorizontal: 28,
    marginVertical: 16,
    justifyContent: "space-between",
  },
  productInfo: {
    marginTop: 8,
    textAlign: "center",
    fontSize: 12,
    color: "#9CA3AF",
  },
  logoutButton: {
    marginTop: 8,
    marginBottom: 48,
    paddingVertical: 12,
    paddingHorizontal: 24,
    position: "relative",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107, 114, 128, 0.45)",
  },
  modalConfirm: {
    paddingVertical: 24,
    paddingHorizontal: 12,
    backgroundColor: "#FFFFFF",
    borderRadius: 8,
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  modalText: {
    fontSize: 14,
    fontWeight: "bold",
    textAlign: "center",
  },
  menu_btn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: {
    width: 24,
    height: 24,
  },
  iconBig: {
    width: 38,
    height: 38,
  },
  text: {
    fontSize: 10,
  },
});
