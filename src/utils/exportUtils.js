import { jsPDF } from 'jspdf';
import autoTable from 'jspdf-autotable';

const parseLocalDate = (dateStr) => {
  if (!dateStr) return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  const year = parseInt(parts[0], 10);
  const month = parseInt(parts[1], 10) - 1; // 0-indexed
  const day = parseInt(parts[2], 10);
  return new Date(year, month, day);
};

export const filterTransactionsByRange = (transactions, rangeType, customStart = '', customEnd = '') => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

  return transactions.filter(t => {
    if (!t.date) return false;
    const tDate = parseLocalDate(t.date);
    if (!tDate || isNaN(tDate.getTime())) return false;

    switch (rangeType) {
      case '1m': {
        const cutoff = new Date(today);
        cutoff.setMonth(today.getMonth() - 1);
        return tDate >= cutoff && tDate <= today;
      }
      case '3m': {
        const cutoff = new Date(today);
        cutoff.setMonth(today.getMonth() - 3);
        return tDate >= cutoff && tDate <= today;
      }
      case '6m': {
        const cutoff = new Date(today);
        cutoff.setMonth(today.getMonth() - 6);
        return tDate >= cutoff && tDate <= today;
      }
      case '1y': {
        const cutoff = new Date(today);
        cutoff.setFullYear(today.getFullYear() - 1);
        return tDate >= cutoff && tDate <= today;
      }
      case 'custom': {
        const start = parseLocalDate(customStart);
        const end = parseLocalDate(customEnd);
        if (start && end) {
          return tDate >= start && tDate <= end;
        }
        if (start) {
          return tDate >= start;
        }
        if (end) {
          return tDate <= end;
        }
        return true;
      }
      case 'all':
      default:
        return true;
    }
  });
};

export const downloadCSV = (filtered, rangeType, customStart, customEnd, trackerName = '') => {
  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const headers = ['Date', 'Type', 'Category', 'Amount (INR)', 'Description'];
  const rows = sorted.map(t => [
    t.date || '',
    t.type || '',
    t.category || '',
    t.amount || 0,
    t.description || ''
  ]);

  const escapeCsv = (val) => {
    const stringVal = String(val);
    if (stringVal.includes(',') || stringVal.includes('"') || stringVal.includes('\n')) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  const csvContent = [
    headers.map(escapeCsv).join(','),
    ...rows.map(row => row.map(escapeCsv).join(','))
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const trackerSuffix = trackerName ? `_${trackerName.replace(/\s+/g, '_')}` : '';
  link.setAttribute('download', `transactions${trackerSuffix}_${rangeType}_${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

export const downloadPDF = (filtered, rangeType, customStart, customEnd, trackerName = '') => {
  // Sort by date descending
  const sorted = [...filtered].sort((a, b) => new Date(b.date) - new Date(a.date));

  const doc = new jsPDF();

  const primaryColor = [79, 70, 229]; // Indigo-600
  const secondaryColor = [107, 114, 128]; // Gray-500
  const textDark = [17, 24, 39]; // Gray-900

  // Document Title & Metadata
  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(22);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('FinSight Financial Statement', 14, 20);

  doc.setFontSize(10);
  doc.setFont('Helvetica', 'normal');
  doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 14, 27);

  // Range text
  let rangeText = 'All Transactions';
  if (rangeType === '1m') rangeText = 'Last 1 Month';
  else if (rangeType === '3m') rangeText = 'Last 3 Months';
  else if (rangeType === '6m') rangeText = 'Last 6 Months';
  else if (rangeType === '1y') rangeText = 'Last 1 Year';
  else if (rangeType === 'custom') {
    const s = customStart || 'Start';
    const e = customEnd || 'End';
    rangeText = `Custom Range (${s} to ${e})`;
  }
  const profileText = trackerName ? `Profile: ${trackerName}  |  ` : '';
  doc.text(`${profileText}Statement Period: ${rangeText}`, 14, 33);

  // Divider Line
  doc.setDrawColor(229, 231, 235);
  doc.line(14, 38, 196, 38);

  // Summary Metrics
  const incomeTotal = sorted.filter(t => t.type === 'Income').reduce((sum, t) => sum + Number(t.amount), 0);
  const expenseTotal = sorted.filter(t => t.type === 'Expense').reduce((sum, t) => sum + Number(t.amount), 0);
  const netBalance = incomeTotal - expenseTotal;

  doc.setFont('Helvetica', 'bold');
  doc.setFontSize(11);
  doc.setTextColor(textDark[0], textDark[1], textDark[2]);
  doc.text('Summary Overview', 14, 46);

  doc.setFont('Helvetica', 'normal');
  doc.setFontSize(10);
  doc.text(`Total Transactions: ${sorted.length}`, 14, 52);
  doc.text(`Total Income: INR ${incomeTotal.toFixed(2)}`, 14, 58);
  doc.text(`Total Expense: INR ${expenseTotal.toFixed(2)}`, 75, 58);
  
  // Highlight Net Balance
  doc.setFont('Helvetica', 'bold');
  if (netBalance >= 0) {
    doc.setTextColor(16, 185, 129); // Green-500
  } else {
    doc.setTextColor(239, 68, 68); // Red-500
  }
  doc.text(`Net Balance: INR ${netBalance.toFixed(2)}`, 135, 58);

  // Table Columns and Rows
  const tableColumn = ['Date', 'Type', 'Category', 'Description', 'Amount (INR)'];
  const tableRows = sorted.map(t => [
    t.date || 'N/A',
    t.type || 'N/A',
    t.category || 'N/A',
    t.description || '',
    `${t.type === 'Income' ? '+' : '-'} ${Number(t.amount).toFixed(2)}`
  ]);

  // Generate Table
  autoTable(doc, {
    startY: 66,
    head: [tableColumn],
    body: tableRows,
    theme: 'striped',
    headStyles: {
      fillColor: primaryColor,
      textColor: [255, 255, 255],
      fontSize: 10,
      fontStyle: 'bold'
    },
    bodyStyles: {
      textColor: textDark,
      fontSize: 9
    },
    alternateRowStyles: {
      fillColor: [249, 250, 251]
    },
    margin: { top: 60, left: 14, right: 14 },
    didDrawPage: (data) => {
      // Footer page numbering
      const pageCount = doc.internal.getNumberOfPages();
      doc.setFont('Helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(secondaryColor[0], secondaryColor[1], secondaryColor[2]);
      doc.text(
        `Page ${data.pageNumber} of ${pageCount}`,
        doc.internal.pageSize.width - 25,
        doc.internal.pageSize.height - 10
      );
    }
  });

  const trackerSuffix = trackerName ? `_${trackerName.replace(/\s+/g, '_')}` : '';
  doc.save(`transactions${trackerSuffix}_${rangeType}_${new Date().toISOString().split('T')[0]}.pdf`);
};
