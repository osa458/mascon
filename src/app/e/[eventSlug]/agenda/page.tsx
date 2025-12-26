import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { format } from "date-fns"
import { Header } from "@/components/layout/Header"
import AgendaClient from "@/components/agenda/AgendaClient"

interface AgendaPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getAgendaData(slug: string) {
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
  return event
}

export default async function AgendaPage({ params }: AgendaPageProps) {
  const { eventSlug } = await params
  const event = await getAgendaData(eventSlug)
  
  if (!event) {
    notFound()
  }

  // Group sessions by date
  const sessionsByDate: Record<string, typeof event.sessions> = {}
  const dates: string[] = []
  
  for (const session of event.sessions) {
    const dateKey = format(session.startTime, "yyyy-MM-dd")
    if (!sessionsByDate[dateKey]) {
      sessionsByDate[dateKey] = []
      dates.push(dateKey)
    }
    sessionsByDate[dateKey].push(session)
  }

  // Transform for client component
  type SessionType = typeof event.sessions[number]
  type SpeakerType = SessionType['speakers'][number]
  
  const sessionsForClient = Object.fromEntries(
    Object.entries(sessionsByDate).map(([date, sessions]) => [
      date,
      sessions.map((s: SessionType) => ({
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
      })),
    ])
  )

  // TODO: Get actual my agenda from database
  const myAgendaSessionIds: string[] = []

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        eventSlug={eventSlug}
        title="Agenda"
      />
      <AgendaClient
        eventSlug={eventSlug}
        dates={dates}
        sessions={sessionsForClient}
        myAgendaSessionIds={myAgendaSessionIds}
      />
    </div>
  )
}
