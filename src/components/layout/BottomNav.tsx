"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, Calendar, Users, MessageSquare, MessagesSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface BottomNavProps {
  eventSlug: string
  unreadMessages?: number
  unreadCommunity?: number
}

const navItems = [
  { label: "Home", icon: Home, path: "" },
  { label: "Agenda", icon: Calendar, path: "/agenda" },
  { label: "Attendees", icon: Users, path: "/attendees" },
  { label: "Community", icon: MessagesSquare, path: "/community" },
  { label: "Messages", icon: MessageSquare, path: "/messages" },
]

export function BottomNav({ eventSlug, unreadMessages = 0, unreadCommunity = 0 }: BottomNavProps) {
  const pathname = usePathname()
  const basePath = `/e/${eventSlug}`

  const getBadgeCount = (path: string) => {
    if (path === "/messages") return unreadMessages
    if (path === "/community") return unreadCommunity
    return 0
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-200 safe-area-pb">
      <div className="flex items-center justify-around h-16 max-w-lg mx-auto">
        {navItems.map((item) => {
          const href = `${basePath}${item.path}`
          const isActive = item.path === "" 
            ? pathname === basePath || pathname === `${basePath}/`
            : pathname.startsWith(href)
          const badgeCount = getBadgeCount(item.path)

          return (
            <Link
              key={item.path}
              href={href}
              className={cn(
                "flex flex-col items-center justify-center flex-1 h-full gap-1 relative",
                "transition-colors duration-200",
                isActive ? "text-sky-500" : "text-gray-500 hover:text-gray-700"
              )}
            >
              <div className="relative">
                <item.icon className="w-6 h-6" />
                {badgeCount > 0 && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                    {badgeCount > 99 ? "99+" : badgeCount}
                  </span>
                )}
              </div>
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
