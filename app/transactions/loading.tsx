import { Loader2 } from "lucide-react"

export default function TransactionsLoading() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-120px)] text-black">
      <Loader2 className="h-10 w-10 animate-spin text-black stroke-[3]" />
      <span className="sr-only">Loading transactions...</span>
    </div>
  )
}
