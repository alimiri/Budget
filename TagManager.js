import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, FlatList, TouchableOpacity, Button, Alert, StyleSheet } from 'react-native';
import SQLite from 'react-native-sqlite-storage';

const db = SQLite.openDatabase({ name: 'tags.db', location: 'default' });

const TagsManager = () => {
  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const [newTag, setNewTag] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [editTagName, setEditTagName] = useState('');
  const pageSize = 10; // Tags per page

  useEffect(() => {
    initializeDatabase();
    fetchTags();
  }, [page, searchQuery]);

  const initializeDatabase = () => {
    db.transaction((tx) => {
      tx.executeSql(
        'CREATE TABLE IF NOT EXISTS tags (id INTEGER PRIMARY KEY AUTOINCREMENT, tagName TEXT UNIQUE)',
        [],
        () => console.log('Table created successfully'),
        (error) => console.error('Error creating table:', error)
      );
    });
  };

  const fetchTags = () => {
    const offset = (page - 1) * pageSize;
    const query = searchQuery
      ? `SELECT * FROM tags WHERE tagName LIKE ? ORDER BY tagName ASC LIMIT ? OFFSET ?`
      : `SELECT * FROM tags ORDER BY tagName ASC LIMIT ? OFFSET ?`;

    db.transaction((tx) => {
      tx.executeSql(
        query,
        searchQuery ? [`%${searchQuery}%`, pageSize, offset] : [pageSize, offset],
        (_, results) => {
          const rows = results.rows;
          const tagsList = [];
          for (let i = 0; i < rows.length; i++) {
            tagsList.push(rows.item(i));
          }
          setTags(tagsList);
        },
        (error) => console.error('Error fetching tags:', error)
      );
    });
  };

  const addTag = () => {
    if (!newTag) return Alert.alert('Error', 'Tag name cannot be empty');

    db.transaction((tx) => {
      tx.executeSql(
        'INSERT INTO tags (tagName) VALUES (?)',
        [newTag],
        () => {
          setNewTag('');
          fetchTags();
        },
        (error) => Alert.alert('Error', 'Tag name must be unique')
      );
    });
  };

  const deleteTag = (id) => {
    db.transaction((tx) => {
      tx.executeSql(
        'DELETE FROM tags WHERE id = ?',
        [id],
        () => fetchTags(),
        (error) => console.error('Error deleting tag:', error)
      );
    });
  };

  const updateTag = () => {
    if (!editTagName) return Alert.alert('Error', 'Tag name cannot be empty');

    db.transaction((tx) => {
      tx.executeSql(
        'UPDATE tags SET tagName = ? WHERE id = ?',
        [editTagName, editTagId],
        () => {
          setEditTagId(null);
          setEditTagName('');
          fetchTags();
        },
        (error) => console.error('Error updating tag:', error)
      );
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Manage Tags</Text>

      {/* Search Bar */}
      <TextInput
        style={styles.input}
        placeholder="Search tags..."
        value={searchQuery}
        onChangeText={setSearchQuery}
      />

      {/* Add Tag */}
      <View style={styles.addTagContainer}>
        <TextInput
          style={styles.input}
          placeholder="New tag name"
          value={newTag}
          onChangeText={setNewTag}
        />
        <Button title="Add" onPress={addTag} />
      </View>

      {/* Tag List */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.tagItem}>
            {editTagId === item.id ? (
              <>
                <TextInput
                  style={styles.input}
                  value={editTagName}
                  onChangeText={setEditTagName}
                />
                <Button title="Save" onPress={updateTag} />
              </>
            ) : (
              <>
                <Text>{item.tagName}</Text>
                <View style={styles.actions}>
                  <Button title="Edit" onPress={() => {
                    setEditTagId(item.id);
                    setEditTagName(item.tagName);
                  }} />
                  <Button title="Delete" onPress={() => deleteTag(item.id)} />
                </View>
              </>
            )}
          </View>
        )}
      />

      {/* Pagination */}
      <View style={styles.pagination}>
        <Button
          title="Previous"
          disabled={page === 1}
          onPress={() => setPage((prev) => prev - 1)}
        />
        <Text>Page {page}</Text>
        <Button title="Next" onPress={() => setPage((prev) => prev + 1)} />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 20 },
  input: { borderWidth: 1, borderColor: '#ccc', padding: 10, marginBottom: 10, borderRadius: 5 },
  addTagContainer: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  tagItem: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  actions: { flexDirection: 'row' },
  pagination: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 20 },
});

export default TagsManager;
