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
    <div className="flex flex-wrap items-center gap-4 mb-6">
      <Input
        placeholder="Search transactions..."
        value={filters.search}
        onChange={(e) => onFilterChange({ search: e.target.value })}
        className="max-w-sm bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] focus:ring-[#00ADB5]"
      />

      <Select value={filters.category} onValueChange={(value) => onFilterChange({ category: value })}>
        <SelectTrigger className="w-[180px] bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
          <SelectValue placeholder="Select Category" />
        </SelectTrigger>
        <SelectContent className="bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
          <SelectItem value="all" className="hover:bg-[#393E46] focus:bg-[#393E46]">
            All Categories
          </SelectItem>
          {categories.map((category) => (
            <SelectItem key={category} value={category} className="hover:bg-[#393E46] focus:bg-[#393E46]">
              {category}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className={`w-[280px] justify-start text-left font-normal bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] hover:bg-[#393E46] ${
              !dateRange.from && "text-[#EEEEEE]/70"
            }`}
          >
            <CalendarIcon className="mr-2 h-4 w-4 text-[#00ADB5]" />
            {dateRange.from ? (
              dateRange.to ? (
                <>
                  {format(dateRange.from, "LLL dd, y")} - {format(dateRange.to, "LLL dd, y")}
                </>
              ) : (
                format(dateRange.from, "LLL dd, y")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0 bg-[#222831] border-[#00ADB5]">
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
          className="text-red-400 hover:bg-red-900/20 hover:text-red-300"
        >
          <XCircle className="mr-2 h-4 w-4" />
          Clear Filters
        </Button>
      )}
    </div>
  )
}
