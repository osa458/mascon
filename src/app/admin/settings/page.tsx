import prisma from "@/lib/db"
import { Pencil } from "lucide-react"
import { Button } from "@/components/ui/button"

async function getEvent() {
  const event = await prisma.event.findFirst({
    include: {
      venue: true,
    },
  })
  return event
}

export default async function SettingsAdmin() {
  const event = await getEvent()

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Settings</h1>
        <p className="text-gray-500">Manage event settings and configuration</p>
      </div>

      {/* Event Details */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Event Details</h2>
          <Button variant="outline" size="sm" className="flex items-center gap-2">
            <Pencil className="w-4 h-4" />
            Edit
          </Button>
        </div>

        {event ? (
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="text-sm text-gray-500">Event Name</label>
              <p className="font-medium">{event.name}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Slug</label>
              <p className="font-medium">{event.slug}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Start Date</label>
              <p className="font-medium">{event.startDate.toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">End Date</label>
              <p className="font-medium">{event.endDate.toLocaleDateString()}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Location</label>
              <p className="font-medium">
                {[event.city, event.state, event.country].filter(Boolean).join(", ") || 'Not set'}
              </p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Venue</label>
              <p className="font-medium">{event.venue?.name || 'Not set'}</p>
            </div>
            <div className="col-span-2">
              <label className="text-sm text-gray-500">Description</label>
              <p className="font-medium">{event.description || 'No description'}</p>
            </div>
            <div>
              <label className="text-sm text-gray-500">Banner Image</label>
              {event.bannerUrl ? (
                <img
                  src={event.bannerUrl}
                  alt="Event banner"
                  className="mt-2 rounded-lg max-h-32 object-cover"
                />
              ) : (
                <p className="text-gray-400 italic">No banner set</p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-gray-500">No event configured</p>
        )}
      </div>

      {/* App Configuration */}
      <div className="bg-white rounded-xl border border-gray-200 p-6 mb-6">
        <h2 className="text-lg font-semibold mb-4">App Configuration</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Enable Chat</p>
              <p className="text-sm text-gray-500">Allow attendees to message each other</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Enable Polls</p>
              <p className="text-sm text-gray-500">Allow live polling during sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3 border-b">
            <div>
              <p className="font-medium">Enable Session Q&A</p>
              <p className="text-sm text-gray-500">Allow attendees to ask questions during sessions</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>

          <div className="flex items-center justify-between py-3">
            <div>
              <p className="font-medium">Enable Announcements</p>
              <p className="text-sm text-gray-500">Push announcements to all attendees</p>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input type="checkbox" defaultChecked className="sr-only peer" />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
            </label>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-white rounded-xl border border-red-200 p-6">
        <h2 className="text-lg font-semibold text-red-600 mb-4">Danger Zone</h2>

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium">Reset All Data</p>
              <p className="text-sm text-gray-500">Clear all sessions, speakers, and attendee data</p>
            </div>
            <Button variant="outline" className="border-red-300 text-red-600 hover:bg-red-50">
              Reset Data
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
