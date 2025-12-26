"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, Bookmark, MessageSquare, Calendar, Filter } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"
import { FeatureFlags } from "@/types"

interface Attendee {
  id: string
  name: string
  title?: string | null
  company?: string | null
  image?: string | null
  role: string
  isBookmarked?: boolean
}

interface AttendeeCardProps {
  attendee: Attendee
  eventSlug: string
  onBookmark?: (id: string) => void
}

function AttendeeCard({ attendee, eventSlug, onBookmark }: AttendeeCardProps) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white border border-gray-200 rounded-lg">
      <Link href={`/e/${eventSlug}/attendees/${attendee.id}`} className="flex-shrink-0">
        <Avatar className="h-12 w-12">
          <AvatarImage src={attendee.image || undefined} />
          <AvatarFallback className="bg-sky-100 text-sky-600">
            {attendee.name.charAt(0).toUpperCase()}
          </AvatarFallback>
        </Avatar>
      </Link>
      
      <Link 
        href={`/e/${eventSlug}/attendees/${attendee.id}`}
        className="flex-1 min-w-0"
      >
        <div className="flex items-center gap-2">
          <span className="font-medium truncate">{attendee.name}</span>
          {attendee.role !== "ATTENDEE" && (
            <Badge variant="secondary" className="text-xs">
              {attendee.role.toLowerCase()}
            </Badge>
          )}
        </div>
        {(attendee.title || attendee.company) && (
          <p className="text-sm text-gray-500 truncate">
            {[attendee.title, attendee.company].filter(Boolean).join(" at ")}
          </p>
        )}
      </Link>
      
      <div className="flex items-center gap-1">
        <button
          onClick={() => onBookmark?.(attendee.id)}
          className={cn(
            "p-2 rounded-full transition-colors",
            attendee.isBookmarked 
              ? "text-sky-500 bg-sky-50" 
              : "text-gray-400 hover:bg-gray-100"
          )}
        >
          <Bookmark className={cn("w-5 h-5", attendee.isBookmarked && "fill-current")} />
        </button>
      </div>
    </div>
  )
}

interface AttendeesClientProps {
  eventSlug: string
  attendees: Attendee[]
  bookmarkedIds: string[]
  categories: string[]
}

export default function AttendeesClient({ 
  eventSlug, 
  attendees, 
  bookmarkedIds: initialBookmarked,
  categories 
}: AttendeesClientProps) {
  const [search, setSearch] = useState("")
  const [activeTab, setActiveTab] = useState<string>("all")
  const [bookmarked, setBookmarked] = useState<Set<string>>(new Set(initialBookmarked))

  const handleBookmark = (id: string) => {
    setBookmarked(prev => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
    // TODO: API call to persist
  }

  let filteredAttendees = attendees.map(a => ({
    ...a,
    isBookmarked: bookmarked.has(a.id),
  }))

  // Search filter
  if (search) {
    const searchLower = search.toLowerCase()
    filteredAttendees = filteredAttendees.filter(a => 
      a.name.toLowerCase().includes(searchLower) ||
      a.title?.toLowerCase().includes(searchLower) ||
      a.company?.toLowerCase().includes(searchLower)
    )
  }

  // Tab filter
  if (activeTab === "bookmarked") {
    filteredAttendees = filteredAttendees.filter(a => a.isBookmarked)
  } else if (activeTab !== "all" && activeTab !== "recommended") {
    filteredAttendees = filteredAttendees.filter(a => a.role === activeTab.toUpperCase())
  }

  const tabs = [
    { value: "all", label: "All" },
    ...(FeatureFlags.RECOMMENDATIONS ? [{ value: "recommended", label: "Recommended" }] : []),
    { value: "bookmarked", label: "Bookmarked" },
    ...categories.map(c => ({ value: c.toLowerCase(), label: c })),
  ]

  return (
    <div className="flex flex-col h-full">
      {/* Search */}
      <div className="sticky top-14 z-30 bg-white p-4 border-b">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search attendees..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>
      
      {/* Tabs */}
      <div className="sticky top-[7.5rem] z-30 bg-white border-b overflow-x-auto scrollbar-hide">
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="w-auto min-w-full justify-start rounded-none h-auto p-0 bg-transparent">
            {tabs.map(tab => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="flex-shrink-0 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent px-4 py-3"
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>
      
      {/* Attendee Count */}
      <div className="px-4 py-2 text-sm text-gray-500 bg-gray-50">
        {filteredAttendees.length} attendee{filteredAttendees.length !== 1 ? "s" : ""}
      </div>
      
      {/* List */}
      <div className="flex-1 overflow-auto p-4 space-y-2">
        {filteredAttendees.length > 0 ? (
          filteredAttendees.map(attendee => (
            <AttendeeCard
              key={attendee.id}
              attendee={attendee}
              eventSlug={eventSlug}
              onBookmark={handleBookmark}
            />
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            {search ? "No attendees found matching your search" : "No attendees to display"}
          </div>
        )}
      </div>
    </div>
  )
}
