import { Download } from "lucide-react";
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

export default function ExportPDFButton({ transactions, selectedMonth, selectedYear, months }) {
  
  const handleExportPDF = () => {
    // 1. Calculate Summary Math
    const totalIncome = transactions
      .filter(tx => tx.type === 'income')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
    const totalExpense = transactions
      .filter(tx => tx.type === 'expense')
      .reduce((sum, tx) => sum + parseFloat(tx.amount || 0), 0);
      
    const netFlow = totalIncome - totalExpense;

    // 2. Initialize new PDF document (Portrait, millimeters, A4 size)
    const doc = new jsPDF('p', 'mm', 'a4');
    
    // Set Document Properties
    doc.setProperties({
      title: `Financial Report - ${months[selectedMonth]} ${selectedYear}`,
      subject: 'Monthly Financial Summary',
      author: 'Finance Tracker Dashboard',
    });

    // 3. Draw Header Title
    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(40, 40, 40);
    doc.text(`Financial Report`, 14, 20);

    doc.setFontSize(14);
    doc.setTextColor(100, 100, 100);
    doc.text(`${months[selectedMonth]} ${selectedYear}`, 14, 28);

    // 4. Draw Summary Block (Totals)
    doc.setFontSize(12);
    doc.setTextColor(60, 60, 60);
    
    // Income Box text
    doc.text(`Total Income:`, 14, 45);
    doc.setTextColor(34, 197, 94); // Greenish
    doc.text(`+ Rs. ${totalIncome.toFixed(2)}`, 50, 45);

    // Expense Box text
    doc.setTextColor(60, 60, 60);
    doc.text(`Total Expense:`, 14, 52);
    doc.setTextColor(239, 68, 68); // Redish
    doc.text(`- Rs. ${totalExpense.toFixed(2)}`, 50, 52);

    // Net Balance text
    doc.setTextColor(20, 20, 20);
    doc.setFont("helvetica", "bold");
    doc.text(`Net Balance:`, 14, 62);
    doc.setTextColor(netFlow >= 0 ? 34 : 239, netFlow >= 0 ? 197 : 68, netFlow >= 0 ? 94 : 68);
    doc.text(`${netFlow >= 0 ? '+' : ''} Rs. ${netFlow.toFixed(2)}`, 50, 62);

    // Reset font to normal for table
    doc.setFont("helvetica", "normal");
    
    // 5. Build DataTable Rows
    // Map existing transactions array into an array-of-arrays for autoTable
    const tableBody = transactions.map(tx => [
      new Date(tx.date).toLocaleDateString(),
      tx.description,
      tx.category,
      tx.type.charAt(0).toUpperCase() + tx.type.slice(1), // Capitalize first letter
      `${tx.type === 'income' ? '+' : '-'} Rs. ${parseFloat(tx.amount).toFixed(2)}`
    ]);

    // Draw the Transactions Table
    autoTable(doc, {
      startY: 75,
      head: [['Date', 'Description', 'Category', 'Type', 'Amount']],
      body: tableBody,
      headStyles: {
        fillColor: [147, 51, 234], // Purple-600 to match Dashboard theme
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      columnStyles: {
        4: { halign: 'right', fontStyle: 'bold' } // Right align the Amount column
      },
      margin: { top: 75, right: 14, bottom: 20, left: 14 },
      didParseCell: function(data) {
        // Color code the 'Amount' column dynamically based on Type
        if (data.section === 'body' && data.column.index === 4) {
          const type = tableBody[data.row.index][3]; // Check the 'Type' column string
          if (type === 'Income') {
            data.cell.styles.textColor = [21, 128, 61]; // Dark Green
          } else {
            data.cell.styles.textColor = [185, 28, 28]; // Dark Red
          }
        }
      }
    });

    // 6. Trigger Download natively in browser
    doc.save(`Financial_Report_${months[selectedMonth]}_${selectedYear}.pdf`);
  };

  return (
    <button 
      onClick={handleExportPDF}
      className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white px-4 py-2 rounded-xl transition-all shadow-lg hover:shadow-purple-500/25 font-medium text-sm"
      title={`Download ${months[selectedMonth]} ${selectedYear} Report as PDF`}
    >
      <Download size={18} />
      <span>Monthly Report Download</span>
    </button>
  );
}
