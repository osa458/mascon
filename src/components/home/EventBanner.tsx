import { formatDateRange } from "@/lib/utils"

interface EventBannerProps {
  bannerUrl?: string | null
  logoUrl?: string | null
  name: string
  tagline?: string | null
  startDate: Date | string
  endDate: Date | string
  venueName?: string
}

export function EventBanner({
  bannerUrl,
  logoUrl,
  name,
  tagline,
  startDate,
  endDate,
  venueName,
}: EventBannerProps) {
  return (
    <div className="relative w-full overflow-hidden">
      {/* Banner Image with Gradient Overlay */}
      <div 
        className="relative w-full h-56 bg-gradient-to-br from-sky-400 via-sky-500 to-orange-400"
        style={bannerUrl ? {
          backgroundImage: `url(${bannerUrl})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        } : undefined}
      >
        {/* Gradient overlay for text readability */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
        
        {/* Content Overlay */}
        <div className="absolute inset-0 flex flex-col justify-end p-4">
          <div className="flex items-start gap-3">
            {/* Logo */}
            {logoUrl && (
              <img 
                src={logoUrl} 
                alt={name}
                className="w-16 h-16 rounded-lg bg-white/90 p-1 object-contain shadow-lg"
              />
            )}
            
            <div className="flex-1 text-white">
              {/* Event Name */}
              <h1 className="text-2xl font-bold tracking-tight drop-shadow-lg">
                {name}
              </h1>
              
              {/* Tagline */}
              {tagline && (
                <p className="text-sm font-medium text-white/90 mt-0.5 drop-shadow">
                  {tagline}
                </p>
              )}
              
              {/* Dates and Venue */}
              <div className="flex flex-wrap items-center gap-2 mt-2 text-sm text-white/90">
                <span className="font-semibold drop-shadow">
                  {formatDateRange(startDate, endDate)}
                </span>
                {venueName && (
                  <>
                    <span>•</span>
                    <span className="drop-shadow">{venueName}</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Website/Phone Info at top */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 text-white/90 text-xs drop-shadow">
          <span>★ MASCONVENTION.ORG</span>
          <span>✆ 1-877-627-1060</span>
        </div>
      </div>
    </div>
  )
}
