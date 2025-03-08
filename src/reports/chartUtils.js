export const getChartValues = (tag, transactions) => {
    if (!tag || !transactions) return [];

    const { id: tagId, creditType, startDay } = tag;

    const _amounts = transactions.reduce((acc, t) => {
      if (!t.tags.some(tag => tag.id === tagId)) {
        return acc;
      }

      let index;
      const transactionDate = new Date(t.TransactionDate);
      const year = transactionDate.getFullYear();

      if (creditType === "Yearly") {
        index = year;
      } else if (creditType === "Monthly") {
        let month = transactionDate.getMonth() + 1;

        if (transactionDate.getDate() < startDay) {
          month -= 1;
          if (month === 0) {
            month = 12;
            year -= 1;
          }
        }

        index = year * 100 + month;
      } else if (creditType === "Weekly") {
        // Determine the day of the week (0 = Sunday, 6 = Saturday)
        const transactionDayOfWeek = transactionDate.getDay();

        // Find the difference between transaction day and start day
        let daysToStart = (transactionDayOfWeek - startDay + 7) % 7;

        // Get the start of the week (move `daysToStart` days back)
        const weekStartDate = new Date(transactionDate);
        weekStartDate.setDate(transactionDate.getDate() - daysToStart);

        // Compute the week number (YYYYWW)
        const weekYear = weekStartDate.getFullYear();
        const weekNumber = Math.ceil(
          ((weekStartDate - new Date(weekYear, 0, 1)) / 86400000 + 1) / 7
        );

        index = weekYear * 100 + weekNumber;
      } else {
        index = transactionDate.toISOString().split('T')[0]; // Use full date
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
    })).sort((a, b) => a.x > b.x ? 1: a.x < b.x ? -1 : 0);

    return amounts;
  };
