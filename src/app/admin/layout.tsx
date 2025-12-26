import Link from "next/link"
import { 
  Calendar, 
  Users, 
  Building2, 
  Heart, 
  Megaphone, 
  BarChart3, 
  Settings,
  LayoutDashboard,
  Mic2,
  Clock
} from "lucide-react"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const navItems = [
    { href: "/admin", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/sessions", label: "Sessions", icon: Calendar },
    { href: "/admin/speakers", label: "Speakers", icon: Mic2 },
    { href: "/admin/sponsors", label: "Sponsors", icon: Heart },
    { href: "/admin/exhibitors", label: "Exhibitors", icon: Building2 },
    { href: "/admin/announcements", label: "Announcements", icon: Megaphone },
    { href: "/admin/polls", label: "Polls", icon: BarChart3 },
    { href: "/admin/users", label: "Users", icon: Users },
  ]

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 fixed h-full">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-xl font-bold text-emerald-700">MASCON Admin</h1>
          <p className="text-sm text-gray-500">Event Management</p>
        </div>
        
        <nav className="p-4 space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-3 py-2 text-gray-700 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <item.icon className="w-5 h-5" />
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>

        <div className="absolute bottom-4 left-4 right-4">
          <Link
            href="/e/mascon-2025"
            className="flex items-center gap-2 px-3 py-2 text-sm text-gray-500 hover:text-gray-700"
          >
            ← Back to Event
          </Link>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        {children}
      </main>
    </div>
  )
}
