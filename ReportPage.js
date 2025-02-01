import React, { useState, useCallback  } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  ScrollView,
} from "react-native";
import TransactionList from "./TransactionList";

const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const ReportPage = ({ tags }) => {
    const [externalFilter, setExternalFilter] = useState({
      years: [],
      months: [],
      tags: [],
    });
    const [summary, setSummary] = useState({ years: [], months: [], tags: [] });

    const handleIconClick = (type, index) => {
      setExternalFilter((prev) => {
        if (prev[type].includes(index)) return prev; // Avoid redundant updates
        const updatedFilter = { ...prev };
        updatedFilter[type] = [...prev[type], index];
        return updatedFilter;
      });
    };

    const handleRemoveFilter = (type, index) => {
      setExternalFilter((prev) => {
        const updatedFilter = { ...prev };
        updatedFilter[type] = prev[type].filter((item) => item !== index);
        return updatedFilter;
      });
    };

    const handleChangeSummary = useCallback((years, months, tags) => {
        setTimeout(() => {
            const isSameSummary =
            JSON.stringify(summary.years) === JSON.stringify(years) &&
            JSON.stringify(summary.months) === JSON.stringify(months) &&
            JSON.stringify(summary.tags) === JSON.stringify(tags);

          if (!isSameSummary) {
            setSummary({ years, months, tags });
          }
        }, 0);
      }, []);

    return (
      <View style={styles.container}>
        {/* Left Pane: TransactionList */}
        <View style={styles.leftPane}>
          <TransactionList
            tags={tags}
            readOnly
            externalFilter={externalFilter}
            onChangeSummary={handleChangeSummary}
          />
        </View>

        {/* Right Pane: Filters */}
        <View style={styles.rightPane}>
          <ScrollView contentContainerStyle={styles.filterIcons}>

            {/* Years */}
            {summary.years.filter(_ => !externalFilter.years.some(et => et === _.index)).map((item) => (
              <TouchableOpacity
                key={item.index}
                style={styles.iconButton}
                onPress={() => handleIconClick("years", item.index)}
              >
                <Text style={styles.iconText}>{item.index}</Text>
              </TouchableOpacity>
            ))}

            {/* Months */}
            {summary.months.filter(_ => !externalFilter.months.some(et => et === _.index)).map((item) => (
              <TouchableOpacity
                key={item.index}
                style={styles.iconButton}
                onPress={() => handleIconClick("months", item.index)}
              >
                <Text style={styles.iconText}>{monthNames[item.index - 1]}</Text>
              </TouchableOpacity>
            ))}

            {/* Tags */}
            {summary.tags.filter(_ => !externalFilter.tags.some(et => et === _.index)).map((item) => (
              <TouchableOpacity
                key={item.index}
                style={styles.iconButton}
                onPress={() => handleIconClick("tags", item.index)}
              >
                <Text style={styles.iconText}>
                  {tags.find((tag) => tag.id === item.index)?.tagName || "Unknown"}
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
                      : type === "months" ? monthNames[index - 1] : index}
                  </Text>
                  <Text style={styles.removeText}>×</Text>
                </TouchableOpacity>
              ))
            )}
          </View>
        </View>
      </View>
    );
  };


const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: "row",
  },
  leftPane: {
    flex: 3,
    borderRightWidth: 1,
    borderColor: "#ccc",
  },
  rightPane: {
    flex: 2,
    padding: 10,
  },
  filterIcons: {
    flexGrow: 1,
    paddingBottom: 10,
  },
  filterTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  iconButton: {
    backgroundColor: "#f0f0f0",
    padding: 10,
    borderRadius: 8,
    marginBottom: 10,
    alignItems: "center",
  },
  iconText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  iconAmount: {
    fontSize: 14,
    color: "#555",
  },
  activeFilters: {
    marginTop: 20,
  },
  activeFilter: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e0e0e0",
    padding: 8,
    borderRadius: 8,
    marginBottom: 10,
  },
  activeFilterText: {
    fontSize: 16,
    flex: 1,
  },
  removeText: {
    fontSize: 18,
    color: "red",
    marginLeft: 10,
  },
});

export default ReportPage;
