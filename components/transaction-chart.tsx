"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { useCurrency } from "@/context/currency-context"
import { 
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem
} from "@/components/ui/dropdown-menu"
import { ChevronDown } from "lucide-react"

type TransactionChartProps = {
  data: { name: string; total: number }[]
}

export function TransactionChart({ data }: TransactionChartProps) {
  const { convert, format, symbol } = useCurrency()

  // Format data for selected currency conversion
  const convertedData = data.map((item) => ({
    name: item.name,
    total: convert(item.total),
    rawTotal: item.total,
  }))

  // Formatter for Y-axis numbers to look like 1k, 2k, 3k, etc.
  const formatYAxis = (value: number) => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}k`
    }
    return value.toString()
  }

  // Custom Tooltip component in a premium black bubble
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const rawTotal = payload[0].payload.rawTotal
      return (
        <div className="bg-black text-white text-xs font-extrabold px-3.5 py-2 rounded-xl shadow-2xl flex flex-col items-center gap-0.5 relative -top-8 border border-white/10">
          <span>{format(rawTotal)}</span>
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 bg-black rotate-45" />
        </div>
      )
    }
    return null
  }

  // Helper to get raw database values inside tooltip format
  const SUPPORTED_CONVERSION_RATE_REVERSED = () => {
    return 1.0 // Since formatting already handles conversion inside format, we just pass the raw value directly
  }

  return (
    <Card className="card-gradient border-none p-6">
      <CardHeader className="p-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-black tracking-tight">Budget</CardTitle>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="bg-[#f0f1eb] hover:bg-black/5 text-[#0c0d0e] font-semibold text-[10px] px-3.5 py-1.5 rounded-full shadow-sm flex items-center gap-1 border border-black/5">
              <span>Month</span>
              <ChevronDown className="w-3 h-3 opacity-55" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-white border-black/5 text-black text-xs rounded-xl shadow-lg">
            <DropdownMenuItem className="cursor-pointer">Week</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Month</DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">Year</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <div className="h-[240px]">
          {convertedData.length === 0 ? (
            <div className="w-full h-full flex items-center justify-center text-xs text-black/40">
              No spending history found
            </div>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={convertedData} margin={{ top: 20, right: 10, left: -20, bottom: 5 }}>
                <CartesianGrid vertical={false} stroke="#e0e2d9" strokeDasharray="3 3" />
                <XAxis 
                  dataKey="name" 
                  stroke="transparent" 
                  tick={{ fill: "#0c0d0e", fontSize: 9, fontWeight: 600 }}
                  dy={10}
                />
                <YAxis 
                  stroke="transparent" 
                  tick={{ fill: "#0c0d0e", fontSize: 9, fontWeight: 600 }} 
                  tickFormatter={formatYAxis}
                  dx={-5}
                />
                <Tooltip 
                  content={<CustomTooltip />}
                  cursor={{ stroke: "#000000", strokeWidth: 1, strokeDasharray: "2 2" }}
                />
                <Line 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#0c0d0e" 
                  strokeWidth={2}
                  dot={{ 
                    fill: "#ccff00", 
                    stroke: "#0c0d0e", 
                    strokeWidth: 2, 
                    r: 4.5 
                  }}
                  activeDot={{ 
                    r: 6, 
                    stroke: "#000000", 
                    strokeWidth: 2.5, 
                    fill: "#ccff00" 
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
