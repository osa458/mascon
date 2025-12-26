import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Bell, Pin } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface AnnouncementsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getAnnouncementsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      announcements: {
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      },
    },
  })
  return event
}

export default async function AnnouncementsPage({ params }: AnnouncementsPageProps) {
  const { eventSlug } = await params
  const event = await getAnnouncementsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  type AnnouncementType = typeof event.announcements[number]
  const pinnedAnnouncements = event.announcements.filter((a: AnnouncementType) => a.isPinned)
  const recentAnnouncements = event.announcements.filter((a: AnnouncementType) => !a.isPinned)

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Announcements" />
      
      <div className="flex-1 bg-gray-50 p-4 space-y-4">
        {/* Summary */}
        <div className="bg-white border border-gray-200 rounded-lg p-4 flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <Bell className="w-5 h-5 text-emerald-600" />
          </div>
          <div>
            <h2 className="font-semibold">Event Updates</h2>
            <p className="text-sm text-gray-500">
              {event.announcements.length} announcement{event.announcements.length !== 1 ? 's' : ''}
              {pinnedAnnouncements.length > 0 && ` • ${pinnedAnnouncements.length} pinned`}
            </p>
          </div>
        </div>

        {/* Pinned Announcements */}
        {pinnedAnnouncements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide flex items-center gap-1">
              <Pin className="w-3 h-3" /> Pinned
            </h3>
            {pinnedAnnouncements.map((announcement: AnnouncementType) => (
              <div
                key={announcement.id}
                className="bg-white border-2 border-emerald-200 rounded-lg p-4 shadow-sm"
              >
                <div className="flex items-start justify-between gap-2">
                  <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                  <Pin className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                </div>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{announcement.content}</p>
                <div className="text-xs text-gray-400 mt-3">
                  {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Recent Announcements */}
        {recentAnnouncements.length > 0 && (
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Recent</h3>
            {recentAnnouncements.map((announcement: AnnouncementType) => (
              <div
                key={announcement.id}
                className="bg-white border border-gray-200 rounded-lg p-4"
              >
                <h3 className="font-semibold text-gray-900">{announcement.title}</h3>
                <p className="text-sm text-gray-600 mt-2 whitespace-pre-wrap">{announcement.content}</p>
                <div className="text-xs text-gray-400 mt-3">
                  {formatDistanceToNow(announcement.createdAt, { addSuffix: true })}
                </div>
              </div>
            ))}
          </div>
        )}

        {event.announcements.length === 0 && (
          <div className="text-center py-12 text-gray-500">
            No announcements yet
          </div>
        )}
      </div>
    </div>
  )
}
