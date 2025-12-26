// i18n Kullanım Örneği
import React from 'react';
import { View, Text, Button, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { changeLanguage, SUPPORTED_LANGUAGES } from './i18n';

function ExampleComponent() {
  const { t, i18n } = useTranslation();

  const handleLanguageChange = async (language: string) => {
    try {
      await changeLanguage(language as keyof typeof SUPPORTED_LANGUAGES);
    } catch (error) {
      console.error('Dil değiştirme hatası:', error);
    }
  };

  return (
    <View style={{ padding: 20 }}>
      {/* Temel kullanım */}
      <Text style={{ fontSize: 18, fontWeight: 'bold', marginBottom: 10 }}>
        {t('common.settings')}
      </Text>
      
      {/* İç içe çeviriler */}
      <Text style={{ marginBottom: 5 }}>
        {t('portfolio.title')}
      </Text>
      
      <Text style={{ marginBottom: 5 }}>
        {t('profile.email')}
      </Text>
      
      <Text style={{ marginBottom: 20 }}>
        {t('errors.serverError')}
      </Text>

      {/* Dil değiştirme butonları */}
      <TouchableOpacity
        style={{ 
          backgroundColor: '#3B82F6', 
          padding: 10, 
          marginBottom: 10,
          borderRadius: 8 
        }}
        onPress={() => handleLanguageChange(SUPPORTED_LANGUAGES.TURKISH)}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          Türkçe
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={{ 
          backgroundColor: '#10B981', 
          padding: 10, 
          borderRadius: 8 
        }}
        onPress={() => handleLanguageChange(SUPPORTED_LANGUAGES.ENGLISH)}
      >
        <Text style={{ color: 'white', textAlign: 'center' }}>
          English
        </Text>
      </TouchableOpacity>

      {/* Mevcut dil bilgisi */}
      <Text style={{ marginTop: 20, fontSize: 14, color: '#666' }}>
        {t('common.language')}: {i18n.language === 'tr' ? 'Türkçe' : 'English'}
      </Text>
    </View>
  );
}

export default ExampleComponent;