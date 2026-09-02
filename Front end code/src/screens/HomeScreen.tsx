import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Modal,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';
import { BookingCard } from '../components/BookingCard';
import { QueueProgressBar } from '../components/QueueProgressBar';
import { VoiceButton } from '../components/VoiceButton';
import { OfflineBanner } from '../components/OfflineBanner';

interface HomeScreenProps {
  onNavigateToBook: () => void;
  onNavigateToTrack: () => void;
  onNavigateToPass: () => void;
  onNavigateToPayments: () => void;
  onNavigateToBookingDetail: (id: string | number) => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  onNavigateToBook,
  onNavigateToTrack,
  onNavigateToPass,
  onNavigateToPayments,
  onNavigateToBookingDetail,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { activeBooking, refreshActiveBooking, isOffline, notifications } = useBooking();
  const [refreshing, setRefreshing] = useState(false);
  const [showWhyModal, setShowWhyModal] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refreshActiveBooking();
    setRefreshing(false);
  };

  const welcomeSpeech = activeBooking
    ? `Namaste ${user?.name}. You have an active slot at ${activeBooking.mandi_name} for ${activeBooking.crop_name}. Your queue position is ${activeBooking.queue_number}.`
    : `Namaste ${user?.name}. Welcome to Farmer Slot Booking Portal. Click Book Slot to reserve a time at your local procurement center.`;

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <OfflineBanner isOffline={isOffline} />

      {/* Voice Assistant Bar */}
      <View style={styles.voiceBar}>
        <VoiceButton textToSpeak={welcomeSpeech} label={t.voiceGuide} />
        <TouchableOpacity style={styles.whyBtn} onPress={() => setShowWhyModal(true)}>
          <Text style={styles.whyBtnText}>ℹ️ {t.whyThisApp}</Text>
        </TouchableOpacity>
      </View>

      {/* 1. Current Active Booking Card */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>📌 {t.todayProcurement}</Text>
          {activeBooking && (
            <TouchableOpacity onPress={() => onNavigateToBookingDetail(activeBooking.id)}>
              <Text style={styles.seeAllText}>{t.viewBooking} →</Text>
            </TouchableOpacity>
          )}
        </View>

        {activeBooking ? (
          <View>
            <BookingCard
              booking={activeBooking}
              onPressDetails={() => onNavigateToBookingDetail(activeBooking.id)}
              onPressTrackQueue={onNavigateToTrack}
              onPressDigitalPass={onNavigateToPass}
            />
            <QueueProgressBar currentStageIndex={activeBooking.current_stage_index || 0} />
          </View>
        ) : (
          <View style={styles.noBookingCard}>
            <Text style={styles.noBookingIcon}>🌾</Text>
            <Text style={styles.noBookingTitle}>{t.noActiveBooking}</Text>
            <Text style={styles.noBookingDesc}>{t.bookYourSlotNow}</Text>
            <TouchableOpacity style={styles.bookNowBtn} onPress={onNavigateToBook}>
              <Text style={styles.bookNowBtnText}>➕ {t.bookSlot}</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* 2. Four Large Farmer Quick Actions */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>⚡ {t.quickActions}</Text>
        <View style={styles.quickGrid}>
          <TouchableOpacity style={[styles.quickCard, styles.cardGreen]} onPress={onNavigateToBook}>
            <View style={styles.quickIconCircle}>
              <Text style={styles.quickIcon}>📅</Text>
            </View>
            <Text style={styles.quickTitle}>{t.bookSlot}</Text>
            <Text style={styles.quickDesc}>Reserve Mandi time</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, styles.cardBlue]} onPress={onNavigateToTrack}>
            <View style={styles.quickIconCircle}>
              <Text style={styles.quickIcon}>⏱️</Text>
            </View>
            <Text style={styles.quickTitle}>{t.trackQueue}</Text>
            <Text style={styles.quickDesc}>Live queue position</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, styles.cardOrange]} onPress={onNavigateToPayments}>
            <View style={styles.quickIconCircle}>
              <Text style={styles.quickIcon}>💳</Text>
            </View>
            <Text style={styles.quickTitle}>{t.payments}</Text>
            <Text style={styles.quickDesc}>DBT payment status</Text>
          </TouchableOpacity>

          <TouchableOpacity style={[styles.quickCard, styles.cardPurple]} onPress={onNavigateToPass}>
            <View style={styles.quickIconCircle}>
              <Text style={styles.quickIcon}>🎫</Text>
            </View>
            <Text style={styles.quickTitle}>{t.digitalPass}</Text>
            <Text style={styles.quickDesc}>Gate entry QR code</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 3. Recent Notifications Preview */}
      {notifications.length > 0 && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>🔔 Recent Updates</Text>
          {notifications.slice(0, 2).map((n) => (
            <View key={n.id} style={styles.notifCard}>
              <Text style={styles.notifTitle}>{n.title}</Text>
              <Text style={styles.notifMessage}>{n.message}</Text>
            </View>
          ))}
        </View>
      )}

      {/* Why This App Modal (SIH Criteria Requirement) */}
      <Modal visible={showWhyModal} transparent animationType="fade" onRequestClose={() => setShowWhyModal(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalHeading}>🌾 {t.whyThisApp}</Text>
            <Text style={styles.modalSubtitle}>SIH Problem Statement 260321</Text>
            
            <View style={styles.problemBox}>
              <Text style={styles.boxTitle}>⚠️ Problem Faced by Farmers:</Text>
              <Text style={styles.boxText}>
                Unpredictable Mandi congestion, hours of vehicle queueing, lack of clear slot availability, and delayed DBT payment visibility.
              </Text>
            </View>

            <View style={styles.solutionBox}>
              <Text style={styles.boxTitle}>✅ Our Solution:</Text>
              <Text style={styles.boxText}>
                Guaranteed time slots with overbooking prevention, live queue token updates, offline-accessible digital QR passes, and transparent PFMS payment milestones.
              </Text>
            </View>

            <TouchableOpacity style={styles.closeModalBtn} onPress={() => setShowWhyModal(false)}>
              <Text style={styles.closeModalBtnText}>Understood ✓</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
    paddingBottom: 30,
  },
  voiceBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  whyBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  whyBtnText: {
    fontSize: 11,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  section: {
    marginBottom: 16,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2E382E',
  },
  seeAllText: {
    fontSize: 12,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  noBookingCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  noBookingIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  noBookingTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  noBookingDesc: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginVertical: 6,
  },
  bookNowBtn: {
    backgroundColor: '#1E6F3D',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 8,
  },
  bookNowBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 4,
  },
  quickCard: {
    flexBasis: '48%',
    flexGrow: 1,
    padding: 14,
    borderRadius: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  cardGreen: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  cardBlue: {
    backgroundColor: '#E3F2FD',
    borderWidth: 1,
    borderColor: '#BBDEFB',
  },
  cardOrange: {
    backgroundColor: '#FFF3E0',
    borderWidth: 1,
    borderColor: '#FFE0B2',
  },
  cardPurple: {
    backgroundColor: '#F3E5F5',
    borderWidth: 1,
    borderColor: '#E1BEE7',
  },
  quickIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
  },
  quickIcon: {
    fontSize: 20,
  },
  quickTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  quickDesc: {
    fontSize: 10,
    color: '#616161',
    marginTop: 2,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 12,
    marginBottom: 8,
    borderLeftWidth: 4,
    borderLeftColor: '#1E6F3D',
    elevation: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  notifMessage: {
    fontSize: 11,
    color: '#616161',
    marginTop: 2,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    width: '100%',
    maxWidth: 420,
  },
  modalHeading: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 14,
  },
  problemBox: {
    backgroundColor: '#FFEBEE',
    padding: 12,
    borderRadius: 8,
    marginBottom: 10,
  },
  solutionBox: {
    backgroundColor: '#E8F5E9',
    padding: 12,
    borderRadius: 8,
    marginBottom: 16,
  },
  boxTitle: {
    fontSize: 12,
    fontWeight: 'bold',
    marginBottom: 4,
    color: '#212121',
  },
  boxText: {
    fontSize: 11,
    color: '#424242',
    lineHeight: 16,
  },
  closeModalBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  closeModalBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 14,
  },
});
