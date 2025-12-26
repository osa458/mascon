import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import AttendeesClient from "@/components/attendees/AttendeesClient"

interface AttendeesPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getAttendeesData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      speakers: {
        select: {
          id: true,
          name: true,
          title: true,
          company: true,
          imageUrl: true,
        },
      },
    },
  })
  
  // Also get all users as "attendees"
  const users = await prisma.user.findMany({
    select: {
      id: true,
      name: true,
      title: true,
      company: true,
      image: true,
    },
    orderBy: { name: 'asc' },
    take: 100, // Limit for performance
  })
  
  return { event, users }
}

export default async function AttendeesPage({ params }: AttendeesPageProps) {
  const { eventSlug } = await params
  const { event, users } = await getAttendeesData(eventSlug)
  
  if (!event) {
    notFound()
  }

  type SpeakerType = typeof event.speakers[number]
  type UserType = typeof users[number]

  // Map speakers
  const speakers = event.speakers.map((s: SpeakerType) => ({
    id: s.id,
    name: s.name || "Unknown",
    title: s.title,
    company: s.company,
    image: s.imageUrl,
    role: "SPEAKER" as const,
  }))

  // Map attendees
  const attendees = users.map((u: UserType) => ({
    id: u.id,
    name: u.name || "Anonymous",
    title: u.title,
    company: u.company,
    image: u.image,
    role: "ATTENDEE" as const,
  }))

  const allPeople = [...speakers, ...attendees]

  // Categories for tabs
  const categories = ["SPEAKER"]

  // TODO: Get bookmarked IDs from database
  const bookmarkedIds: string[] = []

  return (
    <div className="flex flex-col min-h-screen">
      <Header 
        eventSlug={eventSlug}
        title="Attendees"
      />
      <AttendeesClient
        eventSlug={eventSlug}
        attendees={allPeople}
        bookmarkedIds={bookmarkedIds}
        categories={categories}
      />
    </div>
  )
}
