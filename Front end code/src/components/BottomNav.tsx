import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

export type TabName = 'home' | 'book' | 'my_bookings' | 'payments' | 'profile';

interface BottomNavProps {
  currentTab: TabName;
  onSelectTab: (tab: TabName) => void;
}

export const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onSelectTab }) => {
  const { t } = useLanguage();

  const tabs: { key: TabName; label: string; icon: string }[] = [
    { key: 'home', label: t.home, icon: '🏠' },
    { key: 'book', label: t.bookSlot, icon: '📅' },
    { key: 'my_bookings', label: t.myBookings, icon: '📋' },
    { key: 'payments', label: t.payments, icon: '💳' },
    { key: 'profile', label: t.profile, icon: '👤' },
  ];

  return (
    <View style={styles.container}>
      {tabs.map(tab => {
        const isActive = currentTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={[styles.tabItem, isActive && styles.activeTabItem]}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <Text style={[styles.tabIcon, isActive && styles.activeTabIcon]}>{tab.icon}</Text>
            <Text style={[styles.tabLabel, isActive && styles.activeTabLabel]} numberOfLines={1}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingVertical: 6,
    paddingHorizontal: 8,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    justifyContent: 'space-around',
  },
  tabItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
    paddingHorizontal: 6,
    borderRadius: 8,
    flex: 1,
  },
  activeTabItem: {
    backgroundColor: '#E8F5E9',
  },
  tabIcon: {
    fontSize: 22,
    marginBottom: 2,
  },
  activeTabIcon: {
    transform: [{ scale: 1.1 }],
  },
  tabLabel: {
    fontSize: 11,
    color: '#616161',
    fontWeight: '500',
  },
  activeTabLabel: {
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
});
