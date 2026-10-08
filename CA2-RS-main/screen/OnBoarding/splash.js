
import { StyleSheet, Text, View, Image, TouchableOpacity } from 'react-native';
import AppStyle from '../../styles/AppStyle';
import { useFonts } from 'expo-font';
import { AppRegistry,Alert } from "react-native";
import ReactNativeBiometrics, { BiometryTypes } from 'react-native-biometrics'
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { useState, useEffect } from 'react';
export default function Splash({ navigation, route }) {

useEffect(() => {
    const getStart = async () => {
      const value = await AsyncStorage.getItem('@startscreen');
    //  alert(value);
        if (value == '0') {
            setTimeout(() => {navigation.navigate("StartLogin")}, 1500)
            
        }
        else {
            setTimeout(() => {navigation.navigate("Start2")}, 1500)
            //navigation.navigate("Start2")
        }
    }
   getStart();
   
  }, [])
  
  //const navigation = props.useNavigation();
  return (
    <View style={AppStyle.container}>
      {/* <Image source={require('../img/Vietnam.png')} style={AppStyle.vietnam} />

      <Image source={require('../img/start2.png')} style={AppStyle.startLogo} />
      <TouchableOpacity style={AppStyle.skipContainer} onPress={skipClick}>
        <Text style={AppStyle.skipText}>Bỏ qua</Text>
      </TouchableOpacity> */}

      <Image source={require('../../img/splash.png')} style={{
      width: 343,
      height: 260,
     // left: 16,
      }} resizeMode='contain'/>
      {/* <Text style={AppStyle.startTextContent}>
        <Text style={AppStyle.start2Text}>Ký số mọi lúc, mọi nơi</Text>{"\n"}
        <Text style={AppStyle.start2TextSmall}>Làm việc từ xa, không cần USB Token, ký ngay trên {"\n"} thiết bị di động</Text>
      </Text>


      <Image source={require('../img/dots1.png')} style={AppStyle.dotsStyle} />
      <TouchableOpacity style={AppStyle.buttonContainer} onPress={()=>{navigation.navigate("Start3")}}>
        <Text style={AppStyle.buttonText}>Tiếp tục</Text>
      </TouchableOpacity> */}

    </View>
  );
}

