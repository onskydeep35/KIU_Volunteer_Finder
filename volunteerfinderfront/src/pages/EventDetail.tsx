import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useNavigate, useParams } from 'react-router-dom'

import ApplicationModal from '@/components/event/ApplicationModal'
import { api, type Event } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

const clsx = (...classes: (string | false | null | undefined)[]) =>
  classes.filter(Boolean).join(' ')

const icons = {
  calendar: (
    <>
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
      <line x1="16" y1="2" x2="16" y2="6" />
      <line x1="8" y1="2" x2="8" y2="6" />
      <line x1="3" y1="10" x2="21" y2="10" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <polyline points="12 7 12 12 15 15" />
    </>
  ),
  'map-pin': (
    <>
      <path d="M12 21s7-7.5 7-12a7 7 0 10-14 0c0 4.5 7 12 7 12z" />
      <circle cx="12" cy="9" r="2.5" />
    </>
  ),
  users: (
    <>
      <path d="M17 21v-2a4 4 0 00-4-4H7a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87" />
      <path d="M16 3.13a4 4 0 010 7.75" />
    </>
  ),
  handheart: (
    <>
      <path d="M11.645 20.91l-.007-.003-.022-.012a15.247 15.247 0 01-.383-.218 25.18 25.18 0 01-4.244-3.17C4.688 15.36 2.25 12.174 2.25 8.25 2.25 5.322 4.714 3 7.688 3A5.5 5.5 0 0112 5.052 5.5 5.5 0 0116.313 3c2.973 0 5.437 2.322 5.437 5.25 0 3.925-2.438 7.111-4.739 9.256a25.175 25.175 0 01-4.244 3.17 15.247 15.247 0 01-.383.219l-.022.012-.007.004-.003.001a.752.752 0 01-.704 0l-.003-.001z" />
    </>
  ),
} as const

type IconName = keyof typeof icons

const Icon = ({ name, className }: { name: IconName; className?: string }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
  >
    {icons[name]}
  </svg>
)

const InfoRow = ({
  icon,
  label,
  value,
}: {
  icon: IconName
  label: string
  value: string | number
}) => (
  <div className="flex items-start gap-3 text-sm">
    <Icon name={icon} className="w-5 h-5 text-primary mt-0.5" />
    <div>
      <p className="font-medium">{label}</p>
      <p className="text-gray-600">{value}</p>
    </div>
  </div>
)

const renderMarkdown = (md: string) => {
  if (!md) return ''
  const escaped = md.replace(/</g, '&lt;').replace(/>/g, '&gt;')
  const withBold = escaped.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  const withItalic = withBold.replace(/\*(.+?)\*/g, '<em>$1</em>')
  return withItalic
    .split(/\n{2,}/)
    .map((p) => `<p>${p}</p>`) // naive paragraphs
    .join('')
}

