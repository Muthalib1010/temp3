import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';

interface OtpScreenProps {
  onBackToLogin: () => void;
}

export const OtpScreen: React.FC<OtpScreenProps> = ({ onBackToLogin }) => {
  const { otpLogin, isLoading } = useAuth();
  const { t } = useLanguage();

  const [mobile, setMobile] = useState('9876543210');
  const [otp, setOtp] = useState('1234');
  const [countdown, setCountdown] = useState(30);
  const [error, setError] = useState('');

  useEffect(() => {
    if (countdown > 0) {
      const t = setTimeout(() => setCountdown(countdown - 1), 1000);
      return () => clearTimeout(t);
    }
  }, [countdown]);

  const handleVerify = async () => {
    setError('');
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (otp.length < 4) {
      setError('Please enter the 4-digit OTP');
      return;
    }

    try {
      await otpLogin(cleanMobile, otp);
    } catch (e: any) {
      setError(e.message || 'OTP verification failed');
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={onBackToLogin} style={styles.backBtn}>
        <Text style={styles.backBtnText}>← {t.login}</Text>
      </TouchableOpacity>

      <View style={styles.card}>
        <View style={styles.iconCircle}>
          <Text style={styles.icon}>📱</Text>
        </View>
        <Text style={styles.title}>{t.loginWithOtp}</Text>
        <Text style={styles.subtitle}>
          A 4-digit verification code has been sent to your mobile
        </Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠️ {error}</Text>
          </View>
        ) : null}

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.mobileNumber}</Text>
          <View style={styles.mobileRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.mobileInput}
              value={mobile}
              onChangeText={setMobile}
              keyboardType="phone-pad"
              maxLength={10}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Enter 4-Digit OTP</Text>
          <TextInput
            style={styles.otpInput}
            value={otp}
            onChangeText={setOtp}
            keyboardType="number-pad"
            maxLength={4}
            placeholder="1234"
          />
          <Text style={styles.demoOtpHint}>💡 Demo OTP: 1234 (Pre-filled for Hackathon)</Text>
        </View>

        <TouchableOpacity
          style={[styles.verifyBtn, isLoading && styles.disabledBtn]}
          onPress={handleVerify}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.verifyBtnText}>Verify & Login →</Text>
          )}
        </TouchableOpacity>

        <View style={styles.resendRow}>
          {countdown > 0 ? (
            <Text style={styles.timerText}>Resend OTP in {countdown}s</Text>
          ) : (
            <TouchableOpacity onPress={() => setCountdown(30)}>
              <Text style={styles.resendLink}>Resend OTP via SMS</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#F5F7F5',
    justifyContent: 'center',
  },
  backBtn: {
    marginBottom: 16,
  },
  backBtnText: {
    color: '#1E6F3D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  iconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginBottom: 6,
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 18,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
    width: '100%',
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
    textAlign: 'center',
  },
  inputGroup: {
    width: '100%',
    marginBottom: 16,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 6,
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  prefix: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#616161',
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 10,
    fontSize: 14,
  },
  otpInput: {
    borderWidth: 2,
    borderColor: '#1E6F3D',
    borderRadius: 8,
    paddingVertical: 12,
    textAlign: 'center',
    fontSize: 24,
    fontWeight: 'bold',
    letterSpacing: 10,
    backgroundColor: '#FAFAFA',
  },
  demoOtpHint: {
    fontSize: 11,
    color: '#2E7D32',
    marginTop: 4,
    fontWeight: '500',
  },
  verifyBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginTop: 8,
  },
  verifyBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
  resendRow: {
    marginTop: 16,
  },
  timerText: {
    fontSize: 12,
    color: '#9E9E9E',
  },
  resendLink: {
    fontSize: 12,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
});
