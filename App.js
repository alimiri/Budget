import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './MainTabs';
import Database from './Database';

const App = () => {
  const [columns, setColumns] = useState(4); // Default number of columns
  const [autoPopup, setAutoPopup] = useState(true); // Auto-popup behavior


  useEffect(() => {
    console.log('Initializing database...');
    Database.initializeDatabase();
  }, []);

  const handleColumnsChange = (value) => {
    setColumns(value);
  };

  const handleAutoPopupChange = (value) => {
    setAutoPopup(value);
  };

  return (
    <NavigationContainer>
      <MainTabs
        columns={columns}
        autoPopup={autoPopup}
        onColumnsChange={handleColumnsChange}
        onAutoPopupChange={handleAutoPopupChange}
      />
    </NavigationContainer>
  );
};

export default App;
