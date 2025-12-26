import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { Header } from "@/components/layout/Header"
import AgendaClient from "@/components/agenda/AgendaClient"

interface AgendaPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getAgendaData(slug: string, userId?: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      sessions: {
        orderBy: { startTime: 'asc' },
        include: {
          room: true,
          speakers: {
            include: {
              speaker: true,
            },
          },
        },
      },
    },
  })

  if (!event) return null

  // Get user's my agenda items
  let myAgendaItems: { sessionId: string | null; isCustom: boolean; customTitle: string | null; customStartTime: Date | null; customEndTime: Date | null; customLocation: string | null; id: string }[] = []

  if (userId) {
    myAgendaItems = await prisma.myAgendaItem.findMany({
      where: {
        userId,
        eventId: event.id,
      },
      select: {
        id: true,
        sessionId: true,
        isCustom: true,
        customTitle: true,
        customStartTime: true,
        customEndTime: true,
        customLocation: true,
      },
    })
  }

  return { event, myAgendaItems }
}

export default async function AgendaPage({ params }: AgendaPageProps) {
  const { eventSlug } = await params
  const session = await getServerSession(authOptions)
  const data = await getAgendaData(eventSlug, session?.user?.id)

  if (!data) {
    notFound()
  }

  const { event, myAgendaItems } = data

  // Group sessions by date
  const sessionsByDate: Record<string, typeof event.sessions> = {}
  const dates: string[] = []

  for (const eventSession of event.sessions) {
    const dateKey = format(eventSession.startTime, "yyyy-MM-dd")
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = []
      dates.push(dateKey)
    }
    sessionsByDate[dateKey].push(eventSession)
  }

  // Add custom activities to the dates
  const customActivities = myAgendaItems.filter(item => item.isCustom && item.customStartTime)
  for (const activity of customActivities) {
    if (activity.customStartTime) {
      const dateKey = format(activity.customStartTime, "yyyy-MM-dd")
      if (!dates.includes(dateKey)) {
        dates.push(dateKey)
        sessionsByDate[dateKey] = []
      }
    }
  }
  dates.sort()

  // Transform for client component
  type SessionType = typeof event.sessions[number]
  type SpeakerType = SessionType['speakers'][number]

  const sessionsForClient = Object.fromEntries(
    Object.entries(sessionsByDate).map(([date, sessions]) => [
      date,
      [
        // Regular sessions
        ...sessions.map((s: SessionType) => ({
          id: s.id,
          title: s.title,
          description: s.description,
          startTime: s.startTime.toISOString(),
          endTime: s.endTime.toISOString(),
          room: s.room,
          speakers: s.speakers.map((sp: SpeakerType) => ({
            speaker: {
              id: sp.speaker.id,
              name: sp.speaker.name,
              imageUrl: sp.speaker.imageUrl,
            },
          })),
          likesCount: s.likesCount,
          commentsCount: s.commentsCount,
          isCustom: false,
        })),
        // Custom activities for this date
        ...customActivities
          .filter(a => a.customStartTime && format(a.customStartTime, "yyyy-MM-dd") === date)
          .map(a => ({
            id: a.id,
            title: a.customTitle || "Custom Activity",
            description: null,
            startTime: a.customStartTime!.toISOString(),
            endTime: a.customEndTime!.toISOString(),
            room: a.customLocation ? { name: a.customLocation } : null,
            speakers: [],
            likesCount: 0,
            commentsCount: 0,
            isCustom: true,
          })),
      ].sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime()),
    ])
  )

  // Get session IDs that are in user's agenda
  const myAgendaSessionIds = myAgendaItems
    .filter(item => item.sessionId !== null)
    .map(item => item.sessionId as string)

  // Also include custom activity IDs
  const customActivityIds = myAgendaItems
    .filter(item => item.isCustom)
    .map(item => item.id)

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        eventSlug={eventSlug}
        title="Agenda"
      />
      <AgendaClient
        eventSlug={eventSlug}
        eventId={event.id}
        dates={dates}
        sessions={sessionsForClient}
        myAgendaSessionIds={[...myAgendaSessionIds, ...customActivityIds]}
      />
    </div>
  )
}

