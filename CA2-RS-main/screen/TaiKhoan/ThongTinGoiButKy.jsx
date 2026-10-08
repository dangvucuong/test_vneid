import React, { useEffect, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import moment from "moment";
import { en, vi } from "../../localize";
import { I18n } from "i18n-js";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
const i18n = new I18n();
export default function ThongTinGoiButKy({ navigation }) {
  const [useDate, setUseDate] = useState("");
  const [leftDate, setLeftDate] = useState("");
  const [locale, setLocale] = useState("vi");
  i18n.translations = { en, vi };
  i18n.locale = locale;

  useEffect(() => {
    const getData = () => {
      if (global.NgayKT != null) {
        const start = moment(new Date());
        const end = moment(global.NgayKT);
        setLeftDate(end.diff(start, "days"));
        const end1 = moment(global.NgayBD);
        setUseDate(start.diff(end1, "days"));
      }
    };
    getData();
  }, []);

  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setLocale(value);
      }
    });
  }, []);
  const copyToClipboard = async (value) => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: "success",
      text1: "Thành công",
      text2: `Đã sao chép ${value} vào bộ nhớ tạm`,
      text2Style: {
        fontSize: 14,
        fontWeight: "normal",
        flexWrap: "wrap", // Cho phép văn bản xuống dòng
      },
      position: "top", // Đặt vị trí hiển thị (top, bottom)
      visibilityTime: 3000, // Thời gian hiển thị (ms)
      props: {
        style: {
          maxWidth: "90%", // Giới hạn chiều rộng tối đa của Toast
        },
      },
    });
  };
  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("thong_tin_goi_dich_vu_title")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <View
          style={{
            marginVertical: 8,
            padding: 16,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View style={styles.dFlex}>
            <Image
              source={require("../../img/IdentificationCard.png")}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#0F172A",
              }}
            >
              {global.cn}
            </Text>
          </View>
          <View style={{ marginVertical: 20, gap: 12 }}>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Chung_thu_so")}
              </Text>
              <Text style={[styles.valueText, styles.rightText]}>
                {i18n.t("thong_tin_goi_dich_vu_Ca_nhan")}
              </Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Dinh_danh_but_ky")}
              </Text>
              <TouchableOpacity onPress={() => copyToClipboard(global.idcts)}>
                <Text style={[styles.valueText, styles.rightText]}>
                  {global.idcts}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Goi_dich_vu")}
              </Text>
              <Text style={[styles.valueText, styles.rightText]}>
                {global.GoiDK}
              </Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Thanh_toan")}
              </Text>
              <Text
                style={[
                  styles.valueText,
                  { color: "#21C75E" },
                  styles.rightText,
                ]}
              >
                -
              </Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Trang_thai_cts")}
              </Text>
              <Text
                style={[
                  styles.valueText,
                  {
                    color:
                      global.NgayKT &&
                      moment(global.NgayKT, "YYYY-MM-DD").isBefore(
                        moment(),
                        "day"
                      )
                        ? "#DC2626" // Màu đỏ nếu đã hết hạn
                        : "#21C75E", // Màu xanh nếu đang hoạt động
                  },
                ]}
                selectable={true}
              >
                {global.NgayKT &&
                moment(global.NgayKT, "YYYY-MM-DD").isBefore(moment(), "day")
                  ? i18n.t("ctstext14") // Đã hết hạn
                  : i18n.t("ctstext13")}{" "}
                {/* Đang hoạt động */}
              </Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Trang_thai_ho_so")}
              </Text>
              <Text
                style={[
                  styles.valueText,
                  { color: "#DC2626" },
                  styles.rightText,
                ]}
              >
                -
              </Text>
            </View>
            <View style={styles.dFlex}>
              <Text style={styles.labelText}>
                {i18n.t("thong_tin_goi_dich_vu_Muc")}
              </Text>
              <Text style={[styles.valueText, styles.rightText]}>
                {i18n.t("thong_tin_goi_dich_vu_Da_dung")} {useDate}{" "}
                {i18n.t("thong_tin_goi_dich_vu_Ngay_con_lai")} {leftDate}{" "}
                {i18n.t("thong_tin_goi_dich_vu_Ngay")}.
              </Text>
            </View>
          </View>
          <TouchableOpacity
            style={[styles.button]}
            onPress={() => navigation.navigate("DangKy")}
          >
            <Text style={styles.buttonText}>
              {i18n.t("thong_tin_goi_dich_vu_Gia_han")}
            </Text>
          </TouchableOpacity>
        </View>
        {/* <TouchableOpacity
          onPress={() => navigation.navigate("LichSuCapChungThu")}
          style={[styles.dFlex, styles.functionItem]}
        >
          <View style={styles.dFlex}>
            <Image
              source={require("../../img/ClockCounterClockwise.png")}
              style={styles.leftIcon}
            />
            <Text>{i18n.t("thong_tin_goi_dich_vu_Lich_su_cap_chung_thu")}</Text>
          </View>
          <Image
            source={require("../../img/CaretRight.png")}
            style={styles.rightIcon}
          />
        </TouchableOpacity> */}
      </ScrollView>
      <Toast />
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  dFlex: {
    flexDirection: "row",
  },
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "bold",
  },
  labelText: {
    width: "30%",
    marginRight: 20,
    fontSize: 14,
    color: "#6B7280",
  },
  valueText: {
    fontSize: 14,
    fontWeight: "bold",
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
  functionItem: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
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
  rightText: {
    flex: 1,
  },
});
