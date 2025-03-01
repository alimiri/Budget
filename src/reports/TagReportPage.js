import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { VictoryChart, VictoryLine, VictoryBar } from 'victory-native';
import { Card } from "react-native-paper";
import Database from "../data/Database";

const TagReportPage = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [transactions, setTransactions] = useState([]);

  useEffect(() => {
    setTransactions(Database.selectTransactions());
    setTags(Database.selectTags("", 1000));
  }, []);

  const handleTagChange = (tagId) => {
    const tag = tags.find((t) => t.id == tagId);
    if (tag) {
      setSelectedTag(tag);
    }
  };

  const getChartComponent = () => {
    if (!selectedTag) return <Text>Select a tag to view the report.</Text>;
    const { creditType } = selectedTag;
    const filteredTransactions = transactions.filter(t => t.tags.some(tag => tag.id === selectedTag.id));
    console.log("filteredTransactions", filteredTransactions);
    const amounts = filteredTransactions.map((t) => ({
      x: t.TransactionDate,
      y: t.amount,
    }));
    console.log(amounts);
    console.log(creditType);
    switch (creditType) {
      case "Yearly":
        return <VictoryChart><VictoryBar data={amounts} style={{ height: 200 }} /></VictoryChart>;
      case "Monthly":
        return (
          <VictoryChart>
            <VictoryLine
              data={amounts}
              style={{ data: { stroke: "red", strokeWidth: 3 } }}
              animate={{ type: "timing", duration: 300 }}
            />
          </VictoryChart>
        );
      case "Weekly":
        return <VictoryBar data={amounts} style={{ height: 200 }} />;
      default:
        return <Text>No specific report available for this tag type.</Text>;
    }
  };

  return (
    <FlatList
      ListHeaderComponent={
        <View style={{ padding: 16 }}>
          <Picker selectedValue={selectedTag?.id || ""} onValueChange={handleTagChange}>
            <Picker.Item label="Select a tag" value="" enabled={false} />
            {tags.map((tag) => (
              <Picker.Item key={tag.id} label={tag.tagName} value={tag.id} />
            ))}
          </Picker>

          {selectedTag && (
            <Card style={{ padding: 10, marginVertical: 10 }}>
              <Text>Tag: {selectedTag.tagName}</Text>
              <Text>Credit Type: {selectedTag.creditType}</Text>
            </Card>
          )}

          {getChartComponent()}
        </View>
      }
      data={transactions.filter((t) => t.tags.includes(selectedTag?.id))}
      keyExtractor={(item) => item.id.toString()}
      renderItem={({ item }) => (
        <Card style={{ padding: 10, marginVertical: 5 }}>
          <Text>{item.description} - ${item.amount}</Text>
        </Card>
      )}
    />
  );
};

export default TagReportPage;
