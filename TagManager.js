import React, { useState, useEffect, useRef } from 'react';
import TagItem from './TagItem';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import * as SQLite from 'expo-sqlite';
import iconList from './assets/Ionicons.json';
import LinearGradient from 'react-native-linear-gradient';

const db = SQLite.openDatabaseSync('tags.db');
const fullIconList = Object.keys(iconList);

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ICON_ITEM_SIZE = 50; // Icon size + padding

const TagsManager = () => {
  const [page, setPage] = useState(1);
  const [icons, setIcons] = useState(fullIconList.slice(0, 20));
  const popupWidth = screenWidth * 0.9; // 80% of screen width
  const numColumns = Math.floor(popupWidth / ICON_ITEM_SIZE); // Calculate columns dynamically



  const loadMoreIcons = () => {
    const nextPage = page + 1;
    const nextIcons = fullIconList.slice(0, nextPage * 20); // Add 20 more icons
    setIcons(nextIcons);
    setPage(nextPage);
  };

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [editTagId, setEditTagId] = useState(null);
  const [icon, setIcon] = useState(null); // Store selected icon
  const pageSize = 10;

  const selectQuery = useRef(null);
  const insertQuery = useRef(null);
  const updateQuery = useRef(null);
  const deleteQuery = useRef(null);

  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  //is called when we select an icon from popup
  const selectIcon = (iconName) => {
    setIconPickerVisible(false);
    setIcon(iconName);
  };

  useEffect(() => {
    if (!editTagId) {
      fetchTags();
    }
  }, [searchQuery]);

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

  useEffect(() => {
    initializeDatabase();

    // Cleanup function
    return () => {
      selectQuery.current?.finalizeAsync();
      insertQuery.current?.finalizeAsync();
      updateQuery.current?.finalizeAsync();
      deleteQuery.current?.finalizeAsync();
    };
  }, []);

  const fetchTags = async () => {
    const result = await selectQuery.current.executeAsync([`%${searchQuery}%`, pageSize]);
    const rows = await result.getAllAsync();
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
        <TouchableOpacity
          onPress={() => setIconPickerVisible(true)}
          style={styles.iconContainer}
        >
          {icon ? <Ionicons name={icon} size={24} color="#555" /> : <EvilIcons name={'navicon'} size={24} color="#555" />}
        </TouchableOpacity>
        {editTagId ? (
          <View style={styles.iconRow}>
            <Ionicons
              name="checkmark"
              size={24}
              color="green"
              onPress={updateTag}
              style={styles.icon}
            />
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

      {/* Tag List */}
      <FlatList
        data={tags}
        keyExtractor={(item) => item.id.toString()}
        onEndReached={loadMoreIcons}
        onEndReachedThreshold={0.5}
        renderItem={({ item }) => (
          <TagItem
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={!!editTagId}
          />
        )}
      />
      <Modal visible={iconPickerVisible} animationType="fade" transparent={true}>
        <View style={styles.modalOverlay}>
          <View
            colors={['#a1c4fd', '#c2e9fb']} // Gradient colors
            style={[styles.popupContainer, { width: popupWidth, height: screenHeight * 0.8 }]}
          >
            {/* Icon Picker with Paging */}
            <FlatList
              data={icons}
              keyExtractor={(item) => item}
              numColumns={numColumns}
              onEndReached={loadMoreIcons} // Load more when reaching the end
              onEndReachedThreshold={0.5} // Trigger loadMore when halfway to the end
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    selectIcon(item);
                    setIconPickerVisible(false); // Close modal after selection
                  }}
                  style={styles.iconPickerItem}
                >
                  <Ionicons name={item} size={32} color="#555" />
                </TouchableOpacity>
              )}
            />

            {/* Page Indicator */}
            <View style={styles.footer}>
              <Text style={styles.pageIndicator}>Page {page}</Text>

              {/* Close Button */}
              <TouchableOpacity
                onPress={() => setIconPickerVisible(false)}
                style={styles.closeButton}
              >
                <Ionicons name="close" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // Semi-transparent background
    justifyContent: 'center',
    alignItems: 'center',
  },
  popupContainer: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    elevation: 5, // For shadow on Android
    shadowColor: '#000', // For shadow on iOS
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  iconPickerItem: {
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
  },
  pageIndicator: {
    color: '#555',
    fontSize: 16,
  },
  closeButton: {
    backgroundColor: '#555',
    borderRadius: 15,
    padding: 5,
  },
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 10,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 20,
  },
  //inputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 20 },
  iconContainer: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
});

export default TagsManager;
