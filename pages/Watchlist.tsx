
import React, { useContext, useState, useEffect } from 'react';
import { MovieListsContext } from '../contexts/MovieListsContext';
import MovieCard from '../components/MovieCard';
import SortDropdown from '../components/SortDropdown';
import { Movie } from '../types';

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

const Watchlist: React.FC = () => {
  const movieListsContext = useContext(MovieListsContext);
  const watchlist = movieListsContext?.watchlist || [];
  const [sortOption, setSortOption] = useState<string>('popularity.desc');
  const [sortedMovies, setSortedMovies] = useState<Movie[]>([]);

  useEffect(() => {
    setSortedMovies(sortMovies(watchlist, sortOption));
  }, [watchlist, sortOption]);

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold mb-8 border-l-4 border-blue-500 pl-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Your Watchlist</h1>
        <div className="w-full md:w-48">
          <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
        </div>
      </div>
      {sortedMovies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
          {sortedMovies.map(movie => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-center text-slate-500 dark:text-slate-400 text-lg mt-10">Your watchlist is empty.</p>
      )}
    </div>
  );
};

export default Watchlist;
