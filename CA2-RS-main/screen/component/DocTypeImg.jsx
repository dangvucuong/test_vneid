import React from "react";
import { Image, StyleSheet } from "react-native";
import {
  DOCUMENT_TYPE_MULTIPLE,
  DOCUMENT_TYPE_SYSTEM,
  DOCUMENT_TYPE_SINGLE,
} from "../../utils/constant";

const DocTypeImg = ({ type }) => {
  const getImageSource = () => {
    switch (type) {
      case DOCUMENT_TYPE_MULTIPLE:
        return require("../../img/DocumentTypeMultiple.png");

      case DOCUMENT_TYPE_SYSTEM:
        return require("../../img/DocumentTypeSystem.png");
      case DOCUMENT_TYPE_SINGLE:
      default:
        return require("../../img/DocumentTypeSingle.png");
    }
  };

  const source = getImageSource();

  if (!source) return null;

  return <Image style={styles.itemIcon} source={source} />;
};

export default DocTypeImg;

const styles = StyleSheet.create({
  itemIcon: {
    width: 24,
    height: 24,
  },
});
