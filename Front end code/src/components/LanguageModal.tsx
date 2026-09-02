import React from 'react';
import { View, Text, Modal, TouchableOpacity, StyleSheet, FlatList } from 'react-native';
import { languageList } from '../i18n';
import { useLanguage } from '../context/LanguageContext';
import { LanguageCode } from '../types';

interface LanguageModalProps {
  visible: boolean;
  onClose: () => void;
}

export const LanguageModal: React.FC<LanguageModalProps> = ({ visible, onClose }) => {
  const { language, setLanguage, t } = useLanguage();

  const handleSelect = async (code: LanguageCode) => {
    await setLanguage(code);
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>🌐 {t.selectLanguage}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Text style={styles.closeBtnText}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={languageList}
            keyExtractor={item => item.code}
            renderItem={({ item }) => {
              const isSelected = language === item.code;
              return (
                <TouchableOpacity
                  style={[styles.langItem, isSelected && styles.selectedLangItem]}
                  onPress={() => handleSelect(item.code)}
                >
                  <View>
                    <Text style={[styles.nativeText, isSelected && styles.selectedText]}>
                      {item.native}
                    </Text>
                    <Text style={styles.labelText}>{item.label}</Text>
                  </View>
                  {isSelected && <Text style={styles.checkIcon}>✓</Text>}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    maxHeight: '80%',
    padding: 20,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#EEEEEE',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1E6F3D',
  },
  closeBtn: {
    padding: 4,
  },
  closeBtnText: {
    fontSize: 18,
    color: '#757575',
    fontWeight: 'bold',
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
    marginBottom: 8,
    backgroundColor: '#F9F9F9',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  selectedLangItem: {
    backgroundColor: '#E8F5E9',
    borderColor: '#1E6F3D',
  },
  nativeText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#212121',
  },
  labelText: {
    fontSize: 12,
    color: '#757575',
    marginTop: 2,
  },
  selectedText: {
    color: '#1E6F3D',
  },
  checkIcon: {
    fontSize: 18,
    color: '#1E6F3D',
    fontWeight: 'bold',
  },
});
