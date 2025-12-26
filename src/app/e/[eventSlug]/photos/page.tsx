import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Camera, Upload } from "lucide-react"
import { Button } from "@/components/ui/button"

interface PhotosPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getPhotosData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      photos: {
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: { name: true, image: true },
          },
        },
      },
    },
  })
  return event
}

export default async function PhotosPage({ params }: PhotosPageProps) {
  const { eventSlug } = await params
  const event = await getPhotosData(eventSlug)
  
  if (!event) {
    notFound()
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Photos" />
      
      <div className="flex-1 p-4">
        {/* Upload Button */}
        <Button className="w-full mb-4 bg-sky-500 hover:bg-sky-600">
          <Upload className="w-4 h-4 mr-2" /> Upload Photo
        </Button>
        
        {event.photos.length > 0 ? (
          <div className="grid grid-cols-2 gap-2">
            {event.photos.map((photo: typeof event.photos[number]) => (
              <div
                key={photo.id}
                className="relative aspect-square rounded-lg overflow-hidden bg-gray-100"
              >
                <img
                  src={photo.imageUrl}
                  alt={photo.caption || "Event photo"}
                  className="w-full h-full object-cover"
                />
                {photo.caption && (
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.caption}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Camera className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No photos yet</p>
            <p className="text-sm mt-2">Be the first to share a photo!</p>
          </div>
        )}
      </div>
    </div>
  )
}
