import AsyncStorage from "@react-native-async-storage/async-storage";
import messaging from "@react-native-firebase/messaging";
import { useIsFocused } from "@react-navigation/native";
import moment from "moment";
import * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ActivityIndicator,
  DeviceEventEmitter,
} from "react-native";
import { useI18n } from "../../utils/i18n";
import {
  getPendingSignList,
  getSignedList,
  invalidateSignLists,
} from "../../utils/apiService";
import { SIGN_LIST_REFRESH, registerSignListRefreshHandler } from "../../utils/signListEvents";
import PageContainer from "../component/PageContainer";
import ModalXuLy from "./ModalXuLy";
import SectionCanXuLy from "./SectionCanXuLy";
import SectionDangNhapGanDay from "./SectionDangNhapGanDay";
import SectionKyGanDay from "./SectionKyGanDay";
import SectionDoiCTS from "./SectionDoiCTS";
import { SafeAreaApp } from "../component/SafeAreaApp";
import HeaderInfo from "../component/HeaderInfo";
import * as RootNavigation from "../RootNavigation";

const DATA_DANG_NHAP_GAN_DAY = [
  // {
  //   icon: require("../../img/gmail.png"),
  //   domain: "account.google.com",
  //   email: "thuhongnguyen@gmail.com",
  //   time: "11/05/1023 11:23",
  // },
  // {
  //   icon: require("../../img/slack.png"),
  //   domain: "slack.com",
  //   email: "thuhongnguyen@gmail.com",
  //   time: "11/05/1023 11:23",
  // },
  // {
  //   icon: require("../../img/airbnb.png"),
  //   domain: "airbnb.com",
  //   email: "thuhongnguyen@gmail.com",
  //   time: "11/05/1023 11:23",
  // },
  // {
  //   icon: require("../../img/spotify.png"),
  //   domain: "spotify.com",
  //   email: "thuhongnguyen@gmail.com",
  //   time: "11/05/1023 11:23",
  // }
];

