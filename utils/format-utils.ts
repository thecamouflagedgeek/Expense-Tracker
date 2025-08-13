export const formatCurrency = (amount: number, currency = "INR"): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export const formatDate = (dateString: string): string => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  })
}
