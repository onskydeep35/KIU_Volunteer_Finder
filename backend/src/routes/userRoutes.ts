import { FastifyBaseLogger, FastifyInstance, FastifyPluginAsync, FastifyTypeProviderDefault, RawServerDefault } from 'fastify'
import { LoadEntityRequest}  from '../types/requests/loadEntityRequest';
import { User } from '../types/models/user';
import { SignupRequest } from '../types/requests/userSignUpRequest';
import { LoginRequest } from '../types/requests/userLogInRequest';
import { EntityUpdateStatusResponse } from '../types/responses/entityUpdateStatusResponse';
import { getEntityById} from '../services/entityService';
import { createUser, getTopRankedUsers, giveAllUsers0Score, updateUserBadges } from '../services/userService';
import bcrypt from 'bcrypt';

const users: FastifyPluginAsync = async (app) => {
  // signup 
  app.post<{ Body: SignupRequest; Reply: EntityUpdateStatusResponse }>(
    '/signup',
    async (req, reply) => {
      try {
        const { first_name, last_name, age, sex, email, username, password } = req.body;

        if (!first_name || !last_name || !age || !sex || !email || !username || !password) {
          return reply.code(400).send({ message: 'Missing required fields', entity_id: '' });
        }

        // Check if username or email already exists
        const snapshot = await app.db.collection('users').get();
        const existingUser = snapshot.docs.find(doc => {
          const data = doc.data();
          return data.username === username || data.email === email;
        });

        if (existingUser) {
          return reply.code(409).send({
            message: 'Username or email already in use',
            entity_id: ``,
          });
        }

        const user = await createUser(app, first_name, last_name, age, sex, email, username, password);

        return reply.code(201).send({
          message: 'User registered successfully',
          entity_id: user.user_id,
        });
      } catch (err: any) {
        console.error('❌ Error in /signup:', err);
        return reply.code(500).send({ message: 'Internal error', entity_id: '' });
      }
    }
  );

  app.post(
    '/badgerefresh',
    async (req, reply) => {
      try {
        const userId = req.body.user_id;

        const snapshot = await app.db.collection('users').doc(userId).get();

        if (!snapshot.exists) {
          return reply.code(404).send({ message: 'User not found' });
        }

        const user = snapshot.data() as User;

        const updated = await updateUserBadges(app, user);

        return reply.code(200).send({ message: 'Badges refreshed successfully', updated: updated });
      } catch (err: any) {
        console.error('❌ Error in /badgerefresh:', err);
        return reply.code(500).send({ message: 'Failed to refresh badges' });
      }
    }
  );

  app.get(
    '/scorereset',
    async (req, reply) => {
      try {
        await giveAllUsers0Score(app);

        return reply.code(200).send({ message: 'Scores reset successfully' });
      } catch (err: any) {
        console.error('❌ Error in /scorereset:', err);
        return reply.code(500).send({ message: 'Failed to reset scores' });
      }
    }
  );

  app.get(
    '/top',
    async (req, reply) => {
      try {
        const amount = req.query.amount ? parseInt(req.query.amount as string, 10) : 10;

        const users = await getTopRankedUsers(app, amount);
        return reply.code(200).send(users);
      } catch (err: any) {
        console.error('❌ Error in /top:', err);
        return reply.code(500).send({ message: 'Failed to fetch top users' });
      }
    }
  );

  // login
  app.get<{ Querystring: LoginRequest }>(
    '/login',
    async (req, reply) => {
      try {
        const { user_identifier, password } = req.query;

        if (!user_identifier || !password) {
          return reply.code(400).send({ message: 'Missing credentials', entity_id: '' });
        }

        const snapshot = await app.db.collection('users').get();
        const matchingUser = snapshot.docs.find(doc => {
          const data = doc.data();
          return (data.username === user_identifier || data.email === user_identifier);
        });

        if (!matchingUser || !(await bcrypt.compare(password, matchingUser.data().password))) {
          return reply.code(401).send({ message: 'Invalid credentials', entity_id: '' });
        }

        if (!matchingUser) {
          return reply.code(401).send({ message: 'Invalid credentials', entity_id: '' });
        }

        return reply.send(matchingUser.data());
      } catch (err: any) {
        console.error('❌ Error in /login:', err);
        return reply.code(500).send({ message: 'Login failed', entity_id: '' });
      }
    }
  );


  // load event
  app.get<{ Querystring: LoadEntityRequest }>(
    '/load',
    async (req, reply) => {
      try {
        const { entity_id } = req.query;

        if (!entity_id) {
          return reply.code(400).send({ message: 'Missing user ID', entity_id: '' });
        }

        const application = await getEntityById<User>(app, 'users', entity_id);

        return reply.code(200).send(application);
      } catch (err: any) {
        console.error('❌ Error in /load:', err);
        const status = err.message.includes('not found') ? 404 : 500;
        return reply.code(status).send({ message: err.message });
      }
    }
  );

  // load random user
  app.get('/random', async (_req, reply) => {
    const snapshot = await app.db.collection('users').get()
    const users = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }))

    if (users.length === 0) {
      return reply.code(404).send({ message: 'No users found' })
    }

    const randomUser = users[Math.floor(Math.random() * users.length)]
    return reply.code(200).send(randomUser)
  })
}

export default users
