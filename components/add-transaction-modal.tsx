"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTransactions } from "@/context/transaction-context"
import { useCurrency } from "@/context/currency-context"
import { Loader2, PlusCircle } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

export function AddTransactionModal() {
  const [isOpen, setIsOpen] = useState(false)
  const [title, setTitle] = useState("")
  const [amount, setAmount] = useState("")
  const [category, setCategory] = useState("")
  const [date, setDate] = useState<Date | undefined>(new Date())
  const [description, setDescription] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { addTransaction, categories } = useTransactions()
  const { symbol, convertToINR, currency } = useCurrency()
  const availableCategories = categories.includes("Transfer") ? categories : [...categories, "Transfer"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title || !amount || !category || !date) {
      setError("Please fill in all required fields.")
      setLoading(false)
      return
    }

    const enteredAmount = Number.parseFloat(amount)
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setError("Please enter a valid amount greater than 0.")
      setLoading(false)
      return
    }

    // Convert entered amount from active currency back to base INR for storage
    const amountInINR = currency === "INR" ? enteredAmount : convertToINR(enteredAmount)

    try {
      await addTransaction({
        title,
        amount: amountInINR,
        category,
        date: date.toISOString(),
        description,
      })
      setIsOpen(false)
      setTitle("")
      setAmount("")
      setCategory("")
      setDate(new Date())
      setDescription("")
    } catch (err: any) {
      setError(err.message || "Failed to add transaction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button className="button-gradient px-5 py-2 h-11 text-xs">
          <PlusCircle className="mr-2 h-4 w-4 text-[#ccff00]" /> Add New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Add New Transaction</DialogTitle>
          <DialogDescription className="text-xs text-black/60 font-medium">
            Amounts entered in <span className="font-bold text-black">{currency}</span>. Stored automatically in base INR.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-black/75 font-semibold text-xs">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-black/75 font-semibold text-xs">
                Amount <span className="text-[#0c0d0e] font-black">({symbol})</span>
              </Label>
              <div className="col-span-3 relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs font-black text-black/50 select-none">{symbol}</span>
                <Input
                  id="amount"
                  type="number"
                  step="0.01"
                  min="0"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="pl-7 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-black/75 font-semibold text-xs">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-white text-black border border-black/5 rounded-xl shadow-xl z-[999]">
                  {availableCategories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="hover:bg-black/5 focus:bg-black/5 cursor-pointer font-semibold text-xs py-2 px-3">
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="New Category" className="hover:bg-black/5 focus:bg-black/5 cursor-pointer font-semibold text-xs py-2 px-3 text-black/50">
                    + Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-black/75 font-semibold text-xs">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 ${
                      !date && "text-black/40"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-black/50" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-white border border-black/5 rounded-2xl shadow-2xl z-[999]">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right text-black/75 font-semibold text-xs mt-2.5">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-2xl p-4 text-xs font-medium placeholder:text-black/30 min-h-[80px]"
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-50 border-red-200 text-red-700 rounded-2xl p-4">
              <AlertTitle className="font-bold">Error</AlertTitle>
              <AlertDescription className="text-xs mt-0.5">{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient px-6 py-2.5 h-11 text-xs" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Adding...
                </>
              ) : (
                "Add Transaction"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
