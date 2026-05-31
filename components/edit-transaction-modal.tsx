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
import { useCurrency } from "@/context/currency-context"
import { Loader2, ChevronDown, Pencil, Check, X, CalendarIcon } from "lucide-react"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Calendar } from "@/components/ui/calendar"
import { format } from "date-fns"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList, CommandSeparator } from "@/components/ui/command"

type EditTransactionModalProps = {
  isOpen: boolean
  onClose: () => void
  transaction: any
}

export function EditTransactionModal({ isOpen, onClose, transaction }: EditTransactionModalProps) {
  const { symbol, convert, convertToINR, currency } = useCurrency()
  const { updateTransaction, categories, renameCategory } = useTransactions()

  // Convert stored base INR amount to the active currency for display
  const toDisplayAmount = (inrAmount: number) =>
    currency === "INR" ? inrAmount : convert(inrAmount)

  const [title, setTitle] = useState(transaction?.title || "")
  const [amount, setAmount] = useState(
    transaction?.amount != null ? toDisplayAmount(transaction.amount).toFixed(2) : ""
  )
  const [category, setCategory] = useState(transaction?.category || "")
  const [categoryOpen, setCategoryOpen] = useState(false)
  const [categorySearch, setCategorySearch] = useState("")
  const [date, setDate] = useState<Date | undefined>(
    transaction?.date ? new Date(transaction.date) : undefined
  )
  const [description, setDescription] = useState(transaction?.description || "")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [editingCat, setEditingCat] = useState<string | null>(null)
  const [editCatName, setEditCatName] = useState("")

  const handleRenameCategory = async (oldName: string) => {
    try {
      setError(null)
      await renameCategory(oldName, editCatName)
      if (category === oldName) {
        setCategory(editCatName.trim())
      }
      setEditingCat(null)
    } catch (err: any) {
      setError(err.message || "Failed to rename category.")
    }
  }

  const availableCategories = Array.from(
    new Set([...categories, "Transfer"].filter((categoryName) => categoryName && categoryName !== "New Category")),
  )
  const normalizedCategorySearch = categorySearch.trim().toLowerCase()
  const filteredCategories = availableCategories.filter((categoryName) =>
    categoryName.toLowerCase().includes(normalizedCategorySearch),
  )
  const canCreateCategory =
    categorySearch.trim().length > 0 &&
    !availableCategories.some((categoryName) => categoryName.toLowerCase() === normalizedCategorySearch)

  useEffect(() => {
    if (transaction) {
      setTitle(transaction.title)
      // Re-convert whenever currency or transaction changes
      setAmount(toDisplayAmount(transaction.amount).toFixed(2))
      setCategory(transaction.category)
      setCategorySearch(transaction.category)
      setDate(transaction.date ? new Date(transaction.date) : undefined)
      setDescription(transaction.description || "")
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [transaction, currency])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError(null)

    if (!title || !amount || !category || !date) {
      setError("Please fill in all required fields.")
      setLoading(false)
      return
    }

    const enteredAmount = Number.parseFloat(amount as string)
    if (isNaN(enteredAmount) || enteredAmount <= 0) {
      setError("Please enter a valid amount greater than 0.")
      setLoading(false)
      return
    }

    // Convert back to base INR before saving
    const amountInINR = currency === "INR" ? enteredAmount : convertToINR(enteredAmount)

    try {
      await updateTransaction(transaction.id, {
        title,
        amount: amountInINR,
        type: transaction?.type === "income" ? "income" : "expense",
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
      <DialogContent className="sm:max-w-[425px] w-[calc(100%-2rem)] sm:w-full max-h-[calc(100vh-2rem)] sm:max-h-[90vh] overflow-y-auto bg-white text-black border border-black/5 rounded-3xl shadow-2xl p-6">
        <DialogHeader>
          <DialogTitle className="text-lg font-black text-black">Edit Transaction</DialogTitle>
          <DialogDescription className="text-xs text-black/60 font-medium">
            Editing in <span className="font-bold text-black">{currency}</span>. Saved automatically in base INR.
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
                Amount <span className="font-black">({symbol})</span>
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
              <Popover
                open={categoryOpen}
                onOpenChange={(open) => {
                  setCategoryOpen(open)
                  if (open) {
                    setCategorySearch(category)
                  }
                }}
              >
                <PopoverTrigger asChild>
                  <Button
                    type="button"
                    variant="outline"
                    className="col-span-3 justify-between bg-black/[0.02] border border-black/5 text-black hover:bg-black/[0.04] focus:bg-white focus:ring-2 focus:ring-black rounded-xl text-xs h-10 font-normal"
                  >
                    <span className={`truncate ${!category ? "text-black/40" : "text-black"}`}>
                      {category || "Select or type a category"}
                    </span>
                    <ChevronDown className="ml-2 h-4 w-4 text-black/40" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0 bg-white border border-black/5 rounded-2xl shadow-2xl z-[999]">
                  <Command shouldFilter={false}>
                    <CommandInput
                      value={categorySearch}
                      onValueChange={setCategorySearch}
                      placeholder="Type a category"
                    />
                    <CommandList>
                      <CommandEmpty>No category found.</CommandEmpty>
                      <CommandGroup heading="Categories">
                        {filteredCategories.map((cat) => (
                          <CommandItem
                            key={cat}
                            value={cat}
                            onSelect={() => {
                              if (editingCat === cat) return
                              setCategory(cat)
                              setCategorySearch(cat)
                              setCategoryOpen(false)
                            }}
                            className="flex items-center justify-between cursor-pointer font-semibold text-xs py-2 px-3 group"
                          >
                            {editingCat === cat ? (
                              <div className="flex items-center gap-1.5 w-full" onClick={(e) => e.stopPropagation()}>
                                <input
                                  type="text"
                                  value={editCatName}
                                  onChange={(e) => setEditCatName(e.target.value)}
                                  className="flex-1 bg-black/[0.04] border border-black/10 px-2 py-0.5 rounded text-[11px] font-semibold text-black focus:outline-none focus:ring-1 focus:ring-black"
                                  autoFocus
                                />
                                <button
                                  type="button"
                                  onClick={() => handleRenameCategory(cat)}
                                  className="p-1 text-emerald-600 hover:text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                                <button
                                  type="button"
                                  onClick={() => setEditingCat(null)}
                                  className="p-1 text-red-600 hover:text-red-700 bg-red-50 hover:bg-red-100 rounded"
                                >
                                  <X className="w-3 h-3" />
                                </button>
                              </div>
                            ) : (
                              <>
                                <span className="truncate">{cat}</span>
                                <button
                                  type="button"
                                  onClick={(e) => {
                                    e.stopPropagation()
                                    setEditingCat(cat)
                                    setEditCatName(cat)
                                  }}
                                  className="opacity-0 group-hover:opacity-100 p-1 text-black/40 hover:text-black hover:bg-black/5 rounded transition-opacity"
                                >
                                  <Pencil className="w-3 h-3" />
                                </button>
                              </>
                            )}
                          </CommandItem>
                        ))}
                      </CommandGroup>
                      {canCreateCategory && (
                        <>
                          <CommandSeparator />
                          <CommandGroup heading="Create new">
                            <CommandItem
                              key={`create-${categorySearch.trim()}`}
                              value={categorySearch.trim()}
                              onSelect={() => {
                                const nextCategory = categorySearch.trim()
                                setCategory(nextCategory)
                                setCategorySearch(nextCategory)
                                setCategoryOpen(false)
                              }}
                              className="cursor-pointer font-semibold text-xs py-2 px-3 text-emerald-700"
                            >
                              + Add "{categorySearch.trim()}"
                            </CommandItem>
                          </CommandGroup>
                        </>
                      )}
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin text-[#ccff00]" /> Saving...
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
