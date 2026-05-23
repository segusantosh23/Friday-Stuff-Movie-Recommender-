

export interface Genre {
  id: number;
  name: string;
}

export interface Movie {
  id: number;
  title: string;
  name?: string; // For TV shows which use 'name' instead of 'title'
  poster_path: string | null;
  backdrop_path: string | null;
  overview: string;
  release_date: string;
  vote_average: number;
  genres?: Genre[];
  genre_ids?: number[];
  runtime?: number;
  popularity?: number;
}

// Types for Watch Providers
export interface WatchProvider {
  logo_path: string;
  provider_id: number;
  provider_name: string;
  display_priority: number;
}

export interface WatchProviderCountryDetails {
  link: string;
  flatrate?: WatchProvider[];
  rent?: WatchProvider[];
  buy?: WatchProvider[];
}

export interface WatchProviders {
  [countryCode: string]: WatchProviderCountryDetails;
}

export interface WatchProviderResults {
  results: WatchProviders;
}

// Types for Cast and Crew
export interface CastMember {
  id: number;
  name: string;
  character: string;
  profile_path: string | null;
}

export interface CrewMember {
  id: number;
  name: string;
  job: string;
  department: string;
}

export interface Credits {
  cast: CastMember[];
  crew: CrewMember[];
}


export interface MovieDetails extends Movie {
  videos: {
    results: {
      key: string;
      site: string;
      type: string;
    }[];
  };
  'watch/providers'?: WatchProviderResults;
  credits?: Credits;
}

export interface PaginatedResponse<T> {
  page: number;
  results: T[];
  total_pages: number;
  total_results: number;
}

export interface User {
  uid: string;
  username: string;
  email: string | null;
  profilePicture?: string;
  termsAccepted?: boolean;
}

export interface AIRecommendation {
  title: string;
  year: number;
  reason: string;
}

export interface Notification {
  id: number;
  message: string;
  type: 'success' | 'error' | 'info';
}

export interface PersonDetails {
  id: number;
  name: string;
  biography: string;
  birthday: string | null;
  deathday: string | null;
  place_of_birth: string | null;
  profile_path: string | null;
  also_known_as: string[];
}

export interface PersonMovieCredits {
  cast: Movie[];
  crew: Movie[];
}