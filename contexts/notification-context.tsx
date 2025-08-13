"use client"

import type React from "react"
import { createContext, useState, useContext, useCallback } from "react"
import { ToastProvider, ToastViewport } from "@/components/ui/toast"
import { useToast } from "@/hooks/use-toast" // Assuming this is a shadcn/ui toast hook
import { cn } from "@/lib/utils"

export type NotificationType = "success" | "error" | "info"

export type Notification = {
  id: number
  message: string
  type: NotificationType
}

type NotificationContextType = {
  addNotification: (notification: Omit<Notification, "id">) => void
}

export const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()

  const addNotification = useCallback(
    (notification: Omit<Notification, "id">) => {
      const newNotification = { id: Date.now(), ...notification }
      setNotifications((prev) => [...prev, newNotification])

      toast({
        title: notification.type.charAt(0).toUpperCase() + notification.type.slice(1),
        description: notification.message,
        variant: notification.type === "error" ? "destructive" : "default",
        className: cn(
          "border",
          notification.type === "success" && "bg-green-900/20 border-green-700 text-green-400",
          notification.type === "error" && "bg-red-900/20 border-red-700 text-red-400",
          notification.type === "info" && "bg-blue-900/20 border-blue-700 text-blue-400",
        ),
      })
    },
    [toast],
  )

  return (
    <NotificationContext.Provider value={{ addNotification }}>
      {children}
      {/* ToastProvider and ToastViewport are typically rendered once at the root */}
      <ToastProvider>
        {/* Toasts are managed by useToast hook, no need to render them here directly from state */}
        <ToastViewport />
      </ToastProvider>
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
