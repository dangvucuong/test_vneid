import { I18n } from "i18n-js";
import { en, vi } from "../localize";
import { useEffect, useState, Platform } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { ActionSheetIOS } from "react-native";

const lang = ["vi", "en"];

const useI18n = () => {
  const [i18n] = useState(new I18n());
  const [locale, setLocale] = useState(null);
  i18n.translations = { en, vi };
  i18n.fallback = locale === "vi";
  i18n.locale = locale || "vi";

  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) setLocale(value);
    });
  }, []);

  const ChangeNgonngu = async () => {
    if (Platform.OS === "ios") {
      ActionSheetIOS.showActionSheetWithOptions(
        {
          options: [i18n.t("cancel_text"), "Tiếng Việt", "English"],
          cancelButtonIndex: 0,
          userInterfaceStyle: "light",
        },
        async (buttonIndex) => {
          if (buttonIndex === 0) {
          } else if (buttonIndex === 1) {
            setLocale("vi");
            await AsyncStorage.setItem("@language", "vi");
          } else if (buttonIndex === 2) {
            setLocale("en");
            await AsyncStorage.setItem("@language", "en");
          }
        }
      );
    }
    if (Platform.OS === "android") {
      const nextLng = lang.find((item) => item !== locale);
      setLocale(nextLng);
      await AsyncStorage.setItem("@language", nextLng);
    }
  };

  return { i18n, locale, ChangeNgonngu, setLocale };
};
const i18n = new I18n();
i18n.translations = { en, vi };

export { useI18n, i18n };
