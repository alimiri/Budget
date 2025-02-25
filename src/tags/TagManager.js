import React, { useState, useEffect } from 'react';
import TagItem from './TagItem';
import TagModal from "./TagModal";
import { View, Text, TextInput, TouchableOpacity, FlatList, StyleSheet, Alert } from 'react-native';
import Database from '../../Database';

const TagsManager = ({ onTagChanged, selectable = false, selectedTags = [], onSelectedChange, onClose }) => {
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTag, setSelectedTag] = useState(null);

  const [tags, setTags] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const pageSize = 10;

  useEffect(() => {
    if (!selectedTag) {
      fetchTags();
    }
  }, [searchQuery]);

  useEffect(() => {
    async function func() {
      fetchTags();
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

  const handleSave = (newTag) => {
    if (!newTag.tagName) return Alert.alert('Error', 'Tag name cannot be empty');
    if(newTag.id) {
      Database.updateTag(newTag.tagName, newTag.icon ? newTag.icon.library + '/' + newTag.icon.icon : null, newTag.creditType, newTag.creditAmount, newTag.startDay, newTag.id);
    } else {
      Database.insertTag(newTag.tagName, newTag.icon ? newTag.icon.library + '/' + newTag.icon.icon : null, newTag.creditType, newTag.creditAmount, newTag.startDay);
    }
    onTagChanged(newTag); // Send new tag to parent (TransactionModal)
    fetchTags();
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
            if (cancelSwipe) cancelSwipe();
          },
          style: 'destructive',
        },
      ],
      { cancelable: true }
    );
  };

  const handleEdit = (id, cancelSwipe) => {
    setModalVisible(true);
    const tag = tags.find((tag) => tag.id === id);
    setSelectedTag(tag);
    if (cancelSwipe) cancelSwipe();
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
      </View>

      {/* Tag List */}
      <FlatList
        data={tags}
        keyExtractor={(item, index) => `${item.library}-${item.icon}-${index}`}
        renderItem={({ item }) => (
          <TagItem
            item={item}
            onEdit={handleEdit}
            onDelete={handleDelete}
            isEditing={!!selectedTag}
            selectable={selectable}
            isSelected={selectedTags.includes(item.id)} // Ensure this updates properly
            onSelect={toggleSelection}
          />
        )}
      />
      {/* Add New Tag Button */}
      <TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedTag(null);
          setModalVisible(true);}}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>

      {/* New Tag Modal */}
      <TagModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={handleSave}
        selectedTag={selectedTag}
      />
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
  addButton: {
    backgroundColor: "#007AFF",
    borderRadius: 50,
    width: 50,
    height: 50,
    justifyContent: "center",
    alignItems: "center",
    position: "absolute",
    bottom: 20,
    right: 20,
  },
  addButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TagsManager;
