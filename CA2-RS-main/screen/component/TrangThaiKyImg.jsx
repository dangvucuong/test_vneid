import React from "react";
import { Image, StyleSheet } from "react-native";
import {
  CHUA_KY,
  DA_KY,
  TU_CHOI_KY,
  TYPE_SAI,
  DAU_VAO_KY_SAI,
  DA_XOA_YEU_CAU_KY,
} from "../../utils/constant";

const TrangthaikyImg = ({ Trangthaiky }) => {
  const getImageSource = () => {
    switch (Trangthaiky) {
      case CHUA_KY:
        return require("../../img/DocStatusWaiting.png");
      case DA_KY:
        return require("../../img/DocStatusApproved.png");
      case TU_CHOI_KY:
      case TYPE_SAI:
      case DAU_VAO_KY_SAI:
      case DA_XOA_YEU_CAU_KY:
        return require("../../img/DocStatusRejected.png");
      default:
        return null;
    }
  };

  const source = getImageSource();

  if (!source) return null;

  return <Image style={styles.itemSubIcon} source={source} />;
};

export default TrangthaikyImg;

const styles = StyleSheet.create({
  itemSubIcon: {
    position: "absolute",
    width: 16,
    height: 16,
    bottom: -8,
    right: -8,
  },
});