"use client"

import { useSession } from "next-auth/react"
import { ArrowLeft, QrCode, Share2, Download } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useEffect, useState } from "react"

export default function QRCodePage() {
  const { data: session } = useSession()
  const [qrDataUrl, setQrDataUrl] = useState<string>("")

  useEffect(() => {
    // Generate QR code on client side
    const generateQR = async () => {
      try {
        const QRCode = (await import('qrcode')).default
        const url = `${process.env.NEXT_PUBLIC_APP_URL || window.location.origin}/u/${session?.user?.id}`
        const dataUrl = await QRCode.toDataURL(url, {
          width: 256,
          margin: 2,
          color: {
            dark: '#0ea5e9',
            light: '#ffffff',
          },
        })
        setQrDataUrl(dataUrl)
      } catch (error) {
        console.error("Failed to generate QR code:", error)
      }
    }

    if (session?.user?.id) {
      generateQR()
    }
  }, [session?.user?.id])

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">My QR Code</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4 space-y-6">
        {/* Profile Card */}
        <div className="bg-white rounded-lg border p-6 text-center">
          <Avatar className="h-20 w-20 mx-auto mb-4">
            <AvatarImage src={session?.user?.image || undefined} />
            <AvatarFallback className="text-2xl bg-sky-100 text-sky-600">
              {session?.user?.name?.charAt(0) || "U"}
            </AvatarFallback>
          </Avatar>
          
          <h2 className="text-xl font-bold">{session?.user?.name || "Your Name"}</h2>
          <p className="text-gray-500">{session?.user?.email}</p>
          
          {/* QR Code */}
          <div className="mt-6 p-4 bg-gray-50 rounded-lg inline-block">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="Your QR Code" className="w-48 h-48" />
            ) : (
              <div className="w-48 h-48 flex items-center justify-center">
                <QrCode className="w-24 h-24 text-gray-300" />
              </div>
            )}
          </div>
          
          <p className="text-sm text-gray-500 mt-4">
            Show this QR code to exchange contact information
          </p>
          
          {/* Actions */}
          <div className="flex gap-3 mt-6">
            <Button variant="outline" className="flex-1">
              <Share2 className="w-4 h-4 mr-2" /> Share
            </Button>
            <Button variant="outline" className="flex-1">
              <Download className="w-4 h-4 mr-2" /> Save
            </Button>
          </div>
        </div>

        {/* Scan Button */}
        <Button 
          className="w-full bg-sky-500 hover:bg-sky-600"
          asChild
        >
          <Link href="/profile/qr/scan">
            <QrCode className="w-4 h-4 mr-2" /> Scan Attendee QR
          </Link>
        </Button>
      </div>
    </div>
  )
}
