"use client"

import { useState } from "react"
import { useSession } from "next-auth/react"
import { Bell } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { SideDrawer } from "./SideDrawer"
import Link from "next/link"

interface HeaderProps {
  eventName?: string
  eventSlug?: string
  eventLogoUrl?: string | null
  showBack?: boolean
  title?: string
  notificationCount?: number
}

export function Header({ 
  eventName, 
  eventSlug,
  eventLogoUrl,
  showBack,
  title,
  notificationCount = 0 
}: HeaderProps) {
  const { data: session } = useSession()
  const [drawerOpen, setDrawerOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200 safe-area-pt">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          {/* Left - Avatar */}
          <button
            onClick={() => setDrawerOpen(true)}
            className="flex items-center"
          >
            <Avatar className="h-8 w-8">
              <AvatarImage src={session?.user?.image || undefined} />
              <AvatarFallback className="bg-sky-100 text-sky-600 text-sm">
                {session?.user?.name?.charAt(0)?.toUpperCase() || "U"}
              </AvatarFallback>
            </Avatar>
          </button>

          {/* Center - Title */}
          <div className="flex-1 text-center">
            {title ? (
              <h1 className="font-semibold text-lg truncate px-4">{title}</h1>
            ) : eventName ? (
              <h1 className="font-semibold text-lg truncate px-4">{eventName}</h1>
            ) : null}
          </div>

          {/* Right - Notifications */}
          <Link
            href={eventSlug ? `/e/${eventSlug}/notifications` : "/notifications"}
            className="relative p-2 hover:bg-gray-100 rounded-full"
          >
            <Bell className="w-5 h-5" />
            {notificationCount > 0 && (
              <span className="absolute top-0 right-0 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-xs font-bold rounded-full px-1">
                {notificationCount > 99 ? "99+" : notificationCount}
              </span>
            )}
          </Link>
        </div>
      </header>

      <SideDrawer
        isOpen={drawerOpen}
        onClose={() => setDrawerOpen(false)}
        user={session?.user}
        currentEvent={eventSlug ? {
          name: eventName || "",
          logoUrl: eventLogoUrl,
          slug: eventSlug,
        } : undefined}
      />
    </>
  )
}
