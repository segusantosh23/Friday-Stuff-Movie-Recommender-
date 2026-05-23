
import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { searchMovies } from '../services/tmdbService';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import SortDropdown from '../components/SortDropdown';

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

const SearchResults: React.FC = () => {
  const { query } = ReactRouterDOM.useParams<{ query: string }>();
  const [movies, setMovies] = useState<Movie[]>([]);
  const [sortedMovies, setSortedMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortOption, setSortOption] = useState<string>('popularity.desc');

  useEffect(() => {
    const performSearch = async () => {
      if (!query) return;
      try {
        setLoading(true);
        setError(null);
        const response = await searchMovies(query);
        setMovies(response.results);
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

    performSearch();
  }, [query]);
  
  useEffect(() => {
    setSortedMovies(sortMovies(movies, sortOption));
  }, [movies, sortOption]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;

  return (
    <div>
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <h1 className="text-3xl md:text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Search Results for "{query}"</h1>
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
        <p className="text-center text-slate-500 dark:text-slate-400 text-lg mt-10">No movies found matching your query.</p>
      )}
    </div>
  );
};

export default SearchResults;
