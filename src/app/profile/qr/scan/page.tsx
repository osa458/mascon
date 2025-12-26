"use client"

import { useEffect, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Camera, UserPlus, Check, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"

interface ScannedUser {
    id: string
    name: string
    email: string
    title?: string
    company?: string
    image?: string
    phone?: string
    linkedin?: string
}

export default function QRScanPage() {
    const router = useRouter()
    const scannerRef = useRef<HTMLDivElement>(null)
    const [isScanning, setIsScanning] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [scannedUser, setScannedUser] = useState<ScannedUser | null>(null)
    const [isSaving, setIsSaving] = useState(false)
    const [saved, setSaved] = useState(false)
    const html5QrCodeRef = useRef<unknown>(null)

    useEffect(() => {
        let html5QrCode: any = null

        const startScanner = async () => {
            try {
                const { Html5Qrcode } = await import("html5-qrcode")

                if (!scannerRef.current) return

                html5QrCode = new Html5Qrcode("qr-reader")
                html5QrCodeRef.current = html5QrCode

                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    async (decodedText: string) => {
                        // Stop scanning when we get a result
                        if (html5QrCode) {
                            await html5QrCode.stop()
                            setIsScanning(false)
                        }

                        // Parse the QR code URL to get user ID
                        // Expected format: https://domain.com/u/{userId}
                        const urlMatch = decodedText.match(/\/u\/([a-zA-Z0-9_-]+)/)
                        if (urlMatch) {
                            const userId = urlMatch[1]
                            await fetchUserProfile(userId)
                        } else {
                            setError("Invalid QR code. Please scan a valid attendee QR code.")
                        }
                    },
                    () => {
                        // Ignore errors during scanning (no QR detected)
                    }
                )

                setIsScanning(true)
                setError(null)
            } catch (err) {
                console.error("Scanner error:", err)
                setError("Unable to access camera. Please check permissions.")
            }
        }

        startScanner()

        return () => {
            if (html5QrCode) {
                html5QrCode.stop().catch(() => { })
                html5QrCode.clear()
            }
        }
    }, [])

    const fetchUserProfile = async (userId: string) => {
        try {
            const response = await fetch(`/api/users/${userId}`)
            if (!response.ok) {
                throw new Error("User not found")
            }
            const user = await response.json()
            setScannedUser(user)
        } catch (err) {
            setError("Could not find user. Please try again.")
        }
    }

    const handleSaveContact = async () => {
        if (!scannedUser) return

        setIsSaving(true)
        try {
            // Save to contacts in database
            const response = await fetch("/api/contacts", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ contactUserId: scannedUser.id }),
            })

            if (!response.ok) {
                throw new Error("Failed to save contact")
            }

            setSaved(true)

            // Generate vCard for device contacts
            const vCard = generateVCard(scannedUser)
            downloadVCard(vCard, scannedUser.name)

        } catch (err) {
            setError("Failed to save contact. Please try again.")
        } finally {
            setIsSaving(false)
        }
    }

    const generateVCard = (user: ScannedUser): string => {
        const lines = [
            "BEGIN:VCARD",
            "VERSION:3.0",
            `FN:${user.name}`,
            `N:${user.name.split(" ").reverse().join(";")};;;`,
        ]

        if (user.email) lines.push(`EMAIL:${user.email}`)
        if (user.phone) lines.push(`TEL:${user.phone}`)
        if (user.company) lines.push(`ORG:${user.company}`)
        if (user.title) lines.push(`TITLE:${user.title}`)
        if (user.linkedin) lines.push(`URL:${user.linkedin}`)

        lines.push("END:VCARD")
        return lines.join("\n")
    }

    const downloadVCard = (vCard: string, name: string) => {
        const blob = new Blob([vCard], { type: "text/vcard" })
        const url = URL.createObjectURL(blob)
        const a = document.createElement("a")
        a.href = url
        a.download = `${name.replace(/\s+/g, "_")}.vcf`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
    }

    const handleScanAgain = async () => {
        setScannedUser(null)
        setSaved(false)
        setError(null)

        // Restart scanner
        const html5QrCode = html5QrCodeRef.current as { start: Function; stop: () => Promise<void> } | null
        if (html5QrCode) {
            try {
                await html5QrCode.start(
                    { facingMode: "environment" },
                    {
                        fps: 10,
                        qrbox: { width: 250, height: 250 },
                    },
                    async (decodedText: string) => {
                        await html5QrCode.stop()
                        setIsScanning(false)

                        const urlMatch = decodedText.match(/\/u\/([a-zA-Z0-9_-]+)/)
                        if (urlMatch) {
                            await fetchUserProfile(urlMatch[1])
                        } else {
                            setError("Invalid QR code.")
                        }
                    },
                    () => { }
                )
                setIsScanning(true)
            } catch (err) {
                setError("Unable to restart camera.")
            }
        }
    }

    return (
        <div className="min-h-screen bg-gray-900">
            {/* Header */}
            <header className="sticky top-0 z-40 bg-gray-900 border-b border-gray-700">
                <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
                    <Link href="/profile/qr" className="p-2 -ml-2 text-white">
                        <ArrowLeft className="w-5 h-5" />
                    </Link>
                    <h1 className="font-semibold text-white">Scan QR Code</h1>
                    <div className="w-9" />
                </div>
            </header>

            <div className="max-w-lg mx-auto p-4">
                {!scannedUser ? (
                    <>
                        {/* Scanner View */}
                        <div className="relative bg-black rounded-lg overflow-hidden">
                            <div id="qr-reader" ref={scannerRef} className="w-full" />

                            {!isScanning && !error && (
                                <div className="absolute inset-0 flex items-center justify-center bg-gray-800">
                                    <Camera className="w-16 h-16 text-gray-500 animate-pulse" />
                                </div>
                            )}
                        </div>

                        {error && (
                            <div className="mt-4 p-4 bg-red-900/50 border border-red-500 rounded-lg text-red-200 text-center">
                                {error}
                                <Button
                                    variant="outline"
                                    className="mt-3 border-red-500 text-red-200 hover:bg-red-900"
                                    onClick={() => window.location.reload()}
                                >
                                    Try Again
                                </Button>
                            </div>
                        )}

                        <p className="text-center text-gray-400 mt-4">
                            Point your camera at an attendee&apos;s QR code
                        </p>
                    </>
                ) : (
                    /* Scanned User Card */
                    <div className="bg-white rounded-lg p-6 text-center">
                        <Avatar className="h-20 w-20 mx-auto mb-4">
                            <AvatarImage src={scannedUser.image || undefined} />
                            <AvatarFallback className="text-2xl bg-sky-100 text-sky-600">
                                {scannedUser.name?.charAt(0) || "U"}
                            </AvatarFallback>
                        </Avatar>

                        <h2 className="text-xl font-bold text-gray-900">{scannedUser.name}</h2>
                        {(scannedUser.title || scannedUser.company) && (
                            <p className="text-gray-500">
                                {scannedUser.title}{scannedUser.title && scannedUser.company ? " at " : ""}{scannedUser.company}
                            </p>
                        )}
                        <p className="text-sm text-gray-400 mt-1">{scannedUser.email}</p>

                        {saved ? (
                            <div className="mt-6 p-4 bg-green-50 rounded-lg">
                                <Check className="w-8 h-8 text-green-500 mx-auto mb-2" />
                                <p className="text-green-700 font-medium">Contact Saved!</p>
                                <p className="text-sm text-green-600 mt-1">
                                    Check your downloads for the vCard file
                                </p>
                            </div>
                        ) : (
                            <Button
                                className="w-full mt-6 bg-sky-500 hover:bg-sky-600"
                                onClick={handleSaveContact}
                                disabled={isSaving}
                            >
                                <UserPlus className="w-4 h-4 mr-2" />
                                {isSaving ? "Saving..." : "Save to Contacts"}
                            </Button>
                        )}

                        <Button
                            variant="outline"
                            className="w-full mt-3"
                            onClick={handleScanAgain}
                        >
                            <Camera className="w-4 h-4 mr-2" />
                            Scan Another
                        </Button>
                    </div>
                )}
            </div>
        </div>
    )
}
