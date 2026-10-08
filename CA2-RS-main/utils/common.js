const Setkey = async (keyname, value) => {
    await AsyncStorage.setItem(keyname, value);
};

const formatCurrencyVietnam = (value) => {
    return new Intl.NumberFormat('vi-VN', {
        style: 'currency',
        currency: 'VND',
    }).format(value);
};

export { Setkey, formatCurrencyVietnam };
