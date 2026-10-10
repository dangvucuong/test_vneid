import { ActionSheetProvider } from "@expo/react-native-action-sheet";

import { StatusBar } from "expo-status-bar";
import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  Button,
  Image,
  ActivityIndicator,
  AppState,
  BackHandler,
  ToastAndroid,
  PermissionsAndroid,
  Platform
} from "react-native";
import { AppRegistry, Alert, Modal } from "react-native";
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createStackNavigator } from "@react-navigation/stack";
import NetInfo from "@react-native-community/netinfo";
import AsyncStorage from "@react-native-async-storage/async-storage";
//import { AsyncStorage } from "react-native";
//import store from "react-native-simple-store";
import DeviceInfo from "react-native-device-info";
import messaging from "@react-native-firebase/messaging";
import PushNotificationIOS from "@react-native-community/push-notification-ios";
import PushNotification, { Importance } from "react-native-push-notification";
import ReactNativeBiometrics, { BiometryTypes } from "react-native-biometrics";
import NotificationPopup from "react-native-push-notification-popup";
import moment from "moment";
import DefaultPreference from "react-native-default-preference";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { LanguageProvider } from "./utils/i18n/LanguageContext"; // Import LanguageProvider
import {
  CodeField,
  Cursor,
  useBlurOnFulfill,
  useClearByFocusCell,
  MaskSymbol,
  isLastFilledCell,
} from "react-native-confirmation-code-field";
import * as Linking from "expo-linking";
import { Dimensions } from "react-native";
import { en, vi } from "./localize";
import * as Localization from "expo-localization";
import { I18n } from "i18n-js";
import {
  LINKING_CONFIG,
  setupDeepLinkListeners,
} from "./utils/deepLinkHandler";
import {
  checkSessionOnForeground,
  onAppBackground,
} from "./utils/sessionManager";
import { batchSignDocuments, getCertInfo, getPendingSignList } from "./utils/apiService";
import { notifySignListRefresh } from "./utils/signListEvents";
import {
  handleKey2SignNotification,
  registerKey2SignHandler,
} from "./utils/signNotificationHandler";
import localHashSign from "./utils/localHashSign";
import {
  isBatchSignOnceEnabled,
  loadBatchSignOnceSetting,
  setBatchSignOnceEnabled,
} from "./utils/batchSignSettings";
const i18n = new I18n();

//import * as LocalAuthentication from "expo-local-authentication";

//screen

import ThongTinCTS from "./screen/TaiKhoan/ThongTinCTS";
import BaoMat from "./screen/TaiKhoan/BaoMat";
import DoiMaPIN from "./screen/TaiKhoan/DoiMaPIN";
import ThongTinGoiButKy from "./screen/TaiKhoan/ThongTinGoiButKy";
import LichSuCapChungThu from "./screen/TaiKhoan/LichSuCapChungThu";
import HoSo from "./screen/TaiKhoan/LichSuCapChungThu/HoSo";
import GoiDichVu from "./screen/TaiKhoan/GoiDichVu";
import ThietLapChuKy from "./screen/TaiKhoan/ThietLapChuKy";

import Scan from "./screen/DangKy/qrcode";
import CCCDScanScreen from "./screen/DangKy/CCCDScanScreen";
import ChipReadingScreen from "./screen/DangKy/ChipReadingScreen";
import FaceVerificationScreen from "./screen/DangKy/FaceVerificationScreen";
import ChupAnhCCCD from "./screen/DangKy/ChupAnhCCCD";
import ScanOCR from "./screen/DangKy/ScanOCR";
import OCRData from "./screen/DangKy/OCRData";
import DonDangKySuDung from "./screen/DangKy/DonDangKySuDung";
import HoanTatDangKy from "./screen/DangKy/HoanTatDangKy";
import ThongTinCCCDGanChip from "./screen/DangKy/ThongTinCCCDGanChip";

import * as RootNavigation from "./screen/RootNavigation";
import { navigationRef, navigate } from "./screen/RootNavigation";
import StartLogin from "./screen/DangNhap/startLogin";
import Login from "./screen/DangNhap/login";
import Start2 from "./screen/OnBoarding/start2";
import DangKy from "./screen/DangKy/register";
// import Dangky from "./screen/register";
import DangKyHuongDan from "./screen/DangKy/registerSteps";
import DangKyCaNhanThuocToChuc from "./screen/DangKy/DangKyCaNhanThuocToChuc";
import XacThucThongTin from "./screen/DangKy/XacThucThongTin";
import ViewFilePdf from "./screen/TaiLieu/ViewFilePdf";
import KyFileVneId from "./screen/VneId/KyFileVneId";
import ToChuc from "./screen/DangKy/ToChuc";
import HomeWrapper from "./screen/Home/HomeWrapper";
import QuanLyTaiLieuList from "./screen/TaiLieu/List";
import QuanLyTaiLieuDetail from "./screen/TaiLieu/Detail";
import KyTaiLieu from "./screen/TaiLieu/KyTaiLieu";
import KyLoTaiLieu from "./screen/TaiLieu/KyLo";
import PreviewPDF from "./screen/TaiLieu/PreviewSign";
import KyTaiLieuList from "./screen/TaiLieu/KyTaiLieuList";
import QuanLyDangNhap from "./screen/TaiKhoan/QuanLyDangNhap";
import ListNotify from "./screen/ThongBao/listnotify";
import OTP from "./screen/KichHoat/otp";
import OTP_Done from "./screen/KichHoat/otp_done";
import SetupPin from "./screen/KichHoat/setupPin";
import Kichhoat from "./screen/KichHoat/kichhoat";
import ThanhToan from "./screen/TaiKhoan/ThanhToan";
import DangKyPasskey from "./screen/Passkey/DangKyPasskey";
import WebViewScreen from "./screen/Passkey/WebViewScreen";
import ViewSignedFile from "./screen/TaiLieu/ViewSignedFile";
import Dialog from "./screen/TaiKhoan/components/Dialog";
import * as SecureStore from 'expo-secure-store';
import {
  configureReanimatedLogger,
  ReanimatedLogLevel,
} from 'react-native-reanimated';
configureReanimatedLogger({
  strict: false, // Reanimated runs in strict mode by default
});
//language

