/**
 * Utility functions for processing conservation program data
 */

/**
 * Parse currency string to number
 */
export const parseCurrency = (value) => {
  if (!value || value === '') return 0;
  const cleaned = value.toString().replace(/[$,]/g, '');
  const num = parseFloat(cleaned);
  return isNaN(num) ? 0 : num;
};

/**
 * Parse date with flexible format handling
 */
export const parseDate = (dateStr) => {
  if (!dateStr) return null;

  // Handle malformed dates
  try {
    const date = new Date(dateStr);
    if (date.getFullYear() < 2018 || date.getFullYear() > 2026) {
      return null;
    }
    return date;
  } catch {
    return null;
  }
};

/**
 * Clean and process the CSV data
 */
export const processData = (rawData) => {
  return rawData.map(row => {
    // Handle both DATE and PAID_DATE columns (different CSV formats)
    const dateValue = row.PAID_DATE || row.DATE;
    const parsedDate = parseDate(dateValue);

    // Use START date if no payment date (for unpaid practices)
    const displayDate = parsedDate || parseDate(row.START);

    return {
      ...row,
      // Parse financial data
      date: displayDate,
      amount319: parseCurrency(row['319_AMOUNT']),
      amountCWSRF: parseCurrency(row['CWSRF-WQ_AMOUNT']),
      amountLocal: parseCurrency(row.LOCAL_AMOUNT),
      totalAmount: parseCurrency(row.TOTAL_AMOUNT),

      // Parse numeric fields
      acres: parseFloat(row.ACRES) || 0,
      redN: parseFloat(row.RED_N) || 0,
      redP: parseFloat(row.RED_P) || 0,
      redS: parseFloat(row.RED_S) || 0,
      lat: parseFloat(row.LAT) || 0,
      long: parseFloat(row.LONG) || 0,

      // Parse dates
      startDate: parseDate(row.START),
      endDate: parseDate(row.END),
      paidDate: parsedDate,

      // Clean text fields
      farm: row.FARM || 'Unknown',
      city: row.CITY || 'Unknown',
      bmp: (row.BMP || 'Unknown').trim(),
      firstName: row.NAME_FIRST || '',
      lastName: row.NAME_LAST || '',
      segment: row.SEG || '',

      // Flag markers
      hasFlag: row.FLAG === '*',
      hasMissingData: row.RED_N === '*' || row.RED_P === '*' || row.RED_S === '*',
    };
  }).filter(row => {
    // Filter out rows with no meaningful data
    return row.date !== null && row.bmp !== 'Unknown' && row.farm !== 'Unknown';
  });
};

/**
 * Calculate summary statistics
 */
export const calculateStats = (data) => {
  const validData = data.filter(d => d.totalAmount > 0);

  return {
    totalFarms: new Set(data.map(d => d.farm)).size,
    totalProducers: new Set(data.map(d => `${d.lastName},${d.firstName}`)).size,
    totalContracts: data.length,
    totalAcres: data.reduce((sum, d) => sum + d.acres, 0),

    // Funding totals
    total319Funding: data.reduce((sum, d) => sum + d.amount319, 0),
    totalCWSRFFunding: data.reduce((sum, d) => sum + d.amountCWSRF, 0),
    totalLocalFunding: data.reduce((sum, d) => sum + d.amountLocal, 0),
    totalAllFunding: data.reduce((sum, d) => sum + d.totalAmount, 0),

    // Environmental impact (excluding missing data)
    totalNReduction: data.filter(d => !d.hasMissingData).reduce((sum, d) => sum + d.redN, 0),
    totalPReduction: data.filter(d => !d.hasMissingData).reduce((sum, d) => sum + d.redP, 0),
    totalSReduction: data.filter(d => !d.hasMissingData).reduce((sum, d) => sum + d.redS, 0),

    // BMP breakdown
    bmpCounts: data.reduce((acc, d) => {
      acc[d.bmp] = (acc[d.bmp] || 0) + 1;
      return acc;
    }, {}),

    // Year breakdown
    yearData: data.reduce((acc, d) => {
      if (d.date) {
        const year = d.date.getFullYear();
        if (!acc[year]) {
          acc[year] = { contracts: 0, funding: 0, acres: 0 };
        }
        acc[year].contracts += 1;
        acc[year].funding += d.totalAmount;
        acc[year].acres += d.acres;
      }
      return acc;
    }, {}),
  };
};

/**
 * Group data by BMP for charts
 */
export const groupByBMP = (data) => {
  const grouped = data.reduce((acc, row) => {
    const bmp = row.bmp;
    if (!acc[bmp]) {
      acc[bmp] = {
        name: bmp,
        count: 0,
        totalFunding: 0,
        totalAcres: 0,
        totalNReduction: 0,
        totalPReduction: 0,
        totalSReduction: 0,
      };
    }
    acc[bmp].count += 1;
    acc[bmp].totalFunding += row.totalAmount;
    acc[bmp].totalAcres += row.acres;
    if (!row.hasMissingData) {
      acc[bmp].totalNReduction += row.redN;
      acc[bmp].totalPReduction += row.redP;
      acc[bmp].totalSReduction += row.redS;
    }
    return acc;
  }, {});

  return Object.values(grouped).sort((a, b) => b.count - a.count);
};

/**
 * Format currency for display
 */
export const formatCurrency = (value) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

/**
 * Format large numbers with commas
 */
export const formatNumber = (value) => {
  return new Intl.NumberFormat('en-US').format(Math.round(value));
};
