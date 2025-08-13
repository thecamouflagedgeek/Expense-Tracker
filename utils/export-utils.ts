import * as XLSX from "xlsx"
import jsPDF from "jspdf"
import html2canvas from "html2canvas"

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
      backgroundColor: "#222831",
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
export const exportTransactionsToExcel = (transactions: any[]) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount: `₹${t.amount.toFixed(2)}`, // Updated currency symbol from $ to ₹
      Category: t.category,
      Type: t.type,
      Date: new Date(t.date).toLocaleDateString(),
      Description: t.description || "",
    }))
    exportToExcel(data, "transactions.xlsx")
  } catch (err) {
    console.error("Transaction Excel Export Failed:", err)
    throw err
  }
}

export const exportTransactionsToCSV = (transactions: any[]) => {
  try {
    if (!transactions || transactions.length === 0) {
      throw new Error("No transactions to export")
    }

    const data = transactions.map((t) => ({
      ID: t.id,
      Title: t.title,
      Amount: `₹${t.amount.toFixed(2)}`, // Updated currency symbol from $ to ₹
      Category: t.category,
      Type: t.type,
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
