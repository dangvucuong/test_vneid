import "react-native-gesture-handler";
import { registerRootComponent } from "expo";
import messaging from "@react-native-firebase/messaging";
import App from "./App";

try {
  messaging().setBackgroundMessageHandler(async (remoteMessage) => {
    console.log("Message handled in the background!", remoteMessage);
  });
} catch (error) {
  console.warn("Firebase background handler setup failed:", error);
}

registerRootComponent(App);
