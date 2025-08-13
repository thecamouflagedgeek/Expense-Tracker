"use client"

import { Button } from "@/components/ui/button"
import { Download } from "lucide-react"

type ExportButtonProps = {
  onExport: () => void
}

export function ExportButton({ onExport }: ExportButtonProps) {
  return (
    <Button
      onClick={onExport}
      variant="outline"
      className="border-slate-600 text-slate-300 hover:bg-slate-700 bg-transparent"
    >
      <Download className="mr-2 h-4 w-4" /> Export to PDF
    </Button>
  )
}
