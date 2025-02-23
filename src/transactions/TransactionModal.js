import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Platform,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import IconDisplay from "../icons/IconDisplay";
import TagManager from "../tags/TagManager";

const TransactionModal = ({ visible, onClose, onSave, tags, transaction = null, onTagChanged }) => {
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isIncome, setIsIncome] = useState(true);
  const [tagManagerVisible, setTagManagerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [tempDateInput, setTempDateInput] = useState(date.toISOString().split("T")[0]);

  useEffect(() => {
    setTempDateInput(date.toISOString().split("T")[0]);
  }, [date]);

  useEffect(() => {
    if (transaction) {
      // Fixing Date Shift Issue
      const savedDate = new Date(transaction.TransactionDate);
      const adjustedDate = new Date(savedDate.getTime() + savedDate.getTimezoneOffset() * 60000);
      setDate(adjustedDate);

      setDescription(transaction.description);
      setAmount(Math.abs(transaction.amount).toString());
      setIsIncome(transaction.amount > 0);
      setSelectedTags(transaction.tags.map(_ => _.id) || []);
    } else {
      setDate(new Date());
      setDescription("");
      setAmount("");
      setIsIncome(true);
      setSelectedTags([]);
    }
  }, [transaction, visible]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false);
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleManualDateChange = (text) => {
    // Remove any non-numeric characters
    let cleaned = text.replace(/[^0-9]/g, '');

    // Format as YYYY-MM-DD
    if (cleaned.length > 4 && cleaned.length <= 6) {
      cleaned = cleaned.replace(/(\d{4})(\d{1,2})/, '$1-$2');
    } else if (cleaned.length > 6) {
      cleaned = cleaned.replace(/(\d{4})(\d{2})(\d{1,2})/, '$1-$2-$3');
    }

    // Update the temporary date input state
    setTempDateInput(cleaned);

    // If the date is fully entered, validate and update the main date state
    if (cleaned.length === 10) {
      const [year, month, day] = cleaned.split('-').map(Number);
      const newDate = new Date(year, month - 1, day);

      // Check if the date is valid (e.g., no Feb 30)
      if (
        newDate.getFullYear() === year &&
        newDate.getMonth() === month - 1 &&
        newDate.getDate() === day
      ) {
        setDate(newDate);
      }
    }
  };

  const handleTagSelection = (tagId) => {
    setSelectedTags((prev) =>
      prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId]
    );
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>
            {transaction ? "Edit Transaction" : "Add Transaction"}
          </Text>
          <ScrollView>
            {/* Date Picker */}
            <Text style={styles.label}>Date</Text>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <TextInput
                  style={styles.input}
                  value={tempDateInput}
                  onChangeText={handleManualDateChange}
                  placeholder="YYYY-MM-DD"
                  keyboardType="numeric"
                />
                <TouchableOpacity onPress={() => setShowDatePicker(true)}>
                  <IconDisplay library='Ionicons' icon='calendar-outline' size={24} color="green" />
                </TouchableOpacity>
              </View>

              {showDatePicker && (
                Platform.OS === 'ios' ? (
                  <Modal
                    transparent={true}
                    animationType="slide"
                    visible={showDatePicker}
                    onRequestClose={() => setShowDatePicker(false)}
                  >
                    <View style={styles.modalOverlay}>
                      <DateTimePicker
                        style={styles.datePicker}
                        mode="date"
                        value={date}
                        display="inline"
                        onChange={handleDateChange}
                      />
                    </View>
                  </Modal>
                ) : (
                  <DateTimePicker
                    mode="date"
                    value={date}
                    display="default"
                    onChange={handleDateChange}
                  />
                )
              )}
            </View>


            {/* Description Input */}
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={styles.input}
              value={description}
              onChangeText={setDescription}
              placeholder="Enter description"
            />

            {/* Amount Input */}
            <Text style={styles.label}>Amount</Text>
            <TextInput
              style={styles.input}
              value={amount}
              onChangeText={setAmount}
              placeholder="Enter amount"
              keyboardType="numeric"
            />

            {/* Income/Expense Toggle */}
            <View style={styles.toggleRow}>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  isIncome && styles.toggleButtonSelected,
                ]}
                onPress={() => setIsIncome(true)}
              >
                <Text style={isIncome ? styles.toggleTextSelected : styles.toggleText}>
                  Income
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[
                  styles.toggleButton,
                  !isIncome && styles.toggleButtonSelected,
                ]}
                onPress={() => setIsIncome(false)}
              >
                <Text style={!isIncome ? styles.toggleTextSelected : styles.toggleText}>
                  Expense
                </Text>
              </TouchableOpacity>
            </View>

            {/* Tags Selector */}
            <Text style={styles.label}>Tags</Text>
            <TouchableOpacity
              style={styles.tagManagerButton}
              onPress={() => setTagManagerVisible(true)}
            >
              <Text style={styles.tagManagerText}>Manage Tags</Text>
            </TouchableOpacity>

            {/* Selected Tags Display */}
            <View style={styles.tagsContainer}>
              {tags.map((tag) => (
                <TouchableOpacity
                  key={tag.id}
                  style={[
                    styles.tagButton,
                    selectedTags.includes(tag.id) && styles.tagButtonSelected,
                  ]}
                  onPress={() => handleTagSelection(tag.id)}
                >
                  <Text
                    style={
                      selectedTags.includes(tag.id)
                        ? styles.tagTextSelected
                        : styles.tagText
                    }
                  >
                    <IconDisplay library={tag.icon ? tag.icon.split('/')[0] : 'Ionicons'} icon={tag.icon ? tag.icon.split('/')[1] : 'pricetag'} size={24} color="#555" style={styles.iconBox} />
                    {tag.tagName}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </ScrollView>

          {/* Buttons */}
          <View style={styles.buttonRow}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.buttonText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.saveButton} onPress={() => {
              onSave({
                date: date.toISOString().split("T")[0], // Store in YYYY-MM-DD format
                description,
                amount: isIncome ? parseFloat(amount) : -parseFloat(amount),
                tags: selectedTags,
              });
            }}>
              <Text style={styles.buttonText}>Save</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {tagManagerVisible && (
        <Modal visible={tagManagerVisible} animationType="slide" transparent={true}>
          <View style={styles.modalOverlay}>
            <View style={styles.tagManagerContainer}>
              <TagManager
                selectable={true}
                selectedTags={selectedTags}
                onSelectedChange={setSelectedTags}
                onClose={() => setTagManagerVisible(false)}
                onTagChanged={onTagChanged}
              />
            </View>
          </View>
        </Modal>
      )}
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  datePicker: {
    backgroundColor: "lightgreen",
    borderRadius: 10,
    width: "80%",
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  pickerContainer: {
    backgroundColor: "#fff", // Ensures background is solid white
    borderRadius: 10,
    padding: 10,
    width: "80%",
    alignSelf: "center",
  },
  dateContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    fontSize: 16,
  },
  dateButton: {
    padding: 5,
    marginLeft: 10,
  },
  dateButtonText: {
    fontSize: 18,
  },

  dateText: {
    fontSize: 16,
  },
  tagManagerContainer: {
    width: "90%", // Take up 90% of the screen width
    height: "50%", // Take up 50% of the screen height
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingTop: 20,
    elevation: 5,
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
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 10,
    marginBottom: 10,
  },
  toggleRow: {
    flexDirection: "row",
    marginBottom: 10,
  },
  toggleButton: {
    flex: 1,
    padding: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    alignItems: "center",
    borderRadius: 5,
    marginHorizontal: 5,
  },
  toggleButtonSelected: {
    backgroundColor: "#007AFF",
    borderColor: "#007AFF",
  },
  toggleText: {
    color: "#000",
  },
  toggleTextSelected: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginBottom: 10,
  },
  tagButton: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    padding: 5,
    margin: 5,
  },
  tagManagerButton: {
    backgroundColor: "#007AFF",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
    marginVertical: 5,
  },
  tagManagerText: {
    color: "#fff",
    fontWeight: "bold",
  },
  tagButtonSelected: {
    flexDirection: "row",
    backgroundColor: "#007AFF",
    borderRadius: 5,
    padding: 5,
    margin: 5,
  },
  tagText: {
    color: "#000",
  },
  tagTextSelected: {
    color: "#fff",
    marginLeft: 5,
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

export default TransactionModal;
