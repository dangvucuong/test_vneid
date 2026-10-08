import React, { useEffect, useRef, useState } from "react";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  FlatList,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import SignatureCanvas from "react-native-signature-canvas";
import * as DocumentPicker from 'expo-document-picker';

import { I18n } from "i18n-js";
import { en, vi } from "../../localize";
import PageContainer from "../component/PageContainer";
import PageHeader from "../component/PageHeader";

const i18n = new I18n();

const options = [
  {
    id: 1,
    name: "Sử dụng mẫu",
  },
  {
    id: 2,
    name: "Vẽ tay",
  },
  {
    id: 3,
    name: "Tải lên",
  },
];

const signatureList = [
  {
    id: 1,
    name: "Chris Hoang (Mặc định)",
  },
  {
    id: 2,
    name: "Chris Hoang (Mặc định)",
  },
  {
    id: 3,
    name: "Chris Hoang (Mặc định)",
  },
  {
    id: 4,
    name: "Chris Hoang (Mặc định)",
  },
];

const displayOptions = [
  {
    id: 1,
    name: "Nhãn dán",
    checked: true,
  },
  {
    id: 2,
    name: "Chủ sở hữu",
    checked: true,
  },
  {
    id: 3,
    name: "Thời gian ký",
    checked: true,
  },
  {
    id: 4,
    name: "Thông tin chứng thư",
    checked: true,
  },
  {
    id: 5,
    name: "Địa chỉ",
    checked: true,
  },
  {
    id: 6,
    name: "Logo CA2",
    checked: true,
  },
  {
    id: 7,
    name: "Tiếng Anh",
  },
];

