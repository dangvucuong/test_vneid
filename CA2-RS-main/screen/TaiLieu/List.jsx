import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import React, { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Image,
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import FilterView from "../component/FilterView";
import TrangthaikyImg from "../component/TrangThaiKyImg";
import DocTypeImg from "../component/DocTypeImg";

const CATEGORY = [
  { id: "1", label: "document.signed" },
  { id: "2", label: "document.completed" },
];

export default function QuanLyTaiLieuList({ navigation, route }) {
  const { i18n, locale } = useI18n();
  const [documents, setDocuments] = useState([]);
  const [docs, setFullDoc] = useState([]);
  const [active, setActive] = useState(CATEGORY[0].id);
  const [filter, setFilter] = useState("");
  const [openItem, setOpenItem] = useState(null);
  const isFocused = useIsFocused();

  useEffect(() => {
    setFilter("");
  }, [active]);
  useEffect(() => {
    const newdocuments = docs.filter((p) => p.TenVB?.includes(filter));
    setDocuments(newdocuments);
  }, [filter, docs]);
  const handleFilter = () => {};


  const GroupTitle = ({ time }) => {
    const period = moment(time, "MM/YYYY");
    const curentTime = moment();
    if (period.isSame(curentTime, "year")) {
      if (period.isSame(curentTime, "month")) {
        return (
          <Text style={styles.groupTitle}>{i18n.t("document.this_month")}</Text>
        );
      }
      if (period.isSame(curentTime.subtract(1, "month"), "month")) {
        return (
          <Text style={styles.groupTitle}>{i18n.t("document.last_month")}</Text>
        );
      }
      if (locale === "vi")
        return (
          <Text style={styles.groupTitle}>{`Tháng ${period.format(
            "MM"
          )}`}</Text>
        );
      return <Text style={styles.groupTitle}>{period.format("MMM")}</Text>;
    }
    if (locale === "vi")
      return (
        <Text style={styles.groupTitle}>{`Tháng ${period.format(
          "MM/YYYY"
        )}`}</Text>
      );
    return <Text style={styles.groupTitle}>{period.format("MMM YYYY")}</Text>;
  };

  const ItemDocument = ({ item }) => (
    <View style={styles.item_daky}>
      <View style={styles.itemIcon}>
        <DocTypeImg type={item.type} />
        <TrangthaikyImg Trangthaiky={item.Trangthaiky} />
      </View>
      <TouchableOpacity
        style={{ flex: 1, gap: 2 }}
        onPress={() => navigation.navigate("QuanLyTaiLieuDetail", { item })}
      >
        <View style={{ flexDirection: "row" }}>
          <Text style={styles.itemLabel}>{item.TenVB}</Text>
        </View>
        {item.type === "single" && (
          <Text style={styles.itemDateLabel}>{item.time}</Text>
        )}
        {item.type === "multiple" && (
          <Text style={styles.itemDateLabel}>{item.subText}</Text>
        )}
      </TouchableOpacity>
      <TouchableOpacity onPress={() => setOpenItem(item)}>
        <Image
          style={{ width: 20, height: 20 }}
          source={require("../../img/DotsThree.png")}
        />
      </TouchableOpacity>
    </View>
  );

  const listDocs = useMemo(() => {
    if (!documents) return [];
    return documents.filter((item) => item.category === active);
  }, [documents, active]);

  const groupsDoc = useMemo(() => {
    const groups = [];
    listDocs.forEach((doc) => {
      const time = moment(doc.time, "DD/MM/YYYY hh:mm");
      const group = groups.find((gr) => {
        const period = moment(gr.time, "MM/YYYY");
        return period.isSame(time, "month") && period.isSame(time, "year");
      });
      if (group) group.items.push(doc);
      else {
        groups.push({
          time: time.format("MM/YYYY"),
          items: [doc],
        });
      }
    });
    return groups.filter((group) => group.items?.length > 0);
  }, [listDocs]);

  useEffect(() => {
    if (isFocused) GetDS_daky();
  }, [isFocused]);

  const GetDS_daky = async () => {
    const dev_id = global.UUID;
    const idcts = global.id;

    const url =
      "https://apisign.nacencomm.vn/api/APISigncore/Laydanhsachyeucaudaky_Mobilesign?deviceid=" +
      dev_id +
      "&idcts=" +
      idcts;

    const ds_daky = [];
    await fetch(url, {
      method: "POST",
      headers: {
        Accept: "application/json",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({}),
    })
      .then((response) => response.json())
      .then((responseJson) => {
        const res = JSON.parse(responseJson);
        for (let i = 0; i < res.length; i++) {
          if (res[i]?.Type === "PDF" || res[i]?.Type === "XML") {
            const item = {
              key: i,
              Code: res[i].Code,
              Date_Req: res[i].Date_Req,
              time: moment(res[i].Date_Signed).format("DD-MM-YYYY HH:mm"),
              Linkfile_signed: res[i].Linkfile_signed,
              Email: res[i].Email,
              Keyhethong: res[i].Keyhethong,
              Linkfile_goc: res[i].Linkfile_goc,
              idReq: res[i].idReq,
              TenVB: res[i].Keyhethong.split("|")[3],
              checked: false,
              category: CATEGORY[0].id,
              type: "single",
              Trangthaiky: res[i].Trangthaiky,
            };
            ds_daky.push(item);
          }
        }
        setDocuments(ds_daky);
        setFullDoc(ds_daky);
      })
      .catch((error) => {
        console.error(error);
      });
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
    <PageContainer>
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
                {openItem?.time}
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
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t("document.title_list")}
      />
      <View style={{ flex: 1, width: "100%" }}>
        {/*
          <View
            style={{
              flexDirection: "row",
              paddingHorizontal: 16,
              backgroundColor: "white",
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
          <FilterView
            text={filter}
            setText={setFilter}
            handleFilter={handleFilter}
          />
        */}
        <ScrollView
          style={{ flex: 1, paddingTop: 20 }}
          contentContainerStyle={{ gap: 24 }}
        >
          {groupsDoc.map((group, grIndex) => (
            <View key={grIndex} style={{ gap: 4 }}>
              <GroupTitle time={group.time} />
              <View style={{ backgroundColor: "#ffffff" }}>
                {group.items.map((item, index) => (
                  <ItemDocument key={index} item={item} />
                ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </View>
    </PageContainer>
  );
  
  // return (
  //   <PageContainer>
  //     <Modal transparent={true} visible={openItem !== null}>
  //       <View style={styles.modalContainer}>
  //         <TouchableOpacity
  //           style={styles.modalClose}
  //           onPress={() => setOpenItem(null)}
  //         >
  //           <Image
  //             source={require("../../img/X.png")}
  //             style={{ width: 24, height: 24 }}
  //           />
  //         </TouchableOpacity>
  //         <View
  //           style={{ width: "100%", height: 264, backgroundColor: "#ffffff" }}
  //         >
  //           <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
  //             <Text
  //               style={{ lineHeight: 18, color: "#0F172A", fontSize: 13 }}
  //               numberOfLines={1}
  //             >
  //               {openItem?.TenVB}
  //             </Text>
  //             <Text style={{ lineHeight: 16, color: "#6B7280", fontSize: 12 }}>
  //               {openItem?.time}
  //             </Text>
  //           </View>
  //           <TouchableOpacity
  //             style={styles.modalAction}
  //             onPress={() => downloadFile(openItem?.Linkfile_signed)}
  //           >
  //             <View style={styles.modalActionIcon}>
  //               <Image
  //                 source={require("../../img/DownloadSimple.png")}
  //                 style={{ width: 24, height: 24 }}
  //               />
  //             </View>
  //             <Text style={styles.modalActionText}>
  //               {i18n.t("document.download")}
  //             </Text>
  //           </TouchableOpacity>
  //           <TouchableOpacity
  //             style={styles.modalAction}
  //             onPress={() => onShare(openItem?.Linkfile_signed)}
  //           >
  //             <View style={styles.modalActionIcon}>
  //               <Image
  //                 source={require("../../img/share.png")}
  //                 style={{ width: 24, height: 24 }}
  //               />
  //             </View>
  //             <Text style={styles.modalActionText}>
  //               {i18n.t("document.share")}
  //             </Text>
  //           </TouchableOpacity>
  //         </View>
  //       </View>
  //     </Modal>
  //     <PageHeader
  //       onBack={() => navigation.goBack()}
  //       title={i18n.t("document.title_list")}
  //     />
  //     <View style={{ flex: 1, width: "100%" }}>
  //       <View
  //         style={{
  //           flexDirection: "row",
  //           paddingHorizontal: 16,
  //           backgroundColor: "white",
  //         }}
  //       >
  //         {CATEGORY.map((item) => (
  //           <TouchableOpacity
  //             key={item.id}
  //             style={[
  //               styles.category,
  //               ...(active === item.id ? [styles.categoryActive] : []),
  //             ]}
  //             onPress={() => setActive(item.id)}
  //           >
  //             <Text style={{ fontSize: 13, fontWeight: "600" }}>
  //               {i18n.t(item.label)}
  //             </Text>
  //           </TouchableOpacity>
  //         ))}
  //       </View>
  //       <FilterView
  //         text={filter}
  //         setText={setFilter}
  //         handleFilter={handleFilter}
  //       />

  //       <ScrollView
  //         style={{ flex: 1, paddingTop: 20 }}
  //         contentContainerStyle={{ gap: 24 }}
  //       >
  //         {groupsDoc.map((group, grIndex) => (
  //           <View key={grIndex} style={{ gap: 4 }}>
  //             <GroupTitle time={group.time} />
  //             <View style={{ backgroundColor: "#ffffff" }}>
  //               {group.items.map((item, index) => (
  //                 <ItemDocument key={index} item={item} />
  //               ))}
  //             </View>
  //           </View>
  //         ))}
  //       </ScrollView>
  //     </View>
  //   </PageContainer>
  // );
}

const styles = StyleSheet.create({
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
  title: {
    fontSize: 16,
    lineHeight: 24,
    color: "#1E293B",
    fontWeight: "600",
  },
  category: {
    height: 30,
    flex: 1,
    color: "#334155",
    alignItems: "center",
  },
  categoryActive: {
    borderBottomColor: "#1858EA",
    borderBottomWidth: 1,
  },
  groupTitle: {
    color: "#6B7280",
    lineHeight: 16,
    fontSize: 12,
    paddingHorizontal: 16,
  },
  item_daky: {
    display: "flex",
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    gap: 16,
    borderBottomColor: "#EDF1F5",
    borderBottomWidth: 1,
  },
  itemIcon: {
    width: 24,
    height: 24,
  },
  itemSubIcon: {
    position: "absolute",
    width: 16,
    height: 16,
    bottom: -8,
    right: -8,
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
});
