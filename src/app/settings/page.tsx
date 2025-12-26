"use client"

import { signOut } from "next-auth/react"
import { ArrowLeft, Bell, Shield, Trash2, LogOut, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export default function SettingsPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">Settings</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-4">
        {/* Notifications */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left">
            <Bell className="w-5 h-5 text-gray-500" />
            <span className="flex-1">Notifications</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Privacy */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left">
            <Shield className="w-5 h-5 text-gray-500" />
            <span className="flex-1">Privacy Settings</span>
            <ChevronRight className="w-5 h-5 text-gray-400" />
          </button>
        </div>

        {/* Danger Zone */}
        <div className="bg-white rounded-lg border overflow-hidden">
          <button 
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left text-red-600"
          >
            <LogOut className="w-5 h-5" />
            <span className="flex-1">Sign Out</span>
          </button>
          
          <div className="border-t" />
          
          <button className="w-full flex items-center gap-3 p-4 hover:bg-gray-50 text-left text-red-600">
            <Trash2 className="w-5 h-5" />
            <span className="flex-1">Delete Account</span>
          </button>
        </div>

        <p className="text-center text-xs text-gray-400 pt-4">
          MASCON Event Platform v1.0.0
        </p>
      </div>
    </div>
  )
}
