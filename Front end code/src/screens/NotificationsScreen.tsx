import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useBooking } from '../context/BookingContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';

interface NotificationsScreenProps {
  onBack: () => void;
}

export const NotificationsScreen: React.FC<NotificationsScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();
  const { notifications, refreshNotifications, markAllNotificationsAsRead, isLoading } = useBooking();

  const handleMarkRead = async (id: number) => {
    try {
      await apiService.markNotificationRead(id);
      await refreshNotifications();
    } catch (e) {
      console.warn('Could not mark read:', e);
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'BOOKING':
        return '📋';
      case 'QUEUE':
        return '⏱️';
      case 'PROCUREMENT':
        return '🌾';
      case 'PAYMENT':
        return '💰';
      case 'REMINDER':
        return '⏰';
      default:
        return '🔔';
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.topRow}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>🔔 {t.notifications}</Text>
      </View>

      <View style={styles.actionRow}>
        <TouchableOpacity style={styles.markAllBtn} onPress={markAllNotificationsAsRead}>
          <Text style={styles.markAllText}>✓ {t.markAllRead}</Text>
        </TouchableOpacity>
      </View>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : notifications.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>🔕</Text>
          <Text style={styles.emptyTitle}>{t.noNotifications}</Text>
          <Text style={styles.emptySub}>
            You will receive slot confirmations, queue alerts and payment updates here.
          </Text>
        </View>
      ) : (
        notifications.map((n) => (
          <TouchableOpacity
            key={n.id}
            style={[styles.notifCard, !n.read && styles.unreadCard]}
            onPress={() => handleMarkRead(n.id)}
          >
            <View style={styles.notifHeader}>
              <View style={styles.iconCircle}>
                <Text style={styles.iconText}>{getNotifIcon(n.type)}</Text>
              </View>
              <View style={styles.titleArea}>
                <Text style={[styles.notifTitle, !n.read && styles.unreadTitle]}>
                  {n.title}
                </Text>
                <Text style={styles.notifTime}>
                  {new Date(n.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </Text>
              </View>
              {!n.read && <View style={styles.unreadDot} />}
            </View>
            <Text style={styles.notifMessage}>{n.message}</Text>
          </TouchableOpacity>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
    paddingBottom: 40,
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
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 10,
  },
  markAllBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
  },
  markAllText: {
    fontSize: 11,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 40,
  },
  emptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    alignItems: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  emptyIcon: {
    fontSize: 36,
    marginBottom: 8,
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#424242',
  },
  emptySub: {
    fontSize: 12,
    color: '#757575',
    textAlign: 'center',
    marginTop: 4,
  },
  notifCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    elevation: 1,
  },
  unreadCard: {
    backgroundColor: '#F1F8E9',
    borderColor: '#C8E6C9',
    borderLeftWidth: 4,
    borderLeftColor: '#1E6F3D',
  },
  notifHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  iconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  iconText: {
    fontSize: 16,
  },
  titleArea: {
    flex: 1,
  },
  notifTitle: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  unreadTitle: {
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  notifTime: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 1,
  },
  unreadDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#1E6F3D',
  },
  notifMessage: {
    fontSize: 12,
    color: '#616161',
    lineHeight: 16,
    paddingLeft: 42,
  },
});
