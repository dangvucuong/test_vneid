import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";
export default function ThongTinCTS({ navigation, route }) {
  const { i18n } = useI18n();
  const [reloadCount, setReloadCount] = useState(0);
  // Hàm xử lý khi nhấn nút Reload
  const handleReload = () => {
    // Cập nhật state để force re-render
    setReloadCount(prev => prev + 1);
    console.log("Đang reload lại dữ liệu...");
  };
  useEffect(() => {
    const getData = async () => {
      try {
        const value = await AsyncStorage.getItem("@idcts");
        if (value !== null) {
          global.idcts = value;
          NetInfo.fetch().then(async (state) => {
            if (state.isConnected == true) {
              const dev_id = await AsyncStorage.getItem("@devid");
              const url =
                "https://apisign.nacencomm.vn/api/APISigncore/LaythongtinCTS_DeviceID_HSDT?device_id=" +
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
                  global.cn = responseJson.CN;
                  global.diachi = responseJson.Diachi;
                  global.Email = responseJson.Email;
                  global.GoiDK = responseJson.GoiDK;
                  global.HanGCN = responseJson.HanGCN;
                  global.Masothue = responseJson.Masothue;
                  global.NgayBD = responseJson.NgayBD;
                  global.NgayKT = responseJson.NgayKT;
                  global.O_Cert = responseJson.O;
                  global.Serial = responseJson.Serial;
                  global.Sothang = responseJson.Sothang;
                  global.id = responseJson.idcts;
                })
                .catch((error) => {
                  console.error(error);
                });
            } else {
              console.log("No internet");
            }
          });
        } else {
          createAlertCustom("Lỗi: Không xác định được mã đăng ký");
        }
      } catch (e) {
        console.log(e);
      }
    };
    getData();
  }, []);

  const [modalVisible, setModalVisible] = useState(false);
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
        title={i18n.t("thong_tin_chung_thu_so")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <View
          style={[styles.header, { marginTop: 12, alignItems: "flex-start" }]}
        >
          <Text
            style={{
              fontSize: 14,
              fontWeight: "bold",
              color: "#0F172A",
            }}
          >
            {i18n.t("thong_tin_chung_thu_so_Tieu_de")}
          </Text>
        </View>
        <View style={styles.line} />
        {global.Serial !== null && global.Serial !== undefined ? (
          <>
            <View style={{ padding: 16, backgroundColor: "#FFFFFF" }}>
              <View style={{ gap: 16 }}>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_So_serial")}
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard(global.Serial)}
                  >
                    <Text style={styles.valueText} selectable={true}>
                      {global.Serial}
                    </Text>
                  </TouchableOpacity>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Ho_va_ten")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {global.cn}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Email")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {global.Email}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Ma_so_thue")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {global.Masothue}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Dia_chi")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {global.diachi}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Ngay_dang_ky")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {moment(global.NgayBD).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Ngay_het_han_tren_CTS")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {moment(global.NgayKT).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Ngay_het_han_thuc_te")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {moment(global.HanGCN).format("DD/MM/YYYY")}
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Thoi_gian_su_dung")}
                  </Text>
                  <Text style={styles.valueText} selectable={true}>
                    {global.Sothang} tháng
                  </Text>
                </View>
                <View>
                  <Text style={styles.labelText}>
                    {i18n.t("thong_tin_chung_thu_so_Trang_thai")}
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
                    moment(global.NgayKT, "YYYY-MM-DD").isBefore(
                      moment(),
                      "day"
                    )
                      ? i18n.t("ctstext14") // Đã hết hạn
                      : i18n.t("ctstext13")}{" "}
                    {/* Đang hoạt động */}
                  </Text>
                </View>
              </View>
            </View>
            <TouchableOpacity
              style={[styles.dFlex, styles.header, { marginVertical: 12 }]}
              onPress={() => setModalVisible(true)}
            >
              <Image
                source={require("../../img/UnLink.png")}
                style={{ width: 24, height: 24 }}
              />
              <Text style={styles.button}>
                {i18n.t("thong_tin_chung_thu_so_Huy_dang_ky_thiet_bi")}
              </Text>
            </TouchableOpacity>
          </>
        ) : (
          <View style={styles.contentDefault}>
            {/* Icon */}
            <Image
              source={require("../../img/ChuaCoCTS.png")}
              style={styles.iconDefault}
            />

            {/* Message */}
            <Text style={styles.messageDefault}>
              Thông tin chứng thư số sẽ được hiển thị khi quy trình cấp hoàn
              thành.
            </Text>
            <View style={styles.spacer} />
            <TouchableOpacity
              style={styles.reloadButton}
              onPress={handleReload}
            >
              <Text style={styles.reloadButtonText}>Reload</Text>
            </TouchableOpacity>
          </View>
        )}

        <Modal
          animationType="slide"
          transparent={true}
          statusBarTranslucent={true}
          visible={modalVisible}
          onRequestClose={() => {
            setModalVisible(!modalVisible);
          }}
        >
          <View style={styles.container}>
            <View style={styles.modalConfirm}>
              <Text
                style={[
                  styles.modalText,
                  { fontSize: 16, color: "#0F172A", marginBottom: 12 },
                ]}
              >
                {i18n.t("thong_tin_chung_thu_so_Huy_dang_ky_thiet_bi")}
              </Text>
              <Text
                style={[
                  styles.modalText,
                  {
                    fontWeight: undefined,
                    color: "#475569",
                    marginBottom: 32,
                    marginHorizontal: 3,
                  },
                ]}
              >
                Nếu huỷ đăng ký thiết bị, bạn sẽ không thể sử dụng thiết bị này
                để xác thực các yêu cầu. Bạn có chắc chắn muốn tiếp tục?
              </Text>
              <View style={styles.dFlex}>
                <TouchableOpacity
                  style={[
                    styles.modalButton,
                    { backgroundColor: "#DDE3EB", marginRight: 13 },
                  ]}
                  onPress={() => setModalVisible(!modalVisible)}
                >
                  <Text style={[styles.modalText, { color: "#0F172A" }]}>
                    {i18n.t("skipText")}
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.modalButton, { backgroundColor: "#DC2626" }]}
                  onPress={() =>
                    Alert.alert(
                      "CA2 REMOTE SIGNING",
                      "Chức năng sẽ cập nhật sau"
                    )
                  }
                >
                  <Text style={[styles.modalText, { color: "#FFFFFF" }]}>
                    {i18n.t("thong_tin_chung_thu_so_Huy_dang_ky")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
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
    fontSize: 13,
    color: "#6B7280",
    marginBottom: 4,
  },
  valueText: {
    fontSize: 13,
    fontWeight: "bold",
    color: "#0F172A",
  },
  button: {
    marginLeft: 12,
    fontSize: 14,
    fontWeight: "bold",
    color: "#DC2626",
  },
  modalView: {
    margin: 20,
    backgroundColorColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(107, 114, 128, 0.45)",
  },
  line: {
    borderWidth: 1,
    borderColor: "#EDF1F5",
  },
  modalConfirm: {
    marginHorizontal: 24,
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
  contentDefault: {
    flex: 1,
    justifyContent: 'center', // Căn giữa theo chiều dọc
    alignItems: 'center',     // Căn giữa theo chiều ngang
  },
  iconDefault: {
    width: 100,
    height: 100,
    marginBottom: 16,
    marginTop: 16
  },
  messageDefault: {
    fontSize: 14,
    color: "#757575",
    textAlign: "center",
  },
  spacer: {
    height: 24, // Khoảng cách giữa text và nút
  },
  reloadButton: {
    backgroundColor: '#2196F3',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    alignItems: 'center',
  },
  reloadButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
});
