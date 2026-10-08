import React from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from "@react-navigation/native";
import Pdf from "react-native-pdf";

// Định nghĩa kiểu dữ liệu cho tham số
type RouteParams = {
  BodyParams: {
    headerTitle: string;
    fileUrl: string;
  };
};

const ViewFilePdf = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, "BodyParams">>();

  // Lấy header title và file URL từ route params
  const { headerTitle, fileUrl } = route.params;

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
        <Text style={styles.headerText}>{headerTitle}</Text>
      </View>
      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        <Pdf
          trustAllCerts={Platform.OS === 'ios'}
          source={{ uri: encodeURI(fileUrl) }}
          style={styles.pdf}
          onError={(error) => {
            console.error("PDF load error:", error);
          }}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
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
  pdfContainer: {
    flex: 1,
    margin: 16,
    borderRadius: 8,
    overflow: "hidden",
  },
  pdf: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
});

export default ViewFilePdf;
