import React, { useEffect, useRef, useState } from "react";
import {
  Alert,
  Animated,
  Easing,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import Toast from "react-native-toast-message";

import { i18n } from "../../../utils/i18n";
import { formatCurrencyVietnam } from "../../../utils/common";
import MaGiamGia from "./MaGiamGia";
import PhuongThucThanhToan from "./PhuongThucThanhToan";
import PageContainer from "../../component/PageContainer";
import PageHeader from "../../component/PageHeader";
import { hitSlopSmall } from "../../../utils/constant";

const ThanhToan = ({ navigation, route }) => {
  const data = route?.params?.data || {};
  const [showCoupon, setShowCoupon] = useState(false);
  const [couponValue, setCouponValue] = useState({ value: 0 });
  const [showPaymentSelect, setShowPaymentSelect] = useState(false);
  const [paymentType, setPaymentType] = useState("Chuyển khoản");
  const [showOrderSuccess, setShowOrderSuccess] = useState(false);
  const [expanded, setExpanded] = useState(true); // State to control expansion
  const animatedHeight = useRef(new Animated.Value(0)).current; // Animated height

  useEffect(() => {
    toggleExpansion();
  }, [expanded]);

  const toggleExpansion = () => {
    const finalHeight = expanded ? 196 : 0; // Change height based on state

    // Animate height change
    Animated.timing(animatedHeight, {
      toValue: finalHeight,
      duration: 300,
      easing: Easing.inOut(Easing.ease),
      useNativeDriver: false,
    }).start();
  };

  const applyCoupon = (name, value) => {
    setCouponValue({ name, value: value || 0 });
    setShowCoupon(false);
  };

  const applyPayment = (value) => {
    setPaymentType(value);
    setShowPaymentSelect(false);
  };

  const copyToClipboard = async (value) => {
    await Clipboard.setStringAsync(value);
    Toast.show({
      type: "success",
      text1: "Đã sao chép vào bộ nhớ tạm",
      text1Style: {
        fontSize: 16,
        fontWeight: "normal",
      },
    });
  };

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("thong_tin_goi_dich_vu_Thanh_toan")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <View style={styles.line} />
        <View style={[styles.dFlex, styles.header]}>
          <ImageBackground
            source={require("../../../img/PackageImage.png")}
            style={styles.imageBackground}
            imageStyle={{ borderRadius: 4 }}
          >
            <Text style={{ fontWeight: "700" }}>{data.packageCode}</Text>
          </ImageBackground>
          <View>
            <Text style={{ fontSize: 14 }}>
              Gói dịch vụ Remote Signing - {data.packageCode}
            </Text>
            <Text style={{ fontWeight: "700" }}>
              {formatCurrencyVietnam(
                data.packagePrice * data.packageDurationValue * 1.1
              )}
            </Text>
          </View>
        </View>
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={{
            marginTop: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={[
              styles.dFlex,
              {
                padding: 16,
                justifyContent: "space-between",
              },
            ]}
          >
            <View style={styles.dFlex}>
              <Image
                source={require("../../../img/Notepad.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={{ fontWeight: "600", marginLeft: 4 }}>
                Chi tiết đơn hàng #RM123987
              </Text>
            </View>

            <Image
              source={
                expanded
                  ? require("../../../img/CaretDown.png")
                  : require("../../../img/CaretRight.png")
              }
              style={{ width: 20, height: 20 }}
            />
          </View>
          <Animated.View style={{ height: animatedHeight, overflow: "hidden" }}>
            <View style={styles.line} />
            <View style={{ padding: 16, gap: 16 }}>
              <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
                <Text style={{ color: "#334155" }}>Mã đơn hàng</Text>
                <Text style={{ color: "#0F172A" }}>#RM123987</Text>
              </View>
              <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
                <Text style={{ color: "#334155" }}>Đơn giá</Text>
                <Text style={{ color: "#0F172A" }}>
                  {formatCurrencyVietnam(
                    data.packagePrice * data.packageDurationValue
                  )}
                </Text>
              </View>
              <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
                <Text style={{ color: "#334155" }}>VAT (10%)</Text>
                <Text style={{ color: "#0F172A" }}>
                  {formatCurrencyVietnam(
                    data.packagePrice * data.packageDurationValue * 0.1
                  )}
                </Text>
              </View>
              <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
                <Text style={{ color: "#334155" }}>Thời hạn</Text>
                <Text style={{ color: "#0F172A" }}>
                  {data.packageDurationLabel}
                </Text>
              </View>
              <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
                <Text style={{ color: "#334155" }}>Mã nhân viên</Text>
                <View style={styles.dFlex}>
                  <Text style={{ color: "#0F172A", marginRight: 4 }}>
                    #LONG123
                  </Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "CA2 REMOTE SIGNING",
                        "Chức năng sẽ cập nhật sau"
                      )
                    }
                  >
                    <Image
                      source={require("../../../img/NotePencil.png")}
                      style={{ width: 16, height: 16 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Animated.View>
        </TouchableOpacity>
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View style={[styles.dFlex, { padding: 16 }]}>
            <View style={styles.dFlex}>
              <Image
                source={require("../../../img/Wallet.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={{ fontWeight: "600", marginLeft: 4 }}>
                Phương thức thanh toán
              </Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={{ padding: 16, gap: 16 }}>
            <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
              <Text style={{ color: "#334155" }}>Mã giảm giá</Text>
              <TouchableOpacity onPress={() => setShowCoupon(true)}>
                {couponValue.name ? (
                  <View style={[styles.dFlex, { gap: 4 }]}>
                    <Image
                      source={require("../../../img/Voucher.png")}
                      style={{ width: 16, height: 16 }}
                    />
                    <Text style={{ color: "#0F172A" }}>{couponValue.name}</Text>
                    <Image
                      source={require("../../../img/CaretRight.png")}
                      style={{ width: 16, height: 16 }}
                    />
                  </View>
                ) : (
                  <Text style={{ fontWeight: "600", color: "#1959DC" }}>
                    Thêm mã
                  </Text>
                )}
              </TouchableOpacity>
            </View>
            <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
              <Text style={{ color: "#334155" }}>Phương thức thanh toán</Text>
              <TouchableOpacity
                onPress={() => setShowPaymentSelect(true)}
                style={styles.dFlex}
              >
                <Text style={{ marginRight: 4, color: "#0F172A" }}>
                  {paymentType}
                </Text>
                <Image
                  source={require("../../../img/CaretRight.png")}
                  style={{ width: 16, height: 16 }}
                />
              </TouchableOpacity>
            </View>
            <View
              style={{
                backgroundColor: "#F7F9FB",
                borderRadius: 8,
                padding: 8,
                gap: 8,
              }}
            >
              <View style={styles.dFlex}>
                <Image
                  source={require("../../../img/Info.png")}
                  style={{ width: 16, height: 16 }}
                />
                <Text
                  style={{ marginLeft: 4, fontSize: 13, fontWeight: "600" }}
                >
                  Thông tin tài khoản
                </Text>
              </View>
              <View style={[styles.dFlex, { alignItems: "flex-start" }]}>
                <Text style={{ width: "30%", fontSize: 13 }}>Ngân hàng:</Text>
                <Text style={{ width: "70%", fontSize: 13, fontWeight: "600" }}>
                  Tiên Phong Bank (TPBank) -
                  <Text style={{ fontWeight: "400" }}> Chi chánh Hà Thành</Text>
                </Text>
              </View>
              <View style={[styles.dFlex, { alignItems: "flex-start" }]}>
                <Text style={{ width: "30%", fontSize: 13 }}>
                  Số tài khoản:
                </Text>
                <View
                  style={[
                    styles.dFlex,
                    { width: "70%", justifyContent: "space-between" },
                  ]}
                >
                  <Text style={{ fontSize: 13, fontWeight: "600" }}>
                    1111111111
                  </Text>
                  <TouchableOpacity
                    onPress={() => copyToClipboard("1111111111")}
                  >
                    <Image
                      source={require("../../../img/CopySimple.png")}
                      style={{ width: 16, height: 16 }}
                    />
                  </TouchableOpacity>
                </View>
              </View>
              <View style={[styles.dFlex, { alignItems: "flex-start" }]}>
                <Text style={{ width: "30%", fontSize: 13 }}>
                  Chủ tài khoản:
                </Text>
                <Text style={{ fontSize: 13 }}>
                  CTCP Công nghệ thẻ Nacencomm
                </Text>
              </View>
              <View style={[styles.dFlex, { alignItems: "flex-start" }]}>
                <Text style={{ width: "30%", fontSize: 13 }}>Nội dung:</Text>
                <View style={{ width: "70%" }}>
                  <Text
                    style={{
                      fontSize: 13,
                      color: "#334155",
                      marginBottom: 8,
                    }}
                  >
                    ID đơn hàng - Mã số thuế người mua
                  </Text>
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text style={{ fontSize: 13, color: "#6B7280" }}>
                      (Ví dụ: #RM123987 - 000000000)
                    </Text>
                    <TouchableOpacity
                      onPress={() => copyToClipboard("#RM123987 - 000000000")}
                    >
                      <Image
                        source={require("../../../img/CopySimple.png")}
                        style={{ width: 16, height: 16 }}
                      />
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View style={[styles.dFlex, { padding: 16 }]}>
            <View style={styles.dFlex}>
              <Image
                source={require("../../../img/Money.png")}
                style={{ width: 20, height: 20 }}
              />
              <Text style={{ fontWeight: "600", marginLeft: 4 }}>
                Tổng thanh toán
              </Text>
            </View>
          </View>
          <View style={styles.line} />
          <View style={{ padding: 16, gap: 16 }}>
            <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
              <Text style={{ color: "#334155" }}>Tổng tiền hàng</Text>
              <Text style={{ color: "#0F172A" }}>
                {formatCurrencyVietnam(
                  data.packagePrice * data.packageDurationValue * 1.1
                )}
              </Text>
            </View>
            <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
              <Text style={{ color: "#334155" }}>Mã giảm giá</Text>
              <Text
                style={{ color: couponValue.value ? "#FF821E" : "#0F172A" }}
              >
                -
                {couponValue.value
                  ? formatCurrencyVietnam(couponValue.value)
                  : 0}
              </Text>
            </View>
            <View style={[styles.dFlex, { justifyContent: "space-between" }]}>
              <Text
                style={{ color: "#0F172A", fontWeight: "600", fontSize: 16 }}
              >
                Tổng tiền
              </Text>
              <Text
                style={{ color: "#0F172A", fontWeight: "600", fontSize: 16 }}
              >
                {formatCurrencyVietnam(
                  data.packagePrice * data.packageDurationValue * 1.1 -
                    couponValue.value
                )}
              </Text>
            </View>
          </View>
        </View>
        <View
          style={{
            marginTop: 10,
            backgroundColor: "#FFFFFF",
          }}
        >
          <View
            style={[styles.dFlex, { padding: 16, alignItems: "flex-start" }]}
          >
            <Image
              source={require("../../../img/Info.png")}
              style={{ width: 16, height: 16 }}
            />
            <Text style={{ marginLeft: 4, fontSize: 12, color: "#6b7280" }}>
              Nhấn “Đặt hàng” đồng nghĩa với việc bạn đồng ý với các
              <Text style={{ color: "#5D89EFFF" }}>
                {" "}
                Điều khoản dịch vụ
              </Text>{" "}
              của Nacencomm
            </Text>
          </View>
          <TouchableOpacity
            style={styles.button}
            onPress={() => setShowOrderSuccess(true)}
          >
            <Text style={styles.buttonText}>Xác nhận đặt hàng</Text>
          </TouchableOpacity>
        </View>
        <MaGiamGia
          visible={showCoupon}
          onCancel={() => setShowCoupon(false)}
          onSubmit={applyCoupon}
        />
        <PhuongThucThanhToan
          visible={showPaymentSelect}
          onCancel={() => setShowPaymentSelect(false)}
          onSubmit={applyPayment}
        />
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={showOrderSuccess}
          animationType="slide"
          onRequestClose={() => setShowOrderSuccess(false)} // Android back button close
        >
          <View style={styles.overlay}>
            <View style={styles.actionSheet}>
              <TouchableOpacity onPress={() => setShowOrderSuccess(false)}>
                <Image
                  source={require("../../../img/X.png")}
                  width={24}
                  height={24}
                />
              </TouchableOpacity>
              <Image
                source={require("../../../img/OrderSuccess.png")}
                style={{ width: 160, height: 160, alignSelf: "center" }}
              />
              <Text
                style={{
                  fontSize: 16,
                  fontWeight: "700",
                  alignSelf: "center",
                  marginBottom: 4,
                  color: "#0F172A",
                }}
              >
                Đặt hàng thành công
              </Text>
              <Text
                style={{
                  fontSize: 13,
                  fontWeight: "600",
                  alignSelf: "center",
                  textAlign: "center",
                  marginBottom: 36,
                  color: "#6B7280",
                }}
              >
                Vui lòng thanh toán để có thể mua hàng thành công và sử dụng gói
                dịch vụ
              </Text>
              <TouchableOpacity
                onPress={() => setShowOrderSuccess(false)}
                style={styles.button}
              >
                <Text style={styles.buttonText}>Đã hiểu</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </ScrollView>
      <Toast />
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
  line: {
    borderWidth: 1,
    borderColor: "#EDF1F5",
  },
  imageBackground: {
    marginRight: 16,
    width: 42,
    height: 42,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  button: {
    marginBottom: 40,
    marginHorizontal: 16,
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
    marginBottom: 16,
  },
  headerText: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#0F172A",
  },
  overlay: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  actionSheet: {
    padding: 12,
    marginHorizontal: 40,
    backgroundColor: "#FFFFFF",
    borderRadius: 6,
  },
});

export default ThanhToan;
