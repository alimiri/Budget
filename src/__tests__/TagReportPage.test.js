import { getChartValues } from '../reports/chartUtils';
const transactionTestData = require('../data/transactionTestData.json');
import { CREDIT_TYPES } from '../constants/creditTypes';

describe('getChartValues', () => {
  const tags = [
    { id: 1, creditType: CREDIT_TYPES.Yearly, startDay: 2 },
    { id: 2, creditType: CREDIT_TYPES.Monthly, startDay: 2 },
    { id: 3, creditType: CREDIT_TYPES.Weekly, startDay: 2 },
    { id: 4, creditType: CREDIT_TYPES.NoPeriod, startDay: 2 }
  ];

  test('should calculate yearly chart values correctly', () => {
    const tag = tags.find(t => t.creditType === CREDIT_TYPES.Yearly);
    const result = getChartValues(tag, transactionTestData);
    expect(result).toEqual([
      { x: '2022', y: 7366.219999999999 },
      { x: '2023', y: 6209.900000000001 },
      { x: '2024', y: 5694.909999999999 },
      { x: "2025", y: 236.76 },
    ]);
  });

  test('should calculate monthly chart values correctly', () => {
    const tag = tags.find(t => t.creditType === CREDIT_TYPES.Monthly);
    const result = getChartValues(tag, transactionTestData);
    expect(result).toEqual([
      { x: "202202", y: 2152.4300000000003 },
      { x: "202205", y: 389.75 },
      { x: "202208", y: 1646.37 },
      { x: "202210", y: 2053.33 },
      { x: "202302", y: 130.34 },
      { x: "202303", y: 514.99 },
      { x: "202304", y: 438.81 },
      { x: "202305", y: 194.9 },
      { x: "202307", y: 427.59 },
      { x: "202310", y: 1680.61 },
      { x: "202312", y: 724.69 },
      { x: "202404", y: 1227.87 },
      { x: "202406", y: 806.46 },
      { x: "202407", y: 40.5 },
      { x: "202408", y: 516.74 },
      { x: "202409", y: 441.51 },
      { x: "202410", y: 314.56 },
      { x: "202411", y: 521.86 },
      { x: "202501", y: 716.2 },
      { x: "202502", y: 469.46 }
    ]);
  });

  test('should calculate weekly chart values correctly', () => {
    const tag = tags.find(t => t.creditType === CREDIT_TYPES.Weekly);
    const result = getChartValues(tag, transactionTestData);
    expect(result).toEqual([
      { x: '202203', y: 850.4699999999999 },
      { x: '202204', y: 486.95 },
      { x: '202212', y: 845.6899999999999 },
      { x: '202215', y: 765.24 },
      { x: '202219', y: 556.71 },
      { x: '202223', y: 296.4 },
      { x: '202224', y: 275.15 },
      { x: '202229', y: 485.64 },
      { x: '202236', y: 729 },
      { x: '202242', y: 790.09 },
      { x: '202243', y: 5.81 },
      { x: '202311', y: 605.08 },
      { x: '202315', y: 479.48 },
      { x: '202326', y: 430.71999999999997 },
      { x: '202329', y: 330.8 },
      { x: '202334', y: 334.48 },
      { x: '202336', y: 444.91 },
      { x: '202345', y: 1036.1599999999999 },
      { x: '202349', y: 945.59 },
      { x: '202414', y: 415.41 },
      { x: '202416', y: 309.65 },
      { x: '202418', y: 640.85 },
      { x: '202422', y: 520.03 },
      { x: '202423', y: 851.46 },
      { x: '202426', y: 680.8 },
      { x: '202428', y: 276.58 },
      { x: '202429', y: 40.5 },
      { x: '202442', y: 690.64 },
      { x: '202443', y: 314.56 },
      { x: '202503', y: 924.03 },
      { x: '202507', y: 241.18 }
    ]);
  });

  test('should calculate daily chart values correctly', () => {
    const tag = tags.find(t => t.creditType === CREDIT_TYPES.NoPeriod);
    const result = getChartValues(tag, transactionTestData);
    expect(result).toEqual([
      { x: '2022-01-22', y: 793.05 },
      { x: '2022-01-27', y: 486.95 },
      { x: '2022-01-28', y: 653.24 },
      { x: '2022-02-09', y: 19.53 },
      { x: '2022-03-23', y: 10.67 },
      { x: '2022-04-14', y: 765.24 },
      { x: '2022-07-04', y: 719.95 },
      { x: '2022-09-16', y: 211.28 },
      { x: '2022-10-16', y: 524.38 },
      { x: '2022-10-19', y: 489.62 },
      { x: '2022-10-20', y: 1039.33 },
      { x: '2022-10-21', y: 790.09 },
      { x: '2022-10-31', y: 5.81 },
      { x: '2022-11-02', y: 831.02 },
      { x: '2022-11-29', y: 829.62 },
      { x: '2022-12-19', y: 427.23 },
      { x: '2023-02-20', y: 80.42 },
      { x: '2023-03-31', y: 652.66 },
      { x: '2023-07-24', y: 330.8 },
      { x: '2023-07-30', y: 994.66 },
      { x: '2023-08-23', y: 334.48 },
      { x: '2023-10-04', y: 597.94 },
      { x: '2023-10-07', y: 677.24 },
      { x: '2023-10-22', y: 545.97 },
      { x: '2023-12-06', y: 73.55 },
      { x: '2023-12-07', y: 574.78 },
      { x: '2024-04-06', y: 415.41 },
      { x: '2024-04-25', y: 587.02 },
      { x: '2024-08-08', y: 985.1 },
      { x: '2024-09-08', y: 448.68 },
      { x: '2024-10-20', y: 690.64 },
      { x: '2024-10-29', y: 211.93 },
      { x: '2024-11-19', y: 398.34 },
      { x: '2025-01-18', y: 716.2 },
      { x: '2025-02-21', y: 313.78 },
      { x: '2025-02-26', y: 232.7 }
    ]);
  });
});