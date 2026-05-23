import { TMDB_API_KEY, TMDB_BASE_URL } from '../constants';
import { Movie, MovieDetails, PaginatedResponse, Genre, PersonDetails, PersonMovieCredits } from '../types';

interface GenreResponse {
    genres: Genre[];
}

const fetchData = async <T,>(endpoint: string, params: Record<string, string> = {}): Promise<T> => {
  const queryParams = new URLSearchParams({
    api_key: TMDB_API_KEY,
    language: 'en-US',
    ...params,
  });

  const url = `${TMDB_BASE_URL}/${endpoint}?${queryParams.toString()}`;
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error('Failed to fetch data from TMDB');
  }
  return response.json();
};

// Fetches popular movies. Can be filtered by passing params like { region: 'IN' }.
export const getPopularMovies = (params: Record<string, string> = {}): Promise<PaginatedResponse<Movie>> => {
  return fetchData('movie/popular', params);
};

// Fetches trending movies globally from the correct endpoint.
export const getTrendingMovies = (timeWindow: 'day' | 'week' = 'day'): Promise<PaginatedResponse<Movie>> => {
  return fetchData(`trending/movie/${timeWindow}`);
};

// Fetches movies currently playing in theaters.
export const getNowPlayingMovies = (params: Record<string, string> = {}): Promise<PaginatedResponse<Movie>> => {
  return fetchData('movie/now_playing', params);
};

// Fetches upcoming movies.
export const getUpcomingMovies = (params: Record<string, string> = {}): Promise<PaginatedResponse<Movie>> => {
  return fetchData('movie/upcoming', params);
};

export const getGenreList = (): Promise<GenreResponse> => {
    return fetchData('genre/movie/list');
};

export const getMovieDetails = (movieId: string): Promise<MovieDetails> => {
  return fetchData(`movie/${movieId}`, { append_to_response: 'videos,watch/providers,credits' });
};

// This function is generic and can be used for complex filtering.
export const getDiscoverMovies = (params: Record<string, string> = {}): Promise<PaginatedResponse<Movie>> => {
  return fetchData('discover/movie', params);
};

// Searches for movies globally.
export const searchMovies = (query: string, page: number = 1): Promise<PaginatedResponse<Movie>> => {
  return fetchData('search/movie', { query, page: String(page) });
};

// Fetches globally similar movies.
export const getSimilarMovies = (movieId: string): Promise<PaginatedResponse<Movie>> => {
  return fetchData(`movie/${movieId}/similar`);
};

export const getPersonDetails = (personId: string): Promise<PersonDetails> => {
  return fetchData(`person/${personId}`);
};

export const getPersonMovieCredits = (personId: string): Promise<PersonMovieCredits> => {
  return fetchData(`person/${personId}/movie_credits`);
};