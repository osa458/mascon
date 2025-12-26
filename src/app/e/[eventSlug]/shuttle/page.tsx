import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Bus, Clock, MapPin } from "lucide-react"

interface ShuttlePageProps {
  params: Promise<{ eventSlug: string }>
}

async function getShuttleData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      shuttleRoutes: true,
    },
  })
  return event
}

export default async function ShuttlePage({ params }: ShuttlePageProps) {
  const { eventSlug } = await params
  const event = await getShuttleData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Shuttle" />
      
      <div className="flex-1 p-4 space-y-4">
        {event.shuttleRoutes.length > 0 ? (
          event.shuttleRoutes.map((route: typeof event.shuttleRoutes[number]) => (
            <div
              key={route.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <Bus className="w-5 h-5 text-sky-500" />
                {route.name}
              </h3>
              {route.description && (
                <p className="text-sm text-gray-600 mb-3">{route.description}</p>
              )}
              
              {/* Stops */}
              {route.stops && Array.isArray(route.stops) && (
                <div className="space-y-2 mb-3">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> Stops
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(route.stops as string[]).map((stop: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-gray-100 text-sm rounded"
                      >
                        {stop}
                      </span>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Schedule */}
              {route.schedule && Array.isArray(route.schedule) && (
                <div className="space-y-2">
                  <h4 className="text-sm font-medium text-gray-700 flex items-center gap-1">
                    <Clock className="w-4 h-4" /> Schedule
                  </h4>
                  <div className="flex flex-wrap gap-2">
                    {(route.schedule as string[]).map((time: string, idx: number) => (
                      <span
                        key={idx}
                        className="px-2 py-1 bg-sky-50 text-sky-700 text-sm rounded"
                      >
                        {time}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No shuttle information available yet
          </div>
        )}
      </div>
    </div>
  )
}
