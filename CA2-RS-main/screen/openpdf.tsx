/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  StyleSheet,
  LayoutChangeEvent,
  ActivityIndicator,
  TouchableOpacity,
  Text,
  Alert,
  SafeAreaView,
  Dimensions,
  Modal,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import Editor from "../PDFViewer/components/Editor";
import PdfViewer from "../PDFViewer/components/Pdf";
import * as FileSystem from "expo-file-system";
import {
  _calcDims,
  _calcPosition,
  readFile,
} from "../PDFViewer/helpers";
import { PDFDocument } from "pdf-lib";
import { InsertCompleteProps, InsertTypes } from "../PDFViewer/constants";
import pdfVneId from "../utils/pdfVneId";
import vneidClient from "../utils/vneidClient";
import * as Sharing from "expo-sharing";
import { encode } from "base-64";
import { useNavigation, useRoute } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { AntDesign } from "@expo/vector-icons";
import { DocumentPickerAsset } from "expo-document-picker";

type Size = {
  width: number;
  height: number;
};

const listFileType = [
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/msword",
  "text/plain",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/xml",
  "application/rtf",
];

interface PDFViewerProps {
  onInsertComplete?: (props: InsertCompleteProps) => any;
}

const SIGN_TIMEOUT_MS = 60000;

const goHome = (navigation: any) => {
  if (navigation.canGoBack()) {
    navigation.goBack();
    return;
  }
  navigation.navigate("HomeWrapper", { screen: "Home" });
};

const isRemoteUri = (uri: string) => /^https?:\/\//i.test(uri || "");

const normalizeLocalUri = (uri: string) => {
  if (!uri) return uri;
  if (
    uri.startsWith("file://") ||
    uri.startsWith("content://") ||
    isRemoteUri(uri)
  ) {
    return uri;
  }
  return `file://${uri}`;
};

