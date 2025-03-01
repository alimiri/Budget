import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Bar, CartesianChart, Line } from 'victory-native';
import { Card, RadioButton } from "react-native-paper";
import Database from "../data/Database";
import { useSettings } from '../settings/SettingsContext';
import { useFont } from "@shopify/react-native-skia";

const TagReportPage = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartType, setChartType] = useState("Bar");

  const {
    periodType,
    nDays,
    firstDayOfMonth,
  } = useSettings();

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

  const getChartValues = (tagId, creditType) => {
    const _amounts = transactions.reduce((acc, t) => {
      if (!t.tags.some(tag => tag.id === tagId)) {
        return acc;
      }
      let index;
      if (creditType === "Yearly") {
        index = new Date(t.TransactionDate).getFullYear();
      } else if (creditType === "Monthly") {
        index = (new Date(t.TransactionDate).getFullYear()) * 100 + new Date(t.TransactionDate).getMonth();
      } else if (creditType === "Weekly") {
      }
      if (!acc[index]) {
        acc[index] = 0;
      }
      acc[index] += t.amount;
      return acc;
    }, {});

    const amounts = Object.keys(_amounts).map(index => ({
      x: index,
      y: _amounts[index],
    }));

    return amounts;
  }

  const getChartComponent = () => {
    if (!selectedTag) return <Text>Select a tag to view the report.</Text>;
    const { creditType } = selectedTag;
    const font = useFont(require("../../assets/Arial.ttf"), 24);
    const amounts = getChartValues(selectedTag.id, creditType);
    if (amounts.length === 0) {
      return <Text>No data available for this tag.</Text>;
    } else if (creditType === "Yearly" || creditType === "Monthly" || creditType === "Weekly") {
      return (
        <View style={{ height: 300 }}>
          <CartesianChart data={amounts} xKey="x" yKeys={["y"]}
            xAxis={{
              tickCount: 5,
              font,
              tickFormat: (value) => {
                if (creditType === "Yearly") {
                  return value;
                } else if (creditType === "Monthly") {
                  console.log(value);
                  return `${Math.floor(value / 100)}/${value % 100}`;
                } else if (creditType === "Weekly") {
                }
              }
            }}
            yAxis={[{}]}
            >
          {({ points, chartBounds }) => {
            return (chartType === "Bar" ? (
              <Bar
                points={points.y}
                chartBounds={chartBounds}
                color="red"
                roundedCorners={{ topLeft: 10, topRight: 10 }}
              />
            ) : (
              <Line points={points.y} color="red" strokeWidth={3} />
            ));
          }}
        </CartesianChart>
        </View >
      );
    } else {
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

        {/* Radio buttons for chart type selection */}
        <View style={{ marginVertical: 10 }}>
          <RadioButton.Group
            onValueChange={(value) => setChartType(value)}
            value={chartType}
          >
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <RadioButton.Item label="Bar Chart" value="Bar" />
              <RadioButton.Item label="Line Chart" value="Line" />
            </View>
          </RadioButton.Group>
        </View>

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
