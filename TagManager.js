import React, { useState, useEffect } from 'react';
import TagItem from './TagItem';

import {
  View,
  Text,
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

  const [isEditing, setIsEditing] = useState(false);

  const handleEditToggle = () => {
    setIsEditing((prev) => !prev);
  };

  useEffect(() => {
    initializeDatabase();
    fetchTags();
  }, [searchQuery]);

  const initializeDatabase = () => {
    db.execSync(
      'CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tagName TEXT UNIQUE, icon TEXT);'
    );
    const columns = db.getAllSync(`PRAGMA table_info(tags);`).map(_ => _.name);
    if (!columns.includes('icon')) {
      db.execSync(`ALTER TABLE tags ADD COLUMN icon TEXT;`);
    }
  };

  const fetchTags = () => {
    const query = searchQuery
      ? `SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ?`
      : `SELECT * FROM tags ORDER BY tagName ASC LIMIT ?`;

    const rows = db.getAllSync(query, searchQuery ? [`%${searchQuery}%`, pageSize] : [pageSize]);
    setTags(rows);
  };

  const addTag = () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');
    if (tags.some((tag) => tag.tagName === searchQuery)) return;

    db.execSync(`INSERT INTO tags (tagName, icon) VALUES (?, ?)`, [searchQuery, icon || null]);
    setSearchQuery('');
    fetchTags();
  };

  const updateTag = () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');

    db.execSync(`UPDATE tags SET tagName = '${searchQuery}', icon = '${icon}' WHERE id = ${editTagId}`);
    console.log('Updated tag:', searchQuery, icon, editTagId);
    cancelEdit();
    fetchTags();
  };

  const handleDelete = (id) => {
    db.execSync(`DELETE FROM tags WHERE id = ?`, [id]);
    fetchTags();
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
          <>
            <Button title="U" onPress={updateTag} />
            <Button title="Cancel" onPress={cancelEdit} />
          </>
        ) : (
          <Button
            title="+"
            onPress={addTag}
            disabled={!searchQuery || tags.some((tag) => tag.tagName === searchQuery)}
          />
        )}
      </View>

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
            isEditing={isEditing} // Pass editing state to TagItem
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
