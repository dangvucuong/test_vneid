import React, { useState } from 'react';
import { Image, Linking, Modal, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { ScrollView } from 'react-native-gesture-handler';
import Pdf from 'react-native-pdf';
import { useI18n } from '../../utils/i18n';
import PageContainer from '../component/PageContainer';
import PageHeader from '../component/PageHeader';

export default function PreviewPDF({ navigation, route }) {
    const { i18n } = useI18n();
    const { item } = route.params;
    const [openModal, setOpenModal] = useState(false);

    const downloadFile = async () => {
        Linking.openURL(item.Linkfile_goc);
    };

    return (
        <PageContainer>
            <Modal
                transparent={true}
                visible={openModal}
            >
                <View style={styles.modalContainer}>
                    <View style={{ width: '100%', paddingBottom: 16, backgroundColor: '#ffffff' }}>
                        <TouchableOpacity style={styles.modalClose} onPress={() => setOpenModal(false)}>
                            <Image source={require('../../img/X.png')} style={{ width: 24, height: 24 }} />
                        </TouchableOpacity>
                        <View style={{ paddingHorizontal: 16, paddingTop: 20 }}>
                            <Text style={{ lineHeight: 18, color: '#0F172A', fontSize: 13 }} numberOfLines={1}>
                                {item.TenVB}
                            </Text>
                            <Text style={{ lineHeight: 16, color: '#6B7280', fontSize: 12 }}>{item.Date_Req}</Text>
                        </View>
                        <TouchableOpacity style={styles.modalAction} onPress={downloadFile}>
                            <View style={styles.modalActionIcon}>
                                <Image source={require('../../img/DownloadSimple.png')} style={{ width: 24, height: 24 }} />
                            </View>
                            <Text style={styles.modalActionText}>{i18n.t('document.download_short')}</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
            <PageHeader
                title={item.TenVB}
                onBack={() => navigation.goBack()}
                onDetail={() => setOpenModal(true)}
            />
            <View style={{ flex: 1, width: '100%' }}>
                <ScrollView style={{ flex: 1, backgroundColor: '#E5E5E5', marginTop: 4 }} contentContainerStyle={{ gap: 4, flex: 1 }}>
                    <Pdf
                        trustAllCerts={Platform.OS === 'ios'}
                        source={{
                            uri: encodeURI(item.Linkfile_goc),
                            cache: false,
                            headers: { 'Cache-Control': 'no-cache' },
                        }}
                        style={styles.pdf}
                    />
                </ScrollView>
            </View>
        </PageContainer>
    );
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(52, 52, 52, 0.8)',
    },
    modalClose: {
        position: 'absolute',
        right: 0,
        top: -60,
        width: 48,
        height: 48,
        backgroundColor: '#ffffff',
        borderRadius: 24,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalAction: {
        flexDirection: 'row',
        gap: 12,
        padding: 16,
        alignItems: 'center',
    },
    modalActionIcon: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: '#E6F2FE',
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalActionText: {
        flex: 1,
        lineHeight: 20,
        fontSize: 14,
        fontWeight: '500',
    },
    title: {
        fontSize: 16,
        lineHeight: 24,
        color: '#1E293B',
        fontWeight: '600',
    },
    category: {
        height: 30,
        flex: 1,
        color: '#334155',
        alignItems: 'center',
    },
    categoryActive: {
        borderBottomColor: '#1858EA',
        borderBottomWidth: 1
    },
    detail: {
        flexDirection: 'row',
        gap: 12,
    },
    detailText: {
        maxWidth: '50%',
        fontSize: 13,
        lineHeight: 24,
        color: '#6B7280',
        width: 120,
    },
    detailRight: {
        fontWeight: '600',
        flex: 1,
    },
    sign_item: {
        paddingHorizontal: 16,
        paddingVertical: 12,
        borderBottomColor: '#DDE3EB',
        borderBottomWidth: 1,
        flexDirection: 'row',
    },
    badge: {
        flexDirection: 'row',
        gap: 4,
        alignItems: 'center',
        justifyContent: 'center',
        height: 20,
        paddingHorizontal: 4,
        paddingVertical: 2,
        borderRadius: 6,
    },
    approved: {
        backgroundColor: '#DBF5E5',
    },
    not_approved: {
        backgroundColor: '#FDE0E0',
        color: '#DC2626',
    },
    waiting: {
        backgroundColor: '#EDF1F5',
    },
    badge_text: {
        fontSize: 12,
        lineHeight: 16,
    },
    pdf: {
        flex: 1,
        backgroundColor: "#fff",
    },
});