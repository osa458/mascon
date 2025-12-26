import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import prisma from "@/lib/db"
import { authOptions } from "@/lib/auth"
import { format } from "date-fns"
import { Calendar, MapPin, ChevronRight } from "lucide-react"
import Link from "next/link"

async function getEvents() {
  const events = await prisma.event.findMany({
    where: { isPublished: true },
    orderBy: { startDate: 'asc' },
    include: {
      venue: true,
    },
  })
  return events
}

export default async function EventsPage() {
  const session = await getServerSession(authOptions)
  
  console.log('[Events] Session check:', session?.user?.id, session?.user?.email)
  
  if (!session?.user?.id) {
    console.log('[Events] No session, redirecting to login')
    redirect("/auth/login")
  }

  const events = await getEvents()

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-center h-14 px-4 max-w-lg mx-auto">
          <h1 className="font-semibold text-lg">My Events</h1>
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {events.length > 0 ? (
          events.map((event: typeof events[number]) => (
            <Link
              key={event.id}
              href={`/e/${event.slug}`}
              className="block bg-white rounded-lg border overflow-hidden hover:border-gray-300 transition-colors"
            >
              {/* Banner */}
              {event.bannerUrl && (
                <div className="h-32 bg-gray-200">
                  <img
                    src={event.bannerUrl}
                    alt={event.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              
              <div className="p-4">
                <div className="flex items-start gap-3">
                  {event.logoUrl && (
                    <img
                      src={event.logoUrl}
                      alt={event.name}
                      className="w-12 h-12 rounded-lg object-contain bg-gray-100"
                    />
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h2 className="font-semibold text-lg">{event.name}</h2>
                    {event.tagline && (
                      <p className="text-sm text-gray-500 truncate">{event.tagline}</p>
                    )}
                    
                    <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {format(event.startDate, "MMM d")} - {format(event.endDate, "d, yyyy")}
                      </span>
                      {event.venue && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-4 h-4" />
                          {event.city}, {event.state}
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <ChevronRight className="w-5 h-5 text-gray-400 flex-shrink-0" />
                </div>
              </div>
            </Link>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No events available</p>
            <p className="text-sm mt-2">Check back later for upcoming events</p>
          </div>
        )}
      </div>
    </div>
  )
}
