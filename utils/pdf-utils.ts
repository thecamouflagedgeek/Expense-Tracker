import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const generateTransactionsPdf = (transactions: any[], formatFn?: (amount: number) => string) => {
  try {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor("#000000")
    doc.text("Transaction Report", 14, 22)

    autoTable(doc, {
      startY: 30,
      head: [["Title", "Amount", "Category", "Date", "Description"]],
      body: transactions.map((t) => [
        t.title,
        formatFn ? formatFn(t.amount) : `₹${t.amount.toFixed(2)}`,
        t.category,
        new Date(t.date).toLocaleDateString(),
        t.description || "",
      ]),
      theme: "striped",
      styles: {
        font: "helvetica",
        textColor: "#0c0d0e",
        fillColor: "#ffffff",
        lineColor: "#e0e2d9",
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: "#000000",
        textColor: "#ffffff",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#f9faf7",
      },
      didDrawPage: (data) => {
        // Footer
        let str = "Page " + doc.internal.getNumberOfPages()
        if (typeof doc.putTotalPages === "function") {
          str = str + " of " + doc.putTotalPages()
        }
        doc.setFontSize(10)
        doc.setTextColor("#888888")
        doc.text(str, data.settings.margin.left, doc.internal.pageSize.height - 10)
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

    notes.forEach((note, index) => {
      if (index > 0) {
        doc.addPage()
      }
      doc.setFontSize(14)
      doc.setTextColor("#000000")
      doc.text(`Title: ${note.title}`, 14, 30)
      doc.setFontSize(10)
      doc.setTextColor("#666666")
      doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 14, 38)
      doc.text(`Last Updated: ${new Date(note.updatedAt).toLocaleDateString()}`, 14, 45)

      doc.setFontSize(12)
      doc.setTextColor("#0c0d0e")
      const contentLines = doc.splitTextToSize(note.content, doc.internal.pageSize.width - 28)
      doc.text(contentLines, 14, 55)
    })

    doc.save("notes_report.pdf")
  } catch (err) {
    console.error("PDF Export Failed:", err)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}
