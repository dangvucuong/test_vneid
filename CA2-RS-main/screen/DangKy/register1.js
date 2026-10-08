import React, { useEffect, useState } from 'react';
import { ActionSheetIOS, ActivityIndicator, Alert, Image, Modal, Platform, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import MaskInput from 'react-native-mask-input';
import AppStyle from '../../styles/AppStyle';
import NetInfo from '@react-native-community/netinfo';
import { en, vi } from '../../localize';
import { I18n } from 'i18n-js';
import AsyncStorage from '@react-native-async-storage/async-storage';

const i18n = new I18n();
const CELL_COUNT = 6;

export default function RegInfo({ navigation, route }) {
    const [locale, setlocale] = useState('vi');
    const [defaulLang, setdefaultLang] = useState(false); //vietnam

    i18n.translations = { en, vi };
    i18n.locale = locale;

    useEffect(() => {
        AsyncStorage.getItem('@language').then(value => {
            if (value != null) {
                i18n.fallback = true;
                setlocale(value);
            }
            if (value === 'vi') {
                setdefaultLang(false);
            } else {
                setdefaultLang(true);
            }
        });
    }, []);

    const ChangeNgonngu = () => {
        ActionSheetIOS.showActionSheetWithOptions(
            {
                options: [i18n.t('cancel_text'), 'Tiếng Việt', 'English'],
                // destructiveButtonIndex: 2,
                cancelButtonIndex: 0,
                userInterfaceStyle: 'light',
            },
            async buttonIndex => {
                if (buttonIndex === 0) {
                    // cancel action
                } else if (buttonIndex === 1) {
                    setlocale('vi');
                    i18n.fallback = true;
                    i18n.translations = { en, vi };
                    i18n.locale = 'vi';
                    await AsyncStorage.setItem('@language', 'vi');
                    setdefaultLang(false);
                } else if (buttonIndex === 2) {
                    setlocale('en');
                    i18n.fallback = true;
                    i18n.translations = { en, vi };
                    i18n.locale = 'en';
                    await AsyncStorage.setItem('@language', 'en');
                    setdefaultLang(true);
                }
            },
        );
    };

    const renderButton = () => {
        if (defaulLang === false) {
            return (
                <TouchableOpacity style={{ position: 'absolute', width: 24, height: 24, right: 16 }}
                                  onPress={ChangeNgonngu}>
                    <Image source={require('../../img/Vietnam.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            );
        } else {
            return (
                <TouchableOpacity style={{ position: 'absolute', width: 24, height: 24, right: 16 }}
                                  onPress={ChangeNgonngu}>
                    <Image source={require('../../img/UK.png')} style={{ width: 24, height: 24 }}/>
                </TouchableOpacity>
            );
        }
    };

    const [obj, setObj] = useState([]);
    const [error, setError] = useState('');
    const [loadingVisible, setloadingVisible] = useState(false);
    const [open, setOpen] = useState(false);
    const [value, setValue] = useState(null);

    const isValidObjField = obj => {
        return Object.values(obj).every(value => value);
    };

    const updateError = (error, stateUpdater) => {
        stateUpdater(error);
        setTimeout(() => {
            stateUpdater('');
        }, 2500);
    };

    const createNo_internet = () =>
        Alert.alert('CA2 REMOTE SIGNING', i18n.t('errNointernet'), [
            { text: 'OK', onPress: () => console.log('OK Pressed') },
        ]);

    const SubmitForm = () => {
        setuserinfo({
            HoTen: hoten,
            DiaChi: diachi,
            ThanhPho: tinhtp,
            DienThoai: dienthoai,
            Email: email,
            CCCD: cmnd,
            Noicap: ngaycap,
            Ngaycap: noicap,
            tenmay: tenmay,
            loaimay: loaimay,
            hedieuhanh: hedieuhanh,
            phienban: phienban,
            soseri: uuid,
            makd: makd,
        });
        if (isValidForm()) {
            // alert("Valid");
            //    console.log("data", JSON.stringify(userinfo));
            setloadingVisible(true);
            console.log("userinfo", userinfo);
            NetInfo.fetch().then(state => {
                if (state.isConnected == true) {
                    var url = 'https://apidkmobilesign.nacencomm.vn/api/data/DKMobilesign';
                    fetch(url, {
                        method: 'POST',
                        headers: {
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify(userinfo),
                    })
                        .then((response) => response.json())
                        .then((responseJson) => {
                            const check = responseJson.split('|');
                            const val = parseInt(check[0]);
                            if (val > 0) {
                                global.linkfiledangky = encodeURI(check[1]);
                                setloadingVisible(false);
                                navigation.navigate('Capture', {
                                    cmnd: userinfo.CCCD,
                                    idcts: val,
                                    email: userinfo.email,
                                });
                            } else {
                                setloadingVisible(false);
                                createAlertCustom(i18n.t('register1text21'));
                            }
                        })
                        .catch((error) => {
                            console.error(error);
                        });
                } else {
                    createNo_internet();
                }
            });
        }
    };

    const isValidForm = () => {
        // we will accept only if all of the fields have value
        if (!isValidObjField(userinfo)) return updateError(i18n.t('register1text17'), setError);

        if (!isValidEmail(email)) return updateError(i18n.t('register1text18'), setError);

        return true;
    };

    const isValidEmail = value => {
        const regx = /^([A-Za-z0-9_\-\.])+\@([A-Za-z0-9_\-\.])+\.([A-Za-z]{2,4})$/;
        return regx.test(value);
    };

    const qrinfo = route.params;

    if (qrinfo != null) {
        console.log("qrinfo",qrinfo);
        const arr = qrinfo.split('|');
        const datecap = arr[6];//25022021
        const temp = datecap.substring(0, 2) + '/' + datecap.substring(4, 2) + '/' + datecap.substring(4);
        const info_reg = {
            socmnd: arr[0], // acts as primary key, should be unique and non-empty string
            madinhdanh: arr[1],
            hoten: arr[2],
            ngaysinh: arr[3],
            gioitinh: arr[4],
            diachi: arr[5],
            ngaycap: temp,//arr[6],
            tinhtp: arr[5].split(',')[arr[5].split(',').length - 1].trim(),
        };
    }

    const [userinfo, setuserinfo] = useState({
        HoTen: '',
        DiaChi: '',
        ThanhPho: '',
        DienThoai: '',
        Email: '',
        CCCD: '',
        Noicap: '',
        Ngaycap: '',
        tenmay: global.model,
        loaimay: global.brand,
        hedieuhanh: global.os,
        phienban: Platform.Version,
        soseri: global.UUID,
        makd: '',
    });

    // const { HoTen, DiaChi, ThanhPho, DienThoai, Email, CCCD, Noicap, Ngaycap, tenmay, loaimay, hedieuhanh, phienban, soseri,makd } = userinfo
    //   alert(global.version);

    useEffect(() => {
        const getinfo = async () => {
            const qrinfo = route.params;
            if (qrinfo != null) {
                const arr = qrinfo.split('|');
                const datecap = arr[6];//25022021
                const temp = datecap.substring(0, 2) + '/' + datecap.substring(4, 2) + '/' + datecap.substring(4);
                const info_reg = {
                    socmnd: arr[0], // acts as primary key, should be unique and non-empty string
                    madinhdanh: arr[1],
                    hoten: arr[2],
                    ngaysinh: arr[3],
                    gioitinh: arr[4],
                    diachi: arr[5],
                    ngaycap: temp,//arr[6],
                    tinhtp: arr[5].split(',')[arr[5].split(',').length - 1].trim(),
                    //makd:''
                };

                //    setObj(info_reg);
                sethoten(info_reg.hoten);
                setcmnd(info_reg.socmnd);
                setdiachi(info_reg.diachi);
                setngaycap(info_reg.ngaycap);
                setnoicap(info_reg.hoten);
                settinhtp(info_reg.hoten);
                setemail('');
                settenmay(global.model);
                setloaimay(global.brand);
                sethedieuhanh(global.os);
                setphienban(Platform.Version);
                setuuid(global.UUID);
                setnguoilienhe(info_reg.hoten);
                setdienthoai('');
                setmakd('');
            }
        };
        getinfo();
    }, []);


    const [hoten, sethoten] = useState('');
    const [email, setemail] = useState('');
    const [diachi, setdiachi] = useState('');
    const [tinhtp, settinhtp] = useState('');
    const [cmnd, setcmnd] = useState('');
    const [ngaycap, setngaycap] = useState('');
    const [noicap, setnoicap] = useState('');
    const [tenmay, settenmay] = useState('');
    const [loaimay, setloaimay] = useState('');
    const [hedieuhanh, sethedieuhanh] = useState('');
    const [phienban, setphienban] = useState('');
    const [uuid, setuuid] = useState('');
    const [nguoilienhe, setnguoilienhe] = useState('');
    const [dienthoai, setdienthoai] = useState('');
    const [makd, setmakd] = useState('');
    const [nhanvien, setnhanvien] = useState('');

    const handleOnchangeText = (value, fieldname) => {
        //setuserinfo({ ...userinfo, [fieldname]: value })
        switch (fieldname) {
            case 'hoten':
                sethoten(value);
                break;
            case 'email':
                setemail(value);
                break;
            case 'diachi':
                setdiachi(value);
                break;
            case 'tinhtp':
                settinhtp(value);
                break;
            case 'cmnd':
                setcmnd(value);
                break;
            case 'ngaycap':
                setngaycap(value);
                break;
            case 'noicap':
                setnoicap(value);
                break;
            case 'tenmay':
                settenmay(value);
                break;
            case 'loaimay':
                setloaimay(value);
                break;
            case 'hedieuhanh':
                sethedieuhanh(value);
                break;
            case 'phienban':
                setphienban(value);
                break;
            case 'uuid':
                setuuid(value);
                break;
            case 'nguoilienhe':
                setnguoilienhe(value);
                break;
            case 'dienthoai':
                setdienthoai(value);
                break;
            case 'makd':
                setmakd(value);
                break;
        }
    };

    const countries = ['Egypt', 'Canada', 'Australia', 'Ireland'];
    return (
        <ScrollView style={{ flex: 1 }} automaticallyAdjustContentInsets={true}
                    contentContainerStyle={{ paddingBottom: 200, width: '100%', flexGrow: 1, backgroundColor: '#fff' }}>
            <Modal
                animationType="slide"
                transparent={true}
                visible={loadingVisible}
                onRequestClose={() => {
                    //  Alert.alert("Modal has been closed.");ß
                    setModalVisible(!loadingVisible);
                }}>

                <View style={styles.containerModal}>
                    <View style={{
                        'position': 'absolute',
                        'width': 327,
                        'height': 160,
                        'top': 239,
                        'backgroundColor': '#FFFFFF',
                        'borderRadius': 8,
                    }}>
                        <Text
                            style={{
                                'position': 'absolute',
                                'width': 297,
                                'height': 48,
                                'left': 12,
                                'top': 24,
                                'fontSize': 20,
                                'lineHeight': 24,
                                'textAlign': 'center',
                                'color': '#111827',
                                fontWeight: 'bold',
                            }}
                        >CA2 REMOTE SIGNING</Text>

                        <Text style={{
                            'position': 'absolute',
                            'width': 297,
                            'height': 48,
                            'left': 12,
                            'top': 58,
                            'fontSize': 16,
                            'lineHeight': 24,
                            'textAlign': 'center',
                            'color': '#111827',
                        }}>{i18n.t('register1text19')}{'\n'}{i18n.t('register1text20')}</Text>
                        <ActivityIndicator size="large" style={{ top: 110 }} />
                    </View>
                </View>
            </Modal>

            <View style={{ alignItems: 'center', backgroundColor: '#FFFFFF', width: '100%', flex: 1 }}>
                <View style={{
                    'width': '100%',
                    'height': 70,
                    'left': 0,
                    'top': 50,
                    'backgroundColor': '#FFFFFF',
                    alignItems: 'center',
                    justifyContent: 'center',
                }}>
                    <TouchableOpacity style={{ position: 'absolute', width: 24, height: 24, left: 16 }}
                                      onPress={() => {
                                          navigation.goBack();
                                      }}>
                        <Image source={require('../../img/back.png')} style={{ width: 24, height: 24 }}/>
                    </TouchableOpacity>
                    <Image source={require('../../img/logo.png')}
                           style={{ height: 32, width: 170, flex: 1, top: 0, resizeMode: 'contain' }}/>
                    {renderButton()}
                </View>

                <View style={{ 'width': '100%', 'left': 40, 'top': 50, 'backgroundColor': '#FFFFFF' }}>
                    <Text style={{
                        lineHeight: 28,
                        fontSize: 18,
                        fontWeight: '500',
                        top: 10,
                    }}>{i18n.t('register1text1')}</Text>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text2')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>
                        <TextInput style={styles.textedit} value={hoten}
                                   onChangeText={value => handleOnchangeText(value, 'hoten')}></TextInput>
                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500' }}>Email</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>
                        <TextInput style={styles.textedit} autoCapitalize={false} value={email}
                                   onChangeText={value => handleOnchangeText(value, 'email')}></TextInput>
                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <Text style={{
                            lineHeight: 24,
                            fontSize: 14,
                            fontWeight: '500',
                        }}>{i18n.t('register1text3')}</Text>
                        <TextInput style={styles.textedit} value={diachi}
                                   onChangeText={value => handleOnchangeText(value, 'diachi')}></TextInput>
                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text4')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        <TextInput style={styles.textedit} value={tinhtp}
                                   onChangeText={value => handleOnchangeText(value, 'tinhtp')}></TextInput>
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text5')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>
                        <TextInput style={styles.textedit} value={cmnd}
                                   onChangeText={value => handleOnchangeText(value, 'cmnd')}></TextInput>
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text6')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        {/* <TextInput style={styles.textedit} value={Ngaycap} onChangeText={value => handleOnchangeText(value, 'Ngaycap')}></TextInput> */}
                        <MaskInput style={styles.textedit}
                            //      value={phone}
                                   placeholder="dd/MM/yyyy"
                                   value={ngaycap} onChangeText={value => handleOnchangeText(value, 'ngaycap')}
                            // onChangeText={(masked, unmasked) => {
                            //     setPhone(masked); // you can use the unmasked value as well

                            //     // assuming you typed "9" all the way:
                            //     console.log(masked); // (99) 99999-9999
                            //     console.log(unmasked); // 99999999999
                            // }}
                                   mask={[/\d/, /\d/, '/', /\d/, /\d/, '/', /\d/, /\d/, /\d/, /\d/]}
                        />
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text7')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>
                        <TextInput style={styles.textedit} onChangeText={value => handleOnchangeText(value, 'noicap')}
                                   value={noicap}></TextInput>
                    </View>
                </View>

                <View
                    style={{ 'width': '100%', 'left': 40, 'top': 70, 'backgroundColor': '#FFFFFF', paddingBottom: 10 }}>
                    <Text style={{
                        lineHeight: 28,
                        fontSize: 18,
                        fontWeight: '500',
                        top: 10,
                        width: '90%',
                    }}>{i18n.t('register1text8')}</Text>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text9')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        <TextInput style={styles.textedit} value={tenmay} placeholder="....."
                                   onChangeText={value => handleOnchangeText(value, 'tenmay')}> </TextInput>

                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text10')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>
                        <TextInput style={styles.textedit} value={loaimay}
                                   onChangeText={value => handleOnchangeText(value, 'loaimay')}></TextInput>
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text11')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        <TextInput style={styles.textedit} value={hedieuhanh}
                                   onChangeText={value => handleOnchangeText(value, 'hedieuhanh')}></TextInput>
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text12')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>


                        <TextInput style={styles.textedit} value={phienban}
                                   onChangeText={value => handleOnchangeText(value, 'phienban')}></TextInput>
                    </View>


                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text13')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        <TextInput style={styles.textedit} value={uuid}
                                   onChangeText={value => handleOnchangeText(value, 'uuid')}></TextInput>
                    </View>


                </View>

                <View style={{ 'width': '100%', 'left': 40, 'top': 70, 'backgroundColor': '#FFFFFF' }}>
                    <Text style={{
                        lineHeight: 28,
                        fontSize: 18,
                        fontWeight: '500',
                        top: 10,
                    }}>{i18n.t('register1text14')}</Text>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <Text style={{
                            lineHeight: 24,
                            fontSize: 14,
                            fontWeight: '500',
                        }}>{i18n.t('register1text15')}</Text>


                        <TextInput style={styles.textedit} value={hoten}
                                   onChangeText={value => handleOnchangeText(value, 'hoten')}></TextInput>

                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <View style={{ flexDirection: 'row' }}>
                            <Text style={{
                                lineHeight: 24,
                                fontSize: 14,
                                fontWeight: '500',
                            }}>{i18n.t('register1text16')}</Text>
                            <Text style={{ lineHeight: 24, fontSize: 14, fontWeight: '500', color: 'red' }}>* </Text>
                        </View>

                        <TextInput style={styles.textedit}
                                   onChangeText={value => handleOnchangeText(value, 'dienthoai')}
                                   value={dienthoai}></TextInput>
                    </View>
                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <Text style={{
                            lineHeight: 24,
                            fontSize: 14,
                            fontWeight: '500',
                        }}>{i18n.t('register1text3')}</Text>
                        <TextInput style={styles.textedit} value={diachi}></TextInput>
                    </View>

                    <View style={{ top: 20, paddingBottom: 14 }}>
                        <Text style={{
                            lineHeight: 24,
                            fontSize: 14,
                            fontWeight: '500',
                        }}>{i18n.t('register1text22')}</Text>
                        <TextInput style={styles.textedit} value={makd}
                                   onChangeText={value => handleOnchangeText(value, 'makd')}></TextInput>
                    </View>

                    {error ? (
                        <Text style={{
                            color: 'red',
                            fontSize: 16,
                            width: '90%',
                            textAlign: 'center',
                            top: 30,
                        }}>{error}</Text>
                    ) : null}
                    <TouchableOpacity style={{
                        width: '80%',
                        height: 44,
                        backgroundColor: '#1858EA',
                        borderRadius: 8,
                        alignItems: 'center',
                        top: 50,
                    }} onPress={SubmitForm}>
                        <Text style={AppStyle.buttonText}>{i18n.t('buttonNext')}</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    textedit: {
        borderColor: '#D9D9D9',
        backgroundColor: '#fff',
        borderRadius: 5,
        borderWidth: 1,
        borderStyle: 'solid',
        paddingTop: 8, paddingRight: 16, paddingLeft: 16, gap: 8, height: 44, width: '80%',
    },
    modalView: {
        margin: 0,
        backgroundColor: 'white',
        borderRadius: 20,
        padding: 35,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
    },
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        //  backgroundColor: 'rgba(52, 52, 52, 0.8)',
        marginTop: 30,
        width: '100%',
    },
    containerModal: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
        // marginTop: 30,
    },
});
