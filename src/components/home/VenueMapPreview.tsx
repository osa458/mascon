import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"

interface VenueMapPreviewProps {
  venueName: string
  mapImageUrl?: string | null
  mapsUrl?: string | null
  eventSlug: string
}

export function VenueMapPreview({ 
  venueName, 
  mapImageUrl, 
  mapsUrl,
  eventSlug 
}: VenueMapPreviewProps) {
  const externalUrl = mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(venueName)}`
  
  return (
    <div className="bg-gray-100 border-t border-b border-gray-200">
      {/* Map Preview */}
      <div className="relative h-24 bg-gray-200 overflow-hidden">
        {mapImageUrl ? (
          <img 
            src={mapImageUrl} 
            alt={`Map of ${venueName}`}
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full bg-cover bg-center"
            style={{
              backgroundImage: `url('https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/-87.6165,41.8508,14,0/400x200@2x?access_token=pk.placeholder')`,
              backgroundColor: '#e5e7eb'
            }}
          >
            {/* Fallback map background pattern */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-gray-400 text-sm">Map Preview</div>
            </div>
          </div>
        )}
        
        {/* Map Pin */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
          <div className="relative">
            <MapPin className="w-8 h-8 text-sky-500 fill-sky-500" />
            <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
          </div>
        </div>
      </div>
      
      {/* Venue Link Row */}
      <a
        href={externalUrl}
        target="_blank"
        rel="noopener noreferrer"
        className="flex items-center justify-between px-4 py-3 bg-gray-700 text-white hover:bg-gray-600 transition-colors"
      >
        <span className="font-medium underline decoration-2 underline-offset-4">
          {venueName}
        </span>
        <ChevronRight className="w-5 h-5" />
      </a>
    </div>
  )
}
