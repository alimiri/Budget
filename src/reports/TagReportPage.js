import React, { useState, useEffect } from "react";
import { View, Text, FlatList } from "react-native";
import { Picker } from "@react-native-picker/picker";
import { Bar, CartesianChart, Line } from "victory-native";
import { Card, RadioButton } from "react-native-paper";
import Database from "../data/Database";
import { useFont } from "@shopify/react-native-skia";
import { EventRegister } from "react-native-event-listeners";
import { getChartValues } from "./chartUtils";

const TagReportPage = () => {
  const [selectedTag, setSelectedTag] = useState(null);
  const [tags, setTags] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [chartType, setChartType] = useState("Bar");

  useEffect(() => {
    setTransactions(Database.selectTransactions());
    setTags(Database.selectTags("", 1000));
  }, []);

  useEffect(() => {
    const transListener = EventRegister.addEventListener("transactionsUpdated", () => {
      console.log("Transactions updated");
      setTransactions(Database.selectTransactions());
    });

    const tagListener = EventRegister.addEventListener("tagsUpdated", () => {
      setTags(Database.selectTags("", 1000));
    });

    return () => {
      EventRegister.removeEventListener(transListener);
      EventRegister.removeEventListener(tagListener);
    };
  }, []);

  const font = useFont(require("../../assets/Arial.ttf"), 8);

  const handleTagChange = (tagId) => {
    const tag = tags.find((t) => t.id == tagId);
    if (tag) {
      setSelectedTag(tag);
    }
  };

  const getChartComponent = () => {
    if (!selectedTag) return <Text>Select a tag to view the report.</Text>;
    const { creditType } = selectedTag;

    const amounts = getChartValues(selectedTag, transactions);
    if (amounts.length === 0) {
      return <Text>No data available for this tag.</Text>;
    } else {
      return (
        <View style={{ height: 300 }}>
          <CartesianChart data={amounts} xKey="x" yKeys={["y"]} domainPadding={{ left: 50, right: 50 }}
            xAxis={{
              font,
              labelPosition: "outset",
              enableRescaling: false,
              //labelRotate: 45,
              formatXLabel: (x) => {
                if (!x || typeof x !== "string") {
                  return "";
                } else {
                  if (creditType === "Monthly") {
                    const year = x.substring(0, 4);
                    const month = x.substring(4, 6);
                    return `${year}/${month}`;
                  } else {
                    return x;
                  }
                }
              }
            }}
            yAxis={[{
              font,
            }]}
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
