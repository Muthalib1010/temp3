import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface OfflineBannerProps {
  isOffline: boolean;
  lastUpdated?: string;
}

export const OfflineBanner: React.FC<OfflineBannerProps> = ({ isOffline, lastUpdated }) => {
  const { t } = useLanguage();

  if (!isOffline) return null;

  return (
    <View style={styles.banner}>
      <Text style={styles.icon}>📡</Text>
      <Text style={styles.text}>
        {t.offline} • {lastUpdated || 'Showing cached data'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  banner: {
    backgroundColor: '#FFF3E0',
    paddingVertical: 6,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#FFE0B2',
  },
  icon: {
    marginRight: 6,
    fontSize: 12,
  },
  text: {
    color: '#E65100',
    fontSize: 11,
    fontWeight: 'bold',
  },
});
