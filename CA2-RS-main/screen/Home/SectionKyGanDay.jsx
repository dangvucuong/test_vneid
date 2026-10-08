import { StyleSheet, TouchableOpacity, View, Image, Text } from "react-native";
import { useI18n } from "../../utils/i18n";
import SectionItem from "./SectionItem";
import SectionHeader from "./SectionHeader";
import React, { useState } from "react";
import ActionSoanKiCaNhan from "../TaiKhoan/components/ActionSoanKiCaNhan";
export default function SectionKyGanDay({
  data,
  onPressItem,
  setOption,
  navigation,
}) {
  const { i18n } = useI18n();
  const [visible, setVisible] = useState(false);
  return (
    <View style={styles.container}>
      <SectionHeader
        title={i18n.t("home.ky_gan_day")}
        actionLabel={i18n.t("home.lich_su_ky")}
        onPressAction={() => navigation.navigate("QuanLyTaiLieuList")}
      />
      {data.length === 0 ? (
        <View style={styles.content}>
          <Image
            source={require("../../img/hopdong.png")}
            style={styles.image}
          />
          <Text style={styles.emptyStateText}>
            {i18n.t("home.ban_chua_co_du_lieu_lich_su_ky")}
          </Text>
          <TouchableOpacity
            onPress={() => setVisible(true)}
            style={styles.addButton}
          >
            <Text style={styles.addButtonText}>
              {i18n.t("home.them_hop_dong")}
            </Text>
          </TouchableOpacity>
        </View>
      ) : (
        data.map((item, index) => (
          <TouchableOpacity
            key={index}
            onPress={() => navigation.navigate("QuanLyTaiLieuDetail")}
            style={{ width: "100%" }}
          >
            <SectionItem
              item={item}
              onOption={() => setOption(item)}
              onPress={() => onPressItem(item)}
              signed={true}
            />
          </TouchableOpacity>
        ))
      )}
      <ActionSoanKiCaNhan
        navigation={navigation}
        visible={visible}
        onClose={() => setVisible(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 16,
    gap: 8,
    marginBottom: 4,
    backgroundColor: "#ffffff",
    width: "100%",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    marginTop: 60,
    marginBottom: 70,
    alignSelf: "stretch",
  },
  image: {
    width: 100,
    height: 100,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 16,
    color: "#666666",
    marginBottom: 16,
  },
  addButton: {
    backgroundColor: "#ffffff",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    borderColor: "black",
    borderWidth: 1,
  },
  addButtonText: {
    fontSize: 16,
    color: "black",
  },
});
