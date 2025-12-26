import prisma from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2 } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getSponsors() {
  const sponsors = await prisma.sponsor.findMany({
    orderBy: [{ tier: 'asc' }, { order: 'asc' }],
  })
  return sponsors
}

const tierColors: Record<string, string> = {
  PLATINUM: 'bg-gradient-to-r from-gray-200 to-gray-400 text-gray-800',
  GOLD: 'bg-gradient-to-r from-yellow-200 to-yellow-400 text-yellow-800',
  SILVER: 'bg-gradient-to-r from-gray-200 to-gray-300 text-gray-700',
  BRONZE: 'bg-gradient-to-r from-orange-200 to-orange-400 text-orange-800',
}

export default async function SponsorsAdmin() {
  const sponsors = await getSponsors()
  type SponsorType = typeof sponsors[number]

  // Group by tier
  const sponsorsByTier: Record<string, SponsorType[]> = {}
  for (const sponsor of sponsors) {
    if (!sponsorsByTier[sponsor.tier]) {
      sponsorsByTier[sponsor.tier] = []
    }
    sponsorsByTier[sponsor.tier].push(sponsor)
  }

  const tiers = ['PLATINUM', 'GOLD', 'SILVER', 'BRONZE']

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Sponsors</h1>
          <p className="text-gray-500">{sponsors.length} sponsors</p>
        </div>
        <Link href="/admin/sponsors/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Sponsor
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {tiers.map((tier) => {
          const tierSponsors = sponsorsByTier[tier] || []
          if (tierSponsors.length === 0) return null

          return (
            <div key={tier}>
              <div className={`px-4 py-2 rounded-lg font-semibold inline-block mb-3 ${tierColors[tier]}`}>
                {tier} ({tierSponsors.length})
              </div>
              
              <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Sponsor</th>
                      <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Website</th>
                      <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {tierSponsors.map((sponsor: SponsorType) => (
                      <tr key={sponsor.id} className="hover:bg-gray-50">
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            {sponsor.logoUrl ? (
                              <img 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name}
                                className="w-12 h-8 object-contain"
                              />
                            ) : (
                              <div className="w-12 h-8 bg-gray-100 rounded flex items-center justify-center">
                                <span className="text-xs text-gray-400">Logo</span>
                              </div>
                            )}
                            <div className="font-medium">{sponsor.name}</div>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-sm">
                          {sponsor.website ? (
                            <a 
                              href={sponsor.website} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-500 hover:underline"
                            >
                              {sponsor.website}
                            </a>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/admin/sponsors/${sponsor.id}`}>
                              <button className="p-2 text-gray-400 hover:text-blue-500 transition-colors">
                                <Pencil className="w-4 h-4" />
                              </button>
                            </Link>
                            <button className="p-2 text-gray-400 hover:text-red-500 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
