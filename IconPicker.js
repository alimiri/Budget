import React from 'react';
import { Modal, FlatList, TouchableOpacity, View, StyleSheet } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';

const icons = [
  'home', 'cart', 'fast-food', 'medical', 'paw', 'car', 'fitness', 'gift',
  'school', 'airplane', 'heart', 'shirt', 'book', 'cash', 'cafe', 'happy',
];

const IconPicker = ({ visible, onClose, onSelect }) => (
  <Modal visible={visible} transparent animationType="slide">
    <View style={styles.modalContainer}>
      <FlatList
        data={icons}
        keyExtractor={(item) => item}
        numColumns={4}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.iconButton}
            onPress={() => {
              onSelect(item);
              onClose();
            }}
          >
            <Ionicons name={item} size={30} color="#555" />
          </TouchableOpacity>
        )}
      />
      <TouchableOpacity style={styles.closeButton} onPress={onClose}>
        <Ionicons name="close-circle" size={40} color="red" />
      </TouchableOpacity>
    </View>
  </Modal>
);

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'white',
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconButton: {
    padding: 15,
    margin: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  closeButton: {
    marginTop: 20,
  },
});

export default IconPicker;
