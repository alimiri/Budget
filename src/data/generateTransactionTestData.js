const fs = require('fs');

const generateRandomDate = (start, end) => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

const generateRandomAmount = () => {
  return (Math.random() * 1000).toFixed(2);
};

const tagsList = [
    { id: 1, tagName: "Work", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 2, tagName: "Personal", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 3, tagName: "Urgent", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 4, tagName: "Mock", icon: "", creditType: "None", creditAmount: null, startDay: null }
];

const generateRandomTags = () => {
    const tags = new Set();
    const numberOfTags = Math.floor(Math.random() * 2) + 1; // 1 or 2 tags
    while (tags.size < numberOfTags) {
        const randomTag = tagsList[Math.floor(Math.random() * tagsList.length)];
        tags.add(randomTag);
    }
    return Array.from(tags);
};

const descriptions = ["Groceries", "Utilities", "Rent", "Dining Out", "Entertainment", "Travel", "Health", "Education", "Shopping", "Miscellaneous"];

const transactions = [];

for (let i = 1; i <= 100; i++) {
  const transaction = {
    id: i,
    TransactionDate: generateRandomDate(new Date(2022, 0, 1), new Date(2025, 2, 1)).toISOString(),
    description: descriptions[Math.floor(Math.random() * descriptions.length)],
    amount: Number(generateRandomAmount()),
    tags: generateRandomTags()
  };
  transactions.push(transaction);
}

fs.writeFileSync('src/data/transactionTestData.json', JSON.stringify(transactions, null, 2));
console.log('transactionTestData.json has been generated.');