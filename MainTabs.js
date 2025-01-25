import React, { useState, useEffect } from 'react';
import { Text, StyleSheet } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import Animated, { useAnimatedStyle, withTiming } from 'react-native-reanimated';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import TagManager from './TagManager';
import IconAdmin from './IconAdmin';
import Help from './Help';
import Settings from './Settings';
import TransactionList from './TransactionList';
import Database from './Database';

const Tab = createBottomTabNavigator();

const TabBarIcon = ({ route, focused, size }) => {
  const icons = {
    tags: 'castle',
    icons: 'store',
    transactions: 'trophy',
    help: 'book-open-outline',
    settings: 'cog',
  };

  const animatedStyle = useAnimatedStyle(() => ({
    height: withTiming(focused ? 60 : 50, { duration: 300 }),
    backgroundColor: withTiming(focused ? '#f8f9fa' : 'transparent', { duration: 300 }),
  }));

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

const MainTabs = ({ columns, autoPopup, onColumnsChange, onAutoPopupChange }) => {
  const [tags, setTags] = useState([]);

  useEffect(() => {
    setTags(Database.selectTags('', 1000));
  }, []);

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, size }) => (
          <TabBarIcon route={route.name} focused={focused} size={size} />
        ),
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
      })}
    >
      {/* Pass props via `children` */}
      <Tab.Screen
        name="Transactions"
        children={() => <TransactionList tags={tags} />}
      />

      {/* Pass props via `children` */}
      <Tab.Screen
        name="Tags"
        children={() => (
          <GestureHandlerRootView style={{ flex: 1 }}>
            <TagManager columns={columns} autoPopup={autoPopup} />
          </GestureHandlerRootView>
        )}
      />

      {/* No additional props needed */}
      <Tab.Screen name="Icons" component={IconAdmin} />

      {/* Pass props via `children` */}
      <Tab.Screen
        name="Help"
        children={() => <Help />}
      />

      {/* Pass props via `children` */}
      <Tab.Screen
        name="Settings"
        children={() => (
          <Settings
            onColumnsChange={onColumnsChange}
            onAutoPopupChange={onAutoPopupChange}
            columns={columns}
            autoPopup={autoPopup}
          />
        )}
      />
    </Tab.Navigator>
  )
};

export default MainTabs;

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
  },
  iconContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    flexGrow: 1,
    minWidth: 60,
    minHeight: 60,
    paddingVertical: 5,
    borderRadius: 10,
    width: '100%',
    backgroundColor: 'transparent',
  },
  label: {
    fontSize: 14,
    color: '#007AFF',
    marginTop: 8,
    textAlign: 'center',
  },
});
