import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Baby, Clock, MapPin } from "lucide-react"
import { format } from "date-fns"

interface KidsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getKidsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      kidsActivities: {
        orderBy: { startTime: 'asc' },
      },
    },
  })
  return event
}

export default async function KidsPage({ params }: KidsPageProps) {
  const { eventSlug } = await params
  const event = await getKidsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Kids" />
      
      <div className="flex-1 p-4 space-y-4">
        {event.kidsActivities.length > 0 ? (
          event.kidsActivities.map((activity: typeof event.kidsActivities[number]) => (
            <div
              key={activity.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <h3 className="font-semibold">{activity.title}</h3>
              
              <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                {activity.ageRange && (
                  <span className="flex items-center gap-1">
                    <Baby className="w-4 h-4" /> Ages {activity.ageRange}
                  </span>
                )}
                {activity.location && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" /> {activity.location}
                  </span>
                )}
                {activity.startTime && (
                  <span className="flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    {format(activity.startTime, "h:mm a")}
                    {activity.endTime && ` - ${format(activity.endTime, "h:mm a")}`}
                  </span>
                )}
              </div>
              
              {activity.description && (
                <p className="text-sm text-gray-600 mt-3">{activity.description}</p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Baby className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No kids activities scheduled yet</p>
            <p className="text-sm mt-2">Check back for updates!</p>
          </div>
        )}
      </div>
    </div>
  )
}
