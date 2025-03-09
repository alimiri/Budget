export default function generateMockDataUtil(startDate, endDate, nItem, tagsList) {
    const generateRandomDate = (start, end) => {
        return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
    };

    const generateRandomAmount = () => {
        return (Math.random() * 1000).toFixed(2);
    };

    const generateRandomTags = (tagsList) => {
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

    for (let i = 1; i <= nItem; i++) {
        const transaction = {
            id: i,
            TransactionDate: generateRandomDate(startDate, endDate).toISOString(),
            description: descriptions[Math.floor(Math.random() * descriptions.length)],
            amount: Number(generateRandomAmount()),
            tags: generateRandomTags(tagsList)
        };
        transactions.push(transaction);
    }

    return transactions;
}