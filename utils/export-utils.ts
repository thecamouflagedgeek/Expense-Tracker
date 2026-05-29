import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import { autoTable } from "jspdf-autotable"
import html2canvas from "html2canvas"

// Check if we're on the client side
const isClient = typeof window !== "undefined"
const safeCurrency = (value: any) => {
  const numericValue =
    typeof value === "string"
      ? Number(value.replace(/[^\d.-]/g, ""))
      : Number(value)

  return `Rs. ${numericValue.toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
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

// Export to PDF (based on DOM element)
export const exportToPDF = async (elementId: string, filename = "export.pdf") => {
  if (!isClient) {
    console.warn("PDF export can only be used on the client side")
    return
  }

  try {
    const element = document.getElementById(elementId)

    if (!element) {
      throw new Error(`Element with ID "${elementId}" not found`)
    }

    const canvas = await html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      backgroundColor: "#eff1e9",
      logging: false,
    })

    const imgData = canvas.toDataURL("image/png")

    const pdf = new jsPDF("p", "mm", "a4")

    const imgProps = pdf.getImageProperties(imgData)

    const pdfWidth = pdf.internal.pageSize.getWidth()
    const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width

    // Handle multiple pages if content is too long
    if (pdfHeight > pdf.internal.pageSize.getHeight()) {
      const pageHeight = pdf.internal.pageSize.getHeight()

      let heightLeft = pdfHeight
      let position = 0

      pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)

      heightLeft -= pageHeight

      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight

        pdf.addPage()
        pdf.addImage(imgData, "PNG", 0, position, pdfWidth, pdfHeight)

        heightLeft -= pageHeight
      }
    } else {
      pdf.addImage(imgData, "PNG", 0, 0, pdfWidth, pdfHeight)
    }

    pdf.save(filename)
  } catch (err) {
    console.error("PDF Export Failed:", err)
    throw new Error("Failed to export to PDF. Please try again.")
  }
}

// Specific export functions for transactions
export const exportTransactionsToExcel = (
  transactions: any[],
  formatFn?: (amount: number) => string
) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount:
      formatFn
       ? formatFn(t.amount)
       : `Rs. ${Number(t.amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
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

export const exportTransactionsToCSV = (
  transactions: any[],
  formatFn?: (amount: number) => string
) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount:
  formatFn
    ? formatFn(t.amount)
    : `Rs. ${Number(t.amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`,
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

// Dashboard Summary PDF Export with structured columns
export const exportDashboardSummaryPDF = (
  dashboardMetrics: {
    totalExpenses: number
    totalIncome: number
    averageExpense: number
    totalTransactions: number
    totalNotes: number
    activeUsers: number
    pendingUsers: number
    workspaceAllocation: number
    workspaceRemaining: number
    categorySpendingData: Array<{ name: string; value: number }>
    transferCount: number
    incomeCount: number
    expenseCount: number
  },
  formatFn: (amount: number) => string,
  filename = "dashboard-summary.pdf"
) => {
  if (!isClient) {
    console.warn("PDF export can only be used on the client side")
    return
  }

  try {
    const doc = new jsPDF()

    const pageWidth = doc.internal.pageSize.getWidth()
    const pageHeight = doc.internal.pageSize.getHeight()

    let currentY = 20

    const formatCurrency = (amount: number) => {
      return `Rs. ${Number(amount).toLocaleString("en-IN", {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      })}`
    }

    // Header
    doc.setFontSize(20)
    doc.setTextColor(0, 0, 0)
    doc.text("Dashboard Summary Report", 14, currentY)

    // Date
    currentY += 10

    doc.setFontSize(10)
    doc.setTextColor(100, 100, 100)

    doc.text(`Generated: ${new Date().toLocaleString()}`, 14, currentY)

    currentY += 15

    // Section 1: Financial Summary
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Financial Summary", 14, currentY)

    currentY += 8

    const financialMetrics = [
      ["Metric", "Value"],
      ["Total Income", formatCurrency(dashboardMetrics.totalIncome)],
      ["Total Expenses", formatCurrency(dashboardMetrics.totalExpenses)],
      ["Average Expense", formatCurrency(dashboardMetrics.averageExpense)],
      [
        "Net Balance",
        formatCurrency(dashboardMetrics.totalIncome - dashboardMetrics.totalExpenses),
      ],
    ]

    autoTable(doc, {
      startY: currentY,

      head: financialMetrics.slice(0, 1),

      body: financialMetrics.slice(1),

      theme: "striped",

      styles: {
        font: "helvetica",
        textColor: [12, 13, 14],
        fillColor: [255, 255, 255],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        fontSize: 10,
        overflow: "linebreak",
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 11,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      margin: {
        left: 14,
        right: 14,
      },

      columnStyles: {
        0: {
          cellWidth: 80,
        },
        1: {
          cellWidth: 70,
          halign: "right",
        },
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 12

    // Section 2: Transaction Summary
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Transaction Summary", 14, currentY)

    currentY += 8

    const transactionMetrics = [
      ["Type", "Count"],
      ["Income Transactions", String(dashboardMetrics.incomeCount)],
      ["Expense Transactions", String(dashboardMetrics.expenseCount)],
      ["Transfers", String(dashboardMetrics.transferCount)],
      ["Total Transactions", String(dashboardMetrics.totalTransactions)],
    ]

    autoTable(doc, {
      startY: currentY,

      head: transactionMetrics.slice(0, 1),

      body: transactionMetrics.slice(1),

      theme: "striped",

      styles: {
        font: "helvetica",
        textColor: [12, 13, 14],
        fillColor: [255, 255, 255],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        fontSize: 10,
        overflow: "linebreak",
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 11,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      margin: {
        left: 14,
        right: 14,
      },

      columnStyles: {
        0: {
          cellWidth: 80,
        },
        1: {
          cellWidth: 70,
          halign: "right",
        },
      },
    })

    currentY = (doc as any).lastAutoTable.finalY + 12

    // Section 3: Category Breakdown
    if (dashboardMetrics.categorySpendingData.length > 0) {
      doc.setFontSize(12)
      doc.setTextColor(0, 0, 0)
      doc.text("Expense Categories", 14, currentY)

      currentY += 8

      const topCategories = dashboardMetrics.categorySpendingData
        .sort((a, b) => b.value - a.value)
        .slice(0, 10)

      const categoryMetrics = [
        ["Category", "Amount"],
        ...topCategories.map((c) => [c.name, formatCurrency(c.value)]),
      ]

      autoTable(doc, {
        startY: currentY,

        head: categoryMetrics.slice(0, 1),

        body: categoryMetrics.slice(1),

        theme: "striped",

        styles: {
          font: "helvetica",
          textColor: [12, 13, 14],
          fillColor: [255, 255, 255],
          lineColor: [200, 200, 200],
          lineWidth: 0.1,
          fontSize: 10,
          overflow: "linebreak",
          cellPadding: 3,
        },

        headStyles: {
          fillColor: [0, 0, 0],
          textColor: [255, 255, 255],
          fontStyle: "bold",
          fontSize: 11,
        },

        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },

        margin: {
          left: 14,
          right: 14,
        },

        columnStyles: {
          0: {
            cellWidth: 90,
          },
          1: {
            cellWidth: 60,
            halign: "right",
          },
        },

        didDrawPage: () => {
          const pageNumber =
            ((doc.internal as any).getNumberOfPages?.() ??
              (doc.internal as any).pages?.length ??
              1) - 1

          doc.setFontSize(9)
          doc.setTextColor(150, 150, 150)

          doc.text(`Page ${pageNumber}`, pageWidth - 25, pageHeight - 10)
        },
      })

      currentY = (doc as any).lastAutoTable.finalY + 12
    }

    // Section 4: Workspace Information
    doc.setFontSize(12)
    doc.setTextColor(0, 0, 0)
    doc.text("Workspace Information", 14, currentY)

    currentY += 8

    const workspaceMetrics = [
      ["Metric", "Value"],
      ["Active Users", String(dashboardMetrics.activeUsers)],
      ["Pending Users", String(dashboardMetrics.pendingUsers)],
      ["Total Notes", String(dashboardMetrics.totalNotes)],
      ["Workspace Allocation", formatCurrency(dashboardMetrics.workspaceAllocation)],
      ["Remaining Balance", formatCurrency(dashboardMetrics.workspaceRemaining)],
    ]

    autoTable(doc, {
      startY: currentY,

      head: workspaceMetrics.slice(0, 1),

      body: workspaceMetrics.slice(1),

      theme: "striped",

      styles: {
        font: "helvetica",
        textColor: [12, 13, 14],
        fillColor: [255, 255, 255],
        lineColor: [200, 200, 200],
        lineWidth: 0.1,
        fontSize: 10,
        overflow: "linebreak",
        cellPadding: 3,
      },

      headStyles: {
        fillColor: [0, 0, 0],
        textColor: [255, 255, 255],
        fontStyle: "bold",
        fontSize: 11,
      },

      alternateRowStyles: {
        fillColor: [245, 245, 245],
      },

      margin: {
        left: 14,
        right: 14,
      },

      columnStyles: {
        0: {
          cellWidth: 80,
        },
        1: {
          cellWidth: 70,
          halign: "right",
        },
      },

      didDrawPage: () => {
        const pageNumber =
          ((doc.internal as any).getNumberOfPages?.() ??
            (doc.internal as any).pages?.length ??
            1) - 1

        doc.setFontSize(9)
        doc.setTextColor(150, 150, 150)

        doc.text(`Page ${pageNumber}`, pageWidth - 25, pageHeight - 10)
      },
    })

    doc.save(filename)
  } catch (err) {
    console.error("Dashboard PDF Export Failed:", err)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}