import React from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export const colors = {
  blue: "#1858EA",
  text: "#1F2937",
  muted: "#6B7280",
  line: "#E5E7EB",
  bg: "#F4F6FB",
  danger: "#B91C1C",
};

export function Screen({ title, onBack, children, footer }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.back}>
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{title}</Text>
      </View>
      <View style={styles.body}>{children}</View>
      {footer}
    </SafeAreaView>
  );
}

export function Button({ label, onPress, disabled, tone }) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        tone === "ghost" && styles.buttonGhost,
        tone === "danger" && styles.buttonDanger,
        disabled && styles.buttonDisabled,
      ]}
    >
      <Text style={[styles.buttonText, tone === "ghost" && styles.buttonGhostText]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

export function Field({ label, value, onChangeText, placeholder, multiline }) {
  return (
    <View style={styles.field}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Loading() {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.blue} />
    </View>
  );
}

export function Empty({ text }) {
  return <Text style={styles.empty}>{text}</Text>;
}

export function Card({ children, onPress }) {
  const content = <View style={styles.card}>{children}</View>;
  if (!onPress) return content;
  return <TouchableOpacity onPress={onPress}>{content}</TouchableOpacity>;
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: "#fff",
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: colors.line,
  },
  back: { alignSelf: "flex-start", paddingVertical: 4 },
  backText: { color: colors.blue, fontWeight: "600" },
  title: { fontSize: 20, fontWeight: "700", color: colors.text, marginTop: 4 },
  body: { flex: 1 },
  button: {
    backgroundColor: colors.blue,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 14,
    alignItems: "center",
    marginBottom: 8,
  },
  buttonGhost: { backgroundColor: "#fff", borderWidth: 1, borderColor: colors.blue },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhostText: { color: colors.blue },
  field: { marginBottom: 12 },
  label: { color: colors.muted, marginBottom: 4 },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: colors.text,
  },
  inputMulti: { minHeight: 80, textAlignVertical: "top" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center" },
  empty: { color: colors.muted, textAlign: "center", marginTop: 32, paddingHorizontal: 24 },
  card: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 14,
    marginBottom: 10,
  },
});

export function FormScroll({ children }) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}
