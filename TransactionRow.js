import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import IconDisplay from "./IconDisplay";

const TransactionRow = ({ transaction, onDelete, onEdit }) => {
  return (
    <View style={styles.row}>
      <View>
        <Text>{transaction.date}</Text>
        <Text>{transaction.description}</Text>
      </View>
      <View>
        <Text style={[styles.amount, transaction.amount < 0 ? styles.negative : styles.positive]}>
          {transaction.amount}
        </Text>
      </View>
      <View style={styles.tags}>
        {transaction.tags.map(tag => (
          <IconDisplay key={tag.id} icon={tag.icon} />
        ))}
      </View>
      <View style={styles.actions}>
        <TouchableOpacity onPress={onEdit}>
          <Text>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={onDelete}>
          <Text>Delete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  row: { flexDirection: "row", padding: 10, borderBottomWidth: 1, borderColor: "#ccc" },
  amount: { fontWeight: "bold" },
  positive: { color: "green" },
  negative: { color: "red" },
  tags: { flexDirection: "row" },
  actions: { flexDirection: "row", marginLeft: "auto" },
});

export default TransactionRow;
