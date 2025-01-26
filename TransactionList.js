import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import Database from "./Database";

const TransactionList = ({ tags, readOnly = false }) => {
  const [filterText, setFilterText] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions(Database.selectTransactions());
  }, []);

  const onAdd = (transaction) => {
    Database.insertTransaction(transaction.date, transaction.description, transaction.amount, transaction.tags);
    setTransactions(Database.selectTransactions());
  };

  const onUpdate = (id, transaction) => {
    Database.updateTransaction(id, transaction.date, transaction.description, transaction.amount, transaction.tags);
    setTransactions(Database.selectTransactions());
  };

  const onDelete = (id) => {
    Database.delTransaction(id);
    setTransactions(Database.selectTransactions());
  };

  const handleFilter = () => {
    return transactions.filter(transaction => {
      const matchesText =
        transaction.description.toLowerCase().includes(filterText.toLowerCase()) ||
        transaction.amount.toString().includes(filterText);
      const matchesTags =
        filteredTags.length === 0 ||
        filteredTags.every(tagId => transaction.tags.includes(tagId));
      return matchesText && matchesTags;
    });
  };

  // Calculate totals for the ribbon
  const calculateTotals = () => {
    const incomes = transactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = transactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const total = incomes + expenses;
    return { incomes, expenses, total };
  };

  const { incomes, expenses, total } = calculateTotals();

  return (
    <View style={styles.container}>
      <View style={styles.filterBar}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by description or amount"
          value={filterText}
          onChangeText={setFilterText}
        />
        {/* Add tag filter dropdown/multiselect here */}
      </View>

      <FlatList
        data={handleFilter()}
        keyExtractor={item => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onDelete={() => { readOnly ? onDelete(item.id) : undefined }}
            onEdit={readOnly ? () => {
              setSelectedTransaction(item);
              setModalVisible(true);
            } : undefined}
            readOnly={readOnly}
          />
        )}
        ListFooterComponent={
          <View style={styles.ribbon}>
            <Text style={styles.ribbonText}>
              Total: <Text style={styles.incomeText}>{incomes.toFixed(2)}</Text>{' '}
              | <Text style={styles.expenseText}>{expenses.toFixed(2)}</Text>{' '}
              | <Text style={styles.totalText}>{total.toFixed(2)}</Text>
            </Text>
          </View>
        }
      />

      {!readOnly && (<TouchableOpacity
        style={styles.addButton}
        onPress={() => {
          setSelectedTransaction(null);
          setModalVisible(true);
        }}
      >
        <Text style={styles.addButtonText}>+</Text>
      </TouchableOpacity>)}

      < TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={data => {
          if (selectedTransaction) onUpdate(selectedTransaction.id, data);
          else onAdd(data);
          setModalVisible(false);
        }}
        tags={tags}
        transaction={selectedTransaction}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1 },
  filterBar: { flexDirection: "row", padding: 10 },
  filterInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 5, borderRadius: 5 },
  addButton: { position: "absolute", bottom: 80, right: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  addButtonText: { color: "#fff", fontSize: 24 },
  ribbon: {
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  ribbonText: {
    fontSize: 16,
    color: "#333"
  },
  incomeText: {
    color: "green",
    fontWeight: "bold"
  },
  expenseText: {
    color: "red",
    fontWeight: "bold"
  },
  totalText: {
    color: "blue",
    fontWeight: "bold"
  },
});

export default TransactionList;
