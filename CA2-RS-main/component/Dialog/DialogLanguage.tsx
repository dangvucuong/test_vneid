import { memo, useEffect, useState } from "react";
import {
  Dimensions,
  FlatList,
  Image,
  Modal,
  Pressable,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Fontisto, Feather } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const DialogLanguage = ({
  onClose,
  visible,
  data,
  paddingBottomWrapper,
  i18n,
}: {
  onClose: any;
  visible: boolean;
  data: any;
  paddingBottomWrapper?: number;
  i18n: any;
}) => {
  const widthFull = Dimensions.get("window").width; //full width
  const heightFull = Dimensions.get("window").height; //full height
  const [active, setActive] = useState("en");

  useEffect(() => {
    const getActive = async () => {
      try {
        const aloha = await AsyncStorage.getItem("@language");
        setActive(aloha);
      } catch (error) {
        setActive("en");
      }
    };

    getActive();
  }, []);

  return (
    <Modal
      transparent
      visible={visible}
      animationType="slide"
      onRequestClose={() => {
        onClose(!visible);
      }}
    >
      <View
        style={{
          width: widthFull,
          height: heightFull,
          backgroundColor: "rgba(0,0,0,0.5)",
          justifyContent: "flex-end",
        }}
      >
        <View
          style={{
            backgroundColor: "#fff",
            width: widthFull,
            paddingBottom: paddingBottomWrapper ? paddingBottomWrapper : 140,
            position: "relative",
          }}
        >
          <TouchableOpacity
            style={{
              width: 50,
              height: 50,
              position: "absolute",
              right: 10,
              top: -60,
              backgroundColor: "#fff",
              borderRadius: 50,
              justifyContent: "center",
              alignItems: "center",
            }}
            onPress={onClose}
          >
            <Fontisto name="close-a" size={20} color="black" />
          </TouchableOpacity>

          <Text
            style={{
              fontSize: 16,
              lineHeight: 24,
              color: "#0F172A",
              marginLeft: 16,
              paddingVertical: 20,
              textAlign: "center",
              fontWeight: "300",
            }}
          >
            {i18n.t("selectLanguage")}
          </Text>

          <FlatList
            data={data}
            keyExtractor={(item) => item.key}
            renderItem={({ item }: { item: any }) => (
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    paddingVertical: 24,
                    width: "100%",
                    backgroundColor: active === item.key ? "#EAF0FA" : "#fff",
                  }}
                  onPress={() => {
                    setActive(item.key);
                    item.onPress();
                  }}
                >
                  <View
                    style={{
                      width: "100%",
                      justifyContent: "space-between",
                      display: "flex",
                      flexDirection: "row",
                      alignItems: "center",
                    }}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        lineHeight: 20,
                        color: "#0F172A",
                        marginLeft: 16,
                        fontWeight: "400",
                      }}
                    >
                      {item?.title}
                    </Text>
                    <View
                      style={{
                        width: 24,
                        height: 24,
                      }}
                    >
                      {active === item.key && (
                        <Feather name="check" size={24} color="green" />
                      )}
                    </View>
                  </View>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default memo(DialogLanguage);
