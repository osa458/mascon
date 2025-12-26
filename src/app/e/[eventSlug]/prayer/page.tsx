import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Moon, MapPin } from "lucide-react"
import { format } from "date-fns"

interface PrayerPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getPrayerData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      prayerTimes: {
        orderBy: [{ date: 'asc' }, { time: 'asc' }],
      },
    },
  })
  return event
}

const prayerOrder = ['Fajr', 'Dhuhr', 'Asr', 'Maghrib', 'Isha']

export default async function PrayerPage({ params }: PrayerPageProps) {
  const { eventSlug } = await params
  const event = await getPrayerData(eventSlug)
  
  if (!event) {
    notFound()
  }

  // Group by date
  type PrayerType = typeof event.prayerTimes[number]
  const prayersByDate = event.prayerTimes.reduce((acc: Record<string, PrayerType[]>, prayer: PrayerType) => {
    const dateKey = format(prayer.date, "yyyy-MM-dd")
    if (!acc[dateKey]) acc[dateKey] = []
    acc[dateKey].push(prayer)
    return acc
  }, {} as Record<string, PrayerType[]>)

  const sortedDates = Object.keys(prayersByDate).sort()

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Prayer Times" />
      
      <div className="flex-1 p-4 space-y-6">
        {sortedDates.length > 0 ? (
          sortedDates.map(dateKey => {
            const prayers = prayersByDate[dateKey].sort((a: PrayerType, b: PrayerType) => 
              prayerOrder.indexOf(a.name) - prayerOrder.indexOf(b.name)
            )
            
            return (
              <div key={dateKey}>
                <h3 className="font-semibold text-gray-700 mb-3">
                  {format(new Date(dateKey), "EEEE, MMMM d")}
                </h3>
                
                <div className="grid grid-cols-2 gap-2">
                  {prayers.map((prayer: PrayerType) => (
                    <div
                      key={prayer.id}
                      className="p-3 bg-white border border-gray-200 rounded-lg"
                    >
                      <div className="flex items-center gap-2">
                        <Moon className="w-4 h-4 text-sky-500" />
                        <span className="font-medium">{prayer.name}</span>
                      </div>
                      <p className="text-lg font-bold text-sky-600 mt-1">{prayer.time}</p>
                      {prayer.location && (
                        <p className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                          <MapPin className="w-3 h-3" /> {prayer.location}
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )
          })
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Moon className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No prayer times scheduled yet</p>
            <p className="text-sm mt-2">Check back for updates!</p>
          </div>
        )}
      </div>
    </div>
  )
}
