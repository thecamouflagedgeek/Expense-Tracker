import jsPDF from "jspdf"
import autoTable from "jspdf-autotable"

export const generateTransactionsPdf = (transactions: any[]) => {
  try {
    const doc = new jsPDF()

    doc.setFontSize(18)
    doc.setTextColor("#00ADB5")
    doc.text("Transaction Report", 14, 22)

    autoTable(doc, {
      startY: 30,
      head: [["Title", "Amount", "Category", "Date", "Description"]],
      body: transactions.map((t) => [
        t.title,
        `₹${t.amount.toFixed(2)}`, // Updated currency symbol from $ to ₹
        t.category,
        new Date(t.date).toLocaleDateString(),
        t.description || "",
      ]),
      theme: "striped",
      styles: {
        font: "helvetica",
        textColor: "#EEEEEE",
        fillColor: "#393E46",
        lineColor: "#00ADB5",
        lineWidth: 0.1,
      },
      headStyles: {
        fillColor: "#00ADB5",
        textColor: "#222831",
        fontStyle: "bold",
      },
      alternateRowStyles: {
        fillColor: "#222831",
      },
      didDrawPage: (data) => {
        // Footer
        let str = "Page " + doc.internal.getNumberOfPages()
        if (typeof doc.putTotalPages === "function") {
          str = str + " of " + doc.putTotalPages()
        }
        doc.setFontSize(10)
        doc.setTextColor("#00ADB5")
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
    doc.setTextColor("#00ADB5")
    doc.text("Notes Report", 14, 22)

    notes.forEach((note, index) => {
      if (index > 0) {
        doc.addPage()
      }
      doc.setFontSize(14)
      doc.setTextColor("#00ADB5")
      doc.text(`Title: ${note.title}`, 14, 30)
      doc.setFontSize(10)
      doc.setTextColor("#EEEEEE")
      doc.text(`Created: ${new Date(note.createdAt).toLocaleDateString()}`, 14, 38)
      doc.text(`Last Updated: ${new Date(note.updatedAt).toLocaleDateString()}`, 14, 45)

      doc.setFontSize(12)
      doc.setTextColor("#EEEEEE")
      const contentLines = doc.splitTextToSize(note.content, doc.internal.pageSize.width - 28)
      doc.text(contentLines, 14, 55)
    })

    doc.save("notes_report.pdf")
  } catch (err) {
    console.error("PDF Export Failed:", err)
    throw new Error("Failed to generate PDF. Please try again.")
  }
}
