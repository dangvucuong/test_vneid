import { I18n } from 'i18n-js';
import en from './locales/en.json';
import vi from './locales/vi.json';

// Kết hợp các bản dịch
const translations = {
  en,
  vi,
};

// Tạo instance của I18n
const i18n = new I18n(translations);

// Cấu hình i18n
i18n.locale = 'vi'; // Ngôn ngữ mặc định
i18n.enableFallback = true; // Dùng fallback nếu không tìm thấy key

export default i18n;