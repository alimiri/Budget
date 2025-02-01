import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import * as FileSystem from 'expo-file-system';

const deleteDatabase = async () => {
  const dbName = 'Budget'; // Ensure this matches your database name
  const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

  try {
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
    Alert.alert('Success', 'Database deleted successfully.');
  } catch (error) {
    Alert.alert('Error', `Failed to delete database: ${error.message}`);
  }
};

const Settings = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <TouchableOpacity style={styles.deleteButton} onPress={deleteDatabase}>
        <Text style={styles.buttonText}>Delete Database</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  deleteButton: {
    backgroundColor: 'red',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
  },
});

export default Settings;
