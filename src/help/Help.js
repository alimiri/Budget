import React from 'react';
import { ScrollView, View, Text, StyleSheet } from 'react-native';

const HelpComponent = () => {
  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Help & Guide</Text>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Transactions</Text>
        <Text style={styles.text}>
          The Transactions screen displays all your financial transactions.
          Use the top ribbon to filter transactions by date, description, or amount.
          Click the extra filters button to filter by month, year, and tags.
        </Text>
        <Text style={styles.text}>
          At the bottom, you can see the total incomes, expenses, and the balance.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Tags</Text>
        <Text style={styles.text}>
          Each transaction can have 0 to n tags, allowing better categorization.
          Tags can be used to filter and view transactions in multiple categories.
        </Text>
        <Text style={styles.text}>
          Each tag includes a name and an icon chosen from predefined icons.
        </Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.subtitle}>Settings</Text>
        <Text style={styles.text}>
          You can manage the period of listed transactions:
        </Text>
        <Text style={styles.text}>
          - Last N Days: Displays transactions from the past N days. You can specify N in the settings.
        </Text>
        <Text style={styles.text}>
          - Monthly: Displays transactions for a month, starting from a custom day.
          You can set the first day of the month (1 to 30).
        </Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  section: {
    marginBottom: 20,
  },
  subtitle: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
  },
});

export default HelpComponent;