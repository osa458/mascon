"use client"

import { useState } from "react"
import Link from "next/link"
import { format } from "date-fns"
import { Clock, MapPin, Users, Heart, MessageSquare, Plus, ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

interface Session {
  id: string
  title: string
  description?: string | null
  startTime: Date | string
  endTime: Date | string
  room?: { name: string } | null
  speakers: { speaker: { id: string; name: string; imageUrl?: string | null } }[]
  likesCount: number
  commentsCount: number
  isInMyAgenda?: boolean
  isCustom?: boolean
}

interface SessionCardProps {
  session: Session
  eventSlug: string
  onToggleAgenda?: (sessionId: string) => void
}

function SessionCard({ session, eventSlug, onToggleAgenda }: SessionCardProps) {
  const startTime = new Date(session.startTime)
  const endTime = new Date(session.endTime)

  return (
    <Link
      href={`/e/${eventSlug}/agenda/${session.id}`}
      className="block bg-white border border-gray-200 rounded-lg p-4 hover:border-gray-300 transition-colors"
    >
      <div className="flex gap-3">
        {/* Time Column */}
        <div className="flex-shrink-0 text-center min-w-[60px]">
          <div className="text-sm font-semibold text-sky-600">
            {format(startTime, "h:mm a")}
          </div>
          <div className="text-xs text-gray-500">
            {format(endTime, "h:mm a")}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-gray-900 line-clamp-2">{session.title}</h3>

          {session.room && (
            <div className="flex items-center gap-1 mt-1 text-sm text-gray-500">
              <MapPin className="w-3 h-3" />
              <span>{session.room.name}</span>
            </div>
          )}

          {/* Speakers */}
          {session.speakers.length > 0 && (
            <div className="flex items-center gap-2 mt-2">
              {session.speakers.slice(0, 3).map(({ speaker }) => (
                <div key={speaker.id} className="flex items-center gap-1">
                  <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                    {speaker.imageUrl ? (
                      <img src={speaker.imageUrl} alt={speaker.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-xs text-gray-500">
                        {speaker.name.charAt(0)}
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-gray-600">{speaker.name}</span>
                </div>
              ))}
            </div>
          )}

          {/* Stats */}
          <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <Users className="w-3 h-3" /> 42
            </span>
            <span className="flex items-center gap-1">
              <Heart className="w-3 h-3" /> {session.likesCount}
            </span>
            <span className="flex items-center gap-1">
              <MessageSquare className="w-3 h-3" /> {session.commentsCount}
            </span>
          </div>
        </div>

        {/* Add to agenda button */}
        <button
          onClick={(e) => {
            e.preventDefault()
            onToggleAgenda?.(session.id)
          }}
          className={cn(
            "flex-shrink-0 p-2 rounded-full transition-colors",
            session.isInMyAgenda
              ? "bg-sky-100 text-sky-600"
              : "bg-gray-100 text-gray-400 hover:bg-gray-200"
          )}
        >
          <Plus className={cn("w-5 h-5", session.isInMyAgenda && "rotate-45")} />
        </button>
      </div>
    </Link>
  )
}

interface AgendaClientProps {
  eventSlug: string
  eventId: string
  dates: string[]
  sessions: Record<string, Session[]>
  myAgendaSessionIds: string[]
}

export default function AgendaClient({ eventSlug, eventId, dates, sessions, myAgendaSessionIds }: AgendaClientProps) {
  const [activeTab, setActiveTab] = useState<"full" | "my">("full")
  const [activeDateIndex, setActiveDateIndex] = useState(0)
  const [myAgenda, setMyAgenda] = useState<Set<string>>(new Set(myAgendaSessionIds))

  const currentDate = dates[activeDateIndex]
  const currentSessions = sessions[currentDate] || []

  const myAgendaSessions = Object.values(sessions)
    .flat()
    .filter(s => myAgenda.has(s.id))
    .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())

  const handleToggleAgenda = async (sessionId: string) => {
    const isInAgenda = myAgenda.has(sessionId)

    // Optimistic update
    setMyAgenda(prev => {
      const next = new Set(prev)
      if (next.has(sessionId)) {
        next.delete(sessionId)
      } else {
        next.add(sessionId)
      }
      return next
    })

    try {
      if (isInAgenda) {
        // Check if this is a custom item - custom items are not in the sessions list
        // or have isCustom flag. For custom items, use itemId; for regular sessions, use sessionId
        const allSessions = Object.values(sessions).flat()
        const sessionData = allSessions.find(s => s.id === sessionId)
        const isCustomItem = sessionData?.isCustom ?? !allSessions.some(s => s.id === sessionId && !s.isCustom)

        if (isCustomItem) {
          await fetch(`/api/agenda?itemId=${sessionId}`, { method: 'DELETE' })
        } else {
          await fetch(`/api/agenda?sessionId=${sessionId}`, { method: 'DELETE' })
        }
      } else {
        await fetch('/api/agenda', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ sessionId, eventId }),
        })
      }
    } catch (error) {
      // Revert on error
      setMyAgenda(prev => {
        const next = new Set(prev)
        if (isInAgenda) {
          next.add(sessionId)
        } else {
          next.delete(sessionId)
        }
        return next
      })
    }
  }

  // Group sessions by time slot
  const groupedSessions = currentSessions.reduce((acc, session) => {
    const key = format(new Date(session.startTime), "h:mm a")
    if (!acc[key]) acc[key] = []
    acc[key].push({ ...session, isInMyAgenda: myAgenda.has(session.id) })
    return acc
  }, {} as Record<string, Session[]>)

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="sticky top-14 z-30 bg-white border-b">
        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as "full" | "my")}>
          <TabsList className="w-full justify-start rounded-none border-b h-auto p-0 bg-transparent">
            <TabsTrigger
              value="full"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent"
            >
              Full Agenda
            </TabsTrigger>
            <TabsTrigger
              value="my"
              className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-sky-500 data-[state=active]:bg-transparent"
            >
              My Agenda ({myAgenda.size})
            </TabsTrigger>
          </TabsList>
        </Tabs>

        {/* Date Navigation */}
        {activeTab === "full" && dates.length > 0 && (
          <div className="flex items-center justify-between px-4 py-2 bg-gray-50">
            <button
              onClick={() => setActiveDateIndex(Math.max(0, activeDateIndex - 1))}
              disabled={activeDateIndex === 0}
              className="p-1 disabled:opacity-30"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <span className="font-medium">
              {format(new Date(currentDate), "EEEE, MMM d")}
            </span>
            <button
              onClick={() => setActiveDateIndex(Math.min(dates.length - 1, activeDateIndex + 1))}
              disabled={activeDateIndex === dates.length - 1}
              className="p-1 disabled:opacity-30"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-4 space-y-4">
        {activeTab === "full" ? (
          Object.entries(groupedSessions).length > 0 ? (
            Object.entries(groupedSessions).map(([time, timeSessions]) => (
              <div key={time} className="space-y-2">
                <h4 className="text-sm font-semibold text-gray-500 sticky top-0 bg-gray-50 py-1">
                  {time}
                </h4>
                {timeSessions.map(session => (
                  <SessionCard
                    key={session.id}
                    session={session}
                    eventSlug={eventSlug}
                    onToggleAgenda={handleToggleAgenda}
                  />
                ))}
              </div>
            ))
          ) : (
            <div className="text-center py-12 text-gray-500">
              No sessions scheduled for this day
            </div>
          )
        ) : (
          <div className="space-y-4">
            {myAgendaSessions.length > 0 ? (
              myAgendaSessions.map(session => (
                <SessionCard
                  key={session.id}
                  session={{ ...session, isInMyAgenda: true }}
                  eventSlug={eventSlug}
                  onToggleAgenda={handleToggleAgenda}
                />
              ))
            ) : (
              <div className="text-center py-12">
                <p className="text-gray-500 mb-4">No sessions in your agenda yet</p>
                <Button variant="outline" onClick={() => setActiveTab("full")}>
                  Browse Sessions
                </Button>
              </div>
            )}

            {/* Add Custom Activity */}
            <Button variant="outline" className="w-full" asChild>
              <Link href={`/e/${eventSlug}/agenda/new`}>
                <Plus className="w-4 h-4 mr-2" /> Add My Own Activity
              </Link>
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
