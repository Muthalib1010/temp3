import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Booking } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface BookingSuccessScreenProps {
  booking: Booking;
  onViewPass: () => void;
  onTrackQueue: () => void;
  onGoHome: () => void;
}

export const BookingSuccessScreen: React.FC<BookingSuccessScreenProps> = ({
  booking,
  onViewPass,
  onTrackQueue,
  onGoHome,
}) => {
  const { t } = useLanguage();

  const handleAddToCalendar = () => {
    Alert.alert(
      'Calendar Reminder',
      `Procurement slot for ${booking.crop_name} on ${booking.date} at ${booking.start_time} saved to device calendar.`
    );
  };

  const successSpeech = `Congratulations! Your procurement slot is confirmed. Booking ID is ${booking.booking_id}. Your token number is ${booking.queue_number} at ${booking.mandi_name}.`;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <View style={styles.successIconBadge}>
          <Text style={styles.successIcon}>🎉</Text>
        </View>

        <Text style={styles.title}>{t.bookingSuccess}</Text>
        <Text style={styles.subtitle}>Government Agricultural Procurement System</Text>

        <VoiceButton textToSpeak={successSpeech} label={t.voiceGuide} />

        {/* Big Token Display */}
        <View style={styles.tokenBox}>
          <Text style={styles.tokenLabel}>{t.queueNumber}</Text>
          <Text style={styles.tokenNumber}>#{booking.queue_number}</Text>
          <Text style={styles.tokenSub}>Estimated Wait: {booking.estimated_wait_minutes} min</Text>
        </View>

        {/* QR Code Container */}
        <View style={styles.qrContainer}>
          <Text style={styles.qrVisual}>⬛⬜⬛⬛⬜⬛⬜⬛⬛{"\n"}⬛⬜⬛⬜⬜⬜⬜⬛⬛{"\n"}⬛⬛⬛⬜⬛⬜⬛⬛⬛{"\n"}⬜⬜⬜⬛⬛⬛⬜⬜⬜{"\n"}⬛⬛⬛⬜⬛⬜⬛⬛⬛{"\n"}⬛⬜⬛⬜⬜⬜⬜⬛⬛{"\n"}⬛⬜⬛⬛⬜⬛⬜⬛⬛</Text>
          <Text style={styles.bookingIdText}>{booking.booking_id}</Text>
          <Text style={styles.qrHint}>Digital QR Entry Pass Generated</Text>
        </View>

        {/* Details Table */}
        <View style={styles.detailsTable}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>{t.mandi}</Text>
            <Text style={styles.tableValue}>{booking.mandi_name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Date & Time</Text>
            <Text style={styles.tableValue}>
              {booking.date} ({booking.start_time} – {booking.end_time})
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>{t.crop} & {t.quantity}</Text>
            <Text style={styles.tableValueBold}>
              {booking.crop_name} • {booking.quantity} kg
            </Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Estimated Payout</Text>
            <Text style={styles.tableValueGreen}>
              ₹{booking.total_amount?.toLocaleString('en-IN')}
            </Text>
          </View>
        </View>

        {/* Actions */}
        <View style={styles.actions}>
          <TouchableOpacity style={styles.primaryBtn} onPress={onViewPass}>
            <Text style={styles.primaryBtnText}>🎫 {t.viewDigitalPass}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.secondaryBtn} onPress={onTrackQueue}>
            <Text style={styles.secondaryBtnText}>⏱️ {t.trackQueue}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.outlineBtn} onPress={handleAddToCalendar}>
            <Text style={styles.outlineBtnText}>📅 {t.addToCalendar}</Text>
          </TouchableOpacity>

          <TouchableOpacity style={styles.homeLinkBtn} onPress={onGoHome}>
            <Text style={styles.homeLinkText}>← {t.goHome}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
    justifyContent: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    elevation: 4,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  successIconBadge: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    borderWidth: 2,
    borderColor: '#1E6F3D',
  },
  successIcon: {
    fontSize: 34,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E6F3D',
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 12,
    color: '#757575',
    marginBottom: 8,
  },
  tokenBox: {
    backgroundColor: '#E8F5E9',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 24,
    alignItems: 'center',
    marginVertical: 12,
    width: '100%',
    borderWidth: 1.5,
    borderColor: '#81C784',
  },
  tokenLabel: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  tokenNumber: {
    fontSize: 38,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginVertical: 2,
  },
  tokenSub: {
    fontSize: 12,
    fontWeight: '600',
    color: '#388E3C',
  },
  qrContainer: {
    backgroundColor: '#FAFAFA',
    padding: 12,
    borderRadius: 12,
    alignItems: 'center',
    width: '100%',
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 14,
  },
  qrVisual: {
    fontFamily: 'monospace',
    fontSize: 9,
    lineHeight: 11,
    letterSpacing: 2,
    textAlign: 'center',
    marginBottom: 4,
  },
  bookingIdText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E6F3D',
    letterSpacing: 1,
  },
  qrHint: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  detailsTable: {
    width: '100%',
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
    marginBottom: 16,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  tableLabel: {
    fontSize: 12,
    color: '#757575',
  },
  tableValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  tableValueBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  tableValueGreen: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actions: {
    width: '100%',
    gap: 8,
  },
  primaryBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  secondaryBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  secondaryBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  outlineBtn: {
    borderWidth: 1,
    borderColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  outlineBtnText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
    fontSize: 13,
  },
  homeLinkBtn: {
    paddingVertical: 8,
    alignItems: 'center',
  },
  homeLinkText: {
    color: '#616161',
    fontWeight: '600',
    fontSize: 13,
  },
});
