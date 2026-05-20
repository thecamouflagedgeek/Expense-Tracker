"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { CalendarIcon, XCircle } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

type TransactionFiltersProps = {
  filters: {
    search: string
    category: string
    startDate: Date | undefined
    endDate: Date | undefined
  }
  onFilterChange: (newFilters: {
    search?: string
    category?: string
    startDate?: Date | undefined
    endDate?: Date | undefined
  }) => void
  categories: string[]
}

export function TransactionFilters({ filters, onFilterChange, categories }: TransactionFiltersProps) {
  const [dateRange, setDateRange] = useState<{ from?: Date; to?: Date }>({
    from: filters.startDate,
    to: filters.endDate,
  })

  const handleDateSelect = (range: { from?: Date; to?: Date }) => {
    setDateRange(range)
    onFilterChange({ startDate: range.from, endDate: range.to })
  }

  const clearDateFilter = () => {
    setDateRange({ from: undefined, to: undefined })
    onFilterChange({ startDate: undefined, endDate: undefined })
  }

  return (
    <div className="flex flex-col md:flex-row md:flex-wrap items-stretch md:items-center gap-4 mb-6">
      <Input
        placeholder="Search transactions..."
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        className="w-full md:max-w-sm bg-white text-black border border-black/5 hover:bg-black/[0.02] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-semibold shadow-sm placeholder:text-black/30"
      />

      <Select value={filters.category} onValueChange={(value) => onFilterChange({ category: value })}>
        <SelectTrigger className="w-full md:w-[180px] bg-white text-black border border-black/5 hover:bg-black/[0.02] transition-colors rounded-xl text-xs h-10 font-semibold shadow-sm focus:ring-2 focus:ring-black">
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent className="bg-white text-black border border-black/5 rounded-2xl shadow-xl">
          <SelectItem value="all" className="hover:bg-black/[0.04] focus:bg-black/[0.04] text-xs font-semibold rounded-lg my-0.5 cursor-pointer">
            All Categories
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category} className="hover:bg-black/[0.04] focus:bg-black/[0.04] text-xs font-semibold rounded-lg my-0.5 cursor-pointer">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={`w-full md:w-[280px] justify-start text-left font-normal bg-white text-black border border-black/5 hover:bg-black/[0.02] rounded-xl text-xs h-10 shadow-sm focus:ring-2 focus:ring-black ${
              !dateRange.from && "text-black/40"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#ccff00]" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span className="font-semibold text-black/60">Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-white border border-black/5 rounded-2xl shadow-xl z-[999]">
          <Calendar
            mode="range"
            selected={{ from: dateRange.from, to: dateRange.to }}
            onSelect={handleDateSelect}
            numberOfMonths={2}
            initialFocus
          />
        </PopoverContent>
      </Popover>

      {(filters.search || filters.category !== "all" || filters.startDate || filters.endDate) && (
        <Button
          variant="ghost"
          onClick={() => onFilterChange({ search: "", category: "all", startDate: undefined, endDate: undefined })}
          className="text-red-600 hover:bg-red-50 hover:text-red-700 font-semibold text-xs rounded-xl h-10 px-4"
        >
          <XCircle className="mr-2 h-4 w-4 text-red-600" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