const ThietLapChuKy = ({ navigation }) => {
  const [showEdit, setShowEdit] = useState(false);
  const [selectedTab, setSelectedTab] = useState(1); // State for the selected tab
  const [checkedItems, setCheckedItems] = useState(displayOptions);
  const [selectedSignature, setSelectedSignature] = useState(1);
  const [locale, setlocale] = useState("vi");
  i18n.translations = { en, vi };
  i18n.locale = locale;
  useEffect(() => {
    AsyncStorage.getItem("@language").then((value) => {
      if (value != null) {
        i18n.fallback = true;
        setlocale(value);
      }
    });
  }, []);

  const toggleCheckbox = (id) => {
    const updatedItems = checkedItems.map((item) => {
      if (item.id === id) {
        return { ...item, checked: !item.checked };
      }
      return item;
    });
    setCheckedItems(updatedItems);
  };

  const uploadSignature = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: "image/*",
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (res.type === "success") {
        console.log("Selected image URI:", res.uri);
        // Xử lý tiếp ở đây nếu cần, ví dụ: setSignatureUri(res.uri)
      } else {
        console.log("User cancelled the upload");
      }
    } catch (err) {
      console.log("Unknown error: ", err);
    }
  };

  const UpdateSignature = () => {
    return (
      <View>
        <View style={styles.line} />
        <SelectOptionView />
        <View style={styles.line} />
        <CustomDisplay />
      </View>
    );
  };

  const SelectOptionView = () => {
    return (
      <View style={styles.container}>
        <View style={[styles.dFlex, { paddingHorizontal: 16 }]}>
          <Image
            source={require("../../img/NotePencilBlack.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={{ fontWeight: "600", marginLeft: 8 }}>Chữ ký</Text>
        </View>
        <View style={styles.tabContainer}>
          {options.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={[
                styles.tabButton,
                selectedTab === item.id && styles.activeTab, // Active tab styling
              ]}
              onPress={() => setSelectedTab(item.id)}
            >
              <View
                style={[
                  styles.radioCircle,
                  selectedTab === item.id && styles.selectedOption,
                ]}
              >
                {selectedTab === item.id && (
                  <View style={styles.selectedCircle} />
                )}
              </View>
              <Text
                style={[
                  styles.tabText,
                  selectedTab === item.id && styles.activeTabText,
                ]}
              >
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Display content based on the selected tab */}
        <View style={styles.contentContainer}>
          {selectedTab === 1 && <SignatureTemplate />}
          {selectedTab === 2 && <SignatureHandWriting />}
          {selectedTab === 3 && <SignatureUploading />}
        </View>
      </View>
    );
  };

  const SignatureTemplate = () => {
    return (
      <View>
        {signatureList.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.dFlex,
              {
                padding: 16,
                backgroundColor: selectedSignature === item.id ? "#F6F9FF" : "",
                justifyContent: "space-between",
              },
            ]}
            onPress={() => setSelectedSignature(item.id)}
          >
            <Text>{item.name}</Text>
            {selectedSignature === item.id && (
              <Image
                source={require("../../img/CheckGreen.png")}
                width={16}
                height={16}
              />
            )}
          </TouchableOpacity>
        ))}
      </View>
    );
  };

  const SignatureHandWriting = () => {
    const signRef = useRef(); // Reference for SignatureCanvas
    const [signature, setSignature] = useState(null); // To hold the signature base64
    const [penWidth, setPenWidth] = useState(3); // Default pen width
    const [canvasKey, setCanvasKey] = useState(0); // Key to force re-render

    // Function to handle when signature is saved
    const handleOK = (signature) => {
      setSignature(signature); // Save the signature in state
      Alert.alert("Signature Captured", "Your signature has been saved!");
    };

    const handleEnd = (signature) => {
      setSignature(signature);
    };

    // Clear the signature
    const handleClear = () => {
      signRef.current.clearSignature(); // Use ref to clear the canvas
      setSignature(null);
    };

    // Handle empty signature
    const handleEmpty = () => {
      Alert.alert("Error", "No signature detected");
    };

    // Function to update pen width
    const updatePenStyle = (width) => {
      setPenWidth(width);
      setCanvasKey((prevKey) => prevKey + 1); // Change key to force re-render
    };

    return (
      <View
        style={{
          flex: 1,
        }}
      >
        <SignatureCanvas
          key={canvasKey}
          ref={signRef}
          onOK={handleOK}
          onEnd={handleEnd}
          onEmpty={handleEmpty}
          dotSize={1}
          descriptionText="Sign here"
          webStyle={`
                        .m-signature-pad {
                            box-shadow: none;
                            border: none;
                        }
                        .m-signature-pad--footer { /* Hides the footer */
                            display: none;
                        }
                        canvas {
                            stroke-width: 1px;
                            overflow: hidden;
                            touch-action: none;
                        }
                          /* Inject JS for stroke-width */
                          body > canvas {
                            width: 100%;
                            height: 100%;
                          }
                        
                          /* Set stroke width dynamically */
                          window.onload = function() {
                            var canvas = document.querySelector("canvas");
                            var context = canvas.getContext("2d");
                            context.lineWidth = 5; /* Set stroke width here */
                          };
                    `}
        />
        <View
          style={[
            styles.dFlex,
            { marginHorizontal: 16, justifyContent: "space-between" },
          ]}
        >
          {/* Stroke Selection Controls */}
          <View style={styles.widthOptions}>
            <Text style={{ fontSize: 13, color: "#334155" }}>Nét bút</Text>
            {[3, 4, 5].map((width) => (
              <TouchableOpacity
                key={width}
                style={[
                  styles.widthOption,
                  penWidth === width ? styles.selectedWidth : {},
                ]}
                onPress={() => updatePenStyle(width)}
              >
                <View
                  style={{
                    width: width * 2,
                    height: width * 2,
                    backgroundColor: "#334155",
                    borderRadius: 50,
                  }}
                />
              </TouchableOpacity>
            ))}
          </View>
          <TouchableOpacity onPress={handleClear}>
            <Image
              source={
                signature
                  ? require("../../img/TrashEnable.png")
                  : require("../../img/Trash.png")
              }
              width={16}
              height={16}
            />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  const SignatureUploading = () => {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <TouchableOpacity
          onPress={uploadSignature}
          style={[
            styles.dFlex,
            {
              justifyContent: "center",
              width: 140,
              borderWidth: 1,
              borderColor: "#B7CAF8",
              borderRadius: 4,
              paddingVertical: 6,
              gap: 8,
            },
          ]}
        >
          <Image
            source={require("../../img/UploadSimple.png")}
            width={16}
            height={16}
          />
          <Text style={{ fontWeight: "600", color: "#1858EA" }}>Tải lên</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={{
            position: "absolute",
            bottom: 0,
            right: 16,
          }}
          // onPress={handleClear}
        >
          <Image
            source={require("../../img/Trash.png")}
            width={16}
            height={16}
          />
        </TouchableOpacity>
      </View>
    );
  };

  const CustomDisplay = () => {
    return (
      <View style={{ paddingHorizontal: 16 }}>
        <View
          style={[
            styles.dFlex,
            {
              paddingVertical: 20,
            },
          ]}
        >
          <Image
            source={require("../../img/GearSix.png")}
            style={{ width: 20, height: 20 }}
          />
          <Text style={{ fontWeight: "600", marginLeft: 8 }}>
            Tùy chỉnh hiển thị
          </Text>
        </View>
        <FlatList
          data={checkedItems}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.checkboxContainer}
              onPress={() => toggleCheckbox(item.id)}
            >
              <View
                style={[styles.checkbox, item.checked && styles.checkedBox]}
              >
                {item.checked && (
                  <Image
                    source={require("../../img/CheckBox.png")}
                    width={11.5}
                    height={8}
                  />
                )}
              </View>
              <Text style={styles.label}>{item.name}</Text>
            </TouchableOpacity>
          )}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
        />
        <View
          style={[
            styles.dFlex,
            {
              marginTop: 30,
              width: "100%",
              padding: 16,
              borderRadius: 6,
              borderWidth: 1,
              borderColor: "#B7CAF8",
            },
          ]}
        >
          <Image
            source={require("../../img/DefaultSignature.png")}
            width={100}
            height={23}
          />
          <Text style={{ marginLeft: 30, flex: 1, fontSize: 10 }}>
            Người ký: CHRIS HOANG {"\n"}
            Thông tin chứng thư: {"\n"}
            E=chrishoang@cavn.vn, {"\n"}
            UID=CCCD:1234567, {"\n"}
            CN=Chris Hoang, {"\n"}
            Địa chỉ: Nguyễn Phúc Lai, Ô Chợ Dừa, Hà Nội, {"\n"}
            S=Hà Nội, {"\n"}
            C=Việt Nam{"\n"}
            Thời gian: 20/06/2022 - 20:46:11
          </Text>
        </View>
      </View>
    );
  };

  return (
    <PageContainer>
      <PageHeader
        onBack={() => navigation.goBack()}
        title={i18n.t(
          showEdit ? "tai_khoan_Thiet_lap_chu_ky" : "thiet_lap_chu_ky_Chu_ky"
        )}
        rightComponent={() => {
          return (
            <TouchableOpacity onPress={() => setShowEdit(!showEdit)}>
              {showEdit ? (
                <Text style={{ fontWeight: "600", color: "#336DD1" }}>Lưu</Text>
              ) : (
                <Image
                  source={require("../../img/NotePencilBlack.png")}
                  style={{ width: 24, height: 24 }}
                />
              )}
            </TouchableOpacity>
          );
        }}
      />

      <View style={styles.body}>
        <View
          style={[
            styles.dFlex,
            {
              justifyContent: "space-between",
              paddingBottom: 20,
              marginHorizontal: 16,
            },
          ]}
        >
          <View style={styles.dFlex}>
            <Image
              source={require("../../img/IdentificationCard.png")}
              style={{ width: 20, height: 20, marginRight: 8 }}
            />
            <Text
              style={{
                fontSize: 14,
                fontWeight: "bold",
                color: "#0F172A",
              }}
            >
              Chris Hoang
            </Text>
          </View>
          <TouchableOpacity
            style={styles.dFlex}
            onPress={() =>
              Alert.alert("CA2 REMOTE SIGNING", "Chức năng sẽ cập nhật sau")
            }
          >
            <Image
              source={require("../../img/CaretRightLink.png")}
              style={{ width: 16, height: 16 }}
            />
          </TouchableOpacity>
        </View>
        {showEdit ? (
          <UpdateSignature />
        ) : (
          <View
            style={[
              styles.dFlex,
              {
                width: "100%",
                padding: 16,
                borderRadius: 6,
                borderWidth: 1,
                borderColor: "#B7CAF8",
              },
            ]}
          >
            <Image
              source={require("../../img/DefaultSignature.png")}
              width={100}
              height={23}
            />
            <Text style={{ marginLeft: 30, flex: 1, fontSize: 10 }}>
              Người ký: CHRIS HOANG {"\n"}
              Thông tin chứng thư: {"\n"}
              E=chrishoang@cavn.vn, {"\n"}
              UID=CCCD:1234567, {"\n"}
              CN=Chris Hoang, {"\n"}
              Địa chỉ: Nguyễn Phúc Lai, Ô Chợ Dừa, Hà Nội, {"\n"}
              S=Hà Nội, {"\n"}
              C=Việt Nam{"\n"}
              Thời gian: 20/06/2022 - 20:46:11
            </Text>
          </View>
        )}
      </View>
    </PageContainer>
  );
};

