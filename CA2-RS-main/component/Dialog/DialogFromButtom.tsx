import { memo } from "react";
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
import { Fontisto } from "@expo/vector-icons";
import CustomDiviver from "../Diviver/CustomDiviver";

const DialogFromButtom = ({
  onClose,
  visible,
  data,
  paddingBottomWrapper,
}: {
  onClose: any;
  visible: boolean;
  data: any;
  paddingBottomWrapper?: number;
}) => {
  const widthFull = Dimensions.get("window").width; //full width
  const heightFull = Dimensions.get("window").height; //full height

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
            padding: 8,
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
          <FlatList
            data={data}
            keyExtractor={(item) => item.key}
            renderItem={({ item }: { item: any }) => (
              <View>
                <TouchableOpacity
                  style={{
                    flexDirection: "row",
                    paddingHorizontal: 20,
                    paddingVertical: 20,
                    width: "100%",
                    backgroundColor: "#FFFFFF",
                  }}
                  onPress={() => {
                    item?.onPress();
                  }}
                >
                  {item?.imageSrc && (
                    <Image
                      source={item?.imageSrc}
                      style={{
                        width: 40,
                        height: 40,
                      }}
                    />
                  )}

                  <View
                    style={{
                      width: "100%",
                      justifyContent: "center",
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
                  </View>
                </TouchableOpacity>
                {item?.divider && <CustomDiviver style={item?.styleDivider} />}
              </View>
            )}
          />
        </View>
      </View>
    </Modal>
  );
};

export default memo(DialogFromButtom);
