import prisma from "@/lib/db"
import { notFound } from "next/navigation"
import { Header } from "@/components/layout/Header"
import { Heart, Globe } from "lucide-react"

interface SponsorsPageProps {
  params: Promise<{ eventSlug: string }>
}

async function getSponsorsData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      sponsors: {
        orderBy: [{ tier: 'asc' }, { order: 'asc' }],
      },
    },
  })
  return event
}

const tierOrder = ['platinum', 'gold', 'silver', 'bronze']
const tierColors: Record<string, string> = {
  platinum: 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800',
  gold: 'bg-gradient-to-r from-yellow-300 to-yellow-500 text-yellow-900',
  silver: 'bg-gradient-to-r from-gray-300 to-gray-400 text-gray-700',
  bronze: 'bg-gradient-to-r from-orange-300 to-orange-500 text-orange-900',
}

export default async function SponsorsPage({ params }: SponsorsPageProps) {
  const { eventSlug } = await params
  const event = await getSponsorsData(eventSlug)
  
  if (!event) {
    notFound()
  }

  type SponsorType = typeof event.sponsors[number]

  // Group sponsors by tier
  const sponsorsByTier = event.sponsors.reduce((acc: Record<string, SponsorType[]>, sponsor: SponsorType) => {
    const tier = sponsor.tier.toLowerCase()
    if (!acc[tier]) acc[tier] = []
    acc[tier].push(sponsor)
    return acc
  }, {} as Record<string, SponsorType[]>)

  const sortedTiers = Object.keys(sponsorsByTier).sort(
    (a, b) => tierOrder.indexOf(a) - tierOrder.indexOf(b)
  )

  return (
    <div className="flex flex-col min-h-screen">
      <Header eventSlug={eventSlug} title="Sponsors" />
      
      <div className="flex-1 p-4 space-y-6">
        {sortedTiers.length > 0 ? (
          sortedTiers.map(tier => (
            <div key={tier}>
              <div className={`px-4 py-2 rounded-lg font-semibold text-center mb-3 ${tierColors[tier] || 'bg-gray-100'}`}>
                {tier.charAt(0).toUpperCase() + tier.slice(1)} Sponsors
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                {sponsorsByTier[tier].map((sponsor: typeof event.sponsors[number]) => (
                  <a
                    key={sponsor.id}
                    href={sponsor.website || '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="p-4 bg-white border border-gray-200 rounded-lg hover:border-gray-300 transition-colors flex flex-col items-center text-center"
                  >
                    {sponsor.logoUrl ? (
                      <img
                        src={sponsor.logoUrl}
                        alt={sponsor.name}
                        className="w-full h-20 object-contain mb-2"
                      />
                    ) : (
                      <div className="w-full h-20 bg-gray-100 rounded flex items-center justify-center mb-2">
                        <Heart className="w-8 h-8 text-gray-400" />
                      </div>
                    )}
                    <span className="font-medium text-sm">{sponsor.name}</span>
                  </a>
                ))}
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-12 text-gray-500">
            No sponsors listed yet
          </div>
        )}
      </div>
    </div>
  )
}