//language
  
const windowWidth = Dimensions.get("window").width;
const windowHeight = Dimensions.get("window").height;
let regid = "@regid";
let dev_id = "@devid";

function notifyMessage(msg) {
  if (Platform.OS === "android") {
    ToastAndroid.show(msg, ToastAndroid.LONG);
  } else {
    Alert.alert("CA2 Remote signing", msg);
  }
}

messaging()
  .getToken()
  .then(async (token) => {
    await AsyncStorage.setItem("@regid", token);
    global.RegID = token;
  })
  .catch((error) => console.warn("FCM getToken failed:", error));



const Setkey = async (keyname, value) => {
  await AsyncStorage.setItem(keyname, value);
};

const GetKey = async (key) => {
  var value = null;
  try {
    value = await AsyncStorage.getItem(key);
    return value;
  } catch (e) {
    return value;
  } finally {
    return value;
  }
};

global.brand = DeviceInfo.getBrand(); //apple
global.model = DeviceInfo.getModel(); //13 promax
global.os = DeviceInfo.getSystemName(); //iOS
global.version = parseInt(Platform.Version, 10);


//config push setting
PushNotification.configure({});

PushNotification.createChannel(
  {
    channelId: "1", // (required)
    channelName: "My channel", // (required)
    channelDescription: "A channel to categorise your notifications", // (optional) default: undefined.
    playSound: false, // (optional) default: true
    soundName: "default", // (optional) See `soundName` parameter of `localNotification` function
    importance: Importance.HIGH, // (optional) default: Importance.HIGH. Int value of the Android notification importance
    vibrate: true, // (optional) default: true. Creates the default vibration pattern if true.
  },
  (created) => console.log(`createChannel returned '${created}'`) // (optional) callback returns whether the channel was created, false means it already existed.
);

//config local push notification
const LocalPush = (message) => {
  PushNotification.localNotification({
    autoCancel: true,
    largeIcon: "ic_launcher",
    smallIcon: "ic_notification",
    color: "green",
    vibrate: true,
    vibration: 500,
    title: "CA2 REMOTE SIGNNING",
    message: message,
    playSound: true,
    soundName: "default",
    //actions: ["Accept", "Reject"],
    //   channelId:channelId
    channelId: "1",
  });
};


const showAlertFromMessage = async (remoteMessage) => {
  const data = remoteMessage?.data || remoteMessage?.notification?.data;
  if (data?.key == "2") {
    await handleKey2SignNotification({
      ...remoteMessage,
      data,
    });
    return;
  }

  const title = remoteMessage.notification?.title || 'Thông báo';
  const body = remoteMessage.notification?.body || 'Bạn có thông báo mới';

  const val = {
    key: data?.key,
    Code: data?.code,
    Linkfile_goc: data?.linkfile,
    TenVB: data?.file?.split("_")[1] || '',
    checked: false,
  };

  RootNavigation.navigate('Home', { val: val, code: data?.Code });
};

const CELL_COUNT = 6;

