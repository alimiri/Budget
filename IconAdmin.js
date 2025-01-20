import React, { useState, useEffect, useRef } from 'react';
import { View, FlatList, StyleSheet, Text, TouchableOpacity, Dimensions } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Database from './Database';
import IconDisplay from './IconDisplay';
import { libraries, iconData } from './IconConfig';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ICON_ITEM_SIZE = 50; // Icon size + padding
const numColumns = Math.floor(screenWidth / ICON_ITEM_SIZE);

const IconAdmin = () => {
  const db = useRef(null);

  const [selectedLibrary, setSelectedLibrary] = useState('FontAwesome');

  const [selectedIcons, setSelectedIcons] = useState([]);

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

  const filteredIcons = iconData[selectedLibrary].filter(
    (icon) => !selectedIcons.find((item) => item.library === selectedLibrary && item.icon === icon)
  );

  const renderSelectedIcon = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => handleIconRemove(item.library, item.icon)}
      >
        <IconDisplay library={item.library} icon={item.icon} size={40} color="green" />
      </TouchableOpacity>
    );
  };

  const renderAvailableIcon = ({ item }) => {
    return (
      <TouchableOpacity
        style={styles.iconWrapper}
        onPress={() => handleIconSelect(selectedLibrary, item)}
      >
        <IconDisplay library={selectedLibrary} icon={item} size={40} color="blue" />
      </TouchableOpacity>
    );
  };

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
});

export default IconAdmin;