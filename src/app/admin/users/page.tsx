import prisma from "@/lib/db"
import Link from "next/link"
import { Plus, Pencil, Trash2, User } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getUsers() {
  const users = await prisma.user.findMany({
    orderBy: { name: 'asc' },
  })
  return users
}

export default async function UsersAdmin() {
  const users = await getUsers()
  type UserType = typeof users[number]

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold">Users</h1>
          <p className="text-gray-500">{users.length} registered users</p>
        </div>
        <Link href="/admin/users/new">
          <Button className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add User
          </Button>
        </Link>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <table className="w-full">
          <thead className="bg-gray-50 border-b">
            <tr>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">User</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Email</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Company</th>
              <th className="text-left px-4 py-3 text-sm font-medium text-gray-500">Status</th>
              <th className="text-right px-4 py-3 text-sm font-medium text-gray-500">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {users.map((user: UserType) => (
              <tr key={user.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-3">
                    {user.image ? (
                      <img 
                        src={user.image} 
                        alt={user.name || ''} 
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
                        <User className="w-5 h-5 text-emerald-600" />
                      </div>
                    )}
                    <div>
                      <div className="font-medium">{user.name || 'Unnamed'}</div>
                      {user.title && (
                        <div className="text-sm text-gray-500">{user.title}</div>
                      )}
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.email || '-'}
                </td>
                <td className="px-4 py-3 text-sm text-gray-600">
                  {user.company || '-'}
                </td>
                <td className="px-4 py-3">
                  {user.emailVerified ? (
                    <span className="px-2 py-1 text-xs rounded-full bg-green-100 text-green-700">
                      Verified
                    </span>
                  ) : (
                    <span className="px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-700">
                      Pending
                    </span>
                  )}
                </td>
                <td className="px-4 py-3 text-right">
                  <div className="flex items-center justify-end gap-2">
                    <Link href={`/admin/users/${user.id}`}>
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
}
