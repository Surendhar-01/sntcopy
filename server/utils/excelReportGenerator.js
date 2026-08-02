const ExcelJS = require('exceljs');

async function generateShiftExcelReport(reportData, billRows, remainingStockSummary) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sri Nikil Tradings';
  workbook.created = new Date();

  // Reusable style builders
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFFFFFFF' }
  };
  const headerFont = { color: { argb: 'FF000000' }, bold: true, size: 11 };
  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
  };

  const parseBillItems = (rawItems) => {
    if (Array.isArray(rawItems)) return rawItems;
    if (typeof rawItems === 'string') {
      try {
        const parsed = JSON.parse(rawItems || '[]');
        return Array.isArray(parsed) ? parsed : [];
      } catch {
        return [];
      }
    }
    return [];
  };

  /**
   * Sheet 1: Shift Summary
   */
  const summarySheet = workbook.addWorksheet('Shift Summary');
  summarySheet.columns = [
    { header: 'Field', key: 'field', width: 30 },
    { header: 'Value', key: 'value', width: 40 }
  ];
  
  summarySheet.getRow(1).font = headerFont;
  summarySheet.getRow(1).fill = headerFill;

  const summaryRows = [
    { field: 'Shop Name', value: 'Sri Nikil Tradings' },
    { field: 'Recipient Email', value: reportData.reportEmail || 'N/A' },
    { field: 'Shift User', value: reportData.user || 'N/A' },
    { field: 'Role', value: reportData.role || 'N/A' },
    { field: 'Shift Start', value: reportData.shiftStartDisplay || 'N/A' },
    { field: 'Shift End', value: reportData.shiftEndDisplay || 'N/A' },
    { field: 'Bills Count', value: reportData.billsCount ?? 'N/A' },
    { field: 'Total Items Sold', value: reportData.totalItemsSold ?? 'N/A' },
    { field: 'Total Sales Amount', value: `Rs ${Number(reportData.totalSalesAmount || 0).toFixed(2)}` },
    { field: 'Healthy Products', value: remainingStockSummary?.totals?.healthyCount ?? (remainingStockSummary?.totals?.healthy ?? 'N/A') },
    { field: 'Low Stock Products', value: remainingStockSummary?.totals?.lowStockCount ?? (remainingStockSummary?.totals?.lowStock ?? 'N/A') },
    { field: 'Out of Stock Products', value: remainingStockSummary?.totals?.outOfStockCount ?? (remainingStockSummary?.totals?.outOfStock ?? 'N/A') }
  ];

  summarySheet.addRows(summaryRows);
  summarySheet.eachRow((row) => {
    row.eachCell((cell) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
    });
  });

  /**
   * Sheet 2: Payment Breakdown
   */
  const paymentSheet = workbook.addWorksheet('Payment Breakdown');
  paymentSheet.columns = [
    { header: 'Payment Mode', key: 'mode', width: 25 },
    { header: 'Amount', key: 'amount', width: 25 }
  ];

  paymentSheet.getRow(1).font = headerFont;
  paymentSheet.getRow(1).fill = headerFill;

  const paymentBreakdown = reportData.paymentBreakdown || {};
  let totalPayments = 0;
  
  Object.keys(paymentBreakdown).forEach(mode => {
    const pmt = paymentBreakdown[mode];
    const amount = typeof pmt === 'object' ? (pmt.amount || 0) : Number(pmt || 0);
    totalPayments += amount;
    paymentSheet.addRow({ mode, amount });
  });

  const pmbTotalRow = paymentSheet.addRow({
    mode: 'TOTAL',
    amount: totalPayments
  });
  pmbTotalRow.font = { bold: true };

  paymentSheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: colNumber > 1 ? 'right' : 'left' };
      if(rowNumber > 1 && colNumber === 2) {
        cell.numFmt = '"Rs" #,##0.00';
      }
    });
  });

  /**
   * Sheet 3: Remaining Stock
   */
  const stockSheet = workbook.addWorksheet('Remaining Stock');
  stockSheet.columns = [
    { header: 'Name of the Product', key: 'product', width: 42 },
    { header: 'Quantity Sold', key: 'quantitySold', width: 18 },
    { header: 'Price Per Product', key: 'price', width: 20 },
    { header: 'Total Sale Value Per Product', key: 'saleValue', width: 28 },
    { header: 'Opening Stock', key: 'opening', width: 18 },
    { header: 'Receipts', key: 'receipts', width: 15 },
    { header: 'Sales', key: 'sales', width: 15 },
    { header: 'Closing Stock', key: 'closing', width: 18 }
  ];

  stockSheet.getRow(1).font = headerFont;
  stockSheet.getRow(1).fill = headerFill;

  const stockItems = remainingStockSummary?.products || [];
  stockItems.forEach(p => {
    const openingStock = Number(p.openingStock ?? (p.estimatedOpeningStock ?? 0));
    const soldInShift = Number(p.soldInShift ?? (p.sold ?? 0));
    const refilledInShift = Number(p.refilledInShift ?? (p.refilled ?? 0));
    const price = Number(p.price || 0);
    const currentStock = Number(p.currentStock ?? (openingStock - soldInShift + refilledInShift));

    stockSheet.addRow({
      product: p.name || 'N/A',
      quantitySold: soldInShift,
      price,
      saleValue: soldInShift * price,
      opening: openingStock,
      receipts: refilledInShift,
      sales: soldInShift,
      closing: currentStock
    });
  });

  stockSheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: colNumber > 1 ? 'right' : 'left' };
      if (rowNumber > 1 && [3, 4].includes(colNumber)) {
        cell.numFmt = '"Rs" #,##0.00';
      }
    });
  });

  /**
   * Sheet 4: Sales Details
   */
  const salesSheet = workbook.addWorksheet('Sales Details');
  salesSheet.columns = [
    { header: 'Bill No', key: 'billNo', width: 15 },
    { header: 'Date', key: 'date', width: 22 },
    { header: 'Customer', key: 'customer', width: 25 },
    { header: 'Phone', key: 'phone', width: 15 },
    { header: 'Payment', key: 'payment', width: 15 },
    { header: 'Items', key: 'itemsStr', width: 45 },
    { header: 'Subtotal', key: 'subtotal', width: 15 },
    { header: 'CGST', key: 'cgst', width: 12 },
    { header: 'SGST', key: 'sgst', width: 12 },
    { header: 'Grand Total', key: 'grand', width: 15 },
    { header: 'Issued By', key: 'user', width: 15 }
  ];

  salesSheet.getRow(1).font = headerFont;
  salesSheet.getRow(1).fill = headerFill;

  (billRows || []).forEach(bill => {
    const parsedItems = parseBillItems(bill.items);
    const dateStr = new Date(bill.date).toLocaleString('en-GB', { dateStyle: 'short', timeStyle: 'short' });
    
    // Group and join items. e.g "Paragon x 2, Aqua x 1"
    const itemsList = parsedItems.map(i => `${i.name} x${i.qty}`).join(', ');

    salesSheet.addRow({
      billNo: bill.billNo || 'N/A',
      date: dateStr,
      customer: bill.customer || 'N/A',
      phone: bill.phone || 'N/A',
      payment: bill.payment || 'N/A',
      itemsStr: itemsList || 'No Items',
      subtotal: Number(bill.subtotal || 0),
      cgst: Number(bill.cgst || 0),
      sgst: Number(bill.sgst || 0),
      grand: Number(bill.grand || 0),
      user: bill.by_user || reportData.user || 'N/A'
    });
  });

  salesSheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      if (rowNumber > 1 && [7, 8, 9, 10].includes(colNumber)) {
        cell.numFmt = '"Rs" #,##0.00';
      }
    });
  });

  const buffer = await workbook.xlsx.writeBuffer();
  return buffer;
}

module.exports = { generateShiftExcelReport };
