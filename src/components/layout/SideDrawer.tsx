"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { 
  User, 
  QrCode, 
  Users, 
  StickyNote, 
  Settings, 
  Calendar,
  X,
  ChevronRight,
  LogOut,
  HelpCircle
} from "lucide-react"
import { signOut } from "next-auth/react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

interface SideDrawerProps {
  isOpen: boolean
  onClose: () => void
  user?: {
    name?: string | null
    email?: string | null
    image?: string | null
  }
  currentEvent?: {
    name: string
    logoUrl?: string | null
    slug: string
  }
}

const menuItems = [
  { label: "Edit Profile", icon: User, href: "/profile" },
  { label: "My Contact Info & QR Code", icon: QrCode, href: "/profile/qr" },
  { label: "My Contacts", icon: Users, href: "/profile/contacts" },
  { label: "My Notes", icon: StickyNote, href: "/profile/notes" },
  { label: "Settings", icon: Settings, href: "/settings" },
]

export function SideDrawer({ isOpen, onClose, user, currentEvent }: SideDrawerProps) {
  const pathname = usePathname()

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div 
        className={cn(
          "fixed top-0 left-0 z-50 h-full w-80 max-w-[85vw] bg-white shadow-xl transition-transform duration-300 ease-in-out",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b">
            <div className="flex items-center gap-3">
              <Avatar className="h-12 w-12">
                <AvatarImage src={user?.image || undefined} />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase() || "U"}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <p className="font-semibold truncate">{user?.name || "Guest"}</p>
                <p className="text-sm text-gray-500 truncate">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Current Event */}
          {currentEvent && (
            <div className="p-4 border-b bg-gray-50">
              <div className="flex items-center gap-3">
                {currentEvent.logoUrl ? (
                  <img 
                    src={currentEvent.logoUrl} 
                    alt={currentEvent.name}
                    className="w-10 h-10 rounded object-contain"
                  />
                ) : (
                  <Calendar className="w-10 h-10 text-gray-400" />
                )}
                <div className="flex-1 min-w-0">
                  <p className="font-medium truncate">{currentEvent.name}</p>
                  <Link 
                    href="/events"
                    className="text-sm text-sky-500 hover:underline"
                    onClick={onClose}
                  >
                    Go to All Events
                  </Link>
                </div>
              </div>
            </div>
          )}

          {/* Menu Items */}
          <nav className="flex-1 overflow-y-auto py-2">
            {menuItems.map((item) => {
              const isActive = pathname === item.href
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={onClose}
                  className={cn(
                    "flex items-center gap-3 px-4 py-3 hover:bg-gray-50 transition-colors",
                    isActive && "bg-sky-50 text-sky-600"
                  )}
                >
                  <item.icon className="w-5 h-5" />
                  <span className="flex-1">{item.label}</span>
                  <ChevronRight className="w-4 h-4 text-gray-400" />
                </Link>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t p-4 space-y-2">
            <Link
              href="/help"
              onClick={onClose}
              className="flex items-center gap-3 px-2 py-2 text-gray-600 hover:text-gray-900"
            >
              <HelpCircle className="w-5 h-5" />
              <span>Help & Support</span>
            </Link>
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="flex items-center gap-3 px-2 py-2 text-red-600 hover:text-red-700 w-full"
            >
              <LogOut className="w-5 h-5" />
              <span>Sign Out</span>
            </button>
          </div>
        </div>
      </div>
    </>
  )
}
