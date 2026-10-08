import React from "react";
import {
  StyleSheet,
  View,
  Text,
  SafeAreaView,
  TouchableOpacity,
  NativeModules,

} from "react-native";
import { StatusBar } from "expo-status-bar";
import { Ionicons } from "@expo/vector-icons";
import { useI18n } from "../../utils/i18n";

export default function FaceVerificationScreen({ navigation }) {
    const { i18n } = useI18n();

  const steps = [
    { id: 1, title: i18n.t("ekyc.steps.scan"), completed: true },
    { id: 2, title: i18n.t("ekyc.steps.chip"), completed: true },
    { id: 3, title: i18n.t("ekyc.steps.face"), active: true },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="dark" /> */}

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t("ekyc.header")}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepItem}>
              <View
                style={[
                  styles.stepCircle,
                  {
                    backgroundColor: step.completed
                      ? "#3366FF"
                      : step.active
                      ? "#3366FF"
                      : "#E5E7EB",
                  },
                ]}
              >
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text
                    style={[
                      styles.stepNumber,
                      { color: step.active ? "white" : "#6B7280" },
                    ]}
                  >
                    {step.id}
                  </Text>
                )}
              </View>
              <Text style={styles.stepText}>{step.title}</Text>
            </View>
            {index < steps.length - 1 && (
              <View
                style={[
                  styles.stepLine,
                  { backgroundColor: step.completed ? "#3366FF" : "#E5E7EB" },
                ]}
              />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={require("../../img/register_face.png")}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.title}>{i18n("ekyc.faceVerification.title")}</Text>

        <View style={styles.cameraContainer}>
          <View style={styles.cameraContent}>
            <Text style={styles.description}>
              {i18n("ekyc.faceVerification.description")}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          // Handle face verification process
          // Then complete the EKYC process
        }}
      >
        <Text style={styles.buttonText}>
          {i18n.t("ekyc.faceVerification.button")}
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
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
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
  cameraContainer: {
    flex: 1,
    backgroundColor: "#F3F4F6",
    margin: 16,
    borderRadius: 12,
    overflow: "hidden",
  },
  cameraContent: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  faceGuide: {
    width: 200,
    height: 200,
    borderRadius: 100,
    borderWidth: 2,
    borderColor: "#3366FF",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 24,
  },
  faceOutline: {
    width: 180,
    height: 180,
    borderRadius: 90,
    borderWidth: 2,
    borderStyle: "dashed",
    borderColor: "#3366FF",
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
