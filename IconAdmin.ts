import React, { useState, useEffect } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FontAwesome from 'react-native-vector-icons/FontAwesome';
import * as MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import * as Ionicons from 'react-native-vector-icons/Ionicons';

// Icon libraries
const libraries = {
  FontAwesome,
  MaterialIcons,
  Ionicons,
};

// Available icons in each library
const iconData = {
  FontAwesome: ['star', 'heart', 'car', 'camera'],
  MaterialIcons: ['home', 'account-circle', 'alarm', 'pets'],
  Ionicons: ['add', 'airplane', 'alarm', 'basket'],
};

// Simulating a persistent "table" (can be replaced with an API or local storage)
const initialSelectedIcons = []; // Load from persistence if needed

const App = () => {
  // State for selected library
  const [selectedLibrary, setSelectedLibrary] = useState('FontAwesome');

  // State for selected icons (table)
  const [selectedIcons, setSelectedIcons] = useState(initialSelectedIcons);

  useEffect(() => {
    // Simulate loading initial data from persistence (API, database, etc.)
    // Here, we directly set the selected icons. Replace this with an async call if needed.
    setSelectedIcons(initialSelectedIcons);
  }, []);

  // Add icon to the selected list and update persistence
  const handleIconSelect = (library, icon) => {
    const newSelectedIcons = [...selectedIcons, { library, icon }];
    setSelectedIcons(newSelectedIcons);
    persistData(newSelectedIcons); // Persist the updated list
  };

  // Remove icon from the selected list and update persistence
  const handleIconRemove = (library, icon) => {
    const newSelectedIcons = selectedIcons.filter(
      (item) => !(item.library === library && item.icon === icon)
    );
    setSelectedIcons(newSelectedIcons);
    persistData(newSelectedIcons); // Persist the updated list
  };

  // Persist data to the "table" (replace this with actual database calls)
  const persistData = (data) => {
    // Simulate saving to a database or API
    console.log('Persisted Data:', data);
  };

  // Remove icons that are already selected from the bottom list
  const filteredIcons = iconData[selectedLibrary].filter(
    (icon) => !selectedIcons.find((item) => item.library === selectedLibrary && item.icon === icon)
  );

  const renderSelectedIcon = ({ item }) => {
    const IconComponent = libraries[item.library]?.default;
    return (
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => handleIconRemove(item.library, item.icon)} // Remove icon
      >
        {IconComponent && <IconComponent name={item.icon} size={40} color="green" />}
      </TouchableOpacity>
    );
  };

  const renderAvailableIcon = ({ item }) => {
    const IconComponent = libraries[selectedLibrary]?.default;
    return (
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => handleIconSelect(selectedLibrary, item)} // Add icon
      >
        {IconComponent && <IconComponent name={item} size={40} color="blue" />}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      {/* Dropdown for selecting library */}
      <Picker
        selectedValue={selectedLibrary}
        onValueChange={(value) => setSelectedLibrary(value)}
        style={styles.picker}
      >
        {Object.keys(libraries).map((lib) => (
          <Picker.Item key={lib} label={lib} value={lib} />
        ))}
      </Picker>

      {/* FlatList for selected icons */}
      <Text style={styles.title}>Selected Icons</Text>
      <FlatList
        data={selectedIcons}
        keyExtractor={(item, index) => `${item.library}-${item.icon}-${index}`}
        renderItem={renderSelectedIcon}
        horizontal
        style={styles.list}
      />

      {/* FlatList for available icons */}
      <Text style={styles.title}>Available Icons</Text>
      <FlatList
        data={filteredIcons}
        keyExtractor={(item) => item}
        renderItem={renderAvailableIcon}
        horizontal
        style={styles.list}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
  },
  picker: {
    marginVertical: 10,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  list: {
    marginVertical: 10,
  },
  iconWrapper: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default App;
