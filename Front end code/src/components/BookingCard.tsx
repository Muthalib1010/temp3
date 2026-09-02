import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Booking } from '../types';
import { StatusBadge } from './StatusBadge';
import { useLanguage } from '../context/LanguageContext';

interface BookingCardProps {
  booking: Booking;
  onPressDetails?: () => void;
  onPressTrackQueue?: () => void;
  onPressDigitalPass?: () => void;
}

export const BookingCard: React.FC<BookingCardProps> = ({
  booking,
  onPressDetails,
  onPressTrackQueue,
  onPressDigitalPass,
}) => {
  const { t } = useLanguage();

  return (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <View style={styles.badgeRow}>
          <Text style={styles.bookingIdText}>{booking.booking_id}</Text>
          <StatusBadge status={booking.procurement_status || booking.status} />
        </View>
        <Text style={styles.dateText}>📅 {booking.date} • {booking.start_time}</Text>
      </View>

      <View style={styles.mandiSection}>
        <Text style={styles.mandiName}>🏛️ {booking.mandi_name}</Text>
        <Text style={styles.mandiDistrict}>{booking.mandi_district}</Text>
      </View>

      <View style={styles.detailsGrid}>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t.crop}</Text>
          <Text style={styles.gridValue}>🌾 {booking.crop_name}</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>{t.quantity}</Text>
          <Text style={styles.gridValue}>⚖️ {booking.quantity} kg</Text>
        </View>
        <View style={styles.gridItem}>
          <Text style={styles.gridLabel}>Est. Value</Text>
          <Text style={styles.gridValue}>₹{booking.total_amount?.toLocaleString('en-IN')}</Text>
        </View>
      </View>

      {booking.status !== 'CANCELLED' && booking.status !== 'COMPLETED' && (
        <View style={styles.liveQueueHighlight}>
          <View style={styles.queueCol}>
            <Text style={styles.queueLabel}>{t.queuePosition}</Text>
            <Text style={styles.queueValue}>#{booking.queue_number}</Text>
          </View>
          <View style={styles.queueDivider} />
          <View style={styles.queueCol}>
            <Text style={styles.queueLabel}>{t.nowServing}</Text>
            <Text style={styles.queueValueServing}>#{booking.now_serving_number || 1}</Text>
          </View>
          <View style={styles.queueDivider} />
          <View style={styles.queueCol}>
            <Text style={styles.queueLabel}>{t.estimatedWait}</Text>
            <Text style={styles.queueValueWait}>
              {booking.estimated_wait_minutes} {t.minutes}
            </Text>
          </View>
        </View>
      )}

      <View style={styles.actionButtonsRow}>
        {onPressTrackQueue && (
          <TouchableOpacity style={styles.trackBtn} onPress={onPressTrackQueue}>
            <Text style={styles.trackBtnText}>⏱️ {t.trackQueue}</Text>
          </TouchableOpacity>
        )}
        {onPressDigitalPass && (
          <TouchableOpacity style={styles.passBtn} onPress={onPressDigitalPass}>
            <Text style={styles.passBtnText}>🎫 {t.digitalPass}</Text>
          </TouchableOpacity>
        )}
        {onPressDetails && (
          <TouchableOpacity style={styles.detailBtn} onPress={onPressDetails}>
            <Text style={styles.detailBtnText}>{t.viewBooking} →</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginVertical: 8,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    borderWidth: 1,
    borderColor: '#E8F5E9',
  },
  cardHeader: {
    marginBottom: 10,
  },
  badgeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  bookingIdText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  dateText: {
    fontSize: 12,
    color: '#616161',
    fontWeight: '500',
  },
  mandiSection: {
    backgroundColor: '#F9FAF8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  mandiName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E382E',
  },
  mandiDistrict: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  detailsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    backgroundColor: '#F5F5F5',
    padding: 10,
    borderRadius: 8,
  },
  gridItem: {
    flex: 1,
  },
  gridLabel: {
    fontSize: 11,
    color: '#757575',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#212121',
  },
  liveQueueHighlight: {
    flexDirection: 'row',
    backgroundColor: '#E8F5E9',
    borderRadius: 10,
    padding: 10,
    marginBottom: 12,
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  queueCol: {
    alignItems: 'center',
    flex: 1,
  },
  queueDivider: {
    width: 1,
    height: 30,
    backgroundColor: '#C8E6C9',
  },
  queueLabel: {
    fontSize: 10,
    color: '#2E7D32',
    fontWeight: '600',
    marginBottom: 2,
  },
  queueValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  queueValueServing: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#E65100',
  },
  queueValueWait: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  actionButtonsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 4,
  },
  trackBtn: {
    flex: 1,
    backgroundColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  trackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  passBtn: {
    flex: 1,
    backgroundColor: '#2E7D32',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  passBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: 'bold',
  },
  detailBtn: {
    backgroundColor: '#F5F5F5',
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  detailBtnText: {
    color: '#424242',
    fontSize: 12,
    fontWeight: 'bold',
  },
});
