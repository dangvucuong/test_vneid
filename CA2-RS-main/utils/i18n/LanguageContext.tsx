import React, { createContext, useContext, useState } from 'react';
import i18n from './index'; // Import i18n từ file i18n/index.ts

interface LanguageContextProps {
  language: string; // Ngôn ngữ hiện tại
  changeLanguage: (lang: string) => void; // Hàm đổi ngôn ngữ
  i18n: typeof i18n; // Cung cấp i18n từ context
}

// Tạo context
const LanguageContext = createContext<LanguageContextProps | undefined>(undefined);

// Provider
export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState(i18n.locale); // Ngôn ngữ mặc định từ i18n

  const changeLanguage = (lang: string) => {
    i18n.locale = lang; // Cập nhật ngôn ngữ trong i18n
    setLanguage(lang); // Cập nhật trạng thái
  };

  return (
    <LanguageContext.Provider value={{ language, changeLanguage, i18n }}>
      {children}
    </LanguageContext.Provider>
  );
};

// Hook để sử dụng LanguageContext
export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage phải được sử dụng bên trong LanguageProvider');
  }
  return context;
};
