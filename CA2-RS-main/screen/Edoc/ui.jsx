import React from "react";
import {
  ActivityIndicator,
  Platform,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";

export const colors = {
  navy: "#0E2A57",
  blue: "#1858EA",
  blueSoft: "#E8F0FF",
  text: "#122033",
  muted: "#667085",
  line: "#E6EAF0",
  bg: "#F3F6FB",
  card: "#FFFFFF",
  danger: "#C2410C",
  ok: "#067647",
};

export function Screen({ title, subtitle, onBack, children, footer }) {
  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.back} hitSlop={8}>
          <Ionicons name="chevron-back" size={22} color="#fff" />
          <Text style={styles.backText}>Quay lại</Text>
        </TouchableOpacity>
        <Text style={styles.title} numberOfLines={2}>{title}</Text>
        {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
      </View>
      <View style={styles.body}>{children}</View>
      {footer}
    </SafeAreaView>
  );
}

export function Button({ label, onPress, disabled, tone, compact, icon }) {
  const ghost = tone === "ghost" || tone === "danger-ghost";
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.button,
        compact && styles.buttonCompact,
        ghost && styles.buttonGhost,
        tone === "danger" && styles.buttonDanger,
        tone === "danger-ghost" && styles.buttonDangerGhost,
        disabled && styles.buttonDisabled,
      ]}
    >
      {icon ? (
        <Ionicons
          name={icon}
          size={16}
          color={ghost ? (tone === "danger-ghost" ? colors.danger : colors.blue) : "#fff"}
          style={{ marginRight: 6 }}
        />
      ) : null}
      <Text
        style={[
          styles.buttonText,
          ghost && styles.buttonGhostText,
          tone === "danger-ghost" && { color: colors.danger },
        ]}
      >
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
        placeholderTextColor="#98A2B3"
        multiline={multiline}
        style={[styles.input, multiline && styles.inputMulti]}
        autoCapitalize="none"
      />
    </View>
  );
}

export function Loading({ label }) {
  return (
    <View style={styles.loading}>
      <ActivityIndicator size="large" color={colors.blue} />
      {label ? <Text style={styles.loadingText}>{label}</Text> : null}
    </View>
  );
}

export function StatusBanner({ text, busy }) {
  if (!text) return null;
  return (
    <View style={styles.banner}>
      {busy ? <ActivityIndicator color={colors.blue} style={{ marginRight: 8 }} /> : null}
      <Text style={styles.bannerText}>{text}</Text>
    </View>
  );
}

export function Empty({ text }) {
  return (
    <View style={styles.emptyWrap}>
      <Ionicons name="documents-outline" size={36} color={colors.muted} />
      <Text style={styles.empty}>{text}</Text>
    </View>
  );
}

export function Card({ children, onPress }) {
  const content = <View style={styles.card}>{children}</View>;
  if (!onPress) return content;
  return (
    <TouchableOpacity onPress={onPress} activeOpacity={0.85}>
      {content}
    </TouchableOpacity>
  );
}

export function MenuRow({ icon, title, caption, onPress }) {
  return (
    <TouchableOpacity style={styles.menuRow} onPress={onPress} activeOpacity={0.8}>
      <View style={styles.menuIcon}>
        <Ionicons name={icon} size={20} color={colors.blue} />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={styles.menuTitle}>{title}</Text>
        {caption ? <Text style={styles.menuCaption}>{caption}</Text> : null}
      </View>
      <Ionicons name="chevron-forward" size={18} color="#98A2B3" />
    </TouchableOpacity>
  );
}

export function FormScroll({ children }) {
  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={{ padding: 16, paddingBottom: 28 }} keyboardShouldPersistTaps="handled">
      {children}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: colors.bg },
  header: {
    backgroundColor: colors.navy,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === "android" ? (StatusBar.currentHeight || 24) + 8 : 8,
    paddingBottom: 16,
  },
  back: { flexDirection: "row", alignItems: "center", alignSelf: "flex-start", paddingVertical: 4 },
  backText: { color: "#fff", fontWeight: "600", marginLeft: 2 },
  title: { fontSize: 22, fontWeight: "700", color: "#fff", marginTop: 8 },
  subtitle: { color: "#D6E2F5", marginTop: 4, lineHeight: 20 },
  body: { flex: 1 },
  button: {
    backgroundColor: colors.blue,
    borderRadius: 12,
    paddingVertical: 13,
    paddingHorizontal: 14,
    alignItems: "center",
    justifyContent: "center",
    flexDirection: "row",
    marginBottom: 8,
  },
  buttonCompact: {
    paddingVertical: 8,
    paddingHorizontal: 10,
    marginBottom: 0,
    marginRight: 8,
    borderRadius: 999,
  },
  buttonGhost: { backgroundColor: colors.card, borderWidth: 1, borderColor: "#D6E2F5" },
  buttonDanger: { backgroundColor: colors.danger },
  buttonDangerGhost: { backgroundColor: "#FFF7F3", borderWidth: 1, borderColor: "#F5D0C4" },
  buttonDisabled: { opacity: 0.5 },
  buttonText: { color: "#fff", fontWeight: "700" },
  buttonGhostText: { color: colors.blue },
  field: { marginBottom: 12 },
  label: { color: colors.muted, marginBottom: 6, fontWeight: "600" },
  input: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.line,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 12,
    color: colors.text,
  },
  inputMulti: { minHeight: 88, textAlignVertical: "top" },
  loading: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24 },
  loadingText: { color: colors.muted, marginTop: 12, textAlign: "center" },
  banner: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.blueSoft,
    borderRadius: 12,
    padding: 12,
  },
  bannerText: { color: colors.navy, flex: 1, lineHeight: 20 },
  emptyWrap: { alignItems: "center", marginTop: 48, paddingHorizontal: 24 },
  empty: { color: colors.muted, textAlign: "center", marginTop: 8, lineHeight: 20 },
  card: {
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  menuRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: "#EEF2F6",
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: colors.blueSoft,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 12,
  },
  menuTitle: { color: colors.text, fontWeight: "700", fontSize: 16 },
  menuCaption: { color: colors.muted, marginTop: 2, fontSize: 13 },
});
