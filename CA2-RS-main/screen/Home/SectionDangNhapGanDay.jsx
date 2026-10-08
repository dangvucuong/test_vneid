import { StyleSheet, Text, View, Image, TouchableOpacity } from "react-native";
import { useI18n } from "../../utils/i18n";
import SectionHeader from "./SectionHeader";

export default function SectionDangNhapGanDay({ data, navigation }) {
  const { i18n } = useI18n();

  return (
    <View style={styles.container}>
      <SectionHeader
        title={i18n.t("home.dang_nhap_gan_day")}
        actionLabel={i18n.t("home.quan_ly_dang_nhap")}
        onPressAction={() => navigation.navigate("QuanLyDangNhap")}
      />
      {data.length === 0 ? (
        <View></View>
        // <View style={styles.containerEmpty}>
        //   <Text style={styles.hashtag}>#{i18n.t("home.tinh_nang_moi")}</Text>
        //   <View style={styles.contentContainer}>
        //     <View style={styles.textContainer}>
        //       <Text style={styles.title}>
        //         {i18n.t("home.rs_fido_authentication")}
        //       </Text>
        //       <Text style={styles.subtitle}>
        //         {i18n.t("home.giup_ban_quan_ly_dang_nhap_de_dang")}
        //       </Text>
        //       <TouchableOpacity
        //         onPress={() => navigation.navigate("DangKyPasskey")}
        //       >
        //         <Text style={styles.link}>{i18n.t("home.them_dang_nhap")}</Text>
        //       </TouchableOpacity>
        //     </View>
        //     <View style={styles.iconContainer}>
        //       <View style={styles.iconBackground}>
        //         <Image
        //           source={require("../../img/fido_lock.png")}
        //           style={styles.image}
        //         />
        //       </View>
        //     </View>
        //   </View>
        // </View>
      ) : (
        data.map((item, index) => (
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
          </View>
        ))
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 16,
    gap: 8,
    marginBottom: 4,
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
  containerEmpty: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  hashtag: {
    fontSize: 12,
    color: "#888",
    marginBottom: 8,
  },
  contentContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  textContainer: {
    flex: 1,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#0F172A",
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: "#666",
    marginBottom: 8,
  },
  link: {
    fontSize: 14,
    color: "#1858EA",
    fontWeight: "500",
  },
  iconContainer: {
    marginLeft: 16,
  },
  iconBackground: {
    borderRadius: 24,
    justifyContent: "center",
    alignItems: "center",
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
});
