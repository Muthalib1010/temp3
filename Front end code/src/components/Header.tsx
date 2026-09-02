import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { useBooking } from '../context/BookingContext';

interface HeaderProps {
  title?: string;
  onOpenLanguage?: () => void;
  onOpenNotifications?: () => void;
  showBack?: boolean;
  onBack?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  title,
  onOpenLanguage,
  onOpenNotifications,
  showBack,
  onBack,
}) => {
  const { user } = useAuth();
  const { t, language } = useLanguage();
  const { unreadCount } = useBooking();

  return (
    <View style={styles.container}>
      <View style={styles.topGovBar}>
        <Text style={styles.govText}>🇮🇳 GOVERNMENT OF INDIA • DEPT OF AGRICULTURE</Text>
      </View>
      <View style={styles.mainHeader}>
        <View style={styles.leftSection}>
          {showBack ? (
            <TouchableOpacity onPress={onBack} style={styles.backButton}>
              <Text style={styles.backIcon}>←</Text>
            </TouchableOpacity>
          ) : (
            <View style={styles.logoBadge}>
              <Text style={styles.logoIcon}>🌾</Text>
            </View>
          )}
          <View style={styles.titleContainer}>
            <Text style={styles.appName}>
              {title || (user ? `${t.namaste}, ${user.name.split(' ')[0]}` : t.appName)}
            </Text>
            {!title && (
              <Text style={styles.subGreeting}>
                {user?.village ? `${user.village}, ${user.district}` : t.tagline}
              </Text>
            )}
          </View>
        </View>

        <View style={styles.rightSection}>
          {onOpenLanguage && (
            <TouchableOpacity onPress={onOpenLanguage} style={styles.langBtn}>
              <Text style={styles.langBtnText}>🌐 {language.toUpperCase()}</Text>
            </TouchableOpacity>
          )}

          {onOpenNotifications && (
            <TouchableOpacity onPress={onOpenNotifications} style={styles.notifBtn}>
              <Text style={styles.notifIcon}>🔔</Text>
              {unreadCount > 0 && (
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>{unreadCount > 9 ? '9+' : unreadCount}</Text>
                </View>
              )}
            </TouchableOpacity>
          )}
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#1E6F3D',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  topGovBar: {
    backgroundColor: '#144A29',
    paddingVertical: 3,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  govText: {
    color: '#D4EDDA',
    fontSize: 10,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  mainHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  logoBadge: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  logoIcon: {
    fontSize: 20,
  },
  backButton: {
    marginRight: 12,
    padding: 6,
  },
  backIcon: {
    fontSize: 24,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  titleContainer: {
    flex: 1,
  },
  appName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  subGreeting: {
    fontSize: 12,
    color: '#C8E6C9',
    marginTop: 1,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  langBtn: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
  },
  langBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  notifBtn: {
    padding: 6,
    position: 'relative',
  },
  notifIcon: {
    fontSize: 22,
  },
  badge: {
    position: 'absolute',
    top: 2,
    right: 2,
    backgroundColor: '#E53935',
    borderRadius: 9,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: 'bold',
  },
});
