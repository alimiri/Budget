import React, { useState, useEffect } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './MainTabs';
import Database from './Database';
import { SettingsProvider } from './SettingsContext';

const App = () => {
  const [columns, setColumns] = useState(4);
  const [autoPopup, setAutoPopup] = useState(true);
  const [dbInitialized, setDbInitialized] = useState(false);

  useEffect(() => {
    try {
      Database.initializeDatabase();
      setDbInitialized(true);
    } catch (error) {
      console.error('Database initialization failed:', error);
    }
  }, []);

  if (!dbInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text>Loading database...</Text>
      </View>
    );
  }

  return (
    <SettingsProvider>
      <NavigationContainer>
        <MainTabs
          columns={columns}
          autoPopup={autoPopup}
          onColumnsChange={setColumns}
          onAutoPopupChange={setAutoPopup}
        />
      </NavigationContainer>
    </SettingsProvider>
  );
};

export default App;
