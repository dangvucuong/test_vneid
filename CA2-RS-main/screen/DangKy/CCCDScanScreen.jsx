import React, { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  Image,
  NativeModules,
} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../../utils/i18n";
import DefaultPreference from "react-native-default-preference";

export default function CCCDScanScreen({ navigation, route }) {
  const { onComplete } = route.params;
  useEffect(() => {
    const interval = setInterval(() => {
      DefaultPreference.get("EKYC_done").then(function (EKYC_done) {
        console.log("EKYC_done", EKYC_done);
        if (EKYC_done == "1") {
          clearInterval(interval);
          onComplete();
          // navigation.navigate("RegEKYC");
        }
      });
    }, 1000);
  }, []);
  const { i18n } = useI18n();
  const steps = [
    { id: 1, title: i18n.t("ekyc.steps.scan") },
    { id: 2, title: i18n.t("ekyc.steps.chip") },
    { id: 3, title: i18n.t("ekyc.steps.face") },
  ];
  const ScanMRZCode = () => {
    const lic =
      "-----BEGIN LICENSE DATA-----TXc9PTpDUXpGT2c0ellnRVpDRGxqcU1WNkowdCtaUnIwSEtCS080QVV5cDJBRG95ZmZJTDdydUlxci95YjF6NmFzVk9tMHhiOEw5cDBuendzK2Z2cW5BTFBUWkVLdWlaREtjcitxN3RVNGg3aUJndHMyekNKSktFc2lQYmx6NDJCQ1B1ODVSVk9tekxTZHlaZXY5VEJyWUMzbUNhcG9hcmVMdzZDdGp0KzlyUnRoWVNjdWp1bWh2T3E1eGVPNklscVIvWGlKYlA1ckVUVlhIM1B1bGdqSWpQeDZWZkZGZkZ5cFU1U3NIWm5FQldSamcvb1YxYUpUOXg3RUNKVHVBUDhzLzREbUtoVUxQS2E1VHRiMlF5RWlTSjlUUXMycnZiUUlhb2ZaYVpoT1Fxa3NKc24zZzd0OVRRK3pqajZVbjNkVWVoMmVGdXBJUnI4dDU4M3RsNkVReVNkWlE9PTpRUTNBRUVndElzM2RRbFlwT0hXa3VSK3lKUklOMExHRGRyS1dndzI5a1B2dnBTU3lkcm1UTnhYNXE5TStaczlYVXh1bmpjMVJLWlBWd1JOMjZTKzdnS0prOFBES0ROcVd0OFN4Vi9iNnNENkE0NUM3M1dLdWRQaXplb2huQmprbjZXZ2dqTmVQMXBVT3cxQk0yL1FJUkR4ZWVPYk03dEdYV3ZjSWNSS3d1bzFYYkRXa0FzTjJoQkxiYlJjWmVDenRVRU1rWHdTK0R2TFE4QTkwTUdzcStWME1hVGRub2tucVo1RzBSSDZMemhQK3FwMWtFazlsY2E3dHcvR2VWcENQUm9sWlJpbHNCcjJQdzI3NVhCOFFTNDNpblY1cGluQ0tia2NnbWRZNmd4bHM2Wkw5MWhyc2NYR0dLb3NsSExSS2g2a1NRNktCeFFjS0NhcUR2UUlGTVE9PTo5b3MvbWp6dHFCTEVyZWFDM2dQQ1prN2ZTd1M1aFNMc1ZRUlRKNExKV2RLcWU0THZ2S2VGRUhQMW5DNytjWU1CcGkrVklZNHhOaHZUMW83cVFaK1dUNlhDMlcxTkw4TElVMzR5Y0hjdkRlUklJSlVoZUhHSkc0ZzhPckcyS2YwRXJEWk5EVVB2dEVwKzRWNDRVZkkrZzdLMjVZSXA3RUJrYzF3QlJRYTFManl1VzJFbDFhajdEZ3NsREh5eTF4TDBnNG56UnBBOUlBcFRsQkplRnFxeU9JUXZrTkt6dkk2c0VHQmFRODdOMW5vVWVheVZRZ1drSnVzTjh1eDhTQVBYTWN5VmYyb3FXY083OFlOalg0ZGpCa25MVTZIQU4rR3ZqckFPODYyeTV5bEhDcmM5VmJBcGJGNFBDYm5JS1lrViszOERIR0VQaS9qUWppcC91Z0xGTnlWSHNVOUVacWZ5dTVMUE9IeXAvR1FGMlYrQytsc2ZiaklTNmdiNE5paGJWb0wyWWZtKzBUQjlNVEVnY2VMWFNmWGlmTXlHL2JPU2FGQ1VPa3RVUklydUNLSWI5VGtLRlFQL3RoWHN1TUFWeTgyRHFWMXVmMHVkeHpPcjZsdDZXRGdmd2VESmlGVFVQVWF3ak0yWHNLdXllUlJ2MldFSUIrZm1KUkNJandHbXNHOTdncHFrNW9MRUpwTHJTMmdtUmlXblozY1RBVHBHelZWQ2ZSdHZRNlBucFQzZlpFQ284bXltekxpRnRLam5uNVZIWXNSRm9LM2ozMVVOSkY4SmRyU0ZWOW16eW02cGtiRFNSQ0JqZGN3NFAvRzBxbjBpZXNLbFRvNE8yRUk3VzVnenk0OVJLTmRiTUc2Z3dXRlRDUnp0bVhDUzJYT3JVSmdSdHdaaU5pVnA3V0FPM3JYMG5YeWFBS3B5MlY4c3RXWDhadndGZmswL1VlakU3ZHdlS2RNVVlhbGlYMGNLL0V3ckcwRndUeVhjVkYyU0k1cXlQQlVmVlNDajNudGttQkV0RUNpZnhnYjN6TExJQU84OEdDMGZ6czhaWkdLbyt2Tlc5N3d4REhPd3lYTVVHNFpNTjFUYlJpQ0dIeVZuZjNNNjJRTzZ6bDJMajFnS0pUcXJOK2pWRyt5akIybXlVWTJOMEorM3hNQ2FmMktRcW1uZk92VGFGWmR4ZVhQbEsyb0JRcUM4VHB0NU1FTzQwNkhRbVZRelJ3cmFuckE1d0ZvZFRDSHlhWmdsTTF6Z0VDVnBkbDRENXlVbkJ0NHM2a1h3YUdEbi9KWHJZWFo3TkZHQ1E4Uy9vWnpoeUJoUVdBeUFnZC9INmIvSXpsS2ErcnFHUitHQS9yVHA0WlVYUFdmcDJwVmNBSHk0NGNsNHYxRDJRU28xcEJPcHc1dWFNWTdGYVBhV3RURG4zaEQ4UVprSGZ6Q0FWb2x5UHJPaUVwVGxqM2VOWkRZOHFsNXljZnV2YnB1dHdjNlF6Wnk4bXZ6Q3FCTWZ0VEFlN2tOaFBnb0RFSkwzYndLS1NuYjRNZ1R0M0Q5L2xvWVl1c2hzL09xdGlCNnFqS29kWVFORDN1bFpSREliK3poRUV5cE9lUjdjZEdvMERPOXFZc3BQV3VCUGVwTHRBb0Nid3JoNXlWcWt5ZXp2Z0kxa0twWTJuQXBncnF1R2E1Qk44ZXhNVVNkRko3WWgyMFIxOEF6eFZQd0M2NlFiZEM0RVQwRWdqVDFHS1YrUDdwSFFVdWxsR0hVazdiSnRzanNyblVTZHljc2tyUWdmcG8rRyt3VTZWVksycjQxSFBaZ0MydDBHVTRSbG8wVURhMVUvR2UvUS8yNVBsdjVFT3ZVdmhkZDRWYVdIb1hkVE9hWVNibzlaU3RaMjhDRGxMcWhYNGlIQzZYN24rTjZYdy9xWTR0TkJmMEcrb2tUTnRUR3NFWmdTMDF0L0tuaHFmdGFSM2xCejhPTnJ4aEsrcm5PRUQwa25WaFR3VjFURlZLS0FPaERCcEROb2NoQ1NuWkN1MEpVVEVWZzRmSUc0dWZ4eHFMWVE3V05WckIwODZWWGZzYjBmQmRWaERWaUxvWVYyUFNDYzBDckVBanZzZXlKbEVYbVFOT3MvWFZBcHZ4ZkxIeGFFUHhjY1IzU2FoUEFlUXZ4QVJMdnJPTWJ1MHFHN0NGU0E5K1oxaFNhdVhxaU9NK3dPdWhxdER2ZWVXaG1SQUErZjNLWVdrejZFWEl5VFVuMnVhcG1TKy95c0EwMFdFV3lJcWhoZUZ4K1pzUnRoMkJ0c3RNUUJFUFg3Z1psUWVOT3dxT1V4YzVSblN6MFpJSEpHY0tZT2RXOENLdlFmTTNuK2xUeFIyOHVEMTNsaTc0a3YxZXZwWEJ2NkZ1bHh2dFB5WXIwb2lXclVMbTNwTE1UVXhoZ25lL0gzQVRNSCtLeUFWYjBWREZ2YlFHbzUzUExkbG9abGMzdFB4RTZKWVF2MnlrQU1mRlVBeUwrWnhFYlVCL2hBcjNtKzJBMk5JR2FKVFZPNGtHd1hjdU09OlpqbG1PV1kxWkRRdE1tSmpaUzAwWXpRMUxXSTBNelV0WlRRd05tWm1NREl4WVRFdw==-----END LICENSE DATA-----";

    NativeModules.IDModule.setLicense(
      lic,
      (success) => {
        NativeModules.IDModule.startScanMrz(
          "cuongdv",
          (data1, data2, data3) => {
            var mrz = {
              docNo: data1,
              dob: data2,
              doe: data3,
            };
            console.log(mrz);
            setmrz_obj(mrz);
            global.mrz_obj = mrz;

            var url =
              "https://apidkmobilesign.nacencomm.vn/api/data/InsMrzObject?DeviceID=" +
              global.UUID;

            fetch(url, {
              method: "POST",
              headers: {
                Accept: "application/json",
                "Content-Type": "application/json",
              },
              body: JSON.stringify(mrz),
            })
              .then((response) => response.json())
              .then((responseJson) => {
                navigation.navigate("NFCPage", responseJson);
              })
              .catch((error) => {
                console.log("err:", error);
              });
          },
          (error) => {
            alert(error);
          }
        );
      },
      (error) => {
        alert(error);
      }
    );
  };
  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="dark" /> */}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Image
            source={require("../../img/back.png")}
            style={{ width: 24, height: 24 }}
          />
        </TouchableOpacity>
        <Text style={styles.headerText}>{i18n.t("ekyc.header")}</Text>
      </View>
      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  { backgroundColor: step.id === 1 ? "#3366FF" : "#E5E7EB" },
                ]}
              >
                <Text
                  style={[
                    styles.stepNumber,
                    { color: step.id === 1 ? "white" : "#6B7280" },
                  ]}
                >
                  {step.id}
                </Text>
              </View>
              <Text style={styles.stepText}>{step.title}</Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: index === 0 ? "#3366FF" : "#E5E7EB" },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={require("../../img/register_cccd.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.title}>{i18n.t("ekyc.scanScreen.title")}</Text>
        <Text style={styles.description}>
          {i18n.t("ekyc.scanScreen.description")}
        </Text>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.button}
        // onPress={ScanMRZCode}
        onPress={() => {
          // Handle chip reading process
          // Then navigate to face verification
          // navigation.navigate('ChipReadingScreen');
          //   NativeModules.EIDModule.StartEKYC(
          //     "ekyc",
          //     (success) => {
          //       console.log(success);
          //     },
          //     (error) => {
          //       console.log("NativeModules", error);
          //     }
          //   );
          console.log("NativeModules.EIDModule", NativeModules.EIDModule);
          NativeModules.EIDModule.StartEKYC(
            "ekyc",
            (success) => {},
            (error) => {
              //alert(error);
            }
          );
          //NativeModules.EIDModule.VerifyEkyc();
        }}
      >
        <Text style={styles.buttonText}>
          {i18n.t("ekyc.scanScreen.button")}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    backgroundColor: "#f8f8f8",
  },
  backText: {
    fontSize: 16,
    color: "#007bff",
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    textAlign: "center", // Căn giữa theo chiều ngang
    flex: 1, // Cho phép chiếm toàn bộ không gian còn lại
  },
  stepsContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 20,
    marginTop: 8,
  },
  stepItem: {
    alignItems: "center",
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: "600",
  },
  stepText: {
    fontSize: 12,
    color: "#374151",
    marginTop: 4,
    textAlign: "center",
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginHorizontal: -10,
  },
  content: {
    flex: 1,
    alignItems: "center",
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustration: {
    width: "80%",
    height: 200,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: "600",
    color: "#111827",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#6B7280",
    textAlign: "center",
    lineHeight: 20,
  },
  button: {
    backgroundColor: "#3366FF",
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    textAlign: "center",
  },
});
