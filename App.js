import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import MainTabs from './MainTabs';

const App = () => {
  const [columns, setColumns] = useState(4); // Default number of columns
  const [autoPopup, setAutoPopup] = useState(true); // Auto-popup behavior

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
