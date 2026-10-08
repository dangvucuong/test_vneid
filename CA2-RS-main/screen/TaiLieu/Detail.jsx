import React, { useEffect, useState } from "react";
import {
  Linking,
  Modal,
  Share,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ScrollView,
} from "react-native";
import Pdf from "react-native-pdf";
import { useI18n } from "../../utils/i18n";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";
import { Image } from "react-native";
import TienTrinhKy from "../component/TienTrinhKy";
import NetInfo from "@react-native-community/netinfo";
import moment from "moment";
import { Buffer } from "buffer";
import * as x509 from "@peculiar/x509";
import { MaterialIcons } from '@expo/vector-icons';
const CATEGORY = [
  { id: "1", label: "document.detail" },
  { id: "2", label: "document.info" },
];

export default function QuanLyTaiLieuDetail({ navigation, route }) {
  const { i18n, locale } = useI18n();
  const [active, setActive] = useState(CATEGORY[0].id);
  const { item } = route.params;
  const [openModal, setOpenModal] = useState(false);
  const [dbdaky, setdbdaky] = useState([]);
  const [detail, setDetail] = useState({});
  const [tenChungThu, setTenChungThu] = useState("");
  const [chiTietChungThu, setChiTietChungThu] = useState("");
  const [isDetailVisible, setIsDetailVisible] = useState(false); // State để theo dõi trạng thái hiển thị

  const toggleDetail = () => {
    setIsDetailVisible(!isDetailVisible); // Chuyển đổi trạng thái khi nhấn
  };
  const sign = dbdaky[dbdaky.length - 1];
  const downloadFile = async () => {
    Linking.openURL(item.Linkfile_signed);
  };
  const onShare = async () => {
    try {
      const result = await Share.share({
        message: item.Linkfile_signed,
      });
      if (result.action === Share.sharedAction) {
      } else if (result.action === Share.dismissedAction) {
      }
    } catch (error) {
      Alert.alert(error.message);
    }
  };
  useEffect(() => {
    const getCert = async () => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected == true) {
          var url =
            "https://apisign.nacencomm.vn/api/APISigncore/Laycert_Serial?serial=" +
            global.Serial;

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
              if (responseJson) {
                // let response =
                //   "MIIFijCCBHKgAwIBAgIQVAK8XKzOZpwgIwAAAAAF6jANBgkqhkiG9w0BAQsFADA2MQswCQYDVQQGEwJWTjEWMBQGA1UECgwNTkFDRU5DT01NIFNDVDEPMA0GA1UEAwwGQ0EyIFJTMB4XDTIzMDkzMDA5MDgzOFoXDTI0MTAwNTA5MDgzOFowggEoMQswCQYDVQQGEwJWTjEfMB0GA1UECAwWVGjDoG5oIHBo4buRIEjDoCBO4buZaTEyMDAGA1UEBwwpU+G7kSAyNSBMw6ogVsSDbiBUaGnDqm0gLSBUaGFuaCBYdcOibiAtSE4xIjAgBgoJkiaJk/IsZAEBDBJNU1Q6MDEwMzkzMDI3OS05OTkxPzA9BgNVBAoMNkPDtG5nIHR5IGPhu5UgcGjhuqduIGPDtG5nIG5naOG7hyB0aOG6uyBOYWNlbmNvbW0gVGVzdDEeMBwGCSqGSIb3DQEJARYPaGFuZ2R0dEBjYXZuLnZuMT8wPQYDVQQDDDZDw7RuZyB0eSBj4buVIHBo4bqnbiBjw7RuZyBuZ2jhu4cgdGjhursgTmFjZW5jb21tIFRlc3QwggEiMA0GCSqGSIb3DQEBAQUAA4IBDwAwggEKAoIBAQDgLFZ46l5I6WMfqFI2zHL1+W19pGu7Hr/dohV7z47OZYJzDcaUJ+8wnMX2TNe/MIpg8udIiKJ888XBUxfmZknWlP4GFqlsvhPyWsWBnEw3NCClz2VB9R3TYJj8qh9QY4F6Xxdilgpgza9QZ91+Dz2OkQdtxH38xpX9huCsida2bCaUNAZRBcTS8bqPbcWaqozi5rkYAWWQ6tr7n5yJdYELiHwwxj56du9i0C3ddY7S+YXoN3HvAymORgzIEYzs9vtufFHvov3Yt584m7xdqXkd5UOH2DG95FVY5mkDAjERtzzsAmHX2XNaHO0a8Jp5h5sU7OlQculeFJhtSVviKDpzAgMBAAGjggGeMIIBmjAiBgNVHSUBAf8EGDAWBggrBgEFBQcDBAYKKwYBBAGCNwoDDDAdBgNVHQ4EFgQUH+ncq7mHcC56MdYA3Fz8R6sBUmgwDgYDVR0PAQH/BAQDAgXgMB8GA1UdIwQYMBaAFJNOP2ZqbMcl+srb2aniRDudU3dZMDQGA1UdHwQtMCswKaAnoCWGI2h0dHA6Ly9jYTJjcmwuY2F2bi52bi9uZXdycy9jYTIuY3JsMDsGCCsGAQUFBwEBBC8wLTArBggrBgEFBQcwAYYfaHR0cDovL29jc3Bycy5jYXZuLnZuL29jc3Avb2NzcDA9BgkrBgEEAYI3FQcEMDAuBiYrBgEEAYI3FQiBtKEjhZyKJoPpjzCE9LAsq6hagXyGyek4h4arVQIBZAIBBDAsBgkrBgEEAYI3FQoBAf8EHDAaMAoGCCsGAQUFBwMEMAwGCisGAQQBgjcKAwwwRAYJKoZIhvcNAQkPBDcwNTAOBggqhkiG9w0DAgICAIAwDgYIKoZIhvcNAwQCAgCAMAcGBSsOAwIHMAoGCCqGSIb3DQMHMA0GCSqGSIb3DQEBCwUAA4IBAQC6S3F4+LZU2d1bPm8GdzzYS2msf3JhXXQrC+qIZ3MggAI4XInkgumX7Hl3PmPXBtfI0mi+AsGoOShTJ1QgHNdyi6FNY57x/UXRKe9VyWfWdEpH7XKMlkYZgFbbcfIcMFWHQXeA7+2ALM680pFWpZMQHDt+K00iljhgPm4ODrFW6KU22xtb9dAYQrVQje1JgnLMunkVeuCNxovdGNP5x6Y/nF32LJ8wnkRNtQRIZIlCKHWacJHlHa2XoFIavGSqjW8M1q5CwEerY1SwWe4yNi8s5ulkcmNJoqpPh2ZWWO/ckCpEYHd09tyx6Lt6Euzk+/NglKdhzYB6GWfifL4Lfft+";
                // Bước 1: Chuyển đổi chuỗi base64 thành mảng byte
                global.Buffer = global.Buffer || Buffer;
                const cert = new x509.X509Certificate(responseJson);
                const subject = cert.subject;
                const formattedSubject = subject.replace(
                  /, (?![^\[]*?\\)/g,
                  "\n"
                );
                setChiTietChungThu(formattedSubject);
                const CN = subject.match(/CN=([^,]+)/);
                setTenChungThu(CN ? CN[1] : "");
              } else {
                console.error("Không có thông tin chứng thư số");
              }
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    };
    getCert();
  }, []);

  useEffect(() => {
    const getData = async () => {
      NetInfo.fetch().then(async (state) => {
        if (state.isConnected == true) {
          var url =
            "https://apisign.nacencomm.vn/api/APISigncore/LayDSChuky_2024?code=" +
            item.Code;
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
              var obj = JSON.parse(responseJson);
              const res = obj?.[0] || {};
              console.log(res);
              const item = {
                MaCode: res.Keyhethong?.split("|")?.[0],
                TenChungThu: res.Email?.split("|")?.[1],
                ThoiGianKy: moment(res.Thoigianhoantat).format(
                  "DD-MM-YYYY HH:mm"
                ),
                Trangthaiky: res.Trangthaiky,
              };
              setDetail(item);
            })
            .catch((error) => {
              console.error(error);
            });
        }
      });
    };
    getData();
  }, []);
  const dataTrangThaiKy = {
    0: {
      text: i18n.t("trangthaiki.t0"),
      type: "waiting",
    },
    1: {
      text: i18n.t("trangthaiki.t1"),
      type: "approve",
    },
    2: {
      text: i18n.t("trangthaiki.t2"),
      type: "reject",
    },
    "-1": {
      text: i18n.t("trangthaiki.tam1"),
      type: "reject",
    },
    "-2": {
      text: i18n.t("trangthaiki.tam2"),
      type: "reject",
    },
    7: {
      text: i18n.t("trangthaiki.t7"),
      type: "reject",
    },
  };
  return (
    <PageContainer>
      <Modal transparent={true} visible={openModal}>
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
                {item.TenVB}
              </Text>
              <Text style={{ lineHeight: 16, color: "#6B7280", fontSize: 12 }}>
                {item.Date_Signed}
              </Text>
            </View>
            <TouchableOpacity style={styles.modalAction} onPress={downloadFile}>
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
            <TouchableOpacity style={styles.modalAction} onPress={onShare}>
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
        title={item.TenVB}
        onBack={() => navigation.goBack()}
        onDetail={() => setOpenModal(true)}
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
        <ScrollView
          style={{ flex: 1, backgroundColor: "#E5E5E5", marginTop: 4 }}
          contentContainerStyle={{ gap: 4, flex: 1 }}
        >
          {active === "1" && (
            <>
              <Pdf
                trustAllCerts={false}
                source={{
                  uri: encodeURI(item.Linkfile_signed),
                  cache: true,
                }}
                style={styles.pdf}
              />
            </>
          )}
          {active === "2" && (
            <>
              <View
                style={{
                  gap: 12,
                  width: "100%",
                  padding: 16,
                  backgroundColor: "#ffffff",
                }}
              >
                <View style={styles.detail}>
                  <Text style={styles.detailText}>
                    {i18n.t("document.detail_field.request_code")}:
                  </Text>
                  <Text
                    style={[styles.detailText, styles.detailRight]}
                    numberOfLines={1}
                  >
                    {detail.MaCode}
                  </Text>
                </View>
                {/* <View style={styles.detail}>
                  <Text style={styles.detailText}>
                    {i18n.t("document.detail_field.cts")}:
                  </Text>
                  <Text style={[styles.detailText, styles.detailRight]}>
                    {detail.TenChungThu}
                  </Text>
                </View> */}
                <View style={styles.detail}>
                  <Text style={styles.detailText}>
                    {i18n.t("document.detail_field.domain")}:
                  </Text>
                  <Text style={[styles.detailText, styles.detailRight]}>
                    Ca2.SignPlatform
                  </Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailText}>
                    {i18n.t("document.detail_field.time")}:
                  </Text>
                  <Text style={[styles.detailText, styles.detailRight]}>
                    {detail.ThoiGianKy}
                  </Text>
                </View>
                <View style={styles.detail}>
                  <Text style={styles.detailText}>
                    {i18n.t("document.detail_field.status")}:
                  </Text>
                  <Text
                    style={[
                      styles.badge_text,
                      dataTrangThaiKy[detail.Trangthaiky]?.type === "reject"
                        ? styles.reject
                        : dataTrangThaiKy[detail.Trangthaiky]?.type ===
                          "waiting"
                        ? styles.waiting
                        : styles.approved,
                    ]}
                  >
                    {dataTrangThaiKy[detail.Trangthaiky]?.text}
                  </Text>
                </View>
                <View>
                  {/* Nút "Chi tiết chữ ký" hoặc "Thu gọn" */}
                  <TouchableOpacity
                    onPress={toggleDetail}
                    style={{ flexDirection: "row", alignItems: "center" }}
                  >
                    <Text style={styles.detailText}>
                      {
                        isDetailVisible
                          ? i18n.t("document.detail_field.thu_gon") // Văn bản "Thu gọn"
                          : i18n.t("document.detail_field.chi_tiet_chu_ky") // Văn bản "Chi tiết chữ ký"
                      }
                    </Text>
                    <MaterialIcons
                      name={
                        isDetailVisible
                          ? "keyboard-arrow-up"
                          : "keyboard-arrow-down"
                      } // Biểu tượng thay đổi theo trạng thái
                      size={24}
                      color="#000"
                    />
                  </TouchableOpacity>

                  {/* Phần chi tiết chỉ hiển thị khi isDetailVisible là true */}
                  {isDetailVisible && (
                    <View
                      style={{
                        gap: 12,
                        width: "100%",
                        padding: 16,
                        backgroundColor: "#ffffff",
                      }}
                    >
                      {/* Thêm thông tin chủ thu */}
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>Tên chứng thư:</Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {tenChungThu || ""}
                        </Text>
                      </View>

                      {/* Thêm đơn vị cấp */}
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>Đơn vị cấp:</Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {"CA2 RS - NACENCOMM JSC"}
                        </Text>
                      </View>

                      {/* Thêm Serial Number */}
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>Số Serial:</Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {detail.Serial || "54010C79AE328C7B80963C18EBDBFB5"}
                        </Text>
                      </View>

                      {/* Thêm thời gian hiệu lực */}
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>
                          Thời gian hiệu lực từ:
                        </Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {global.NgayBD || ""}
                        </Text>
                      </View>
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>
                          Thời gian hiệu lực đến:
                        </Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {global.NgayKT || ""}
                        </Text>
                      </View>

                      {/* Thêm thông tin người gửi */}
                      <View style={styles.detail}>
                        <Text style={styles.detailText}>
                          Chi tiết chứng thư:
                        </Text>
                        <Text style={[styles.detailText, styles.detailRight]}>
                          {chiTietChungThu || ""}
                        </Text>
                      </View>
                    </View>
                  )}
                  {/* Các thành phần khác nếu có */}
                </View>
              </View>
              <TienTrinhKy dbdaky={dbdaky} />
            </>
          )}
        </ScrollView>
      </View>
    </PageContainer>
  );
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
  detail: {
    flexDirection: "row",
    gap: 12,
    alignItems: "center",
  },
  detailText: {
    maxWidth: "50%",
    fontSize: 13,
    lineHeight: 24,
    color: "#6B7280",
    width: 160,
  },
  detailRight: {
    fontWeight: "600",
    flex: 1,
  },
  sign_item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomColor: "#DDE3EB",
    borderBottomWidth: 1,
    flexDirection: "row",
  },
  badge: {
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
    justifyContent: "center",
    height: 20,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 6,
  },
  approved: {
    color: "green",
  },
  not_approved: {
    color: "#DC2626",
  },
  waiting: {
    color: "#334155",
  },
  reject: {
    color: "#DC2626",
  },
  badge_text: {
    fontSize: 12,
    lineHeight: 16,
    color: "#334155",
    fontWeight: "600",
  },
  pdf: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
