import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

// Check if we're on the client side
const isClient = typeof window !== "undefined"

// Export to Excel
export const exportToExcel = (data: any[], filename = "data.xlsx") => {
  if (!isClient) {
    console.warn("Excel export can only be used on the client side")
    return
  }

  try {
    if (!data || data.length === 0) {
      throw new Error("No data to export")
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, "Sheet1")

    // Set column widths for better formatting
    const cols = Object.keys(data[0] || {}).map(() => ({ wch: 20 }))
    worksheet["!cols"] = cols

    XLSX.writeFile(workbook, filename)
  } catch (err) {
    console.error("Excel Export Failed:", err)
    throw new Error("Failed to export to Excel. Please try again.")
  }
}

// Export to CSV
export const exportToCSV = (data: any[], filename = "data.csv") => {
  if (!isClient) {
    console.warn("CSV export can only be used on the client side")
    return
  }

  try {
    if (!data || data.length === 0) {
      throw new Error("No data to export")
    }

    const worksheet = XLSX.utils.json_to_sheet(data)
    const csv = XLSX.utils.sheet_to_csv(worksheet)

    // Create blob with UTF-8 BOM for proper encoding
    const BOM = "\uFEFF"
    const blob = new Blob([BOM + csv], { type: "text/csv;charset=utf-8;" })

    const link = document.createElement("a")
    const url = URL.createObjectURL(blob)
    link.setAttribute("href", url)
    link.setAttribute("download", filename)
    link.style.visibility = "hidden"
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)

    // Clean up the URL object
    URL.revokeObjectURL(url)
  } catch (err) {
    console.error("CSV Export Failed:", err)
    throw new Error("Failed to export to CSV. Please try again.")
  }
}

export const exportDashboardPDF = (
  transactions: any[],
  users: any[],
  notes: any[],
  formatFn?: (amount: number) => string
) => {
  try {
    const doc = new jsPDF()

    doc.setFillColor(0, 0, 0)
    doc.rect(0, 0, 210, 30, "F")

    doc.setTextColor(204, 255, 0)
    doc.setFontSize(22)
    doc.text("Expense Tracker Report", 14, 18)

    doc.setTextColor(255, 255, 255)
    doc.setFontSize(10)
    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, 25)

    const totalExpenses = transactions.reduce(
      (sum, t) => sum + t.amount,
      0
    )

    const activeUsers = users.filter((u) => u.isActive).length

    doc.setTextColor(0, 0, 0)

    doc.setFontSize(16)
    doc.text("Dashboard Summary", 14, 42)

    autoTable(doc, {
      startY: 48,
      head: [["Metric", "Value"]],
      body: [
        [
          "Total Transactions",
          transactions.length.toString(),
        ],
        [
          "Total Expenses",
          formatFn
            ? formatFn(totalExpenses)
            : `₹${totalExpenses.toFixed(2)}`,
        ],
        [
          "Active Users",
          activeUsers.toString(),
        ],
        [
          "Total Notes",
          notes.length.toString(),
        ],
      ],
      theme: "grid",
      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [204, 255, 0],
      },
      styles: {
        fontSize: 10,
      },
    })
    doc.setFontSize(16)

    const categoriesToShow = [
      "Transfer",
      "Food",
      "Shopping",
      "Bills",
    ]

    const filteredTransactions = transactions.filter((t) =>
      categoriesToShow.includes(t.category)
    )

    autoTable(doc, {
      startY: (doc as any).lastAutoTable.finalY + 15,

      head: [
        [
          "Title",
          "Category",
          "Amount",
          "Date",
        ],
      ],

      body: filteredTransactions.map((t) => [
        t.title,
        t.category,
        formatFn
          ? formatFn(t.amount)
          : `₹${t.amount.toFixed(2)}`,
        new Date(t.date).toLocaleDateString(),
      ]),

      theme: "striped",

      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [204, 255, 0],
      },

      styles: {
        fontSize: 9,
        cellPadding: 4,
      },

      columnStyles: {
        0: { cellWidth: 60 },
        1: { cellWidth: 35 },
        2: { cellWidth: 35 },
        3: { cellWidth: 40 },
      },
    })

    const pageCount = doc.getNumberOfPages()

    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i)

      doc.setFontSize(10)

      doc.text(
        `Page ${i} of ${pageCount}`,
        170,
        290
      )
    }

    doc.save("dashboard-report.pdf")
  } catch (err) {
    console.error(err)
    throw new Error("PDF export failed")
  }
}

// Specific export functions for transactions
export const exportTransactionsToExcel = (transactions: any[], formatFn?: (amount: number) => string) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount: formatFn ? formatFn(t.amount) : `₹${t.amount.toFixed(2)}`,
      Category: t.category,
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description || "",
    }))
    exportToExcel(data, "transactions.xlsx")
  } catch (err) {
    console.error("Transaction Excel Export Failed:", err)
    throw err
  }
}

export const exportTransactionsToCSV = (transactions: any[], formatFn?: (amount: number) => string) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount: formatFn ? formatFn(t.amount) : `₹${t.amount.toFixed(2)}`,
      Category: t.category,
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description || "",
    }))
    exportToCSV(data, "transactions.csv")
  } catch (err) {
    console.error("Transaction CSV Export Failed:", err)
    throw err
  }
}

// Specific export functions for notes
export const exportNotesToExcel = (notes: any[]) => {
  try {
    if (!notes || notes.length === 0) {
      throw new Error("No notes to export")
    }

    const data = notes.map((n) => ({
      ID: n.id,
      Title: n.title,
      Content: n.content,
      "Created At": new Date(n.createdAt).toLocaleDateString(),
      "Updated At": new Date(n.updatedAt).toLocaleDateString(),
    }))
    exportToExcel(data, "notes.xlsx")
  } catch (err) {
    console.error("Notes Excel Export Failed:", err)
    throw err
  }
}

export const exportNotesToCSV = (notes: any[]) => {
  try {
    if (!notes || notes.length === 0) {
      throw new Error("No notes to export")
    }

    const data = notes.map((n) => ({
      ID: n.id,
      Title: n.title,
      Content: n.content,
      "Created At": new Date(n.createdAt).toLocaleDateString(),
      "Updated At": new Date(n.updatedAt).toLocaleDateString(),
    }))
    exportToCSV(data, "notes.csv")
  } catch (err) {
    console.error("Notes CSV Export Failed:", err)
    throw err
  }
}
