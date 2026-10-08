import React from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  Share,
  Linking,
} from "react-native";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";

import { useI18n } from "../../utils/i18n";

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    borderRadius: 8,
    width: "100%",
    alignItems: "center",
    gap: 16,
  },
  status: {
    // Ví dụ style cho image status
    position: "absolute",
    top: 0,
    right: 0,
    width: 24,
    height: 24,
  },
  bigLink: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#1858EA",
  },
  successAction: {
    alignItems: "center",
  },
  circleBtn: {
    backgroundColor: "#E2E8F0",
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 8,
  },
  btnText: {
    fontSize: 14,
    fontWeight: "500",
  },
  //... các styles khác mà ViewSignedFile cần
});

const ViewSignedFile = ({ navigation, route }) => {
  const { item } = route.params;
  const { i18n } = useI18n();
  const downloadFile = async () => {
    Linking.openURL(item.Linkfile_goc);
  };

  const onShare = async () => {
    try {
      const result = await Share.share({
        message: item.Linkfile_goc,
      });
      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("document.ky_tai_lieu")}
      />

      <View style={styles.container}>
        <View>
          <Image
            source={require("../../img/SignDoc.png")}
            style={{ width: 48, height: 48 }}
          />
          <Image
            source={require("../../img/DocStatusApproved.png")}
            style={styles.status}
          />
        </View>
        <Text style={{ fontSize: 14, lineHeight: 20 }}>
          {i18n.t("document.sign_success")}
        </Text>
        <View style={{ gap: 4 }}>
          <Text style={[styles.bigLink, { textAlign: "center" }]}>
            {item.TenVB}
          </Text>
        </View>
        <View
          style={{
            width: "100%",
            flexDirection: "row",
            justifyContent: "space-around",
          }}
        >
          <TouchableOpacity style={styles.successAction} onPress={downloadFile}>
            <View style={styles.circleBtn}>
              <Image
                source={require("../../img/DownloadSimple.png")}
                style={{ width: 24, height: 24 }}
              />
            </View>
            <Text style={[styles.btnText, { color: "#0F172A" }]}>
              {i18n.t("document.download_short")}
            </Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.successAction} onPress={onShare}>
            <View style={styles.circleBtn}>
              <Image
                source={require("../../img/share.png")}
                style={{ width: 24, height: 24 }}
              />
            </View>
            <Text style={[styles.btnText, { color: "#0F172A" }]}>
              {i18n.t("document.share_short")}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </PageContainer>
  );
};

export default ViewSignedFile;
