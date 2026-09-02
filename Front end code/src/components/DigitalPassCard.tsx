import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { DigitalPass } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface DigitalPassCardProps {
  pass: DigitalPass;
}

export const DigitalPassCard: React.FC<DigitalPassCardProps> = ({ pass }) => {
  const { t } = useLanguage();

  return (
    <View style={styles.passContainer}>
      {/* Government Emblem Top Banner */}
      <View style={styles.passHeader}>
        <Text style={styles.emblemIcon}>🌾</Text>
        <Text style={styles.passHeaderText}>{t.farmerProcurementPass}</Text>
        <Text style={styles.govSub}>MINISTRY OF AGRICULTURE & FARMERS WELFARE</Text>
      </View>

      <View style={styles.body}>
        {/* Large Queue Token Banner */}
        <View style={styles.tokenBanner}>
          <Text style={styles.tokenTitle}>{t.queueNumber}</Text>
          <Text style={styles.tokenNumber}>#{pass.queue_number}</Text>
          <Text style={styles.tokenSub}>Authorized Mandi Gate Entry</Text>
        </View>

        {/* QR Code Container Simulation */}
        <View style={styles.qrContainer}>
          {/* High contrast QR representation */}
          <View style={styles.qrBox}>
            <Text style={styles.qrGraphic}>⬛⬜⬛⬛⬜⬛⬜⬛⬛{"\n"}⬛⬜⬛⬜⬜⬜⬜⬛⬛{"\n"}⬛⬛⬛⬜⬛⬜⬛⬛⬛{"\n"}⬜⬜⬜⬛⬛⬛⬜⬜⬜{"\n"}⬛⬛⬛⬜⬛⬜⬛⬛⬛{"\n"}⬛⬜⬛⬜⬜⬜⬜⬛⬛{"\n"}⬛⬜⬛⬛⬜⬛⬜⬛⬛</Text>
          </View>
          <Text style={styles.bookingCodeText}>{pass.booking_id}</Text>
          <Text style={styles.qrHint}>{t.showAtProcurementCenter}</Text>
        </View>

        {/* Detailed Grid */}
        <View style={styles.infoTable}>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Farmer Name</Text>
            <Text style={styles.tableVal}>{pass.farmer_name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Farmer Mobile</Text>
            <Text style={styles.tableVal}>+91 {pass.farmer_mobile}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Mandi / Center</Text>
            <Text style={styles.tableVal}>{pass.mandi_name}</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Date & Time</Text>
            <Text style={styles.tableVal}>{pass.date} ({pass.time_slot})</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Crop & Quantity</Text>
            <Text style={styles.tableValBold}>{pass.crop_name} • {pass.quantity} kg</Text>
          </View>
          <View style={styles.tableRow}>
            <Text style={styles.tableLabel}>Estimated MSP Value</Text>
            <Text style={styles.tableValGreen}>₹{pass.total_estimated_value?.toLocaleString('en-IN')}</Text>
          </View>
        </View>

        {/* Offline Badge & Security Hash */}
        <View style={styles.footerNote}>
          <Text style={styles.offlineStatus}>🟢 {t.saveOffline}</Text>
          <Text style={styles.issuedAt}>Issued: {pass.issued_at}</Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  passContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOpacity: 0.12,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 8,
    borderWidth: 2,
    borderColor: '#1E6F3D',
    marginVertical: 12,
  },
  passHeader: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    paddingHorizontal: 16,
    alignItems: 'center',
  },
  emblemIcon: {
    fontSize: 24,
    marginBottom: 4,
  },
  passHeaderText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
    letterSpacing: 1,
  },
  govSub: {
    color: '#C8E6C9',
    fontSize: 9,
    fontWeight: '600',
    marginTop: 2,
  },
  body: {
    padding: 16,
  },
  tokenBanner: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#A5D6A7',
  },
  tokenTitle: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: 'bold',
  },
  tokenNumber: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginVertical: 2,
  },
  tokenSub: {
    fontSize: 11,
    color: '#388E3C',
  },
  qrContainer: {
    alignItems: 'center',
    paddingVertical: 12,
    backgroundColor: '#FAFAFA',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#EEEEEE',
    marginBottom: 16,
  },
  qrBox: {
    backgroundColor: '#FFFFFF',
    padding: 10,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#000000',
    marginBottom: 8,
  },
  qrGraphic: {
    fontFamily: 'monospace',
    fontSize: 10,
    lineHeight: 12,
    letterSpacing: 2,
    textAlign: 'center',
  },
  bookingCodeText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E6F3D',
    letterSpacing: 1,
  },
  qrHint: {
    fontSize: 11,
    color: '#757575',
    marginTop: 4,
  },
  infoTable: {
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
    paddingTop: 10,
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  tableLabel: {
    fontSize: 12,
    color: '#757575',
  },
  tableVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  tableValBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  tableValGreen: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  footerNote: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 14,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#EEEEEE',
  },
  offlineStatus: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  issuedAt: {
    fontSize: 10,
    color: '#9E9E9E',
  },
});
