import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  SafeAreaView,
  Alert,
  Platform,
} from "react-native";
import * as ImagePicker from "expo-image-picker";

export default function ChupAnhCCCD({ navigation, route }) {
  const [frontImage, setFrontImage] = useState(null);
  const [backImage, setBackImage] = useState(null);

  const handleImageSelection = (side) => {
    Alert.alert(
      "Chọn hành động",
      "Bạn muốn chụp ảnh hay chọn ảnh từ thư viện?",
      [
        {
          text: "Chụp ảnh",
          onPress: () => takePhoto(side),
        },
        {
          text: "Chọn ảnh",
          onPress: () => pickImage(side),
        },
        {
          text: "Hủy",
          style: "cancel",
        },
      ]
    );
  };

  const pickImage = async (side) => {
    if (Platform.OS === "ios") {
      const permissionResult =
        await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (permissionResult.granted === false) {
        alert("Permission to access camera roll is required!");
        return;
      }
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      if (side === "front") {
        setFrontImage(result.assets[0].uri);
      } else {
        setBackImage(result.assets[0].uri);
      }
    }
  };

  const takePhoto = async (side) => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();

    if (permissionResult.granted === false) {
      alert("Permission to access camera is required!");
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      quality: 1,
    });

    if (!result.canceled) {
      if (side === "front") {
        setFrontImage(result.assets[0].uri);
      } else {
        setBackImage(result.assets[0].uri);
      }
    }
  };

  const removeImage = (side) => {
    if (side === "front") {
      setFrontImage(null);
    } else {
      setBackImage(null);
    }
  };
  const handleFinish = () => {
    const { onComplete } = route.params;
    if (onComplete) {
      onComplete({ id: "3" }, { selectedImage: { frontImage, backImage } });
    }
    navigation.goBack();
  };
  const isFinishButtonDisabled = !(frontImage && backImage);
  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButtonContainer}
          onPress={() => navigation.goBack()}
        >
          <Image
            source={require("../../img/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.header}>Chụp ảnh CCCD</Text>
      </View>

      <View style={styles.imageContainer}>
        <View style={styles.imageWrapperSmall}>
          <TouchableOpacity
            style={styles.imageBoxDashed}
            onPress={() => handleImageSelection("front")}
          >
            {frontImage ? (
              <>
                <Image source={{ uri: frontImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => removeImage("front")}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.placeholderContainer}>
                <Image
                  source={require("../../img/Camera.png")}
                  style={styles.cameraIcon}
                />
                <Text style={styles.placeholderText}>Mặt trước CMND/CCCD</Text>
                <Text style={styles.subText}>Vui lòng chụp ảnh mặt trước CCCD</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        <View style={styles.imageWrapperSmall}>
          <TouchableOpacity
            style={styles.imageBoxDashed}
            onPress={() => handleImageSelection("back")}
          >
            {backImage ? (
              <>
                <Image source={{ uri: backImage }} style={styles.image} />
                <TouchableOpacity
                  style={styles.closeButton}
                  onPress={() => removeImage("back")}
                >
                  <Text style={styles.closeButtonText}>X</Text>
                </TouchableOpacity>
              </>
            ) : (
              <View style={styles.placeholderContainer}>
                <Image
                  source={require("../../img/Camera.png")}
                  style={styles.cameraIcon}
                />
                <Text style={styles.placeholderText}>Mặt sau CMND/CCCD</Text>
                <Text style={styles.subText}>Vui lòng chụp ảnh mặt sau CCCD</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.instructionsContainer}>
        <Text style={styles.instructionText}>
          <Image
            source={require("../../img/CheckCircleNoneBg.png")}
            style={styles.instructionIcon}
          /> CMND/CCCD/ Hộ chiếu phải còn hiệu lực, là bản gốc không phải bản sao
        </Text>
        <Text style={styles.instructionText}>
          <Image
            source={require("../../img/CheckCircleNoneBg.png")}
            style={styles.instructionIcon}
          /> Đặt CMND/CCCD/ Hộ chiếu trước máy ảnh sao cho vị trí giấy tờ vừa với khung chụp ảnh
        </Text>
        <Text style={styles.instructionText}>
          <Image
            source={require("../../img/CheckCircleNoneBg.png")}
            style={styles.instructionIcon}
          /> Hình ảnh cần rõ ràng, không bị mờ, mất góc hoặc chói sáng
        </Text>
      </View>

      <TouchableOpacity
        style={[
          styles.finishButton,
          isFinishButtonDisabled && styles.finishButtonDisabled,
        ]}
        onPress={handleFinish}
        disabled={isFinishButtonDisabled}
      >
        <Text style={styles.finishButtonText}>Hoàn tất</Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#fff",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginTop: 32,
    marginBottom: 16,
    position: "relative",
  },
  backButtonContainer: {
    position: "absolute",
    left: 16,
  },
  header: {
    fontSize: 20,
    fontWeight: "bold",
  },
  imageContainer: {
    flexDirection: "column",
    justifyContent: "space-between",
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  imageWrapperSmall: {
    marginVertical: 8,
  },
  imageBoxDashed: {
    width: "100%",
    aspectRatio: 2,
    borderWidth: 1,
    borderColor: "#00AEEF",
    borderRadius: 8,
    borderStyle: "dashed",
    justifyContent: "center",
    alignItems: "center",
    overflow: "hidden",
    paddingHorizontal: 16,
  },
  image: {
    width: "90%",
    aspectRatio: 1.5,
    resizeMode: "contain",
  },
  placeholderContainer: {
    justifyContent: "center",
    alignItems: "center",
  },
  cameraIcon: {
    width: 24,
    height: 24,
    marginBottom: 4,
  },
  closeButton: {
    position: "absolute",
    top: 8,
    right: 8,
    backgroundColor: "#fff",
    borderRadius: 12,
    width: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 1,
  },
  closeButtonText: {
    color: "#ff0000",
    fontSize: 12,
    fontWeight: "bold",
  },
  placeholderText: {
    fontSize: 14,
    fontWeight: "bold",
  },
  subText: {
    fontSize: 10,
    color: "#888",
    textAlign: "center",
  },
  instructionsContainer: {
    marginBottom: 24,
    paddingHorizontal: 16,
  },
  instructionText: {
    flexDirection: "row",
    fontSize: 12,
    color: "#555",
    marginBottom: 4,
  },
  instructionIcon: {
    width: 14,
    height: 14,
    marginRight: 4,
  },
  finishButton: {
    backgroundColor: "#007BFF",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  finishButtonDisabled: {
    backgroundColor: "#CCCCCC",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  finishButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "bold",
  },
});
