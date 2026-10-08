import React from 'react';
import {StyleSheet, View} from 'react-native';
import Pdf from 'react-native-pdf';
import { Platform } from 'react-native'

interface PdfViewerProps {
  pdfUri: string;
  containerWidth?: number;
  containerHeight?: number;
  handleLoadCompelete: (
    numberOfPages: number,
    path?: string,
    size?: { width: number; height: number },
  ) => void;
  handlePageChanged: ((page: number) => void) | undefined;
}

const PdfViewer: React.FC<PdfViewerProps> = props => {
  const {
    pdfUri,
    containerWidth = 0,
    containerHeight = 0,
    handleLoadCompelete,
    handlePageChanged,
  } = props;
  if (!pdfUri) return null;

  const normalizedUri =
    pdfUri.startsWith("file://") ||
    pdfUri.startsWith("content://") ||
    pdfUri.startsWith("http")
      ? pdfUri
      : `file://${pdfUri}`;

  const pdfStyle =
    containerWidth > 0 && containerHeight > 0
      ? { width: containerWidth, height: containerHeight }
      : styles.pdf;

  return (
    <View style={styles.container}>
      <Pdf
        source={{ uri: encodeURI(normalizedUri), cache: true }}
        style={pdfStyle}
        onLoadComplete={handleLoadCompelete}
        onPageChanged={handlePageChanged}
        onError={(error) => console.error("PDF load error:", error)}
        trustAllCerts={Platform.OS === 'ios'}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
  },
  pdf: {
    flex: 1,
    width: '100%',
  },
});

export default PdfViewer;
