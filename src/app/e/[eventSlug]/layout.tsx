import { notFound } from "next/navigation"
import prisma from "@/lib/db"
import { BottomNav } from "@/components/layout/BottomNav"

interface EventLayoutProps {
  children: React.ReactNode
  params: Promise<{ eventSlug: string }>
}

async function getEvent(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
    },
  })
  return event
}

export default async function EventLayout({ children, params }: EventLayoutProps) {
  const { eventSlug } = await params
  const event = await getEvent(eventSlug)
  
  if (!event) {
    notFound()
  }

  // TODO: Get actual unread counts from database
  const unreadMessages = 51
  const unreadCommunity = 2

  return (
    <div className="pb-nav">
      {children}
      <BottomNav 
        eventSlug={eventSlug}
        unreadMessages={unreadMessages}
        unreadCommunity={unreadCommunity}
      />
    </div>
  )
}
