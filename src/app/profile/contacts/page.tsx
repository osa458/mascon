import { ArrowLeft, Users, User, Mail, Building2, Linkedin } from "lucide-react"
import Link from "next/link"
import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import prisma from "@/lib/db"
import { formatDistanceToNow } from "date-fns"

async function getContacts(userId: string) {
  // Get contacts where current user received someone's contact
  const contacts = await prisma.contactExchange.findMany({
    where: { receiverId: userId },
    include: {
      giver: {
        select: {
          id: true,
          name: true,
          image: true,
          email: true,
          title: true,
          company: true,
          linkedin: true,
          shareEmail: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  })
  
  return contacts
}

export default async function ContactsPage() {
  const session = await getServerSession(authOptions)
  
  if (!session?.user?.id) {
    redirect("/auth/login")
  }
  
  const contacts = await getContacts(session.user.id)
  type ContactType = typeof contacts[number]

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white border-b border-gray-200">
        <div className="flex items-center justify-between h-14 px-4 max-w-lg mx-auto">
          <Link href="/profile" className="p-2 -ml-2">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <h1 className="font-semibold">My Contacts</h1>
          <div className="w-9" />
        </div>
      </header>

      <div className="max-w-lg mx-auto p-4">
        {contacts.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm text-gray-500 mb-4">
              {contacts.length} contact{contacts.length !== 1 ? 's' : ''} exchanged
            </p>
            
            {contacts.map((contact: ContactType) => (
              <div 
                key={contact.id} 
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <div className="flex items-start gap-3">
                  {contact.giver.image ? (
                    <img 
                      src={contact.giver.image} 
                      alt={contact.giver.name || ''} 
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-emerald-100 flex items-center justify-center">
                      <User className="w-6 h-6 text-emerald-600" />
                    </div>
                  )}
                  
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold">{contact.giver.name || 'Anonymous'}</h3>
                    
                    {contact.giver.title && (
                      <p className="text-sm text-gray-600">{contact.giver.title}</p>
                    )}
                    
                    {contact.giver.company && (
                      <div className="flex items-center gap-1 text-sm text-gray-500 mt-1">
                        <Building2 className="w-3.5 h-3.5" />
                        <span>{contact.giver.company}</span>
                      </div>
                    )}
                    
                    <div className="flex items-center gap-3 mt-3">
                      {contact.giver.shareEmail && contact.giver.email && (
                        <a 
                          href={`mailto:${contact.giver.email}`}
                          className="flex items-center gap-1 text-sm text-emerald-600 hover:text-emerald-700"
                        >
                          <Mail className="w-4 h-4" />
                          <span>Email</span>
                        </a>
                      )}
                      
                      {contact.giver.linkedin && (
                        <a 
                          href={contact.giver.linkedin}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
                        >
                          <Linkedin className="w-4 h-4" />
                          <span>LinkedIn</span>
                        </a>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-400 mt-2">
                      Connected {formatDistanceToNow(contact.createdAt, { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 text-gray-500">
            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <p>No contacts exchanged yet</p>
            <p className="text-sm mt-2">
              Scan QR codes or use &quot;Say Hi&quot; to connect with attendees
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
