import { useState, useEffect } from 'react';
import { api } from '@/lib/api';
import type { User } from '@/lib/api';

// A helper component for displaying a single user in the list
const UserRow = ({ user, rank }: { user: User; rank: number }) => {
  const rankColor =
    rank === 1 ? 'bg-yellow-400 text-white' :
    rank === 2 ? 'bg-gray-400 text-white' :
    rank === 3 ? 'bg-yellow-600 text-white' :
    'bg-gray-200 text-gray-700';

  return (
    <div className="flex items-center bg-white p-4 rounded-lg shadow-sm transition-transform hover:scale-105">
      <div className={`w-10 h-10 flex-shrink-0 rounded-full flex items-center justify-center font-bold text-lg ${rankColor}`}>
        {rank}
      </div>
      <div className="ml-4 flex-grow">
        <p className="font-semibold text-gray-800">{user.first_name} {user.last_name}</p>
      </div>
      <div className="text-lg font-bold text-primary">
        {user.score} <span className="text-sm font-normal text-gray-500">pts</span>
      </div>
    </div>
  );
};

// The main page component
const RankingsPage = () => {
  const [topUsers, setTopUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUsers = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const users = await api.getTopRankedUsers(10);
        setTopUsers(users);
      } catch (err) {
        setError('Could not load the leaderboard. Please try again later.');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchTopUsers();
  }, []);

  if (isLoading) {
    return <div className="text-center p-10">Loading Leaderboard...</div>;
  }

  if (error) {
    return <div className="text-center p-10 text-red-500">{error}</div>;
  }

  const [first, second, third, ...rest] = topUsers;

  return (
    <div className="bg-gray-50 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-4xl font-bold text-center text-gray-800 mb-4">Top Volunteers</h1>
        <p className="text-center text-gray-600 mb-12">Celebrating our most dedicated community members!</p>

        {/* Podium for Top 3 */}
        {topUsers.length >= 3 && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12 text-center">
            {/* 2nd Place */}
            <div className="flex flex-col items-center justify-end">
              <h3 className="font-bold mt-2">{second.first_name} {second.last_name}</h3>
              <p className="text-gray-500">{second.score} pts</p>
              <div className="w-full h-24 bg-gray-300 rounded-t-lg mt-2 flex items-center justify-center text-3xl font-bold text-white">2</div>
            </div>
             {/* 1st Place */}
            <div className="flex flex-col items-center justify-end order-first md:order-none">
              <h3 className="font-bold mt-2">{first.first_name} {first.last_name}</h3>
              <p className="text-gray-500">{first.score} pts</p>
              <div className="w-full h-32 bg-yellow-400 rounded-t-lg mt-2 flex items-center justify-center text-4xl font-bold text-white">1</div>
            </div>
             {/* 3rd Place */}
            <div className="flex flex-col items-center justify-end">
              <h3 className="font-bold mt-2">{third.first_name} {third.last_name}</h3>
              <p className="text-gray-500">{third.score} pts</p>
              <div className="w-full h-20 bg-yellow-600 rounded-t-lg mt-2 flex items-center justify-center text-3xl font-bold text-white">3</div>
            </div>
          </div>
        )}

        {/* Leaderboard for the rest */}
        <div className="space-y-4 max-w-2xl mx-auto">
          {rest.map((user, index) => (
            <UserRow key={user.user_id} user={user} rank={index + 4} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default RankingsPage;
