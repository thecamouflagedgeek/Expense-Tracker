"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { formatCurrency } from "@/utils/format-utils"

type CategoryChartProps = {
  data: { name: string; value: number }[]
}



export function CategoryChart({ data }: CategoryChartProps) {
  return (
    <Card className="card-gradient border-[#393E46]">
      <CardHeader>
        <CardTitle className="text-xl text-[#00ADB5]">Spending by Category</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data} margin={{ top: 5, right: 10, left: 10, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#393E46" />
              <XAxis dataKey="name" stroke="#EEEEEE" />
              <YAxis stroke="#EEEEEE" tickFormatter={(value) => formatCurrency(value)} />
              <Tooltip
                cursor={{ fill: "#393E46", opacity: 0.7 }}
                contentStyle={{
                  backgroundColor: "#222831",
                  border: "1px solid #00ADB5",
                  borderRadius: "8px",
                  color: "#EEEEEE",
                }}
                labelStyle={{ color: "#00ADB5" }}
                formatter={(value: number) => formatCurrency(value)}
              />
              <Line 
                type="monotone" 
                dataKey="value" 
                stroke="#00ADB5" 
                strokeWidth={3}
                dot={{ fill: "#00ADB5", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, stroke: "#00ADB5", strokeWidth: 2, fill: "#00ADB5" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
