import { FastifyPluginAsync } from 'fastify';
import { CreateEventRequest } from '../types/requests/createEventRequest';
import { EntityUpdateStatusResponse } from '../types/responses/entityUpdateStatusResponse';
import { LoadEntityRequest}  from '../types/requests/loadEntityRequest';
import { createEvent, prefixSearchEventsByTitle } from '../services/eventService';
import { getEntityById} from '../services/entityService';
import { loadEvents }          from '../services/eventService';
import { LoadEventsRequest }   from '../types/requests/loadEventsRequest';
import { Event } from '../types/models/event';
import { Application } from '../types/models/application';
import { removeApplicationFromUser } from '../services/userService';
import { UpdateEventRequest } from '../types/requests/updateEventRequest';
import { updateEvent } from '../services/eventService';
import { SearchEventsByTitleRequest } from '../types/requests/searchEventsByTitleRequest';

const events: FastifyPluginAsync = async (app) => {
    app.get<{ Querystring: SearchEventsByTitleRequest; Reply: Event[] }>(
      '/search',
      async (req, reply) => {
        try {
          const titlePrefix = req.query.title_prefix || '';
          if (!titlePrefix) {
            return reply.code(400).send([]);
          }

          const events = await prefixSearchEventsByTitle(app, titlePrefix);
          
          return reply.send(events);
        } catch (err: any) {
          console.error('❌ Error in /events/search:', err);
          return reply.code(500).send([]);
        }
      }
    );


    app.get<{ Querystring: LoadEventsRequest; Reply: Event[] }>(
      '/loadMany',
      async (req, reply) => {
        try {
          const page = req.query.page || 1;
          const limit = 10;
          const offset = (page - 1) * limit;

          const allEvents = await loadEvents(app, req.query);
          
          // Simple array slicing for pagination
          const paginatedEvents = allEvents.slice(offset, offset + limit);
          
          return reply.send(paginatedEvents);
        } catch (err: any) {
          console.error('❌ Error in /events/list:', err);
          return reply.code(500).send([]);
        }
      }
    );

  // create an event
  app.post<{ Body: CreateEventRequest; Reply: EntityUpdateStatusResponse }>(
    '/create',
    async (req, reply) => {
      try {
        if (!req.body.user_id 
          || !req.body.image_url 
          || !req.body.start_date 
          || !req.body.end_date 
          || !req.body.description 
          || !req.body.volunteer_form 
          || !req.body.category 
          || !req.body.org_title 
          || !req.body.country 
          || !req.body.region 
          || !req.body.city) {
          return reply.code(400).send({ message: 'Invalid input for event', entity_id: '' });
        }

        const event = await createEvent(app, req.body);
        
        console.log(`✅ Created event with id=${event.event_id}`);

        return reply.code(201).send({
          message: `Successfully created event`,
          entity_id: event.event_id,
        });
      } catch (err: any) {
        console.error('❌ Error in /apply:', err);
        const status = err.message === 'Event not found' || err.message === 'User not found' ? 404 : 500;
        return reply.code(status).send({ message: 'here', entity_id: '' });
      }
    }
  );

  // load all events
  app.get<{ Querystring: LoadEntityRequest }>(
    '/load',
    async (req, reply) => {
      try {
        const { entity_id } = req.query;

        if (!entity_id) {
          return reply.code(400).send({ message: 'Missing event ID', entity_id: '' });
        }

        const application = await getEntityById<Event>(app, 'events', entity_id);

        return reply.code(200).send(application);
      } catch (err: any) {
        console.error('❌ Error in /load:', err);
        const status = err.message.includes('not found') ? 404 : 500;
        return reply.code(status).send({ message: err.message });
      }
    }
  );

  // delete event and all its applications
  app.post<{ Querystring: LoadEntityRequest; Reply: EntityUpdateStatusResponse }>(
    '/delete',
    async (req, reply) => {
      try {
        const { entity_id } = req.query;

        if (!entity_id) {
          return reply.code(400).send({ message: 'Missing event ID', entity_id: '' });
        }

        const event = await getEntityById<Event>(app, 'events', entity_id);

        const applicationIds = event.applications || [];

        for (const applicationId of applicationIds) {
          const appDoc = await app.db.collection('applications').doc(applicationId).get();
          if (!appDoc.exists) continue;

          const application = appDoc.data() as Application;

          await removeApplicationFromUser(app, application);
          await app.db.collection('applications').doc(applicationId).delete();

          console.log(`🗑️ Deleted application=${applicationId}`);
        }

        // Delete event itself
        await app.db.collection('events').doc(entity_id).delete();

        console.log(`🗑️ Deleted event=${entity_id}`);

        return reply.code(200).send({
          message: 'Event and its applications deleted',
          entity_id,
        });
      } catch (err: any) {
        console.error('❌ Error in /delete:', err);
        const status = err.message.includes('not found') ? 404 : 500;
        return reply.code(status).send({
          message: 'Failed to delete event',
          entity_id: '',
        });
      }
    }
  );

  // update event
  app.post<{ Body: UpdateEventRequest; Reply: EntityUpdateStatusResponse }>(
    '/update',
    async (req, reply) => {
      try {
        const event_id = req.body.event_id;

        if (!event_id) {
          return reply.code(400).send({ message: 'Missing event ID', entity_id: '' });
        }
        
        const eventUpdated = await updateEvent(app, req.body);
        const message = eventUpdated ? `Updated event with id=${req.body.event_id}` : `Not found event with id=${req.body.event_id} to update`;

        return reply.code(200).send({ message: message, entity_id: `${req.body.event_id}` });
      } catch (err: any) {
        console.error('❌ Error in /delete:', err);
        const status = err.message.includes('not found') ? 404 : 500;
        return reply.code(status).send({
          message: 'Failed to delete event',
          entity_id: '',
        });
      }
    }
  );
};

export default events;
