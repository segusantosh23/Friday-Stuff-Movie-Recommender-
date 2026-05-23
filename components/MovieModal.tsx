import React, { useState, useEffect, useContext } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { getMovieDetails, getSimilarMovies } from '../services/tmdbService';
import { MovieDetails, Movie, CastMember, CrewMember } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { MovieListsContext } from '../contexts/MovieListsContext';
import { AuthContext } from '../contexts/AuthContext';
import { MovieModalContext } from '../contexts/MovieModalContext';
import Spinner from './Spinner';
import MovieCard from './MovieCard';

const MovieModal: React.FC = () => {
  const movieModalContext = useContext(MovieModalContext);
  if (!movieModalContext) return null;
  const { isModalOpen, selectedMovieId, closeModal } = movieModalContext;
  
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [shareFeedback, setShareFeedback] = useState<string>('');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);

  const movieListsContext = useContext(MovieListsContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (!selectedMovieId) return;

    const fetchDetailsAndSimilar = async () => {
      try {
        setLoading(true);
        setError(null);
        setMovie(null); // Clear previous movie data
        setIsPlayingTrailer(false); // Reset trailer state
        
        const [details, similarResponse] = await Promise.all([
            getMovieDetails(String(selectedMovieId)),
            getSimilarMovies(String(selectedMovieId))
        ]);
        
        setMovie(details);
        setSimilarMovies(similarResponse.results);
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

    fetchDetailsAndSimilar();
  }, [selectedMovieId]);

  useEffect(() => {
    if (isModalOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isModalOpen]);

  if (!isModalOpen && !movie) return null;

  const handleClose = () => {
    closeModal();
  };

  const renderContent = () => {
    if (loading) return <div className="h-full flex justify-center items-center min-h-[50vh]"><Spinner /></div>;
    if (error) return <div className="text-center text-red-500 text-xl mt-10 p-8">{error}</div>;
    if (!movie) return <div className="text-center text-gray-400 text-xl mt-10 p-8">Movie not found.</div>;

    const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
    const backdropUrl = movie.backdrop_path ? `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}` : '';
    const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://picsum.photos/500/750?random=${movie.id}`;

    const isLiked = movieListsContext?.isLiked(movie.id) ?? false;
    const isOnWatchlist = movieListsContext?.isOnWatchlist(movie.id) ?? false;
    const handleToggleLike = () => movieListsContext?.toggleLike(movie);
    const handleToggleWatchlist = () => movieListsContext?.toggleWatchlist(movie);

    const handleShare = async () => {
      if (!movie) return;
      const movieUrl = `https://www.themoviedb.org/movie/${movie.id}`;
      const shareData = {
        title: movie.title,
        text: `Check out this movie: ${movie.title}`,
        url: movieUrl,
      };

      if (navigator.share) {
        try {
          await navigator.share(shareData);
        } catch (error) {
          console.log('Share was cancelled or failed', error);
        }
      } else {
        navigator.clipboard.writeText(movieUrl).then(() => {
          setShareFeedback('Link copied!');
          setTimeout(() => setShareFeedback(''), 2000);
        });
      }
    };


    const cast = movie.credits?.cast || [];
    const crew = movie.credits?.crew || [];

    return (
        <>
            <div className="relative h-48 md:h-64 w-full bg-cover bg-center bg-black">
              {isPlayingTrailer && trailer ? (
                <div className="w-full h-full relative">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                    title="YouTube video player"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full"
                  ></iframe>
                  <button 
                    onClick={() => setIsPlayingTrailer(false)}
                    className="absolute top-2 right-2 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
                    aria-label="Close trailer"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div 
                    className="absolute inset-0 bg-cover bg-center" 
                    style={{ backgroundImage: `url(${backdropUrl})` }}
                  ></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900 to-transparent"></div>
                  {trailer && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <button 
                        onClick={() => setIsPlayingTrailer(true)} 
                        className="flex items-center space-x-2 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-3 px-6 rounded-full text-base transition-transform transform hover:scale-105 shadow-lg animate-pulse-glow"
                        aria-label="Play Trailer"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                        </svg>
                        <span>Play Trailer</span>
                      </button>
                    </div>
                  )}
                </>
              )}
            </div>

            <div className="p-4 sm:p-6 space-y-6 sm:space-y-8">
                <div className="flex flex-col md:flex-row gap-6">
                    <div className="md:w-1/4 flex-shrink-0 -mt-24">
                        <img src={posterUrl} alt={movie.title} className="rounded-lg shadow-2xl w-full" />
                    </div>
                    <div className="md:w-3/4 text-white">
                        <h2 className="text-3xl md:text-4xl font-black text-white drop-shadow-lg mb-2">{movie.title}</h2>
                        <div className="flex items-center flex-wrap space-x-4 mb-3 text-gray-300">
                            <span>{movie.release_date.substring(0, 4)}</span>
                            {movie.runtime && ( <><span>&middot;</span><span>{movie.runtime} min</span></> )}
                        </div>
                        <div className="flex flex-wrap gap-2 mb-4">
                            {movie.genres?.map(genre => <span key={genre.id} className="bg-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{genre.name}</span>)}
                        </div>
                        <p className="text-sm md:text-base mb-4 leading-relaxed">{movie.overview}</p>
                        
                        <div className="flex flex-col md:flex-row md:items-start gap-4">
                            <div className="flex flex-wrap items-center gap-4">
                                <button onClick={handleShare} className="px-4 py-2 rounded-lg text-sm font-semibold transition-colors bg-gray-700 hover:bg-gray-600 flex items-center space-x-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                                    </svg>
                                    <span>Share</span>
                                </button>
                                {authContext?.user && movieListsContext && (
                                <>
                                    <button onClick={handleToggleLike} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors flex items-center space-x-2 ${isLiked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                                        <svg className="w-5 h-5" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                                    </button>
                                    <button onClick={handleToggleWatchlist} className={`px-4 py-2 rounded-lg text-sm font-black transition-all transform hover:scale-105 flex items-center space-x-2 shadow-lg ${isOnWatchlist ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white' : 'bg-gray-700 hover:bg-gray-600 text-white'}`}>
                                        <svg className="w-5 h-5" fill={isOnWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                                        <span className="uppercase tracking-widest">{isOnWatchlist ? 'On Watchlist' : 'Add to Watchlist'}</span>
                                    </button>
                                </>
                                )}
                                {shareFeedback && <span className="text-green-400 text-sm font-semibold self-center">{shareFeedback}</span>}
                            </div>
                        </div>
                    </div>
                </div>

                <div>
                    <h3 className="text-2xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">Cast</h3>
                    {cast.length > 0 ? (
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-4">
                        {cast.slice(0, 15).map(member => (
                          <ReactRouterDOM.Link to={`/person/${member.id}`} key={member.id} className="text-center group" onClick={handleClose}>
                            <div className="overflow-hidden rounded-lg shadow-md mb-2">
                                <img 
                                    src={member.profile_path ? `${TMDB_IMAGE_BASE_URL}${member.profile_path}` : `https://ui-avatars.com/api/?name=${member.name.replace(/\s/g, '+')}&background=374151&color=fff&size=256`} 
                                    alt={member.name} 
                                    className="w-full h-auto aspect-square object-cover transform group-hover:scale-110 transition-transform duration-300"
                                />
                            </div>
                            <p className="font-bold text-sm group-hover:text-blue-400 transition-colors">{member.name}</p>
                            <p className="text-xs text-gray-400">{member.character}</p>
                          </ReactRouterDOM.Link>
                        ))}
                    </div>
                    ) : <p className="text-gray-400">No cast information available.</p> }
                </div>

                <div>
                    <h3 className="text-2xl font-semibold mb-4 border-l-4 border-cyan-500 pl-3">Key Crew</h3>
                    {crew.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                        {crew.filter(m => ['Director', 'Screenplay', 'Writer', 'Producer'].includes(m.job)).filter((v, i, s) => s.findIndex(t => (t.id === v.id && t.job === v.job)) === i).slice(0, 8).map((m, i) => (
                        <ReactRouterDOM.Link to={`/person/${m.id}`} key={`${m.id}-${i}`} className="flex justify-between border-b border-gray-800 py-2 hover:bg-gray-800 px-2 rounded">
                            <span className="font-semibold text-gray-300">{m.job}</span>
                            <span className="text-gray-400">{m.name}</span>
                        </ReactRouterDOM.Link>
                        ))}
                    </div>
                    ) : <p className="text-gray-400">No crew information available.</p> }
                </div>
                
                {similarMovies.length > 0 && (
                  <div>
                    <h3 className="text-2xl font-semibold mb-4 border-l-4 border-green-500 pl-3">You Might Also Like</h3>
                    <div className="flex overflow-x-auto space-x-4 pb-4 -mx-4 sm:-mx-6 px-4 sm:px-6">
                      {similarMovies.map(m => (
                        <div key={m.id} className="flex-shrink-0 w-40 sm:w-48">
                          <MovieCard movie={m} />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
            </div>
        </>
    );
  }

  return (
    <div className={`fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4 transition-opacity duration-300 ${isModalOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`} onClick={handleClose} aria-modal="true" role="dialog">
        <div ref={node => node?.scrollTo(0, 0)} className="bg-gray-900 rounded-lg shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700 transform transition-transform duration-300" onClick={(e) => e.stopPropagation()} style={{ transform: isModalOpen ? 'scale(1)' : 'scale(0.95)' }}>
            <div className="sticky top-0 z-50 h-0">
                <button onClick={handleClose} className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors bg-black/50 rounded-full p-2" aria-label="Close movie details">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                </button>
            </div>
            {renderContent()}
        </div>
    </div>
  );
};

export default MovieModal;
