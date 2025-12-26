import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../contexts/AuthContext';
import { changeLanguage, SUPPORTED_LANGUAGES, SupportedLanguage } from '../i18n';

export default function ProfileScreen() {
  const { t } = useTranslation();
  const { session, signOut } = useAuth();
  const [currentLanguage, setCurrentLanguage] = useState<SupportedLanguage>('tr');
  const [loadingLanguage, setLoadingLanguage] = useState(false);

  const handleSignOut = () => {
    Alert.alert(
      t('profile.signOut'),
      t('profile.signOutConfirm'),
      [
        { text: t('common.cancel'), style: 'cancel' },
        { 
          text: t('profile.signOut'), 
          style: 'destructive',
          onPress: signOut
        }
      ]
    );
  };

  const openSettings = () => {
    Alert.alert(
      t('profile.settings'),
      'Yakında: Kullanıcı ayarları sayfası eklenecek',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  const handleLanguageChange = async (language: SupportedLanguage) => {
    try {
      setLoadingLanguage(true);
      await changeLanguage(language);
      setCurrentLanguage(language);
      Alert.alert(t('common.success'), t('profile.languageChanged'));
    } catch (error) {
      Alert.alert(t('common.error'), t('profile.languageChangeError'));
    } finally {
      setLoadingLanguage(false);
    }
  };

  const getLanguageDisplayName = (lang: SupportedLanguage) => {
    switch (lang) {
      case 'tr':
        return 'Türkçe';
      case 'en':
        return 'English';
      default:
        return lang;
    }
  };

  const openAbout = () => {
    Alert.alert(
      'Hakkında',
      'Finansal Dashboard v1.0.0\n\nTüm finansal verilerinizi tek yerde takip edin.',
      [{ text: 'Tamam', style: 'default' }]
    );
  };

  return (
    <View style={styles.container}>
      {/* Profile Header */}
      <View style={styles.profileHeader}>
        <View style={styles.avatarContainer}>
          <Ionicons name="person-circle" size={80} color="#3B82F6" />
        </View>
        <Text style={styles.userName}>
          {session?.user?.user_metadata?.full_name || 'Kullanıcı'}
        </Text>
        <Text style={styles.userEmail}>
          {session?.user?.email}
        </Text>
      </View>

      {/* Menu Items */}
      <View style={styles.menuSection}>
        <TouchableOpacity style={styles.menuItem} onPress={openSettings}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="settings-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Ayarlar</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="notifications-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Bildirim Ayarları</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        {/* Language Selector */}
        <TouchableOpacity 
          style={styles.menuItem}
          onPress={() => {
            Alert.alert(
              t('profile.language'),
              '',
              [
                { text: t('common.cancel'), style: 'cancel' },
                { 
                  text: 'Türkçe', 
                  onPress: () => handleLanguageChange('tr') 
                },
                { 
                  text: 'English', 
                  onPress: () => handleLanguageChange('en') 
                }
              ]
            );
          }}
          disabled={loadingLanguage}
        >
          <View style={styles.menuItemLeft}>
            <Ionicons name="language-outline" size={24} color="#9CA3AF" />
            <View style={{ flex: 1 }}>
              <Text style={styles.menuItemText}>{t('profile.language')}</Text>
              <Text style={styles.menuItemSubtext}>
                {loadingLanguage ? t('common.loading') : getLanguageDisplayName(currentLanguage)}
              </Text>
            </View>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="shield-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Güvenlik</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="cloud-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Veri Senkronizasyonu</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Statistics Section */}
      <View style={styles.statsSection}>
        <Text style={styles.sectionTitle}>İstatistikler</Text>
        <View style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Toplam Alarm</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Portföy Değeri</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>0</Text>
            <Text style={styles.statLabel}>Takip Edilen</Text>
          </View>
        </View>
      </View>

      {/* About Section */}
      <View style={styles.aboutSection}>
        <TouchableOpacity style={styles.menuItem} onPress={openAbout}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="information-circle-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Hakkında</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="help-circle-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Yardım ve Destek</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>

        <TouchableOpacity style={styles.menuItem}>
          <View style={styles.menuItemLeft}>
            <Ionicons name="star-outline" size={24} color="#9CA3AF" />
            <Text style={styles.menuItemText}>Uygulamayı Değerlendir</Text>
          </View>
          <Ionicons name="chevron-forward" size={20} color="#6B7280" />
        </TouchableOpacity>
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={20} color="#EF4444" />
        <Text style={styles.signOutText}>Çıkış Yap</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a1a',
  },
  profileHeader: {
    alignItems: 'center',
    paddingVertical: 32,
    paddingHorizontal: 20,
    backgroundColor: '#2d2d2d',
    marginBottom: 16,
  },
  avatarContainer: {
    marginBottom: 16,
  },
  userName: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  userEmail: {
    color: '#9CA3AF',
    fontSize: 16,
  },
  menuSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  statsSection: {
    marginHorizontal: 16,
    marginBottom: 24,
  },
  aboutSection: {
    marginHorizontal: 16,
    marginBottom: 32,
  },
  sectionTitle: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
  },
  menuItem: {
    backgroundColor: '#2d2d2d',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderRadius: 12,
    marginBottom: 8,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuItemText: {
    color: '#ffffff',
    fontSize: 16,
    marginLeft: 16,
  },
  menuItemSubtext: {
    color: '#9CA3AF',
    fontSize: 14,
    marginTop: 2,
    marginLeft: 16,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    backgroundColor: '#2d2d2d',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    flex: 1,
    marginHorizontal: 4,
  },
  statValue: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 4,
  },
  statLabel: {
    color: '#9CA3AF',
    fontSize: 12,
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#2d2d2d',
    marginHorizontal: 16,
    marginBottom: 20,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#EF4444',
  },
  signOutText: {
    color: '#EF4444',
    fontSize: 16,
    fontWeight: '600',
    marginLeft: 8,
  },
});