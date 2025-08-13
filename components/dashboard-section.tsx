import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"

type ActivityItem = {
  timestamp: string
  details: string
  user: string
}

type DashboardSectionProps = {
  title: string
  data: ActivityItem[]
  type: "login" | "transaction" | "receipt"
}

export function DashboardSection({ title, data, type }: DashboardSectionProps) {
  const getIcon = (itemType: string) => {
    switch (itemType) {
      case "login":
        return "➡️"
      case "transaction":
        return "💸"
      case "receipt":
        return "🧾"
      default:
        return ""
    }
  }

  return (
    <Card className="card-gradient border-[#393E46]">
      <CardHeader>
        <CardTitle className="text-xl text-[#00ADB5]">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        {data.length === 0 ? (
          <p className="text-[#EEEEEE]/70 text-sm">No activity for this section today.</p>
        ) : (
          <ScrollArea className="h-[200px]">
            <div className="space-y-3">
              {data.map((item, index) => (
                <div key={index} className="flex items-start space-x-2 text-sm">
                  <span className="text-[#00ADB5]">{getIcon(type)}</span>
                  <div>
                    <p className="text-[#EEEEEE]">{item.details}</p>
                    <p className="text-xs text-[#EEEEEE]/70">
                      <span className="font-medium">{item.user}</span> at {format(new Date(item.timestamp), "hh:mm a")}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
