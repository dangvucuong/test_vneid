import React, { useState, useEffect } from "react";
import {
  Image,
  Modal,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Linking,
} from "react-native";
import { ScrollView } from "react-native-gesture-handler";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import * as WebBrowser from "expo-web-browser";
import moment from "moment";
export default function QuanLyDangNhap({ navigation, route }) {
  const { i18n } = useI18n();
  const [openModal, setOpenModal] = useState(false);
  const [selectedItem, setSelectedItem] = useState(null); // Lưu domain hiện tại
  const [danhSachTrangDangKy, setDanhSachTrangDangKy] = useState([]);
  const [reload, setReload] = useState(false); // State để trigger lại fetchPageList
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPageList();
  }, [reload]);
  // Lắng nghe sự kiện khi màn hình này được focus (được quay lại từ màn hình khác)
  useEffect(() => {
    const focusListener = navigation.addListener("focus", () => {
      fetchPageList(); // Khi quay lại màn hình này, gọi lại reloadData
    });

    // Cleanup listener khi màn hình này bị unmount
    return () => {
      focusListener();
    };
  }, [navigation]);
  const fetchPageList = async () => {
    try {
      const response = await fetch(
        `https://api.nacecomm.online/user/list-user-from-mbk?mabutky=${global.idcts}`
      ); // Replace with your actual API endpoint

      if (!response.ok) {
        throw new Error(`Lỗi không lấy được dữ liệu!`);
      }

      const json = await response.json();

      const data = json.data; // Assuming "data" is the top-level key in the response

      // Flatten data to include user information with each domain
      const flattenedData = data.flatMap((item) => ({
        id: item.id,
        username: item.username,
        mabutky: item.mabutky,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD HH:mm"), // Đổi định dạng createdAt
        updatedAt: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"), // Đổi định dạng updatedAt
        domain_id: item.domains[0]?.id,
        domain_name: item.domains[0]?.domain_name,
        domain_description: item.domains[0]?.description,
        domain_private_key: item.domains[0]?.private_key,
        domain_url: item.domains[0]?.icon_url,
        domain_createdAt: moment(item.domains[0]?.createdAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        domain_updatedAt: moment(item.domains[0]?.updatedAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        log_id: item.logs.id,
        log_type: item.logs.type,
        log_ip_address: item.logs.ip_address,
        log_is_success: item.logs.is_success,
        log_latitude: item.logs.latitude,
        log_longitude: item.logs.longitude,
        log_createdAt: moment(item.logs.createdAt).format("YYYY-MM-DD HH:mm"),
        log_updatedAt: moment(item.logs.updatedAt).format("YYYY-MM-DD HH:mm"),
      }));
      console.log("flattenedData", flattenedData);
      setDanhSachTrangDangKy(flattenedData);
    } catch (error) {
      setError(error);
      console.error("Quản lý đăng nhập Lỗi khi gọi API:", error);
    } finally {
      //setLoading(false);
    }
  };
  const openBrowser = async (url) => {
    try {
      const result = await WebBrowser.openBrowserAsync(url);
      if (result.type == WebBrowser.WebBrowserResultType.CANCEL) {
        setReload((prevState) => !prevState);
      }
      console.log("WebBrowser result:", result);
    } catch (error) {
      console.error("Lỗi khi mở trình duyệt:", error);
    }
  };
  const handleOpenBrowserToDelete = async (domain_name) => {
    const urlDelete = `https://${domain_name}/xoa-passkey?email=${global.Email}&mabutky=${global.idcts}`;
    console.log(urlDelete);
    const result = await WebBrowser.openBrowserAsync(urlDelete);
    if (result.type == WebBrowser.WebBrowserResultType.CANCEL) {
      setReload((prevState) => !prevState);
    }
    console.log("Web browser result:", result);
  };
  return (
    <PageContainer>
      <Modal transparent={true} visible={openModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setOpenModal(false)}
          >
            <Image
              source={require("../../img/X.png")}
              style={{ width: 24, height: 24 }}
            />
          </TouchableOpacity>
          <View
            style={{ width: "100%", height: 264, backgroundColor: "#ffffff" }}
          >
            <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
              <Text
                style={{ lineHeight: 18, color: "#0F172A", fontSize: 13 }}
                numberOfLines={1}
              >
                {global.Email}
              </Text>
              <Text style={{ lineHeight: 16, color: "#6B7280", fontSize: 12 }}>
                {" "}
                {selectedItem
                  ? selectedItem.domain_name
                  : "Không có thông tin"}{" "}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                if (selectedItem)
                  openBrowser(`https://${selectedItem.domain_name}`);
              }}
            >
              <View style={styles.modalActionIcon}>
                <Image
                  source={require("../../img/LinkSimple.png")}
                  style={{ width: 24, height: 24 }}
                />
              </View>
              <Text style={styles.modalActionText}>
                {i18n.t("session.link")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => {
                if (selectedItem) console.log(selectedItem);
                handleOpenBrowserToDelete(selectedItem.domain_name);
              }}
            >
              <View
                style={[styles.modalActionIcon, { backgroundColor: "#FFF2E8" }]}
              >
                <Image
                  source={require("../../img/LinkBreak.png")}
                  style={{ width: 24, height: 24 }}
                />
              </View>
              <Text style={styles.modalActionText}>
                {i18n.t("session.link_break")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("session.title")}
        // customAction={i18n.t("session.add")}
        // onCustomAction={() => navigation.navigate("DangKyPasskey")}
      />
      <ScrollView
        style={{
          flex: 1,
          width: "100%",
          backgroundColor: "#ffffff",
          marginTop: 8,
        }}
      >
        {danhSachTrangDangKy.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              Chưa thêm đăng nhập trang web nào
            </Text>
          </View>
        ) : (
          danhSachTrangDangKy.map((item, index) => (
            <View style={styles.itemContainer} key={index}>
              <View style={styles.itemIconContainer}>
                <Image
                  style={styles.itemIconUrl}
                  source={{ uri: item.domain_url }}
                />
              </View>
              <View style={{ flex: 1, gap: 2 }}>
                <Text style={styles.itemDateLabel}>{item.domain_name}</Text>
                <Text style={styles.itemLabel}>{item.username}</Text>
                <Text style={styles.itemDateLabel}>
                  {i18n.t("session.last_login", {
                    time:
                      item.log_type == "AUTHENTICATION"
                        ? item.log_createdAt
                        : i18n.t("session.have_not_logger_in_yet"),
                  })}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.itemIcon}
                onPress={() => {
                  setSelectedItem(item); // Gán domain_name vào state
                  setOpenModal(true); // Mở modal
                }}
              >
                <Image
                  style={styles.itemIcon}
                  source={require("../../img/DotsThree.png")}
                />
              </TouchableOpacity>
            </View>
          ))
        )}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
  },
  modalClose: {
    position: "absolute",
    right: 0,
    bottom: 274,
    width: 48,
    height: 48,
    backgroundColor: "#ffffff",
    borderRadius: 24,
    alignItems: "center",
    justifyContent: "center",
  },
  modalAction: {
    flexDirection: "row",
    gap: 12,
    padding: 16,
    alignItems: "center",
  },
  modalActionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#E6F2FE",
    alignItems: "center",
    justifyContent: "center",
  },
  modalActionText: {
    flex: 1,
    lineHeight: 20,
    fontSize: 14,
    fontWeight: "500",
  },
  title: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1E293B",
    fontWeight: "600",
  },
  itemContainer: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    borderBottomColor: "#EDF1F5",
    borderBottomWidth: 1,
    width: "100%",
  },
  itemIcon: {
    width: 24,
    height: 24,
  },
  itemIconContainer: {
    justifyContent: "center", // Căn giữa theo chiều dọc
    alignItems: "center", // Căn giữa theo chiều ngang
  },
  itemIconUrl: {
    width: 24, // Kích thước ảnh
    height: 24,
    resizeMode: "contain", // Điều chỉnh kích thước ảnh phù hợp
  },
  itemLabel: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: "500",
    color: "#0F172A",
  },
  itemDateLabel: {
    fontSize: 12,
    lineHeight: 16,
    color: "#6B7280",
    flexDirection: "row",
    gap: 4,
  },
  emptyContainer: {
    alignItems: "center", // Căn giữa theo chiều ngang
  },
});
