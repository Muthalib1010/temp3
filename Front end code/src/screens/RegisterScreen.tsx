import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';
import { languageList } from '../i18n';

interface RegisterScreenProps {
  onNavigateToLogin: () => void;
}

export const RegisterScreen: React.FC<RegisterScreenProps> = ({ onNavigateToLogin }) => {
  const { register, isLoading } = useAuth();
  const { t, language } = useLanguage();

  const [name, setName] = useState('');
  const [mobile, setMobile] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [village, setVillage] = useState('');
  const [district, setDistrict] = useState('Ernakulam');
  const [state, setState] = useState('Kerala');
  const [pincode, setPincode] = useState('');
  const [preferredLang, setPreferredLang] = useState<LanguageCode>(language);
  const [farmerId, setFarmerId] = useState('');
  const [aadhaarLast4, setAadhaarLast4] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    setError('');
    if (!name.trim()) {
      setError('Please enter your full name');
      return;
    }
    const cleanMobile = mobile.replace(/\D/g, '');
    if (cleanMobile.length < 10) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }
    if (password.length < 4) {
      setError('Password must be at least 4 characters');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    try {
      await register({
        name,
        mobile: cleanMobile,
        password,
        village,
        district,
        state,
        pincode,
        preferred_language: preferredLang,
        farmer_id: farmerId || undefined,
        aadhaar_last4: aadhaarLast4 || undefined,
      });
    } catch (e: any) {
      setError(e.message || 'Registration failed. Please try again.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <View style={styles.header}>
        <TouchableOpacity onPress={onNavigateToLogin} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← {t.login}</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{t.createAccount}</Text>
        <Text style={styles.subtitle}>Kisan Registration Portal</Text>
      </View>

      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      <View style={styles.form}>
        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.fullName} *</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Ramesh Kumar"
            value={name}
            onChangeText={setName}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.mobileNumber} *</Text>
          <View style={styles.mobileRow}>
            <Text style={styles.prefix}>+91</Text>
            <TextInput
              style={styles.mobileInput}
              placeholder="9876543210"
              keyboardType="phone-pad"
              maxLength={10}
              value={mobile}
              onChangeText={setMobile}
            />
          </View>
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>{t.password} *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>{t.confirmPassword} *</Text>
            <TextInput
              style={styles.input}
              placeholder="••••••"
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.village}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. Aluva West"
            value={village}
            onChangeText={setVillage}
          />
        </View>

        <View style={styles.row}>
          <View style={[styles.inputGroup, styles.flex1]}>
            <Text style={styles.label}>{t.district}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Ernakulam"
              value={district}
              onChangeText={setDistrict}
            />
          </View>
          <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
            <Text style={styles.label}>{t.state}</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Kerala"
              value={state}
              onChangeText={setState}
            />
          </View>
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.pincode}</Text>
          <TextInput
            style={styles.input}
            placeholder="e.g. 683101"
            keyboardType="numeric"
            maxLength={6}
            value={pincode}
            onChangeText={setPincode}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>{t.selectLanguage}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.langScroll}>
            {languageList.map(item => (
              <TouchableOpacity
                key={item.code}
                style={[
                  styles.langChip,
                  preferredLang === item.code && styles.activeLangChip,
                ]}
                onPress={() => setPreferredLang(item.code)}
              >
                <Text
                  style={[
                    styles.langChipText,
                    preferredLang === item.code && styles.activeLangChipText,
                  ]}
                >
                  {item.native}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        <View style={styles.optionalSection}>
          <Text style={styles.optionalHeading}>Optional Identity (Verification)</Text>
          <View style={styles.row}>
            <View style={[styles.inputGroup, styles.flex1]}>
              <Text style={styles.label}>{t.farmerId}</Text>
              <TextInput
                style={styles.input}
                placeholder="KL-2026-XXXX"
                value={farmerId}
                onChangeText={setFarmerId}
              />
            </View>
            <View style={[styles.inputGroup, styles.flex1, styles.marginLeft]}>
              <Text style={styles.label}>{t.aadhaarLast4}</Text>
              <TextInput
                style={styles.input}
                placeholder="4819"
                maxLength={4}
                keyboardType="numeric"
                value={aadhaarLast4}
                onChangeText={setAadhaarLast4}
              />
            </View>
          </View>
        </View>

        <TouchableOpacity
          style={[styles.submitBtn, isLoading && styles.disabledBtn]}
          onPress={handleRegister}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.submitBtnText}>{t.register}</Text>
          )}
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
  },
  header: {
    marginBottom: 16,
  },
  backBtn: {
    paddingVertical: 6,
    marginBottom: 8,
  },
  backBtnText: {
    color: '#1E6F3D',
    fontSize: 14,
    fontWeight: 'bold',
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  subtitle: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
  },
  form: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  inputGroup: {
    marginBottom: 12,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#424242',
    marginBottom: 4,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    backgroundColor: '#FAFAFA',
  },
  mobileRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    backgroundColor: '#FAFAFA',
  },
  prefix: {
    paddingHorizontal: 10,
    fontSize: 14,
    fontWeight: 'bold',
    color: '#616161',
    borderRightWidth: 1,
    borderRightColor: '#E0E0E0',
  },
  mobileInput: {
    flex: 1,
    paddingHorizontal: 10,
    paddingVertical: 8,
    fontSize: 14,
  },
  row: {
    flexDirection: 'row',
  },
  flex1: {
    flex: 1,
  },
  marginLeft: {
    marginLeft: 10,
  },
  langScroll: {
    flexDirection: 'row',
    marginVertical: 4,
  },
  langChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeLangChip: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1E6F3D',
  },
  langChipText: {
    fontSize: 12,
    color: '#616161',
  },
  activeLangChipText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  optionalSection: {
    backgroundColor: '#F9FAF8',
    padding: 10,
    borderRadius: 8,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  optionalHeading: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#757575',
    marginBottom: 8,
  },
  submitBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 10,
  },
  submitBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
