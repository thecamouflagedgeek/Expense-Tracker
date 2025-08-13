import { Loader2 } from "lucide-react"

export default function ReceiptsLoading() {
  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-64px)] bg-[#222831] text-[#00ADB5]">
      <Loader2 className="h-12 w-12 animate-spin" />
      <span className="sr-only">Loading receipts...</span>
    </div>
  )
}
