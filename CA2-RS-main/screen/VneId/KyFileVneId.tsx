import AsyncStorage from "@react-native-async-storage/async-storage";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Alert,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { decode, encode } from "base-64";
import pdfVneId from "../../utils/pdfVneId";

const ORIGINATOR_CODE = "CA2_MobileSign";
const GATEWAY_KEY = "@vneidGatewayUrl";
const CCCD_KEY = "@vneidCccd";
const DEFAULT_GATEWAY = "https://gatewayvneid.nacencomm.vn";

type CertificateItem = {
  credentialID?: string;
  cert?: {
    serialNumber?: string;
    subjectDN?: string;
    validFrom?: string;
    validTo?: string;
    certificates?: string[];
  };
};

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const bytesFromBase64 = (value: string) => {
  const binary = decode(value);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index) & 0xff;
  }
  return bytes;
};

const base64FromBytes = (bytes: Uint8Array) => {
  let binary = "";
  const chunk = 0x2000;
  for (let index = 0; index < bytes.length; index += chunk) {
    binary += String.fromCharCode.apply(null, bytes.subarray(index, index + chunk));
  }
  return encode(binary);
};

const certificateList = (body: any): CertificateItem[] => {
  const data = body?.data;
  if (Array.isArray(data)) return data;
  return data?.credentialInfos || data?.CredentialInfos || data?.credentialInfo || [];
};

const signatureValue = (value: any) => {
  if (typeof value === "string") return value.replace(/\s+/g, "");
  if (value && typeof value === "object") {
    return String(value.signature || value.signedValue || value.value || "").replace(/\s+/g, "");
  }
  return "";
};

