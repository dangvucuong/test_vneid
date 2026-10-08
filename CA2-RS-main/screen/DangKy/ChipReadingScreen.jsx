import React from 'react';
import { StyleSheet, View, Text, SafeAreaView, TouchableOpacity, Image,   NativeModules,
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { useI18n } from "../../utils/i18n";

export default function ChipReadingScreen({ navigation }) {
  const { i18n } = useI18n();

  const steps = [
    { id: 1, title: i18n.t('ekyc.steps.scan'), completed: true },
    { id: 2, title: i18n.t('ekyc.steps.chip'), active: true },
    { id: 3, title: i18n.t('ekyc.steps.face') },
  ];

  return (
    <SafeAreaView style={styles.container}>
      {/* <StatusBar style="dark" /> */}
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{i18n.t('ekyc.header')}</Text>
        <View style={{ width: 24 }} />
      </View>

      {/* Progress Steps */}
      <View style={styles.stepsContainer}>
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            <View style={styles.stepItem}>
              <View style={[
                styles.stepCircle,
                { 
                  backgroundColor: step.completed ? '#3366FF' : 
                                 step.active ? '#3366FF' : '#E5E7EB'
                }
              ]}>
                {step.completed ? (
                  <Ionicons name="checkmark" size={16} color="white" />
                ) : (
                  <Text style={[
                    styles.stepNumber,
                    { color: step.active ? 'white' : '#6B7280' }
                  ]}>
                    {step.id}
                  </Text>
                )}
              </View>
              <Text style={styles.stepText}>{step.title}</Text>
            </View>
            {index < steps.length - 1 && (
              <View style={[
                styles.stepLine,
                { backgroundColor: step.completed ? '#3366FF' : '#E5E7EB' }
              ]} />
            )}
          </React.Fragment>
        ))}
      </View>

      {/* Main Content */}
      <View style={styles.content}>
        <Image
          source={require('../../img/register_nfc.png')}
          style={styles.illustration}
          resizeMode="contain"
        />
        <Text style={styles.title}>{i18n.t('ekyc.chipReading.title')}</Text>
        
        <View style={styles.instructionsContainer}>
          <View style={styles.instructionStep}>
            <Text style={styles.stepTitle}>
              {i18n.t('ekyc.chipReading.steps.step1.title')}
            </Text>
            <Text style={styles.stepDescription}>
              {i18n.t('ekyc.chipReading.steps.step1.description')}
            </Text>
          </View>
          
          <View style={styles.instructionStep}>
            <Text style={styles.stepTitle}>
              {i18n.t('ekyc.chipReading.steps.step2.title')}
            </Text>
            <Text style={styles.stepDescription}>
              {i18n.t('ekyc.chipReading.steps.step2.description')}
            </Text>
          </View>
        </View>
      </View>

      {/* Bottom Button */}
      <TouchableOpacity 
        style={styles.button}
        onPress={() => {
          // Handle chip reading process
          // Then navigate to face verification
          navigation.navigate('FaceVerification');
        }}
      >
        <Text style={styles.buttonText}>
          {i18n.t('ekyc.chipReading.button')}
        </Text>
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  headerTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#000',
  },
  stepsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    marginTop: 8,
  },
  stepItem: {
    alignItems: 'center',
    flex: 1,
  },
  stepCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumber: {
    fontSize: 12,
    fontWeight: '600',
  },
  stepText: {
    fontSize: 12,
    color: '#374151',
    marginTop: 4,
    textAlign: 'center',
  },
  stepLine: {
    height: 2,
    flex: 1,
    marginHorizontal: -10,
  },
  content: {
    flex: 1,
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingTop: 40,
  },
  illustration: {
    width: '80%',
    height: 240,
    marginBottom: 32,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 24,
  },
  instructionsContainer: {
    width: '100%',
    gap: 20,
  },
  instructionStep: {
    gap: 8,
  },
  stepTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#374151',
  },
  stepDescription: {
    fontSize: 14,
    color: '#6B7280',
    lineHeight: 20,
  },
  button: {
    backgroundColor: '#3366FF',
    marginHorizontal: 16,
    marginBottom: 32,
    paddingVertical: 16,
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
});

