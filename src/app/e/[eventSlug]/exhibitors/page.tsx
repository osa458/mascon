import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Building2, Globe, MapPin } from "lucide-react"
import Link from "next/link"

interface ExhibitorsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getExhibitorsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      exhibitors: {
        orderBy: { name: 'asc' },
      },
    },
  })
  return event
}

export default async function ExhibitorsPage({ params }: ExhibitorsPageProps) {
  const { eventSlug } = await params
  const event = await getExhibitorsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Exhibitors" />
      
      <div className="flex-1 p-4 space-y-3">
        {event.exhibitors.length > 0 ? (
          event.exhibitors.map((exhibitor: typeof event.exhibitors[number]) => (
            <div
              key={exhibitor.id}
              className="p-4 bg-white border border-gray-200 rounded-lg"
            >
              <div className="flex items-start gap-3">
                {exhibitor.logoUrl ? (
                  <img
                    src={exhibitor.logoUrl}
                    alt={exhibitor.name}
                    className="w-16 h-16 object-contain rounded"
                  />
                ) : (
                  <div className="w-16 h-16 bg-gray-100 rounded flex items-center justify-center">
                    <Building2 className="w-8 h-8 text-gray-400" />
                  </div>
                )}
                
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold">{exhibitor.name}</h3>
                  {exhibitor.boothNumber && (
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Booth {exhibitor.boothNumber}
                    </p>
                  )}
                  {exhibitor.category && (
                    <p className="text-sm text-gray-500">{exhibitor.category}</p>
                  )}
                  {exhibitor.website && (
                    <a
                      href={exhibitor.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm text-sky-500 hover:underline flex items-center gap-1 mt-1"
                    >
                      <Globe className="w-3 h-3" /> Website
                    </a>
                  )}
                </div>
              </div>
              
              {exhibitor.description && (
                <p className="text-sm text-gray-600 mt-3 line-clamp-2">
                  {exhibitor.description}
                </p>
              )}
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No exhibitors listed yet
          </div>
        )}
      </div>
    </div>
  )
}
