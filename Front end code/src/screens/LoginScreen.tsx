import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface LoginScreenProps {
  onNavigateToRegister: () => void;
  onNavigateToOtp: () => void;
  onOpenLanguage: () => void;
}

export const LoginScreen: React.FC<LoginScreenProps> = ({
  onNavigateToRegister,
  onNavigateToOtp,
  onOpenLanguage,
}) => {
  const { login, demoLogin, isLoading } = useAuth();
  const { t, language } = useLanguage();

  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    setError('');
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (!password || password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }

    try {
      await login(cleanMobile, password);
    } catch (e: any) {
      setError(e.message || 'Login failed. Check your mobile number and password.');
    }
  };

  const handleDemoFarmer = async () => {
    setError('');
    try {
      await demoLogin('farmer');
    } catch (e: any) {
      setError(e.message || 'Demo farmer login failed');
    }
  };

  const handleDemoAdmin = async () => {
    setError('');
    try {
      await demoLogin('admin');
    } catch (e: any) {
      setError(e.message || 'Demo admin login failed');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.scrollContainer} keyboardShouldPersistTaps="handled">
      {/* Top Gov Banner */}
      <View style={styles.topGovRow}>
        <Text style={styles.govTag}>🇮🇳 GOVT. OF INDIA • AGRI-PROCUREMENT</Text>
        <TouchableOpacity onPress={onOpenLanguage} style={styles.langBadge}>
          <Text style={styles.langText}>🌐 {language.toUpperCase()}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.header}>
        <View style={styles.logoBadge}>
          <Text style={styles.logoIcon}>🌾</Text>
        </View>
        <Text style={styles.title}>{t.appName}</Text>
        <Text style={styles.tagline}>"{t.tagline}"</Text>
      </View>

      {/* Voice Guide Instruction */}
      <View style={styles.voiceRow}>
        <VoiceButton
          textToSpeak={`${t.appName}. ${t.login} with your 10 digit mobile number and password.`}
          label={t.voiceGuide}
        />
      </View>

      {/* Demo Section for Judges */}
      <View style={styles.demoCard}>
        <Text style={styles.demoHeading}>⭐ SIH EVALUATOR QUICK ACCESS</Text>
        <TouchableOpacity
          style={styles.demoFarmerBtn}
          onPress={handleDemoFarmer}
          disabled={isLoading}
        >
          <Text style={styles.demoFarmerBtnText}>{t.demoFarmerLogin}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.demoAdminBtn}
          onPress={handleDemoAdmin}
          disabled={isLoading}
        >
          <Text style={styles.demoAdminBtnText}>{t.demoAdminLogin}</Text>
        </TouchableOpacity>
      </View>

      {/* Form Container */}
      <View style={styles.formContainer}>
        <Text style={styles.formTitle}>{t.login}</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t.mobileNumber}</Text>
          <View style={styles.mobileInputRow}>
            <Text style={styles.prefixText}>+91</Text>
            <TextInput
              style={styles.input}
              placeholder="98765 43210"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
              editable={!isLoading}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.inputLabel}>{t.password}</Text>
          <TextInput
            style={[styles.input, styles.regularInput]}
            placeholder="••••••••"
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            editable={!isLoading}
          />
        </View>

        <TouchableOpacity
          style={[styles.loginBtn, isLoading && styles.disabledBtn]}
          onPress={handleLogin}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.loginBtnText}>{t.login}</Text>
          )}
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.otpBtn}
          onPress={onNavigateToOtp}
          disabled={isLoading}
        >
          <Text style={styles.otpBtnText}>📱 {t.loginWithOtp}</Text>
        </TouchableOpacity>

        <View style={styles.dividerRow}>
          <View style={styles.dividerLine} />
          <Text style={styles.dividerText}>OR</Text>
          <View style={styles.dividerLine} />
        </View>

        <TouchableOpacity
          style={styles.registerBtn}
          onPress={onNavigateToRegister}
          disabled={isLoading}
        >
          <Text style={styles.registerBtnText}>{t.createAccount}</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    flexGrow: 1,
    backgroundColor: '#F5F7F5',
    padding: 16,
    paddingBottom: 40,
  },
  topGovRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  govTag: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2E7D32',
    letterSpacing: 0.5,
  },
  langBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  langText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  header: {
    alignItems: 'center',
    marginBottom: 12,
  },
  logoBadge: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#1E6F3D',
    marginBottom: 8,
  },
  logoIcon: {
    fontSize: 32,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E6F3D',
    textAlign: 'center',
  },
  tagline: {
    fontSize: 13,
    color: '#555555',
    fontStyle: 'italic',
    marginTop: 2,
  },
  voiceRow: {
    alignItems: 'center',
    marginBottom: 12,
  },
  demoCard: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#81C784',
    marginBottom: 16,
  },
  demoHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1B5E20',
    marginBottom: 8,
    textAlign: 'center',
    letterSpacing: 0.5,
  },
  demoFarmerBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 6,
  },
  demoFarmerBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  demoAdminBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
  },
  demoAdminBtnText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 12,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  formTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 16,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#FFCDD2',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: 14,
  },
  inputLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
  },
  mobileInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  prefixText: {
    paddingHorizontal: 12,
    fontSize: 15,
    fontWeight: 'bold',
    color: '#616161',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  input: {
    flex: 1,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    color: '#212121',
  },
  regularInput: {
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  loginBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
  },
  loginBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  otpBtn: {
    backgroundColor: '#F1F8E9',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  otpBtnText: {
    color: '#1E6F3D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 16,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EEEEEE',
  },
  dividerText: {
    marginHorizontal: 10,
    fontSize: 12,
    color: '#9E9E9E',
    fontWeight: '600',
  },
  registerBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  registerBtnText: {
    color: '#1E6F3D',
    fontSize: 14,
    fontWeight: 'bold',
  },
});
