import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { apiService } from '../services/api';
import { VoiceButton } from '../components/VoiceButton';

interface ProfileScreenProps {
  onOpenLanguage: () => void;
  onNavigateToNotifications: () => void;
  onNavigateToAdmin: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  onOpenLanguage,
  onNavigateToNotifications,
  onNavigateToAdmin,
}) => {
  const { user, logout, refreshProfile } = useAuth();
  const { t, language } = useLanguage();

  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [village, setVillage] = useState(user?.village || '');
  const [district, setDistrict] = useState(user?.district || '');
  const [pincode, setPincode] = useState(user?.pincode || '');
  const [isSaving, setIsSaving] = useState(false);

  const handleSaveProfile = async () => {
    setIsSaving(true);
    try {
      await apiService.updateMe({
        name,
        village,
        district,
        pincode,
      });
      await refreshProfile();
      setIsEditing(false);
      Alert.alert('Profile Updated', 'Your farmer details were updated successfully.');
    } catch (e: any) {
      Alert.alert('Update Failed', e.message || 'Could not update profile');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.title}>👤 {t.profile}</Text>
        <VoiceButton
          textToSpeak="Farmer profile settings. You can edit your registered address, switch app languages, and check notification preferences."
          label={t.voiceGuide}
        />
      </View>

      {/* Farmer Profile Card */}
      <View style={styles.profileCard}>
        <View style={styles.avatarCircle}>
          <Text style={styles.avatarEmoji}>👨‍🌾</Text>
        </View>
        <Text style={styles.farmerName}>{user?.name}</Text>
        <Text style={styles.farmerMobile}>+91 {user?.mobile}</Text>
        <View style={styles.roleTag}>
          <Text style={styles.roleText}>
            {user?.role === 'admin' ? '🛡️ Procurement Officer' : '🌾 Registered Kisan Member'}
          </Text>
        </View>
      </View>

      {/* Editable Information Box */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Farmer Details</Text>
          <TouchableOpacity onPress={() => setIsEditing(!isEditing)}>
            <Text style={styles.editBtnText}>{isEditing ? 'Cancel' : '✏️ Edit'}</Text>
          </TouchableOpacity>
        </View>

        {isEditing ? (
          <View style={styles.editForm}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.fullName}</Text>
              <TextInput style={styles.input} value={name} onChangeText={setName} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.village}</Text>
              <TextInput style={styles.input} value={village} onChangeText={setVillage} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.district}</Text>
              <TextInput style={styles.input} value={district} onChangeText={setDistrict} />
            </View>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>{t.pincode}</Text>
              <TextInput style={styles.input} value={pincode} onChangeText={setPincode} />
            </View>

            <TouchableOpacity
              style={[styles.saveBtn, isSaving && styles.disabledBtn]}
              onPress={handleSaveProfile}
              disabled={isSaving}
            >
              {isSaving ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.saveBtnText}>Save Changes</Text>
              )}
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.infoList}>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.village}</Text>
              <Text style={styles.infoVal}>{user?.village || 'Not specified'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.district} & {t.state}</Text>
              <Text style={styles.infoVal}>{user?.district || 'Ernakulam'}, {user?.state || 'Kerala'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.pincode}</Text>
              <Text style={styles.infoVal}>{user?.pincode || '683101'}</Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>{t.farmerId}</Text>
              <Text style={styles.infoValBold}>{user?.farmer_id || 'KL-2026-00891'}</Text>
            </View>
          </View>
        )}
      </View>

      {/* App Preferences & Settings */}
      <View style={styles.sectionCard}>
        <Text style={styles.sectionTitle}>Settings & Preferences</Text>

        <TouchableOpacity style={styles.settingItem} onPress={onOpenLanguage}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🌐</Text>
            <Text style={styles.settingLabel}>{t.selectLanguage}</Text>
          </View>
          <Text style={styles.settingValue}>{language.toUpperCase()} →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={onNavigateToNotifications}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🔔</Text>
            <Text style={styles.settingLabel}>{t.notifications}</Text>
          </View>
          <Text style={styles.settingValue}>View →</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.settingItem} onPress={onNavigateToAdmin}>
          <View style={styles.settingLeft}>
            <Text style={styles.settingIcon}>🛡️</Text>
            <Text style={styles.settingLabel}>Officer / Admin Dashboard</Text>
          </View>
          <Text style={styles.settingValueGreen}>Open →</Text>
        </TouchableOpacity>
      </View>

      {/* Logout Button */}
      <TouchableOpacity style={styles.logoutBtn} onPress={logout}>
        <Text style={styles.logoutBtnText}>🚪 {t.logout}</Text>
      </TouchableOpacity>

      <Text style={styles.versionNote}>
        Farmer Slot Booking System v2.0 • SIH 2026 Problem ID 260321
      </Text>
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
    marginBottom: 12,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    elevation: 2,
    marginBottom: 14,
  },
  avatarCircle: {
    width: 70,
    height: 70,
    borderRadius: 35,
    backgroundColor: '#E8F5E9',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    borderWidth: 2,
    borderColor: '#1E6F3D',
  },
  avatarEmoji: {
    fontSize: 36,
  },
  farmerName: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#212121',
  },
  farmerMobile: {
    fontSize: 13,
    color: '#616161',
    marginTop: 2,
  },
  roleTag: {
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  roleText: {
    color: '#1E6F3D',
    fontSize: 11,
    fontWeight: 'bold',
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
    paddingBottom: 8,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#212121',
  },
  editBtnText: {
    color: '#1E6F3D',
    fontSize: 12,
    fontWeight: 'bold',
  },
  infoList: {
    gap: 10,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#F9F9F9',
  },
  infoLabel: {
    fontSize: 12,
    color: '#757575',
  },
  infoVal: {
    fontSize: 12,
    fontWeight: '600',
    color: '#212121',
  },
  infoValBold: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  editForm: {
    gap: 10,
  },
  inputGroup: {
    marginBottom: 6,
  },
  inputLabel: {
    fontSize: 11,
    color: '#616161',
    fontWeight: '600',
    marginBottom: 2,
  },
  input: {
    borderWidth: 1,
    borderColor: '#BDBDBD',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 6,
    fontSize: 13,
  },
  saveBtn: {
    backgroundColor: '#1E6F3D',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  saveBtnText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    fontSize: 13,
  },
  disabledBtn: {
    opacity: 0.6,
  },
  settingItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F5F5F5',
  },
  settingLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  settingIcon: {
    fontSize: 16,
    marginRight: 10,
  },
  settingLabel: {
    fontSize: 13,
    color: '#212121',
    fontWeight: '500',
  },
  settingValue: {
    fontSize: 12,
    color: '#757575',
    fontWeight: 'bold',
  },
  settingValueGreen: {
    fontSize: 12,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
  logoutBtn: {
    backgroundColor: '#FFEBEE',
    borderWidth: 1,
    borderColor: '#EF9A9A',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 6,
    marginBottom: 16,
  },
  logoutBtnText: {
    color: '#C62828',
    fontWeight: 'bold',
    fontSize: 14,
  },
  versionNote: {
    textAlign: 'center',
    fontSize: 10,
    color: '#9E9E9E',
  },
});
