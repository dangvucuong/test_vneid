import AsyncStorage from "@react-native-async-storage/async-storage";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import {
  Image,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import FilterView from "../component/FilterView";

const CATEGORY = [
  { id: "1", label: "notify.category_1" },
  { id: "2", label: "notify.category_2" },
];

export default function ListNotify({ navigation, route, props }) {
  const { i18n, locale } = useI18n();
  const [db_daky, setdbdaky] = useState([]);
  const [docs, setFullDoc] = useState([]);
  const [active, setActive] = useState(CATEGORY[0].id);
  const [filter, setFilter] = useState("");
  useEffect(() => {
    setFilter("");
  }, [active]);
  useEffect(() => {
    const newdocuments = docs.filter((p) => p.title?.includes(filter));
    setdbdaky(newdocuments);
  }, [filter, docs]);
  const getNotifyImg = (type) => {
    switch (type) {
      case "ChoKy":
      case "CoYeuCauKy":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_ChoKy.png")}
          />
        );
      case "KyHopLe":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_KyHopLe.png")}
          />
        );
      case "KyKhongHopLe":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_KyKhongHopLe.png")}
          />
        );
      case "BanCapNhat":
      case "Ma OTP":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_BanCapNhat.png")}
          />
        );
      case "HanChungThu":
      case "CapChungThuThanhCong":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_HanChungThu.png")}
          />
        );
      case "TaiLieuHoanTat":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_TaiLieuHoanTat.png")}
          />
        );
      case "YeuCauBanGoc":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_YeuCauBanGoc.png")}
          />
        );
      case "KhuyenMai":
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/documentType_KhuyenMai.png")}
          />
        );
      default:
        return (
          <Image
            style={styles.itemIcon}
            source={require("../../img/notify_list.png")}
          />
        );
    }
  };

  const GroupTitle = ({ time }) => {
    const period = moment(time, "DD/MM/YYYY");
    const curentTime = moment();
    if (period.isSame(curentTime, "day")) {
      return <Text style={styles.groupTitle}>{i18n.t("common.today")}</Text>;
    }
    if (period.isSame(curentTime.subtract(1, "day"), "day")) {
      return (
        <Text style={styles.groupTitle}>{i18n.t("common.yesterday")}</Text>
      );
    }
    if (locale === "vi")
      return (
        <Text style={styles.groupTitle}>
          {period.format("[Ngày] DD [tháng] MM [năm] YYYY")}
        </Text>
      );
    return (
      <Text style={styles.groupTitle}>{period.format("DD MMM YYYY")}</Text>
    );
  };

  const Itemdaky = ({ item }) => (
    <View style={styles.item_daky}>
      {getNotifyImg(item.type)}
      <View style={{ flex: 1, gap: 2 }}>
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.itemLabel} numberOfLines={2}>
            {item.title}
          </Text>
        </View>
        <Text style={styles.itemDateLabel}>{item.time}</Text>
      </View>
    </View>
  );

  const handleFilter = () => {};

  const listItem = useMemo(() => {
    if (!db_daky) return [];
    return db_daky.filter((item) => item.category === active);
  }, [db_daky, active]);

  const groupsItem = useMemo(() => {
    const groups = [];
    listItem.forEach((doc) => {
      const time = moment(doc.time, "DD/MM/YYYY hh:mm");
      const group = groups.find((gr) => {
        const period = moment(gr.time, "DD/MM/YYYY");
        return period.isSame(time, "day");
      });
      // Nếu category là 2
      if (group) group.items.push(doc);
      else {
        groups.push({
          time: time.format("DD/MM/YYYY"),
          items: [doc],
        });
      }
    });
    return groups.filter((group) => group.items?.length > 0);
  }, [listItem]);

  useEffect(() => {
    getData();
  }, []);
  const getType = (Noidung_key) => {
    let type = "";
    switch (Noidung_key) {
      case "7":
        return "CapChungThuThanhCong";
      case "0":
        return "Ma OTP";
      case "1":
        return "ChoKy";
      case "2":
        return "CoYeuCauKy";
      case "3":
        return "KyHopLe";
      default:
        break;
    }
  }
  const getData = async () => {
    var dev_id = await AsyncStorage.getItem("@devid");
    var idcts = await AsyncStorage.getItem("@idcts");
    var ds_daky = [];
    NetInfo.fetch().then(async (state) => {
      if (state.isConnected == true) {
        var url =
          "https://apisign.nacencomm.vn/api/APISigncore/LayDSPush?deviceid=" +
          dev_id +
          "&idcts=" +
          idcts;

        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then(async (responseJson) => {
            var res = JSON.parse(responseJson);
            console.log("res", res);
            for (let i = 0; i < res.length; i++) {
              let item = {
                key: res[i].idLogpush,
                title: res[i].Noidung_message,
                time: moment(res[i].Thoigiantao).format("DD/MM/YYYY HH:mm"),
                category: res[i].Noidung_key === "0" || res[i].Noidung_key === "7" ? "1" : "2",
                type: getType(res[i].Noidung_key)
              };
              if (res[i].Noidung_key === "0") {
                item.title = "Mã OTP: " + item.title;
              }
              ds_daky.push(item);
            }
            setdbdaky(ds_daky);
            setFullDoc(ds_daky);
          })
          .catch((error) => {
            console.error(error);
          });
      } else {
        createNo_internet();
      }
    });
  };

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("notify.title")}
      />
      <View style={{ flex: 1, width: "100%" }}>
        <View
          style={{
            flexDirection: "row",
            paddingHorizontal: 16,
            backgroundColor: "#ffffff",
          }}
        >
          {CATEGORY.map((item) => (
            <TouchableOpacity
              key={item.id}
              style={[
                styles.category,
                ...(active === item.id ? [styles.categoryActive] : []),
              ]}
              onPress={() => setActive(item.id)}
            >
              <Text style={{ fontSize: 13, fontWeight: "600" }}>
                {i18n.t(item.label)}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        {active === "2" && (
          <FilterView
            text={filter}
            setText={setFilter}
            handleFilter={handleFilter}
          />
        )}
        <ScrollView
          style={{ flex: 1, marginTop: 20 }}
          contentContainerStyle={{ gap: 24, paddingBottom: 20 }}
        >
          {groupsItem.map((group, grIndex) => (
            <View key={grIndex} style={{ gap: 4 }}>
              <GroupTitle time={group.time} />
              <View style={{ backgroundColor: "#ffffff" }}>
                {group.items.map((item, index) => (
                  <Itemdaky key={index} item={item} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  title: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1E293B",
    fontWeight: "600",
  },
  category: {
    height: 30,
    flex: 1,
    alignItems: "center",
  },
  categoryActive: {
    borderBottomColor: "#1858EA",
    borderBottomWidth: 1,
  },
  filterInput: {
    paddingHorizontal: 12,
    height: 32,
    borderRadius: 4,
    backgroundColor: "#F8F8F8",
    flex: 1,
  },
  filterBtn: {
    paddingHorizontal: 10,
    height: 32,
    borderRadius: 4,
    gap: 8,
    alignItems: "center",
    flexDirection: "row",
    backgroundColor: "#1858EA",
  },
  item_daky: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 12,
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
  },
  groupTitle: {
    color: "#6B7280",
    lineHeight: 16,
    fontSize: 12,
    paddingHorizontal: 16,
  },
});
