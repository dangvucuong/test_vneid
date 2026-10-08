import React, { useState } from 'react';
import { Image, Modal, SafeAreaView, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';

const fakeData = [
    {
        id: 1,
        voucherType: "Dành riêng cho bạn",
        items: [
            {
                image: require('../../../img/VoucherBackground.png'),
                name: '[CDS23] Giảm giá 10% - Ngày hội chuyển đổi số 2023 (Tối đa 100K)',
                code: 'ABCD',
                value: 100000,
                expireDate: '15/08/2033',
            },
        ],
    },
    {
        id: 2,
        voucherType: "Dùng ngay không là hết",
        items: [
            {
                image: require('../../../img/VoucherBackground.png'),
                name: '[CDS23] Giảm giá 10% - Ngày hội chuyển đổi số 2023 (Tối đa 100K)',
                code: '123456',
                value: 200000,
                expireDate: '15/08/2033',
            },
            {
                image: require('../../../img/VoucherBackground.png'),
                name: '[CDS23] Giảm giá 10% - Ngày hội chuyển đổi số 2023 (Tối đa 100K)',
                code: 'EEEEEE',
                value: 100000,
                expireDate: '15/08/2033',
            },
            {
                image: require('../../../img/VoucherBackground.png'),
                name: '[CDS23] Giảm giá 10% - Ngày hội chuyển đổi số 2023 (Tối đa 100K)',
                code: 'CCCCCC',
                value: 100000,
                expireDate: '15/08/2033',
            },
            {
                image: require('../../../img/VoucherBackground.png'),
                name: '[CDS23] Giảm giá 10% - Ngày hội chuyển đổi số 2023 (Tối đa 100K)',
                code: 'QQQQQQ',
                value: 100000,
                expireDate: '15/08/2033',
            },
        ],
    },
];

const MaGiamGia = ({ visible, onCancel, onSubmit }) => {
    const [inputValue, setInputValue] = useState('');

    return (
        <Modal
            transparent={false}
            visible={visible}
            animationType="fade"
            onRequestClose={onCancel} // Android back button close
        >
            <SafeAreaView style={styles.safeArea}>
                <View style={styles.modalContainer}>
                    <View style={styles.modalHeader}>
                        <TouchableOpacity onPress={onCancel}>
                            <Image source={require('../../../img/X.png')} width={24} height={24}/>
                        </TouchableOpacity>
                        <Text style={styles.headerText}>Mã giảm giá</Text>
                        <View width={24} />
                    </View>
                    <View style={{ padding: 16 }}>
                        <View style={[styles.dFlex, { width: '100%' }]}>
                            <TextInput
                                placeholder="Tìm kiếm hoặc nhập mã"
                                style={styles.textInput}
                                onChangeText={(text) => setInputValue(text)}
                                value={inputValue}
                            />
                            <TouchableOpacity onPress={() => onSubmit(inputValue)} style={styles.button}>
                                <Text style={styles.buttonText}>Áp dụng</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                    <ScrollView style={{ padding: 16 }}>
                        {
                            fakeData.map((data, index) => (
                                <View key={index} style={{ marginBottom: 24 }}>
                                    <Text style={{ fontWeight: '700', color: '#6B7280' }}>{data.voucherType}</Text>
                                    {
                                        data.items.map((item, index) => (
                                            <View
                                                key={index}
                                                style={[styles.dFlex, {
                                                    paddingVertical: 16,
                                                    gap: 12,
                                                    borderBottomWidth: data.items.length > 0 && index < data.items.length - 1 ? 1 : 0,
                                                    borderBottomColor: data.items.length > 0 && index < data.items.length - 1 ? '#EDF1F5' : '',
                                                }]}>
                                                <Image source={item.image} width={66} height={66} />
                                                <View style={{ flex: 1, gap: 8 }}>
                                                    <Text style={{ fontWeight: '700' }}>{item.name}</Text>
                                                    <View style={[styles.dFlex, { justifyContent: 'space-between' }]}>
                                                        <Text style={{ fontSize: 13, color: '#9CA3AF' }}>{`Hết hạn ${item.expireDate}`}</Text>
                                                        <TouchableOpacity onPress={() => onSubmit(item.code, item.value)}>
                                                            <Text style={{ fontSize: 13, fontWeight: '700', color: '#336DD1' }}>Sử dụng</Text>
                                                        </TouchableOpacity>
                                                    </View>
                                                </View>
                                            </View>
                                        ))
                                    }
                                </View>
                            ))
                        }
                    </ScrollView>
                </View>
            </SafeAreaView>
        </Modal>
    )
}

const styles = StyleSheet.create({
    dFlex: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    textInput: {
        flex: 1,
        paddingVertical: 6,
        paddingHorizontal: 12,
        backgroundColor: '#F8F8F8',
        borderRadius: 4,
        marginRight: 4,
        fontWeight: '600'
    },
    button: {
        paddingVertical: 6,
        paddingHorizontal: 12,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: '#1858EA',
    },
    buttonText: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        color: '#FFFFFF',
    },
    safeArea: {
        flex: 1,
        backgroundColor: '#FFFFFF',
    },
    modalContainer: {
        backgroundColor: '#FFFFFF',
        paddingBottom: 60,
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        borderBottomWidth: 1,
        borderBottomColor: '#EDF1F5',
    },
    headerText: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#0F172A',
    },
});

export default MaGiamGia;