import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { Booking, Crop } from '../types';
import { apiService } from '../services/api';
import { BookingCard } from '../components/BookingCard';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

type FilterTab = 'ALL' | 'UPCOMING' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED';

interface MyBookingsScreenProps {
  onSelectBooking: (id: string | number) => void;
  onNavigateToBook: () => void;
  onTrackQueue: (id: string | number) => void;
  onViewPass: (id: string | number) => void;
}

export const MyBookingsScreen: React.FC<MyBookingsScreenProps> = ({
  onSelectBooking,
  onNavigateToBook,
  onTrackQueue,
  onViewPass,
}) => {
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<FilterTab>('ALL');
  const [search, setSearch] = useState<string>('');
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [selectedCropId, setSelectedCropId] = useState<number | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);

  const fetchBookings = async () => {
    try {
      const statusParam = activeTab === 'ALL' ? undefined : activeTab;
      const list = await apiService.getBookings({
        status: statusParam,
        crop_id: selectedCropId,
        search: search.trim() || undefined,
      });
      setBookings(list);
    } catch (e) {
      console.warn('Could not fetch bookings:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    const loadCrops = async () => {
      try {
        const cropList = await apiService.getCrops();
        setCrops(cropList);
      } catch (e) {
        console.warn('Could not load crops:', e);
      }
    };
    loadCrops();
  }, []);

  useEffect(() => {
    setIsLoading(true);
    fetchBookings();
  }, [activeTab, selectedCropId, search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchBookings();
  };

  const tabs: { key: FilterTab; label: string }[] = [
    { key: 'ALL', label: 'All' },
    { key: 'UPCOMING', label: t.upcoming },
    { key: 'ACTIVE', label: t.active },
    { key: 'COMPLETED', label: t.completed },
    { key: 'CANCELLED', label: t.cancelled },
  ];

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>📋 {t.myBookings}</Text>
        <VoiceButton
          textToSpeak="Here is your complete slot booking history and live procurement status."
          label={t.voiceGuide}
        />
      </View>

      {/* Search Input */}
      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search by Booking ID (e.g. FSB-2026)..."
        value={search}
        onChangeText={setSearch}
      />

      {/* Status Filter Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.tabScroll}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={[styles.tabChip, isActive && styles.activeTabChip]}
              onPress={() => setActiveTab(tab.key)}
            >
              <Text style={[styles.tabChipText, isActive && styles.activeTabChipText]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Crop Filter Horizontal Chips */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.cropScroll}>
        <TouchableOpacity
          style={[styles.cropChip, selectedCropId === undefined && styles.activeCropChip]}
          onPress={() => setSelectedCropId(undefined)}
        >
          <Text style={[styles.cropChipText, selectedCropId === undefined && styles.activeCropChipText]}>
            All Crops
          </Text>
        </TouchableOpacity>
        {crops.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={[styles.cropChip, selectedCropId === c.id && styles.activeCropChip]}
            onPress={() => setSelectedCropId(selectedCropId === c.id ? undefined : c.id)}
          >
            <Text style={[styles.cropChipText, selectedCropId === c.id && styles.activeCropChipText]}>
              {c.name}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Bookings List */}
      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : bookings.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>📦</Text>
          <Text style={styles.emptyTitle}>{t.noBookings}</Text>
          <Text style={styles.emptyDesc}>Reserve a new procurement slot anytime</Text>
          <TouchableOpacity style={styles.newBookingBtn} onPress={onNavigateToBook}>
            <Text style={styles.newBookingBtnText}>➕ {t.bookSlot}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        bookings.map((b) => (
          <BookingCard
            key={b.id}
            booking={b}
            onPressDetails={() => onSelectBooking(b.id)}
            onPressTrackQueue={() => onTrackQueue(b.id)}
            onPressDigitalPass={() => onViewPass(b.id)}
          />
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
  headerRow: {
    marginBottom: 10,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginBottom: 10,
  },
  tabScroll: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  tabChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeTabChip: {
    backgroundColor: '#1E6F3D',
    borderColor: '#1E6F3D',
  },
  tabChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#616161',
  },
  activeTabChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  cropScroll: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  cropChip: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#E8F5E9',
    marginRight: 6,
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  activeCropChip: {
    backgroundColor: '#2E7D32',
    borderColor: '#2E7D32',
  },
  cropChipText: {
    fontSize: 11,
    color: '#1E6F3D',
  },
  activeCropChipText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  loader: {
    marginVertical: 40,
  },
  emptyCard: {
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
  emptyDesc: {
    fontSize: 12,
    color: '#757575',
    marginTop: 4,
    marginBottom: 14,
  },
  newBookingBtn: {
    backgroundColor: '#1E6F3D',
    paddingHorizontal: 18,
    paddingVertical: 10,
    borderRadius: 8,
  },
  newBookingBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: 'bold',
  },
});
