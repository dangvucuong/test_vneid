import { useState } from "react";
import {
  Image,
  Linking,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../utils/i18n";
import { SafeAreaView } from "react-native-safe-area-context";
import ActionSoanKiCaNhan from "../screen/TaiKhoan/components/ActionSoanKiCaNhan";
import Dialog from "../screen/TaiKhoan/components/Dialog";
import React from "react";
import moment from "moment";

function getActiveTab(route: { params?: { screen?: string }; state?: { index?: number; routes?: { name: string }[] } }) {
  return (
    route.params?.screen ??
    route.state?.routes?.[route.state?.index ?? 0]?.name ??
    "Home"
  );
}

const TabBottom = ({ navigation, route }) => {
  const tabs: string[] = ["Home", "TaiKhoan"];
  const { i18n } = useI18n();
  const [visible, setVisible] = useState<boolean>(false);
  const active = getActiveTab(route);
  const [dialogCapBuCTSVisible, setDialogCapBuCTSVisible] = useState(false);
  const [dialogHetHanCTSVisible, setDialogHetHanCTSVisible] = useState(false);
  const handleCallSupport = () => {
    Linking.openURL("tel:19005454407");
    setDialogCapBuCTSVisible(false);
  };
  const handleMuaThemCKS = () => {
    setDialogHetHanCTSVisible(false);
    navigation.navigate("DangKy");
  }
  const checkHetHanCTS = () => {
    if (global.NgayTK && moment(global.NgayKT, "YYYY-MM-DD").isBefore(
      moment(),
      "day"
    )) {
      if(global.HanGCN && moment(global.HanGCN, "YYYY-MM-DD").isAfter(
        moment(global.NgayKT, "YYYY-MM-DD"),
        "day"
      )) {
        console.log("cap bu");
        setDialogCapBuCTSVisible(true);
        return;
      }
      console.log("het han");
      setDialogHetHanCTSVisible(true);
      return;
    }
    setVisible(true);
  };
  return (
    <SafeAreaView
      edges={["bottom", "left", "right"]}
      style={{
        paddingHorizontal: 4,
        flexDirection: "row",
        gap: 8,
        backgroundColor: "white",
        paddingTop: 5,
        paddingBottom: 10,
      }}
    >
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() => navigation.navigate("HomeWrapper", { screen: "Home" })}
      >
        {active === tabs[0] ? (
          <Image
            source={require("../img/HouseActive.png")}
            style={styles.icon}
          />
        ) : (
          <Image source={require("../img/House.png")} style={styles.icon} />
        )}
        <Text
          style={[
            styles.text,
            {
              color: active === tabs[0] ? "#1858EA" : "#9CA3AF",
            },
          ]}
        >
          {i18n.t("home.home")}
        </Text>
      </TouchableOpacity>
      <TouchableOpacity style={styles.menuBtn} onPress={() => checkHetHanCTS()}>
        <Image source={require("../img/Plus.png")} style={styles.iconBig} />
      </TouchableOpacity>
      <ActionSoanKiCaNhan
        navigation={navigation}
        visible={visible}
        onClose={() => setVisible(false)}
      />
      <Dialog
        title="Cấp bù thời hạn CTS"
        message="Chứng thư số của Quý khách hết hạn và cần được cấp bù bổ sung thời hạn theo gói cước trong hợp đồng đăng ký. Vui lòng liên hệ tới 1900 5454 07 để được hỗ trợ cấp bù. Đây là chương trình cấp bù hoàn toàn Miễn phí."
        buttonText="Gọi hỗ trợ"
        visible={dialogCapBuCTSVisible}
        onClose={() => setDialogCapBuCTSVisible(false)}
        onClickButton={handleCallSupport}
        iconName="capBu"
      />
      <Dialog
        title="Hết hạn chữ ký số"
        message="Chữ ký số của Quý khách đã hết hạn. Vui lòng gia hạn thêm để tiếp tục sử dụng dịch vụ"
        buttonText="Mua thêm"
        visible={dialogHetHanCTSVisible}
        onClose={() => setDialogHetHanCTSVisible(false)}
        onClickButton={handleMuaThemCKS}
        iconName="hetHan"
      />
      <TouchableOpacity
        style={styles.menuBtn}
        onPress={() =>
          navigation.navigate("HomeWrapper", { screen: "TaiKhoan" })
        }
      >
        {active === tabs[1] ? (
          <Image
            source={require("../img/SquaresFourActive.png")}
            style={styles.icon}
          />
        ) : (
          <Image
            source={require("../img/SquaresFour.png")}
            style={styles.icon}
          />
        )}
        <Text
          style={[
            styles.text,
            { color: active === tabs[1] ? "#1858EA" : "#9CA3AF" },
          ]}
        >
          {i18n.t("home.extra")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  menuBtn: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 2,
  },
  icon: {
    width: 24,
    height: 24,
  },
  iconBig: {
    width: 38,
    height: 38,
  },
  text: {
    fontSize: 10,
  },
});

export default TabBottom;
