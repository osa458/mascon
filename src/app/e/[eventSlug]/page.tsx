import { notFound } from "next/navigation"
import prisma from "@/lib/db"
import { Header } from "@/components/layout/Header"
import { EventBanner } from "@/components/home/EventBanner"
import { EventSummary } from "@/components/home/EventSummary"
import { VenueMapPreview } from "@/components/home/VenueMapPreview"
import { ResourceGrid } from "@/components/home/ResourceGrid"
import { SponsorStrip } from "@/components/home/SponsorStrip"

interface EventHomePageProps {
  params: Promise<{ eventSlug: string }>
}

async function getEventData(slug: string) {
  const event = await prisma.event.findUnique({
    where: { slug },
    include: {
      venue: true,
      sponsors: {
        orderBy: { order: 'asc' },
      },
      resourceTiles: {
        where: { isVisible: true },
        orderBy: { order: 'asc' },
      },
    },
  })
  return event
}

export default async function EventHomePage({ params }: EventHomePageProps) {
  const { eventSlug } = await params
  const event = await getEventData(eventSlug)

  if (!event) {
    notFound()
  }

  // Default resource tiles if none configured
  const defaultTiles = [
    { label: "Leaderboard", icon: "trophy", route: "/leaderboard", hasNew: true },
    { label: "Photos", icon: "camera", route: "/photos", hasNew: false },
    { label: "Session Q&A", icon: "message-circle-question", route: "/session-qa", hasNew: false },
    { label: "Polls", icon: "bar-chart", route: "/polls", hasNew: true },
    { label: "Kids", icon: "baby", route: "/kids", hasNew: false },
    { label: "Prayer", icon: "moon", route: "/prayer", hasNew: false },
    { label: "Exhibitors", icon: "building", route: "/exhibitors", hasNew: false },
    { label: "Shuttle", icon: "bus", route: "/shuttle", hasNew: false },
    { label: "Agenda", icon: "calendar", route: "/agenda", hasNew: false },
    { label: "Documents", icon: "file-text", route: "/documents", hasNew: false },
    { label: "Sponsors", icon: "heart", route: "/sponsors", hasNew: false },
    { label: "Logistics", icon: "map-pinned", route: "/logistics", hasNew: true },
  ]

  const tiles = event.resourceTiles.length > 0
    ? event.resourceTiles.map((t: { label: string; icon: string | null; route: string; hasNew: boolean }) => ({
      label: t.label,
      icon: t.icon || "calendar",
      route: t.route,
      hasNew: t.hasNew,
    }))
    : defaultTiles

  return (
    <div className="flex flex-col min-h-screen">
      {/* Hidden header - avatar accessible via tap on banner area */}
      <Header
        eventSlug={eventSlug}
        eventName={event.name}
        eventLogoUrl={event.logoUrl}
      />

      {/* Hero Banner */}
      <EventBanner
        bannerUrl={event.bannerUrl}
        logoUrl={event.logoUrl}
        name={event.name}
        tagline={event.tagline}
        startDate={event.startDate}
        endDate={event.endDate}
        venueName={event.venue?.name}
      />

      {/* Event Summary */}
      <EventSummary
        name={event.name}
        city={event.city}
        state={event.state}
        startDate={event.startDate}
        endDate={event.endDate}
      />

      {/* Venue Map Preview */}
      {event.venue && (
        <VenueMapPreview
          venueName={event.venue.name}
          mapImageUrl={event.venue.mapImageUrl}
          mapsUrl={event.venue.mapsUrl}
          eventSlug={eventSlug}
          latitude={event.venue.latitude}
          longitude={event.venue.longitude}
        />
      )}

      {/* Resource Tiles Grid */}
      <ResourceGrid eventSlug={eventSlug} tiles={tiles} />

      {/* Sponsor Strip */}
      <SponsorStrip
        sponsors={event.sponsors.map((s: { id: string; name: string; tier: string; logoUrl: string | null; website: string | null }) => ({
          id: s.id,
          name: s.name,
          tier: s.tier,
          logoUrl: s.logoUrl,
          website: s.website,
        }))}
        eventSlug={eventSlug}
      />
    </div>
  )
}
