import React, { useState, useEffect, useRef } from 'react';
import TagItem from './TagItem';
import Ionicons from 'react-native-vector-icons/Ionicons';

import {
  View,
  TextInput,
  FlatList,
  Button,
  Alert,
  StyleSheet,
} from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as ImagePicker from 'expo-image-picker';

const db = SQLite.openDatabaseSync('tags.db');

const TagsManager = () => {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [icon, setIcon] = useState(null); // Store selected icon
  const pageSize = 10;

  const selectQuery = useRef(null);
  const insertQuery = useRef(null);
  const updateQuery = useRef(null);
  const deleteQuery = useRef(null);

  useEffect(() => {
    if(!editTagId) {
      fetchTags();
    }
  }, [searchQuery]);

  useEffect(() => {
    initializeDatabase();
  }, []);

  const initializeDatabase = async () => {
    db.execSync(
      'CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tagName TEXT UNIQUE, icon TEXT);'
    );
    const columns = db.getAllSync(`PRAGMA table_info(tags);`).map(_ => _.name);
    if (!columns.includes('icon')) {
      db.execSync(`ALTER TABLE tags ADD COLUMN icon TEXT;`);
    }

    selectQuery.current = await db.prepareAsync(`SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?`);
    insertQuery.current = await db.prepareAsync(`INSERT INTO tags (tagName, icon) VALUES (?, ?)`);
    updateQuery.current = await db.prepareAsync(`UPDATE tags SET tagName = ?, icon = ? WHERE id = ?`);
    deleteQuery.current = await db.prepareAsync(`DELETE FROM tags WHERE id = ?`);

    fetchTags();
  };

  const fetchTags = async () => {
    const result = await selectQuery.current.executeAsync([`%${searchQuery}%`, pageSize]);
    const rows = await result.getAllAsync();
    console.log(rows);
    setTags(rows);
  };

  const addTag = async () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');
    if (tags.some((tag) => tag.tagName === searchQuery)) return;
    await insertQuery.current.executeAsync([searchQuery, icon]);
    setSearchQuery('');
  };

  const updateTag = async () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');
    await updateQuery.current.executeAsync([searchQuery, icon, editTagId]);
    cancelEdit();
  };

  const handleDelete = (id, cancelSwipe) => {
    Alert.alert(
        'Confirm Deletion',
        'Are you sure you want to delete this tag?',
        [
            {
                text: 'Cancel',
                onPress: () => {
                    if (cancelSwipe) cancelSwipe(); // Close swipe on cancel
                },
                style: 'cancel',
            },
            {
                text: 'Delete',
                onPress: async () => {
                    await deleteQuery.current.executeAsync([id]); // Delete tag
                    fetchTags(); // Refresh tags list
                },
                style: 'destructive',
            },
        ],
        { cancelable: true }
    );
};


  const handleEdit = (id) => {
    const tag = tags.find((tag) => tag.id === id);
    setEditTagId(tag.id);
    setSearchQuery(tag.tagName);
    setIcon(tag.icon || null);
  };

  const cancelEdit = () => {
    setEditTagId(null);
    setSearchQuery('');
    setIcon(null);
  };

  const selectIcon = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 1,
    });

    if (!result.canceled) {
      setIcon(result.assets[0].uri);
    }
  };

  return (
    <View style={styles.container}>
      {/* Unified Input Box */}
      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          placeholder="Search or add a tag..."
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {editTagId ? (
          <View style={styles.iconRow}>
            {/* Checkmark Icon for Update */}
            <Ionicons
              name="checkmark"
              size={24}
              color="green"
              onPress={updateTag}
              style={styles.icon}
            />
            {/* Cancel Icon */}
            <Ionicons
              name="close"
              size={24}
              color="red"
              onPress={cancelEdit}
              style={styles.icon}
            />
          </View>
        ) : (
          <Ionicons
            name="add-circle"
            size={30}
            color={!searchQuery || tags.some((tag) => tag.tagName === searchQuery) ? 'gray' : 'blue'}
            onPress={addTag}
            style={styles.icon}
            disabled={!searchQuery || tags.some((tag) => tag.tagName === searchQuery)}
          />
        )}
      </View>

      {/* Button for selecting an icon */}
      <Button title="Select Icon" onPress={selectIcon} />

      {/* Tag List */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TagItem
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={!!editTagId}
          />
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
  row: { flexDirection: 'row', alignItems: 'center', padding: 15, borderBottomWidth: 1, borderColor: '#ccc' },
  iconBox: { width: 30, height: 30, justifyContent: 'center', alignItems: 'center', marginRight: 10 },
  tagText: { fontSize: 16 },
  editingRow: { backgroundColor: '#f0f8ff' },
  rowActions: { flexDirection: 'row', justifyContent: 'space-around', padding: 15, backgroundColor: '#eee' },
});

export default TagsManager;
