import React, { useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import { useTranslation } from 'react-i18next';
import { StatusBar } from 'expo-status-bar';

// Tab Screens
import HomeScreen from './screens/HomeScreen';
import PortfolioScreen from './screens/PortfolioScreen';
import AlertsScreen from './screens/AlertsScreen';
import ProfileScreen from './screens/ProfileScreen';
import { useAuth } from './contexts/AuthContext';
import { AuthProvider } from './contexts/AuthContext';
import { initializeI18nInstance } from './i18n';

// Initialize i18n
initializeI18nInstance();

const Tab = createBottomTabNavigator();

function RootNavigator() {
  const { t } = useTranslation();
  
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          switch (route.name) {
            case 'Home':
              iconName = focused ? 'home' : 'home-outline';
              break;
            case 'Portfolio':
              iconName = focused ? 'wallet' : 'wallet-outline';
              break;
            case 'Alerts':
              iconName = focused ? 'notifications' : 'notifications-outline';
              break;
            case 'Profile':
              iconName = focused ? 'person' : 'person-outline';
              break;
            default:
              iconName = 'home-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: '#3B82F6',
        tabBarInactiveTintColor: '#6B7280',
        tabBarLabel: ({ focused }) => {
          let label: string;
          switch (route.name) {
            case 'Home':
              label = t('home.title');
              break;
            case 'Portfolio':
              label = t('portfolio.title');
              break;
            case 'Alerts':
              label = t('alerts.title');
              break;
            case 'Profile':
              label = t('profile.title');
              break;
            default:
              label = route.name;
          }
          
          return (
            <Text style={{ 
              fontSize: 10, 
              fontWeight: focused ? '600' : '400',
              color: focused ? '#3B82F6' : '#6B7280'
            }}>
              {label}
            </Text>
          );
        },
        tabBarStyle: {
          backgroundColor: '#1a1a1a',
          borderTopColor: '#374151',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
        },
        headerStyle: {
          backgroundColor: '#1a1a1a',
        },
        headerTintColor: '#ffffff',
        headerTitleStyle: {
          fontWeight: '700',
          fontSize: 18,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen} 
        options={{ title: t('navigation.market') }}
      />
      <Tab.Screen 
        name="Portfolio" 
        component={PortfolioScreen} 
        options={{ title: t('navigation.portfolio') }}
      />
      <Tab.Screen 
        name="Alerts" 
        component={AlertsScreen} 
        options={{ title: t('navigation.alerts') }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen} 
        options={{ title: t('navigation.profile') }}
      />
    </Tab.Navigator>
  );
}

function AuthNavigator() {
  const { signIn, signUp } = useAuth();
  const { t } = useTranslation();
  
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [fullName, setFullName] = React.useState('');
  const [isSignUp, setIsSignUp] = React.useState(false);
  const [loading, setLoading] = React.useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      if (isSignUp) {
        const { error } = await signUp(email, password, fullName);
        if (error) {
          alert(t('errors.serverError') + ': ' + error.message);
        } else {
          alert(t('success.created'));
          setIsSignUp(false);
        }
      } else {
        const { error } = await signIn(email, password);
        if (error) {
          alert(t('errors.serverError') + ': ' + error.message);
        }
      }
    } catch (error: any) {
      alert(t('errors.serverError') + ': ' + error.message);
    }
    setLoading(false);
  };

  return (
    <View style={styles.authContainer}>
      <View style={styles.authForm}>
        <Text style={styles.appTitle}>Finansal Dashboard</Text>
        
        <View style={styles.inputContainer}>
          {isSignUp && (
            <TextInput
              style={styles.input}
              placeholder={t('profile.name')}
              placeholderTextColor="#9CA3AF"
              value={fullName}
              onChangeText={setFullName}
              autoCapitalize="words"
            />
          )}
          <TextInput
            style={styles.input}
            placeholder={t('profile.email')}
            placeholderTextColor="#9CA3AF"
            value={email}
            onChangeText={setEmail}
            keyboardType="email-address"
            autoCapitalize="none"
          />
          <TextInput
            style={styles.input}
            placeholder={t('profile.password') || 'Şifre'}
            placeholderTextColor="#9CA3AF"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
          />
        </View>

        <TouchableOpacity
          style={styles.submitButton}
          onPress={handleSubmit}
          disabled={loading}
          activeOpacity={0.8}
        >
          <Text style={styles.submitButtonText}>
            {loading ? t('common.loading') : isSignUp ? t('profile.createAccount') || 'Hesap Oluştur' : t('profile.login') || 'Giriş Yap'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.switchAuth}
          onPress={() => setIsSignUp(!isSignUp)}
          activeOpacity={0.7}
        >
          <Text style={styles.switchAuthText}>
            {isSignUp ? t('profile.hasAccount') || 'Hesabınız var mı? Giriş yapın' : t('profile.noAccount') || 'Hesabınız yok mu? Kayıt olun'}
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function AppContent() {
  const { session, loading } = useAuth();
  const { t } = useTranslation();

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t('common.loading')}</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      {session ? <RootNavigator /> : <AuthNavigator />}
    </NavigationContainer>
  );
}

export default function App() {
  const [i18nInitialized, setI18nInitialized] = React.useState(false);

  useEffect(() => {
    const initI18n = async () => {
      try {
        await initializeI18nInstance();
        setI18nInitialized(true);
      } catch (error) {
        console.error('i18n initialization failed:', error);
        setI18nInitialized(true); // Continue even if i18n fails
      }
    };

    initI18n();
  }, []);

  // Don't render until i18n is initialized
  if (!i18nInitialized) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a1a',
  },
  loadingText: {
    color: '#ffffff',
    fontSize: 18,
    fontWeight: '600',
  },
  authContainer: {
    flex: 1,
    backgroundColor: '#1a1a1a',
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  authForm: {
    width: '100%',
    maxWidth: 400,
    padding: 24,
    backgroundColor: '#2d2d2d',
    borderRadius: 16,
    elevation: 8,
  },
  appTitle: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 32,
  },
  inputContainer: {
    gap: 16,
    marginBottom: 24,
  },
  input: {
    width: '100%',
    padding: 16,
    backgroundColor: '#374151',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#4B5563',
    color: '#ffffff',
    fontSize: 16,
  },
  submitButton: {
    width: '100%',
    padding: 16,
    backgroundColor: '#3B82F6',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  submitButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
  },
  switchAuth: {
    alignItems: 'center',
    marginTop: 16,
  },
  switchAuthText: {
    color: '#3B82F6',
    fontSize: 14,
    textDecorationLine: 'underline',
  },
});
