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
import { Booking } from '../types';
import { apiService } from '../services/api';
import { QueueProgressBar } from '../components/QueueProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface BookingDetailScreenProps {
  bookingId: string | number;
  onBack: () => void;
  onViewPass: (id: string | number) => void;
  onTrackQueue: (id: string | number) => void;
}

export const BookingDetailScreen: React.FC<BookingDetailScreenProps> = ({
  bookingId,
  onBack,
  onViewPass,
  onTrackQueue,
}) => {
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isActionLoading, setIsActionLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchDetails = async () => {
    try {
      const data = await apiService.getBookingById(bookingId);
      setBooking(data);
    } catch (e: any) {
      setError(e.message || 'Could not load booking details');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [bookingId]);

  const handleCancelBooking = () => {
    if (!booking) return;
    Alert.alert(
      t.cancelBooking,
      t.cancelConfirm,
      [
        { text: 'No, Keep Booking', style: 'cancel' },
        {
          text: 'Yes, Cancel Slot',
          style: 'destructive',
          onPress: async () => {
            setIsActionLoading(true);
            try {
              const updated = await apiService.cancelBooking(booking.id);
              setBooking(updated);
              Alert.alert('Booking Cancelled', 'Your reserved slot has been released back into availability.');
            } catch (e: any) {
              Alert.alert('Cancellation Error', e.message || 'Could not cancel booking.');
            } finally {
              setIsActionLoading(false);
            }
          },
        },
      ]
    );
  };

  const isCancellable =
    booking &&
    booking.status !== 'CANCELLED' &&
    booking.status !== 'COMPLETED' &&
    (booking.current_stage_index || 0) <= 1;

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topNav}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backBtnText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Booking Overview</Text>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : booking ? (
        <View>
          {/* Top Hero Banner */}
          <View style={styles.heroCard}>
            <View style={styles.codeRow}>
              <Text style={styles.bookingCode}>{booking.booking_id}</Text>
              <StatusBadge status={booking.procurement_status} />
            </View>

            <VoiceButton
              textToSpeak={`Booking ${booking.booking_id} at ${booking.mandi_name}. Queue number ${booking.queue_number}. Crop is ${booking.crop_name}, quantity ${booking.quantity} kilograms.`}
              label={t.voiceGuide}
            />

            {booking.status !== 'CANCELLED' && (
              <View style={styles.queueBar}>
                <View style={styles.queueMetric}>
                  <Text style={styles.metricLabel}>{t.queuePosition}</Text>
                  <Text style={styles.metricVal}>#{booking.queue_number}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.queueMetric}>
                  <Text style={styles.metricLabel}>{t.nowServing}</Text>
                  <Text style={styles.metricValOrange}>#{booking.now_serving_number}</Text>
                </View>
                <View style={styles.metricDivider} />
                <View style={styles.queueMetric}>
                  <Text style={styles.metricLabel}>{t.estimatedWait}</Text>
                  <Text style={styles.metricValGreen}>{booking.estimated_wait_minutes} min</Text>
                </View>
              </View>
            )}
          </View>

          {/* 7-Stage Timeline */}
          <QueueProgressBar currentStageIndex={booking.current_stage_index || 0} />

          {/* Detailed Specifications */}
          <View style={styles.specCard}>
            <Text style={styles.specTitle}>Procurement & Center Details</Text>

            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Procurement Center</Text>
              <Text style={styles.specValue}>{booking.mandi_name}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>District & State</Text>
              <Text style={styles.specValue}>{booking.mandi_district}, Kerala</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Scheduled Date</Text>
              <Text style={styles.specValue}>{booking.date}</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Time Window</Text>
              <Text style={styles.specValue}>
                {booking.start_time} – {booking.end_time}
              </Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Crop Category</Text>
              <Text style={styles.specValue}>{booking.crop_name} ({booking.crop_category})</Text>
            </View>
            <View style={styles.specRow}>
              <Text style={styles.specLabel}>Quantity</Text>
              <Text style={styles.specValueBold}>{booking.quantity} kg</Text>
            </View>
            <View style={styles.specRowTotal}>
              <Text style={styles.specLabelTotal}>Total Procurement Value</Text>
              <Text style={styles.specValueTotal}>₹{booking.total_amount?.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          {/* Primary Action Buttons */}
          <View style={styles.actionGroup}>
            <TouchableOpacity
              style={styles.passBtn}
              onPress={() => onViewPass(booking.id)}
            >
              <Text style={styles.passBtnText}>🎫 View Digital Entry Pass (QR)</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.trackBtn}
              onPress={() => onTrackQueue(booking.id)}
            >
              <Text style={styles.trackBtnText}>⏱️ Live Queue Tracking</Text>
            </TouchableOpacity>

            {isCancellable && (
              <TouchableOpacity
                style={styles.cancelBtn}
                onPress={handleCancelBooking}
                disabled={isActionLoading}
              >
                {isActionLoading ? (
                  <ActivityIndicator color="#C62828" />
                ) : (
                  <Text style={styles.cancelBtnText}>❌ {t.cancelBooking}</Text>
                )}
              </TouchableOpacity>
            )}
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
    paddingBottom: 40,
  },
  topNav: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
    paddingHorizontal: 8,
    marginRight: 10,
  },
  backBtnText: {
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
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 10,
  },
  codeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  bookingCode: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  queueBar: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    marginTop: 10,
    justifyContent: 'space-around',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  queueMetric: {
    alignItems: 'center',
  },
  metricLabel: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
  },
  metricVal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  metricValOrange: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#E65100',
  },
  metricValGreen: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  metricDivider: {
    width: 1,
    height: 28,
    backgroundColor: '#C8E6C9',
  },
  specCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  specTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  specRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  specLabel: {
    fontSize: 12,
    color: '#757575',
  },
  specValue: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  specValueBold: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  specRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 6,
  },
  specLabelTotal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  specValueTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actionGroup: {
    gap: 10,
    marginVertical: 10,
  },
  passBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
  },
  passBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
  trackBtn: {
    backgroundColor: '#2E7D32',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  cancelBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  cancelBtnText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
