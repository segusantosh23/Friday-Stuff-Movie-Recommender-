import React, { useContext, useState, useEffect } from 'react';
import { Movie, WatchProvider } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { AuthContext } from '../contexts/AuthContext';
import { MovieListsContext } from '../contexts/MovieListsContext';
import { GenreContext } from '../contexts/GenreContext';
import { getMovieDetails } from '../services/tmdbService';
import { MovieModalContext } from '../contexts/MovieModalContext';
import Spinner from './Spinner';

interface MovieCardProps {
  movie: Movie;
}

const MovieCard: React.FC<MovieCardProps> = ({ movie }) => {
  const [providers, setProviders] = useState<WatchProvider[]>([]);
  const [loadingProviders, setLoadingProviders] = useState(true);
  const imageUrl = movie.poster_path
    ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}`
    : `https://picsum.photos/500/750?random=${movie.id}`;
    
  const authContext = useContext(AuthContext);
  const movieListsContext = useContext(MovieListsContext);
  const genreContext = useContext(GenreContext);
  const movieModalContext = useContext(MovieModalContext);

  useEffect(() => {
    const fetchProviders = async () => {
      setLoadingProviders(true);
      try {
        const details = await getMovieDetails(String(movie.id));
        const watchProviders = details['watch/providers']?.results;
        
        const providersByRegion = watchProviders?.IN || watchProviders?.US;
        
        if (providersByRegion) {
          const allProviderList = [
            ...(providersByRegion.flatrate || []),
            ...(providersByRegion.rent || []),
            ...(providersByRegion.buy || [])
          ];
          
          const uniqueProviders = allProviderList.reduce((acc, current) => {
            if (!acc.find(item => item.provider_id === current.provider_id)) {
              acc.push(current);
            }
            return acc;
          }, [] as WatchProvider[]);

          if (uniqueProviders.length > 0) {
            setProviders(uniqueProviders.slice(0, 3));
          }
        }
      } catch (error) {
        console.error(`Failed to fetch providers for movie ${movie.id}:`, error);
      } finally {
        setLoadingProviders(false);
      }
    };

    fetchProviders();
  }, [movie.id]);

  if (!movieListsContext || !genreContext || !movieModalContext) {
    return null; 
  }

  const { isLiked, isOnWatchlist, toggleLike, toggleWatchlist } = movieListsContext;
  const { getGenreNames } = genreContext;
  const { openModal } = movieModalContext;

  const handleLikeClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleLike(movie);
  };

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleWatchlist(movie);
  };
  
  const handleCardClick = () => {
    openModal(movie.id);
  };

  const movieGenres = getGenreNames(movie.genre_ids || []).slice(0, 2);

  return (
    <div className="bg-white dark:bg-slate-800 rounded-lg overflow-hidden shadow-lg transform hover:scale-105 transition-transform duration-300 group relative ring-1 ring-slate-200 dark:ring-transparent hover:ring-blue-500/50">
       {authContext?.user && (
        <div className="absolute top-2 right-2 z-20 flex flex-col space-y-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <button onClick={handleLikeClick} title={isLiked(movie.id) ? 'Unlike' : 'Like'} className="bg-white/60 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full text-slate-800 dark:text-white hover:bg-white/80 dark:hover:bg-black/80 transition-colors duration-200">
             <svg className={`w-5 h-5 transition-colors ${isLiked(movie.id) ? 'text-red-500' : 'text-slate-500 dark:text-slate-400'}`} fill={isLiked(movie.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
          </button>
          <button onClick={handleWatchlistClick} title={isOnWatchlist(movie.id) ? 'Remove from Watchlist' : 'Add to Watchlist'} className="bg-white/60 dark:bg-black/60 backdrop-blur-sm p-2 rounded-full text-slate-800 dark:text-white hover:bg-white/80 dark:hover:bg-black/80 transition-colors duration-200">
            <svg className={`w-5 h-5 transition-colors ${isOnWatchlist(movie.id) ? 'text-blue-500' : 'text-slate-500 dark:text-slate-400'}`} fill={isOnWatchlist(movie.id) ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
          </button>
        </div>
      )}
      <div onClick={handleCardClick} className="cursor-pointer">
        <div className="relative group/poster">
          <img src={imageUrl} alt={movie.title} className="w-full h-auto object-cover aspect-[2/3]" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
          {movie.overview && (
            <div className="absolute inset-0 p-4 flex items-center justify-center bg-black/60 backdrop-blur-sm opacity-0 group-hover/poster:opacity-100 transition-opacity duration-300">
                <p className="text-white text-xs sm:text-sm text-center line-clamp-[12]">{movie.overview}</p>
            </div>
          )}
        </div>
        <div className="p-3 sm:p-4">
          <h3 className="font-bold text-base sm:text-lg truncate text-slate-900 dark:text-slate-100" title={movie.title || movie.name}>{movie.title || movie.name}</h3>
           {movieGenres.length > 0 && (
            <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5 sm:mt-1">
              {movieGenres.join(', ')}
            </p>
          )}
          <div className="flex justify-between items-center mt-1 sm:mt-2 text-sm text-slate-500 dark:text-slate-400">
            <span>{movie.release_date?.substring(0, 4)}</span>
            <div className="flex items-center gap-2">
                <div className="flex items-center space-x-1 h-5">
                {loadingProviders ? <Spinner size="sm" /> : providers.map(provider => (
                    <img
                    key={provider.provider_id}
                    src={`${TMDB_IMAGE_BASE_URL}${provider.logo_path}`}
                    alt={provider.provider_name}
                    title={provider.provider_name}
                    className="w-5 h-5 rounded"
                    />
                ))}
                </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;