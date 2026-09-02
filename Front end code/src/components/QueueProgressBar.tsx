import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useLanguage } from '../context/LanguageContext';

interface QueueProgressBarProps {
  currentStageIndex: number;
}

export const QueueProgressBar: React.FC<QueueProgressBarProps> = ({ currentStageIndex }) => {
  const { t } = useLanguage();

  const stages = [
    { label: t.stageConfirmed, icon: '📋' },
    { label: t.stageArrived, icon: '📍' },
    { label: t.stageWeighing, icon: '⚖️' },
    { label: t.stageQuality, icon: '🔬' },
    { label: t.stageCompleted, icon: '🌾' },
    { label: t.stagePaymentProcessing, icon: '⏳' },
    { label: t.stagePaymentCompleted, icon: '✅' },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Procurement Lifecycle Progress</Text>
      <View style={styles.stepperContainer}>
        {stages.map((stage, idx) => {
          const isPassed = idx < currentStageIndex;
          const isCurrent = idx === currentStageIndex;
          const isLast = idx === stages.length - 1;

          return (
            <View key={idx} style={styles.stepItem}>
              <View style={styles.nodeRow}>
                <View
                  style={[
                    styles.circle,
                    isPassed && styles.circlePassed,
                    isCurrent && styles.circleCurrent,
                  ]}
                >
                  <Text style={styles.circleIcon}>
                    {isPassed ? '✓' : stage.icon}
                  </Text>
                </View>
                {!isLast && (
                  <View
                    style={[
                      styles.line,
                      isPassed && styles.linePassed,
                      isCurrent && styles.lineCurrent,
                    ]}
                  />
                )}
              </View>
              <Text
                style={[
                  styles.label,
                  isCurrent && styles.labelCurrent,
                  isPassed && styles.labelPassed,
                ]}
                numberOfLines={2}
              >
                {stage.label}
              </Text>
            </View>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#FFFFFF',
    padding: 16,
    borderRadius: 12,
    marginVertical: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 16,
  },
  stepperContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  stepItem: {
    flex: 1,
    alignItems: 'center',
  },
  nodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    justifyContent: 'center',
    position: 'relative',
  },
  circle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#EEEEEE',
    borderWidth: 2,
    borderColor: '#BDBDBD',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2,
  },
  circlePassed: {
    backgroundColor: '#1E6F3D',
    borderColor: '#1E6F3D',
  },
  circleCurrent: {
    backgroundColor: '#FFF8E1',
    borderColor: '#F57F17',
    borderWidth: 2.5,
    transform: [{ scale: 1.15 }],
  },
  circleIcon: {
    fontSize: 12,
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  line: {
    position: 'absolute',
    left: '50%',
    right: '-50%',
    top: 13,
    height: 2,
    backgroundColor: '#E0E0E0',
    zIndex: 1,
  },
  linePassed: {
    backgroundColor: '#1E6F3D',
  },
  lineCurrent: {
    backgroundColor: '#FFB300',
  },
  label: {
    fontSize: 9,
    color: '#757575',
    textAlign: 'center',
    marginTop: 6,
    minHeight: 24,
  },
  labelCurrent: {
    color: '#F57F17',
    fontWeight: 'bold',
  },
  labelPassed: {
    color: '#1E6F3D',
    fontWeight: '600',
  },
});
