"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface User {
  id: string
  name: string | null
  email: string
  image: string | null
  title: string | null
  company: string | null
  bio: string | null
  linkedin: string | null
  twitter: string | null
  website: string | null
  shareEmail: boolean
  sharePhone: boolean
}

interface ProfileFormProps {
  user: User
}

export default function ProfileForm({ user }: ProfileFormProps) {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: user.name || "",
    title: user.title || "",
    company: user.company || "",
    bio: user.bio || "",
    linkedin: user.linkedin || "",
    twitter: user.twitter || "",
    website: user.website || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    
    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      })
      
      if (response.ok) {
        router.refresh()
      }
    } catch (error) {
      console.error("Failed to update profile:", error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/events" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">Edit Profile</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative">
              <Avatar className="h-24 w-24">
                <AvatarImage src={user.image || undefined} />
                <AvatarFallback className="text-2xl bg-sky-100 text-sky-600">
                  {user.name?.charAt(0) || "U"}
                </AvatarFallback>
              </Avatar>
              <button
                type="button"
                className="absolute bottom-0 right-0 p-2 bg-sky-500 text-white rounded-full shadow-lg"
              >
                <Camera className="w-4 h-4" />
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-2">{user.email}</p>
          </div>

          {/* Form Fields */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
              <Input
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Your name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
              <Input
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                placeholder="Your job title"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Company</label>
              <Input
                value={formData.company}
                onChange={(e) => setFormData({ ...formData, company: e.target.value })}
                placeholder="Company name"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Bio</label>
              <textarea
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Tell us about yourself"
                rows={3}
                className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm"
              />
            </div>
          </div>

          {/* Social Links */}
          <div className="space-y-4 bg-white p-4 rounded-lg border">
            <h3 className="font-medium">Social Links</h3>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">LinkedIn</label>
              <Input
                value={formData.linkedin}
                onChange={(e) => setFormData({ ...formData, linkedin: e.target.value })}
                placeholder="linkedin.com/in/..."
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Twitter</label>
              <Input
                value={formData.twitter}
                onChange={(e) => setFormData({ ...formData, twitter: e.target.value })}
                placeholder="@username"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
              <Input
                value={formData.website}
                onChange={(e) => setFormData({ ...formData, website: e.target.value })}
                placeholder="https://..."
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-sky-500 hover:bg-sky-600"
            disabled={isLoading}
          >
            {isLoading ? "Saving..." : "Save Changes"}
          </Button>
        </form>
      </div>
    </div>
  )
}