const PDFViewer = (props: PDFViewerProps) => {
  const route = useRoute<any>();
  const incomingPdfUri = route.params?.pdfUri;
  const imageUri = route.params?.imageUri;
  const vneidCert = route.params?.vneidCert;
  const isVneid = route.params?.signMode === "vneid" && !!vneidCert?.credentialID;
  const [loadingVisible, setModalVisible] = useState(false);
  const navigation = useNavigation<any>();

  const [visibleFile, setvisibleFile] = useState(false);
  const [isSave, setisSave] = useState(false);

  const { onInsertComplete } = props;
  const [pdfUri, setPdfUri] = useState<string>("");
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [insertType, setInsertType] = useState<string>("");
  const [selected, setSelected] = useState<boolean>(false);
  const [wrapperSize, setWrapperSize] = useState<Size>({ width: 0, height: 0 });
  const lastInsertType = useRef<string>("");

  const [baseUri, setBaseUri] = useState<string>("");
  const [localSignUri, setLocalSignUri] = useState<string>("");
  const [localSignName, setLocalSignName] = useState<string>("document.pdf");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [lastContent, setLastContent] = useState<string>("");

  const [params, setParams] = useState<InsertCompleteProps>({} as any);
  const [isInserted, setIsInserted] = useState<boolean>(false);

  const editorRef = useRef<{ handleInsert: any }>(null);
  const [loading, setLoading] = useState(false);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<ArrayBuffer | null>(
    null
  );
  const signAbortRef = useRef<AbortController | null>(null);
  const alive = useRef(true);
  const [vneidStatus, setVneidStatus] = useState("");

  useEffect(() => {
    alive.current = true;
    return () => {
      alive.current = false;
    };
  }, []);

  function sanitizeFileName(filename: string) {
    const parts = filename.split(".");
    const ext = parts.pop();
    let name = parts.join(".");
    name = name.replace(/[^a-zA-Z0-9_-]/g, "_");
    return `${name}.${ext}`;
  }

  const convertToPDF = async (
    filePath: string,
    fileName: string,
    fileType: string
  ) => {
    try {
      setLoading(true);
      const fileInfo = await FileSystem.getInfoAsync(filePath);
      if (!fileInfo.exists) {
        throw new Error(`File does not exist at path: ${filePath}`);
      }
      const formData = new FormData();
      formData.append("file", {
        uri: filePath,
        name: sanitizeFileName(fileName),
        type: fileType,
      } as any);
      const apiUrl = `https://apiuploadedoc.nacencomm.vn/api/data/Upload?taikhoan=dangvucuong&thumucluu=anhuploadturs`;
      const response = await fetch(apiUrl, {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      if (!response.ok) {
        const errorResponse = await response.text();
        console.error("Error Response Body:", errorResponse);
        throw new Error(`Server Error: ${response.status}`);
      }
      const result = await response.json();
      if (result && result[0].Linkfile) {
        return result[0].Linkfile;
      }
      Alert.alert("Lỗi", "Không chuyển được file sang PDF.");
    } catch (error) {
      console.error("Error converting image to PDF:", error);
      Alert.alert("Lỗi", "Không tải được tài liệu. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    (async () => {
      if (!baseUri) return;
      try {
        const decodedUri = decodeURIComponent(baseUri);
        const content = await readFile(decodedUri);
        setPdfArrayBuffer(content.arrayBuffer);
      } catch (error) {
        console.log("BaseUri call", error);
        setPdfArrayBuffer(null);
      }
    })();
  }, [baseUri]);

  useEffect(() => {
    (async () => {
      let filePath = "";
      let fileName = "";
      let fileType = "";

      if (imageUri) {
        filePath = imageUri;
        fileType = "image/jpeg";
        fileName = imageUri.split("/").pop() || "image.jpg";
      } else if (incomingPdfUri) {
        filePath = incomingPdfUri;
        fileName = incomingPdfUri.split("/").pop() || "document.pdf";
        fileType = "application/pdf";
      } else {
        try {
          const res: DocumentPicker.DocumentPickerResult =
            await DocumentPicker.getDocumentAsync({
              type: listFileType,
              copyToCacheDirectory: true,
              multiple: false,
            });
          if (res.canceled) {
            goHome(navigation);
            return;
          }
          const resFile: DocumentPickerAsset = res.assets[0];
          if (resFile.size && resFile.size > 20 * 1024 * 1024) {
            Alert.alert(
              "Lỗi",
              "File quá kích thước cho phép (20MB). Vui lòng chọn file nhỏ hơn."
            );
            goHome(navigation);
            return;
          }
          filePath = resFile.uri;
          fileName = resFile.name;
          fileType = resFile.mimeType || "application/pdf";
        } catch (err: any) {
          Alert.alert(
            "Lỗi",
            err?.message || "Đã xảy ra lỗi khi chọn file. Vui lòng thử lại."
          );
          goHome(navigation);
          return;
        }
      }

      if (!filePath) {
        goHome(navigation);
        return;
      }

      const pdfUrl = await convertToPDF(filePath, fileName, fileType);
      const uriToShow = pdfUrl || filePath;
      setPdfUri(uriToShow);
      setBaseUri(uriToShow);
      // Giữ file local để SignFile (FormData cần file://, không gửi URL https)
      setLocalSignUri(filePath);
      setLocalSignName(sanitizeFileName(fileName || "document.pdf"));
      setInsertType("");
      setvisibleFile(true);
    })();
  }, []);

  const ensureLocalPdfForSign = async (
    preferredLocalUri: string,
    remoteOrBaseUri: string,
    fileName: string
  ) => {
    // PDF local gốc: dùng trực tiếp
    if (
      preferredLocalUri &&
      !isRemoteUri(preferredLocalUri) &&
      /\.pdf($|\?)/i.test(preferredLocalUri)
    ) {
      return {
        uri: normalizeLocalUri(preferredLocalUri),
        name: fileName.endsWith(".pdf") ? fileName : `${fileName}.pdf`,
      };
    }

    // Ảnh/Word đã convert → tải Linkfile về cache rồi upload
    const sourceUri = remoteOrBaseUri || preferredLocalUri;
    if (!sourceUri) {
      throw new Error("Không tìm thấy file để ký.");
    }

    if (!isRemoteUri(sourceUri)) {
      return {
        uri: normalizeLocalUri(sourceUri),
        name: fileName.endsWith(".pdf") ? fileName : "document.pdf",
      };
    }

    const safeName = sanitizeFileName(
      fileName.endsWith(".pdf") ? fileName : "document.pdf"
    );
    const dest = `${FileSystem.cacheDirectory}sign_${Date.now()}_${safeName}`;
    const download = await FileSystem.downloadAsync(sourceUri, dest);
    if (!download?.uri) {
      throw new Error("Không tải được file PDF để ký.");
    }
    return { uri: download.uri, name: safeName };
  };

  const handleInsertBtn = (type: string) => setInsertType(type);

  const handleCancelBtn = () => {
    if (editMode) {
      setEditMode(false);
    }
    handleInsertBtn("");
  };

  const getEffectiveWrapperSize = (): Size => {
    if (wrapperSize.width > 0 && wrapperSize.height > 0) {
      return wrapperSize;
    }
    const { width, height } = Dimensions.get("window");
    return { width, height: height - 180 };
  };

  const handleInsert = async (
    _content: string = "",
    _position: { x: number; y: number } = { x: 100, y: 100 },
    _dimensions: { width: number; height: number },
    _type: string
  ) => {
    try {
      setLoading(true);
      if (!pdfArrayBuffer) {
        Alert.alert("Lỗi", "Tài liệu chưa tải xong. Vui lòng đợi và thử lại.");
        return;
      }

      const pageNumber = currentPage > 0 ? currentPage : 1;
      const effectiveWrapper = getEffectiveWrapperSize();
      const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
      const pages = pdfDoc.getPages();
      const page = pages[pageNumber - 1];
      if (!page) {
        throw new Error(`Invalid page index: ${pageNumber}`);
      }

      // Chỉ lấy kích thước trang để quy đổi tọa độ — KHÔNG ghi/chèn PDF,
      // giữ nguyên pdfUri đang hiển thị để tránh màn hình trắng.
      const pdfPageSize = {
        width: page.getWidth(),
        height: page.getHeight(),
      };
      const dims = _calcDims(pdfPageSize, _dimensions, effectiveWrapper);
      const { x, y } = _calcPosition(
        pdfPageSize,
        _position,
        effectiveWrapper,
        _type === InsertTypes.TEXT ? 14 : dims.height
      );

      setInsertType("");
      setIsInserted(true);
      setLastContent(_content);
      setEditMode(false);
      setParams({
        page: pageNumber,
        pos: { x, y },
        dims: { ..._dimensions },
        pdfRect: { x, y, width: dims.width, height: dims.height },
      } as InsertCompleteProps);
      setisSave(true);
      setvisibleFile(false);
    } catch (error) {
      console.error("handleInsert error:", error);
      Alert.alert("Lỗi", "Không lưu được vùng ký. Vui lòng thử lại.");
      setInsertType("");
    } finally {
      setLoading(false);
    }
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setWrapperSize({ width, height });
  };

  const handleLoadCompelete = (_pages: number) => {
    setCurrentPage((prev) => (prev > 0 ? prev : 1));
  };
  const handlePageChanged = (page: number) => setCurrentPage(page);

  useEffect(() => {
    setSelected(!!insertType);
    if (insertType) {
      lastInsertType.current = insertType;
    }
  }, [insertType]);

  const handlePressInsert = () => {
    try {
      if (editorRef?.current) {
        editorRef.current.handleInsert();
      }
    } catch (error) {
      console.log("Lỗi save toạ độ ký ", error);
      Alert.alert("Lỗi", "Không lưu được vùng ký. Vui lòng thử lại.");
    }
  };

  const handleSaveVneId = async () => {
    const rect = (params as any)?.pdfRect;
    if (!rect || !params?.page || !pdfArrayBuffer) {
      Alert.alert("Lỗi", "Chưa có vùng ký. Hãy khoanh vùng trên tài liệu.");
      return;
    }
    const certificates = vneidCert?.certificates || [];
    if (!certificates[0]) {
      Alert.alert("Chứng thư", "Chứng thư VNeID không có dữ liệu để ký.");
      return;
    }

    setModalVisible(true);
    setVneidStatus("Đang băm PDF trên máy...");
    try {
      const source = new Uint8Array(pdfArrayBuffer);
      const prepared = await pdfVneId.prepareSignedPdf(source, {
        pageNumber: params.page,
        rect,
      });
      const material = pdfVneId.digestForVneId(prepared, certificates);
      setVneidStatus("Đang gửi mã băm sang VNeID...");
      const signedResult = await vneidClient.signHash(
        vneidClient.DEFAULT_GATEWAY,
        {
          credentialID: vneidCert.credentialID,
          documentName: route.params?.fileName || localSignName || "tai-lieu.pdf",
          digestValue: material.digestValue,
          shouldStop: () => !alive.current,
        },
        setVneidStatus
      );
      setVneidStatus("Đang ghép chữ ký vào PDF trên máy...");
      const signed = pdfVneId.embedVneIdSignature(
        prepared,
        material,
        signedResult.signature
      );
      let binary = "";
      const chunk = 0x2000;
      for (let index = 0; index < signed.length; index += chunk) {
        binary += String.fromCharCode.apply(null, signed.subarray(index, index + chunk));
      }
      const output = `${FileSystem.documentDirectory}vneid-${Date.now()}.pdf`;
      await FileSystem.writeAsStringAsync(output, encode(binary), {
        encoding: FileSystem.EncodingType.Base64,
      });
      setModalVisible(false);
      Alert.alert("Ký VNeID thành công", `Handle: ${signedResult.handle}`);
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(output, { mimeType: "application/pdf" });
      }
    } catch (error: any) {
      setModalVisible(false);
      Alert.alert("Lỗi", error?.message || "Ký VNeID thất bại.");
    }
  };

  const handleSave = async () => {
    if (isVneid) {
      await handleSaveVneId();
      return;
    }
    if (!params?.pos || !params?.dims || !params?.page) {
      Alert.alert("Lỗi", "Chưa có tọa độ vùng ký. Vui lòng thiết lập lại.");
      return;
    }
    if (!global.idcts) {
      Alert.alert("Lỗi", "Không lấy được thông tin chứng thư số (idcts).");
      return;
    }

    setisSave(true);
    setvisibleFile(false);
    onInsertComplete && onInsertComplete(params);
    setModalVisible(true);

    const controller = new AbortController();
    signAbortRef.current = controller;
    const timeoutId = setTimeout(() => controller.abort(), SIGN_TIMEOUT_MS);

    try {
      const w = params.dims.width;
      const h = params.dims.width;
      const x = params.pos.x;
      const y = params.pos.y + h;
      const toadoky = `${x} ${y} ${w} ${h} ${params.page}`;
      const url =
        "https://signrsfileca2.nacencomm.vn/api/data/SignFile?idcts=" +
        encodeURIComponent(String(global.idcts)) +
        "&toadoky=" +
        encodeURIComponent(toadoky);

      const localFile = await ensureLocalPdfForSign(
        localSignUri,
        baseUri,
        localSignName
      );

      const body = new FormData();
      body.append("resource", {
        uri: localFile.uri,
        name: localFile.name,
        type: "application/pdf",
      } as any);

      // Không set Content-Type multipart thủ công — RN tự gắn boundary
      const response = await fetch(url, {
        method: "POST",
        body,
        signal: controller.signal,
      });

      const rawText = await response.text();
      let result: any = null;
      try {
        result = rawText ? JSON.parse(rawText) : null;
      } catch {
        result = null;
      }

      const item = Array.isArray(result) ? result[0] : result;
      const kq = item?.kq;
      const mota = item?.Mota || item?.mota;
      const linkfile = item?.Linkfile || item?.linkfile;
      const isSuccess =
        response.ok &&
        item != null &&
        (Number(kq) > 0 || !!linkfile);

      if (isSuccess) {
        Alert.alert(
          "Thành công",
          mota || "Đã gửi yêu cầu ký văn bản.",
          [{ text: "OK", onPress: () => goHome(navigation) }]
        );
        return;
      }

      const errMsg =
        mota ||
        (!response.ok
          ? `Máy chủ trả lỗi HTTP ${response.status}`
          : "Không ký được tài liệu. Vui lòng thử lại.");
      Alert.alert("Lỗi", errMsg);
    } catch (error: any) {
      console.log("handleSave", error);
      if (error?.name === "AbortError") {
        Alert.alert(
          "Hết thời gian",
          "Yêu cầu ký quá lâu. Vui lòng thử lại."
        );
      } else {
        Alert.alert(
          "Lỗi",
          error?.message || "Không ký được tài liệu. Vui lòng thử lại."
        );
      }
    } finally {
      clearTimeout(timeoutId);
      signAbortRef.current = null;
      setModalVisible(false);
    }
  };

  const handleDelete = () => {
    setIsInserted(false);
    setInsertType("");
    setParams({} as InsertCompleteProps);
    setisSave(false);
    setvisibleFile(true);
  };

  useEffect(() => {
    if (editMode) {
      setInsertType(lastInsertType.current);
    }
  }, [editMode]);

  const handleCloseViewer = () => {
    pdfUri && setPdfUri("");
    setIsInserted(false);
    setEditMode(false);
    setvisibleFile(false);
    goHome(navigation);
  };

  return (
    <SafeAreaView style={styles.screen}>
      <View style={styles.menuBar}>
        <View style={styles.insertBtnRow}>
          {isVneid && !insertType ? (
            <View style={styles.vneidTitle}>
              <Text style={styles.vneidTitleText}>Khoanh vùng ký</Text>
              <Text style={styles.vneidSubText} numberOfLines={1}>
                {vneidCert?.subjectDN || vneidCert?.serialNumber}
              </Text>
            </View>
          ) : null}
          {isInserted ? (
            <>
              <TouchableOpacity
                style={styles.insertBtn}
                onPress={() => setEditMode(true)}
              >
                <AntDesign name="edit" size={24} color="black" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.insertBtn}
                onPress={handleDelete}
                disabled={editMode}
              >
                <AntDesign name="delete" size={24} color="red" />
              </TouchableOpacity>
            </>
          ) : null}
        </View>
        <View style={styles.extraBtns}>
          {!insertType ? (
            <TouchableOpacity onPress={handleCloseViewer}>
              <Ionicons name="close-circle" size={32} color="red" />
            </TouchableOpacity>
          ) : (
            <>
              <TouchableOpacity
                style={styles.insertBtn}
                onPress={handlePressInsert}
                disabled={!selected}
              >
                <Ionicons name="checkmark-circle" size={32} color="green" />
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.insertBtn}
                onPress={handleCancelBtn}
              >
                <Ionicons name="close-circle" size={32} color="red" />
              </TouchableOpacity>
            </>
          )}
        </View>
      </View>

      <View style={styles.pdfArea} onLayout={onLayout}>
        {pdfUri ? (
          <>
            <PdfViewer
              pdfUri={pdfUri}
              containerWidth={wrapperSize.width}
              containerHeight={wrapperSize.height}
              handleLoadCompelete={handleLoadCompelete}
              handlePageChanged={handlePageChanged}
            />
            <Editor
              insertType={insertType}
              selected={selected}
              onCancel={() => handleInsertBtn("")}
              onInsert={handleInsert}
              setLoading={setLoading}
              editMode={editMode}
              lastContent={lastContent}
              isInserted={isInserted}
              regionLabel={isVneid ? "VNeID" : ""}
              ref={editorRef}
            />
          </>
        ) : (
          <View style={styles.emptyState}>
            <ActivityIndicator size="large" />
            <Text style={styles.emptyText}>Đang tải tài liệu...</Text>
          </View>
        )}
      </View>

      <View style={styles.buttonRow}>
        {isVneid && visibleFile && (
          <Text style={styles.regionHint}>
            Kéo ô chữ ký tới vị trí cần ký, chỉnh kích thước, rồi bấm dấu tích để chốt vùng.
          </Text>
        )}
        {visibleFile && (
          <TouchableOpacity
            style={[
              styles.primaryBtn,
              !pdfArrayBuffer && styles.primaryBtnDisabled,
            ]}
            disabled={!pdfArrayBuffer}
            onPress={() => handleInsertBtn(InsertTypes.DEFAULT)}
          >
            <Text style={styles.primaryBtnText}>
              {pdfArrayBuffer
                ? isVneid
                  ? "Khoanh vùng ký"
                  : "Thiết lập vùng ký"
                : "Đang chuẩn bị tài liệu..."}
            </Text>
          </TouchableOpacity>
        )}
        {isSave && (
          <TouchableOpacity style={styles.primaryBtn} onPress={handleSave}>
            <Text style={styles.primaryBtnText}>
              {isVneid ? "Ký bằng VNeID" : "Ký văn bản"}
            </Text>
          </TouchableOpacity>
        )}
      </View>

      <Modal transparent visible={loading} animationType="fade">
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="large" color="#1858EA" />
          <Text style={styles.loadingText}>Đang xử lý...</Text>
        </View>
      </Modal>

      <Modal
        transparent
        visible={loadingVisible}
        animationType="fade"
        onRequestClose={() => {}}
      >
        <View style={style.container}>
          <View style={style.loadingBox}>
            <Text style={style.loadingTitle}>CA2 REMOTE SIGNING</Text>
            <Text style={style.loadingMessage}>
              {isVneid
                ? vneidStatus || "Đang ký VNeID trên máy"
                : "Đang xử lý yêu cầu\nVui lòng đợi trong giây lát"}
            </Text>
            <ActivityIndicator size="large" color="#fff" />
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: "#fff",
  },
  pdfArea: {
    flex: 1,
    position: "relative",
    backgroundColor: "#f5f5f5",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  emptyText: {
    marginTop: 12,
    color: "#666",
    fontSize: 14,
  },
  buttonRow: {
    justifyContent: "center",
    alignItems: "center",
    padding: 12,
    gap: 8,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  regionHint: {
    width: "90%",
    color: "#334155",
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 4,
  },
  vneidTitle: {
    paddingLeft: 8,
    maxWidth: 230,
  },
  vneidTitleText: {
    color: "#0F172A",
    fontWeight: "700",
    fontSize: 15,
  },
  vneidSubText: {
    color: "#64748B",
    fontSize: 12,
    marginTop: 2,
  },
  primaryBtn: {
    width: "90%",
    height: 48,
    backgroundColor: "#1858EA",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  primaryBtnDisabled: {
    backgroundColor: "#9BB6F5",
  },
  primaryBtnText: {
    color: "white",
    textAlign: "center",
    fontSize: 14,
    lineHeight: 20,
  },
  loadingOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.35)",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingText: {
    marginTop: 12,
    color: "#fff",
    fontSize: 14,
  },
  menuBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    minHeight: 52,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
    borderBottomColor: "#eee",
    borderBottomWidth: 1,
  },
  extraBtns: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
  },
  insertBtnRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 5,
    minWidth: 60,
  },
  insertBtn: {
    alignItems: "center",
    marginEnd: 10,
  },
});

const style = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(52, 52, 52, 0.8)",
    zIndex: 999,
  },
  loadingBox: {
    width: 327,
    paddingVertical: 24,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  loadingTitle: {
    fontSize: 20,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 8,
  },
  loadingMessage: {
    fontSize: 16,
    lineHeight: 24,
    textAlign: "center",
    color: "#fff",
    marginBottom: 16,
  },
});

export default PDFViewer;
