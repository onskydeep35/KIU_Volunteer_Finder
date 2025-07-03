import { FastifyInstance } from 'fastify';
import { FieldValue, Timestamp } from 'firebase-admin/firestore';
import { v4 as uuidv4 } from 'uuid';
import { Badge, User } from '../types/models/user';
import { Application } from '../types/models/application';
import bcrypt from 'bcrypt';
import { badgeRules } from './badgeRules';

export async function createUser(
  app: FastifyInstance,
  first_name: string,
  last_name: string,
  age: number,
  sex: 'Male' | 'Female',
  email: string,
  username: string,
  password: string,
): Promise<User> {
  const hashedPassword = await bcrypt.hash(password, 10); 

  const user: User = {
    user_id: uuidv4(),
    first_name,
    last_name,
    age,
    sex,
    email,
    username,
    password: hashedPassword,
    applications: [],
    events: [],
    score: 0
  };

  await app.db.collection('users').doc(user.user_id).set(user);
  console.log(`✅ Created user='${user.user_id}'`);
  return user;
}


export async function updateCreatorEventsList(
  app: FastifyInstance,
  creator_user_id: string,
  event_id: string,
): Promise<void> {
  const userRef = app.db.collection('users').doc(creator_user_id);

  const userSnap = await userRef.get();
  if (!userSnap.exists) throw new Error('User not found');

  await userRef.update({
    events: FieldValue.arrayUnion(event_id),
  });

  console.log(`✅ Updated user='${creator_user_id}' events with event=${event_id}`);
}

export async function updateCreatorOnEventCompletion(
  app: FastifyInstance,
  creator_user_id: string
): Promise<void> {
  const userRef = app.db.collection('users').doc(creator_user_id);
  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.log("Creator user id doesn't exist");
    return;
  }

  const user = userSnap.data() as User;
  const completedEventsAmount = user.completed_events || 0;
  await userRef.update({
    completed_events: completedEventsAmount + 1
  });

  console.log(`✅ Updated completed events for user='${creator_user_id}' to ${completedEventsAmount + 1}`);
}

export async function getTopRankedUsers(
  app: FastifyInstance,
  amount: number
): Promise<User[]> {
  const usersSnap = await app.db.collection('users')
    .orderBy('score', 'desc')
    .limit(amount)
    .get();

  if (usersSnap.empty) {
    console.log('No users found');
    return [];
  }

  const topUsers: User[] = [];
  usersSnap.forEach(doc => {
    topUsers.push(doc.data() as User);
  });

  console.log(`✅ Retrieved top ranked users: ${topUsers.length}`);
  return topUsers;
}

export async function removeApplicationFromUser(
  app: FastifyInstance,
  application: Application,
): Promise<void> {
  const userRef = app.db.collection('users').doc(application.applicant_user_id);

  const userSnap = await userRef.get();
  if (!userSnap.exists) {
    console.log("applicant user id doesn't exist");
    return;
  }

  await userRef.update({
    applications: FieldValue.arrayRemove(application.application_id),
  });

  console.log(`✅ Removed application='${application.application_id}' from user=${application.applicant_user_id}`);
}

export async function giveAllUsers0Score(app: FastifyInstance) {
  const usersSnap = await app.db.collection('users').get();
  usersSnap.forEach(async (doc) => {
    const user = doc.data() as User;
    if (!user.score) {
      await app.db.collection('users').doc(user.user_id).update({ score: 0 });
      console.log(`✅ Set score=0 for user=${user.user_id}`);
    }
  });
}

export async function updateUserBadges(
  app: FastifyInstance,
  user: User
): Promise<boolean> {
  const badgesToAdd: Badge[] = [];

  badgeRules.forEach(rule => {
    if ((!user.badges || !user.badges.some(badge => badge.name === rule.badge.name)) && rule.check(user)) {
      badgesToAdd.push(rule.badge);
    }
  });

  if (badgesToAdd.length > 0) {
    const updatedBadges = [...(user.badges || []), ...badgesToAdd];
    await app.db.collection('users').doc(user.user_id).update({ badges: updatedBadges });
    console.log(`✅ Updated badges for user=${user.user_id}`);
    user.badges = updatedBadges;
    return true;
  }

  console.log(`No new badges for user=${user.user_id}`);
  return false;
}
