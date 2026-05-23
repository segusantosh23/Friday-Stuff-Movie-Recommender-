import React, { useState, useEffect, useContext } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { getMovieDetails, getSimilarMovies } from '../services/tmdbService';
import { MovieDetails, Movie } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import { MovieListsContext } from '../contexts/MovieListsContext';
import { AuthContext } from '../contexts/AuthContext';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import BackButton from '../components/BackButton';

const MovieDetail: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();
  const [movie, setMovie] = useState<MovieDetails | null>(null);
  const [similarMovies, setSimilarMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCastModalOpen, setIsCastModalOpen] = useState(false);
  const [shareFeedback, setShareFeedback] = useState<string>('');
  const [isPlayingTrailer, setIsPlayingTrailer] = useState(false);
  
  const movieListsContext = useContext(MovieListsContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    const fetchDetailsAndSimilar = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);
        setIsPlayingTrailer(false); // Reset trailer state on new movie load
        
        // Fetch main movie details and similar movies concurrently
        const [details, similarResponse] = await Promise.all([
            getMovieDetails(id),
            getSimilarMovies(id)
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
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  if (!movie) return <div className="text-center text-gray-400 text-xl mt-10">Movie not found.</div>;

  const trailer = movie.videos.results.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const backdropUrl = `${TMDB_IMAGE_BASE_URL}${movie.backdrop_path}`;
  const posterUrl = movie.poster_path ? `${TMDB_IMAGE_BASE_URL}${movie.poster_path}` : `https://picsum.photos/500/750?random=${movie.id}`;

  const isLiked = movieListsContext?.isLiked(movie.id) ?? false;
  const isOnWatchlist = movieListsContext?.isOnWatchlist(movie.id) ?? false;

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
        setShareFeedback('Link copied to clipboard!');
        setTimeout(() => setShareFeedback(''), 3000);
      });
    }
  };

  const handleToggleLike = () => movieListsContext?.toggleLike(movie);
  const handleToggleWatchlist = () => movieListsContext?.toggleWatchlist(movie);

  const watchProviders = movie['watch/providers']?.results;
  const providers = watchProviders?.IN || watchProviders?.US; // Prioritize India, fallback to US
  
  const cast = movie.credits?.cast || [];
  const crew = movie.credits?.crew || [];

  const renderProviders = (title: string, providerList?: { logo_path: string; provider_name: string }[]) => {
    if (!providerList || providerList.length === 0) return null;
    return (
      <div>
        <h4 className="text-lg font-semibold mb-2">{title}</h4>
        <div className="flex flex-wrap gap-4">
          {providerList.map(p => (
            <div key={p.provider_name} className="flex flex-col items-center" title={p.provider_name}>
              <img src={`${TMDB_IMAGE_BASE_URL}${p.logo_path}`} alt={p.provider_name} className="w-12 h-12 rounded-lg" />
            </div>
          ))}
        </div>
      </div>
    );
  };


  return (
    <div className="page-fade-in">
      <BackButton />
      <div className="relative h-[50vh] md:h-[70vh] w-full bg-cover bg-center -mt-8 -mx-4 bg-black">
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
              className="absolute top-4 right-4 bg-black/50 text-white p-2 rounded-full hover:bg-black/80 transition-colors z-10"
              aria-label="Close trailer"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
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
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/70 to-transparent"></div>
            {trailer && (
              <div className="absolute inset-0 flex items-center justify-center">
                <button 
                  onClick={() => setIsPlayingTrailer(true)} 
                  className="flex items-center space-x-3 bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold py-4 px-8 rounded-full text-lg transition-transform transform hover:scale-105 shadow-lg animate-pulse-glow"
                  aria-label="Play Trailer"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" viewBox="0 0 20 20" fill="currentColor">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
                  </svg>
                  <span>Play Trailer</span>
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <div className="container mx-auto px-4 -mt-32 md:-mt-48 relative z-10">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/3 flex-shrink-0">
            <img src={posterUrl} alt={movie.title} className="rounded-lg shadow-2xl w-full" />
          </div>
          <div className="md:w-2/3 mt-6 md:mt-0 text-white">
            <h1 className="text-4xl md:text-5xl font-black">{movie.title}</h1>
            <div className="flex items-center space-x-4 my-4 text-gray-300">
              <span>{movie.release_date.substring(0, 4)}</span>
              {movie.runtime && (
                <>
                  <span>&middot;</span>
                  <span>{movie.runtime} min</span>
                </>
              )}
            </div>
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map(genre => <span key={genre.id} className="bg-gray-700 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full">{genre.name}</span>)}
            </div>
            <p className="text-lg mb-6 leading-relaxed">{movie.overview}</p>
            
            <div className="flex flex-wrap items-center gap-4 mb-8">
                <button onClick={() => setIsCastModalOpen(true)} className="px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-700 hover:bg-gray-600 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M15 21v-1a6 6 0 00-1.78-4.125" />
                    </svg>
                    <span>View Cast & Crew</span>
                </button>
                <button onClick={handleShare} className="px-6 py-3 rounded-lg font-semibold transition-colors bg-gray-700 hover:bg-gray-600 flex items-center space-x-2">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M8.684 13.342C8.886 12.938 9 12.482 9 12s-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                    <span>Share</span>
                </button>
                {authContext?.user && movieListsContext && (
                <>
                    <button onClick={handleToggleLike} className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${isLiked ? 'bg-red-600 hover:bg-red-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <svg className="w-6 h-6" fill={isLiked ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 016.364 0L12 7.636l1.318-1.318a4.5 4.5 0 016.364 6.364L12 20.364l-7.682-7.682a4.5 4.5 0 010-6.364z"></path></svg>
                        <span>{isLiked ? 'Liked' : 'Like'}</span>
                    </button>
                    <button onClick={handleToggleWatchlist} className={`px-6 py-3 rounded-lg font-semibold transition-colors flex items-center space-x-2 ${isOnWatchlist ? 'bg-blue-600 hover:bg-blue-700' : 'bg-gray-700 hover:bg-gray-600'}`}>
                        <svg className="w-6 h-6" fill={isOnWatchlist ? 'currentColor' : 'none'} stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                        <span>{isOnWatchlist ? 'On Watchlist' : 'Add to Watchlist'}</span>
                    </button>
                </>
                )}
                {shareFeedback && <span className="text-green-400 text-sm font-semibold">{shareFeedback}</span>}
            </div>


            {providers && (
              <div className="bg-gray-800/50 p-4 rounded-lg">
                <h3 className="text-2xl font-bold mb-4">Where to Watch</h3>
                <div className="space-y-4">
                  {renderProviders('Streaming', providers.flatrate)}
                  {renderProviders('Rent', providers.rent)}
                  {renderProviders('Buy', providers.buy)}
                   {(!providers.flatrate && !providers.rent && !providers.buy) && <p className="text-gray-400">No watch information available for your region.</p>}
                </div>
                 <a href={providers.link} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-500 mt-4 block">
                    Watch information provided by JustWatch
                 </a>
              </div>
            )}
          </div>
        </div>
        
        {similarMovies.length > 0 && (
          <div className="my-12">
            <h2 className="text-3xl font-bold mb-6">Similar Movies</h2>
             <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {similarMovies.slice(0, 5).map(m => (
                    <MovieCard key={m.id} movie={m} />
                ))}
            </div>
          </div>
        )}
      </div>
      
      {isCastModalOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex justify-center items-center z-50 p-4"
          onClick={() => setIsCastModalOpen(false)}
        >
          <div 
            className="bg-gray-900 rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto relative border border-gray-700"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 bg-gray-900/80 backdrop-blur-sm p-6 z-10 flex justify-between items-center border-b border-gray-700">
              <h2 className="text-3xl font-bold">Cast & Crew</h2>
              <button 
                onClick={() => setIsCastModalOpen(false)} 
                className="text-gray-400 hover:text-white transition-colors"
                aria-label="Close cast and crew modal"
              >
                <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="p-6 space-y-8">
              <div>
                <h3 className="text-2xl font-semibold mb-4 border-l-4 border-blue-500 pl-3">Cast</h3>
                {cast.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-6">
                    {cast.slice(0, 16).map(member => (
                      <ReactRouterDOM.Link to={`/person/${member.id}`} key={member.id} className="text-center group" onClick={() => setIsCastModalOpen(false)}>
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
                ) : (
                  <p className="text-gray-400">No cast information available.</p>
                )}
              </div>

              <div>
                <h3 className="text-2xl font-semibold mb-4 border-l-4 border-cyan-500 pl-3">Key Crew</h3>
                {crew.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 text-sm">
                    {crew
                      .filter(member => ['Director', 'Screenplay', 'Writer', 'Producer', 'Director of Photography', 'Original Music Composer'].includes(member.job))
                      .filter((value, index, self) => self.findIndex(v => v.id === value.id && v.job === value.job) === index) // remove duplicates
                      .slice(0, 10)
                      .map((member, index) => (
                      <ReactRouterDOM.Link to={`/person/${member.id}`} key={`${member.id}-${index}`} className="flex justify-between border-b border-gray-800 py-2 hover:bg-gray-800 px-2 rounded">
                        <span className="font-semibold text-gray-300">{member.job}</span>
                        <span className="text-gray-400">{member.name}</span>
                      </ReactRouterDOM.Link>
                    ))}
                  </div>
                ) : (
                  <p className="text-gray-400">No crew information available.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MovieDetail;
