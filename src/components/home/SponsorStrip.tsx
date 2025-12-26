"use client"

import { useEffect, useState } from "react"
import Link from "next/link"

interface Sponsor {
  id: string
  name: string
  tier: string
  logoUrl?: string | null
  website?: string | null
}

interface SponsorStripProps {
  sponsors: Sponsor[]
  eventSlug: string
}

export function SponsorStrip({ sponsors, eventSlug }: SponsorStripProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  
  // Get sponsors by tier priority
  const tierOrder = ['platinum', 'gold', 'silver', 'bronze']
  const sortedSponsors = [...sponsors].sort((a, b) => {
    return tierOrder.indexOf(a.tier.toLowerCase()) - tierOrder.indexOf(b.tier.toLowerCase())
  })

  // Auto-rotate sponsors
  useEffect(() => {
    if (sortedSponsors.length <= 1) return
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % sortedSponsors.length)
    }, 4000)
    
    return () => clearInterval(interval)
  }, [sortedSponsors.length])

  if (sortedSponsors.length === 0) return null

  const currentSponsor = sortedSponsors[currentIndex]
  const tierLabel = currentSponsor?.tier.charAt(0).toUpperCase() + currentSponsor?.tier.slice(1)

  return (
    <div className="bg-gray-100 border-t border-gray-200">
      <div className="flex items-center h-14">
        {/* Tier Label */}
        <Link 
          href={`/e/${eventSlug}/sponsors`}
          className="flex-shrink-0 px-4 py-2 text-sky-500 font-medium text-sm hover:underline"
        >
          {tierLabel}
        </Link>
        
        {/* Sponsor Banner */}
        <div className="flex-1 overflow-hidden">
          <a
            href={currentSponsor?.website || `/e/${eventSlug}/sponsors`}
            target={currentSponsor?.website ? "_blank" : undefined}
            rel={currentSponsor?.website ? "noopener noreferrer" : undefined}
            className="block h-12 px-2"
          >
            {currentSponsor?.logoUrl ? (
              <img
                src={currentSponsor.logoUrl}
                alt={currentSponsor.name}
                className="h-full w-auto object-contain"
              />
            ) : (
              <div className="h-full flex items-center px-4 bg-white rounded text-gray-600 font-medium">
                {currentSponsor?.name}
              </div>
            )}
          </a>
        </div>
      </div>
      
      {/* Pagination dots */}
      {sortedSponsors.length > 1 && (
        <div className="flex justify-center gap-1.5 pb-2">
          {sortedSponsors.map((_, idx) => (
            <button
              key={idx}
              onClick={() => setCurrentIndex(idx)}
              className={`w-1.5 h-1.5 rounded-full transition-colors ${
                idx === currentIndex ? 'bg-sky-500' : 'bg-gray-300'
              }`}
            />
          ))}
        </div>
      )}
    </div>
  )
}
