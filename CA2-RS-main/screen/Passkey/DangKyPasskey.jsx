import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Alert,
  Image,
} from "react-native";
import { Dropdown } from "react-native-element-dropdown";
import { Ionicons } from "@expo/vector-icons";
import * as WebBrowser from "expo-web-browser";

const DangKyPasskey = ({ navigation }) => {
  console.log("navigation", navigation);

  const [selectedPage, setSelectedPage] = useState(null);
  const [pageList, setPageList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    function convertData(apiData) {
      return apiData.map((item) => {
        // Xác định value tùy theo registration_type
        let value = "";
        if (item.registration_type === 1) {
          value = `https://${item.domain_name}/dang-ky-passkey?email=${global.Email}&mabutky=${global.idcts}`;
        } else if (item.registration_type === 2) {
          value = `https://${item.domain_name}/dang-ky-passkey?email=${global.Masothue}&mabutky=${global.idcts}`;
        }

        // Trả về object mới theo cấu trúc yêu cầu
        return {
          value: value,
          label: item.domain_name,
          image: {
            uri:
              item.icon_url ||
              "https://www.vigcenter.com/public/all/images/default-image.jpg", // Nếu không có icon_url thì sử dụng URL mặc định
          },
        };
      });
    }
    const fetchPageList = async () => {
      // const formattedPageList = [
      //   {
      //     label: "ca2.nacencom.vn",
      //     value:
      //       `https://ca2sp.nacencomm.vn/dang-ky-passkey?email=${global.Email}&mabutky=${global.idcts}`,
      //   },
      // ];
      const response = await fetch(`https://ca2rs.nacencomm.vn/domains`); // Replace with your actual API endpoint

      if (!response.ok) {
        throw new Error(`Lỗi không lấy được dữ liệu!`);
      }

      const json = await response.json();
      const formattedPageList = convertData(json);
      console.log(formattedPageList);
      setPageList(formattedPageList);
      setLoading(false);
    };

    fetchPageList();
  }, []);

  const handleOpenBrowser = async () => {
    if (!selectedPage) {
      Alert.alert("Thông báo", "Vui lòng chọn trang muốn đăng ký.");
      return;
    }
    const result = await WebBrowser.openBrowserAsync(selectedPage);
    console.log("Web browser result:", result);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => 
            navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Đăng ký passkey</Text>
      </View>

      {/* Nội dung chính */}
      <View style={styles.content}>
        <Dropdown
          style={styles.dropdown}
          data={pageList}
          labelField="label"
          valueField="value"
          placeholder="Chọn trang muốn đăng ký"
          value={selectedPage}
          onChange={(item) => setSelectedPage(item.value)}
          renderItem={(item) => (
            <View style={styles.dropdownItem}>
              <Image source={{ uri: item.image.uri }} style={styles.image} />
              <Text style={styles.label}>{item.label}</Text>
            </View>
          )}
        />
        <TouchableOpacity
          style={[
            styles.registerButton,
            { opacity: selectedPage ? 1 : 0.5 }, // Giảm độ mờ khi không chọn page
          ]}
          onPress={selectedPage ? handleOpenBrowser : null} // Không làm gì nếu chưa chọn trang
          disabled={!selectedPage} // Vô hiệu hóa nút khi chưa chọn
        >
          <Text style={styles.registerButtonText}>Đăng ký</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "white" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  backButton: { marginRight: 10 },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center",
  },
  content: { flex: 1, padding: 16 },
  dropdown: {
    height: 50,
    borderColor: "gray",
    borderWidth: 0.5,
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  registerButton: {
    backgroundColor: "#007BFF",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
  },
  registerButtonText: {
    color: "white",
    fontSize: 16,
    textAlign: "center",
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
  },
  image: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  label: {
    fontSize: 16,
  }
});

export default DangKyPasskey;
