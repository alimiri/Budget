import generateMockDataUtil  from './generateMockDataUtil.js';
const fs = require('fs');

const tagsList = [
    { id: 1, tagName: "Work", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 2, tagName: "Personal", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 3, tagName: "Urgent", icon: "", creditType: "None", creditAmount: null, startDay: null },
    { id: 4, tagName: "Mock", icon: "", creditType: "None", creditAmount: null, startDay: null }
];

const transactions = generateMockDataUtil(new Date(2022, 0, 1), new Date(2025, 2, 1), 100, tagsList);

fs.writeFileSync('src/data/transactionTestData.json', JSON.stringify(transactions, null, 2));
console.log('transactionTestData.json has been generated.');