export default function KyFileVneId({ navigation }: { navigation: any }) {
  const [gatewayUrl, setGatewayUrl] = useState(DEFAULT_GATEWAY);
  const [cccd, setCccd] = useState("");
  const [certs, setCerts] = useState<CertificateItem[]>([]);
  const [selectedId, setSelectedId] = useState("");
  const [fileName, setFileName] = useState("");
  const [fileBytes, setFileBytes] = useState<Uint8Array | null>(null);
  const [log, setLog] = useState("Chọn chứng thư VNeID, rồi chọn file PDF.");
  const [busy, setBusy] = useState(false);
  const alive = useRef(true);

  useEffect(() => {
    alive.current = true;
    AsyncStorage.multiGet([GATEWAY_KEY, CCCD_KEY]).then((pairs) => {
      const savedGateway = pairs[0]?.[1];
      const savedCccd = pairs[1]?.[1];
      if (savedGateway) setGatewayUrl(savedGateway);
      if (savedCccd) setCccd(savedCccd);
    });
    return () => {
      alive.current = false;
    };
  }, []);

  const baseUrl = gatewayUrl.trim().replace(/\/+$/, "");

  const loadCertificates = async () => {
    const citizenPid = cccd.trim();
    if (!/^\d{12}$/.test(citizenPid)) {
      Alert.alert("CCCD", "Nhập đủ 12 số CCCD.");
      return;
    }
    setBusy(true);
    setLog("Đang lấy danh sách chứng thư...");
    try {
      await AsyncStorage.multiSet([
        [GATEWAY_KEY, baseUrl],
        [CCCD_KEY, citizenPid],
      ]);
      const response = await fetch(
        `${baseUrl}/api/vneid/certificates/list/${encodeURIComponent(citizenPid)}`
      );
      const body = await response.json();
      const status = String(body?.status ?? "");
      if (!response.ok || (status !== "01" && status !== "1")) {
        throw new Error(body?.description || "Không lấy được danh sách chứng thư.");
      }
      const list = certificateList(body);
      setCerts(list);
      setSelectedId(list.length === 1 ? String(list[0].credentialID || "") : "");
      setLog(list.length ? `Có ${list.length} chứng thư. Hãy chọn một chứng thư.` : "Không có chứng thư VNeID.");
    } catch (error: any) {
      setCerts([]);
      setLog(error?.message || "Không kết nối được gateway.");
    } finally {
      setBusy(false);
    }
  };

  const pickPdf = async () => {
    const result = await DocumentPicker.getDocumentAsync({
      type: "application/pdf",
      copyToCacheDirectory: true,
    });
    if (result.canceled || !result.assets?.[0]) return;
    const asset = result.assets[0];
    const encoded = await FileSystem.readAsStringAsync(asset.uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    setFileName(asset.name || "tai-lieu.pdf");
    setFileBytes(bytesFromBase64(encoded));
    setLog(`Đã chọn ${asset.name || "PDF"}. Bấm Ký để gửi hash sang VNeID.`);
  };

  const signPdf = async () => {
    const cert = certs.find((item) => item.credentialID === selectedId);
    const certData = cert?.cert?.certificates || [];
    if (!cert?.credentialID || !certData[0]) {
      Alert.alert("Chứng thư", "Hãy chọn chứng thư có dữ liệu chứng thư số.");
      return;
    }
    if (!fileBytes) {
      Alert.alert("PDF", "Hãy chọn file PDF.");
      return;
    }

    setBusy(true);
    try {
      setLog("Đang tạo vùng ký và băm PDF trên máy...");
      const prepared = await pdfVneId.prepareSignedPdf(fileBytes);
      const material = pdfVneId.digestForVneId(prepared, certData);
      setLog("Đang gửi hash sang VNeID...");
      const signResponse = await fetch(`${baseUrl}/api/vneid/signings/hash`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          credentialID: cert.credentialID,
          originatorCode: ORIGINATOR_CODE,
          documents: [
            {
              documentName: fileName || "tai-lieu.pdf",
              digestValue: material.digestValue,
            },
          ],
        }),
      });
      const signBody = await signResponse.json();
      const handle = signBody?.data?.handle;
      if (signBody?.status !== "01" || !handle) {
        throw new Error(signBody?.description || "Gateway không nhận yêu cầu ký.");
      }
      const requestId = String(signBody.requestId || "");
      const expiresIn = Number(signBody.data.expiresIn || 300);
      const started = Date.now();
      setLog(`Đã gửi yêu cầu. Handle: ${handle}\nMở VNeID và xác nhận ký.`);

      let signature = "";
      while ((Date.now() - started) / 1000 < expiresIn) {
        if (!alive.current) return;
        await sleep(3000);
        const poll = await fetch(
          `${baseUrl}/api/vneid/signings/polling/${encodeURIComponent(handle)}`,
          { headers: requestId ? { "X-Request-Id": requestId } : undefined }
        );
        const pollBody = await poll.json();
        const pollStatus = String(pollBody?.status ?? "");
        if (pollStatus !== "01" && pollStatus !== "1") {
          throw new Error(pollBody?.description || "Không lấy được kết quả ký.");
        }
        const statusCode = Number(pollBody?.data?.statusCode);
        if (statusCode === 0) {
          signature = signatureValue(pollBody?.data?.signatures?.[0]);
          if (!signature) throw new Error("VNeID không trả chữ ký.");
          break;
        }
        if (statusCode === 1) throw new Error("Ký VNeID thất bại.");
        if (statusCode === 3) throw new Error("Bạn đã từ chối ký trên VNeID.");
        setLog(`Đang chờ xác nhận trên VNeID.\nHandle: ${handle}`);
      }
      if (!signature) throw new Error("Hết thời gian chờ xác nhận trên VNeID.");

      setLog("Đang ghép chữ ký vào PDF trên máy...");
      const signed = pdfVneId.embedVneIdSignature(prepared, material, signature);
      const output = `${FileSystem.documentDirectory}vneid-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(output, base64FromBytes(signed), {
        encoding: FileSystem.EncodingType.Base64,
      });
      setLog(`Ký xong.\nHandle: ${handle}\n${output}`);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(output, { mimeType: "application/pdf" });
      }
    } catch (error: any) {
      setLog(error?.message || "Ký VNeID thất bại.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.back}>Đóng</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Ký PDF bằng VNeID</Text>
      </View>
      <ScrollView style={styles.scroll} contentContainerStyle={styles.content}>
        <Text style={styles.step}>1. Chọn file PDF trên máy</Text>
        <TouchableOpacity style={styles.fileCard} onPress={pickPdf} disabled={busy}>
          <Text style={styles.fileTitle}>{fileName || "Chọn file PDF"}</Text>
          <Text style={styles.fileHint}>
            {fileName
              ? "File đang nằm trên điện thoại. Bấm để chọn file khác."
              : "Mở thư mục trên điện thoại và chọn một file PDF."}
          </Text>
        </TouchableOpacity>

        <Text style={styles.step}>2. Chọn chứng thư VNeID</Text>
        <Text style={styles.label}>Gateway</Text>
        <TextInput
          value={gatewayUrl}
          onChangeText={setGatewayUrl}
          autoCapitalize="none"
          autoCorrect={false}
          style={styles.input}
        />
        <Text style={styles.hint}>
          Gateway đang dùng https://gatewayvneid.nacencomm.vn. OriginatorCode: {ORIGINATOR_CODE}
        </Text>

        <Text style={styles.label}>CCCD</Text>
        <TextInput
          value={cccd}
          onChangeText={setCccd}
          keyboardType="number-pad"
          maxLength={12}
          style={styles.input}
        />
        <TouchableOpacity style={styles.secondary} onPress={loadCertificates} disabled={busy}>
          <Text style={styles.secondaryText}>Lấy chứng thư VNeID</Text>
        </TouchableOpacity>

        {certs.map((item) => {
          const id = String(item.credentialID || "");
          const active = id === selectedId;
          return (
            <TouchableOpacity
              key={id}
              style={[styles.cert, active && styles.certActive]}
              onPress={() => setSelectedId(id)}
            >
              <Text style={styles.certName}>{item.cert?.subjectDN || id}</Text>
              <Text style={styles.certMeta}>Serial: {item.cert?.serialNumber || id}</Text>
              <Text style={styles.certMeta}>
                Hiệu lực: {item.cert?.validFrom || "?"} - {item.cert?.validTo || "?"}
              </Text>
            </TouchableOpacity>
          );
        })}

        <Text style={styles.step}>3. Ký trên điện thoại</Text>
        <Text style={styles.hint}>
          Hash PDF và ghép chữ ký chạy trên máy này. Gateway chỉ nhận mã băm và trả chữ ký.
          OriginatorCode: {ORIGINATOR_CODE}
        </Text>
        <TouchableOpacity style={styles.primary} onPress={signPdf} disabled={busy}>
          {busy ? <ActivityIndicator color="#ffffff" /> : <Text style={styles.primaryText}>Ký file đã chọn</Text>}
        </TouchableOpacity>
        <Text style={styles.log}>{log}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1, backgroundColor: "#ffffff" },
  header: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  back: { color: "#1858EA", fontSize: 16 },
  title: { color: "#0F172A", fontSize: 18, fontWeight: "700" },
  scroll: { flex: 1 },
  content: { padding: 16, gap: 10, paddingBottom: 32 },
  step: { color: "#0F172A", fontSize: 16, fontWeight: "700", marginTop: 8 },
  fileCard: {
    borderWidth: 1,
    borderColor: "#1858EA",
    backgroundColor: "#EFF6FF",
    borderRadius: 8,
    padding: 16,
  },
  fileTitle: { color: "#1858EA", fontSize: 16, fontWeight: "700" },
  fileHint: { color: "#334155", marginTop: 6, lineHeight: 20 },
  label: { color: "#0F172A", fontWeight: "600" },
  input: {
    borderWidth: 1,
    borderColor: "#CBD5E1",
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    color: "#0F172A",
  },
  hint: { color: "#64748B", fontSize: 12, lineHeight: 18 },
  secondary: {
    borderWidth: 1,
    borderColor: "#1858EA",
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: "center",
  },
  secondaryText: { color: "#1858EA", fontWeight: "600" },
  cert: {
    borderWidth: 1,
    borderColor: "#E2E8F0",
    borderRadius: 8,
    padding: 12,
  },
  certActive: { borderColor: "#1858EA", backgroundColor: "#EFF6FF" },
  certName: { color: "#0F172A", fontWeight: "600" },
  certMeta: { color: "#475569", marginTop: 4, fontSize: 12 },
  primary: {
    backgroundColor: "#1858EA",
    borderRadius: 8,
    minHeight: 48,
    alignItems: "center",
    justifyContent: "center",
  },
  primaryText: { color: "#ffffff", fontWeight: "700", fontSize: 16 },
  log: { color: "#0F172A", lineHeight: 20, marginTop: 8 },
});
