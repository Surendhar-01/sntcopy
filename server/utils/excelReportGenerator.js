const ExcelJS = require('exceljs');

async function generateShiftExcelReport(reportData, billRows, remainingStockSummary) {
  const workbook = new ExcelJS.Workbook();
  workbook.creator = 'Sri Nikil Tradings';
  workbook.created = new Date();

  // Reusable style builders
  const headerFill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FF324F86' } // Match company color
  };
  const headerFont = { color: { argb: 'FFFFFFFF' }, bold: true, size: 12 };
  const borderStyle = {
    top: { style: 'thin' },
    left: { style: 'thin' },
    bottom: { style: 'thin' },
    right: { style: 'thin' }
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
    { header: 'Product', key: 'product', width: 40 },
    { header: 'Category', key: 'category', width: 20 },
    { header: 'Unit', key: 'unit', width: 15 },
    { header: 'Price', key: 'price', width: 15 },
    { header: 'Opening Stock', key: 'opening', width: 20 },
    { header: 'Sales', key: 'sold', width: 15 },
    { header: 'Purchases', key: 'refilled', width: 20 },
    { header: 'Total Stock', key: 'total', width: 20 },
    { header: 'Closing Stock', key: 'current', width: 15 },
    { header: 'Status', key: 'status', width: 20 }
  ];

  stockSheet.getRow(1).font = headerFont;
  stockSheet.getRow(1).fill = headerFill;

  const stockItems = remainingStockSummary?.products || [];
  stockItems.forEach(p => {
    // Current stock calculations (Opening - sold + refilled)
    const openingStock = Number(p.openingStock ?? (p.estimatedOpeningStock ?? 0));
    const soldInShift = Number(p.soldInShift ?? (p.sold ?? 0));
    const refilledInShift = Number(p.refilledInShift ?? (p.refilled ?? 0));
    const currentStock = openingStock - soldInShift + refilledInShift;
    
    let status = 'Healthy';
    if (currentStock === 0) {
      status = 'Out of Stock';
    } else if (currentStock <= 5) {
      status = 'Low Stock';
    }

    const row = stockSheet.addRow({
      product: p.name || 'N/A',
      category: p.category || p.cat || 'N/A',
      unit: p.unit || 'N/A',
      price: Number(p.price || 0),
      opening: openingStock,
      sold: soldInShift,
      refilled: refilledInShift,
      total: null,
      current: null,
      status: status
    });

    const targetRowNumber = row.number;
    row.getCell('total').value = {
      formula: `=E${targetRowNumber}+G${targetRowNumber}`,
      result: openingStock + refilledInShift
    };
    row.getCell('current').value = {
      formula: `=H${targetRowNumber}-F${targetRowNumber}`,
      result: currentStock
    };

    const statusCell = row.getCell('status');
    if (status === 'Low Stock') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFE066' } };
      statusCell.font = { color: { argb: 'FF9C5700' }, bold: true };
    } else if (status === 'Out of Stock') {
      statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFFB3B3' } };
      statusCell.font = { color: { argb: 'FFA80000' }, bold: true };
    } else {
      statusCell.font = { color: { argb: 'FF008000' }, bold: true };
    }
  });

  stockSheet.eachRow((row, rowNumber) => {
    row.eachCell((cell, colNumber) => {
      cell.border = borderStyle;
      cell.alignment = { vertical: 'middle', horizontal: 'left' };
      if (rowNumber > 1 && colNumber === 4) {
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
    const parsedItems = typeof bill.items === 'string' ? JSON.parse(bill.items || '[]') : (bill.items || []);
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
