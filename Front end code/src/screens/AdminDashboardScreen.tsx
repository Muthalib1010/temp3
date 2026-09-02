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
  Alert,
} from 'react-native';
import { AdminDashboardSummary, AdminQueueItem } from '../types';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../context/LanguageContext';

interface AdminDashboardScreenProps {
  onBack: () => void;
}

export const AdminDashboardScreen: React.FC<AdminDashboardScreenProps> = ({ onBack }) => {
  const { t } = useLanguage();

  const [summary, setSummary] = useState<AdminDashboardSummary | null>(null);
  const [queue, setQueue] = useState<AdminQueueItem[]>([]);
  const [search, setSearch] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      const [sumData, queueData] = await Promise.all([
        apiService.getAdminDashboard(),
        apiService.getAdminQueue(undefined, search.trim() || undefined),
      ]);
      setSummary(sumData);
      setQueue(queueData);
    } catch (e: any) {
      console.warn('Admin fetch error:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [search]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleCallNext = async () => {
    setActionLoading('call_next');
    try {
      const res = await apiService.adminCallNextFarmer();
      Alert.alert('📢 Queue Advanced', res.message);
      await fetchData();
    } catch (e: any) {
      Alert.alert('Action Failed', e.message || 'Could not call next farmer');
    } finally {
      setActionLoading(null);
    }
  };

  const handleAdvanceStage = async (bookingId: number) => {
    setActionLoading(`adv_${bookingId}`);
    try {
      await apiService.advanceStage(bookingId);
      await fetchData();
    } catch (e: any) {
      Alert.alert('Stage Error', e.message || 'Could not advance stage');
    } finally {
      setActionLoading(null);
    }
  };

  const handleClearPayment = async (bookingId: number) => {
    setActionLoading(`pay_${bookingId}`);
    try {
      await apiService.clearPayment(bookingId);
      Alert.alert('💰 Payment Cleared', 'DBT PFMS transaction completed.');
      await fetchData();
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'Could not clear payment');
    } finally {
      setActionLoading(null);
    }
  };

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      {/* Top Header */}
      <View style={styles.topHeader}>
        <TouchableOpacity onPress={onBack} style={styles.backBtn}>
          <Text style={styles.backText}>← Back to Farmer Mode</Text>
        </TouchableOpacity>
        <Text style={styles.officerBadge}>🛡️ MANDI OFFICER DESK</Text>
      </View>

      <Text style={styles.pageTitle}>{t.adminPortal}</Text>
      <Text style={styles.centerName}>Aluva APMC Procurement Center Yard #1</Text>

      {/* Hero Action: Call Next Farmer */}
      <TouchableOpacity
        style={[styles.callNextHeroBtn, actionLoading === 'call_next' && styles.disabledBtn]}
        onPress={handleCallNext}
        disabled={actionLoading === 'call_next'}
      >
        <Text style={styles.callNextIcon}>📢</Text>
        <View style={styles.callNextTextArea}>
          <Text style={styles.callNextTitle}>{t.callNextFarmer}</Text>
          <Text style={styles.callNextSub}>
            Advances live token #{summary?.now_serving || 1} → #{(summary?.now_serving || 1) + 1} & alerts farmer
          </Text>
        </View>
      </TouchableOpacity>

      {/* Summary Metrics Grid */}
      <Text style={styles.sectionHeader}>Today's Operational Summary</Text>
      {summary && (
        <View style={styles.metricsGrid}>
          <View style={[styles.metricCard, styles.bgBlue]}>
            <Text style={styles.metricNumber}>{summary.total_bookings_today}</Text>
            <Text style={styles.metricTitle}>Total Bookings</Text>
          </View>
          <View style={[styles.metricCard, styles.bgYellow]}>
            <Text style={styles.metricNumber}>{summary.waiting_count}</Text>
            <Text style={styles.metricTitle}>In Queue Waiting</Text>
          </View>
          <View style={[styles.metricCard, styles.bgPurple]}>
            <Text style={styles.metricNumber}>{summary.in_procurement_count}</Text>
            <Text style={styles.metricTitle}>In Procurement</Text>
          </View>
          <View style={[styles.metricCard, styles.bgGreen]}>
            <Text style={styles.metricNumber}>{summary.completed_count}</Text>
            <Text style={styles.metricTitle}>Completed</Text>
          </View>
          <View style={[styles.metricCard, styles.bgOrange]}>
            <Text style={styles.metricNumber}>{summary.payment_pending_count}</Text>
            <Text style={styles.metricTitle}>Payment Pending</Text>
          </View>
          <View style={[styles.metricCard, styles.bgDarkGreen]}>
            <Text style={styles.metricNumber}>{summary.payment_completed_count}</Text>
            <Text style={styles.metricTitle}>Payment Cleared</Text>
          </View>
        </View>
      )}

      {/* Queue Search & Table */}
      <View style={styles.queueHeaderRow}>
        <Text style={styles.sectionHeader}>Today's Procurement Queue</Text>
        <TouchableOpacity style={styles.refreshBtn} onPress={fetchData}>
          <Text style={styles.refreshBtnText}>🔄 Refresh</Text>
        </TouchableOpacity>
      </View>

      <TextInput
        style={styles.searchInput}
        placeholder="🔍 Search farmer name, mobile or booking ID..."
        value={search}
        onChangeText={setSearch}
      />

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : queue.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>No bookings found</Text>
        </View>
      ) : (
        queue.map((item) => {
          const isCurrentLoading =
            actionLoading === `adv_${item.id}` || actionLoading === `pay_${item.id}`;

          return (
            <View key={item.id} style={styles.queueCard}>
              <View style={styles.queueCardTop}>
                <View style={styles.tokenCircle}>
                  <Text style={styles.tokenText}>#{item.queue_number}</Text>
                </View>
                <View style={styles.farmerDetails}>
                  <Text style={styles.farmerName}>{item.farmer_name}</Text>
                  <Text style={styles.farmerCode}>
                    {item.booking_id} • +91 {item.farmer_mobile}
                  </Text>
                  <Text style={styles.cropInfo}>
                    🌾 {item.crop_name} ({item.quantity} kg) • 🕒 {item.slot_time}
                  </Text>
                </View>
                <StatusBadge status={item.procurement_status} />
              </View>

              {/* Officer Stage Progression Actions */}
              <View style={styles.adminActionRow}>
                {item.current_stage_index < 4 && (
                  <TouchableOpacity
                    style={[styles.stageAdvanceBtn, isCurrentLoading && styles.disabledBtn]}
                    onPress={() => handleAdvanceStage(item.id)}
                    disabled={isCurrentLoading}
                  >
                    <Text style={styles.stageAdvanceBtnText}>
                      ⏩ Next Stage: {getStageNextLabel(item.current_stage_index)}
                    </Text>
                  </TouchableOpacity>
                )}

                {item.current_stage_index >= 4 && item.payment_status !== 'COMPLETED' && (
                  <TouchableOpacity
                    style={[styles.clearPayBtn, isCurrentLoading && styles.disabledBtn]}
                    onPress={() => handleClearPayment(item.id)}
                    disabled={isCurrentLoading}
                  >
                    <Text style={styles.clearPayBtnText}>
                      💰 Clear DBT Payment (₹{item.amount.toLocaleString('en-IN')})
                    </Text>
                  </TouchableOpacity>
                )}

                {item.payment_status === 'COMPLETED' && (
                  <View style={styles.clearedBadge}>
                    <Text style={styles.clearedBadgeText}>✅ Procurement & DBT Settled</Text>
                  </View>
                )}
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
};

function getStageNextLabel(currentStage: number): string {
  switch (currentStage) {
    case 0:
      return 'Mark Arrived';
    case 1:
      return 'Start Weighing';
    case 2:
      return 'Quality Check';
    case 3:
      return 'Complete Procurement';
    default:
      return 'Advance Stage';
  }
}

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F7F5',
    paddingBottom: 40,
  },
  topHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backText: {
    color: '#1E6F3D',
    fontSize: 13,
    fontWeight: 'bold',
  },
  officerBadge: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#B71C1C',
    backgroundColor: '#FFEBEE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  centerName: {
    fontSize: 12,
    color: '#616161',
    marginBottom: 14,
  },
  callNextHeroBtn: {
    backgroundColor: '#1E6F3D',
    borderRadius: 14,
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    marginBottom: 18,
    borderWidth: 2,
    borderColor: '#81C784',
  },
  callNextIcon: {
    fontSize: 32,
    marginRight: 14,
  },
  callNextTextArea: {
    flex: 1,
  },
  callNextTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  callNextSub: {
    color: '#C8E6C9',
    fontSize: 11,
    marginTop: 2,
  },
  sectionHeader: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 10,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 18,
  },
  metricCard: {
    flexBasis: '31%',
    flexGrow: 1,
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
  },
  bgBlue: { backgroundColor: '#E3F2FD' },
  bgYellow: { backgroundColor: '#FFF9C4' },
  bgPurple: { backgroundColor: '#F3E5F5' },
  bgGreen: { backgroundColor: '#E8F5E9' },
  bgOrange: { backgroundColor: '#FFE0B2' },
  bgDarkGreen: { backgroundColor: '#C8E6C9' },
  metricNumber: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#212121',
  },
  metricTitle: {
    fontSize: 10,
    color: '#616161',
    fontWeight: '600',
    marginTop: 2,
    textAlign: 'center',
  },
  queueHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  refreshBtn: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  refreshBtnText: {
    color: '#1E6F3D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    marginBottom: 12,
  },
  loader: {
    marginVertical: 30,
  },
  emptyCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 24,
    alignItems: 'center',
  },
  emptyTitle: {
    color: '#757575',
    fontSize: 14,
  },
  queueCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  queueCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  tokenCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
  },
  tokenText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  farmerDetails: {
    flex: 1,
    marginRight: 6,
  },
  farmerName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  farmerCode: {
    fontSize: 11,
    color: '#757575',
    marginTop: 1,
  },
  cropInfo: {
    fontSize: 11,
    color: '#1E6F3D',
    fontWeight: '600',
    marginTop: 2,
  },
  adminActionRow: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 8,
  },
  stageAdvanceBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  stageAdvanceBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clearPayBtn: {
    backgroundColor: '#E65100',
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearPayBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  clearedBadge: {
    backgroundColor: '#E8F5E9',
    paddingVertical: 6,
    borderRadius: 6,
    alignItems: 'center',
  },
  clearedBadgeText: {
    color: '#2E7D32',
    fontWeight: 'bold',
    fontSize: 11,
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
