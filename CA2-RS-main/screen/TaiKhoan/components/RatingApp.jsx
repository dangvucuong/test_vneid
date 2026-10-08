import React from 'react';
import { Image, StyleSheet, Text, View } from 'react-native';
import { useI18n } from '../../../utils/i18n';

const RatingApp = () => {
    const { i18n } = useI18n();

    return (
        <View>
            <View style={[styles.dFlex, styles.ratingBanner]}>
                <View style={{ flex: 2 }}>
                    <Text style={{
                        fontSize: 16,
                        fontWeight: 'bold',
                        marginBottom: 8,
                    }}>{i18n.t('tai_khoan_Trai_nghiem_cua_ban')}</Text>
                    <Text style={{
                        fontSize: 13,
                        color: '#6B7280',
                    }}>{i18n.t('tai_khoan_Danh_gia_san_pham')}</Text>
                </View>
                <Image
                    source={require('../../../img/EsignCharacter-34.png')}
                    width={116}
                    height={126}
                    style={{ flex: 1 }}
                />
            </View>
            <View style={[styles.dFlex, styles.ratingView]}>
                <Image source={require('../../../img/Star.png')} width={32} height={32}/>
                <Image source={require('../../../img/Star.png')} width={32} height={32}/>
                <Image source={require('../../../img/Star.png')} width={32} height={32}/>
                <Image source={require('../../../img/Star.png')} width={32} height={32}/>
                <Image source={require('../../../img/Star.png')} width={32} height={32}/>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    dFlex: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    ratingBanner: {
        paddingVertical: 8,
        paddingLeft: 16,
        backgroundColor: '#E8F2FF',
        borderTopLeftRadius: 6,
        borderTopRightRadius: 6,
        justifyContent: 'space-between',
        flexDirection: 'row',
    },
    ratingView: {
        marginHorizontal: 28,
        marginVertical: 16,
        justifyContent: 'space-between',
    },
});

export default RatingApp;
