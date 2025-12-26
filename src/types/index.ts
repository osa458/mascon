// Core application types

export type Role = 'ATTENDEE' | 'EXHIBITOR' | 'SPEAKER' | 'ORGANIZER' | 'ADMIN'

export interface RecommendationCandidate {
  targetId: string
  targetType: 'user' | 'session' | 'exhibitor' | 'topic'
  reasonCodes: string[]
  score?: number | null
}

export interface ResourceTile {
  id: string
  label: string
  icon: string
  route: string
  hasNew: boolean
}

export interface EventContext {
  eventId: string
  eventSlug: string
  eventName: string
  userRole: Role
}

export interface PaginatedResult<T> {
  items: T[]
  total: number
  page: number
  pageSize: number
  hasMore: boolean
}

export interface ApiResponse<T> {
  success: boolean
  data?: T
  error?: string
}

// Feature flags
export const FeatureFlags = {
  RECOMMENDATIONS: process.env.NEXT_PUBLIC_ENABLE_RECOMMENDATIONS === 'true',
} as const
