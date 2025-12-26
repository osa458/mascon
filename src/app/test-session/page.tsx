import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { cookies } from "next/headers"

export default async function TestSessionPage() {
  const session = await getServerSession(authOptions)
  const cookieStore = await cookies()
  const allCookies = cookieStore.getAll()
  
  return (
    <div className="p-8 max-w-2xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Session Debug</h1>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Session:</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {JSON.stringify(session, null, 2) || 'null'}
        </pre>
      </div>
      
      <div className="mb-6">
        <h2 className="text-lg font-semibold mb-2">Cookies ({allCookies.length}):</h2>
        <pre className="bg-gray-100 p-4 rounded overflow-auto text-sm">
          {allCookies.map(c => `${c.name}: ${c.value.substring(0, 50)}...`).join('\n') || 'No cookies'}
        </pre>
      </div>
      
      <div className="space-y-2">
        <a 
          href="/api/auth/demo-login" 
          className="block p-3 bg-blue-500 text-white rounded text-center hover:bg-blue-600"
        >
          Login via Demo API
        </a>
        <a 
          href="/auth/login" 
          className="block p-3 bg-gray-200 rounded text-center hover:bg-gray-300"
        >
          Go to Login Page
        </a>
        <a 
          href="/events" 
          className="block p-3 bg-green-500 text-white rounded text-center hover:bg-green-600"
        >
          Try Events Page
        </a>
      </div>
    </div>
  )
}
