import React, { useState, useEffect } from "react";
import { View, FlatList, Text, TextInput, TouchableOpacity, StyleSheet } from "react-native";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import Database from "./Database";

const TransactionList = ({ tags, readOnly = false, externalFilter, onChangeSummary }) => {
  const [filterText, setFilterText] = useState("");
  const [filteredTags, setFilteredTags] = useState([]);
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
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
    return transactions.filter((transaction) => {
      const matchesText =
        transaction.description.toLowerCase().includes(filterText.toLowerCase()) ||
        transaction.amount.toString().includes(filterText);
      const matchesTags =
        filteredTags.length === 0 ||
        filteredTags.every((tagId) => transaction.tags.includes(tagId));
      const matchesFromDate =
        !fromDate || new Date(transaction.TransactionDate) >= new Date(fromDate);
      const matchesToDate =
        !toDate || new Date(transaction.TransactionDate) <= new Date(toDate);

      let matchesExternalYears = true;
      if (externalFilter && externalFilter.years && externalFilter.years.length > 0) {
        const transactionYear = new Date(transaction.TransactionDate).getFullYear();
        matchesExternalYears = externalFilter.years.includes(transactionYear);
      }

      let matchesExternalMonths = true;
      if (externalFilter && externalFilter.months && externalFilter.months.length > 0) {
        const transactionMonth = new Date(transaction.TransactionDate).getMonth() + 1;
        matchesExternalMonths = externalFilter.months.includes(transactionMonth);
      }

      let matchesExternalTags = true;
      if (externalFilter && externalFilter.tags && externalFilter.tags.length > 0) {
        matchesExternalTags = transaction.tags.some((tag) => externalFilter.tags.includes(tag.id));
      }

      return matchesText && matchesTags && matchesFromDate && matchesToDate && matchesExternalYears && matchesExternalMonths && matchesExternalTags;
    });
  };

  const calculateTotals = () => {
    const filteredTransactions = handleFilter();

    // Calculate totals
    const incomes = filteredTransactions
      .filter((transaction) => transaction.amount > 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = filteredTransactions
      .filter((transaction) => transaction.amount < 0)
      .reduce((sum, transaction) => sum + transaction.amount, 0);
    const total = incomes + expenses;

    if (readOnly && onChangeSummary) {
      // Summary by year
      const years = {};
      const months = {};
      const tags = {};
      transactions.forEach(transaction => {
        const year = new Date(transaction.TransactionDate).getFullYear();
        const month = new Date(transaction.TransactionDate).getMonth() + 1; // 1-based index for months

        if (!years[year]) years[year] = { incomes: 0, expenses: 0 };
        if (!months[month]) months[month] = { incomes: 0, expenses: 0 };

        transaction.tags.forEach(tag => {
          if (!tags[tag.id]) tags[tag.id] = { incomes: 0, expenses: 0 };
        });
      });

      // Call onChangeSummary with the summaries
      onChangeSummary(
        Object.entries(years).map(([index, data]) => ({ index: parseInt(index), ...data })),
        Object.entries(months).map(([index, data]) => ({ index: parseInt(index), ...data })),
        Object.entries(tags).map(([index, data]) => ({ index: parseInt(index), ...data }))
      );
    }
    return { incomes, expenses, total };
  };

  const { incomes, expenses, total } = calculateTotals();

  return (
    <View style={styles.container}>
      {/* Filter Bar */}
      <View style={styles.filterBar}>
        <TextInput
          style={styles.filterInput}
          placeholder="Filter by description or amount"
          value={filterText}
          onChangeText={setFilterText}
        />
      </View>
      {/* Date Range Filter */}
      <View style={styles.dateFilterBar}>
        <TextInput
          style={styles.dateInput}
          placeholder="From Date (YYYY-MM-DD)"
          value={fromDate}
          onChangeText={setFromDate}
        />
        <TextInput
          style={styles.dateInput}
          placeholder="To Date (YYYY-MM-DD)"
          value={toDate}
          onChangeText={setToDate}
        />
      </View>
      {/* Transactions List */}
      <FlatList
        data={handleFilter()}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <TransactionRow
            transaction={item}
            onDelete={() => (!readOnly ? onDelete(item.id) : undefined)}
            onEdit={
              !readOnly
                ? () => {
                  setSelectedTransaction(item);
                  setModalVisible(true);
                }
                : undefined
            }
            readOnly={readOnly}
          />
        )}
        contentContainerStyle={{ paddingBottom: 60 }} // Add padding to avoid list content overlapping the ribbon
      />

      {/* Bottom Ribbon */}
      <View style={styles.ribbon}>
        <Text style={styles.ribbonText}>
          Total: <Text style={styles.incomeText}>{incomes.toFixed(2)}</Text>{' '}
          | <Text style={styles.expenseText}>{expenses.toFixed(2)}</Text>{' '}
          | <Text style={styles.totalText}>{total.toFixed(2)}</Text>
        </Text>
      </View>

      {/* Add Button */}
      {!readOnly && (
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => {
            setSelectedTransaction(null);
            setModalVisible(true);
          }}
        >
          <Text style={styles.addButtonText}>+</Text>
        </TouchableOpacity>
      )}

      {/* Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => {
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
  filterBar: { flexDirection: "row", padding: 10 },
  filterInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 5, borderRadius: 5 },
  addButton: { position: "absolute", bottom: 80, right: 20, backgroundColor: "#007AFF", padding: 15, borderRadius: 50 },
  addButtonText: { color: "#fff", fontSize: 24 },
  ribbon: {
    position: "absolute", // Fix it at the bottom
    bottom: 0,
    width: "100%",
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  container: {
    flex: 1,
    position: "relative", // Ensures the ribbon stays within the parent container
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
  dateFilterBar: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 10,
    marginBottom: 10,
  },
  dateInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 5,
    borderRadius: 5,
    marginHorizontal: 5,
  },
});

export default TransactionList;
