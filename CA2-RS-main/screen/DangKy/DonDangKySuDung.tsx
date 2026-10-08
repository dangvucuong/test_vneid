import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
  Image,
  Platform
} from 'react-native';
import Pdf from 'react-native-pdf';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { useLanguage } from "../../utils/i18n/LanguageContext"; // Đa ngôn ngữ context

// Định nghĩa kiểu dữ liệu cho params
type RouteParams = {
  DonDangKySuDung: {
    fileUrl: string; // Định nghĩa fileUrl là một chuỗi
  };
};

const DonDangKySuDung = () => {
  const navigation = useNavigation();
  const route = useRoute<RouteProp<RouteParams, 'DonDangKySuDung'>>();
  const { i18n } = useLanguage(); // Lấy ngôn ngữ từ context

  // Lấy fileUrl từ route.params
  const { fileUrl } = route.params;

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
            <Text style={styles.headerText}>
            {i18n.t("don_dang_ky_su_dung.title")}
                        </Text>
        </View>
      {/* Tabs */}
      {/* <View style={styles.tabContainer}>
        <Text style={[styles.tab, styles.activeTab]}>{i18n.t("don_dang_ky_su_dung.chi_tiet_tai_lieu")}</Text>
        <Text style={styles.tab}>{i18n.t("don_dang_ky_su_dung.thong_tin_tai_lieu")}</Text>
      </View> */}

      {/* PDF Viewer */}
      <View style={styles.pdfContainer}>
        <Pdf
          trustAllCerts={Platform.OS === 'ios'}
          source={{ uri: encodeURI(fileUrl) }}
          style={styles.pdf}
          onError={(error) => {
            console.error('PDF load error:', error);
          }}
        />
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {i18n.t("don_dang_ky_su_dung.footer_text")}{" "}
          <Text style={styles.link}>{i18n.t("don_dang_ky_su_dung.footer_terms")}</Text>.
          {i18n.t("don_dang_ky_su_dung.footer_text_2")}{" "}
        </Text>
        <TouchableOpacity style={styles.signButton} onPress={() => navigation.navigate('HoanTatDangKy')}>
          <Text style={styles.signButtonText}>{i18n.t("don_dang_ky_su_dung.sign_button")}</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
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
    fontWeight: 'bold',
    textAlign: 'center', // Căn giữa theo chiều ngang
    flex: 1, // Cho phép chiếm toàn bộ không gian còn lại
  },  
  tabContainer: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  tab: {
    flex: 1,
    textAlign: 'center',
    padding: 12,
    fontSize: 16,
    color: '#777777',
  },
  activeTab: {
    color: '#007AFF',
    borderBottomWidth: 2,
    borderBottomColor: '#007AFF',
  },
  pdfContainer: {
    flex: 1,
    margin: 16,
  },
  pdf: {
    flex: 1,
    width: '100%',
    height: '100%',
  },
  footer: {
    padding: 16,
    backgroundColor: '#F8F8F8',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
  },
  footerText: {
    fontSize: 14,
    color: '#555555',
    marginBottom: 16,
    textAlign: 'center',
  },
  link: {
    color: '#007AFF',
    textDecorationLine: 'underline',
  },
  signButton: {
    backgroundColor: '#007AFF',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
  },
  signButtonText: {
    fontSize: 16,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
});

export default DonDangKySuDung;
