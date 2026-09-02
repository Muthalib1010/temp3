import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface SplashScreenProps {
  onFinish: () => void;
}

export const SplashScreen: React.FC<SplashScreenProps> = ({ onFinish }) => {
  const { t } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 2000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <View style={styles.container}>
      <View style={styles.centerContent}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoEmoji}>🌾</Text>
        </View>
        <Text style={styles.govTitle}>भारत सरकार • GOVERNMENT OF INDIA</Text>
        <Text style={styles.appName}>{t.appName}</Text>
        <Text style={styles.subtitle}>"{t.tagline}"</Text>
        <View style={styles.badgeRow}>
          <Text style={styles.badge}>🚜 National E-Procurement Portal</Text>
        </View>
      </View>

      <View style={styles.bottomContent}>
        <ActivityIndicator size="large" color="#FFFFFF" />
        <Text style={styles.loadingText}>Smart India Hackathon 2026</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1E6F3D',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 50,
  },
  centerContent: {
    alignItems: 'center',
    marginTop: 'auto',
    marginBottom: 'auto',
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowRadius: 10,
    marginBottom: 20,
  },
  logoEmoji: {
    fontSize: 50,
  },
  govTitle: {
    color: '#C8E6C9',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1.5,
    marginBottom: 8,
  },
  appName: {
    color: '#FFFFFF',
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  subtitle: {
    color: '#E8F5E9',
    fontSize: 16,
    fontStyle: 'italic',
    marginTop: 8,
  },
  badgeRow: {
    marginTop: 18,
    backgroundColor: 'rgba(255,255,255,0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  badge: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
  },
  bottomContent: {
    alignItems: 'center',
  },
  loadingText: {
    color: '#C8E6C9',
    fontSize: 12,
    marginTop: 12,
    fontWeight: '500',
  },
});
