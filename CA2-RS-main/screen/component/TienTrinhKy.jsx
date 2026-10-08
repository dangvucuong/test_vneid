import NetInfo from "@react-native-community/netinfo";
import React, { useEffect, useState } from "react";
import { Image, StyleSheet, Text, View } from "react-native";
import { useI18n } from "../../utils/i18n";
import moment from "moment";

export default function TienTrinhKy({ dbdaky }) {
  const { i18n, locale } = useI18n();

  if (dbdaky.length === 0) {
    return null;
  }
  const num = dbdaky.filter(
    (sign) => sign.Trangthaiky_File === 1 && sign.Trangthaiverify === 1
  ).length;
  return (
    <View
      style={{
        gap: 16,
        width: "100%",
        padding: 16,
        backgroundColor: "#ffffff",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", lineHeight: 24 }}>
        {i18n.t("document.tien_trinh_ky")}
      </Text>
      <Text style={{ fontSize: 12, lineHeight: 16 }}>
        {i18n.t("document.ky_hop_le", { num: num, total: dbdaky.length })}
      </Text>
      <View style={{ width: "100%" }}>
        {dbdaky.map((sign, index) => {
          const lastItem = index === dbdaky.length - 1;
          return (
            <View
              style={[
                styles.sign_item,
                { borderBottomWidth: lastItem ? 0 : 1 },
              ]}
              key={index}
            >
              <View
                style={{
                  backgroundColor: "#EDF1F5",
                  width: 24,
                  height: 22,
                  borderRadius: 6,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Text
                  style={{ fontSize: 12, fontWeight: "500", color: "#334155" }}
                >
                  {sign.Trinhtuky}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 16, marginRight: 4, gap: 2 }}>
                <Text
                  style={{
                    fontSize: 14,
                    lineHeight: 20,
                    fontWeight: "600",
                    color: "#0F172A",
                  }}
                >
                  {sign.Hoten}
                </Text>
                <Text
                  style={{ fontSize: 12, lineHeight: 16, color: "#6B7280" }}
                >
                  {sign.Taikhoanky}
                </Text>

                {sign.Ngayky_File && (
                  <Text
                    style={{ fontSize: 12, lineHeight: 16, color: "#6B7280" }}
                  >
                    {i18n.t("document.sign_time", { time: sign.Ngayky_File })}
                  </Text>
                )}
              </View>
              <View style={{ height: "100%" }}>
                {sign.Trangthaiky_File === 1 && sign.Trangthaiverify === 1 && (
                  <View style={[styles.badge, styles.approved]}>
                    <Image
                      source={require("../../img/CheckGreen.png")}
                      style={{ width: 12, height: 12 }}
                    />
                    <Text style={styles.badge_text}>
                      {i18n.t("document.sign_approved")}
                    </Text>
                  </View>
                )}
                {sign.Trangthaiky_File === 1 && sign.Trangthaiverify === 0 && (
                  <View style={[styles.badge, styles.not_approved]}>
                    <Image
                      source={require("../../img/RedCheck.png")}
                      style={{ width: 12, height: 12 }}
                    />
                    <Text style={[styles.badge_text, styles.not_approved]}>
                      {i18n.t("document.sign_not_approved")}
                    </Text>
                  </View>
                )}
                {!sign.Singnaturefield && (
                  <View style={[styles.badge, styles.not_approved]}>
                    <Image
                      source={require("../../img/RedX.png")}
                      style={{ width: 12, height: 12 }}
                    />
                    <Text style={[styles.badge_text, styles.not_approved]}>
                      {i18n.t("document.sign_rejected")}
                    </Text>
                  </View>
                )}
                {sign.Trangthaiky_File === 0 && sign.Trangthaiverify === 0 && (
                  <View style={[styles.badge, styles.waiting]}>
                    <Image
                      source={require("../../img/ClockSmall.png")}
                      style={{ width: 12, height: 12 }}
                    />
                    <Text style={[styles.badge_text, styles.waiting]}>
                      {i18n.t("document.sign_waiting")}
                    </Text>
                  </View>
                )}
              </View>
            </View>
          );
        })}
      </View>
    </View>
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
  },
  detailText: {
    maxWidth: "50%",
    fontSize: 13,
    lineHeight: 24,
    color: "#6B7280",
    width: 120,
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
    alignItems: "center",
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
    backgroundColor: "#DBF5E5",
  },
  not_approved: {
    backgroundColor: "#FDE0E0",
    color: "#DC2626",
  },
  waiting: {
    backgroundColor: "#EDF1F5",
  },
  badge_text: {
    fontSize: 12,
    lineHeight: 16,
    fontWeight: "600",
  },
  pdf: {
    flex: 1,
    backgroundColor: "#fff",
  },
});
