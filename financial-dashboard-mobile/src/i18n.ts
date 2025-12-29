import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { tr } from './locales/tr';
import { en } from './locales/en';

// Desteklenen diller
export const SUPPORTED_LANGUAGES = {
  TURKISH: 'tr',
  ENGLISH: 'en',
} as const;

export type SupportedLanguage = typeof SUPPORTED_LANGUAGES[keyof typeof SUPPORTED_LANGUAGES];

// AsyncStorage anahtarları
const LANGUAGE_STORAGE_KEY = '@app_language';

// Dil algılama fonksiyonu
const getSystemLanguage = (): string => {
  // Varsayılan olarak Türkçe döndür
  return SUPPORTED_LANGUAGES.TURKISH;
};

// AsyncStorage'dan kaydedilmiş dili al
const getStoredLanguage = async (): Promise<string | null> => {
  try {
    const storedLanguage = await AsyncStorage.getItem(LANGUAGE_STORAGE_KEY);
    return storedLanguage;
  } catch (error) {
    console.error('Kaydedilmiş dil alınırken hata oluştu:', error);
    return null;
  }
};

// Dili AsyncStorage'a kaydet
const storeLanguage = async (language: string): Promise<void> => {
  try {
    await AsyncStorage.setItem(LANGUAGE_STORAGE_KEY, language);
  } catch (error) {
    console.error('Dil kaydedilirken hata oluştu:', error);
  }
};

// i18n konfigürasyonu
const initializeI18n = async (): Promise<typeof i18n> => {
  // Önce kaydedilmiş dili kontrol et
  const storedLanguage = await getStoredLanguage();
  
  // Eğer kaydedilmiş dil yoksa sistem dilini kullan
  const fallbackLanguage = storedLanguage || getSystemLanguage();
  
  return i18n
    .use(initReactI18next)
    .init({
      compatibilityJSON: 'v3', // React Native için gerekli
      lng: fallbackLanguage,
      fallbackLng: SUPPORTED_LANGUAGES.TURKISH,
      debug: __DEV__, // Development ortamında debug modu
      
      interpolation: {
        escapeValue: false, // React zaten XSS koruması sağlar
      },
      
      resources: {
        [SUPPORTED_LANGUAGES.TURKISH]: {
          translation: tr,
        },
        [SUPPORTED_LANGUAGES.ENGLISH]: {
          translation: en,
        },
      },
      
      react: {
        useSuspense: false,
      },
    });
};

// Dil değiştirme fonksiyonu
export const changeLanguage = async (language: SupportedLanguage): Promise<void> => {
  try {
    await i18n.changeLanguage(language);
    await storeLanguage(language);
  } catch (error) {
    console.error('Dil değiştirilirken hata oluştu:', error);
    throw error;
  }
};

// Mevcut dili al
export const getCurrentLanguage = (): string => {
  return i18n.language;
};

// Dil desteği var mı kontrol et
export const isLanguageSupported = (language: string): language is SupportedLanguage => {
  return Object.values(SUPPORTED_LANGUAGES).includes(language as SupportedLanguage);
};

// Kullanıcı tercihini güncelle
export const updateUserLanguagePreference = async (language: SupportedLanguage): Promise<void> => {
  await storeLanguage(language);
  await changeLanguage(language);
};

// AsyncStorage'dan kullanıcı tercihini al
export const getUserLanguagePreference = async (): Promise<SupportedLanguage | null> => {
  const storedLanguage = await getStoredLanguage();
  if (storedLanguage && isLanguageSupported(storedLanguage)) {
    return storedLanguage;
  }
  return null;
};

// i18n instance'ını export et
export default i18n;

// i18n'i başlat
export const initializeI18nInstance = initializeI18n;