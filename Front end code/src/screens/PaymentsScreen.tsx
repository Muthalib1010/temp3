import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Alert,
} from 'react-native';
import { Payment } from '../types';
import { apiService } from '../services/api';
import { StatusBadge } from '../components/StatusBadge';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

export const PaymentsScreen: React.FC = () => {
  const { t } = useLanguage();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [clearingId, setClearingId] = useState<number | null>(null);

  const fetchPayments = async () => {
    try {
      const list = await apiService.getPayments();
      setPayments(list);
    } catch (e) {
      console.warn('Could not fetch payments:', e);
    } finally {
      setIsLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchPayments();
  };

  const handleSimulateClear = async (paymentId: number) => {
    setClearingId(paymentId);
    try {
      await apiService.clearPayment(paymentId);
      Alert.alert(
        '💰 DBT Payment Cleared',
        'Direct Benefit Transfer successfully processed via PFMS into the farmer\'s registered bank account.'
      );
      await fetchPayments();
    } catch (e: any) {
      Alert.alert('Payment Error', e.message || 'Could not clear payment');
    } finally {
      setClearingId(null);
    }
  };

  const totalEarnings = payments
    .filter((p) => p.status === 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  const pendingEarnings = payments
    .filter((p) => p.status !== 'COMPLETED')
    .reduce((acc, curr) => acc + (curr.amount || 0), 0);

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
    >
      <View style={styles.headerRow}>
        <Text style={styles.title}>💳 {t.payments}</Text>
        <VoiceButton
          textToSpeak="Direct Benefit Transfer payment dashboard. Track your bank settlements and download official PFMS procurement receipts."
          label={t.voiceGuide}
        />
      </View>

      {/* Hero Financial Overview */}
      <View style={styles.financialHero}>
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>Total Received (DBT)</Text>
          <Text style={styles.finValueGreen}>₹{totalEarnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.finSub}>Direct Bank Credit</Text>
        </View>
        <View style={styles.finDivider} />
        <View style={styles.finCol}>
          <Text style={styles.finLabel}>In Processing</Text>
          <Text style={styles.finValueOrange}>₹{pendingEarnings.toLocaleString('en-IN')}</Text>
          <Text style={styles.finSub}>PFMS Verification</Text>
        </View>
      </View>

      {/* Payment Records List */}
      <Text style={styles.sectionHeading}>Transaction History</Text>

      {isLoading ? (
        <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
      ) : payments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyIcon}>💳</Text>
          <Text style={styles.emptyTitle}>No payment records yet</Text>
          <Text style={styles.emptyDesc}>
            Payments appear automatically as your crop procurement stages complete.
          </Text>
        </View>
      ) : (
        payments.map((p) => {
          const isCompleted = p.status === 'COMPLETED';
          return (
            <View key={p.id} style={styles.paymentCard}>
              <View style={styles.cardHeader}>
                <View>
                  <Text style={styles.bookingRef}>Ref: {p.booking_code || `FSB-BK-${p.booking_id}`}</Text>
                  <Text style={styles.cropDetail}>
                    {p.crop_name} • {p.quantity} kg
                  </Text>
                </View>
                <View style={styles.amountCol}>
                  <Text style={styles.amountText}>₹{p.amount?.toLocaleString('en-IN')}</Text>
                  <StatusBadge status={p.status} />
                </View>
              </View>

              <View style={styles.bankBox}>
                <Text style={styles.bankName}>🏦 {p.bank_name}</Text>
                <Text style={styles.bankAccount}>A/C: •••• {p.account_last4} ({p.ifsc_prefix})</Text>
                {p.transaction_id && (
                  <Text style={styles.txnId}>TXN: {p.transaction_id}</Text>
                )}
                {p.payment_date && (
                  <Text style={styles.payDate}>
                    Settled: {new Date(p.payment_date).toLocaleDateString('en-IN')}
                  </Text>
                )}
              </View>

              <View style={styles.btnRow}>
                {isCompleted ? (
                  <TouchableOpacity
                    style={styles.receiptBtn}
                    onPress={() =>
                      Alert.alert(
                        'PFMS Receipt Download',
                        `Official Payment Receipt for ${p.booking_code} (₹${p.amount}) downloaded successfully.`
                      )
                    }
                  >
                    <Text style={styles.receiptBtnText}>📥 {t.downloadReceipt}</Text>
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity
                    style={styles.simClearBtn}
                    onPress={() => handleSimulateClear(p.id)}
                    disabled={clearingId === p.id}
                  >
                    {clearingId === p.id ? (
                      <ActivityIndicator color="#FFFFFF" size="small" />
                    ) : (
                      <Text style={styles.simClearBtnText}>⚡ Simulate Instant DBT Clearance</Text>
                    )}
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })
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
  financialHero: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    elevation: 3,
    borderWidth: 1,
    borderColor: '#E8F5E9',
    marginBottom: 16,
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  finCol: {
    alignItems: 'center',
    flex: 1,
  },
  finLabel: {
    fontSize: 11,
    color: '#757575',
    fontWeight: '600',
  },
  finValueGreen: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginVertical: 2,
  },
  finValueOrange: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#E65100',
    marginVertical: 2,
  },
  finSub: {
    fontSize: 10,
    color: '#9E9E9E',
  },
  finDivider: {
    width: 1,
    height: 44,
    backgroundColor: '#EEEEEE',
  },
  sectionHeading: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#424242',
    marginBottom: 10,
  },
  loader: {
    marginVertical: 30,
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
    textAlign: 'center',
    marginTop: 4,
  },
  paymentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  bookingRef: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  cropDetail: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
  },
  amountCol: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
    marginBottom: 4,
  },
  bankBox: {
    backgroundColor: '#F9FAF8',
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#EEEEEE',
  },
  bankName: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#212121',
  },
  bankAccount: {
    fontSize: 11,
    color: '#616161',
    marginTop: 2,
  },
  txnId: {
    fontSize: 10,
    color: '#1E6F3D',
    fontFamily: 'monospace',
    marginTop: 2,
  },
  payDate: {
    fontSize: 10,
    color: '#757575',
    marginTop: 2,
  },
  btnRow: {
    marginTop: 4,
  },
  receiptBtn: {
    backgroundColor: '#E8F5E9',
    borderWidth: 1,
    borderColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  receiptBtnText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
    fontSize: 12,
  },
  simClearBtn: {
    backgroundColor: '#E65100',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
  },
  simClearBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
});
