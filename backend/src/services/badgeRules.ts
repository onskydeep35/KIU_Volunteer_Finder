import type { Badge, User } from '../types/models/user';

const CreatedEventsBadge = (amount: number, title: string) => {
    return {
        name: title,
        description: `Created ${amount} events`,
    } as Badge;
};

const checkCreatedEventsBadge = (user: User, amount: number): boolean => {
    return user.events.length >= amount;
}

const CompletedEventsBadge = (amount: number, title: string) => {
    return {
        name: title,
        description: `Completed ${amount} events`,
    } as Badge;
};

const checkCompletedEventsBadge = (user: User, amount: number): boolean => {
    return user.completed_events !== undefined && user.completed_events >= amount;
}

const VolunteeredBadge = (amount: number, title: string) => {
    return {
        name: title,
        description: `Volunteered in ${amount} events`,
    } as Badge;
};

const checkVolunteeredBadge = (user: User, amount: number): boolean => {
    return user.score >= amount;
}

interface BadgeRule {
    check: (user: User) => boolean;
    badge: Badge;
};

export const badgeRules: BadgeRule[] = [
    { check: user => checkCreatedEventsBadge(user, 1), badge: CreatedEventsBadge(1, 'Event Creator First Steps') },
    { check: user => checkCreatedEventsBadge(user, 5), badge: CreatedEventsBadge(5, 'Event Creator Amateur') },
    { check: user => checkCreatedEventsBadge(user, 10), badge: CreatedEventsBadge(10, 'Event Creator Veteran') },
    { check: user => checkCreatedEventsBadge(user, 20), badge: CreatedEventsBadge(20, 'Event Creator Legend') },
    
    { check: user => checkCompletedEventsBadge(user, 1), badge: CompletedEventsBadge(1, 'Event Completer First Steps') },
    { check: user => checkCompletedEventsBadge(user, 5), badge: CompletedEventsBadge(5, 'Event Completer Amateur') },
    { check: user => checkCompletedEventsBadge(user, 10), badge: CompletedEventsBadge(10, 'Event Completer Veteran') },
    { check: user => checkCompletedEventsBadge(user, 20), badge: CompletedEventsBadge(20, 'Event Completer Legend') },
    
    { check: user => checkVolunteeredBadge(user, 1), badge: VolunteeredBadge(1, 'Volunteering First Steps') },
    { check: user => checkVolunteeredBadge(user, 5), badge: VolunteeredBadge(5, 'Volunteering Amateur') },
    { check: user => checkVolunteeredBadge(user, 10), badge: VolunteeredBadge(10, 'Volunteering Veteran') },
    { check: user => checkVolunteeredBadge(user, 20), badge: VolunteeredBadge(20, 'Volunteering Legend') }
];
