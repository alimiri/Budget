import React, { useState, useEffect, useRef } from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { NavigationContainer } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useSharedValue, useAnimatedStyle, withTiming } from 'react-native-reanimated';
import TagManager from './TagManager';
import Help from './Help';
import Settings from './Settings';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ route, focused, size }) => {
  const icons = {
    home: 'castle',
    shop: 'store',
    trophy: 'trophy',
    help: 'book-open-outline',
    settings: 'cog',
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      height: withTiming(focused ? 60 : 50, { duration: 300 }),
      backgroundColor: withTiming(focused ? '#f8f9fa' : 'transparent', { duration: 300 }), // Match tabBar background
    };
  });

  return (
    <Animated.View style={[styles.iconContainer, animatedStyle]}>
      <Icon
        name={icons[route.toLowerCase()]}
        size={focused ? size + 5 : size}
        color={focused ? '#007AFF' : '#8e8e93'}
      />
      {focused && <Text style={styles.label}>{route}</Text>}
    </Animated.View>
  );
};

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
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarIcon: ({ focused, size }) => (
            <TabBarIcon route={route.name} focused={focused} size={size} />
          ),
          tabBarStyle: styles.tabBar,
          tabBarShowLabel: false, // Hide default label
          tabBarItemStyle: {
            margin: 0, // Remove margin between tabs
            padding: 0, // Remove padding between tabs
            flex: 1, // Ensure each tab takes up equal space
            justifyContent: 'center', // Center the icon within each tab
          },
        })}
      >
        <Tab.Screen
          name="Tags"
          children={() => (
            <GestureHandlerRootView style={{ flex: 1 }}>
              <TagManager columns={columns} autoPopup={autoPopup} />
            </GestureHandlerRootView>
          )}
        />
        <Tab.Screen name="Help" component={Help} />
        <Tab.Screen name="Settings">
          {() => (
            <Settings
              onColumnsChange={handleColumnsChange}
              onAutoPopupChange={handleAutoPopupChange}
              columns={columns}
              autoPopup={autoPopup}
            />
          )}
        </Tab.Screen>
      </Tab.Navigator>
    </NavigationContainer>
  );
};

export default App;

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: '#f8f9fa',
    height: 70,
    borderTopWidth: 0,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
    paddingHorizontal: 0, // Remove extra padding
    justifyContent: 'center', // Ensure tabs are evenly distributed
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1, // Allow container to expand dynamically
    minWidth: 60, // Minimum width to ensure text space
    minHeight: 60, // Minimum height to ensure space for icon + label
    paddingVertical: 5,
    borderRadius: 10, // Smooth edges
    width: '100%',
    backgroundColor: 'transparent', // Avoid background limitations
  },
  label: {
    fontSize: 14, // Slightly larger text for better readability
    color: '#007AFF',
    marginTop: 8, // Ensure enough space between icon and text
    textAlign: 'center', // Align text under the icon
  },
  screen: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
  },
  screenText: {
    fontSize: 20,
    fontWeight: 'bold',
  },
});
