import { FastifyInstance } from 'fastify';
import { v4 as uuidv4 } from 'uuid';
import { Event } from '../types/models/event';
import { updateCreatorEventsList, updateCreatorOnEventCompletion } from './userService';
import { LoadEventsRequest } from '../types/requests/loadEventsRequest';
import { CreateEventRequest } from '../types/requests/createEventRequest';
import { UpdateEventRequest } from '../types/requests/updateEventRequest';

export async function prefixSearchEventsByTitle(
  app: FastifyInstance,
  titlePrefix: string
): Promise<Event[]> {
    let q: FirebaseFirestore.Query = app.db.collection('events');
    q = q.orderBy('org_title')
      .startAt(titlePrefix)
      .endAt(titlePrefix + '\uf8ff');

    const snapshot = await q.get();

    if (snapshot.empty) {
        console.log('No matching events found that start with:', titlePrefix);
        return [];
    }

    let events = snapshot.docs.map(doc => doc.data() as Event);
    events = events.filter(event => event.completed !== true);

    return events;
}

export async function loadEvents(
  app: FastifyInstance,
  filters: LoadEventsRequest
): Promise<Event[]> {
  let q: FirebaseFirestore.Query = app.db.collection('events');

  console.log('Loading events with filters of creator_id:', filters.creator_id);
  console.log('Loading events with filters of fetch_completed:', filters.fetch_completed);

  // ── exact-match filters ─────────────────────────────────────────────
  if (filters.creator_id) q = q.where('creator_user_id', '==', filters.creator_id);
  else if (filters.page) {
    const pageSize = 10;
    const startAt = (filters.page - 1) * pageSize;
    q = q.orderBy('created_at', 'desc').offset(startAt).limit(pageSize);
  }
  
  // ── sort by hits descending ───────────────────────────────────────
  q = q.orderBy('hits', 'desc');

  // ── run query & map to typed objects ───────────────────────────────
  const snap = await q.get();

  if (snap.empty) {
    console.log('No matching events found');
    return [];
  }

  let events = snap.docs.map(d => d.data() as Event);
  if (filters.fetch_completed) events = events.filter(event => event.completed === true);
  else events = events.filter(event => event.completed !== true);

  return events;
}

export async function createEvent(
  app: FastifyInstance,
  createRequest: CreateEventRequest
): Promise<Event> {
  const event: Event = {
    event_id: uuidv4(),
    creator_user_id: createRequest.user_id,
    image_url: createRequest.image_url,
    start_date: createRequest.start_date,
    end_date: createRequest.end_date,
    description: createRequest.description,
    volunteer_form: createRequest.volunteer_form,
    applications: [],
    hits: 0,
    category: createRequest.category,
    org_title: createRequest.org_title,
    country: createRequest.country,
    region: createRequest.region,
    city: createRequest.city,
    completed: false
  };

  await app.db.collection('events').doc(event.event_id).set(event);
  await updateCreatorEventsList(app, event.creator_user_id, event.event_id);

  return event;
}

export async function updateEvent(
  app: FastifyInstance,
  request: UpdateEventRequest
): Promise<boolean> {
  const ref = app.db.collection('events').doc(request.event_id);
  const snap = await ref.get();

  if (!snap.exists) {
    console.log("event doesn't exist")
    return false;
  }

  await ref.update({ 
    image_url: request.image_url,  
    title: request.title,
    start_date: request.start_date,  
    end_date: request.end_date,  
    description: request.description, 
    volunteer_form: request.volunteer_form,  
  });
  return true;
}

export async function completeEvent(
  app: FastifyInstance,
  event_id: string
): Promise<boolean> {
  const ref = app.db.collection('events').doc(event_id);
  const snap = await ref.get();

  if (!snap.exists) {
    console.log("event doesn't exist")
    return false;
  }

  await ref.update({'completed': true});
  await updateCreatorOnEventCompletion(app, snap.data()!.creator_user_id);

  // add score to each volunteer
  snap.data()!.applications.forEach(async (applicationId: string) => {
    const applicationRef = app.db.collection('applications').doc(applicationId);
    const applicationSnap = await applicationRef.get();

    if (applicationSnap.exists) {
      const applicationData = applicationSnap.data();
      if (applicationData && applicationData.user_id && applicationData.status === 'accepted') {
        // Increment user's score
        const userRef = app.db.collection('users').doc(applicationData.user_id);
        const user = await userRef.get();
        const score = user.data()!.score || 0;
        await userRef.update({
          score: score + 1
        });
        console.log(`Updated score for user ${user.data()!.email}: ${score + 1}`);
      }
    }
  });

  console.log(`Event ${event_id} marked as completed and scores updated for volunteers.`);

  return true;
}