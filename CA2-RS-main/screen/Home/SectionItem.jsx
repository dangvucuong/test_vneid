import React, { memo, useState } from "react";
import {
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  Share,
  Linking,
  View,
  Modal,
  Button,
} from "react-native";
import TrangthaikyImg from "../component/TrangThaiKyImg";
import DocTypeImg from "../component/DocTypeImg";
import { DOCUMENT_TYPE_SYSTEM, hitSlopSmall } from "../../utils/constant";
import moment from "moment";
import { useI18n } from "../../utils/i18n";

function SectionItem({
  item,
  selected,
  onSelect,
  onOption,
  highlightSub,
  showAttach,
  onPress,
  signed,
}) {
  const { i18n } = useI18n();
  const [isModalVisible, setModalVisible] = useState(false);
  const [openItem, setOpenItem] = useState(null);
  const handlePress = () => {
    setModalVisible(true); // Mở modal
    if (onPress) {
      onPress(); // Gọi callback nếu có
    }
  };
  const downloadFile = async (link) => {
    Linking.openURL(link);
  };

  const onShare = async (link) => {
    try {
      const result = await Share.share({
        message: link,
      });
      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  return (
    <>
      <TouchableOpacity
        style={styles.container}
        onPress={handlePress} // Sử dụng handlePress
      >
        <View style={styles.itemIcon}>
          <DocTypeImg type={item.type} />
          {item.type !== DOCUMENT_TYPE_SYSTEM && (
            <TrangthaikyImg Trangthaiky={item.Trangthaiky} />
          )}
        </View>
        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.itemLabel}>{item.TenVB}</Text>
          <View style={styles.itemDateLabel}>
            {signed ? (
              <Text>{item.Date_Signed}</Text>
            ) : (
              <Text style={highlightSub ? styles.highlightSub : {}}>
                {`${highlightSub ? i18n.t("home.han_ky") + ": " : ""}${moment(
                  item.Date_Req,
                  "DD-MM-YYYY HH:mm"
                )
                  .add(1, "hours")
                  .format("DD-MM-YYYY HH:mm")}`}
              </Text>
            )}
            {showAttach && (
              <>
                <Text>{"\u25CF"}</Text>
                <Text>
                  {item.attach} {i18n.t("home.van_ban_kem_theo")}
                </Text>
              </>
            )}
          </View>
        </View>
        {onSelect && (
          <TouchableOpacity onPress={onSelect}>
            {selected ? (
              <Image
                style={{ width: 20, height: 20 }}
                source={require("../../img/CheckBoxChecked.png")}
              />
            ) : (
              <Image
                style={{ width: 20, height: 20 }}
                source={require("../../img/CheckBox.png")}
              />
            )}
          </TouchableOpacity>
        )}
        {item.type !== DOCUMENT_TYPE_SYSTEM && onOption && (
          <TouchableOpacity
            onPress={() => setOpenItem(item)}
            hitSlop={hitSlopSmall}
          >
            <Image
              style={{ width: 20, height: 20 }}
              source={require("../../img/DotsThree.png")}
            />
          </TouchableOpacity>
        )}
      </TouchableOpacity>
      {/* Modal */}
      {/* Modal */}
      <Modal transparent={true} visible={openItem !== null}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setOpenItem(null)}
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
                {openItem?.TenVB}
              </Text>
              <Text style={{ lineHeight: 16, color: "#6B7280", fontSize: 12 }}>
                {openItem?.Date_Signed}
              </Text>
            </View>
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => downloadFile(openItem?.Linkfile_signed)}
            >
              <View style={styles.modalActionIcon}>
                <Image
                  source={require("../../img/DownloadSimple.png")}
                  style={{ width: 24, height: 24 }}
                />
              </View>
              <Text style={styles.modalActionText}>
                {i18n.t("document.download")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.modalAction}
              onPress={() => onShare(openItem?.Linkfile_signed)}
            >
              <View style={styles.modalActionIcon}>
                <Image
                  source={require("../../img/share.png")}
                  style={{ width: 24, height: 24 }}
                />
              </View>
              <Text style={styles.modalActionText}>
                {i18n.t("document.share")}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </>
  );
}

export default memo(SectionItem);

const styles = StyleSheet.create({
  container: {
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
  highlightSub: {
    color: "#DC2626",
    fontWeight: "500",
  },
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
});