const EventDetail = () => {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  
  // Ensure we have an ID
  if (!id) {
    return <div className="text-center p-8 text-red-600">No event ID provided</div>
  }

  const eventId = String(id)
  
  // Use the proper API call
  const { data: event, isLoading, error } = useQuery({
    queryKey: ['event', eventId],
    queryFn: () => api.getEvent(eventId),
    retry: 1,
  })

  if (isLoading) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center">
          <div className="animate-pulse">Loading event...</div>
        </div>
      </div>
    )
  }

  if (error) {
    console.error('Error loading event:', error)
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center p-8 text-red-600">
          <h2 className="text-xl font-semibold mb-2">Error loading event</h2>
          <p>Please try again later.</p>
          <button 
            onClick={() => navigate('/events')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  if (!event) {
    return (
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center">
        <div className="text-center p-8 text-red-600">
          <h2 className="text-xl font-semibold mb-2">Event not found</h2>
          <button 
            onClick={() => navigate('/events')}
            className="mt-4 px-4 py-2 bg-primary text-white rounded hover:bg-primary/90"
          >
            Back to Events
          </button>
        </div>
      </div>
    )
  }

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      })
    } catch (e) {
      return 'Invalid date'
    }
  }

  // Determine status based on dates
  const getStatus = (startDate: string, endDate: string) => {
    try {
      const now = new Date()
      const start = new Date(startDate)
      const end = new Date(endDate)

      if (now < start) return 'open'
      if (now > end) return 'closed'
      return 'open'
    } catch (e) {
      return 'unknown'
    }
  }

  const status = getStatus(event.start_date, event.end_date)
  const isCreator = user && String(user.user_id) === String(event.user_id)

  const onRegister = () => setOpen(true)
  const onEdit = () => navigate(`/edit-event/${event.event_id}`)
  const onViewVolunteers = () => navigate(`/events/${event.event_id}/volunteers`)

  return (
    <main className="min-h-[calc(100vh-4rem)] flex flex-col">
      {/* ── HERO ─────────────────────────────────────── */}
      <section className="relative w-full h-64 md:h-80">
        <img
          src={event.image_url || '/placeholder-event.svg'}
          alt={event.org_title || 'Event image'}
          className="absolute inset-0 w-full h-full object-cover"
          onError={(e) => {
            const target = e.target as HTMLImageElement
            target.src = '/placeholder-event.svg'
          }}
        />
        <div className="absolute inset-0 bg-black/40" />

        {/* hero overlay */}
        <div className="relative z-10 max-w-7xl mx-auto h-full flex flex-col justify-end px-4 pb-6 text-white">
          <h1 className="text-2xl sm:text-3xl font-bold flex items-center gap-3">
            {event.org_title}
            <span
              className={clsx(
                'px-2 py-0.5 text-[11px] font-semibold rounded-full uppercase tracking-wide',
                status === 'open' && 'bg-[#006C67]',
                status === 'full' && 'bg-[#FF6B6B]',
                status === 'closed' && 'bg-gray-500',
                status === 'unknown' && 'bg-gray-400',
              )}
            >
              {status}
            </span>
          </h1>
          <p className="mt-1 text-sm text-gray-200">
            {formatDate(event.start_date)} · {event.city}, {event.region}, {event.country}
          </p>
        </div>
      </section>

      {/* ── BODY ─────────────────────────────────────── */}
      <section className="flex-1 w-full max-w-7xl mx-auto px-4 py-10 grid gap-10 lg:grid-cols-[2fr,1fr]">
        {/* LEFT column — description */}
        <article className="prose prose-slate max-w-none">
          <h2 className="sr-only">Description</h2>
          <div dangerouslySetInnerHTML={{ __html: renderMarkdown(event.description) }} />
        </article>

        {/* RIGHT column — info card */}
        <aside className="space-y-6">
          <div className="bg-white rounded-xl shadow p-6 space-y-4">
            <h3 className="text-lg font-semibold">Event info</h3>

            <InfoRow icon="calendar" label="Date" value={formatDate(event.start_date)} />
            <InfoRow 
              icon="map-pin" 
              label="Location" 
              value={`${event.city || ''}, ${event.region || ''}, ${event.country || ''}`} 
            />

            {status === 'open' && (
              <button
                className="btn-primary w-full text-lg flex items-center justify-center gap-2"
                onClick={onRegister}
              >
                <Icon name="handheart" className="w-5 h-5" /> Register as Volunteer
              </button>
            )}

            {status === 'closed' && (
              <div className="text-center py-4 text-gray-600">
                Registration is closed
              </div>
            )}
          </div>

          {isCreator && (
            <div className="flex flex-col gap-3">
              <button onClick={onEdit} className="btn-secondary">
                Edit Event
              </button>
              <button onClick={onViewVolunteers} className="btn-tertiary">
                View Volunteers ({event.applications?.length || 0})
              </button>
            </div>
          )}
        </aside>
      </section>

      {/* Application Modal */}
      {event.volunteer_form && (
        <ApplicationModal
          open={open}
          onClose={() => setOpen(false)}
          eventId={event.event_id}
          questions={event.volunteer_form}
        />
      )}
    </main>
  )
}

export default EventDetail