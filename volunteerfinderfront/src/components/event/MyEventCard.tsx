import { useNavigate } from 'react-router-dom'
import type { Event } from '@/lib/api'
import CompleteEventButton from './CompleteEventButton'

interface Props {
  event: Event
}

const MyEventCard = ({ event }: Props) => {
  const navigate = useNavigate()
  const formatDate = (date: string) =>
    new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    })

  return (
    <article className="group relative flex flex-col sm:flex-row gap-4 bg-white rounded-xl shadow-sm hover:shadow-md transition overflow-hidden">
      <img
        src={event.image_url || '/placeholder-event.svg'}
        alt=""
        className="w-full sm:w-40 h-40 object-cover bg-gray-100"
        loading="lazy"
      />
      <div className="flex-1 p-4 space-y-1">
        <h3 className="text-lg font-semibold leading-snug group-hover:underline">
          {event.org_title}
        </h3>
        <p className="text-sm text-gray-600">
          {formatDate(event.start_date)} · {event.city}
        </p>
        <p className="text-xs text-gray-400">
          Volunteers joined {event.volunteer_form?.length ?? 0}
        </p>
      </div>
      <footer className="flex gap-3 p-4 pt-0 sm:p-4 sm:pt-4">
        <button
          onClick={() => navigate(`/edit-event/${event.event_id}`)}
          className="btn-primary"
        >
          Manage Event
        </button>
        <button
          onClick={() => navigate(`/events/${event.event_id}/volunteers`)}
          className="btn-tertiary"
        >
          Manage Volunteers
        </button>
        <CompleteEventButton eventId={event.event_id} onEventCompleted={() => navigate('/events')} />
      </footer>
    </article>
  )
}

export default MyEventCard
