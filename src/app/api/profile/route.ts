import { getServerSession } from "next-auth"
import { NextResponse } from "next/server"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const body = await request.json()
    const { name, title, company, bio, linkedin, twitter, website } = body
    
    const updatedUser = await prisma.user.update({
      where: { id: session.user.id },
      data: {
        name,
        title,
        company,
        bio,
        linkedin,
        twitter,
        website,
      },
    })
    
    return NextResponse.json(updatedUser)
  } catch (error) {
    console.error("Profile update error:", error)
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        id: true,
        name: true,
        email: true,
        image: true,
        title: true,
        company: true,
        bio: true,
        linkedin: true,
        twitter: true,
        website: true,
        shareEmail: true,
        sharePhone: true,
      },
    })
    
    return NextResponse.json(user)
  } catch (error) {
    console.error("Profile fetch error:", error)
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 })
  }
}
