import { createStackNavigator } from "@react-navigation/stack";
import { StyleSheet, View } from "react-native";
import TaiKhoan from "../TaiKhoan/TaiKhoan";
import Home from "./home";
import TabBottom from "../../layout/TabBottom";

const HomeStack = createStackNavigator();

export default function HomeWrapper({ navigation, route }) {
  return (
    <View style={styles.container}>
      <HomeStack.Navigator
        initialRouteName="Home"
        screenOptions={{
          headerShown: false,
        }}
      >
        <HomeStack.Screen name="Home" component={Home} />
        <HomeStack.Screen name="TaiKhoan" component={TaiKhoan} />
      </HomeStack.Navigator>
      <TabBottom navigation={navigation} route={route} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: "100%",
  },
});
