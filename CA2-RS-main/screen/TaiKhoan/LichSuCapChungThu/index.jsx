import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { en, vi } from "../../../localize";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { I18n } from "i18n-js";
import PageContainer from "../../component/PageContainer";
import PageHeader from "../../component/PageHeader";

// Dummy data
const fakeData = [
  {
    idcts: 123987,
    GoiDK: "1 năm - Y01",
    thanhToan: "Đã thanh toán",
    trangThaiHoSo: "Chờ bản gốc\n" + "Cần cập nhật trước 24/7/2024",
  },
  {
    idcts: 123987,
    GoiDK: "1 năm - Y01",
    thanhToan: "Đã thanh toán",
    trangThaiHoSo: "Đã hoàn thiện",
  },
  {
    idcts: 123987,
    GoiDK: "1 năm - Y01",
    thanhToan: "Đã thanh toán",
    trangThaiHoSo: "Đã hoàn thiện",
  },
  {
    idcts: 123987,
    GoiDK: "1 năm - Y01",
    thanhToan: "Đã thanh toán",
    trangThaiHoSo: "Đã hoàn thiện",
  },
];

const i18n = new I18n();
const LichSuCapChungThu = ({ navigation }) => {
  const [locale, setLocale] = useState("vi");
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

  const RenderItem = ({ data }) => {
    return (
      <View style={{ backgroundColor: "#FFFFFF", padding: 16 }}>
        <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
          <View style={styles.dFlex}>
            <Image
              source={require("../../../img/IdentificationCard.png")}
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
          <TouchableOpacity
            style={styles.dFlex}
            onPress={() => navigation.navigate("HoSo")}
          >
            <Text style={styles.textLink}>
              {i18n.t("thong_tin_goi_dich_vu_Xem_ho_so")}
            </Text>
            <Image
              source={require("../../../img/CaretRightLink.png")}
              style={{ width: 20, height: 20, marginLeft: 4 }}
            />
          </TouchableOpacity>
        </View>
        <View style={{ marginVertical: 20, gap: 12 }}>
          <View style={styles.dFlex}>
            <Text style={styles.labelText}>
              {i18n.t("thong_tin_goi_dich_vu_Chung_thu_so")}
            </Text>
            <Text style={styles.valueText}>
              {i18n.t("thong_tin_goi_dich_vu_Ca_nhan")}
            </Text>
          </View>
          <View style={styles.dFlex}>
            <Text style={styles.labelText}>
              {i18n.t("thong_tin_goi_dich_vu_Dinh_danh_but_ky")}
            </Text>
            <Text style={styles.valueText}>{data.idcts}</Text>
          </View>
          <View style={styles.dFlex}>
            <Text style={styles.labelText}>
              {i18n.t("thong_tin_goi_dich_vu_Goi_dich_vu")}
            </Text>
            <Text style={styles.valueText}>{data.GoiDK}</Text>
          </View>
          <View style={styles.dFlex}>
            <Text style={styles.labelText}>
              {i18n.t("thong_tin_goi_dich_vu_Thanh_toan")}
            </Text>
            <Text style={[styles.valueText, { color: "#21C75E" }]}>
              {data.thanhToan}
            </Text>
          </View>
          <View style={styles.dFlex}>
            <Text style={styles.labelText}>
              {i18n.t("thong_tin_goi_dich_vu_Trang_thai_ho_so")}
            </Text>
            <Text style={[styles.valueText, { color: "#DC2626" }]}>
              {data.trangThaiHoSo}
            </Text>
          </View>
        </View>
      </View>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("thong_tin_goi_dich_vu_Lich_su_cap_chung_thu")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <View style={{ gap: 4, marginVertical: 8 }}>
          {fakeData.map((item, index) => (
            <RenderItem key={index} data={item} />
          ))}
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  dFlex: {
    flexDirection: "row",
    alignItems: "center",
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
  textLink: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1858EA",
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
});

export default LichSuCapChungThu;
