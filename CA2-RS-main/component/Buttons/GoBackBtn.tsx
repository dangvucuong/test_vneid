import { Image, TouchableOpacity } from "react-native";
import AntDesign from "@expo/vector-icons/AntDesign";

const GoBackButton = ({ navigation }: { navigation: any }) => {
  return (
    <TouchableOpacity
      style={{
        width: 24,
        height: 40,
      }}
      onPress={() => {
        navigation.goBack();
      }}
    >
      <AntDesign name="left" size={20} color="black" />
    </TouchableOpacity>
  );
};

export default GoBackButton;
