import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

interface StatusBadgeProps {
  status: string;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status }) => {
  const getBadgeConfig = () => {
    switch (status.toUpperCase()) {
      case 'CONFIRMED':
      case 'BOOKED':
        return { bg: '#E3F2FD', text: '#1976D2', label: 'Confirmed' };
      case 'ARRIVED':
        return { bg: '#FFF8E1', text: '#F57F17', label: 'Arrived at Mandi' };
      case 'IN_PROGRESS':
      case 'WEIGHING':
        return { bg: '#EDE7F6', text: '#512DA8', label: 'Weighing in Progress' };
      case 'QUALITY_CHECK':
        return { bg: '#E0F7FA', text: '#00838F', label: 'Quality Grading' };
      case 'COMPLETED':
        return { bg: '#E8F5E9', text: '#2E7D32', label: 'Procured' };
      case 'PAYMENT_PROCESSING':
      case 'PROCESSING':
        return { bg: '#FFF3E0', text: '#E65100', label: 'DBT Processing' };
      case 'PAYMENT_COMPLETED':
        return { bg: '#E8F5E9', text: '#1B5E20', label: 'Paid via DBT' };
      case 'CANCELLED':
        return { bg: '#FFEBEE', text: '#C62828', label: 'Cancelled' };
      default:
        return { bg: '#EEEEEE', text: '#616161', label: status };
    }
  };

  const config = getBadgeConfig();

  return (
    <View style={[styles.badge, { backgroundColor: config.bg }]}>
      <Text style={[styles.badgeText, { color: config.text }]}>{config.label}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: 'bold',
  },
});