const styles = StyleSheet.create({
  dFlex: {
    flexDirection: "row",
    alignItems: "center",
  },
  header: {
    backgroundColor: "#FFFFFF",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
  },
  headerTitle: {
    fontSize: 16,
    color: "#1E293B",
    fontWeight: "bold",
  },
  body: {
    flex: 2,
    marginTop: 12,
    paddingVertical: 20,
    backgroundColor: "#FFFFFF",
  },

  // Style for radio button tabs
  container: {
    paddingVertical: 20,
  },
  tabContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 24,
    paddingHorizontal: 16,
  },
  tabButton: {
    flexDirection: "row",
    alignItems: "center",
  },
  activeTab: {
    borderRadius: 20,
  },
  radioCircle: {
    height: 20,
    width: 20,
    marginRight: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#9CA3AF",
    alignItems: "center",
    justifyContent: "center",
  },
  selectedOption: {
    borderColor: "#21C75E",
  },
  selectedCircle: {
    width: 12,
    height: 12,
    borderRadius: 5,
    backgroundColor: "#21C75E",
  },
  tabText: {
    fontSize: 14,
    color: "#9CA3AF",
  },
  activeTabText: {
    fontWeight: "600",
    color: "#0F172A",
  },
  contentContainer: {
    height: 200,
  },

  // Style for checkbox
  checkboxContainer: {
    width: "50%",
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  checkbox: {
    width: 16,
    height: 16,
    borderWidth: 1,
    borderRadius: 2,
    borderColor: "#9CA3AF",
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  checkedBox: {
    backgroundColor: "#21C75E",
    borderColor: "#21C75E",
  },
  label: {
    fontSize: 13,
    color: "#0F172A",
  },
  line: {
    marginHorizontal: 16,
    borderWidth: 0.7,
    borderColor: "#EDF1F5",
  },
  widthOptions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  widthOption: {
    padding: 9,
    borderWidth: 1,
    borderColor: "#DDE3EB",
    borderRadius: 50,
  },
  selectedWidth: {
    borderColor: "#8BABF4",
  },
});

export default ThietLapChuKy;
