import React from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import moment from "moment";

export default function KyTaiLieuList({ navigation, route }) {
  const { i18n } = useI18n();
  const { items } = route.params;
  console.log("KyTaiLieuList", items);
  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("document.tai_lieu")}
      />
      <ScrollView style={styles.container} contentContainerStyle={{ gap: 8 }}>
        <View style={{ paddingHorizontal: 16, fontSize: 14, lineHeight: 20 }}>
          <Text style={styles.itemLabel}>
            {i18n.t("document.have_num_doc", { num: items.length })}
          </Text>
        </View>
        {items.map((item, index) => (
          <TouchableOpacity
            style={styles.itemContainer}
            key={index}
            onPress={() => navigation.navigate("PreviewPDF", { item })}
          >
            <View style={styles.itemIcon}>
              <Image
                style={styles.itemIcon}
                source={require("../../img/DocumentTypeSingle.png")}
              />
              {Number(item.KetQuaKy) == 1 && (
                <Image
                  source={require("../../img/DocStatusApproved.png")}
                  style={styles.status}
                />
              )}
              {item.KetQuaKy && Number(item.KetQuaKy) != 1 && (
                <Image
                  source={require("../../img/DocStatusRejected.png")}
                  style={styles.status}
                />
              )}
            </View>
            <View style={{ flex: 1, gap: 2 }}>
              <Text style={styles.itemLabel}>{item.TenVB}</Text>
              <Text style={styles.itemDateLabel}>
                {`${i18n.t("home.han_ky")}: ${moment(
                  item.Date_Req,
                  "DD-MM-YYYY HH:mm"
                )
                  .add(24, "hours")
                  .format("DD-MM-YYYY HH:mm")}`}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
    marginTop: 8,
    paddingTop: 16,
    backgroundColor: "#ffffff",
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
  itemLabel: {
    fontSize: 13,
    lineHeight: 18,
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
  status: {
    width: 16,
    height: 16,
    position: "absolute",
    bottom: 0,
    right: 0,
  },
});
