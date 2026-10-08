import React from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../../../utils/i18n";
import PageContainer from "../../component/PageContainer";
import PageHeader from "../../component/PageHeader";

const fakeData = [
  {
    fileId: 1,
    fileName: "ĐĂNG KÝ SỬ DỤNG DỊCH VỤ CHỮ KÝ SỐ VÀ CHỨNG THỰC CHỮ....pdf",
    status: "Đang thẩm định",
  },
  {
    fileId: 2,
    fileName: "ĐĂNG KÝ SỬ DỤNG DỊCH VỤ CHỮ KÝ SỐ VÀ CHỨNG THỰC CHỮ....pdf",
    status: "Hoàn tất",
  },
  {
    fileId: 3,
    fileName: "ĐĂNG KÝ SỬ DỤNG DỊCH VỤ CHỮ KÝ SỐ VÀ CHỨNG THỰC CHỮ....pdf",
    status: "Đang thẩm định",
  },
];

const HoSo = ({ navigation }) => {
  const { i18n } = useI18n();

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("thong_tin_goi_dich_vu_Ho_so")}
      />
      <ScrollView
        style={{ backgroundColor: "#F7F8F9", flex: 1, width: "100%" }}
      >
        <View style={styles.container}>
          {fakeData.map((item, index) => (
            <View key={index} style={styles.itemContainer}>
              <View style={styles.filePreview}>
                <Text style={styles.fileStatus}>{item.status}</Text>
              </View>
              <Text style={styles.fileName}>{item.fileName}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    padding: 15,
  },
  itemContainer: {
    width: "48%", // Ensures two items per row, with some spacing
    marginBottom: 15,
    padding: 8,
    borderRadius: 4,
    backgroundColor: "#FFFFFF",
  },
  filePreview: {
    borderWidth: 1,
    borderColor: "#DDE3EB",
    borderRadius: 4,
    height: 209,
    marginBottom: 8,
  },
  fileStatus: {
    position: "absolute",
    bottom: 0,
    left: 0,
    paddingVertical: 4,
    paddingHorizontal: 6,
    backgroundColor: "#D0DDFA",
    borderRadius: 5,
    color: "#2F68EC",
    fontSize: 12,
    fontWeight: "bold",
  },
  fileName: {
    fontSize: 13,
  },
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
});

export default HoSo;
