import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface VoiceButtonProps {
  textToSpeak: string;
  label?: string;
}

export const VoiceButton: React.FC<VoiceButtonProps> = ({ textToSpeak, label }) => {
  const { speakText } = useLanguage();

  return (
    <TouchableOpacity
      style={styles.voiceButton}
      onPress={() => speakText(textToSpeak)}
      activeOpacity={0.7}
    >
      <Text style={styles.icon}>🔊</Text>
      {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  voiceButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E9',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#C8E6C9',
    alignSelf: 'flex-start',
    marginVertical: 4,
  },
  icon: {
    fontSize: 16,
    marginRight: 4,
  },
  label: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E6F3D',
  },
});
