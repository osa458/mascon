import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

// Add/remove bookmark
export async function POST(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const body = await request.json()
        const { targetId, targetType } = body

        if (!targetId || !targetType) {
            return NextResponse.json(
                { error: "Target ID and type are required" },
                { status: 400 }
            )
        }

        // Check if bookmark exists
        const existingBookmark = await prisma.bookmark.findUnique({
            where: {
                userId_targetType_targetId: {
                    userId: session.user.id,
                    targetType,
                    targetId,
                },
            },
        })

        if (existingBookmark) {
            // Remove bookmark
            await prisma.bookmark.delete({
                where: { id: existingBookmark.id },
            })
            return NextResponse.json({ success: true, bookmarked: false })
        } else {
            // Add bookmark
            await prisma.bookmark.create({
                data: {
                    userId: session.user.id,
                    targetType,
                    targetId,
                },
            })
            return NextResponse.json({ success: true, bookmarked: true })
        }
    } catch (error) {
        console.error("Error toggling bookmark:", error)
        return NextResponse.json({ error: "Failed to toggle bookmark" }, { status: 500 })
    }
}

// Get user's bookmarks
export async function GET(request: NextRequest) {
    try {
        const session = await getServerSession(authOptions)

        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const { searchParams } = new URL(request.url)
        const targetType = searchParams.get("type")

        const where: { userId: string; targetType?: string } = {
            userId: session.user.id,
        }

        if (targetType) {
            where.targetType = targetType
        }

        const bookmarks = await prisma.bookmark.findMany({
            where,
            select: {
                targetId: true,
                targetType: true,
            },
        })

        return NextResponse.json(bookmarks)
    } catch (error) {
        console.error("Error fetching bookmarks:", error)
        return NextResponse.json({ error: "Failed to fetch bookmarks" }, { status: 500 })
    }
}
