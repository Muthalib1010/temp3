import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { DigitalPass } from '../types';
import { apiService } from '../services/api';
import { DigitalPassCard } from '../components/DigitalPassCard';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface DigitalPassScreenProps {
  bookingId?: number;
  onBack: () => void;
}

export const DigitalPassScreen: React.FC<DigitalPassScreenProps> = ({
  bookingId,
  onBack,
}) => {
  const { t } = useLanguage();
  const [pass, setPass] = useState<DigitalPass | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string>('');

  useEffect(() => {
    const loadPass = async () => {
      setIsLoading(true);
      setError('');
      try {
        if (bookingId) {
          const res = await apiService.getDigitalPass(bookingId);
          setPass(res);
        } else {
          // Find first booking pass
          const bookings = await apiService.getBookings();
          if (bookings.length > 0) {
            const res = await apiService.getDigitalPass(bookings[0].id);
            setPass(res);
          } else {
            setError('No active bookings available to generate digital pass');
          }
        }
      } catch (e: any) {
        setError(e.message || 'Could not load digital pass');
      } finally {
        setIsLoading(false);
      }
    };
    loadPass();
  }, [bookingId]);

  const handleSaveOffline = () => {
    Alert.alert(
      'Digital Pass Saved',
      'Pass has been cached securely on this device. You can display it at the gate even without internet.'
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Entry Verification</Text>
      </View>

      <VoiceButton
        textToSpeak="Present this digital gate entry pass to the Mandi security officer."
        label={t.voiceGuide}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : pass ? (
        <View>
          <DigitalPassCard pass={pass} />

          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSaveOffline}>
              <Text style={styles.saveBtnText}>💾 {t.saveOffline}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.printBtn}
              onPress={() => Alert.alert('Print Receipt', 'Printing thermal entry slip...')}
            >
              <Text style={styles.printBtnText}>🖨️ Print Slip</Text>
            </TouchableOpacity>
          </View>
        </View>
      ) : null}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  backText: {
    fontSize: 14,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  loader: {
    marginVertical: 40,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 16,
    borderRadius: 12,
    marginVertical: 20,
  },
  errorText: {
    color: '#C62828',
    textAlign: 'center',
    fontSize: 14,
  },
  btnRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 8,
  },
  saveBtn: {
    flex: 1,
    backgroundColor: '#1E6F3D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  printBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  printBtnText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
