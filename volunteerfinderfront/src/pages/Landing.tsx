import { useState, useEffect, useRef, useCallback } from 'react'
import { Link } from 'react-router-dom'
import SearchInput from '@/components/common/SearchInput'
import EventCard from '@/components/event/EventCard'
import CreateEventCard from '@/components/event/CreateEventCard'
import { useInfiniteQuery } from '@tanstack/react-query'
import { api, type Event } from '@/lib/api'
import { useAuth } from '@/lib/useAuth'

const fetchEvents = async ({ pageParam = 1 }): Promise<Event[]> => {
  const res = await api.getEvents('', pageParam);

  return res;
}

const Landing = () => {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('')
  const [searchedEvents, setSearchedEvents] = useState<Event[]>([])

  const { user } = useAuth()

  const {
    data,
    isLoading,
    isFetchingNextPage,
    fetchNextPage,
    hasNextPage,
    error,
  } = useInfiniteQuery({
    queryKey: ['events', user?.user_id],
    queryFn: ({ pageParam = 1 }) =>
      fetchEvents({ pageParam, userId: user ? String(user.user_id) : '' }),
    initialPageParam: 1,
    getNextPageParam: (lastPage, pages) =>
      lastPage.length === 10 ? pages.length + 1 : undefined,
  })

  const handleSetSearch = useCallback((value: string) => {
    setSearch(value);
  }, []);

  const handleSetSearchedEvents = useCallback((events: Event[]) => {
    setSearchedEvents(events);
  }, []);

  const events = search ? searchedEvents : data?.pages.flat() ?? []
  const loadMoreRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const el = loadMoreRef.current
    if (!el) return
    const observer = new IntersectionObserver((entries) => {
      if (entries[0].isIntersecting && hasNextPage) {
        fetchNextPage()
      }
    })
    observer.observe(el)
    return () => observer.disconnect()
  }, [loadMoreRef, fetchNextPage, hasNextPage])

  if (isLoading) {
    return (
      <div className="px-8 py-16 max-w-screen-xl mx-auto">
        <div className="text-center">Loading events...</div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="px-8 py-16 max-w-screen-xl mx-auto">
        <div className="text-center text-red-600">Error loading events. Please try again later.</div>
      </div>
    )
  }

  return (
    <div className="px-8 py-16 max-w-screen-xl mx-auto flex flex-col gap-12">
      <section className="py-10 text-center space-y-2">
        <h1 className="text-3xl font-bold">Volunteer opportunities, simplified.</h1>
        <p className="text-gray-600">Find, join and create volunteer events near you.</p>
        <div className="hidden lg:flex flex-col sm:flex-row justify-center gap-4 mt-6">
          <SearchInput
            value={search}
            onChange={handleSetSearch}
            onEventsFound={handleSetSearchedEvents}
            className="w-full max-w-lg mx-auto"
          />
          <select
            value={category}
            onChange={(e) => setCategory(e.target.value)}
            className="input-primary w-full sm:w-48"
          >
            <option value="">All categories</option>
            <option value="Community">Community</option>
            <option value="Animals">Animals</option>
            <option value="Education">Education</option>
            <option value="Environment">Environment</option>
            <option value="Health">Health</option>
          </select>
        </div>
      </section>
      <CreateEventCard />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">

        {Array.isArray(events) && events.length > 0 ? (
          events.map((event: Event) => (
            <EventCard event={event} key={event.event_id} />
          ))
        ) : (
          <div className="col-span-full bg-white p-8 rounded-xl text-center shadow">
            <p className="mb-2">No events found.</p>
            <p>
              Try adjusting your filters or{' '}
              <Link to="/create-event" className="text-primary hover:underline">
                post a new event
              </Link>
              .
            </p>
          </div>
        )}

        <div ref={loadMoreRef} className="col-span-full h-1" />
        {isFetchingNextPage && (
          <div className="col-span-full text-center">Loading more...</div>
        )}

      </div>
    </div>
  )
}

export default Landing
