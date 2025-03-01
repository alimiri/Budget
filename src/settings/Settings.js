import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSettings } from './SettingsContext';

const Settings = () => {
  const {
    periodType, setPeriodType,
    nDays, setNDays,
    firstDayOfMonth, setFirstDayOfMonth,
    showCreditPercent, setShowCreditPercent,
    showCreditAmount, setShowCreditAmount,
    saveSettings,
  } = useSettings();

  const handleSaveSettings = async () => {
    await saveSettings();
    Alert.alert('Success', 'Settings saved successfully.');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollView}>
        <Text style={styles.title}>Settings</Text>

        <Text style={styles.label}>Period of Listed Transactions:</Text>
        <TouchableOpacity onPress={() => setPeriodType('lastNDays')}>
          <Text style={periodType === 'lastNDays' ? styles.selectedOption : styles.option}>
            Last N Days
          </Text>
        </TouchableOpacity>
        {periodType === 'lastNDays' && (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={nDays}
            onChangeText={(text) => setNDays(text.replace(/[^0-9]/g, ''))}
            placeholder="Enter N (e.g., 7)"
          />
        )}

        <TouchableOpacity onPress={() => setPeriodType('monthly')}>
          <Text style={periodType === 'monthly' ? styles.selectedOption : styles.option}>
            Monthly
          </Text>
        </TouchableOpacity>
        {periodType === 'monthly' && (
          <TextInput
            style={styles.input}
            keyboardType="numeric"
            value={firstDayOfMonth}
            onChangeText={(text) => {
              const value = text.replace(/[^0-9]/g, '');
              if (value === '' || (parseInt(value) >= 1 && parseInt(value) <= 30)) {
                setFirstDayOfMonth(value);
              }
            }}
            placeholder="First Day of Month (1-30)"
          />
        )}

        <View style={styles.switchContainer}>
          <Text>Show remaining credit as percent</Text>
          <Switch
            value={showCreditPercent}
            onValueChange={(value) => setShowCreditPercent(value)}
          />
        </View>

        <View style={styles.switchContainer}>
          <Text>Show remaining credit as amount</Text>
          <Switch
            value={showCreditAmount}
            onValueChange={(value) => setShowCreditAmount(value)}
          />
        </View>

        <TouchableOpacity style={styles.saveButton} onPress={handleSaveSettings}>
          <Text style={styles.buttonText}>Save Settings</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollView: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  label: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
  },
  option: {
    fontSize: 16,
    color: '#555',
    paddingVertical: 5,
  },
  selectedOption: {
    fontSize: 16,
    color: '#007AFF',
    paddingVertical: 5,
    fontWeight: 'bold',
  },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    padding: 10,
    marginVertical: 10,
    backgroundColor: '#fff',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 10,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    marginVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Settings;
