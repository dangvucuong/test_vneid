import React, { useState } from "react";
import { StyleSheet, SafeAreaView, ActivityIndicator, Alert } from "react-native";
import { WebView } from "react-native-webview";

const WebViewScreen = ({ route, navigation }) => {
  const { url } = route.params;
  const [loading, setLoading] = useState(true);

  // Xử lý khi thay đổi trạng thái điều hướng
  const handleNavigationStateChange = (navState) => {
    // URL hiện tại
    const { url: currentUrl } = navState;

    // Kiểm tra nếu đăng ký hoàn tất dựa trên URL
    if (currentUrl.includes("success")) {
      Alert.alert("Thông báo", "Đăng ký thành công!", [
        { text: "OK", onPress: () => navigation.goBack() },
      ]);
    } else if (currentUrl.includes("error")) {
      Alert.alert("Thông báo", "Đăng ký thất bại. Vui lòng thử lại.");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {loading && (
        <ActivityIndicator
          size="large"
          color="#007BFF"
          style={styles.spinner}
        />
      )}
      <WebView
        source={{ uri: url }}
        useWebKit={true}
        javaScriptEnabled={true}
        onLoad={() => setLoading(false)}
        onNavigationStateChange={handleNavigationStateChange}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "white",
  },
  spinner: {
    position: "absolute",
    top: "50%",
    left: "50%",
    transform: [{ translateX: -20 }, { translateY: -20 }],
  },
});

export default WebViewScreen;
