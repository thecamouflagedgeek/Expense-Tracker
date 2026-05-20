"use client"

import type React from "react"
import { createContext, useState, useEffect, useContext, useCallback } from "react"

export type CurrencyCode =
  | "INR" | "USD" | "EUR" | "GBP" | "JPY" | "AUD"
  | "CAD" | "CHF" | "CNY"
  | "AED" | "SAR" | "SGD" | "HKD" | "KRW" | "NZD"
  | "RUB" | "ZAR" | "BRL" | "TRY"

type CurrencyDetails = {
  code: CurrencyCode
  symbol: string
  label: string
  rateFromBase: number // 1 INR = X units of this currency
  locale: string
}

export const SUPPORTED_CURRENCIES: Record<CurrencyCode, CurrencyDetails> = {
  // G8 & Major Global
  INR: { code: "INR",  symbol: "₹",    label: "INR (₹)",    rateFromBase: 1.0,      locale: "en-IN" },
  USD: { code: "USD",  symbol: "$",     label: "USD ($)",    rateFromBase: 0.0104,   locale: "en-US" },
  EUR: { code: "EUR",  symbol: "€",     label: "EUR (€)",    rateFromBase: 0.0089,   locale: "de-DE" },
  GBP: { code: "GBP",  symbol: "£",     label: "GBP (£)",    rateFromBase: 0.0077,   locale: "en-GB" },
  JPY: { code: "JPY",  symbol: "¥",     label: "JPY (¥)",    rateFromBase: 1.62,     locale: "ja-JP" },
  AUD: { code: "AUD",  symbol: "A$",    label: "AUD (A$)",   rateFromBase: 0.0157,   locale: "en-AU" },
  CAD: { code: "CAD",  symbol: "CA$",   label: "CAD (CA$)",  rateFromBase: 0.0142,   locale: "en-CA" },
  CHF: { code: "CHF",  symbol: "Fr",    label: "CHF (Fr)",   rateFromBase: 0.0094,   locale: "de-CH" },
  CNY: { code: "CNY",  symbol: "¥",     label: "CNY (¥)",    rateFromBase: 0.075,    locale: "zh-CN" },
  // Middle East & Asia-Pacific
  AED: { code: "AED",  symbol: "د.إ",   label: "AED (د.إ)",  rateFromBase: 0.0380,   locale: "ar-AE" },
  SAR: { code: "SAR",  symbol: "﷼",     label: "SAR (﷼)",    rateFromBase: 0.0388,   locale: "ar-SA" },
  SGD: { code: "SGD",  symbol: "S$",    label: "SGD (S$)",   rateFromBase: 0.0140,   locale: "en-SG" },
  HKD: { code: "HKD",  symbol: "HK$",   label: "HKD (HK$)",  rateFromBase: 0.0807,   locale: "zh-HK" },
  KRW: { code: "KRW",  symbol: "₩",     label: "KRW (₩)",    rateFromBase: 14.21,    locale: "ko-KR" },
  NZD: { code: "NZD",  symbol: "NZ$",   label: "NZD (NZ$)",  rateFromBase: 0.0178,   locale: "en-NZ" },
  // Regional & Noteworthy
  RUB: { code: "RUB",  symbol: "₽",     label: "RUB (₽)",    rateFromBase: 0.951,    locale: "ru-RU" },
  ZAR: { code: "ZAR",  symbol: "R",     label: "ZAR (R)",    rateFromBase: 0.191,    locale: "en-ZA" },
  BRL: { code: "BRL",  symbol: "R$",    label: "BRL (R$)",   rateFromBase: 0.053,    locale: "pt-BR" },
  TRY: { code: "TRY",  symbol: "₺",     label: "TRY (₺)",    rateFromBase: 0.358,    locale: "tr-TR" },
}

type CurrencyContextType = {
  currency: CurrencyCode
  setCurrency: (code: CurrencyCode) => void
  convert: (amountInINR: number) => number
  convertToINR: (amountInActiveCurrency: number) => number
  format: (amountInINR: number) => string
  symbol: string
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined)

const CURRENCY_STORAGE_KEY = "ctrlfund_selected_currency"

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencyCode>("INR")

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = localStorage.getItem(CURRENCY_STORAGE_KEY)
      if (stored && Object.keys(SUPPORTED_CURRENCIES).includes(stored)) {
        setCurrencyState(stored as CurrencyCode)
      }
    }
  }, [])

  const setCurrency = useCallback((code: CurrencyCode) => {
    setCurrencyState(code)
    if (typeof window !== "undefined") {
      localStorage.setItem(CURRENCY_STORAGE_KEY, code)
    }
  }, [])

  /** INR → active currency */
  const convert = useCallback((amountInINR: number): number => {
    const details = SUPPORTED_CURRENCIES[currency]
    return amountInINR * details.rateFromBase
  }, [currency])

  /** active currency → INR (for saving modal inputs) */
  const convertToINR = useCallback((amountInActiveCurrency: number): number => {
    const details = SUPPORTED_CURRENCIES[currency]
    return amountInActiveCurrency / details.rateFromBase
  }, [currency])

  const format = useCallback((amountInINR: number): string => {
    const details = SUPPORTED_CURRENCIES[currency]
    const converted = amountInINR * details.rateFromBase
    try {
      return new Intl.NumberFormat(details.locale, {
        style: "currency",
        currency: details.code,
      }).format(converted)
    } catch {
      return `${details.symbol}${converted.toFixed(2)}`
    }
  }, [currency])

  const symbol = SUPPORTED_CURRENCIES[currency].symbol

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency, convert, convertToINR, format, symbol }}>
      {children}
    </CurrencyContext.Provider>
  )
}

export const useCurrency = () => {
  const context = useContext(CurrencyContext)
  if (context === undefined) {
    throw new Error("useCurrency must be used within a CurrencyProvider")
  }
  return context
}
