"use client"

import Link from "next/link"
import { 
  Trophy, 
  Camera, 
  MessageCircleQuestion, 
  BarChart3, 
  Baby, 
  Moon,
  Building2,
  Bus,
  Calendar,
  FileText,
  Heart,
  MapPinned
} from "lucide-react"
import { cn } from "@/lib/utils"

interface ResourceTile {
  label: string
  icon: string
  route: string
  hasNew?: boolean
}

interface ResourceGridProps {
  eventSlug: string
  tiles: ResourceTile[]
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  trophy: Trophy,
  camera: Camera,
  "message-circle-question": MessageCircleQuestion,
  "bar-chart": BarChart3,
  baby: Baby,
  moon: Moon,
  building: Building2,
  bus: Bus,
  calendar: Calendar,
  "file-text": FileText,
  heart: Heart,
  "map-pinned": MapPinned,
}

const defaultTiles: ResourceTile[] = [
  { label: "Leaderboard", icon: "trophy", route: "/leaderboard", hasNew: true },
  { label: "Photos", icon: "camera", route: "/photos" },
  { label: "Session Q&A", icon: "message-circle-question", route: "/session-qa" },
  { label: "Polls", icon: "bar-chart", route: "/polls", hasNew: true },
  { label: "Kids", icon: "baby", route: "/kids" },
  { label: "Prayer", icon: "moon", route: "/prayer" },
  { label: "Exhibitors", icon: "building", route: "/exhibitors" },
  { label: "Shuttle", icon: "bus", route: "/shuttle" },
  { label: "Agenda", icon: "calendar", route: "/agenda" },
  { label: "Documents", icon: "file-text", route: "/documents" },
  { label: "Sponsors", icon: "heart", route: "/sponsors" },
  { label: "Logistics", icon: "map-pinned", route: "/logistics", hasNew: true },
]

export function ResourceGrid({ eventSlug, tiles = defaultTiles }: ResourceGridProps) {
  return (
    <div className="px-4 py-6 bg-white">
      <h3 className="text-lg font-semibold text-gray-900 mb-4">
        Additional Resources
      </h3>
      
      <div className="grid grid-cols-3 gap-3">
        {tiles.map((tile) => {
          const IconComponent = iconMap[tile.icon] || Calendar
          
          return (
            <Link
              key={tile.route}
              href={`/e/${eventSlug}${tile.route}`}
              className={cn(
                "relative flex flex-col items-center justify-center",
                "p-4 rounded-xl border border-gray-200 bg-white",
                "hover:bg-gray-50 hover:border-gray-300 transition-all",
                "min-h-[90px]"
              )}
            >
              {/* New indicator dot */}
              {tile.hasNew && (
                <span className="absolute top-2 right-2 w-2.5 h-2.5 bg-red-500 rounded-full" />
              )}
              
              <IconComponent className="w-6 h-6 text-gray-600 mb-2" />
              <span className="text-sm font-medium text-gray-700 text-center leading-tight">
                {tile.label}
              </span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
