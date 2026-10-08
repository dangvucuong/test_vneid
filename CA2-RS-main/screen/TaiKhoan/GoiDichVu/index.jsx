import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { useEffect, useState } from "react";
import {
  Alert,
  Image,
  ImageBackground,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { formatCurrencyVietnam } from "../../../utils/common";
import { i18n } from "../../../utils/i18n";
import PageContainer from "../../component/PageContainer";
import PageHeader from "../../component/PageHeader";

const GoiDichVu = ({ navigation, route }) => {
  const [locale, setLocale] = useState("vi");
  i18n.locale = locale;
  const [showModal, setShowModal] = useState(false);
  const [modalData, setModalData] = useState({});
  const [goiDichVu, setGoiDichVu] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchGoiDichVu = async () => {
      try {
        const startTime = Date.now(); // Thời gian bắt đầu
        console.log(`API call started at: ${new Date(startTime).toISOString()}`);
  
        const response = await fetch(
          `https://apidkmobilesign.nacencomm.vn/api/data/GetDSGoiDV_RS?keyxt=ntvan021089`
        , {
          method: 'POST'
        }); // Replace with your actual API endpoint
  
        if (!response.ok) {
          throw new Error(`Lỗi không lấy được dữ liệu!`);
        }
        
        const json = await response.json();
        console.log("json", json);
        const endTime = Date.now(); // Thời gian kết thúc
        const duration = endTime - startTime;
        console.log(`API call ended at: ${new Date(endTime).toISOString()}`);
        console.log(`API call duration: ${duration}ms`);
        const ALLOWED_PACKAGE_CODE = "CA2RSCNFREE";
        const filteredData = json.filter(
          (item) =>
            item.LoaiCTS === "Cá nhân" && item.MaGoi === ALLOWED_PACKAGE_CODE
        );
        console.log("filteredData", filteredData);
        const convertData = [
          {
            title: "Gói theo tháng",
            items: filteredData
              .filter((item) => item.Thoigian < 12)
              .map((item) => ({
                packageImage: require("../../../img/PackageImage.png"),
                packageName: "Gói tháng",
                packageCode: item.MaGoi,
                packageDurationLabel: `${item.Thoigian} tháng`,
                packageDurationValue: item.Thoigian,
                packagePrice: item.Thanhtien,
                packageDescription: [item.TenSP],
              })),
          },
          {
            title: "Gói theo năm",
            items: filteredData
              .filter((item) => item.Thoigian >= 12)
              .map((item) => ({
                packageImage: require("../../../img/PackageImage.png"),
                packageName: "Gói năm",
                packageCode: item.MaGoi,
                packageDurationLabel: `${item.Thoigian / 12} năm`,
                packageDurationValue: item.Thoigian,
                packagePrice: item.Thanhtien,
                packageDescription: [item.TenSP],
              })),
          },
        ].filter((group) => group.items.length > 0);

        setGoiDichVu(convertData);
      } catch (error) {
        setError(error);
        console.error("Goi Dich Vu Lỗi khi gọi API:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchGoiDichVu();
  }, []);

  const handleFinish = (modalData) => {
    const { onComplete } = route.params;
    if (onComplete) {
      onComplete({ id: "1" }, { selectedPackage: modalData });
    }
    navigation.goBack();
  };
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
      <View
        style={{
          backgroundColor: "#FFFFFF",
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        <Text style={styles.groupName}>{data.title}</Text>
        <ScrollView
          horizontal={data.items.length > 1}
          showsHorizontalScrollIndicator={false}
        >
          {data.items.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.item,
                { marginRight: index !== data.items.length - 1 ? 10 : 0 },
              ]}
              onPress={() => {
                setModalData(item);
                setShowModal(true);
              }}
            >
              <View style={styles.dFlex}>
                <ImageBackground
                  source={item.packageImage}
                  style={styles.imageBackground}
                  imageStyle={{ borderRadius: 4 }}
                >
                  <Text
                    style={{
                      color: "#1959DC",
                      fontWeight: "bold",
                      fontSize: 12,
                    }}
                  >
                    {item.packageCode}
                  </Text>
                </ImageBackground>
                <View style={{ marginLeft: 12 }}>
                  <Text style={{ fontSize: 12, color: "#0F172A" }}>
                    {item.packageName}
                  </Text>
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                    }}
                  >
                    {item.packageDurationLabel}
                  </Text>
                </View>
              </View>
              <Text
                style={{
                  marginVertical: 6,
                  fontSize: data.items.length > 1 ? 20 : 24,
                  fontWeight: "700",
                }}
              >
                {`${formatCurrencyVietnam(item.packagePrice)}`}
              </Text>
              {item.packageDescription.map((item, index) => (
                <View key={index} style={styles.dFlex}>
                  <Image
                    source={require("../../../img/CheckGreen.png")}
                    width={16}
                    height={16}
                  />
                  <Text style={{ marginLeft: 4 }}>{item}</Text>
                </View>
              ))}
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("thong_tin_goi_dich_vu_Goi_dich_vu")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        {loading && (
          <Text>Loading gói dịch vụ......</Text>
        )}
        {!loading  && (
          <View style={{ gap: 8, marginTop: 8 }}>
            {goiDichVu.map((item, index) => (
              <RenderItem key={index} data={item} />
            ))}
          </View>
        )}
        <Modal
          transparent={true}
          statusBarTranslucent={true}
          visible={showModal}
          animationType="slide"
          onRequestClose={() => setShowModal(false)} // Android back button close
        >
          <TouchableWithoutFeedback>
            <View style={styles.overlay}>
              <View style={styles.actionSheet}>
                <View style={styles.modalHeader}>
                  <TouchableOpacity onPress={() => setShowModal(false)}>
                    <Image
                      source={require("../../../img/X.png")}
                      width={24}
                      height={24}
                    />
                  </TouchableOpacity>
                  <Text
                    style={styles.headerText}
                  >{`Gói ${modalData.packageCode}`}</Text>
                  <TouchableOpacity
                    onPress={() =>
                      Alert.alert(
                        "CA2 REMOTE SIGNING",
                        "Chức năng sẽ cập nhật sau"
                      )
                    }
                  >
                    <Image
                      source={require("../../../img/Info.png")}
                      width={24}
                      height={24}
                    />
                  </TouchableOpacity>
                </View>
                <ImageBackground
                  source={modalData.packageImage}
                  style={[
                    styles.imageBackground,
                    {
                      width: 120,
                      height: 120,
                    },
                  ]}
                  imageStyle={{ borderRadius: 4 }}
                >
                  <Text style={{ fontSize: 24, fontWeight: "700" }}>
                    {modalData.packageCode}
                  </Text>
                </ImageBackground>
                <View
                  style={{
                    marginHorizontal: 28,
                    marginTop: 32,
                    gap: 8,
                  }}
                >
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text>Tên sản phẩm</Text>
                    <Text style={{ fontWeight: "600" }}>
                      {modalData.packageCode}
                    </Text>
                  </View>
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text>Gói cước</Text>
                    <Text style={{ fontWeight: "600" }}>
                      {modalData.packageDurationLabel}
                    </Text>
                  </View>
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text>Giá cước</Text>
                    <Text style={{ fontWeight: "600" }}>
                      {formatCurrencyVietnam(
                        modalData.packagePrice * modalData.packageDurationValue
                      )}
                    </Text>
                  </View>
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text>Lượt ký</Text>
                    <Text style={{ fontWeight: "600" }}>
                      {modalData.packageCode}
                    </Text>
                  </View>
                  <View
                    style={[styles.dFlex, { justifyContent: "space-between" }]}
                  >
                    <Text>Thuế VAT</Text>
                    <Text style={{ fontWeight: "600" }}>
                      {formatCurrencyVietnam(
                        modalData.packagePrice *
                          modalData.packageDurationValue *
                          0.1
                      )}
                    </Text>
                  </View>
                  <View style={styles.line} />
                  <View
                    style={[
                      styles.dFlex,
                      {
                        alignItems: "flex-start",
                        justifyContent: "space-between",
                      },
                    ]}
                  >
                    <Text>Tổng tiền thanh toán</Text>
                    <Text style={{ fontSize: 24, fontWeight: "600" }}>
                      {formatCurrencyVietnam(
                        modalData.packagePrice *
                          modalData.packageDurationValue *
                          1.1
                      )}
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.button}
                  onPress={() => {
                    setShowModal(false);
                    const selectedPackage = modalData; // Lấy giá trị modalData
                    handleFinish(selectedPackage); // Gọi hàm handleFinish trực tiếp
                  }}
                >
                  <Text style={styles.buttonText}>Đăng ký gói</Text>
                </TouchableOpacity>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </Modal>
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
  imageBackground: {
    width: 36,
    height: 36,
    overflow: "hidden",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
  },
  groupName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#000000",
  },
  item: {
    marginTop: 8,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#EDF1F5",
    backgroundColor: "#F7F8F9",
    minWidth: 240,
  },
  overlay: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(107, 114, 128, 0.45)",
  },
  actionSheet: {
    backgroundColor: "#FFFFFF",
    borderTopLeftRadius: 13,
    borderTopRightRadius: 13,
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
  line: {
    borderWidth: 1,
    borderColor: "#DDE3EB",
    marginTop: 44,
    marginBottom: 20,
  },
  button: {
    marginTop: 60,
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
});

export default GoiDichVu;
