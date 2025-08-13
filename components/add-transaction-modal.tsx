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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title || !amount || !category || !date) {
      setError("Please fill in all required fields.")
      setLoading(false)
      return
    }

    try {
      await addTransaction({
        title,
        amount: Number.parseFloat(amount),
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
        <Button className="button-gradient">
          <PlusCircle className="mr-2 h-4 w-4" /> Add New Transaction
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Add New Transaction</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">
            Fill in the details for your new transaction.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="title" className="text-right text-[#EEEEEE]">
                Title
              </Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="amount" className="text-right text-[#EEEEEE]">
                Amount
              </Label>
              <Input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]"
                required
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="category" className="text-right text-[#EEEEEE]">
                Category
              </Label>
              <Select value={category} onValueChange={setCategory} required>
                <SelectTrigger className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5]">
                  <SelectValue placeholder="Select a category" />
                </SelectTrigger>
                <SelectContent className="bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
                  {categories.map((cat) => (
                    <SelectItem key={cat} value={cat} className="hover:bg-[#393E46] focus:bg-[#393E46]">
                      {cat}
                    </SelectItem>
                  ))}
                  <SelectItem value="New Category" className="hover:bg-[#393E46] focus:bg-[#393E46]">
                    + Add New Category
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="date" className="text-right text-[#EEEEEE]">
                Date
              </Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant={"outline"}
                    className={`col-span-3 justify-start text-left font-normal bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] hover:bg-[#393E46] ${
                      !date && "text-[#EEEEEE]/70"
                    }`}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4 text-[#00ADB5]" />
                    {date ? format(date, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0 bg-[#222831] border-[#00ADB5]">
                  <Calendar mode="single" selected={date} onSelect={setDate} initialFocus />
                </PopoverContent>
              </Popover>
            </div>
            <div className="grid grid-cols-4 items-start gap-4">
              <Label htmlFor="description" className="text-right text-[#EEEEEE]">
                Description
              </Label>
              <Textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="col-span-3 bg-[#393E46] text-[#EEEEEE] border-[#00ADB5] min-h-[80px]"
              />
            </div>
          </div>
          {error && (
            <Alert variant="destructive" className="mb-4 bg-red-900/20 border-red-700 text-red-400">
              <AlertTitle>Error</AlertTitle>
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <DialogFooter>
            <Button type="submit" className="button-gradient" disabled={loading}>
              {loading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Adding...
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
