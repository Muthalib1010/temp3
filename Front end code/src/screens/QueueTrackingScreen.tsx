import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Booking } from '../types';
import { apiService } from '../services/api';
import { QueueProgressBar } from '../components/QueueProgressBar';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface QueueTrackingScreenProps {
  bookingId?: string | number;
  onBack: () => void;
  onViewPass?: () => void;
}

export const QueueTrackingScreen: React.FC<QueueTrackingScreenProps> = ({
  bookingId,
  onBack,
  onViewPass,
}) => {
  const { t } = useLanguage();
  const [booking, setBooking] = useState<Booking | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  const fetchLiveQueue = async () => {
    setError('');
    try {
      if (bookingId) {
        const res = await apiService.getBookingById(bookingId);
        setBooking(res);
      } else {
        const list = await apiService.getBookings();
        const active = list.find((b) => b.status !== 'CANCELLED' && b.status !== 'COMPLETED') || list[0];
        if (active) {
          const fresh = await apiService.getBookingById(active.id);
          setBooking(fresh);
        } else {
          setError('No active bookings currently in queue');
        }
      }
    } catch (e: any) {
      setError(e.message || 'Could not refresh queue status');
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchLiveQueue();
    const interval = setInterval(fetchLiveQueue, 6000); // 6s live polling
    return () => clearInterval(interval);
  }, [bookingId]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchLiveQueue();
  };

  const queueSpeech = booking
    ? `Live Queue Status. You are token number ${booking.queue_number}. Mandi is currently serving token ${booking.now_serving_number}. There are ${booking.ahead_in_queue} farmers ahead of you. Estimated wait is ${booking.estimated_wait_minutes} minutes.`
    : 'No active queue token found.';

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Live Mandi Queue Tracking</Text>
      </View>

      <VoiceButton textToSpeak={queueSpeech} label={t.voiceGuide} />

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : booking ? (
        <View>
          {/* Main Queue Dashboard Hero */}
          <View style={styles.queueHeroCard}>
            <View style={styles.liveBadgeRow}>
              <View style={styles.livePulseCircle} />
              <Text style={styles.liveText}>REAL-TIME QUEUE MONITOR</Text>
            </View>

            <View style={styles.queueHeroGrid}>
              <View style={styles.queueCol}>
                <Text style={styles.queueColLabel}>YOUR POSITION</Text>
                <Text style={styles.queueColNumber}>#{booking.queue_number}</Text>
                <Text style={styles.queueColSub}>Token Assigned</Text>
              </View>

              <View style={styles.heroDivider} />

              <View style={styles.queueCol}>
                <Text style={styles.queueColLabel}>NOW SERVING</Text>
                <Text style={styles.servingNumber}>#{booking.now_serving_number}</Text>
                <Text style={styles.servingSub}>Counter #1 Active</Text>
              </View>
            </View>

            <View style={styles.waitHighlightBox}>
              <View style={styles.waitRow}>
                <Text style={styles.waitLabel}>👥 Ahead of You:</Text>
                <Text style={styles.waitVal}>
                  {booking.ahead_in_queue} {t.farmers}
                </Text>
              </View>
              <View style={styles.waitRow}>
                <Text style={styles.waitLabel}>⏳ {t.estimatedWait}:</Text>
                <Text style={styles.waitValGreen}>
                  {booking.estimated_wait_minutes} {t.minutes}
                </Text>
              </View>
            </View>

            {/* Visual Dot Progress Simulation */}
            <View style={styles.dotsSection}>
              <Text style={styles.dotsLabel}>Live Visual Queue Flow:</Text>
              <View style={styles.dotsRow}>
                {/* Completed dots */}
                {[...Array(Math.min(4, Math.max(1, booking.now_serving_number - 1)))].map((_, i) => (
                  <View key={`comp-${i}`} style={[styles.dot, styles.dotCompleted]} />
                ))}
                {/* Now Serving / You */}
                <View style={[styles.dot, styles.dotYou]}>
                  <Text style={styles.youText}>YOU</Text>
                </View>
                {/* Waiting dots */}
                {[...Array(Math.min(5, Math.max(1, booking.ahead_in_queue)))].map((_, i) => (
                  <View key={`wait-${i}`} style={[styles.dot, styles.dotWaiting]} />
                ))}
              </View>
              <View style={styles.dotLegend}>
                <Text style={styles.legendItem}>🟢 Completed</Text>
                <Text style={styles.legendItem}>🟡 You (#{booking.queue_number})</Text>
                <Text style={styles.legendItem}>⚪ Waiting</Text>
              </View>
            </View>
          </View>

          {/* 7-Stage Milestone Progression */}
          <QueueProgressBar currentStageIndex={booking.current_stage_index || 0} />

          {/* Booking Summary Box */}
          <View style={styles.summaryCard}>
            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Mandi Center</Text>
              <Text style={styles.sumVal}>{booking.mandi_name}</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Crop & Quantity</Text>
              <Text style={styles.sumVal}>{booking.crop_name} ({booking.quantity} kg)</Text>
            </View>
            <View style={styles.summaryRow}>
              <Text style={styles.sumLabel}>Current Status</Text>
              <StatusBadge status={booking.procurement_status} />
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actions}>
            {onViewPass && (
              <TouchableOpacity style={styles.passBtn} onPress={onViewPass}>
                <Text style={styles.passBtnText}>🎫 View Digital Gate Pass</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity style={styles.refreshBtn} onPress={fetchLiveQueue}>
              <Text style={styles.refreshBtnText}>🔄 Refresh Queue Now</Text>
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
  queueHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    elevation: 4,
    borderWidth: 2,
    borderColor: '#1E6F3D',
    marginVertical: 10,
  },
  liveBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  livePulseCircle: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#E53935',
    marginRight: 6,
  },
  liveText: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#E53935',
    letterSpacing: 1,
  },
  queueHeroGrid: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: 10,
    backgroundColor: '#F9FAF8',
    borderRadius: 12,
    marginBottom: 14,
  },
  queueCol: {
    alignItems: 'center',
  },
  queueColLabel: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#757575',
    letterSpacing: 0.5,
  },
  queueColNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginVertical: 2,
  },
  queueColSub: {
    fontSize: 11,
    color: '#388E3C',
  },
  heroDivider: {
    width: 1,
    height: 50,
    backgroundColor: '#E0E0E0',
  },
  servingNumber: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#E65100',
    marginVertical: 2,
  },
  servingSub: {
    fontSize: 11,
    color: '#F57C00',
  },
  waitHighlightBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 10,
    marginBottom: 14,
  },
  waitRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  waitLabel: {
    fontSize: 13,
    color: '#2E7D32',
    fontWeight: '600',
  },
  waitVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  waitValGreen: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  dotsSection: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 12,
  },
  dotsLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: 'bold',
    marginBottom: 8,
  },
  dotsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 6,
  },
  dot: {
    width: 16,
    height: 16,
    borderRadius: 8,
  },
  dotCompleted: {
    backgroundColor: '#4CAF50',
  },
  dotYou: {
    width: 38,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#FFB300',
    alignItems: 'center',
    justifyContent: 'center',
  },
  youText: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  dotWaiting: {
    backgroundColor: '#E0E0E0',
  },
  dotLegend: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 8,
  },
  legendItem: {
    fontSize: 10,
    color: '#616161',
  },
  summaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginVertical: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  sumLabel: {
    fontSize: 12,
    color: '#757575',
  },
  sumVal: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  actions: {
    gap: 10,
    marginTop: 6,
    marginBottom: 20,
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
  refreshBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
  },
  refreshBtnText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
    fontSize: 13,
  },
});
