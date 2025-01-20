import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Button, Dimensions, Alert } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import * as FileSystem from 'expo-file-system';
import * as DocumentPicker from 'expo-document-picker'; // Import the DocumentPicker
import Papa from 'papaparse'; // CSV parsing library
import Database from './Database';
import IconDisplay from './IconDisplay';
import { libraries, iconData } from './IconConfig';
import * as Sharing from 'expo-sharing';

const { width: screenWidth } = Dimensions.get('window');
const ICON_ITEM_SIZE = 50; // Icon size + padding
const numColumns = Math.floor(screenWidth / ICON_ITEM_SIZE);

const IconAdmin = () => {
  const db = useRef(null);
  const [selectedLibrary, setSelectedLibrary] = useState('FontAwesome');
  const [selectedIcons, setSelectedIcons] = useState([]);

  // Initialize database and load selected icons
  useEffect(() => {
    db.current = Database.initializeDatabase('icons.db');
    const result = db.current.select.executeSync();
    setSelectedIcons(result.getAllSync());
    return () => {
      Database.cleanupDatabase('icons.db');
    };
  }, []);

  const handleIconSelect = (library, icon) => {
    const newSelectedIcons = [...selectedIcons, { library, icon }];
    setSelectedIcons(newSelectedIcons);
    db.current.insert.executeSync(library, icon);
  };

  const handleIconRemove = (library, icon) => {
    const newSelectedIcons = selectedIcons.filter(
      (item) => !(item.library === library && item.icon === icon)
    );
    setSelectedIcons(newSelectedIcons);
    db.current.del.executeSync(library, icon);
  };

  const exportToCSV = async () => {
    const csvData = selectedIcons.map((icon) => ({
      library: icon.library,
      icon: icon.icon,
    }));
    const csvString = Papa.unparse(csvData);
    const path = FileSystem.documentDirectory + 'iconList.csv';
    await FileSystem.writeAsStringAsync(path, csvString, { EncodingType: 'utf8' });
    Sharing.shareAsync(path, {});
  };

  const importFromCSV = async () => {
    try {
      // Open the file picker dialog
      const result = await DocumentPicker.getDocumentAsync({ type: 'application/csv' });

      // Check if a file was selected
      if (result.type === 'success') {
        const fileUri = result.uri;

        // Read the selected CSV file
        const csvString = await FileSystem.readAsStringAsync(fileUri, { encoding: FileSystem.EncodingType.UTF8 });

        const parsedData = Papa.parse(csvString, { header: true });
        if (parsedData.data.length > 0) {
          const newSelectedIcons = parsedData.data.map((item) => ({
            library: item.library,
            icon: item.icon,
          }));
          setSelectedIcons(newSelectedIcons);

          // Update database
          db.current.delAll.executeSync(); // Clear existing data
          newSelectedIcons.forEach((icon) =>
            db.current.insert.executeSync(icon.library, icon.icon)
          );

          Alert.alert('Import Successful', 'Selected icons updated.');
        } else {
          Alert.alert('Import Failed', 'No data found in the CSV file.');
        }
      }
    } catch (error) {
      console.error('Error importing CSV:', error);
      Alert.alert('Import Failed', 'Unable to read the CSV file.');
    }
  };

  const filteredIcons = iconData[selectedLibrary].filter(
    (icon) => !selectedIcons.find((item) => item.library === selectedLibrary && item.icon === icon)
  );

  const renderSelectedIcon = ({ item }) => (
    <TouchableOpacity
      style={styles.iconWrapper}
      onPress={() => handleIconRemove(item.library, item.icon)}
    >
      <IconDisplay library={item.library} icon={item.icon} size={40} color="green" />
    </TouchableOpacity>
  );

  const renderAvailableIcon = ({ item }) => (
    <TouchableOpacity
      style={styles.iconWrapper}
      onPress={() => handleIconSelect(selectedLibrary, item)}
    >
      <IconDisplay library={selectedLibrary} icon={item} size={40} color="blue" />
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selected Icons</Text>
      <FlatList
        data={selectedIcons}
        keyExtractor={(item, index) => `${item.library}-${item.icon}-${index}`}
        renderItem={renderSelectedIcon}
        style={styles.list}
        numColumns={numColumns}
      />

      <Text style={styles.title}>Available Icons</Text>
      <Picker
        selectedValue={selectedLibrary}
        onValueChange={(value) => setSelectedLibrary(value)}
        style={styles.picker}
      >
        {Object.keys(libraries).map((lib) => (
          <Picker.Item key={lib} label={lib} value={lib} />
        ))}
      </Picker>
      <FlatList
        data={filteredIcons}
        keyExtractor={(item) => item}
        renderItem={renderAvailableIcon}
        style={styles.list}
        numColumns={numColumns}
      />

      {/* Export and Import Buttons */}
      <View style={styles.buttonContainer}>
        <Button title="Export to CSV" onPress={exportToCSV} />
        <Button title="Import from CSV" onPress={importFromCSV} />
      </View>
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
    height: '20%',
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 10,
  },
  list: {
    marginVertical: 10,
    height: '30%',
  },
  iconWrapper: {
    marginHorizontal: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginVertical: 20,
  },
});

export default IconAdmin;
