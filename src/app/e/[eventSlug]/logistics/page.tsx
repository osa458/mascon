import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { MapPin, Info, Car, Utensils, Wifi, HelpCircle } from "lucide-react"

interface LogisticsPageProps {
  params: Promise<{ eventSlug: string }>
}

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  parking: Car,
  food: Utensils,
  wifi: Wifi,
  info: Info,
  location: MapPin,
}

async function getLogisticsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      logisticsItems: {
        orderBy: { order: 'asc' },
      },
      venue: true,
    },
  })
  return event
}

export default async function LogisticsPage({ params }: LogisticsPageProps) {
  const { eventSlug } = await params
  const event = await getLogisticsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Logistics" />
      
      <div className="flex-1 p-4 space-y-4">
        {/* Venue Info */}
        {event.venue && (
          <div className="p-4 bg-white border border-gray-200 rounded-lg">
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="w-5 h-5 text-sky-500" />
              Venue
            </h3>
            <p className="text-gray-700">{event.venue.name}</p>
            {event.venue.address && (
              <p className="text-sm text-gray-500 mt-1">
                {[event.venue.address, event.venue.city, event.venue.state, event.venue.zipCode]
                  .filter(Boolean)
                  .join(", ")}
              </p>
            )}
            {event.venue.mapsUrl && (
              <a
                href={event.venue.mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-sm text-sky-500 hover:underline mt-2 inline-block"
              >
                Open in Maps →
              </a>
            )}
          </div>
        )}
        
        {/* Logistics Items */}
        {event.logisticsItems.length > 0 ? (
          event.logisticsItems.map((item: typeof event.logisticsItems[number]) => {
            const IconComponent = iconMap[item.icon || 'info'] || HelpCircle
            return (
              <div
                key={item.id}
                className="p-4 bg-white border border-gray-200 rounded-lg"
              >
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                  <IconComponent className="w-5 h-5 text-sky-500" />
                  {item.title}
                </h3>
                {item.content && (
                  <div 
                    className="text-sm text-gray-600 prose prose-sm max-w-none"
                    dangerouslySetInnerHTML={{ __html: item.content }}
                  />
                )}
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            No logistics information available yet
          </div>
        )}
      </div>
    </div>
  )
}
