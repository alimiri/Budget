import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Switch, Alert, KeyboardAvoidingView, ScrollView, Platform } from 'react-native';
import { useSettings } from './SettingsContext';
import Database from "../data/Database";
import { CREDIT_TYPES } from '../constants/creditTypes';
import generateMockDataUtil  from '../data/generateMockDataUtil.js';

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

  const insertMockData = async () => {
    const tags = [
      { id: 1, tagName: "Sport", icon: "MaterialIcons/snowboarding", creditType: CREDIT_TYPES.Yearly, creditAmount: 200, startDay: null },
      { id: 2, tagName: "Food", icon: "Entypo/app-store", creditType: CREDIT_TYPES.Monthly, creditAmount: 500, startDay: 16 },
      { id: 3, tagName: "Clothes", icon: "Ionicons/shirt-outline", creditType: CREDIT_TYPES.Monthly, creditAmount: 200, startDay: 1 },
      { id: 4, tagName: "Dining", icon: "MaterialIcons/restaurant", creditType: CREDIT_TYPES.Weekly, creditAmount: 100, startDay: 1 }
    ];

    const transactions = generateMockDataUtil(new Date(2024, 11, 1), new Date(), 500, tags);

    tags.forEach(_ => Database.insertTag(_.tagName, _.icon, _.creditType, _.creditAmount, _.startDay));
    transactions.forEach(_ => Database.insertTransaction(_.TransactionDate, _.description, _.amount, _.tags.map(tag => tag.id)));
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
        <TouchableOpacity style={styles.saveButton} onPress={() => {
          Database.deleteDatabase();
          Database.initializeDatabase()
        }}>
          <Text style={styles.buttonText}>Delete Database</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.saveButton} onPress={insertMockData}>
          <Text style={styles.buttonText}>Insert Mock Data</Text>
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
