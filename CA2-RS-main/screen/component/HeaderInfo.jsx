import AsyncStorage from "@react-native-async-storage/async-storage";
import { useIsFocused, useNavigation } from "@react-navigation/native";
import * as ImagePicker from "expo-image-picker";
import { useEffect, useState } from "react";
import { Image, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useI18n } from "../../utils/i18n";
import { hitSlop, hitSlopSmall } from "../../utils/constant";
import { useActionSheet } from "@expo/react-native-action-sheet";

const defaultAvatar = require("../../img/UserAvatar.png");

export default function HeaderInfo({ userData, showNotify, onClickRefresh }) {
  const { showActionSheetWithOptions } = useActionSheet();

  const { i18n, locale, setLocale } = useI18n();

  const navigation = useNavigation();
  const onClickNotify = () => navigation.navigate("ListNotify");

  const [pic, setPic] = useState(defaultAvatar);
  const isFocused = useIsFocused();
  const RefreshAll = () => {
    AsyncStorage.getItem("@avatar").then((value) => {
      if (value != null) {
        setPic({ uri: value });
      } else {
        setPic(defaultAvatar);
      }
    });
  };

  useEffect(() => {
    // Call only when screen open or when back on screen
    if (isFocused) {
      RefreshAll();
    }
  }, [isFocused]);
  const ChangeAvatar = () => {
    const options = [i18n.t("cancelText"), i18n.t("taikhoantext14"), "Camera"];
    const destructiveButtonIndex = 0;
    const cancelButtonIndex = 2;
    showActionSheetWithOptions(
      {
        options,
        cancelButtonIndex,
        destructiveButtonIndex,
      },
      (buttonIndex) => {
        if (buttonIndex === 0) {
          // cancel action
        } else if (buttonIndex === 1) {
          pickImage();
        } else if (buttonIndex === 2) {
          pickImageFromCamera();
        }
      }
    );
  };
  const pickImage = async () => {
    // No permissions request is necessary for launching the image library
    let result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.All,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      setPic({ uri: result.assets[0].uri });
      await AsyncStorage.setItem("@avatar", result.assets[0].uri);
      let check = await AsyncStorage.getItem("@avatar");
      console.log(check);
    }
  };

  const pickImageFromCamera = async () => {
    const resultpermision = await ImagePicker.requestCameraPermissionsAsync();
    if (resultpermision.granted === false) {
      alert(i18n.t("taikhoantext15"));
    } else {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.All,
        allowsEditing: true,
        aspect: [4, 3],
        quality: 1,
      });

      if (!result.canceled) {
        setPic({ uri: result.assets[0].uri });
        await AsyncStorage.setItem("@avatar", result.assets[0].uri);
        let check = await AsyncStorage.getItem("@avatar");
        console.log(check);
      }
    }
  };
  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={ChangeAvatar} hitSlop={hitSlop}>
        <Image style={styles.avatar} source={pic} />
      </TouchableOpacity>
      <View style={{ flex: 1, gap: 2 }}>
        <Text style={{ color: "#0F172A", fontWeight: "600" }}>{global.cn}</Text>
        <Text style={{ color: "#475569", fontSize: 12 }}>
          ID: {global.idcts}
        </Text>
      </View>
      <View style={styles.buttonGroup}>
        {showNotify && (
          <TouchableOpacity
            style={styles.icon}
            onPress={onClickNotify}
            hitSlop={hitSlopSmall}
          >
            <Image source={require("../../img/Bell.png")} style={styles.icon} />
            {false && <View style={styles.dot} />}
          </TouchableOpacity>
        )}
        {/* <TouchableOpacity
          style={styles.icon}
          onPress={onClickRefresh}
          hitSlop={hitSlopSmall}
        >
          <Image
            source={require("../../img/UserSwitch.png")}
            style={styles.icon}
          />
        </TouchableOpacity> */}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#ffffff",
    padding: 16,
    gap: 8,
    width: "100%",
    flexDirection: "row",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 16,
    alignSelf: "center",
  },
  avatar: {
    width: 32,
    height: 32,
  },
  icon: {
    width: 24,
    height: 24,
  },
  dot: {
    position: "absolute",
    bottom: 0,
    right: 0,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#DC2626",
  },
});
