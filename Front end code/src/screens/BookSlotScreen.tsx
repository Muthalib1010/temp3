import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Mandi, Crop, Slot, DateAvailability, Booking } from '../types';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { VoiceButton } from '../components/VoiceButton';

interface BookSlotScreenProps {
  onBookingSuccess: (booking: Booking) => void;
  onCancel: () => void;
}

export const BookSlotScreen: React.FC<BookSlotScreenProps> = ({
  onBookingSuccess,
  onCancel,
}) => {
  const { user } = useAuth();
  const { t } = useLanguage();

  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>('');

  // Data collections
  const [mandis, setMandis] = useState<Mandi[]>([]);
  const [searchMandi, setSearchMandi] = useState<string>('');
  const [dates, setDates] = useState<DateAvailability[]>([]);
  const [crops, setCrops] = useState<Crop[]>([]);
  const [slots, setSlots] = useState<Slot[]>([]);

  // Selections
  const [selectedMandi, setSelectedMandi] = useState<Mandi | null>(null);
  const [selectedDate, setSelectedDate] = useState<DateAvailability | null>(null);
  const [selectedCrop, setSelectedCrop] = useState<Crop | null>(null);
  const [quantity, setQuantity] = useState<number>(500);
  const [selectedSlot, setSelectedSlot] = useState<Slot | null>(null);

  // Load Mandis on step 1
  useEffect(() => {
    const fetchMandis = async () => {
      setIsLoading(true);
      setError('');
      try {
        const list = await apiService.getMandis({ query: searchMandi });
        setMandis(list);
      } catch (e: any) {
        setError(e.message || 'Could not load procurement centers');
      } finally {
        setIsLoading(false);
      }
    };
    fetchMandis();
  }, [searchMandi]);

  // Load Dates when Mandi selected (Step 2)
  const handleSelectMandi = async (mandi: Mandi) => {
    setSelectedMandi(mandi);
    setIsLoading(true);
    setError('');
    try {
      const datesList = await apiService.getDateAvailability(mandi.id, 7);
      setDates(datesList);
      setStep(2);
    } catch (e: any) {
      setError('Could not load available dates');
    } finally {
      setIsLoading(false);
    }
  };

  // Load Crops when Date selected (Step 3)
  const handleSelectDate = async (dateItem: DateAvailability) => {
    if (!dateItem.is_available) return;
    setSelectedDate(dateItem);
    setIsLoading(true);
    setError('');
    try {
      const cropList = await apiService.getCrops();
      setCrops(cropList);
      setStep(3);
    } catch (e: any) {
      setError('Could not load crops catalog');
    } finally {
      setIsLoading(false);
    }
  };

  // Select Crop (Step 4)
  const handleSelectCrop = (crop: Crop) => {
    setSelectedCrop(crop);
    setStep(4);
  };

  // Load Slots when Quantity entered (Step 5)
  const handleProceedToSlots = async () => {
    if (quantity < 10 || quantity > 10000) {
      setError('Quantity must be between 10 kg and 10,000 kg');
      return;
    }
    if (!selectedMandi || !selectedDate) return;

    setIsLoading(true);
    setError('');
    try {
      const slotsList = await apiService.getSlots(selectedMandi.id, selectedDate.date);
      setSlots(slotsList);
      setStep(5);
    } catch (e: any) {
      setError('Could not fetch slot availability');
    } finally {
      setIsLoading(false);
    }
  };

  // Select Slot & Review Confirmation (Step 6)
  const handleSelectSlot = (slot: Slot) => {
    if (slot.status === 'FULL') return;
    setSelectedSlot(slot);
    setStep(6);
  };

  // Final Submit to Backend
  const handleConfirmBooking = async () => {
    if (!selectedMandi || !selectedDate || !selectedCrop || !selectedSlot) {
      setError('Missing booking details');
      return;
    }

    setIsLoading(true);
    setError('');
    try {
      const newBooking = await apiService.createBooking({
        mandi_id: selectedMandi.id,
        crop_id: selectedCrop.id,
        slot_id: selectedSlot.id,
        quantity: Number(quantity),
      });
      onBookingSuccess(newBooking);
    } catch (e: any) {
      setError(e.message || 'Booking conflict or server error. Please choose another slot.');
    } finally {
      setIsLoading(false);
    }
  };

  const estimatedTotal = selectedCrop ? Math.round(quantity * selectedCrop.rate_per_kg) : 0;

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      {/* Wizard Header */}
      <View style={styles.wizardHeader}>
        <TouchableOpacity
          onPress={() => (step > 1 ? setStep(step - 1) : onCancel())}
          style={styles.backBtn}
        >
          <Text style={styles.backBtnText}>← {step > 1 ? 'Back' : 'Cancel'}</Text>
        </TouchableOpacity>
        <Text style={styles.stepIndicator}>Step {step} of 6</Text>
      </View>

      {/* Error Notice */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠️ {error}</Text>
        </View>
      ) : null}

      {/* STEP 1: Select Mandi */}
      {step === 1 && (
        <View>
          <Text style={styles.stepTitle}>🏛️ {t.step1SelectMandi}</Text>
          <VoiceButton
            textToSpeak="Step 1: Select your procurement center from the list below."
            label={t.voiceGuide}
          />
          <TextInput
            style={styles.searchInput}
            placeholder={t.searchMandi}
            value={searchMandi}
            onChangeText={setSearchMandi}
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
          ) : (
            mandis.map((m) => (
              <View key={m.id} style={styles.mandiCard}>
                <View style={styles.mandiInfo}>
                  <Text style={styles.mandiName}>{m.name}</Text>
                  <Text style={styles.mandiDistrict}>📍 {m.district}, {m.state}</Text>
                  <Text style={styles.mandiHours}>🕒 {m.operating_hours}</Text>
                  <View style={styles.mandiBadges}>
                    <Text style={styles.availBadge}>
                      ✓ {m.available_slots_today || 18} {t.availableSlots} Today
                    </Text>
                    {m.distance_km && (
                      <Text style={styles.distBadge}>{m.distance_km} km away</Text>
                    )}
                  </View>
                </View>
                <TouchableOpacity
                  style={styles.selectBtn}
                  onPress={() => handleSelectMandi(m)}
                >
                  <Text style={styles.selectBtnText}>{t.select} →</Text>
                </TouchableOpacity>
              </View>
            ))
          )}
        </View>
      )}

      {/* STEP 2: Select Date */}
      {step === 2 && selectedMandi && (
        <View>
          <Text style={styles.stepTitle}>📅 {t.step2SelectDate}</Text>
          <Text style={styles.selectedSubtitle}>Center: {selectedMandi.name}</Text>
          <VoiceButton
            textToSpeak="Step 2: Select an available date for your crop delivery."
            label={t.voiceGuide}
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
          ) : (
            dates.map((d) => (
              <TouchableOpacity
                key={d.date}
                style={[
                  styles.dateCard,
                  !d.is_available && styles.disabledCard,
                ]}
                disabled={!d.is_available}
                onPress={() => handleSelectDate(d)}
              >
                <View>
                  <Text style={styles.dateDayName}>{d.day_name}</Text>
                  <Text style={styles.dateCount}>
                    {d.available_slots} slots available
                  </Text>
                </View>
                <View
                  style={[
                    styles.dateBadge,
                    d.is_available ? styles.badgeOpen : styles.badgeFull,
                  ]}
                >
                  <Text
                    style={[
                      styles.dateBadgeText,
                      d.is_available ? styles.textGreen : styles.textRed,
                    ]}
                  >
                    {d.status_label}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </View>
      )}

      {/* STEP 3: Select Crop */}
      {step === 3 && (
        <View>
          <Text style={styles.stepTitle}>🌾 {t.step3SelectCrop}</Text>
          <VoiceButton
            textToSpeak="Step 3: Choose the crop you wish to sell at official Minimum Support Price rates."
            label={t.voiceGuide}
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
          ) : (
            <View style={styles.cropGrid}>
              {crops.map((c) => (
                <TouchableOpacity
                  key={c.id}
                  style={styles.cropCard}
                  onPress={() => handleSelectCrop(c)}
                >
                  <Text style={styles.cropEmoji}>🌾</Text>
                  <Text style={styles.cropName}>{c.name}</Text>
                  {c.local_name && <Text style={styles.cropLocal}>{c.local_name}</Text>}
                  <Text style={styles.cropCategory}>{c.category}</Text>
                  <View style={styles.mspBadge}>
                    <Text style={styles.mspText}>MSP: ₹{c.rate_per_kg}/kg</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          )}
        </View>
      )}

      {/* STEP 4: Enter Quantity */}
      {step === 4 && selectedCrop && (
        <View>
          <Text style={styles.stepTitle}>⚖️ {t.step4EnterQuantity}</Text>
          <Text style={styles.selectedSubtitle}>
            Crop: {selectedCrop.name} (Official MSP: ₹{selectedCrop.rate_per_kg}/kg)
          </Text>
          <VoiceButton
            textToSpeak="Step 4: Enter your crop quantity in kilograms."
            label={t.voiceGuide}
          />

          <View style={styles.stepperContainer}>
            <View style={styles.stepperRow}>
              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity(Math.max(50, quantity - 50))}
              >
                <Text style={styles.stepperBtnText}>−</Text>
              </TouchableOpacity>

              <View style={styles.qtyDisplay}>
                <TextInput
                  style={styles.qtyInput}
                  keyboardType="numeric"
                  value={quantity.toString()}
                  onChangeText={(val) => setQuantity(Number(val.replace(/\D/g, '') || 0))}
                />
                <Text style={styles.unitText}>kg</Text>
              </View>

              <TouchableOpacity
                style={styles.stepperBtn}
                onPress={() => setQuantity(quantity + 50)}
              >
                <Text style={styles.stepperBtnText}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Quick Presets */}
            <View style={styles.presetRow}>
              {[200, 500, 850, 1000, 2000].map((preset) => (
                <TouchableOpacity
                  key={preset}
                  style={[styles.presetChip, quantity === preset && styles.activePreset]}
                  onPress={() => setQuantity(preset)}
                >
                  <Text style={[styles.presetText, quantity === preset && styles.activePresetText]}>
                    {preset} kg
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            {/* Calculated Estimated MSP Payout */}
            <View style={styles.estimatedPayoutCard}>
              <Text style={styles.payoutLabel}>Estimated Procurement Payout:</Text>
              <Text style={styles.payoutValue}>₹{estimatedTotal.toLocaleString('en-IN')}</Text>
              <Text style={styles.payoutSub}>
                Directly credited via DBT PFMS to your bank account upon verification
              </Text>
            </View>
          </View>

          <TouchableOpacity style={styles.continueBtn} onPress={handleProceedToSlots}>
            <Text style={styles.continueBtnText}>Continue to Slot Selection →</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* STEP 5: Select Time Slot */}
      {step === 5 && selectedMandi && selectedDate && (
        <View>
          <Text style={styles.stepTitle}>⏰ {t.step5SelectSlot}</Text>
          <Text style={styles.selectedSubtitle}>
            Date: {selectedDate.day_name} • Center: {selectedMandi.name}
          </Text>
          <VoiceButton
            textToSpeak="Step 5: Pick a convenient 1-hour time window."
            label={t.voiceGuide}
          />

          {isLoading ? (
            <ActivityIndicator size="large" color="#1E6F3D" style={styles.loader} />
          ) : (
            <View style={styles.slotList}>
              {slots.map((s) => {
                const isFull = s.status === 'FULL';
                return (
                  <TouchableOpacity
                    key={s.id}
                    style={[
                      styles.slotCard,
                      isFull && styles.slotFullCard,
                    ]}
                    disabled={isFull}
                    onPress={() => handleSelectSlot(s)}
                  >
                    <View>
                      <Text style={[styles.slotTime, isFull && styles.textMuted]}>
                        🕒 {s.start_time} – {s.end_time}
                      </Text>
                      <Text style={styles.slotCapacity}>
                        Capacity: {s.capacity} farmers
                      </Text>
                    </View>
                    <View
                      style={[
                        styles.slotBadge,
                        isFull ? styles.badgeFull : styles.badgeOpen,
                      ]}
                    >
                      <Text
                        style={[
                          styles.slotBadgeText,
                          isFull ? styles.textRed : styles.textGreen,
                        ]}
                      >
                        {isFull ? 'FULL' : `${s.available_count} slots left`}
                      </Text>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          )}
        </View>
      )}

      {/* STEP 6: Confirmation Screen */}
      {step === 6 && selectedMandi && selectedDate && selectedCrop && selectedSlot && (
        <View>
          <Text style={styles.stepTitle}>📋 {t.confirmTitle}</Text>
          <VoiceButton
            textToSpeak="Please review your slot details and confirm your reservation."
            label={t.voiceGuide}
          />

          <View style={styles.confirmCard}>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Farmer Name</Text>
              <Text style={styles.confirmVal}>{user?.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Procurement Center</Text>
              <Text style={styles.confirmVal}>{selectedMandi.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Date</Text>
              <Text style={styles.confirmVal}>{selectedDate.day_name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Time Window</Text>
              <Text style={styles.confirmVal}>
                {selectedSlot.start_time} – {selectedSlot.end_time}
              </Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Crop</Text>
              <Text style={styles.confirmVal}>{selectedCrop.name}</Text>
            </View>
            <View style={styles.confirmRow}>
              <Text style={styles.confirmLabel}>Quantity</Text>
              <Text style={styles.confirmValBold}>{quantity} kg</Text>
            </View>
            <View style={styles.confirmRowTotal}>
              <Text style={styles.confirmLabelTotal}>Estimated Value</Text>
              <Text style={styles.confirmValTotal}>₹{estimatedTotal.toLocaleString('en-IN')}</Text>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.confirmBtn, isLoading && styles.disabledBtn]}
            onPress={handleConfirmBooking}
            disabled={isLoading}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <Text style={styles.confirmBtnText}>✓ {t.confirmBooking}</Text>
            )}
          </TouchableOpacity>
        </View>
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
  wizardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  backBtn: {
    paddingVertical: 6,
  },
  backBtnText: {
    fontSize: 14,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  stepIndicator: {
    fontSize: 12,
    color: '#757575',
    fontWeight: '600',
  },
  stepTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginBottom: 4,
  },
  selectedSubtitle: {
    fontSize: 12,
    color: '#616161',
    marginBottom: 8,
  },
  errorBox: {
    backgroundColor: '#FFEBEE',
    padding: 10,
    borderRadius: 8,
    marginBottom: 12,
  },
  errorText: {
    color: '#C62828',
    fontSize: 12,
  },
  searchInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 14,
    marginVertical: 10,
  },
  loader: {
    marginVertical: 30,
  },
  mandiCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  mandiInfo: {
    flex: 1,
    marginRight: 10,
  },
  mandiName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  mandiDistrict: {
    fontSize: 12,
    color: '#616161',
    marginTop: 2,
  },
  mandiHours: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  mandiBadges: {
    flexDirection: 'row',
    gap: 6,
    marginTop: 6,
  },
  availBadge: {
    fontSize: 10,
    fontWeight: 'bold',
    color: '#1E6F3D',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  distBadge: {
    fontSize: 10,
    color: '#0288D1',
    backgroundColor: '#E1F5FE',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  selectBtn: {
    backgroundColor: '#1E6F3D',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 8,
  },
  selectBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 12,
  },
  dateCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  disabledCard: {
    backgroundColor: '#F5F5F5',
    opacity: 0.6,
  },
  dateDayName: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  dateCount: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  dateBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeOpen: {
    backgroundColor: '#E8F5E9',
  },
  badgeFull: {
    backgroundColor: '#FFEBEE',
  },
  dateBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  textGreen: {
    color: '#1E6F3D',
  },
  textRed: {
    color: '#C62828',
  },
  cropGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 10,
  },
  cropCard: {
    flexBasis: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  cropEmoji: {
    fontSize: 32,
    marginBottom: 4,
  },
  cropName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
    textAlign: 'center',
  },
  cropLocal: {
    fontSize: 11,
    color: '#757575',
    textAlign: 'center',
  },
  cropCategory: {
    fontSize: 10,
    color: '#9E9E9E',
    marginTop: 2,
  },
  mspBadge: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginTop: 8,
  },
  mspText: {
    color: '#1E6F3D',
    fontSize: 11,
    fontWeight: 'bold',
  },
  stepperContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    alignItems: 'center',
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 14,
  },
  stepperBtn: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#1E6F3D',
  },
  stepperBtnText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  qtyDisplay: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginHorizontal: 16,
  },
  qtyInput: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#1E6F3D',
    textAlign: 'center',
    minWidth: 100,
  },
  unitText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#616161',
    marginLeft: 4,
  },
  presetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 16,
  },
  presetChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activePreset: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1E6F3D',
  },
  presetText: {
    fontSize: 12,
    color: '#616161',
  },
  activePresetText: {
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  estimatedPayoutCard: {
    backgroundColor: '#F1F8E9',
    padding: 14,
    borderRadius: 10,
    width: '100%',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#C8E6C9',
  },
  payoutLabel: {
    fontSize: 12,
    color: '#2E7D32',
    fontWeight: '600',
  },
  payoutValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1E6F3D',
    marginVertical: 2,
  },
  payoutSub: {
    fontSize: 10,
    color: '#558B2F',
    textAlign: 'center',
    marginTop: 2,
  },
  continueBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  continueBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  slotList: {
    marginTop: 10,
  },
  slotCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  slotFullCard: {
    backgroundColor: '#FAFAFA',
    opacity: 0.6,
  },
  slotTime: {
    fontSize: 15,
    fontWeight: 'bold',
    color: '#212121',
  },
  textMuted: {
    color: '#9E9E9E',
  },
  slotCapacity: {
    fontSize: 11,
    color: '#757575',
    marginTop: 2,
  },
  slotBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  slotBadgeText: {
    fontSize: 11,
    fontWeight: 'bold',
  },
  confirmCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  confirmRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  confirmLabel: {
    fontSize: 13,
    color: '#757575',
  },
  confirmVal: {
    fontSize: 13,
    fontWeight: '600',
    color: '#212121',
  },
  confirmValBold: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  confirmRowTotal: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 12,
    marginTop: 4,
  },
  confirmLabelTotal: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  confirmValTotal: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2E7D32',
  },
  confirmBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 16,
  },
  confirmBtnText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  disabledBtn: {
    opacity: 0.6,
  },
});