export default function App({ }) {
  const [title, setTitle] = useState("");
  const [loadingVisible, setloadingVisible] = useState(false);
  const [locale, setlocale] = useState("vi");
  i18n.translations = { en, vi };
  i18n.locale = locale;

  useEffect(() => {
    loadBatchSignOnceSetting();
  }, []);

  const [startScr, setstartScr] = useState("Start2");
  const [sessionModalvisible, setsessionModalvisible] = useState(false);
  const [soNgaySapHetHanCKSvisible, setSoNgaySapHetHanCKSvisible] = useState(0);
  const [titleDialogHanCTS, setTitleDialogHanCTS] = useState("");
  const [buttonTextDialogHanCTS, setButtonTextDialogHanCTS] = useState("");
  const [messageDialogHanCTS, setMessageDialogHanCTS] = useState("");
  const [dialogHanCTSVisible, setDialogHanCTSVisible] = useState(false);
  const [iconNameCTS, setIconNameCTS] = useState("");
  const [actionFunction, setActionFunction] = useState(1);
  const [ngayKTState, setNgayKTState] = useState(global.NgayKT);


  useEffect(() => {
    return setupDeepLinkListeners();
  }, []);
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
    const backHandler = BackHandler.addEventListener(
      "hardwareBackPress",
      () => true
    );
    return () => backHandler.remove();
  }, []);

  const appState = useRef(AppState.currentState);

  //config language
  const [appStateVisible, setAppStateVisible] = useState(appState.current);

  useEffect(() => {
    const fetchDeviceInfo = async () => {
      try {
        const uniqueId = await DeviceInfo.getUniqueId();
        console.log(uniqueId);
        await AsyncStorage.setItem("@devid", uniqueId);
        await AsyncStorage.setItem("@countPin", "5");
        global.UUID = uniqueId;
        //  console.log("UUID: ", uniqueId);

        if (uniqueId) {
          const state = await NetInfo.fetch();
          if (state.isConnected) {
            const responseJson = await getCertInfo(uniqueId);
            console.log("lay tt hsdt:", responseJson);
            if (responseJson.length > 0) {
              const cert = responseJson[responseJson.length - 1];
              global.cn = cert.CN;
              global.diachi = cert.Diachi;
              global.Email = cert.Email;
              global.GoiDK = cert.GoiDK;
              global.HanGCN = cert.HanGCN;
              global.Masothue = cert.Masothue;
              global.NgayBD = cert.NgayBD;
              global.NgayKT = cert.NgayKT;
              global.O_Cert = cert.O;
              global.Serial = cert.Serial;
              global.Sothang = cert.Sothang;
              global.id = cert.idcts;
              global.idcts = cert.idcts;
            }
          } else {
            console.log("No internet");
          }
        }
      } catch (error) {
        console.error("Error fetching device info:", error);
      }
    };

    fetchDeviceInfo();
  }, []); // Chạy một lần khi App mount


  //config app state mode


  useEffect(() => {
    const subscription = AppState.addEventListener(
      "change",
      async (nextAppState) => {
        if (
          appState.current.match(/inactive|background/) &&
          nextAppState === "active"
        ) {
          console.log('App has come to the foreground!');
          const sessionExpired = await checkSessionOnForeground();
          if (sessionExpired) {
            appState.current = nextAppState;
            setAppStateVisible(nextAppState);
            return;
          }

          DefaultPreference.get("has_certificate").then(function (hascert) {
            //  console.log("hascert:",hascert);
            if (hascert == null || hascert == "0") {
              NetInfo.fetch().then(async (state) => {
                if (state.isConnected == true) {
                  var dev_id = await AsyncStorage.getItem("@devid");
                  var url =
                    "https://apisign.nacencomm.vn/api/APISigncore/LaythongtinCTS_DeviceID_HSDT?device_id=" +
                    dev_id;
                  fetch(url, {
                    method: "POST",
                    headers: {
                      Accept: "application/json",
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({}),
                  })
                    .then((response) => response.json())
                    .then((responseJson) => {
                      let certs = responseJson;
                      if (typeof certs === "string") {
                        certs = JSON.parse(certs);
                      }
                      if (!Array.isArray(certs) || certs.length === 0) {
                        return;
                      }
                      const cert = certs[certs.length - 1];
                      global.cert = certs;
                      global.cn = cert.CN;
                      global.diachi = cert.Diachi;
                      global.Email = cert.Email;
                      global.GoiDK = cert.GoiDK;
                      global.HanGCN = cert.HanGCN;
                      global.Masothue = cert.Masothue;
                      global.NgayBD = cert.NgayBD;
                      global.NgayKT = cert.NgayKT;
                      global.O_Cert = cert.O;
                      global.Serial = cert.Serial;
                      global.Sothang = cert.Sothang;
                      global.id = cert.idcts;
                      global.idcts = cert.idcts;
                      if (cert.idcts != null) {
                        Setkey("@idcts", cert.idcts);
                        Setkey("@cn", cert.CN);
                        Setkey("@has_certificate", "1");
                        DefaultPreference.set("has_certificate", "1").then(
                          function () { }
                        );
                      } else {
                        Setkey("@has_certificate", "0");
                        DefaultPreference.set("has_certificate", "0").then(
                          function () { }
                        );
                      }
                    })
                    .catch((error) => {
                      console.error(error);
                    });
                } else {
                  console.log("No internet");
                }
              });
            }
          });
        }

        appState.current = nextAppState;
        setAppStateVisible(appState.current);
        console.log('state', appState.current);
        if (appState.current == "background") {
          await onAppBackground();
        }
      }
    );
    return () => {
      subscription.remove();
    };
  }, []);

  const handleMuaThemCKS = useCallback(() => {
    setDialogHanCTSVisible(false);
    RootNavigation.navigate("DangKy");
  }, []);

  const handleCallSupport = useCallback(() => {
    Linking.openURL("tel:19005454407");
    setDialogHanCTSVisible(false);
  }, []);

  useEffect(() => {
    if (ngayKTState) {
      const ngayKT = moment(ngayKTState, "YYYY-MM-DD");
      const ngayHienTai = moment().startOf('day');
      console.log(ngayHienTai.format("YYYY-MM-DD"));
      const soNgayChenhLech = ngayKT.diff(ngayHienTai, "days") + 1;
      setSoNgaySapHetHanCKSvisible(soNgayChenhLech);

      let title, message, buttonText, iconName, action;

      if (soNgayChenhLech <= 0) {
        title = "CTS hết hạn";
        message =
          "Chứng thư số của Quý khách đã hết hạn. Vui lòng gia hạn để tiếp tục sử dụng dịch vụ.";
        buttonText = "Mua thêm";
        iconName = "sapHetHan";
        action = 1;
      } else if (soNgayChenhLech <= 30) {
        const isHanGCNAfterNgayKT = moment(global.HanGCN, "YYYY-MM-DD").isAfter(
          ngayKT,
          "day"
        );
        if (soNgayChenhLech == 1) {
          message = `Chứng thư số của Quý khách chỉ còn hiệu lực đến 24h ngày hôm nay`;

        } else {
          message = `Chứng thư số của Quý khách chỉ còn hiệu lực trong vòng ${soNgayChenhLech} ngày`;

        }

        if (isHanGCNAfterNgayKT) {
          iconName = "capBu";
          title = "Cấp bù thời hạn CTS";
          message += ` và được cấp bù bổ sung thời hạn theo gói cước trong hợp đồng đăng ký. Vui lòng liên hệ tới 1900 5454 07 để được hỗ trợ cấp bù. Đây là chương trình cấp bù hoàn toàn Miễn phí.`;
          buttonText = "Gọi hỗ trợ";
          action = 2;
        } else {
          iconName = "sapHetHan";
          title = "Sắp hết hạn chữ ký số";
          message +=
            ". Vui lòng gia hạn thêm để quá trình sử dụng không bị gián đoạn.";
          buttonText = "Mua thêm";
          action = 1;
        }
      } else {
        return;
      }

      // Cập nhật state cho Dialog
      setTitleDialogHanCTS(title);
      setMessageDialogHanCTS(message);
      setButtonTextDialogHanCTS(buttonText);
      setIconNameCTS(iconName);
      setActionFunction(action); // Gán actionFunction
      // Hiển thị Dialog sau khi actionFunction được cập nhật
      setDialogHanCTSVisible(true);
    }
  }, [ngayKTState]);

  const renderCell = ({ index, symbol, isFocused }) => {
    let textChild = null;

    if (symbol) {
      textChild = (
        <MaskSymbol
          maskSymbol="*"
          isLastFilledCell={isLastFilledCell({ index, value })}
        >
          {symbol}
        </MaskSymbol>
      );
    } else if (isFocused) {
      textChild = <Cursor />;
    }

    return (
      <View
        // Make sure that you pass onLayout={getCellOnLayoutHandler(index)} prop to root component of "Cell"
        onLayout={getCellOnLayoutHandler(index)}
        key={index}
        style={[styles.cellRoot, isFocused && styles.focusCell]}
      >
        <Text key={index} style={styles.cellText}>
          {textChild}
        </Text>
      </View>
    );
  };

  const checkxacthuc = "0";

  const [value, setValue] = useState("");

  const ref = useBlurOnFulfill({ value, cellCount: CELL_COUNT });
  const [props, getCellOnLayoutHandler] = useClearByFocusCell({
    value,
    setValue,
  });

  const rnBiometrics = new ReactNativeBiometrics();
  const [startscr, setstartscr] = useState("");
  const [isStart, SetIstart] = useState(false);
  //const startname = "Start2";
  //check biometrics
  useEffect(() => {
    rnBiometrics.isSensorAvailable().then((resultObject) => {
      const { available, biometryType } = resultObject;
      //   console.log("Biometric Support: ", available);
      if (available == false) {
        Setkey("@biometric", "0");
      } else {
        Setkey("@biometric", "1");
        if (available && biometryType === BiometryTypes.TouchID) {
          Setkey("@touchID", "1");
        } else if (available && biometryType === BiometryTypes.FaceID) {
          Setkey("@faceID", "1");
        } else if (available && biometryType === BiometryTypes.Biometrics) {
          //android

          Setkey("@biometricAndroid", "1");
        } else {
          console.log("Biometrics not supported");
        }
      }
    });
  }, []);
  // Hàm yêu cầu quyền thông báo
  const requestNotificationPermission = async () => {
    try {
      if (Platform.OS === 'android' && Platform.Version >= 33) {
        // Yêu cầu quyền POST_NOTIFICATIONS trên Android 13+
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
          {
            title: 'Yêu cầu quyền thông báo',
            message: 'Ứng dụng cần quyền thông báo để gửi các cập nhật quan trọng.',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Hủy',
            buttonPositive: 'Đồng ý',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Quyền thông báo được cấp trên Android');
          const token = await messaging().getToken();
          //console.log('FCM Token:', token);
        } else {
          console.log('Quyền thông báo bị từ chối trên Android');
          Alert.alert(
            'Quyền thông báo',
            'Vui lòng bật thông báo trong cài đặt để nhận cập nhật quan trọng.',
            [{ text: 'OK' }]
          );
        }
      } else {
        // Yêu cầu quyền trên iOS hoặc Android < 13
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;

        if (enabled) {
          console.log('Quyền thông báo được cấp:', authStatus);
          const token = await messaging().getToken();
          //c('FCM Token:', token);
        } else {
          console.log('Quyền thông báo bị từ chối');
          Alert.alert(
            'Quyền thông báo',
            'Vui lòng bật thông báo trong cài đặt để nhận cập nhật quan trọng.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Lỗi khi yêu cầu quyền thông báo:', error);
    }
  };
 function generateUUID(digits) {
    let str = '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVXZ';
    let uuid = [];
    for (let i = 0; i < digits; i++) {
        uuid.push(str[Math.floor(Math.random() * str.length)]);
    }
    return uuid.join('');
}

  //handle received notification
  useEffect(() => {
    // Kiểm tra và yêu cầu quyền khi ứng dụng khởi động
    const checkAndRequestPermission = async () => {
      // Kiểm tra trạng thái quyền
      const authStatus = await messaging().hasPermission();
      const isAndroid13Plus = Platform.OS === 'android' && Platform.Version >= 33;
      const androidPermission = isAndroid13Plus
        ? await PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS)
        : true; // Android < 13 không cần quyền runtime

      if (
        authStatus === messaging.AuthorizationStatus.NOT_DETERMINED ||
        (isAndroid13Plus && !androidPermission)
      ) {
        // Yêu cầu quyền nếu chưa được xác định
        await requestNotificationPermission();
      } else {
        // console.log('Trạng thái quyền hiện tại:', authStatus, 'Android Permission:', androidPermission);
      }
    };

    checkAndRequestPermission();
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      var value = JSON.stringify(remoteMessage);
      console.log("Remote message app", remoteMessage);

      var value1 = JSON.parse(value);

      var key = JSON.parse(JSON.stringify(value1.data)).key;
      var code = JSON.parse(JSON.stringify(value1.data)).code;
      if(code==="1") code=generateUUID(32);
      console.log('code',code);
      var notification = value1.notification;

      if (key == "0") {
        var otp_received = notification.body;

        global.otp = otp_received;
        console.log("------------OTP received----------", otp_received);
        setOTP(otp_received);
        setShowPopOTP(!showPopOTP);
      }

      if (key == "2") {
        await handleKey2SignNotification(remoteMessage);
      }

    
      if (key == "3") {
        LocalPush(i18n.t("appText2"));
        setloadingVisible(false);
        var value = JSON.stringify(remoteMessage);
        // console.log("Remote message", remoteMessage);
        var value1 = JSON.parse(value);
        var key = JSON.parse(JSON.stringify(value1.data)).key;
        var code = JSON.parse(JSON.stringify(value1.data)).code;
        var link = JSON.parse(JSON.stringify(value1.data)).linkfile;
        var tenfile = JSON.parse(JSON.stringify(value1.data)).file;
        var notification = value1.notification;
        var val = {
          key: key,
          Code: code,
          Linkfile_goc: link,
          TenVB: tenfile.split("_")[1],
          checked: false,
        };
        // RootNavigation.navigate("SignDone", { val: val, code: code });
      }

      if (key == "7") {
        LocalPush(notification.body);
        NetInfo.fetch().then(async (state) => {
          if (state.isConnected == true) {
            var dev_id = await AsyncStorage.getItem("@devid");
            var url =
              "https://apisign.nacencomm.vn/api/APISigncore/LaythongtinCTS_DeviceID_HSDT?device_id=" +
              dev_id;
            fetch(url, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify({}),
            })
              .then((response) => response.json())
              .then((responseJson) => {
                global.cn = responseJson.CN;
                global.diachi = responseJson.Diachi;
                global.Email = responseJson.Email;
                global.GoiDK = responseJson.GoiDK;
                global.HanGCN = responseJson.HanGCN;
                global.Masothue = responseJson.Masothue;
                global.NgayBD = responseJson.NgayBD;
                global.NgayKT = responseJson.NgayKT;
                setNgayKTState(responseJson.NgayKT);
                global.O_Cert = responseJson.O;
                global.Serial = responseJson.Serial;
                global.Sothang = responseJson.Sothang;
                global.id = responseJson.idcts;
                global.idcts = responseJson.idcts;
                if (responseJson.idcts != null) {
                  Setkey("@idcts", responseJson.idcts);
                  Setkey("@cn", responseJson.CN);
                }

                //  Setkey('@info',res);
              })
              .catch((error) => {
                console.error(error);
              });
          } else {
            console.log("No internet");
          }
        });
      }
    });
    return unsubscribe;
  }, []);

  // handle background notification 

  const createNo_internet = () =>
    Alert.alert(
      "CA2 REMOTE SIGNING",
      "Không có kết nối internet. Vui lòng thử lại sau",
      [{ text: "OK", onPress: () => console.log("OK Pressed") }]
    );

  const [isLoading, setLoading] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);

  const [showPopPin, setShowPopPin] = useState(false);
  const [batchSignMode, setBatchSignMode] = useState(false);

  useEffect(() => {
    const processKey2Notification = async (remoteMessage) => {
      if (localHashSign.takeNotification(remoteMessage.data?.code)) {
        return;
      }
      let code = remoteMessage.data?.code;
      if (code === "1") code = generateUUID(32);
      global.code = code;

      setTitle(i18n.t("appText1"));

      const batchOnce = await isBatchSignOnceEnabled();
      if (batchOnce) {
        setModalVisible(false);
        const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
        if (factor === "1") {
          try {
            const bioResult = await rnBiometrics.simplePrompt({
              promptMessage: "Xác thực sinh trắc học",
              cancelButtonText: i18n.t("cancelText"),
            });
            if (!bioResult.success) return;
          } catch (error) {
            console.log("biometrics failed:", error);
            return;
          }
        }
        setBatchSignMode(true);
        setValue("");
        setShowPopPin(true);
        return;
      }

      const xacthucnhanh = await AsyncStorage.getItem("@nhopincode");
      if (xacthucnhanh === "1") {
        const pin_store = await SecureStore.getItemAsync("PinCode");
        const state = await NetInfo.fetch();
        if (state.isConnected) {
          setLoading(true);
          try {
            const result = await batchSignDocuments(pin_store);
            if (result.successCount > 0) {
              LocalPush(i18n.t("kyloText3"));
              notifySignListRefresh(result);
            }
          } catch (error) {
            console.error(error);
          } finally {
            setLoading(false);
          }
        } else {
          createNo_internet();
        }
        return;
      }

      LocalPush(i18n.t("appText1"));
      setModalVisible(true);
    };

    registerKey2SignHandler(processKey2Notification);

    const unsubscribeOpened = messaging().onNotificationOpenedApp(
      (remoteMessage) => {
        if (remoteMessage) {
          showAlertFromMessage(remoteMessage);
        }
      }
    );

    messaging()
      .getInitialNotification()
      .then((remoteMessage) => {
        if (remoteMessage) {
          showAlertFromMessage(remoteMessage);
        }
      });

    return () => {
      registerKey2SignHandler(null);
      unsubscribeOpened();
    };
  }, [locale]);

  const [showPopOTP, setShowPopOTP] = useState(false);

  const [otp, setOTP] = useState("");

  const Stack = createStackNavigator();

  const mapPendingItem = (resItem, index) => ({
    key: index,
    Code: resItem.Code,
    Date_Req: moment(resItem.Date_Req).format("DD-MM-YYYY HH:mm"),
    Email: resItem.Email,
    Keyhethong: resItem.Keyhethong,
    Linkfile_goc: resItem.Linkfile_goc,
    idReq: resItem.idReq,
    TenVB: resItem.Keyhethong?.split("|")[3] || "",
    checked: false,
  });

  const GetDSChoky = async () => {
    const dev_id = global.UUID || (await AsyncStorage.getItem("@devid"));
    const idcts =
      global.id || global.idcts || (await AsyncStorage.getItem("@idcts"));
    if (!dev_id || !idcts) {
      return null;
    }

    try {
      const res = await getPendingSignList(dev_id, idcts, true);
      if (!Array.isArray(res) || res.length === 0) {
        return null;
      }
      if (global.code) {
        const index = res.findIndex((item) => item.Code === global.code);
        if (index >= 0) {
          return mapPendingItem(res[index], index);
        }
      }
      return mapPendingItem(res[0], 0);
    } catch (error) {
      console.error(error);
      return null;
    }
  };

  const startBatchSignOnceFlow = async () => {
    const factor = await AsyncStorage.getItem("@xacthuc2yeuto");
    if (factor === "1") {
      try {
        const bioResult = await rnBiometrics.simplePrompt({
          promptMessage: "Xác thực sinh trắc học",
          cancelButtonText: i18n.t("cancelText"),
        });
        if (!bioResult.success) {
          return false;
        }
      } catch (error) {
        console.log("biometrics failed:", error);
        return false;
      }
    }
    setModalVisible(false);
    setBatchSignMode(true);
    setValue("");
    setShowPopPin(true);
    return true;
  };

  const Kyngay = async () => {
    try {
      const batchOnce = await isBatchSignOnceEnabled();
      if (batchOnce) {
        await startBatchSignOnceFlow();
        return;
      }

      const item = await GetDSChoky();
      setModalVisible(false);
      if (!item) {
        notifyMessage("Không tìm thấy tài liệu cần ký. Vui lòng thử lại.");
        return;
      }
      navigate("KyTaiLieu", { item });
    } catch (error) {
      console.log(error);
      notifyMessage("Có lỗi xảy ra. Vui lòng thử lại.");
    }
  };

  const XacthucPin = () => {
    if (!value || value.length < 6) return;

    if (batchSignMode) {
      NetInfo.fetch().then(async (state) => {
        if (!state.isConnected) {
          createNo_internet();
          return;
        }
        setLoading(true);
        try {
          const result = await batchSignDocuments(value);
          setShowPopPin(false);
          setBatchSignMode(false);
          setValue("");
          if (result.successCount > 0) {
            LocalPush(i18n.t("kyloText3"));
            notifySignListRefresh(result);
          }
          if (result.failCount > 0) {
            notifyMessage(`${result.failCount} tài liệu không ký thành công`);
          }
        } catch (error) {
          notifyMessage("Có lỗi xảy ra. Vui lòng thử lại");
        } finally {
          setLoading(false);
        }
      });
      return;
    }

    NetInfo.fetch().then((state) => {
      if (state.isConnected == true) {
        var pin = value;
        var url =
          "https://apisign.nacencomm.vn/api/APISigncore/Ky_Mobilesign?Code=" +
          global.code +
          "&device_id=" +
          global.UUID +
          "&IDCTS=" +
          global.id +
          "&pincode=" +
          pin;
        fetch(url, {
          method: "POST",
          headers: {
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify({}),
        })
          .then((response) => response.json())
          .then((responseJson) => {
            if (responseJson == 1) {
              setloadingVisible(true);
              setTimeout(() => {
                setloadingVisible(false);
              }, 50000);
            } else if (responseJson == 0) {
              notifyMessage("Xác thực PIN không thành công");
            } else if (responseJson == -1) {
              notifyMessage("Có lỗi khi ký");
            } else if (responseJson == -2) {
              notifyMessage("Mã văn bản không hợp lệ");
            } else if (responseJson == -3) {
              notifyMessage("Mã PIN không đúng");
            } else if (responseJson == -4) {
              notifyMessage("Yêu cầu ký đã bị huỷ bỏ");
            } else {
              notifyMessage("Có lỗi xảy ra. Vui lòng thử lại");
            }
          })
          .catch((error) => {
            console.log("err:", error);
            Alert.alert(
              "CA2 Remote Signing",
              "Lỗi hệ thống. Vui lòng thử lại sau"
            );
          });
        setShowPopPin(!showPopPin);
      } else {
        createNo_internet();
      }
    });
  };

  useEffect(() => {
    AsyncStorage.getItem("@language").then(async (value) => {
      if (value != null) {
        global.language = value;
      } else {
        await AsyncStorage.setItem("@language", "vi");
      }
    });
  }, []);

  const navigationLogin = () => {
    setsessionModalvisible(false);
    RootNavigation.navigate("Login");
  };
  return (
    <ActionSheetProvider>
      <SafeAreaProvider>
        <LanguageProvider>
          <NavigationContainer ref={navigationRef} linking={LINKING_CONFIG}>
            <Stack.Navigator
              // initialRouteName={startScr}
              initialRouteName="Start2"
              screenOptions={{
                headerShown: false,
              }}
            >


              <Stack.Screen name="CCCDScanScreen" component={CCCDScanScreen} />
              <Stack.Screen name="ChupAnhCCCD" component={ChupAnhCCCD} />
              <Stack.Screen name="OCRData" component={OCRData} />
              <Stack.Screen name="ScanOCR" component={ScanOCR} />
              <Stack.Screen
                name="XacThucThongTin"
                component={XacThucThongTin}
              />
              <Stack.Screen name="HoanTatDangKy" component={HoanTatDangKy} />
              <Stack.Screen name="ViewFilePdf" component={ViewFilePdf} />
              <Stack.Screen
                name="ChipReadingScreen"
                component={ChipReadingScreen}
              />
              <Stack.Screen
                name="FaceVerificationScreen"
                component={FaceVerificationScreen}
              />
              <Stack.Screen
                name="ThongTinCCCDGanChip"
                component={ThongTinCCCDGanChip}
              />
              <Stack.Screen
                name="DonDangKySuDung"
                component={DonDangKySuDung}
              />



              <Stack.Screen name="StartLogin" component={StartLogin} />
              <Stack.Screen name="Login" component={Login} />
              <Stack.Screen name="Start2" component={Start2} />
              <Stack.Screen name="DangKy" component={DangKy} />
              <Stack.Screen name="DangKyHuongDan" component={DangKyHuongDan} />
              <Stack.Screen
                name="DangKyCaNhanThuocToChuc"
                component={DangKyCaNhanThuocToChuc}
              />
              <Stack.Screen name="ToChuc" component={ToChuc} />
              <Stack.Screen name="HomeWrapper" component={HomeWrapper} />
              <Stack.Screen
                name="QuanLyTaiLieuList"
                component={QuanLyTaiLieuList}
              />
              <Stack.Screen
                name="QuanLyTaiLieuDetail"
                component={QuanLyTaiLieuDetail}
              />
              <Stack.Screen name="KyTaiLieu" component={KyTaiLieu} />
              <Stack.Screen name="KyLoTaiLieu" component={KyLoTaiLieu} />
              <Stack.Screen name="PreviewPDF" component={PreviewPDF} />
              <Stack.Screen name="KyTaiLieuList" component={KyTaiLieuList} />
              <Stack.Screen name="QuanLyDangNhap" component={QuanLyDangNhap} />
              <Stack.Screen name="ListNotify" component={ListNotify} />
              <Stack.Screen name="OTP" component={OTP} />
              <Stack.Screen name="OTP_Done" component={OTP_Done} />
              <Stack.Screen name="SetupPin" component={SetupPin} />
              <Stack.Screen name="Kichhoat" component={Kichhoat} />

              <Stack.Screen name="ThongTinCTS" component={ThongTinCTS} />
              <Stack.Screen name="BaoMat" component={BaoMat} />
              <Stack.Screen name="DoiMaPIN" component={DoiMaPIN} />
              <Stack.Screen
                name="ThongTinGoiButKy"
                component={ThongTinGoiButKy}
              />
              <Stack.Screen
                name="LichSuCapChungThu"
                component={LichSuCapChungThu}
              />
              <Stack.Screen name="HoSo" component={HoSo} />
              <Stack.Screen name="GoiDichVu" component={GoiDichVu} />
              <Stack.Screen name="ThietLapChuKy" component={ThietLapChuKy} />
              <Stack.Screen name="ThanhToan" component={ThanhToan} />



              <Stack.Screen name="DangKyPasskey" component={DangKyPasskey} />
              <Stack.Screen name="WebViewScreen" component={WebViewScreen} />
              <Stack.Screen name="ViewSignedFile" component={ViewSignedFile} />
              <Stack.Screen name="KyFileVneId" component={KyFileVneId} />
              <Stack.Screen
                name="PDFViewer"
                getComponent={() => require("./screen/openpdf").default}
              />
            </Stack.Navigator>
          </NavigationContainer>

          <Modal
            animationType="slide"
            transparent={true}
            visible={modalVisible}
            onRequestClose={() => {
              //  Alert.alert("Modal has been closed.");ß
              setModalVisible(!modalVisible);
            }}
          >
            <View style={styles.container}>
              <View
                style={{
                  position: "absolute",
                  width: 327,
                  height: 200,
                  top: 239,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    height: 48,
                    left: 12,
                    top: 24,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                    fontWeight: "bold",
                  }}
                >
                  CA2 REMOTE SIGNING
                </Text>

                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    left: 12,
                    top: 58,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                  }}
                >
                  {i18n.t("appText1")}
                </Text>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 145,
                    height: 44,
                    left: 12,
                    top: 120,
                    backgroundColor: "red",
                    borderRadius: 8,
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                  onPress={() => {
                    setModalVisible(!modalVisible);
                    navigate("Home", {});
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    {i18n.t("cancelText")}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 145,
                    height: 44,
                    left: 170,
                    top: 120,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1858EA",
                    borderRadius: 8,
                  }}
                  onPress={Kyngay}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    {i18n.t("appText3")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          {/* Popup Pin */}

          <Modal
            animationType="slide"
            transparent={true}
            visible={showPopPin}
            onRequestClose={() => {
              //  Alert.alert(Modal has been closed.);
              setShowPopPin(!showPopPin);
            }}
          >
            <View style={styles.container}>
              <View
                style={{
                  position: "absolute",
                  width: windowWidth - 60,
                  height: 250,
                  top: 162,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 13,
                  alignItems: "center",
                  borderRadius: 13,
                }}
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 24,
                    height: 24,
                    left: 20,
                    top: 20,
                  }}
                  onPress={() => {
                    setBatchSignMode(false);
                    setShowPopPin(!showPopPin);
                  }}
                >
                  <Image
                    source={require("./img/close.png")}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    position: "relative",
                    height: 20,
                    fontSize: 18,
                    lineHeight: 20,
                    textAlign: "center",
                    color: "#0F172A",
                    top: 22,
                    fontWeight: "400",
                  }}
                >
                  {i18n.t("appText4")}
                </Text>

                <CodeField
                  ref={ref}
                  {...props}
                  value={value}
                  onChangeText={setValue}
                  cellCount={CELL_COUNT}
                  rootStyle={styles.codeFieldRoot}
                  keyboardType="number-pad"
                  textContentType={
                    Platform.OS === "ios" ? "none" : "oneTimeCode"
                  }
                  renderCell={renderCell}
                />
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: "90%",
                    height: 40,
                    top: 170,
                    backgroundColor: "#1959DC",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                  onPress={XacthucPin}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    {i18n.t("appText5")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          {/* Popup OTP */}

          <Modal
            animationType="slide"
            transparent={true}
            visible={showPopOTP}
            onRequestClose={() => {
              //  Alert.alert(Modal has been closed.);
              setShowPopOTP(!showPopOTP);
            }}
          >
            <View style={styles.container}>
              <View
                style={{
                  position: "absolute",
                  width: 375,
                  height: 250,
                  top: 162,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 13,
                  alignItems: "center",
                  borderRadius: 13,
                }}
              >
                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: 24,
                    height: 24,
                    left: 20,
                    top: 20,
                  }}
                  onPress={() => setShowPopOTP(!showPopOTP)}
                >
                  <Image
                    source={require("./img/close.png")}
                    style={{ width: 24, height: 24 }}
                  />
                </TouchableOpacity>
                <Text
                  style={{
                    position: "relative",
                    height: 20,
                    fontSize: 18,
                    lineHeight: 20,
                    textAlign: "center",
                    color: "#0F172A",
                    top: 22,
                    fontWeight: "400",
                  }}
                >
                  {i18n.t("appText6")}
                </Text>

                {/* <CodeField
              ref={ref}
              {...props}
              value={otp}
              onChangeText={setOTP}
              cellCount={CELL_COUNT}
              rootStyle={styles.codeFieldRootOTP}
              keyboardType="number-pad"
              textContentType="oneTimeCode"
              renderCell={({index, symbol, isFocused}) => (
                <Text
                  key={index}
                  style={[styles.cell, isFocused && styles.focusCell]}
                  onLayout={getCellOnLayoutHandler(index)}>
                  {symbol || (isFocused ? <Cursor /> : null)} 
                </Text>
              )} disable={false}
            /> */}
                <View
                  style={{
                    alignContent: "center",
                    margin: "auto",
                    justifyContent: "center",
                  }}
                >
                  {/* <Text style={{width:'100%',top:35,margin:'auto'}}>Mã OTP của quý khách là</Text> */}
                  <Text
                    style={{
                      fontWeight: "500",
                      fontSize: 45,
                      letterSpacing: 20,
                      width: "100%",
                      //top: 55,
                      margin: "auto",
                      color: "#0F172A"
                    }}
                  >
                    {otp}
                  </Text>
                </View>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: "90%",
                    height: 40,
                    top: 180,
                    backgroundColor: "#1959DC",
                    alignItems: "center",
                    justifyContent: "center",
                    borderRadius: 8,
                  }}
                  onPress={() => {
                    setShowPopOTP(!showPopOTP);
                  }}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    {" "}
                    {i18n.t("appText7")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={loadingVisible}
            onRequestClose={() => {
              //  Alert.alert("Modal has been closed.");ß
              setModalVisible(!loadingVisible);
            }}
          >
            <View style={styles.container}>
              <View
                style={{
                  position: "absolute",
                  width: 327,
                  height: 160,
                  top: 239,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    height: 48,
                    left: 12,
                    top: 24,
                    fontSize: 20,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                    fontWeight: "bold",
                  }}
                >
                  CA2 REMOTE SIGNING
                </Text>

                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    height: 48,
                    left: 12,
                    top: 58,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                  }}
                >
                  {i18n.t("pinvalidText1")}.{"\n"}
                  {i18n.t("pinvalidText2")}
                </Text>

                <ActivityIndicator size="large" style={{ top: 110 }} />
              </View>
            </View>
          </Modal>

          <Modal
            animationType="slide"
            transparent={true}
            visible={sessionModalvisible}
            onRequestClose={() => {
              //  Alert.alert("Modal has been closed.");ß
              setsessionModalvisible(!sessionModalvisible);
            }}
          >
            <View style={styles.container}>
              <View
                style={{
                  position: "absolute",
                  width: 327,
                  height: 200,
                  top: 239,
                  backgroundColor: "#FFFFFF",
                  borderRadius: 8,
                  alignItems: "center",
                }}
              >
                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    height: 48,
                    left: 12,
                    top: 24,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                    fontWeight: "bold",
                  }}
                >
                  CA2 REMOTE SIGNING
                </Text>

                <Text
                  style={{
                    position: "absolute",
                    width: 297,
                    height: 48,
                    left: 12,
                    top: 58,
                    fontSize: 16,
                    lineHeight: 24,
                    textAlign: "center",
                    color: "#111827",
                  }}
                >
                  {i18n.t("SessionEndText")}
                </Text>

                <TouchableOpacity
                  style={{
                    position: "absolute",
                    width: "90%",
                    height: 44,
                    top: 130,
                    alignItems: "center",
                    justifyContent: "center",
                    backgroundColor: "#1858EA",
                    borderRadius: 8,
                  }}
                  onPress={navigationLogin}
                >
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      textAlign: "center",
                      color: "#fff",
                    }}
                  >
                    {i18n.t("acceptButton")}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Dialog
            title={titleDialogHanCTS}
            message={messageDialogHanCTS}
            buttonText={buttonTextDialogHanCTS}
            visible={dialogHanCTSVisible}
            onClose={() => setDialogHanCTSVisible(false)}
            onClickButton={actionFunction == 1 ? handleMuaThemCKS : handleCallSupport}
            iconName={iconNameCTS}
          />
        </LanguageProvider>
      </SafeAreaProvider>
    </ActionSheetProvider>
  );
}

const styles = StyleSheet.create({
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    height: "100%",
    // marginTop: 30,
  },

  root: { flex: 1, padding: 20 },
  title: { textAlign: "center", fontSize: 30 },

  codeFieldRoot: {
    marginTop: 20,
    top: 50,
    position: "absolute",
    width: windowWidth - 60,
    marginLeft: "auto",
    marginRight: "auto",
  },
  cellRoot: {
    width: (windowWidth - 100) / 6,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    margin: 2,
  },
  cellText: {
    color: "#000",
    fontSize: 36,
    textAlign: "center",
  },
  focusCell: {
    borderBottomColor: "#007AFF",
    borderBottomWidth: 2,
  },
  //================= OTP FIELD
  codeFieldRootOTP: {
    marginTop: 20,
    top: 50,
    position: "absolute",
    width: 300,
    marginLeft: "auto",
    marginRight: "auto",
  },
  cellRootOTP: {
    width: 60,
    height: 60,
    justifyContent: "center",
    alignItems: "center",
    borderBottomColor: "#ccc",
    borderBottomWidth: 1,
    margin: 2,
  },
});
