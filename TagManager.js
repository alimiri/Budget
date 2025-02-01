import React, { useState, useEffect, useRef } from 'react';
import TagItem from './TagItem';
import { View, Text, TextInput, TouchableOpacity, Modal, FlatList, StyleSheet, Dimensions, Alert } from 'react-native';
import Database from './Database';
import IconDisplay from './IconDisplay';
import { importLocalCSV } from './IconAdmin';

let fullIconList = [];

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
const ICON_ITEM_SIZE = 50; // Icon size + padding

const TagsManager = ({ onTagChanged, selectable = false, selectedTags = [], onSelectedChange, onClose }) => {
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

  const [iconPickerVisible, setIconPickerVisible] = useState(false);

  //is called when we select an icon from popup
  const selectIcon = (icon) => {
    setIconPickerVisible(false);
    setIcon(icon);
  };

  useEffect(() => {
    if (!editTagId) {
      fetchTags();
    }
  }, [searchQuery]);

  useEffect(() => {
    async function func() {
      fetchTags();
      fullIconList = await importLocalCSV();
      setIcons(fullIconList.slice(0, 20));
    }
    func();
  }, []);

  const fetchTags = () => {
    setTags(Database.selectTags(searchQuery, pageSize));
  };

  const toggleSelection = (tagId) => {
    let updatedSelection;
    if (selectedTags.includes(tagId)) {
      updatedSelection = selectedTags.filter(id => id !== tagId);
    } else {
      updatedSelection = [...selectedTags, tagId];
    }

    if (onSelectedChange) {
      onSelectedChange(updatedSelection); // Pass the updated array
    }
  };


  const addTag = () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');
    if (tags.some((tag) => tag.tagName === searchQuery)) return;
    Database.insertTag(searchQuery, icon ? icon.library + '/' + icon.icon : null);
    onTagChanged();
    setSearchQuery('');
    setIcon(null);
  };

  const updateTag = () => {
    if (!searchQuery) return Alert.alert('Error', 'Tag name cannot be empty');
    Database.updateTag(searchQuery, icon ? icon.library + '/' + icon.icon : null, editTagId);
    onTagChanged();
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
            if (cancelSwipe) cancelSwipe(); // Close swipe properly
          },
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            Database.delTag(id);
            onTagChanged();
            fetchTags();
            if (cancelSwipe) cancelSwipe(); // Ensure swipe action is reset
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
    setIcon(tag.icon ? { library: tag.icon.split('/')[0], icon: tag.icon.split('/')[1] } : null);
  };

  const cancelEdit = () => {
    setEditTagId(null);
    setSearchQuery('');
    setIcon(null);
  };

  return (
    <View style={styles.container}>
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
          <IconDisplay library={icon ? icon.library : 'EvilIcons'} icon={icon ? icon.icon : 'navicon'} size={24} color="#555" />
        </TouchableOpacity>
        {editTagId ? (
          <View style={styles.iconRow}>
            <IconDisplay library='Ionicons' icon='checkmark' size={24} color="green" onPress={updateTag} style={styles.icon} />
            <IconDisplay library='Ionicons' icon='close' size={24} color="red" onPress={cancelEdit} style={styles.icon} />
          </View>
        ) : (
          <IconDisplay
            library='Ionicons'
            icon="add-circle"
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
        renderItem={({ item }) => (
          <TagItem
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={!!editTagId}
            selectable={selectable}
            isSelected={selectedTags.includes(item.id)} // Ensure this updates properly
            onSelect={toggleSelection}
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
                  <IconDisplay library={item.library} icon={item.icon} size={32} color="#555" />
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
                <IconDisplay library='Ionicons' icon='close' size={24} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      {selectable && (<View style={styles.bottomBar}>
        <TouchableOpacity style={styles.closeButton} onPress={onClose}>
          <Text style={styles.closeButtonText}>Close</Text>
        </TouchableOpacity>
      </View>)}
    </View>
  );
};

const styles = StyleSheet.create({
  bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#fff",  // Light background
    padding: 15,
    borderTopWidth: 1,
    borderTopColor: "#ccc",  // Subtle divider
    alignItems: "center",
  },
  closeButton: {
    backgroundColor: "#007AFF",  // iOS-style blue button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  closeButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
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
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    padding: 10,
    borderRadius: 5,
  },
  iconContainer: {
    padding: 5,
    borderRadius: 8,
    backgroundColor: '#eee',
    marginRight: 10,
  },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', padding: 10, borderRadius: 5 },
});

export default TagsManager;
