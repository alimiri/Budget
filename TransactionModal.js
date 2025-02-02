import React, { useState, useEffect } from "react";
import {
  Modal,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import DateTimePicker from "@react-native-community/datetimepicker";
import IconDisplay from "./IconDisplay";
import TagManager from "./TagManager";

const TransactionModal = ({ visible, onClose, onSave, tags, transaction = null, onTagChanged }) => {
  const [date, setDate] = useState(new Date());
  const [description, setDescription] = useState("");
  const [amount, setAmount] = useState("");
  const [selectedTags, setSelectedTags] = useState([]);
  const [isIncome, setIsIncome] = useState(true);
  const [tagManagerVisible, setTagManagerVisible] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);

  useEffect(() => {
    if (transaction) {
      setDate(new Date(transaction.TransactionDate));
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
  }, [transaction]);

  const handleDateChange = (event, selectedDate) => {
    setShowDatePicker(false); // Hide picker after selection
    if (selectedDate) {
      setDate(selectedDate);
    }
  };

  const handleSave = () => {
    if (!description || !amount) {
      alert("Please fill in all required fields.");
      return;
    }

    onSave({
      date: date.toISOString().split("T")[0],
      description,
      amount: isIncome ? parseFloat(amount) : -parseFloat(amount),
      tags: selectedTags,
    });
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
            <Text style={styles.label}>Date</Text>
            <TouchableOpacity onPress={() => setShowDatePicker(true)} style={styles.input}>
              <Text>{date.toISOString().split("T")[0]}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={date}
                mode="date"
                display="default"
                onChange={handleDateChange}
              />
            )}

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
            <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
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
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center", // Center the modal content vertically
    alignItems: "center", // Center the modal content horizontally
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
