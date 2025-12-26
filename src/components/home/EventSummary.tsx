import { formatDateRange } from "@/lib/utils"

interface EventSummaryProps {
  name: string
  city?: string | null
  state?: string | null
  startDate: Date | string
  endDate: Date | string
}

export function EventSummary({ name, city, state, startDate, endDate }: EventSummaryProps) {
  const location = [city, state].filter(Boolean).join(", ")
  
  return (
    <div className="px-4 py-4 bg-white">
      <h2 className="text-xl font-bold text-gray-900">{name}</h2>
      {location && (
        <p className="text-gray-600 mt-0.5">{location}</p>
      )}
      <p className="text-gray-600">{formatDateRange(startDate, endDate)}</p>
    </div>
  )
}
