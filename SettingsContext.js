import React, { createContext, useContext, useState, useEffect } from 'react';
import Database from './Database';

// Create the Context
const SettingsContext = createContext();

// Custom Hook for easier usage
export const useSettings = () => useContext(SettingsContext);

// Context Provider Component
export const SettingsProvider = ({ children }) => {
  const [periodType, setPeriodType] = useState('lastNDays');
  const [nDays, setNDays] = useState('7');
  const [firstDayOfMonth, setFirstDayOfMonth] = useState('1');
  const [showCreditPercent, setShowCreditPercent] = useState(false);
  const [showCreditAmount, setShowCreditAmount] = useState(false);

  // Load settings from Database
  useEffect(() => {
    const loadSettings = async () => {
      const settings = await Database.getSettings();
      setPeriodType(settings?.ShowTransactions?.periodType || 'lastNDays');
      setNDays(settings?.ShowTransactions?.nDays?.toString() || '7');
      setFirstDayOfMonth(settings?.ShowTransactions?.firstDayOfMonth?.toString() || '1');
      setShowCreditPercent(settings?.Tags?.showCreditPercent || false);
      setShowCreditAmount(settings?.Tags?.showCreditAmount || false);
    };

    loadSettings();
  }, []);

  // Save settings to Database
  const saveSettings = async () => {
    const settings = {
      ShowTransactions: {
        periodType,
        nDays: parseInt(nDays),
        firstDayOfMonth: parseInt(firstDayOfMonth),
      },
      Tags: {
        showCreditPercent,
        showCreditAmount,
      },
    };

    await Database.updateSettings(settings);
  };

  return (
    <SettingsContext.Provider
      value={{
        periodType, setPeriodType,
        nDays, setNDays,
        firstDayOfMonth, setFirstDayOfMonth,
        showCreditPercent, setShowCreditPercent,
        showCreditAmount, setShowCreditAmount,
        saveSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
};
