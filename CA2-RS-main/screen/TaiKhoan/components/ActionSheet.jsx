import React, { useEffect, useState } from 'react';
import { Image, Modal, StyleSheet, Text, TouchableOpacity, TouchableWithoutFeedback, View } from 'react-native';

const ActionSheet = ({ visible, options, onCancel, onSelect, selectedValue }) => {
    const [selectedOption, setSelectedOption] = useState(selectedValue);

    useEffect(() => {
        setSelectedOption(selectedValue);
    }, [selectedValue]);

    const handleSelect = (key) => {
        setSelectedOption(key);
        onSelect(key);
        onCancel(); // Close the modal after selection
    };

    return (
        <Modal
            transparent={true}
            statusBarTranslucent={true}
            visible={visible}
            animationType="slide"
            onRequestClose={onCancel} // Android back button close
        >
            <TouchableWithoutFeedback>
                <View style={styles.overlay}>
                    <View style={styles.actionSheet}>
                        <View style={styles.header}>
                            <TouchableOpacity onPress={onCancel}>
                                <Image source={require('../../../img/X.png')} width={24} height={24}/>
                            </TouchableOpacity>
                            <Text style={styles.headerText}>Lựa chọn ngôn ngữ</Text>
                            <View style={{ width: 24 }}/>
                        </View>
                        {options.map((option, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.option,
                                    selectedOption === option.key && styles.selectedOption, // Apply selected style
                                ]}
                                onPress={() => handleSelect(option.key)}
                            >
                                <Text style={styles.optionText}>{option.value}</Text>
                                {
                                    selectedOption === option.key &&
                                    <Image source={require('../../../img/Check.png')} width={20} height={20} />
                                }
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>
            </TouchableWithoutFeedback>
        </Modal>
    );
};

const styles = StyleSheet.create({
    overlay: {
        flex: 1,
        justifyContent: 'flex-end',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    actionSheet: {
        backgroundColor: '#fff',
        borderTopLeftRadius: 13,
        borderTopRightRadius: 13,
        paddingBottom: 60,
    },
    header: {
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
    option: {
        paddingVertical: 14,
        paddingHorizontal: 20,
    },
    optionText: {
        fontSize: 14,
        color: '#0F172A',
    },
    selectedOption: {
        backgroundColor: '#F6F9FF', // Background color for selected option
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
});

export default ActionSheet;
