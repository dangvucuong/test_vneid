import { StyleSheet } from "react-native";
import React, { useState, useEffect } from "react";

export default StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  startLogo: {
    position: "absolute",
    width: 58,
    height: 58,
    top: 110,
  },

  vietnam: {
    position: "absolute",
    width: 24,
    height: 24,
    left: 16,
    top: 60,
  },
  startImg: {
    position: "absolute",
    width: 343,
    height: 260,
    // left: 16,
    top: 192,
  },
  buttonContainer: {
    position: "absolute",
    width: 343,
    height: 44,
    bottom: 100,
    backgroundColor: "#1858EA",
    borderRadius: 8,
    alignItems: "center",
  },

  buttonContainerLink: {
    position: "absolute",
    width: 343,
    height: 44,
    bottom: 150,
    borderRadius: 8,
  },

  buttonText: {
    position: "absolute",
    top: "27.27%",
    bottom: "27.27%",
    fontStyle: "normal",
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#FFFFFF",
    alignItems: "center",
    justifyContent: "center",
  },

  startTextContent: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 0,
    gap: 8,
    position: "absolute",
    width: "100%",
    height: 200,
    top: 450,
  },
  start2Text: {
    width: 343,
    height: 28,
    fontSize: 20,
    lineHeight: 35,
    textAlign: "center",
    color: "#0F172A",
  },
  start2TextSmall: {
    width: "80%",
    height: 40,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#6B7280",
    marginTop: 50,
  },

  skipContainer: {
    position: "absolute",
    width: 45,
    height: 20,
    right: 10,
    top: 62,
  },
  skipText: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "right",
    color: "#9CA3AF",
  },

  dotsStyle: {
    position: "absolute",
    width: 52,
    height: 8,
    top: 608,
  },

  startLoginText: {
    position: "absolute",
    width: 343,
    height: 34,
    top: 120,
    fontSize: 24,
    textAlign: "center",
    color: "#1959DC",
  },

  startLoginImg: {
    position: "absolute",
    width: 340,
    height: 283,
    top: 183,
  },
  headerContainer: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    padding: 10,
    gap: 8,
    position: "absolute",
    height: 125,
    top: 104,
  },

  headerMainText: {
    height: 28,
    fontSize: 20,
    lineHeight: 25,
    color: "#0F172A",
    flexGrow: 0,
  },

  headerSmallText: {
    height: 20,
    fontSize: 14,
    lineHeight: 25,
    color: "#6B7280",
  },

  loginInputContainer1: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 0,
    gap: 8,
    position: "absolute",
    width: "90%",
    height: 72,
    top: 200,
    borderRadius: 6,
  },

  loginInputContainerHead: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 0,
    gap: 8,
    position: "absolute",
    width: "90%",
    height: 72,
    top: 104,
    borderRadius: 6,
  },

  loginText: {
    width: "90%",
    height: 20,
    fontSize: 14,
    lineHeight: 20,
    color: "#374151",
    alignSelf: "stretch",
    flexGrow: 0,
  },

  // loginInput: { display: "flex", flexDirection: "column", justifyContent: "center", alignItems: "flex-start", paddingTop: 8, paddingRight: 16, paddingLeft: 16, gap: 8,
  //  width: "90%", height: 44, backgroundColor: "#F3F4F6", borderRadius: 6,  alignSelf: "stretch", borderColor:"red" },

  loginInputContainer2: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 0,
    gap: 8,
    position: "absolute",
    width: "90%",
    height: 72,
    borderRadius: 6,
    top: 296,
  },

  loginInputContainer3: {
    display: "flex",
    flexDirection: "column",
    alignItems: "flex-start",
    padding: 0,
    gap: 8,
    position: "absolute",
    width: "90%",
    height: 72,
    borderRadius: 6,
    top: 396,
  },

  linkCSS: {
    position: "absolute",
    width: "90%",
    height: 20,
    bottom: 20,
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: "#336DD1",
  },

  backButtonContainer: {
    position: "absolute",
    width: 24,
    height: 24,
    top: 16,
    left: 16,
  },

  viewBtn: {
    position: "absolute",
    bottom: 30,
    backgroundColor: "white",
    justifyContent: "center",
    alignItems: "center",
  },

  bottomBTN: {
    width: 334,
    height: 44,
    backgroundColor: "#1858EA",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 10,
  },
});
