
import React, { useState, useEffect, useContext } from 'react';
import { getDiscoverMovies, getNowPlayingMovies } from '../services/tmdbService';
import { Movie } from '../types';
import MovieCard from '../components/MovieCard';
import Spinner from '../components/Spinner';
import Carousel from '../components/Carousel';
import { GenreContext } from '../contexts/GenreContext';
import SortDropdown from '../components/SortDropdown';

// Helper to shuffle the array for a mixed experience
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

const Home: React.FC = () => {
  const [movies, setMovies] = useState<Movie[]>([]);
  const [nowPlayingMovies, setNowPlayingMovies] = useState<Movie[]>([]);
  const [filteredNowPlayingMovies, setFilteredNowPlayingMovies] = useState<Movie[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedGenre, setSelectedGenre] = useState<string>('');
  const [selectedYear, setSelectedYear] = useState<string>('');
  const [selectedCertification, setSelectedCertification] = useState<string>('');
  const [sortOption, setSortOption] = useState<string>('popularity.desc');

  const genreContext = useContext(GenreContext);
  const genres = genreContext?.genres || [];

  const years: number[] = [];
  const currentYear = new Date().getFullYear();
  for (let year = currentYear; year >= 1950; year--) {
    years.push(year);
  }

  const ageRatings = [
    { label: 'Child (7+)', value: 'PG' },
    { label: 'Teen (13+)', value: 'PG-13' },
    { label: 'Mature (16+)', value: 'R' },
    { label: 'Adult (18+)', value: 'NC-17' },
  ];

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const baseParams: Record<string, string> = { sort_by: sortOption };
        if (selectedGenre) baseParams.with_genres = selectedGenre;
        if (selectedYear) baseParams.primary_release_year = selectedYear;

        // When sorting by newest, ensure we don't include future movies.
        if (sortOption === 'release_date.desc') {
          const today = new Date().toISOString().split('T')[0];
          baseParams['primary_release_date.lte'] = today;
        }

        // Create a separate params object for the Indian movie query to get films originating from India.
        const indianParams = { ...baseParams, with_origin_country: 'IN' };
        
        // Create a separate params object for the global query.
        const globalParams = { ...baseParams };
        
        // Apply US-specific certification filter using "less than or equal to".
        if (selectedCertification) {
          globalParams.certification_country = 'US';
          globalParams['certification.lte'] = selectedCertification;
        }

        const regionParams = { region: 'IN' };

        const [globalResponse, indianResponse, indianPage2Response, nowPlayingResponse] = await Promise.all([
          getDiscoverMovies(globalParams),
          getDiscoverMovies(indianParams),
          getDiscoverMovies({ ...indianParams, page: '2' }),
          getNowPlayingMovies(regionParams)
        ]);
        
        setNowPlayingMovies(nowPlayingResponse.results);
        
        // Put Indian movies first and global movies after, then deduplicate
        const combinedMovies = [...indianResponse.results, ...indianPage2Response.results, ...globalResponse.results];

        // Deduplicate movies based on their ID
        const uniqueMoviesMap = new Map<number, Movie>();
        combinedMovies.forEach(movie => {
          uniqueMoviesMap.set(movie.id, movie);
        });
        const uniqueMovies = Array.from(uniqueMoviesMap.values());
        
        setMovies(uniqueMovies.filter(movie => movie.poster_path));

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
  }, [selectedGenre, selectedYear, selectedCertification, sortOption]);

  // Effect to filter "Now Playing" movies on the client-side
  useEffect(() => {
    let filtered = nowPlayingMovies;

    if (selectedGenre) {
      filtered = filtered.filter(movie => movie.genre_ids?.includes(parseInt(selectedGenre, 10)));
    }

    if (selectedYear) {
      filtered = filtered.filter(movie => movie.release_date?.startsWith(selectedYear));
    }

    setFilteredNowPlayingMovies(filtered);
  }, [nowPlayingMovies, selectedGenre, selectedYear]);

  const handleResetFilters = () => {
    setSelectedGenre('');
    setSelectedYear('');
    setSelectedCertification('');
    setSortOption('popularity.desc');
  };

  const filterSelectClasses = "bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white text-sm rounded-xl focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 transition-all";

  return (
    <div className="space-y-12 pb-20">
      {loading ? (
        <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
          <Spinner size="lg" />
          <p className="text-slate-500 font-bold animate-pulse uppercase tracking-[0.2em] text-[10px]">Filtering Indian Cinema...</p>
        </div>
      ) : error ? <div className="text-center text-red-500 text-xl mt-10 font-bold uppercase">{error}</div> : (
        <>
          <section className="bg-white dark:bg-slate-900/50 p-6 rounded-[2rem] border border-slate-100 dark:border-slate-800 shadow-sm transition-all hover:shadow-md">
            <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-6 items-end">
                <div className="space-y-2">
                  <label htmlFor="genre-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Genre</label>
                  <select id="genre-select" value={selectedGenre} onChange={(e) => setSelectedGenre(e.target.value)} className={filterSelectClasses}>
                      <option value="">All Regions</option>
                      {genres.map(genre => (
                        <option key={genre.id} value={String(genre.id)}>{genre.name}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="year-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Release Year</label>
                  <select id="year-select" value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)} className={filterSelectClasses}>
                      <option value="">Any Era</option>
                      {years.map(year => (
                        <option key={year} value={String(year)}>{year}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <label htmlFor="certification-select" className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Content Rating</label>
                  <select id="certification-select" value={selectedCertification} onChange={(e) => setSelectedCertification(e.target.value)} className={filterSelectClasses}>
                      <option value="">Universal</option>
                      {ageRatings.map(rating => (
                        <option key={rating.value} value={rating.value}>{rating.label}</option>
                      ))}
                  </select>
                </div>
                <div className="space-y-2">
                   <label className="block text-[10px] font-black uppercase tracking-widest text-slate-500 ml-1">Sort By</label>
                    <SortDropdown sortOption={sortOption} setSortOption={setSortOption} />
                </div>
                <button onClick={handleResetFilters} className="bg-slate-950 dark:bg-white text-white dark:text-black font-black uppercase tracking-[0.2em] text-[10px] py-4 px-4 rounded-xl w-full transition-all active:scale-[0.98] shadow-lg shadow-black/10 dark:shadow-white/5">
                    Reset Catalog
                </button>
            </div>
          </section>

          <Carousel title="Trending" movies={filteredNowPlayingMovies} />
          
          <section>
            <div className="flex items-center space-x-3 mb-8">
               <div className="w-1.5 h-10 bg-blue-500 rounded-full"></div>
               <h2 className="text-3xl font-black text-slate-950 dark:text-white uppercase tracking-tight">Recommendations</h2>
            </div>
            
            {movies.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6 md:gap-8">
                {movies.map(movie => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            ) : (
              <div className="text-center text-slate-500 dark:text-slate-400 py-20 bg-slate-50 dark:bg-slate-900/50 rounded-[2.5rem] border-2 border-dashed border-slate-200 dark:border-slate-800">
                <h3 className="text-xl font-black mb-2 text-slate-950 dark:text-white uppercase tracking-widest">No Movies Synced</h3>
                <p className="text-sm font-medium">Try adjusting your bucket filters.</p>
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
};

export default Home;
