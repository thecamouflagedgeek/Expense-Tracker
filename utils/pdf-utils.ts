import jsPDF from "jspdf"
import { autoTable } from "jspdf-autotable"

const formatCurrency = (amount: number) => {
  return `Rs. ${Number(amount).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
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

export const generateTransactionsPdf = (
  transactions: any[],
  formatFn?: (amount: number) => string
) => {
  try {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor("#000000")
    doc.text("Transaction Report", 14, 22)

    autoTable(doc, {
      startY: 30,

      head: [["Title", "Amount", "Category", "Date", "Description"]],

      body:
        transactions.length > 0
          ? transactions.map((t) => [
              t.title,
              safeCurrency(t.amount),
              t.category,
              new Date(t.date).toLocaleDateString(),
              t.description || "",
            ])
          : [["No transactions available", "", "", "", ""]],

      theme: "striped",

      styles: {
        font: "helvetica",
        textColor: "#0c0d0e",
        fillColor: "#ffffff",
        lineColor: "#e0e2d9",
        lineWidth: 0.1,
        fontSize: 10,
        overflow: "linebreak",
        cellPadding: 3,
      },

      headStyles: {
        fillColor: "#000000",
        textColor: "#ffffff",
        fontStyle: "bold",
      },

      alternateRowStyles: {
        fillColor: "#f9faf7",
      },

      margin: {
        left: 14,
        right: 14,
      },

      columnStyles: {
        0: { cellWidth: 45 }, // Title
        1: { cellWidth: 40, halign: "right" }, // Amount
        2: { cellWidth: 35 }, // Category
        3: { cellWidth: 28 }, // Date
        4: { cellWidth: 50 }, // Description
      },

      didDrawPage: (data) => {
        const pageNumber =
          ((doc.internal as any).getNumberOfPages?.() ??
            (doc.internal as any).pages?.length ??
            1) - 1

        doc.setFontSize(10)
        doc.setTextColor("#888888")

        doc.text(
          `Page ${pageNumber}`,
          data.settings.margin.left,
          doc.internal.pageSize.height - 10
        )
      },
    })

    doc.save("transactions_report.pdf")
  } catch (err) {
    console.error("PDF Export Failed:", err)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}

export const generateNotesPdf = (notes: any[]) => {
  try {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor("#000000")
    doc.text("Notes Report", 14, 22)

    if (notes.length === 0) {
      doc.setFontSize(12)
      doc.setTextColor("#666666")
      doc.text("No notes available to export.", 14, 34)

      doc.save("notes_report.pdf")
      return
    }

    notes.forEach((note, index) => {
      if (index > 0) {
        doc.addPage()
      }

      doc.setFontSize(14)
      doc.setTextColor("#000000")
      doc.text(`Title: ${note.title}`, 14, 30)

      doc.setFontSize(10)
      doc.setTextColor("#666666")

      doc.text(
        `Created: ${new Date(note.createdAt).toLocaleDateString()}`,
        14,
        38
      )

      doc.text(
        `Last Updated: ${new Date(note.updatedAt).toLocaleDateString()}`,
        14,
        45
      )

      doc.setFontSize(12)
      doc.setTextColor("#0c0d0e")

      const contentLines = doc.splitTextToSize(
        note.content,
        doc.internal.pageSize.width - 28
      )

      doc.text(contentLines, 14, 55)
    })

    doc.save("notes_report.pdf")
  } catch (err) {
    console.error("PDF Export Failed:", err)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}