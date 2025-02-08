import React, { useState, useEffect } from "react";
import {
  View,
  FlatList,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Animated,
} from "react-native";
import TransactionRow from "./TransactionRow";
import TransactionModal from "./TransactionModal";
import Database from "./Database";
import IconDisplay from "./IconDisplay";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const TransactionList = ({ tags, readOnly = false }) => {
  const [transactions, setTransactions] = useState([]);
  const [filterText, setFilterText] = useState("");
  const [fromDate, setFromDate] = useState(null);
  const [toDate, setToDate] = useState(null);
  const [externalFilter, setExternalFilter] = useState({ years: [], months: [], tags: [] });
  const [summary, setSummary] = useState({ years: [], months: [], tags: [] });
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedTransaction, setSelectedTransaction] = useState(null);
  const [filterVisible, setFilterVisible] = useState(false);


  const [totals, setTotals] = useState({ incomes: 0, expenses: 0 });
  const filterWidthAnim = useState(new Animated.Value(0))[0]; // Initial filter width (0% when hidden)

  useEffect(() => {
    setTransactions(Database.selectTransactions());
  }, []);

  useEffect(() => {
    calculateTotals();
  }, [transactions]); // Recalculate when transactions change

  const toggleFilterPanel = () => {
    setFilterVisible((prevState) => {
      const newState = !prevState; // Toggle state before starting animation
      Animated.parallel([
        Animated.timing(filterWidthAnim, {
          toValue: newState ? 0.3 : 0, // Animate width to 30% if visible, 0% if hidden
          duration: 300,
          useNativeDriver: false,
        })
      ]).start();
      return newState;
    });
  };

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

  const handleRemoveFilter = (type, index) => {
    setExternalFilter((prev) => {
      const updatedFilter = { ...prev };
      updatedFilter[type] = prev[type].filter((item) => item !== index);
      return updatedFilter;
    });
  };

  const handleFilter = () => {
    return transactions.filter((transaction) => {
      const matchesText = transaction.description.toLowerCase().includes(filterText.toLowerCase()) || transaction.amount.toString().includes(filterText);
      const matchesFromDate = !fromDate || new Date(transaction.TransactionDate) >= new Date(fromDate);
      const matchesToDate = !toDate || new Date(transaction.TransactionDate) <= new Date(toDate);
      const matchesYear = externalFilter.years.length === 0 || externalFilter.years.includes(new Date(transaction.TransactionDate).getFullYear());
      const matchesMonth = externalFilter.months.length === 0 || externalFilter.months.includes(new Date(transaction.TransactionDate).getMonth());
      const matchesTags = externalFilter.tags.length === 0 || transaction.tags.some((tag) => externalFilter.tags.includes(tag.id));
      return matchesText && matchesFromDate && matchesToDate && matchesYear && matchesMonth && matchesTags;
    });
  };

  const calculateTotals = () => {
    const filteredTransactions = handleFilter();

    const incomes = filteredTransactions.filter((transaction) => transaction.amount > 0).reduce((sum, transaction) => sum + transaction.amount, 0);
    const expenses = filteredTransactions.filter((transaction) => transaction.amount < 0).reduce((sum, transaction) => sum + transaction.amount, 0);
    setTotals({ incomes, expenses });

    const years = new Set();
    const months = new Set();
    const tags = new Set();
    transactions.forEach(transaction => {
      const year = new Date(transaction.TransactionDate).getFullYear();
      const month = new Date(transaction.TransactionDate).getMonth();

      years.add(year);
      months.add(month);
      if (transaction.tags && Array.isArray(transaction.tags)) {
        transaction.tags.forEach((tag) => tags.add(tag.id));
      }
    });

    setSummary({
      years: Array.from(years),
      months: Array.from(months),
      tags: Array.from(tags)
    });
  };
  return (
    <View style={styles.container}>
      <View style={styles.topSection}>
        <Animated.View
          style={[styles.transactionList]}
        >
          <View style={styles.header}>
            <TextInput
              style={styles.filterInput}
              placeholder="Filter by description or amount"
              value={filterText}
              onChangeText={setFilterText}
            />
            <TouchableOpacity style={styles.filterButton} onPress={toggleFilterPanel}>
              <IconDisplay library='MaterialCommunityIcons' icon='filter-outline' size={24} color={filterVisible ? "#555" : "#000"} />
            </TouchableOpacity>
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
                onDelete={() => !readOnly && onDelete(item.id)}
                onEdit={() => !readOnly && (setSelectedTransaction(item) || setModalVisible(true))}
                readOnly={readOnly}
              />
            )}
            contentContainerStyle={{ paddingBottom: 60 }} // Add padding to avoid list content overlapping the ribbon
          />
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
        </Animated.View>

        <Animated.View
          style={[styles.filterPanel, {
            width: filterWidthAnim.interpolate({
              inputRange: [0, 1],
              outputRange: ['0%', '100%'], // For smoother transition between 0% and 100%
            }),

          }]}>
          <ScrollView>
            {/* Year Filters */}
            {summary.years.filter(_ => !externalFilter.years.some(et => et === _)).map((year) => (
              <TouchableOpacity key={year} style={styles.iconButton} onPress={() => setExternalFilter((prev) => ({ ...prev, years: [...prev.years, year] }))}>
                <Text>{year}</Text>
              </TouchableOpacity>
            ))}

            {/* Month Filters */}
            {summary.months.filter(_ => !externalFilter.months.some(et => et === _)).map((month) => (
              <TouchableOpacity key={month} style={styles.iconButton} onPress={() => setExternalFilter((prev) => ({ ...prev, months: [...prev.months, month] }))}>
                <Text>{monthNames[month]}</Text>
              </TouchableOpacity>
            ))}

            {/* Tags */}
            {summary.tags.filter(_ => !externalFilter.tags.some(et => et === _)).map((tag) => (
              <TouchableOpacity key={tag} style={styles.iconButton} onPress={() => setExternalFilter((prev) => ({ ...prev, tags: [...prev.tags, tag] }))}>
                <Text style={styles.iconText}>
                  {tags.find((_) => _.id === tag)?.tagName || "Unknown"}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          <View style={styles.activeFilters}>
            <Text style={styles.filterTitle}>Active Filters</Text>
            {["years", "months", "tags"].map((type) =>
              externalFilter[type].map((index) => (
                <TouchableOpacity
                  key={index}
                  style={styles.activeFilter}
                  onPress={() => handleRemoveFilter(type, index)}
                >
                  <Text style={styles.activeFilterText}>
                    {type === "tags"
                      ? tags.find((tag) => tag.id === index)?.tagName || "Unknown"
                      : type === "months"
                        ? monthNames[index]
                        : index}
                  </Text>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </Animated.View>
      </View>

      <View style={styles.ribbon}>
        <Text style={styles.ribbonText}>
          Total: <Text style={styles.incomeText}>{(totals.incomes ?? 0).toFixed(2)}</Text>{' '}
          | <Text style={styles.expenseText}>{(totals.expenses ?? 0).toFixed(2)}</Text>{' '}
          | <Text style={styles.totalText}>{((totals.incomes ?? 0) + (totals.expenses ?? 0)).toFixed(2)}</Text>
        </Text>
      </View>



      {/* Transaction Modal */}
      <TransactionModal
        visible={modalVisible}
        onClose={() => setModalVisible(false)}
        onSave={(data) => {
          if (selectedTransaction) {
            onUpdate(selectedTransaction.id, data);
          } else {
            onAdd(data);
          }
          setModalVisible(false);
        }}
        tags={tags}
        transaction={selectedTransaction}
        onTagChanged={onTagChanged}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "column", // Stacks top and bottom sections
  },
  topSection: {
    flex: 1, // Takes up all available space
    flexDirection: "row", // Transaction list & filter panel side by side
  },
  transactionList: {
    flex: 1,
    padding: 10,
    position: "relative",
  },
  filterPanel: {
    backgroundColor: "#f8f9fa",
    padding: 10,
    borderLeftWidth: 1,
    borderColor: "#ccc",
  },
  ribbon: {
    height: 60, // Fixed height for summary panel
    backgroundColor: "#f8f9fa",
    paddingVertical: 10,
    borderTopWidth: 1,
    borderColor: "#ccc",
    justifyContent: "center",
    alignItems: "center",
  },
  ribbonText: {
    fontSize: 16,
    color: "#333",
  },
  incomeText: {
    color: "green",
    fontWeight: "bold",
  },
  expenseText: {
    color: "red",
    fontWeight: "bold",
  },
  totalText: {
    color: "blue",
    fontWeight: "bold",
  },
  header: { flexDirection: "row", alignItems: "center", padding: 10 },
  filterInput: { flex: 1, borderWidth: 1, borderColor: "#ccc", padding: 5, borderRadius: 5 },
  filterButton: { padding: 10, backgroundColor: "#007AFF", borderRadius: 5, marginLeft: 10 },
  filterButtonText: { color: "white" },
  addButton: {
    position: "absolute",
    bottom: 20, // Keeps it above the ribbon
    right: 20, // Aligns to the right
    backgroundColor: "#007bff",
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
    elevation: 5, // For Android shadow
    shadowColor: "#000", // For iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  addButtonText: {
    fontSize: 24,
    color: "#fff",
    fontWeight: "bold",
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
  iconButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
});

export default TransactionList;
