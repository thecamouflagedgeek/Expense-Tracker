"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { useTransactions } from "@/context/transaction-context"
import { Loader2 } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { CalendarIcon } from "lucide-react"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"

type EditTransactionModalProps = {
  isOpen: boolean
  onClose: () => void
  transaction: any
}

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const [title, setTitle] = useState(transaction?.title || "")
  const [amount, setAmount] = useState(transaction?.amount || "")
  const [category, setCategory] = useState(transaction?.category || "")
  const [date, setDate] = useState<Date | undefined>(transaction?.date ? new Date(transaction.date) : undefined)
  const [description, setDescription] = useState(transaction?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const { updateTransaction, categories } = useTransactions()

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title)
      setAmount(transaction.amount)
      setCategory(transaction.category)
      setDate(transaction.date ? new Date(transaction.date) : undefined)
      setDescription(transaction.description)
    }
  }, [transaction])

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
      await updateTransaction(transaction.id, {
        title,
        amount: Number.parseFloat(amount as string),
        category,
        date: date.toISOString(),
        description,
      })
      onClose()
    } catch (err: any) {
      setError(err.message || "Failed to update transaction.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px] bg-[#222831] text-[#EEEEEE] border-[#00ADB5]">
        <DialogHeader>
          <DialogTitle className="text-[#00ADB5]">Edit Transaction</DialogTitle>
          <DialogDescription className="text-[#EEEEEE]/70">
            Make changes to your transaction here. Click save when you're done.
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving...
                </>
              ) : (
                "Save Changes"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
