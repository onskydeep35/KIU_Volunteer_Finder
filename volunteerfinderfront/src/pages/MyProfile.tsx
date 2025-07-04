import { useEffect, useState } from 'react'
import { useAuth } from '@/lib/useAuth'
import { api, type User } from '@/lib/api'

const StarIcon = () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-8 w-8 text-yellow-400"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"></polygon></svg>
);

const MyProfile = () => {
  // Get the currently authenticated user
  const { user } = useAuth();
  
  // State to hold the detailed profile data, including badges
  const [profile, setProfile] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  // useEffect to fetch the user's full profile when the component mounts
  // or when the authenticated user changes.
  useEffect(() => {
    // We don't want to run this if there's no user.
    if (!user || !user.user_id) {
        setIsLoading(false);
        return;
    }

    const fetchProfile = async () => {
      try {
        setIsLoading(true);
        setError('');
        // Call the API to get the latest profile data
        const refreshedProfile = await api.refreshUserBadges(String(user.user_id));
        setProfile(refreshedProfile);
      } catch (err) {
        console.error("Failed to fetch user profile:", err);
        setError("Could not load profile. Please try again later.");
      } finally {
        setIsLoading(false);
      }
    };

    fetchProfile();
    
    // The effect depends on `user.user_id`. It will re-run if the user logs out
    // and a new user logs in.
  }, [user?.user_id]);

  // Render a loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900 text-white">
        <p>Loading Profile...</p>
      </div>
    );
  }

  // Render an error message if the API call failed
  if (error) {
    return (
       <div className="flex items-center justify-center h-screen bg-gray-900 text-red-400">
        <p>{error}</p>
      </div>
    );
  }
  
  // Render if there's no user profile data
  if (!profile) {
     return (
       <div className="flex items-center justify-center h-screen bg-gray-900 text-gray-400">
        <p>No profile to display.</p>
      </div>
    );
  }

  // Main JSX for the profile page
  return (
    <div className="bg-gray-900 min-h-screen text-white font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Profile Header */}
        <div className="flex flex-col sm:flex-row items-center space-y-4 sm:space-y-0 sm:space-x-6 bg-gray-800 p-6 rounded-2xl shadow-lg mb-8">
          <div className="flex-grow text-center sm:text-left">
            <h1 className="text-3xl font-bold text-white">{profile.username}</h1>
            <p className="text-md text-gray-400">User ID: {profile.user_id}</p>
          </div>
          <div className="text-center bg-gray-700 p-4 rounded-xl">
            <p className="text-sm font-semibold text-indigo-400 tracking-wider uppercase">Score</p>
            <p className="text-4xl font-bold text-white">{profile.score}</p>
          </div>
        </div>

        {/* Badges Section */}
        <div>
          <h2 className="text-2xl font-bold mb-4 text-gray-300">My Badges</h2>
          {profile.badges && profile.badges.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {profile.badges.map((badge) => (
                <div key={badge.name} className="bg-gray-800 p-5 rounded-xl shadow-md flex items-start space-x-4 transition-transform transform hover:scale-105 hover:shadow-indigo-500/20">
                  <div className="flex-shrink-0 bg-gray-700 p-3 rounded-lg">
                    <StarIcon />
                  </div>
                  <div>
                    <h3 className="font-bold text-lg text-white">{badge.name}</h3>
                    <p className="text-gray-400 text-sm">{badge.description}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-10 bg-gray-800 rounded-xl">
              <p className="text-gray-500">No badges earned yet. Keep going!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MyProfile;
