
import React, { useState, useContext, FormEvent } from 'react';
import { AuthContext } from '../contexts/AuthContext';
import { MovieListsContext } from '../contexts/MovieListsContext';
import { NotificationContext } from '../contexts/NotificationContext';
import MovieCard from '../components/MovieCard';

const Profile: React.FC = () => {
  const authContext = useContext(AuthContext);
  const notificationContext = useContext(NotificationContext);
  
  if (!authContext || !authContext.user) {
    // This should not be reached due to ProtectedRoute
    return <div className="text-center text-slate-400">User not found.</div>;
  }

  const { user, updateUserDisplayName } = authContext;
  const [username, setUsername] = useState(user.username);
  const [isUpdating, setIsUpdating] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (username.trim() && !isUpdating) {
      setIsUpdating(true);
      try {
        await updateUserDisplayName(username.trim());
        notificationContext?.addNotification('Profile updated successfully!');
      } finally {
        setIsUpdating(false);
      }
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-12">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold mb-8 border-l-4 border-blue-500 pl-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Your Profile</h1>
        <div className="bg-slate-100 dark:bg-slate-800/50 p-8 rounded-lg shadow-xl max-w-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="flex items-center space-x-4 mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
              {user.profilePicture ? (
                <img src={user.profilePicture} alt={user.username} className="h-20 w-20 rounded-full border-4 border-blue-500/30" referrerPolicy="no-referrer" />
              ) : (
                <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center font-bold text-2xl text-white border-4 border-blue-500/30">
                  {user.username.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Primary Account</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{user.email}</p>
              </div>
            </div>

            <div>
              <label htmlFor="username" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">
                Display Name
              </label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="w-full bg-slate-200 dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-900 dark:text-white rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
                required
              />
            </div>
            <div className="flex items-center justify-between">
              <button
                type="submit"
                disabled={isUpdating}
                className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-6 rounded-lg transition-colors duration-300 disabled:bg-slate-500 disabled:cursor-not-allowed"
              >
                {isUpdating ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Profile;
