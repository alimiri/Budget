import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';

export default () => {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>How to Play Mastermind</Text>

      <Text style={styles.section}>🎯 Objective</Text>
      <Text style={styles.text}>
        The goal of the game is to guess the secret code (a sequence of numbers).
      </Text>

      <Text style={styles.section}>📋 Rules</Text>
      <Text style={styles.text}>
        1. Enter your guesses in the active row.
        {'\n'}2. Use the popup to select numbers.
        {'\n'}3. Feedback will be provided after each guess:
      </Text>
      <Text style={styles.text}>
        - **Exact**: The number and its position are correct.
        {'\n'}- **Correct**: The number is correct but the position is wrong.
      </Text>

      <Text style={styles.section}>💡 Tips</Text>
      <Text style={styles.text}>
        - Start with random guesses to gather initial clues.
        {'\n'}- Use feedback to systematically narrow down the possibilities.
      </Text>

      <Text style={styles.section}>🚀 Enjoy the Game!</Text>
      <Text style={styles.text}>
        Mastermind is a game of logic and deduction. Have fun while honing your problem-solving skills!
      </Text>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#007AFF',
    textAlign: 'center',
  },
  section: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 20,
    marginBottom: 10,
    color: '#333',
  },
  text: {
    fontSize: 16,
    lineHeight: 24,
    color: '#555',
  },
});
