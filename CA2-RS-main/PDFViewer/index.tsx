/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Button,
  StyleSheet,
  LayoutChangeEvent,
  ActivityIndicator,
} from "react-native";
import * as DocumentPicker from "expo-document-picker";
import { useRoute } from "@react-navigation/native";

import MenuBar from "./components/MenuBar";
import Editor from "./components/Editor";
import PdfViewer from "./components/Pdf";
import {
  _calcDims,
  _calcPosition,
  _uint8ToBase64,
  imgUrlToBase64,
  readFile,
  writeFile,
} from "./helpers";
import { PDFDocument, rgb } from "pdf-lib";
import { InsertCompleteProps, InsertTypes } from "./constants";
import { DocumentPickerAsset } from "expo-document-picker";

type Size = {
  width: number;
  height: number;
};

interface PDFViewerProps {
  onInsertComplete?: (props: InsertCompleteProps) => any;
}

const PDFViewer = (props: PDFViewerProps) => {
  const { onInsertComplete } = props;
  const route = useRoute<any>();
  const initialPdfUri = route.params?.pdfUri ?? "";
  const initialImageUri = route.params?.imageUri ?? "";
  const [pdfUri, setPdfUri] = useState<string>(initialPdfUri);
  const [totalPage, setTotalPage] = useState<number>(0);
  const [currentPage, setCurrentPage] = useState<number>(0);
  const [insertType, setInsertType] = useState<string>("");
  const [selected, setSelected] = useState<boolean>(false);
  const [wrapperSize, setWrapperSize] = useState<Size>({ width: 0, height: 0 });
  const lastInsertType = useRef<string>("");

  const [baseUri, setBaseUri] = useState<string>("");
  const [editedUri, setEditedUri] = useState<string>("");
  const [editMode, setEditMode] = useState<boolean>(false);
  const [lastContent, setLastContent] = useState<string>("");

  const [params, setParams] = useState<InsertCompleteProps>({} as any);
  const [isInserted, setIsInserted] = useState<boolean>(false);

  const editorRef = useRef<{ handleInsert: any }>(null);
  const [loading, setLoading] = useState(false);
  const [pdfArrayBuffer, setPdfArrayBuffer] = useState<any>(null);

  useEffect(() => {
    if (initialPdfUri) {
      setBaseUri(initialPdfUri);
    }
  }, [initialPdfUri]);

  useEffect(() => {
    if (initialImageUri) {
      (async () => {
        try {
          setLoading(true);
          const image = await readFile(initialImageUri);
          const pdfDoc = await PDFDocument.create();
          const pdfImage = await pdfDoc.embedJpg(image.arrayBuffer);
          const { width, height } = pdfImage.scale(1);
          const page = pdfDoc.addPage([width, height]);
          page.drawImage(pdfImage, { x: 0, y: 0, width, height });
          const pdfBytes = await pdfDoc.save();
          const pdfBase64 = _uint8ToBase64(pdfBytes);
          const newPath = await writeFile(pdfBase64);
          if (newPath) {
            setPdfUri(newPath);
            setBaseUri(newPath);
          }
        } catch (err) {
          console.error("Error converting image to PDF:", err);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [initialImageUri]);

  const listFileType = [
    "application/pdf",
    // "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    // "application/msword",
    // "text/plain",
    // "application/vnd.ms-excel",
    // "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    // "application/xml",
    // "application/rtf",
  ];
  const pickPDF = async () => {
    try {
      // const res = await DocumentPicker.getDocumentAsync({
      //   type: [DocumentPicker.types.pdf],
      //   copyTo: 'cachesDirectory',
      // });
      const res: DocumentPicker.DocumentPickerResult =
        await DocumentPicker.getDocumentAsync({
          type: listFileType,
          copyToCacheDirectory: true,
          multiple: false,
        });
      if (res.canceled) {
        console.log("User cancelled the file picker.");
        return; // Dừng lại nếu không có file được chọn
      }
      const resFile: DocumentPickerAsset = res.assets[0];
      const uri = resFile.uri;
      setPdfUri(uri);
      setBaseUri(uri);
      setInsertType("");
    } catch (err) {
      // if (DocumentPicker.isCancel(err)) {
      //   console.log('User cancelled the file picker.');
      // } else {
      //   console.log('Error while picking the file: ', err);
      // }
      console.log("Error while picking the file: ", err);
    }
  };

  useEffect(() => {
    (async () => {
      if (baseUri) {
        const content = await readFile(baseUri);
        setPdfArrayBuffer(content.arrayBuffer);
      }
    })();
  }, [baseUri]);

  const handleInsertBtn = (type: string) => setInsertType(type);

  const handleCancelBtn = () => {
    if (editMode) {
      setEditMode(false);
      setPdfUri(editedUri);
    }
    handleInsertBtn("");
  };

  const handleInsert = async (
    _content: string = "",
    _position: {
      x: number;
      y: number;
    } = { x: 0, y: 0 },
    _dimensions: {
      width: number;
      height: number;
    },
    _type: string
  ) => {
    setLoading(true);
    const pdfDoc = await PDFDocument.load(pdfArrayBuffer);
    const pages = pdfDoc.getPages();
    const page = pages[currentPage - 1];
    const dims = _calcDims(
      { width: page.getWidth(), height: page.getHeight() },
      _dimensions,
      wrapperSize
    );

    switch (_type) {
      case InsertTypes.TEXT: {
        const { x, y } = _calcPosition(
          { width: page.getWidth(), height: page.getHeight() },
          _position,
          wrapperSize,
          14
        );
        page.drawText(_content, { x: x, y: y, size: 14, color: rgb(0, 0, 0) });
        break;
      }
      case InsertTypes.DEFAULT: {
        const arrayBuffer = (await imgUrlToBase64(_content)) as ArrayBuffer;
        const pdfImage = await pdfDoc.embedJpg(arrayBuffer);
        const { x, y } = _calcPosition(
          { width: page.getWidth(), height: page.getHeight() },
          _position,
          wrapperSize,
          dims.height
        );
        page.drawImage(pdfImage, { x: x, y: y, ...dims });
        break;
      }
      case InsertTypes.IMAGE: {
        const image = await readFile(_content);
        const pdfImage = await pdfDoc.embedJpg(image.arrayBuffer);
        const { x, y } = _calcPosition(
          { width: page.getWidth(), height: page.getHeight() },
          _position,
          wrapperSize,
          dims.height
        );
        page.drawImage(pdfImage, { x: x, y: y, ...dims });
        break;
      }
    }
    const pdfBytes = await pdfDoc.save();
    const pdfBase64 = _uint8ToBase64(pdfBytes);
    const newPath = await writeFile(pdfBase64);
    if (newPath) {
      setPdfUri(newPath);
      setEditedUri(newPath);
    }
    setInsertType("");
    setIsInserted(true);
    setLastContent(_content);
    setEditMode(true);
    setLoading(false);
    setParams({
      page: currentPage,
      pos: { ..._position },
      dims: { ..._dimensions },
    });
  };

  const onLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setWrapperSize({ width, height });
  };

  const handleLoadCompelete = (numberOfPages: number, _path?: string) => {
    setTotalPage(numberOfPages);
  };
  const handlePageChanged = (page: number) => setCurrentPage(page);

  useEffect(() => {
    setSelected(!!insertType);
    if (insertType) {
      lastInsertType.current = insertType;
    }
  }, [insertType]);

  const handlePressInsert = () => {
    if (editorRef && editorRef.current) {
      editorRef.current.handleInsert();
    }
  };

  const handleSave = () => {
    onInsertComplete && onInsertComplete(params);
  };

  const handleDelete = () => {
    setIsInserted(false);
    setPdfUri(baseUri);
  };

  useEffect(() => {
    if (editMode) {
      setInsertType(lastInsertType.current);
      setPdfUri(baseUri);
    }
  }, [editMode]);

  const handleCloseViewer = () => {
    pdfUri && setPdfUri("");
    setIsInserted(false);
    setEditMode(false);
  };

  return (
    <View style={[styles["flex-1"], styles.relative]}>
      {!pdfUri && !initialImageUri && (
        <View style={styles.buttonRow}>
          <Button title="Pick PDF" onPress={pickPDF} />
        </View>
      )}
      {pdfUri && (
        <View style={[styles.wrapper, styles.bgWhite]}>
          <MenuBar
            currentPage={currentPage}
            totalPage={totalPage}
            handleCloseViewer={handleCloseViewer}
            handleInsertBtn={handleInsertBtn}
            handleCancelBtn={handleCancelBtn}
            insertType={insertType}
            selected={selected}
            onInsert={handlePressInsert}
            isInserted={isInserted}
            editMode={editMode}
            handleSave={() => handleSave()}
            handleEdit={() => setEditMode(true)}
            handleDelete={() => handleDelete()}
          />
          <View style={styles.center}>
            <View style={[styles.relative]} onLayout={onLayout}>
              <PdfViewer
                pdfUri={pdfUri}
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
                ref={editorRef}
              />
            </View>
          </View>
          {loading && (
            <View style={[styles.wrapper, styles.overlay]}>
              <ActivityIndicator size={40} />
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  relative: {
    position: "relative",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    padding: 5,
    top: 60,
  },
  wrapper: {
    position: "absolute",
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
  },
  z100: {
    zIndex: 100,
  },
  bgWhite: {
    backgroundColor: "#fff",
  },
  "flex-1": {
    flex: 1,
  },
  center: {
    flex: 1,
    justifyContent: "center",
    backgroundColor: "#00000050",
  },
  extraSection: {
    position: "absolute",
    zIndex: 150,
  },
  extraSectionToggler: {
    borderWidth: 0,
    marginLeft: 5,
  },
  extraSectionRow: {
    flexDirection: "row",
    minWidth: 60,
  },
  extraSectionBtn: {
    flex: 1,
    fontWeight: "bold",
    alignItems: "center",
    padding: 2,
    borderWidth: 1,
    borderRadius: 4,
    borderColor: "#00000050",
    backgroundColor: "#fff",
  },
  overlay: {
    zIndex: 200,
    backgroundColor: "#00000020",
    justifyContent: "center",
    alignContent: "center",
  },
});

export default PDFViewer;
