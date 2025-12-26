import Link from "next/link"
import { MapPin, ChevronRight } from "lucide-react"

interface VenueMapPreviewProps {
  venueName: string
  mapImageUrl?: string | null
  mapsUrl?: string | null
  eventSlug: string
  latitude?: number | null
  longitude?: number | null
}

export function VenueMapPreview({
  venueName,
  mapImageUrl,
  mapsUrl,
  eventSlug,
  latitude,
  longitude
}: VenueMapPreviewProps) {
  const externalUrl = mapsUrl || `https://maps.google.com/?q=${encodeURIComponent(venueName)}`

  // Generate OpenStreetMap static image URL if we have coordinates
  const getStaticMapUrl = () => {
    if (latitude && longitude) {
      // Use OSM static map tiles - construct a simple static map URL
      // Using open-source tile server
      const zoom = 15
      const lat = latitude
      const lon = longitude
      // Using a free static map service
      return `https://staticmap.openstreetmap.de/staticmap.php?center=${lat},${lon}&zoom=${zoom}&size=600x200&markers=${lat},${lon},ol-marker-blue`
    }
    return null
  }

  const staticMapUrl = getStaticMapUrl()
  const displayMapUrl = mapImageUrl || staticMapUrl

  return (
    <div className="bg-gray-100 border-t border-b border-gray-200">
      {/* Map Preview */}
      <div className="relative h-24 bg-gray-200 overflow-hidden">
        {displayMapUrl ? (
          <img
            src={displayMapUrl}
            alt={`Map of ${venueName}`}
            className="w-full h-full object-cover"
            onError={(e) => {
              // If image fails to load, show placeholder
              e.currentTarget.style.display = 'none'
              const placeholder = e.currentTarget.nextElementSibling as HTMLElement
              if (placeholder) placeholder.style.display = 'flex'
            }}
          />
        ) : null}

        {/* Placeholder/fallback - shown when no map or on error */}
        <div
          className={`absolute inset-0 flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 ${displayMapUrl ? 'hidden' : 'flex'}`}
        >
          <MapPin className="w-8 h-8 text-sky-500 mb-1" />
          <div className="text-gray-500 text-sm font-medium">View Map</div>
        </div>

        {/* Map Pin overlay when image is shown */}
        {displayMapUrl && (
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-full">
            <div className="relative">
              <MapPin className="w-8 h-8 text-sky-500 fill-sky-500 drop-shadow-lg" />
              <div className="absolute top-1 left-1/2 -translate-x-1/2 w-3 h-3 bg-white rounded-full" />
            </div>
          </div>
        )}
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

