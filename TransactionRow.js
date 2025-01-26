import React, { useRef, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Swipeable } from "react-native-gesture-handler";
import IconDisplay from "./IconDisplay";

const TransactionRow = ({ transaction, onDelete, onEdit, isEditing, onCancelDelete }) => {
  const swipeableRef = useRef(null);

  useEffect(() => {
    if (!isEditing && swipeableRef.current) {
      swipeableRef.current.close();
    }
  }, [isEditing]);

  const handleCancelDelete = () => {
    if (swipeableRef.current) {
      swipeableRef.current.close();
    }
    if (onCancelDelete) {
      onCancelDelete();
    }
  };

  const renderRightActions = () => (
    <View style={styles.actionsContainer}>
      <TouchableOpacity
        onPress={() => onEdit(transaction.id)}
        style={[styles.actionButton, styles.editButton]}
      >
        <Text style={styles.actionText}>Edit</Text>
      </TouchableOpacity>
      <TouchableOpacity
        onPress={() => onDelete(transaction.id, handleCancelDelete)}
        style={[styles.actionButton, styles.deleteButton]}
      >
        <Text style={styles.actionText}>Delete</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <Swipeable
      ref={swipeableRef}
      renderRightActions={renderRightActions}
      overshootFriction={8}
      overshootLeft={false}
      overshootRight={false}
    >
      <View style={styles.rowContainer}>
        {/* Transaction Details Row */}
        <View style={styles.row}>
          <View style={styles.transactionDetails}>
            <Text style={styles.dateText}>{transaction.TransactionDate}</Text>
            <Text style={styles.descriptionText}>{transaction.description}</Text>
          </View>
          <View>
            <Text
              style={[
                styles.amount,
                transaction.amount < 0 ? styles.negative : styles.positive,
              ]}
            >
              {transaction.amount}
            </Text>
          </View>
        </View>

        {/* Tags Row */}
        {transaction.tags.length > 0 && (
          <View style={styles.tagsRow}>
            {transaction.tags.map((tag) => (
              <View key={tag.id} style={styles.tagItem}>
                <IconDisplay
                  library={tag.icon ? tag.icon.split("/")[0] : "Ionicons"}
                  icon={tag.icon ? tag.icon.split("/")[1] : "pricetag"}
                  size={16}
                  color="#555"
                />
                <Text style={styles.tagText}>{tag.tagName}</Text>
              </View>
            ))}
          </View>
        )}
      </View>
    </Swipeable>
  );
};

const styles = StyleSheet.create({
  rowContainer: {
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderColor: "#ccc",
    padding: 10,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  transactionDetails: {
    flex: 1,
  },
  dateText: {
    fontSize: 14,
    color: "#888",
    marginBottom: 2, // Ensures spacing between date and description
  },
  descriptionText: {
    fontSize: 16,
    color: "#000",
    fontWeight: "500",
  },
  amount: {
    fontWeight: "bold",
    fontSize: 16,
  },
  positive: {
    color: "green",
  },
  negative: {
    color: "red",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 5, // Add spacing between the tags and transaction details
  },
  tagItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 10,
    marginBottom: 5,
  },
  tagText: {
    marginLeft: 5,
    fontSize: 14,
    color: "#555",
  },
  actionsContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    width: 75,
    height: "100%",
  },
  editButton: {
    backgroundColor: "#4CAF50",
  },
  deleteButton: {
    backgroundColor: "#F44336",
  },
  actionText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default TransactionRow;
