
import React, { useState, useEffect } from 'react';
import { getTrendingMovies, getNowPlayingMovies } from '../services/tmdbService';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import SortDropdown from '../components/SortDropdown';

type TimeWindow = 'day' | 'week';

const sortMovies = (moviesToSort: Movie[], option: string): Movie[] => {
  const sorted = [...moviesToSort];
  switch (option) {
    case 'popularity.desc':
      return sorted.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    case 'release_date.desc':
      const today = new Date();
      today.setHours(23, 59, 59, 999); // Compare against the end of today
      return sorted
        .filter(movie => movie.release_date && new Date(movie.release_date) <= today)
        .sort((a, b) => {
          const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
          const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
          return dateB - dateA;
        });
    case 'release_date.asc':
      return sorted.sort((a, b) => {
        const dateA = a.release_date ? new Date(a.release_date).getTime() : 0;
        const dateB = b.release_date ? new Date(b.release_date).getTime() : 0;
        return dateA - dateB;
      });
    case 'vote_average.desc':
      return sorted.sort((a, b) => (b.vote_average || 0) - (a.vote_average || 0));
    default:
      return moviesToSort;
  }
};

const Trending: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortedMovies, setSortedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [timeWindow, setTimeWindow] = useState<TimeWindow>('day');
  const [sortOption, setSortOption] = useState<string>('popularity.desc');

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const [trendingResponse, nowPlayingIndiaResponse] = await Promise.all([
          getTrendingMovies(timeWindow),
          getNowPlayingMovies({ region: 'IN' })
        ]);
        
        const combinedMovies = [
            ...nowPlayingIndiaResponse.results,
            ...trendingResponse.results
        ];

        const uniqueMoviesMap = new Map<number, Movie>();
        combinedMovies.forEach(movie => {
          uniqueMoviesMap.set(movie.id, movie);
        });
        const uniqueMovies = Array.from(uniqueMoviesMap.values());
        
        setMovies(uniqueMovies);

      } catch (err) {
         if (err instanceof Error) {
            setError(err.message);
        } else {
            setError("An unknown error occurred.");
        }
      } finally {
        setLoading(false);
      }
    };

    fetchMovies();
  }, [timeWindow]);

  useEffect(() => {
    setSortedMovies(sortMovies(movies, sortOption));
  }, [movies, sortOption]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;

  const getButtonClass = (isActive: boolean) => {
    const baseClasses = 'px-6 py-2.5 rounded-xl font-black uppercase tracking-widest text-[10px] transition-all duration-300 focus:outline-none active:scale-[0.98]';
    if (isActive) {
      return `${baseClasses} bg-blue-600 text-white shadow-lg shadow-blue-500/20`;
    }
    return `${baseClasses} bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700`;
  };
  
  return (
    <div className="pb-20">
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center mb-12 gap-8">
        <div className="flex items-center space-x-3">
           <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
           <h1 className="text-3xl md:text-4xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Trending Now</h1>
        </div>
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
            <div className="flex items-center space-x-2 bg-white dark:bg-slate-900 overflow-hidden p-1 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button onClick={() => setTimeWindow('day')} className={getButtonClass(timeWindow === 'day')}>
                    Daily Sync
                </button>
                <button onClick={() => setTimeWindow('week')} className={getButtonClass(timeWindow === 'week')}>
                    Weekly Flow
                </button>
            </div>
            <div className="w-full sm:w-64">
              <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
            </div>
        </div>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
        {sortedMovies.map(movie => (
          <MovieCard key={movie.id} movie={movie} />
        ))}
      </div>
    </div>
  );
};

export default Trending;
