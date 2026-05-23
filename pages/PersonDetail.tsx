import React, { useState, useEffect } from 'react';
// Fix: Use namespace import for react-router-dom
import * as ReactRouterDOM from 'react-router-dom';
import { getPersonDetails, getPersonMovieCredits } from '../services/tmdbService';
import { PersonDetails, Movie } from '../types';
import { TMDB_IMAGE_BASE_URL } from '../constants';
import Spinner from '../components/Spinner';
import MovieCard from '../components/MovieCard';
import BackButton from '../components/BackButton';

const PersonDetail: React.FC = () => {
  const { id } = ReactRouterDOM.useParams<{ id: string }>();
  const [person, setPerson] = useState<PersonDetails | null>(null);
  const [movies, setMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    const fetchPersonData = async () => {
      if (!id) return;
      try {
        setLoading(true);
        setError(null);

        const [details, credits] = await Promise.all([
          getPersonDetails(id),
          getPersonMovieCredits(id)
        ]);
        
        setPerson(details);
        
        const allMovies = [...credits.cast, ...credits.crew];
        const uniqueMovies = Array.from(new Map(allMovies.map(movie => [movie.id, movie])).values());
        
        uniqueMovies.sort((a, b) => (b.popularity || 0) - (a.popularity || 0));

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

    fetchPersonData();
    window.scrollTo(0, 0);
  }, [id]);

  if (loading) return <Spinner />;
  if (error) return <div className="text-center text-red-500 text-xl mt-10">{error}</div>;
  if (!person) return <div className="text-center text-slate-400 text-xl mt-10">Person not found.</div>;
  
  const profileUrl = person.profile_path ? `${TMDB_IMAGE_BASE_URL}${person.profile_path}` : `https://ui-avatars.com/api/?name=${person.name.replace(/\s/g, '+')}&background=374151&color=fff&size=500`;

  const bio = person.biography;
  const shortBio = bio.split(' ').slice(0, 50).join(' ');
  const canShowMore = bio.split(' ').length > 50;

  return (
    <div className="page-fade-in">
      <BackButton />
      <div className="space-y-12">
        <div className="md:flex md:space-x-8">
          <div className="md:w-1/3 flex-shrink-0">
            <img src={profileUrl} alt={person.name} className="rounded-lg shadow-2xl w-full" />
          </div>
          <div className="md:w-2/3 mt-6 md:mt-0">
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 dark:text-white">{person.name}</h1>
            
            {(person.birthday || person.place_of_birth) && (
              <div className="text-slate-500 dark:text-slate-400 mt-4 text-sm">
                  {person.birthday && <p>Born: {new Date(person.birthday).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>}
                  {person.place_of_birth && <p>Place of Birth: {person.place_of_birth}</p>}
              </div>
            )}

            <div className="mt-6">
              <h3 className="text-2xl font-semibold mb-2 text-slate-900 dark:text-white">Biography</h3>
              {bio ? (
                <div className="text-slate-700 dark:text-slate-300 leading-relaxed">
                  <p>{showFullBio ? bio : shortBio}{!showFullBio && canShowMore ? '...' : ''}</p>
                  {canShowMore && (
                    <button onClick={() => setShowFullBio(!showFullBio)} className="text-blue-500 hover:text-blue-400 dark:text-blue-400 dark:hover:text-blue-300 font-semibold mt-2">
                      {showFullBio ? 'Read Less' : 'Read More'}
                    </button>
                  )}
                </div>
              ) : (
                  <p className="text-slate-500 dark:text-slate-400">No biography available for {person.name}.</p>
              )}
            </div>
          </div>
        </div>

        <section>
          <h2 className="text-3xl font-bold mb-6 border-l-4 border-blue-500 pl-4 text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-400">Filmography</h2>
          {movies.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4 md:gap-6">
              {movies.map(movie => (
                movie.poster_path && <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 text-lg mt-10">No movies found for this person.</p>
          )}
        </section>
      </div>
    </div>
  );
};

export default PersonDetail;
