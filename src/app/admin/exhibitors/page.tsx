import prisma from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2, Building2, MapPin } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getExhibitors() {
  const exhibitors = await prisma.exhibitor.findMany({
    orderBy: [{ category: 'asc' }, { name: 'asc' }],
  })
  return exhibitors
}

export default async function ExhibitorsAdmin() {
  const exhibitors = await getExhibitors()
  type ExhibitorType = typeof exhibitors[number]
  
  // Group by category
  const grouped: Record<string, ExhibitorType[]> = exhibitors.reduce((acc: Record<string, ExhibitorType[]>, exhibitor: ExhibitorType) => {
    const category = exhibitor.category || 'Uncategorized'
    if (!acc[category]) acc[category] = []
    acc[category].push(exhibitor)
    return acc
  }, {})

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Exhibitors</h1>
          <p className="text-gray-500">{exhibitors.length} exhibitors</p>
        </div>
        <Link href="/admin/exhibitors/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Exhibitor
          </Button>
        </Link>
      </div>

      <div className="space-y-6">
        {Object.entries(grouped).map(([category, categoryExhibitors]: [string, ExhibitorType[]]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold mb-3 text-gray-700">{category}</h2>
            
            <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
              <table className="w-full">
                <thead className="bg-gray-50 border-b">
                  <tr>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Exhibitor</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Booth</th>
                    <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Website</th>
                    <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {categoryExhibitors.map((exhibitor: ExhibitorType) => (
                    <tr key={exhibitor.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {exhibitor.logoUrl ? (
                            <img 
                              src={exhibitor.logoUrl} 
                              alt={exhibitor.name} 
                              className="w-10 h-10 rounded-lg object-contain bg-gray-100"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Building2 className="w-5 h-5 text-gray-400" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{exhibitor.name}</div>
                            {exhibitor.description && (
                              <div className="text-sm text-gray-500 line-clamp-1 max-w-xs">
                                {exhibitor.description}
                              </div>
                            )}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        {exhibitor.boothNumber ? (
                          <div className="flex items-center gap-1 text-sm">
                            <MapPin className="w-4 h-4 text-gray-400" />
                            <span>{exhibitor.boothNumber}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {exhibitor.website ? (
                          <a 
                            href={exhibitor.website} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:underline"
                          >
                            {exhibitor.website.replace(/^https?:\/\//, '').replace(/\/$/, '')}
                          </a>
                        ) : (
                          '-'
                        )}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link href={`/admin/exhibitors/${exhibitor.id}`}>
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
        ))}
      </div>
    </div>
  )
}
