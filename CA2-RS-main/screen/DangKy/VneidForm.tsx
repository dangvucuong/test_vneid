import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  SafeAreaView,
  TextInput,
  Linking,
  ActivityIndicator,
} from "react-native";
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Đa ngôn ngữ context

const VneidForm: React.FC = ({ navigation, route }: any) => {
  const { i18n } = useLanguage(); // Lấy ngôn ngữ từ context
  const { onComplete } = route.params;
  const [loading, setLoading] = useState(false);
  useEffect(() => {
      const handleDeepLink = async ({ url }) => {
        if (!url) {
          console.log("No URL received");
          return;
        }
  
        try {
          const urlObj = new URL(url);
          // Kiểm tra nếu URL là /callback
          if (urlObj.pathname.startsWith("/callback/vneid")) {
            // Lấy phần sau "/callback/vneid/"
            const value = url.split("/callback/vneid/")[1];
            // Decode để đổi %7C thành |
            const decodedValue = decodeURIComponent(value);
  
            // Cắt theo dấu "|"
            const tnx = decodedValue.split("|")[0];
  
            const apiUrl = `https://loginvneid.nacencomm.vn/biometric-share-info/get-transaction`;
            console.log("API URL:", apiUrl);
            const response = await fetch(
              apiUrl,
              {
                method: "POST",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ tnx }), // gửi CCCD
              }
            );
  
            const data = await response.json();
            onComplete(data);
          } else {
            //RootNavigation.navigate('CallbackScreen', { token });
          }
        } catch (error) {
          console.error("Error processing URL:", error);
          Alert.alert("Error", `Invalid URL: ${error.message}`);
        }
      };
  
      // Lắng nghe khi ứng dụng đang chạy
      const subscription = Linking.addEventListener("url", handleDeepLink);
  
      // Xử lý URL khi ứng dụng được mở từ link
      Linking.getInitialURL().then((url) => {
        if (url) {
          handleDeepLink({ url });
        }
      });
  
      // Dọn dẹp listener
      return () => {
        subscription.remove();
      };
    }, []);
  const [cccd, setCccd] = useState("");
  const openUniversalLink = async (txnId) => {
    // Tạo URL dynamic từ tham số
    const universalLinkBase = "https://webvneid2.teca.vn/share/";
    const universalLink = `${universalLinkBase}${txnId}`;
    console.log("Opening universal link:", universalLink);
    try {
      const supported = await Linking.canOpenURL(universalLink);
      if (supported) {
        await Linking.openURL(universalLink);
      } else {
        console.error("Unsupported URL:", universalLink);
        // Có thể hiển thị thông báo lỗi cho người dùng
      }
    } catch (error) {
      console.error("Error opening URL:", error);
    }
  };
  const handleRegister = async () => {
    try {
      setLoading(true);
      const response = await fetch(
        "https://loginvneid.nacencomm.vn/biometric-share-info/init",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ cccd }), // gửi CCCD
        }
      );

      const data = await response.json();
      console.log("API response:");
      openUniversalLink(data.data.txnId)
    } catch (error) {
      console.error("Error during registration:", error);
    } finally {
      setLoading(false); // tắt loading
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../img/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{i18n.t("vneid_form.title")}</Text>
      </View>
      <Text style={styles.instructions}>
        {i18n.t("vneid_form.instructions")}
      </Text>
      <TextInput
        value={cccd}
        onChangeText={setCccd}
        placeholder={i18n.t("vneid_form.NhapSoCCCD") ?? "Nhập số CCCD"}
        keyboardType="numeric"
        style={styles.input}
      />
      <TouchableOpacity
        style={[styles.skipButton, loading && { opacity: 0.6 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.skipButtonText}>
            {i18n.t("vneid_form.register")}
          </Text>
        )}
      </TouchableOpacity>
    </SafeAreaView>
  );
};

export default VneidForm;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    alignItems: "center",
    // justifyContent: "center",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  backText: {
    fontSize: 16,
    color: "#007bff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Căn giữa theo chiều ngang
    flex: 1, // Cho phép chiếm toàn bộ không gian còn lại
  },
  scannerContainer: {
    width: "100%",
    height: 250,
    backgroundColor: "#D9D9D9",
    justifyContent: "center",
    alignItems: "center",
    borderRadius: 8,
    overflow: "hidden",
  },
  placeholder: {
    width: "100%",
    height: "100%",
    backgroundColor: "#D9D9D9",
  },
  instructions: {
    marginVertical: 20,
    fontSize: 14,
    textAlign: "center",
    color: "#7D7D7D",
  },
  button: {
    marginTop: 20,
    backgroundColor: "#0056D2",
    borderRadius: 8,
    padding: 10,
  },
  buttonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  skipButton: {
    marginTop: 20,
    backgroundColor: "#0056D2",
    borderRadius: 8,
    paddingHorizontal: 20,
    paddingVertical: 10,
  },
  skipButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
  },
  input: {
    width: "90%",
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 16,
  },
});
