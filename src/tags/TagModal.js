import React, { useEffect, useState } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  FlatList,
  KeyboardAvoidingView,
  ScrollView,
  TouchableWithoutFeedback,
  Keyboard,
  Platform,
} from "react-native";

import { Picker } from '@react-native-picker/picker';
import IconDisplay from "../icons/IconDisplay";
import { importLocalCSV } from '../icons/IconAdmin';
import { WEEKDAYS } from '../constants/weekdays';

let fullIconList = [];

const TagModal = ({ visible, onClose, onSave, selectedTag }) => {
  const [tagName, setTagName] = useState("");
  const [icon, setIcon] = useState(null);
  const [creditType, setCreditType] = useState("None");
  const [creditAmount, setCreditAmount] = useState("");
  const [startDay, setStartDay] = useState("");
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  const { width: screenWidth, height: screenHeight } = Dimensions.get('window');
  const ICON_ITEM_SIZE = 50; // Icon size + padding
  const popupWidth = screenWidth * 0.9; // 80% of screen width
  const numColumns = Math.floor(popupWidth / ICON_ITEM_SIZE); // Calculate columns dynamically

  const [icons, setIcons] = useState(fullIconList.slice(0, 20));
  const [page, setPage] = useState(1);

  useEffect(() => {
    if (selectedTag) {
      setTagName(selectedTag.tagName);
      setIcon( selectedTag && selectedTag.icon && selectedTag.icon !== '/' ? {
        icon: selectedTag.icon.split('/')[1],
        library: selectedTag.icon.split('/')[0]
      } :
      null);
      setCreditType(selectedTag.creditType || "None");
      setCreditAmount(selectedTag.creditAmount ? selectedTag.creditAmount.toString() : "");
      setStartDay(selectedTag.startDay ? selectedTag.startDay.toString() : "");
    } else {
      setTagName("");
      setIcon(null);
      setCreditType("None");
      setCreditAmount("");
      setStartDay("");
    }
  }, [selectedTag]);

  useEffect(() => {
    async function func() {
      fullIconList = await importLocalCSV();
      setIcons(fullIconList.slice(0, 20));
    }
    func();
  }, []);

  const selectIcon = (icon) => {
    setIconPickerVisible(false);
    setIcon(icon);
  };

  const handleSave = () => {
    const validStartDay =
      creditType === "Monthly" ? parseInt(startDay) || null :
        creditType === "Weekly" ? startDay : null;

    if (tagName.trim() !== "") {
      onSave({ id: selectedTag ? selectedTag.id : null, tagName, icon, creditType, creditAmount, startDay: validStartDay });
      setTagName("");
      setIcon(null);
      setCreditType("None");
      setCreditAmount("");
      setStartDay("");
      onClose();
    }
  };

  const loadMoreIcons = () => {
    const nextPage = page + 1;
    const nextIcons = fullIconList.slice(0, nextPage * 20);
    setIcons(nextIcons);
    setPage(nextPage);
  };
  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View style={{ flex: 1 }}>
          {/* Main Modal */}
          <View style={styles.modalOverlay}>
            <KeyboardAvoidingView
              behavior={Platform.OS === "ios" ? "padding" : "height"}
              style={{ flex: 1, width: "100%", justifyContent: "center" }}
            >
              <ScrollView
                contentContainerStyle={{ flexGrow: 1, justifyContent: "center", alignItems: "center" }}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.modalContent}>
                  <Text style={styles.modalTitle}>Add New Tag</Text>

                  <Text style={styles.label}>Tag Name</Text>
                  <View style={styles.inputRow}>
                    <TextInput style={styles.input} value={tagName} onChangeText={setTagName} placeholder="Enter tag name" />
                    <TouchableOpacity onPress={() => setIconPickerVisible(true)} style={styles.iconContainer}>
                      <IconDisplay library={icon ? icon.library : 'EvilIcons'} icon={icon ? icon.icon : 'image'} size={30} color="#555" />
                    </TouchableOpacity>
                  </View>
                  <Text style={styles.label}>Credit Type</Text>
                  <View style={styles.pickerContainer}>
                    <Picker selectedValue={creditType} onValueChange={setCreditType} itemStyle={styles.pickerText}>
                      <Picker.Item label="None" value="None" />
                      <Picker.Item label="No Period" value="NoPeriod" />
                      <Picker.Item label="Yearly" value="Yearly" />
                      <Picker.Item label="Monthly" value="Monthly" />
                      <Picker.Item label="Weekly" value="Weekly" />
                    </Picker>
                  </View>

                  {creditType === "Monthly" && (
                    <View>
                      <Text style={styles.label}>Start Day</Text>
                      <TextInput
                        style={styles.input}
                        value={startDay}
                        onChangeText={setStartDay}
                        placeholder="Enter start day"
                        keyboardType="numeric"
                      />
                    </View>
                  )}

                  {creditType === "Weekly" && (
                    <View>
                      <Text style={styles.label}>Start Day</Text>
                      <View style={styles.pickerContainer}>
                        <Picker selectedValue={startDay} onValueChange={setStartDay} itemStyle={styles.pickerText}>
                          {WEEKDAYS.map((day) => (
                            <Picker.Item key={day.value} label={day.label} value={day.value} />
                          ))}
                        </Picker>
                      </View>
                    </View>
                  )}

                  <Text style={styles.label}>Credit Amount</Text>
                  <TextInput style={styles.input} value={creditAmount} onChangeText={setCreditAmount} placeholder="Enter credit amount" keyboardType="numeric" />

                  <View style={styles.buttonRow}>
                    <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
                      <Text style={styles.buttonText}>Cancel</Text>
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
                      <Text style={styles.buttonText}>Save</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </ScrollView>
            </KeyboardAvoidingView>
          </View>
          {/* Icon Picker Modal */}
          <Modal visible={iconPickerVisible} animationType="fade" transparent={true}>
            <View style={styles.modalOverlay}>
              <View
                colors={['#a1c4fd', '#c2e9fb']} // Gradient colors
                style={[styles.popupContainer, { width: popupWidth, height: screenHeight * 0.8 }]}
              >
                {/* Icon Picker with Paging */}
                <FlatList
                  data={icons}
                  keyExtractor={(item, index) => `${item.library}-${item.icon}-${index}`}
                  numColumns={numColumns}
                  onEndReached={loadMoreIcons}
                  onEndReachedThreshold={0.5}
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
        </View>
      </TouchableWithoutFeedback>
    </Modal >
  );
};

const styles = StyleSheet.create({
  pickerContainer: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    marginBottom: 10,
    backgroundColor: "#fff",
  },
  pickerText: {
    color: "#000", // Ensures text is visible (try #000 or another visible color)
  },
  inputRow: {
    flexDirection: "row",
    alignItems: "center", // Align items vertically
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    paddingHorizontal: 10, // Adds space inside the container
  },
  input: {
    flex: 1, // Let input take remaining space
    height: 40,
    fontSize: 16,
    paddingLeft: 10, // Adds spacing between icon and text
  },
  iconContainer: {
    padding: 5, // Adds spacing around the icon
    borderRadius: 8,
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
    backgroundColor: "#007AFF",  // iOS-style blue button
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    width: "90%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    elevation: 5,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginVertical: 5,
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#ccc",
    borderRadius: 5,
    alignItems: "center",
    marginRight: 5,
  },
  saveButton: {
    flex: 1,
    padding: 10,
    backgroundColor: "#007AFF",
    borderRadius: 5,
    alignItems: "center",
    marginLeft: 5,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TagModal;
