"use client"

import { AnimatePresence, motion } from "framer-motion"
import { XCircle, CheckCircle, Info, AlertTriangle, X } from "lucide-react"
import type { Notification } from "@/contexts/notification-context"
import { Button } from "@/components/ui/button"

type NotificationPanelProps = {
  notifications: Notification[]
  onRemove: (id: string) => void
}

const getIcon = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return <CheckCircle className="h-5 w-5 text-green-500" />
    case "error":
      return <XCircle className="h-5 w-5 text-red-500" />
    case "info":
      return <Info className="h-5 w-5 text-blue-500" />
    case "warning":
      return <AlertTriangle className="h-5 w-5 text-yellow-500" />
    default:
      return null
  }
}

const getBgColor = (type: Notification["type"]) => {
  switch (type) {
    case "success":
      return "bg-green-900/80 border-green-700"
    case "error":
      return "bg-red-900/80 border-red-700"
    case "info":
      return "bg-blue-900/80 border-blue-700"
    case "warning":
      return "bg-yellow-900/80 border-yellow-700"
    default:
      return "bg-gray-800/80 border-gray-700"
  }
}

export function NotificationPanel({ notifications, onRemove }: NotificationPanelProps) {
  // This component is not directly used as useToast from shadcn/ui handles rendering.
  // It can be removed or repurposed if a custom notification display is desired.
  return (
    <div className="fixed bottom-4 right-4 z-50 flex flex-col-reverse gap-3">
      <AnimatePresence>
        {notifications.map((notification) => (
          <motion.div
            key={notification.id}
            initial={{ opacity: 0, y: 50, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, transition: { duration: 0.3 } }}
            layout
            className={`flex items-center gap-3 p-4 rounded-lg shadow-lg backdrop-blur-sm text-white border ${getBgColor(
              notification.type,
            )}`}
            role="alert"
            aria-live="assertive"
          >
            {getIcon(notification.type)}
            <p className="text-sm font-medium flex-grow">{notification.message}</p>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => onRemove(notification.id)}
              className="h-6 w-6 text-white/70 hover:bg-white/20 hover:text-white"
              aria-label="Close notification"
            >
              <X className="h-4 w-4" />
            </Button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