export default function Home({ navigation, route, props }) {
  const { i18n } = useI18n();
  const [selected, setSelected] = useState([]);
  const [openModal, setOpenModal] = useState(null);
  const [dsChoKy, setDsChoKy] = useState(() =>
    Array.isArray(global.dschoky) ? global.dschoky : []
  );
  const [dsDaKy, setDsDaKy] = useState([]);
  const [dsDangNhap, setDsDangNhap] = useState([]);
  const [isLoading, setLoading] = useState(false);

  const isFocused = useIsFocused();
  const handleClickRefresh = () => {
    setSelected([]);
    GetDSChoky(true);
    GetDS_daky(true);
    GetDSDangNhap();
  };

  const navigateKyDon = (item) => navigation.navigate("KyTaiLieu", { item });

  const navigateDetail = (item) =>
    navigation.navigate("QuanLyTaiLieuDetail", { item });

  const navigateKyLo = () =>
    navigation.navigate("KyLoTaiLieu", {
      items: dsChoKy.filter((item) => selected.includes(item.Code)),
    });
  const handleXuLyCancel = () => setSelected([]);

  const refreshTimersRef = useRef([]);
  const getDSChokyRef = useRef(null);
  const getDS_dakyRef = useRef(null);
  const pendingFetchSeqRef = useRef(0);
  const recentlySignedRef = useRef(new Set());

  const markRecentlySigned = useCallback((codes = []) => {
    codes.forEach((code) => {
      if (code == null) return;
      const key = String(code);
      recentlySignedRef.current.add(key);
      setTimeout(() => recentlySignedRef.current.delete(key), 90000);
    });
  }, []);

  const filterOutRecentlySigned = useCallback((list = []) => {
    if (recentlySignedRef.current.size === 0) return list;
    return list.filter((item) => !recentlySignedRef.current.has(String(item.Code)));
  }, []);

  useEffect(() => {
    if (isFocused) handleClickRefresh();
  }, [props, isFocused]);

  useEffect(() => {
    // App đang mở - foreground
    const unsubscribeOnMessage = messaging().onMessage(
      async (remoteMessage) => {
        console.log("🔥 onMessage:", remoteMessage);
        handleNotification(remoteMessage);
      }
    );

    // App ở background - người dùng bấm vào thông báo
    const unsubscribeOnNotificationOpenedApp =
      messaging().onNotificationOpenedApp((remoteMessage) => {
        console.log(
          "📲 App opened from background by notification:",
          remoteMessage
        );
        handleNotification(remoteMessage);
      });

    // App bị tắt hoàn toàn - mở lên từ thông báo
    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          console.log(
            "🚀 App launched from quit state by notification:",
            remoteMessage
          );
          handleNotification(remoteMessage);
        }
      });

    return () => {
      unsubscribeOnMessage();
      unsubscribeOnNotificationOpenedApp();
    };
  }, []);
  const handleNotification = async (remoteMessage) => {
    try {
      const { data } = remoteMessage;
      const key = data?.key;

      switch (key) {
        case "1":
          console.log("home 1");
          GetDSChoky(true);
          break;
        case "2":
          console.log("home 2");
          GetDSChoky(true);
          break;
        case "3":
          console.log("home 3");
          GetDSChoky(true);
          GetDS_daky(true);
          invalidateSignLists(global.UUID, global.id);
          break;
        default:
          console.log("🔍 Không xác định key:", key);
      }
    } catch (error) {
      console.log("❌ Lỗi xử lý notification:", error);
    }
  };
  // useEffect(() => {
  //   const unsubscribe = messaging().onMessage(async (remoteMessage) => {
  //     var value = JSON.stringify(remoteMessage);
  //     var value1 = JSON.parse(value);
  //     var key = JSON.parse(JSON.stringify(value1.data)).key;
  //     var code = JSON.parse(JSON.stringify(value1.data)).code;

  //     var notification = value1.notification;
  //     if (key == "1") {
  //       console.log("home 1");
  //       await GetDSChoky();
  //     }
  //     if (key == "2") {
  //       console.log("home 2");

  //       await GetDSChoky();
  //     }
  //     if (key == "3") {
  //       console.log("home 3");
  //      await Promise.all([
  //       GetDSChoky(),
  //       GetDS_daky()
  //     ]);
  //     }
  //   });
  //   return unsubscribe;
  // }, []);
  useEffect(() => {
    setSelected([]);
    GetDSChoky(true);
    GetDS_daky(true);
    GetDSDangNhap();
  }, []);
  const GetDSChoky = async (forceRefresh = false) => {
    const idcheck = await AsyncStorage.getItem("@idcts");
    const dev_id = global.UUID || (await AsyncStorage.getItem("@devid"));
    if (!dev_id || !idcheck) return;

    const fetchSeq = ++pendingFetchSeqRef.current;
    setLoading(true);
    try {
      const res = await getPendingSignList(dev_id, idcheck, forceRefresh);
      if (fetchSeq !== pendingFetchSeqRef.current) return;

      const list = Array.isArray(res) ? res : [];
      const ds = list.map((item, i) => ({
        key: i,
        Code: item.Code,
        Date_Req: moment(item.Date_Req).format("DD-MM-YYYY HH:mm"),
        Email: item.Email,
        Keyhethong: item.Keyhethong,
        Linkfile_goc: item.Linkfile_goc,
        idReq: item.idReq,
        TenVB: item.Keyhethong.split("|")[3],
        checked: false,
      }));
      const filtered = filterOutRecentlySigned(ds);
      setDsChoKy(filtered);
      global.dschoky = filtered;
    } catch (error) {
      console.error(error);
    } finally {
      if (fetchSeq === pendingFetchSeqRef.current) {
        setLoading(false);
      }
    }
  };

  const GetDS_daky = async (forceRefresh = false) => {
    const dev_id = global.UUID || (await AsyncStorage.getItem("@devid"));
    const idcts =
      (await AsyncStorage.getItem("@idcts")) || global.id || global.idcts;
    if (!dev_id || !idcts) return;

    setLoading(true);
    try {
      const res = await getSignedList(dev_id, idcts, forceRefresh);
      const ds_daky = [];
      for (let i = 0; i < res.length; i++) {
        if (res[i]?.Type === "PDF" || res[i]?.Type === "XML") {
          ds_daky.push({
            key: i,
            Code: res[i].Code,
            Date_Req: res[i].Date_Req,
            Date_Signed: moment(res[i].Date_Signed).format("DD-MM-YYYY HH:mm"),
            Linkfile_signed: res[i].Linkfile_signed,
            Email: res[i].Email,
            Keyhethong: res[i].Keyhethong,
            Linkfile_goc: res[i].Linkfile_goc,
            idReq: res[i].idReq,
            TenVB: res[i].Keyhethong.split("|")[3],
            checked: false,
            Trangthaiky: res[i].Trangthaiky,
          });
        }
      }
      setDsDaKy(ds_daky);
      global.dsdaky = ds_daky;
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };
  getDSChokyRef.current = GetDSChoky;
  getDS_dakyRef.current = GetDS_daky;

  const handleSignListRefresh = useCallback((payload = {}) => {
    const isRetry = payload.retryOnly === true;

    if (!isRetry && payload.successCount > 0) {
      const removeList =
        payload.signedCodes?.length > 0
          ? payload.signedCodes
          : payload.batchCodes || [];
      markRecentlySigned(removeList);

      if (removeList.length > 0) {
        setDsChoKy((prev) => {
          const removeSet = new Set(removeList.map(String));
          const next = prev.filter((item) => !removeSet.has(String(item.Code)));
          global.dschoky = next;
          return next;
        });
        setSelected([]);
      }
    }

    const refreshFromServer = () => {
      getDSChokyRef.current?.(true);
      getDS_dakyRef.current?.(true);
    };

    if (!isRetry) {
      refreshTimersRef.current.forEach(clearTimeout);
      refreshTimersRef.current = [
        setTimeout(refreshFromServer, 2000),
        setTimeout(refreshFromServer, 5000),
      ];
    } else {
      refreshFromServer();
    }
  }, [markRecentlySigned]);

  useEffect(() => {
    registerSignListRefreshHandler(handleSignListRefresh);
    const subscription = DeviceEventEmitter.addListener(
      SIGN_LIST_REFRESH,
      handleSignListRefresh
    );
    return () => {
      registerSignListRefreshHandler(null);
      subscription.remove();
      refreshTimersRef.current.forEach(clearTimeout);
      refreshTimersRef.current = [];
    };
  }, [handleSignListRefresh]);

  const GetDSDangNhap = async () => {
    const idcts = global.id;

    try {
      const response = await fetch(
        `https://ca2rs.nacencomm.vn/user/list-user-from-mbk?mabutky=${idcts}`
      ); // Replace with your actual API endpoint

      if (!response.ok) {
        throw new Error(`Lỗi không lấy được dữ liệu!`);
      }

      const json = await response.json();

      const data = json.data; // Assuming "data" is the top-level key in the response

      // Flatten data to include user information with each domain
      const flattenedData = data.flatMap((item) => ({
        id: item.id,
        username: item.username,
        mabutky: item.mabutky,
        createdAt: moment(item.createdAt).format("YYYY-MM-DD HH:mm"), // Đổi định dạng createdAt
        updatedAt: moment(item.updatedAt).format("YYYY-MM-DD HH:mm"), // Đổi định dạng updatedAt
        domain_id: item.domains[0]?.id,
        domain_name: item.domains[0]?.domain_name,
        domain_description: item.domains[0]?.description,
        domain_url: item.domains[0]?.icon_url,
        domain_private_key: item.domains[0]?.private_key,
        domain_createdAt: moment(item.domains[0]?.createdAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        domain_updatedAt: moment(item.domains[0]?.updatedAt).format(
          "YYYY-MM-DD HH:mm"
        ),
        log_id: item.logs.id,
        log_type: item.logs.type,
        log_ip_address: item.logs.ip_address,
        log_is_success: item.logs.is_success,
        log_latitude: item.logs.latitude,
        log_longitude: item.logs.longitude,
        log_createdAt: moment(item.logs.createdAt).format("YYYY-MM-DD HH:mm"),
        log_updatedAt: moment(item.logs.updatedAt).format("YYYY-MM-DD HH:mm"),
      }));

      setDsDangNhap(flattenedData);
    } catch (error) {
      console.error("Lỗi khi gọi API lấy danh sách đăng nhập:", error);
    }
  };
  if (isLoading && dsChoKy.length === 0 && dsDaKy.length === 0) {
    return (
      <View style={styles.myloader}>
        <ActivityIndicator size="large" color="#1858EA" />
      </View>
    );
  }
  return (
    <PageContainer>
      <SafeAreaApp style={{ backgroundColor: "white" }}>
        <HeaderInfo showNotify={true} onClickRefresh={handleClickRefresh} />
      </SafeAreaApp>

      <ScrollView
        style={{ flex: 1, marginTop: 8, width: "100%" }}
        contentContainerStyle={{ gap: 8 }}
      >
        <TouchableOpacity
          onPress={() => RootNavigation.navigate("KyFileVneId")}
          style={{
            marginHorizontal: 16,
            backgroundColor: "#1858EA",
            borderRadius: 8,
            padding: 14,
          }}
        >
          <Text style={{ color: "#ffffff", fontWeight: "700" }}>
            Ký file PDF bằng VNeID
          </Text>
          <Text style={{ color: "#ffffff", marginTop: 4, fontSize: 12 }}>
            Chọn chứng thư, băm và ghép chữ ký trên máy
          </Text>
        </TouchableOpacity>

        {dsChoKy.length > 0 && (
          <SectionCanXuLy
            data={dsChoKy}
            onPressItem={navigateKyDon}
            selected={selected}
            setSelected={setSelected}
          />
        )}
        {global.Serial ? (
          <SectionKyGanDay
            data={dsDaKy.slice(0, 4)}
            onPressItem={navigateDetail}
            setOption={() => setOpenModal(true)}
            navigation={navigation}
          />
        ) : (
          <SectionDoiCTS></SectionDoiCTS>
        )}

        <SectionDangNhapGanDay data={dsDangNhap} navigation={navigation} />
      </ScrollView>
      <ModalXuLy
        i18n={i18n}
        value={selected.length}
        onOK={navigateKyLo}
        onCancel={handleXuLyCancel}
      />
      {/* <Modal transparent={true} visible={openModal}>
        <View style={styles.modalContainer}>
          <TouchableOpacity
            style={styles.modalClose}
            onPress={() => setOpenModal(false)}
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
                Hợp đồng mua bán cơ sở vật chất dự án mua bán nhà ở xã hội
                2022.pdf
              </Text>
              <Text style={{ lineHeight: 16, color: "#6B7280", fontSize: 12 }}>
                11/05/1023 11:23
              </Text>
            </View>
            <TouchableOpacity style={styles.modalAction} onPress={() => {}}>
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
            <TouchableOpacity style={styles.modalAction} onPress={() => {}}>
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
      </Modal> */}
    </PageContainer>
  );
}

const styles = StyleSheet.create({
  menu_btn: {
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
  myloader: {
    position: "absolute",
    top: 0,
    left: 0,
    zIndex: 10,
    backgroundColor: "#ffffff",
    opacity: 0.9,
    justifyContent: "center",
    alignItems: "center",
    width: "100%",
    height: "100%",
  },
});
