"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, ResponsiveContainer } from "recharts"
import { useCurrency } from "@/context/currency-context"

type CategoryChartProps = {
  data: { name: string; value: number }[]
}

export function CategoryChart({ data }: CategoryChartProps) {
  const { convert, format } = useCurrency()

  // Format data for selected currency
  const convertedData = data.map((item) => ({
    name: item.name,
    value: convert(item.value),
  }))

  return (
    <Card className="card-gradient border-none p-6">
      <CardHeader className="p-0 flex flex-row items-center justify-between">
        <CardTitle className="text-base font-bold text-black tracking-tight">Spending</CardTitle>
        <div className="flex items-center gap-4 text-[10px] font-bold text-black/50">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ccff00] border border-black/5" />
            <span>This month</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full border border-black/30 bg-transparent" />
            <span>Average</span>
          </div>
        </div>
      </CardHeader>
      <CardContent className="p-0 mt-6">
        <div className="h-[240px] flex items-center justify-center">
          {convertedData.length === 0 ? (
            <p className="text-xs text-black/40">No spending details available</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart cx="50%" cy="50%" outerRadius="75%" data={convertedData}>
                <PolarGrid stroke="#6b7280" strokeDasharray="3 3" />
                <PolarAngleAxis 
                  dataKey="name" 
                  tick={{ fill: "#0c0d0e", fontSize: 10, fontWeight: 600 }}
                />
                <Radar
                  name="Spending"
                  dataKey="value"
                  stroke="#000000"
                  strokeWidth={1.5}
                  fill="#ccff00"
                  fillOpacity={0.65}
                />
              </RadarChart>
            </ResponsiveContainer>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
