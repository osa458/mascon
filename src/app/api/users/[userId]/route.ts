import { NextRequest, NextResponse } from "next/server"
import prisma from "@/lib/db"

export async function GET(
    request: NextRequest,
    { params }: { params: Promise<{ userId: string }> }
) {
    try {
        const { userId } = await params

        const user = await prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                name: true,
                email: true,
                image: true,
                title: true,
                company: true,
                phone: true,
                linkedin: true,
                shareEmail: true,
                sharePhone: true,
            },
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        // Return user data, respecting privacy settings
        return NextResponse.json({
            id: user.id,
            name: user.name,
            email: user.shareEmail ? user.email : null,
            image: user.image,
            title: user.title,
            company: user.company,
            phone: user.sharePhone ? user.phone : null,
            linkedin: user.linkedin,
        })
    } catch (error) {
        console.error("Error fetching user:", error)
        return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 })
    }
}
